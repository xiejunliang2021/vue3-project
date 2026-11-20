/**
 * usePixiStage.js
 * ─────────────────────────────────────────────────────
 * 【核心画布层】PixiJS v8 WebGL 拓扑图渲染 Hook
 *
 * 职责：
 *  - 创建并挂载 PixiJS v8 Application (WebGL/WebGPU 硬件加速)
 *  - 根据分镜数据 (nodes / links) 构建节点 Container 与连线 Graphics
 *  - 暴露节点/连线对象 Map 供 useDirectorTimeline 操控属性做动画
 *  - 支持窗口 resize 自适应 & 销毁清理
 *
 * 注意：PixiJS v8 API 变更说明
 *  - app.init() 是异步的，必须 await
 *  - 挂载使用 app.canvas (非旧版 app.view)
 *  - Graphics 使用链式新 API: .circle().fill().stroke()
 *  - BlendMode 从 'pixi.js' 导入 BlendMode 枚举
 * ─────────────────────────────────────────────────────
 */

import { ref, shallowRef } from 'vue'
import {
  Application,
  Graphics,
  Container,
  Text,
  TextStyle,
  Filter,
  ColorMatrixFilter,
} from 'pixi.js'
import { COLORS } from './useScriptData.js'

export function usePixiStage() {
  /** PixiJS Application 实例 */
  const app = shallowRef(null)

  /**
   * 节点对象 Map: nodeId → { container, gfxCircle, gfxGlow, lblMain, lblSub }
   * 供 useDirectorTimeline 直接操控 alpha / scale / position
   */
  const nodeMap = shallowRef({})

  /**
   * 连线对象 Map: linkId → Graphics
   */
  const linkMap = shallowRef({})

  /** 特效层容器（屏障、粒子爆炸、雷达扫描等） */
  const fxLayer = shallowRef(null)

  /** 主内容缩放容器 (900x640 虚拟空间全景自适应) */
  const contentContainer = shallowRef(null)

  /** 标记初始化完成 */
  const isReady = ref(false)

  // ─── 初始化 PixiJS Application ────────────────────────────
  /**
   * @param {HTMLElement} mountEl  - 挂载目标 DOM 元素
   * @param {number} w             - 初始参考宽度
   * @param {number} h             - 初始参考高度
   */
  async function initStage(mountEl, w = 900, h = 640) {
    if (app.value) destroyStage()

    const pixiApp = new Application()

    const initW = mountEl.offsetWidth || w
    const initH = mountEl.offsetHeight || h

    await pixiApp.init({
      width: initW,
      height: initH,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
      antialias: true,
      backgroundAlpha: 0,          // 完全透明，透出 tsParticles 背景
      powerPreference: 'high-performance',
    })

    // v8 使用 app.canvas，而非旧版 app.view
    pixiApp.canvas.style.position = 'absolute'
    pixiApp.canvas.style.inset = '0'
    pixiApp.canvas.style.width = '100%'
    pixiApp.canvas.style.height = '100%'
    pixiApp.canvas.style.pointerEvents = 'none' // 让点击穿透到 Vue 事件层
    mountEl.appendChild(pixiApp.canvas)

    app.value = pixiApp

    // 建立外层自适应物理容器（由 handleResize 驱动自适应屏幕）
    const resizeContent = new Container()
    resizeContent.label = 'resize-container-root'
    pixiApp.stage.addChild(resizeContent)

    // 建立主内容响应式容器（所有节点、连线、特效都放入其中，用于镜头/群落缩放）
    const mainContent = new Container()
    mainContent.label = 'main-content-root'

    // ⚡ 关键修复：将 pivot（缩放原点）锁定到设计空间中心 (450, 320)
    // 这样 GSAP 对 scale 做缓动时，内容以屏幕中心为轴收缩/放大，不会向角落偏移
    const BASE_W = 900
    const BASE_H = 640
    mainContent.pivot.set(BASE_W / 2, BASE_H / 2)   // pivot = (450, 320)
    mainContent.position.set(BASE_W / 2, BASE_H / 2) // 初始 position 与 pivot 对齐

    resizeContent.addChild(mainContent)
    contentContainer.value = mainContent

    // 建立特效层（最顶层）
    const fxLayerContainer = new Container()
    fxLayerContainer.label = 'fx-layer'
    mainContent.addChild(fxLayerContainer)
    fxLayer.value = fxLayerContainer

    // 首次主动触发一次居中缩放计算
    handleResize(mountEl)

    // 监听 resize
    window.addEventListener('resize', () => handleResize(mountEl))

    isReady.value = true
    console.log('[usePixiStage] PixiJS v8 舞台与解耦容器已初始化 ✅', initW, 'x', initH)
  }

  // ─── 根据分镜数据批量构建节点 & 连线 ─────────────────────
  /**
   * @param {object} scriptData  - 来自 useScriptData 的完整脚本配置
   */
  function buildSceneObjects(scriptData) {
    if (!app.value || !contentContainer.value) return
    const mainContent = contentContainer.value

    // 清除旧对象
    _clearObjects()

    // ── 1. 连线层（底层，先添加）
    const linksContainer = new Container()
    linksContainer.label = 'links-layer'
    mainContent.addChildAt(linksContainer, 0)

    for (const link of scriptData.links) {
      const gfx = new Graphics()
      gfx.alpha = 0
      gfx.label = link.id
      linksContainer.addChild(gfx)
      linkMap.value[link.id] = { gfx, config: link }
    }

    // ── 2. 节点层（中层）
    const nodesContainer = new Container()
    nodesContainer.label = 'nodes-layer'
    mainContent.addChildAt(nodesContainer, 1)

    // 设计基准中心点（基于 900x640 设计空间恒定）
    const cx = 450
    const cy = 320

    // 检测是否为移动端手机视口
    const isMobile = app.value.screen.width < 768
    // 📱 移动端不做纵向拉伸（1.45→1.05），防止节点被推到屏幕底部留出大块空白
    const yStretch = isMobile ? 1.05 : 1.0

    // 📱 移动端节点放大系数：圆圈半径 × 1.6，字体 × 1.55，让文字在手机屏幕清晰可读
    const nodeSizeMul = isMobile ? 1.6 : 1.0
    const fontSizeMul = isMobile ? 1.55 : 1.0

    for (const nodeCfg of scriptData.nodes) {
      const container = new Container()
      
      // 根据相对或绝对坐标计算物理定位，确保相对自适应
      const posX = nodeCfg.relX !== undefined ? cx + nodeCfg.relX : nodeCfg.x
      
      // 移动端动态拉伸纵向相对坐标 relY，将整体场景在手机纵向上彻底"拉开、撑满"
      const posY = nodeCfg.relY !== undefined ? cy + (nodeCfg.relY * yStretch) : nodeCfg.y
      container.position.set(posX, posY)
      
      container.alpha = 0
      container.scale.set(0)
      container.label = nodeCfg.id

      // 移动端动态放大后的半径（辉光圈同步放大）
      const baseRadius = (nodeCfg.radius || 50) * nodeSizeMul

      // ── 外层辉光圆（mix-blend-mode: screen 模拟，用更大半径半透明圆）
      const gfxGlow = new Graphics()
      if (!nodeCfg.isRect) {
        const glowR = baseRadius + 18
        gfxGlow
          .circle(0, 0, glowR)
          .fill({ color: nodeCfg.color, alpha: 0.12 })
        // PixiJS v8 的 BlendMode
        gfxGlow.blendMode = 'add'
      }
      container.addChild(gfxGlow)

      // ── 主体形状
      const gfxMain = new Graphics()

      if (nodeCfg.isRect) {
        // 矩形节点（如大单卡片）移动端同步放大宽高
        const rw = (nodeCfg.rw || 220) * nodeSizeMul
        const rh = (nodeCfg.rh || 70) * nodeSizeMul
        gfxMain
          .roundRect(-rw / 2, -rh / 2, rw, rh, 14)
          .fill({ color: nodeCfg.color, alpha: 0.15 })
          .stroke({ width: 3, color: nodeCfg.color, alpha: 0.9 })
      } else if (nodeCfg.poly) {
        // 六边形节点（如思维模型）
        const r = baseRadius
        const hexPoints = _hexPoints(r)
        gfxMain
          .poly(hexPoints)
          .fill({ color: nodeCfg.color, alpha: 0.15 })
          .stroke({ width: 3, color: nodeCfg.color, alpha: 0.9 })
      } else {
        // 标准圆形节点
        gfxMain
          .circle(0, 0, baseRadius)
          .fill({ color: COLORS.DARK, alpha: 0.85 })
          .stroke({ width: 3, color: nodeCfg.color, alpha: 0.95 })
      }

      container.addChild(gfxMain)

      // ── 主标签文字（移动端字号放大）
      const baseFontMain = (nodeCfg.isRect ? 16 : 14) * fontSizeMul
      const styleMain = new TextStyle({
        fontFamily: '"Courier New", "Microsoft YaHei", monospace',
        fontSize: Math.round(baseFontMain),
        fontWeight: 'bold',
        fill: nodeCfg.color,
        align: 'center',
      })
      const lblMain = new Text({ text: nodeCfg.label, style: styleMain })
      lblMain.anchor.set(0.5, 0.5)
      lblMain.position.set(0, nodeCfg.isRect ? -8 * nodeSizeMul : -7 * nodeSizeMul)
      container.addChild(lblMain)

      // ── 副标签文字（移动端字号放大）
      if (nodeCfg.subLabel) {
        const baseFontSub = 10 * fontSizeMul
        const styleSub = new TextStyle({
          fontFamily: '"Courier New", "Microsoft YaHei", monospace',
          fontSize: Math.round(baseFontSub),
          fill: 0x8899aa,
          align: 'center',
        })
        const lblSub = new Text({ text: nodeCfg.subLabel, style: styleSub })
        lblSub.anchor.set(0.5, 0.5)
        lblSub.position.set(0, nodeCfg.isRect ? 12 * nodeSizeMul : 10 * nodeSizeMul)
        container.addChild(lblSub)
      }

      nodesContainer.addChild(container)
      nodeMap.value[nodeCfg.id] = {
        container,
        gfxGlow,
        gfxMain,
        lblMain,
        config: nodeCfg,
      }
    }

    // 特效层置顶
    mainContent.addChild(fxLayer.value)

    // 绘制连线（初始不可见，由 timeline 控制 alpha）
    _redrawLinks(scriptData)

    console.log('[usePixiStage] 场景对象构建完毕，节点数:', scriptData.nodes.length)
  }

  // ─── 特效：动态屏障墙 ──────────────────────────────────────
  /**
   * @param {number} x  - 屏障 x 坐标（画布）
   * @param {number} y  - 屏障顶部 y
   * @param {number} h  - 屏障高度
   */
  function createBarrier(x = 520, y = 220, h = 200) {
    const gfx = new Graphics()
    gfx
      .roundRect(x - 8, y, 16, h, 8)
      .fill({ color: COLORS.RED, alpha: 0.25 })
      .stroke({ width: 3, color: COLORS.RED, alpha: 0.85 })
    gfx.alpha = 0
    gfx.label = 'fx-barrier'
    fxLayer.value.addChild(gfx)
    return gfx
  }

  /** 清理特效层内所有对象 */
  function clearFx() {
    fxLayer.value?.removeChildren()
  }

  // ─── 辉光呼吸脉动（由 ticker 驱动）────────────────────────
  let _breatheTicker = null

  function startGlowBreathe() {
    if (!app.value) return
    let t = 0
    _breatheTicker = (delta) => {
      t += delta.deltaTime * 0.02
      const pulse = 0.1 + Math.sin(t) * 0.08
      Object.values(nodeMap.value).forEach(({ gfxGlow }) => {
        if (gfxGlow) gfxGlow.alpha = pulse
      })
    }
    app.value.ticker.add(_breatheTicker)
  }

  function stopGlowBreathe() {
    if (app.value && _breatheTicker) {
      app.value.ticker.remove(_breatheTicker)
      _breatheTicker = null
    }
  }

  // ─── 窗口 resize 全景物理与逻辑自适应 ────────────────────────
  /**
   * @param {HTMLElement} mountEl
   * @param {number} mobileOffsetRatio  移动端垂直偏移系数（-0.3~0.3），负数=上移，正数=下移
   */
  function handleResize(mountEl, mobileOffsetRatio = -0.12) {
    if (!app.value || !contentContainer.value) return

    // 获取当前渲染容器的真实物理尺寸
    const realW = mountEl.offsetWidth || window.innerWidth
    const realH = mountEl.offsetHeight || window.innerHeight

    // 重置 WebGL 物理渲染像素
    app.value.renderer.resize(realW, realH)

    // 逻辑坐标系基准尺寸（针对 900x640 设计）
    const baseW = 900
    const baseH = 640

    // 计算等比例缩放比，使其饱满填充 80% 容器空间
    const scale = Math.min(realW / baseW, realH / baseH)

    // 计算居中偏移量
    const offsetX = (realW - baseW * scale) / 2
    let offsetY = (realH - baseH * scale) / 2

    // 📱 手机端：按外部传入的 mobileOffsetRatio 动态调整垂直位置
    if (realW < 768) {
      offsetY += realH * mobileOffsetRatio
    }

    // 应用到外层自适应物理容器，全局等比缩放并物理居中
    const resizeContent = app.value.stage.getChildByLabel('resize-container-root')
    if (resizeContent) {
      resizeContent.scale.set(scale)
      resizeContent.position.set(offsetX, offsetY)
    }
  }

  // ─── 销毁清理 ──────────────────────────────────────────────
  function destroyStage() {
    stopGlowBreathe()
    window.removeEventListener('resize', handleResize)
    if (app.value) {
      app.value.destroy(true, { children: true })
      app.value = null
    }
    nodeMap.value = {}
    linkMap.value = {}
    isReady.value = false
    console.log('[usePixiStage] 舞台已销毁')
  }

  // ─── 内部工具函数 ──────────────────────────────────────────

  /** 根据 scriptData.links 重新绘制连线（虚线 path） */
  function _redrawLinks(scriptData) {
    for (const link of scriptData.links) {
      const entry = linkMap.value[link.id]
      if (!entry) continue
      const { gfx, config } = entry
      const fromNodeObj = nodeMap.value[config.from]
      const toNodeObj   = nodeMap.value[config.to]
      if (!fromNodeObj || !toNodeObj) continue

      gfx.clear()

      // 彻底消除硬编码，直接读取已定位的 Container 实例坐标，保证线随点动
      const fx = fromNodeObj.container.x
      const fy = fromNodeObj.container.y
      const tx = toNodeObj.container.x
      const ty = toNodeObj.container.y

      const lw = config.width || 1.5
      const col = config.color || COLORS.CYAN
      const alpha = 0.75

      if (config.dash) {
        // 手绘虚线（PixiJS v8 无原生虚线，用线段模拟）
        _drawDashedLine(
          gfx,
          fx, fy,
          tx, ty,
          { color: col, alpha, width: lw, dash: 8, gap: 6 }
        )
      } else {
        gfx
          .moveTo(fx, fy)
          .lineTo(tx, ty)
          .stroke({ width: lw, color: col, alpha })
      }
    }
  }

  /** 绘制虚线（PixiJS v8 兼容实现） */
  function _drawDashedLine(gfx, x1, y1, x2, y2, opts = {}) {
    const { color = 0x00ffcc, alpha = 0.7, width = 1.5, dash = 8, gap = 6 } = opts
    const dx = x2 - x1
    const dy = y2 - y1
    const len = Math.sqrt(dx * dx + dy * dy)
    const ux = dx / len
    const uy = dy / len
    let d = 0
    let drawing = true

    while (d < len) {
      const segLen = drawing ? Math.min(dash, len - d) : Math.min(gap, len - d)
      const sx = x1 + ux * d
      const sy = y1 + uy * d
      const ex = x1 + ux * (d + segLen)
      const ey = y1 + uy * (d + segLen)
      if (drawing) {
        gfx
          .moveTo(sx, sy)
          .lineTo(ex, ey)
          .stroke({ width, color, alpha })
      }
      d += segLen
      drawing = !drawing
    }
  }

  /** 生成六边形顶点 flat 数组 */
  function _hexPoints(r) {
    const pts = []
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 6
      pts.push(Math.cos(angle) * r, Math.sin(angle) * r)
    }
    return pts
  }

  /** 清空所有舞台对象（不销毁 app） */
  function _clearObjects() {
    if (!app.value || !contentContainer.value) return
    // 保留 fxLayer，清除其余子节点
    const mainContent = contentContainer.value
    const toRemove = []
    for (const child of mainContent.children) {
      if (child !== fxLayer.value) toRemove.push(child)
    }
    toRemove.forEach(c => mainContent.removeChild(c))
    nodeMap.value = {}
    linkMap.value = {}
    fxLayer.value?.removeChildren()
  }

  return {
    app,
    isReady,
    nodeMap,
    linkMap,
    fxLayer,
    contentContainer,
    initStage,
    destroyStage,
    buildSceneObjects,
    createBarrier,
    clearFx,
    startGlowBreathe,
    stopGlowBreathe,
    handleResize,
  }
}
