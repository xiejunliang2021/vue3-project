/**
 * useDirectorTimeline.js
 * ─────────────────────────────────────────────────────
 * 【时序编排层】GSAP Timeline 分镜状态机 Hook
 *
 * 职责：
 *  - 消费 usePixiStage 暴露的 nodeMap / linkMap / fxLayer
 *  - 用 gsap.timeline() 将分镜配置转译为完整的 GSAP 时序
 *  - 管理 currentScene (ref)、isPlaying (ref)、speed (ref) 等响应式状态
 *  - 暴露 play/pause/restart/setSpeed 等控制接口
 *  - 每个分镜切换时 emit 'sceneChange' 通知 Vue 层更新字幕
 *
 * 缓动规范（来自 intelligent-video-director 技能）：
 *  - 进场: "power4.out" / "back.out(1.5)"
 *  - 强调弹入: "elastic.out(1, 0.5)"
 *  - 退场: "power4.in"
 *  - 每幕动作完成后加 0.7s 定格留白
 * ─────────────────────────────────────────────────────
 */

import { ref, computed } from 'vue'
import gsap from 'gsap'

export function useDirectorTimeline(nodeMap, linkMap, fxLayer, createBarrier, clearFx, contentContainer) {
  /** GSAP 主时间轴 */
  let tl = null

  /** 当前分镜索引 (0-based) */
  const currentScene = ref(-1)

  /** 是否正在播放 */
  const isPlaying = ref(false)

  /** 当前倍速 */
  const speed = ref(1.0)

  /** 当前进度 0~1 */
  const progress = ref(0)

  /** 当前时间（秒） */
  const currentTime = ref(0)

  /** 场景变更回调列表 */
  const _sceneCallbacks = []

  // ─── 注册场景变更监听 ─────────────────────────────────────
  function onSceneChange(cb) {
    _sceneCallbacks.push(cb)
  }

  function _emitScene(idx) {
    currentScene.value = idx
    _sceneCallbacks.forEach(cb => cb(idx))
  }

  // ─── 构建完整时间轴 ───────────────────────────────────────
  /**
   * @param {object} scriptData  - 来自 useScriptData 的完整脚本配置
   */
  function buildTimeline(scriptData) {
    // 销毁旧时间轴
    if (tl) { tl.kill(); tl = null }
    clearFx?.()

    // 重置主内容容器默认 scale
    if (contentContainer?.value) {
      gsap.set(contentContainer.value.scale, { x: 1, y: 1 })
    }

    // 重置所有节点到初始不可见状态
    Object.values(nodeMap.value).forEach(({ container }) => {
      if (container) {
        gsap.set(container, { alpha: 0 })
        gsap.set(container.scale, { x: 0, y: 0 })
      }
    })
    Object.values(linkMap.value).forEach(({ gfx }) => {
      if (gfx) gsap.set(gfx, { alpha: 0 })
    })

    tl = gsap.timeline({
      paused: true,
      onUpdate() {
        progress.value  = tl.progress()
        currentTime.value = parseFloat(tl.time().toFixed(1))
      },
      onComplete() {
        isPlaying.value = false
        progress.value  = 1
      },
    })

    let cursor = 0 // 时间游标（秒）

    for (let si = 0; si < scriptData.scenes.length; si++) {
      const scene    = scriptData.scenes[si]
      const sceneIdx = si
      const sceneStart = cursor

      // 场景变更回调
      tl.call(() => _emitScene(sceneIdx), null, sceneStart)

      // ── 1. 动态群落感知缩放 (Count-Based Base Scale)
      const activeCount = (scene.activeNodes || []).length
      let globalScale = 1.1
      if (activeCount === 1) globalScale = 1.8
      else if (activeCount === 2 || activeCount === 3) globalScale = 1.35
      else if (activeCount >= 5) globalScale = 0.9

      if (contentContainer?.value) {
        tl.to(contentContainer.value.scale, {
          x: globalScale,
          y: globalScale,
          duration: 0.5,
          ease: 'power2.out',
        }, sceneStart)
      }

      // ── 2. 动态纵向相对间距拉伸 (节点多时纵向舒展开)
      const isMobileDevice = typeof window !== 'undefined' && window.innerWidth < 768
      const yStretch = isMobileDevice ? 1.45 : 1.0
      const stretchFactor = activeCount >= 5 ? 1.25 : 1.0

      for (const nodeId of (scene.activeNodes || [])) {
        const entry = nodeMap.value[nodeId]
        if (!entry) continue
        const cfg = entry.config
        if (cfg.relY !== undefined) {
          const cy = 320
          const targetY = cy + (cfg.relY * yStretch * stretchFactor)
          tl.to(entry.container, {
            y: targetY,
            duration: 0.5,
            ease: 'power2.out',
          }, sceneStart)
        }
      }

      // ── 退场节点（fade out）
      for (const nodeId of (scene.exitNodes || [])) {
        const entry = nodeMap.value[nodeId]
        if (!entry) continue
        tl.to(entry.container, {
          alpha: 0,
          duration: 0.55,
          ease: 'power4.in',
        }, sceneStart)
        tl.to(entry.container.scale, {
          x: 0, y: 0,
          duration: 0.55,
          ease: 'power4.in',
        }, sceneStart)
      }

      // ── 退场连线
      const prevScene = si > 0 ? scriptData.scenes[si - 1] : null
      if (prevScene) {
        const linksToHide = (prevScene.activeLinks || []).filter(
          id => !(scene.activeLinks || []).includes(id)
        )
        for (const linkId of linksToHide) {
          const entry = linkMap.value[linkId]
          if (entry?.gfx) {
            tl.to(entry.gfx, { alpha: 0, duration: 0.4, ease: 'power4.in' }, sceneStart)
          }
        }
      }

      // ── 进场节点（逐个按配置缓动进入）
      let enterDelay = 0
      for (const nodeId of (scene.enterNodes || [])) {
        const entry = nodeMap.value[nodeId]
        if (!entry) continue
        const cfg = entry.config

        const enterEase = cfg.ease || 'power4.out'
        const enterDur  = enterEase.includes('elastic') ? 1.2 : 0.8
        const tPos      = sceneStart + 0.3 + enterDelay

        tl.fromTo(
          entry.container,
          { alpha: 0 },
          { alpha: 1, duration: enterDur, ease: enterEase },
          tPos
        )
        tl.fromTo(
          entry.container.scale,
          { x: 0, y: 0 },
          { x: 1, y: 1, duration: enterDur, ease: enterEase },
          tPos
        )

        enterDelay += 0.25
      }

      // ── 进场连线（淡入）
      let linkDelay = enterDelay
      for (const linkId of (scene.activeLinks || [])) {
        const entry = linkMap.value[linkId]
        if (!entry?.gfx) continue
        const isNew = !prevScene || !(prevScene.activeLinks || []).includes(linkId)
        if (isNew) {
          tl.fromTo(
            entry.gfx,
            { alpha: 0 },
            { alpha: 1, duration: 0.6, ease: 'power4.out' },
            sceneStart + 0.5 + linkDelay * 0.1
          )
          linkDelay += 1
        }
      }

      // ── 特效指令处理
      _applyFx(scene.fx || [], sceneStart, scene.duration, scriptData, createBarrier)

      // ── 强制定格留白 (0.7s)
      tl.to({}, { duration: 0.7 }, sceneStart + scene.duration - 0.7)

      cursor += scene.duration
    }

    isPlaying.value = false
    console.log('[useDirectorTimeline] 时间轴构建完成，总时长:', tl.duration().toFixed(1), 's')
    return tl
  }

  // ─── 特效处理器 ───────────────────────────────────────────
  function _applyFx(fxList, sceneStart, sceneDuration, scriptData, createBarrier) {
    for (const fx of fxList) {
      const at = sceneStart + (fx.at || 0)

      switch (fx.type) {

        // 节点粉碎消失
        case 'shatter': {
          const entry = nodeMap.value[fx.target]
          if (!entry) break
          tl.to(entry.container, {
            alpha: 0,
            duration: 0.45,
            ease: 'power4.in',
          }, at)
          tl.to(entry.container.scale, {
            x: 1.4, y: 1.4,
            duration: 0.45,
            ease: 'power4.in',
          }, at)
          break
        }

        // 节点脉冲放大后回弹
        case 'pulse': {
          const entry = nodeMap.value[fx.target]
          if (!entry) break
          tl.to(entry.container.scale, {
            x: 1.25, y: 1.25,
            duration: 0.3,
            ease: 'power2.out',
            yoyo: true,
            repeat: 1,
          }, at)
          break
        }

        // 障碍墙升起
        case 'barrier': {
          const barrierGfx = createBarrier?.()
          if (!barrierGfx) break
          tl.fromTo(
            barrierGfx,
            { alpha: 0 },
            { alpha: 1, duration: 0.45, ease: 'power4.out' },
            at
          )
          tl.fromTo(
            barrierGfx.scale,
            { y: 0 },
            { y: 1, duration: 0.45, ease: 'power4.out' },
            at
          )
          // ⚡ 在当前分镜结束前 0.45s 自动淡出，防止残留到下一个分镜
          tl.to(
            barrierGfx,
            { alpha: 0, duration: 0.4, ease: 'power4.in' },
            sceneStart + sceneDuration - 0.45
          )
          break
        }

        // 节点爆炸消失
        case 'blast': {
          const entry = nodeMap.value[fx.target]
          if (!entry) break
          tl.to(entry.container, {
            alpha: 0,
            duration: 0.4,
            ease: 'power4.in',
          }, at)
          tl.to(entry.container.scale, {
            x: 2, y: 2,
            duration: 0.4,
            ease: 'power4.in',
          }, at)
          break
        }

        // 节点飞出屏幕（向左）
        case 'flyout': {
          const entry = nodeMap.value[fx.target]
          if (!entry) break
          tl.to(entry.container, {
            x: '-=400',
            alpha: 0,
            duration: 0.55,
            ease: 'power4.in',
          }, at)
          break
        }

        // 雷达扫描圈（绿色扩散环）
        case 'radar-scan': {
          const entry = nodeMap.value[fx.target]
          if (!entry || !fxLayer.value) break
          import('pixi.js').then(({ Graphics: _G }) => {
            const ring = new _G()
            const r0   = entry.config.radius || 55
            const cx   = entry.container.x
            const cy   = entry.container.y
            ring.circle(cx, cy, r0)
              .stroke({ width: 2.5, color: 0x39ff14, alpha: 0.85 })
            ring.scale.set(0.5)
            ring.alpha = 0
            fxLayer.value?.addChild(ring)

            gsap.fromTo(ring,
              { alpha: 0.9 },
              { alpha: 0, duration: 1.2, ease: 'power2.out', repeat: 1, repeatDelay: 0.4, delay: fx.at || 0 }
            )
            gsap.fromTo(ring.scale,
              { x: 0.5, y: 0.5 },
              { x: 2.2, y: 2.2, duration: 1.2, ease: 'power2.out', repeat: 1, repeatDelay: 0.4, delay: fx.at || 0 }
            )
          })
          break
        }

        // 管理层红叉（否定否定）
        case 'cross-out': {
          const entry = nodeMap.value[fx.target]
          if (!entry || !fxLayer.value) break
          import('pixi.js').then(({ Graphics: _G }) => {
            const cross = new _G()
            const cx = entry.container.x
            const cy = entry.container.y
            const r = 24
            cross.moveTo(cx - r, cy - r).lineTo(cx + r, cy + r)
                 .moveTo(cx + r, cy - r).lineTo(cx - r, cy + r)
                 .stroke({ width: 4.5, color: 0xff3366, alpha: 0.9 })
            cross.alpha = 0
            cross.scale.set(0.2)
            fxLayer.value?.addChild(cross)
            gsap.fromTo(cross,
              { alpha: 0 },
              { alpha: 1, duration: 0.35, ease: 'back.out(2)', delay: at }
            )
            gsap.fromTo(cross.scale,
              { x: 0.2, y: 0.2 },
              { x: 1, y: 1, duration: 0.35, ease: 'back.out(2)', delay: at }
            )
          })
          break
        }

        // 数据小球流动（解耦主 tl 时间轴，用 tl.call 激发独立动画）
        case 'data-flow': {
          const fromEntry = nodeMap.value[fx.from]
          const toEntry   = nodeMap.value[fx.to]
          if (!fromEntry || !toEntry || !fxLayer.value) break
          tl.call(() => {
            _triggerDataFlow(fromEntry.container.position, toEntry.container.position)
          }, null, at)
          break
        }

        // 安全相对摇晃（Relative Shake，末尾精准复位）
        case 'shake': {
          const entry = nodeMap.value[fx.target]
          if (!entry) break
          const origX = entry.container.x
          tl.to(entry.container, {
            x: '-=12',
            duration: 0.04,
            ease: 'power1.inOut',
            yoyo: true,
            repeat: 5,
          }, at).to(entry.container, {
            x: origX,
            duration: 0.02,
            ease: 'none',
          })
          break
        }

        // 全场神经网络脉冲（所有节点辉光闪烁）
        case 'neural-pulse': {
          Object.values(nodeMap.value).forEach(({ container }, i) => {
            if (!container || container.alpha === 0) return
            tl.to(container.scale, {
              x: 1.12, y: 1.12,
              duration: 0.35,
              ease: 'power2.out',
              yoyo: true,
              repeat: 1,
            }, at + i * 0.05)
          })
          break
        }

        // 金色粒子雨（简易文字粒子组）
        case 'gold-rain': {
          _spawnGoldRain(at)
          break
        }

        default:
          break
      }
    }
  }

  /** 数据小球流动解耦动画（独立子时间轴，0污染主提词器） */
  function _triggerDataFlow(fromPos, toPos) {
    if (!fxLayer.value) return
    import('pixi.js').then(({ Graphics: _G }) => {
      const subTl = gsap.timeline()
      const count = 10
      for (let i = 0; i < count; i++) {
        const dot = new _G()
        dot.circle(0, 0, 4.5).fill({ color: 0x00ffcc, alpha: 0.9 })
        dot.position.set(fromPos.x, fromPos.y)
        dot.alpha = 0
        fxLayer.value?.addChild(dot)

        subTl.fromTo(dot,
          { alpha: 0, x: fromPos.x, y: fromPos.y },
          { alpha: 1, x: (fromPos.x + toPos.x) / 2, y: (fromPos.y + toPos.y) / 2, duration: 0.4, ease: 'none' },
          i * 0.12
        ).to(dot,
          { x: toPos.x, y: toPos.y, alpha: 0, duration: 0.4, ease: 'none', onComplete: () => {
            dot.destroy()
          }},
          '>'
        )
      }
    })
  }

  /** 金色粒子雨轻量实现 */
  function _spawnGoldRain(at) {
    if (!fxLayer.value) return
    import('pixi.js').then(({ Graphics: _G }) => {
      const count = 20
      for (let i = 0; i < count; i++) {
        const dot = new _G()
        const sx  = 250 + Math.random() * 400
        const sy  = 80  + Math.random() * 60
        dot.circle(sx, sy, 2 + Math.random() * 3)
          .fill({ color: 0xffd700, alpha: 0.9 })
        fxLayer.value?.addChild(dot)
        gsap.fromTo(dot,
          { alpha: 1, y: 0 },
          { alpha: 0, y: 150 + Math.random() * 120,
            duration: 1.5 + Math.random() * 0.8,
            ease: 'power2.in',
            delay: at + Math.random() * 0.8,
          }
        )
      }
    })
  }

  // ─── 惰性 Pixi 引用（ESM 动态导入，避免循环依赖）──────────
  async function _pixiRef() {
    return await import('pixi.js')
  }

  // ─── 公开播放控制接口 ─────────────────────────────────────
  function play() {
    if (!tl) return
    tl.play()
    isPlaying.value = true
  }

  function pause() {
    if (!tl) return
    tl.pause()
    isPlaying.value = false
  }

  function togglePlay() {
    isPlaying.value ? pause() : play()
  }

  function restart() {
    if (!tl) return
    tl.restart()
    isPlaying.value = true
    currentScene.value = 0
  }

  function setSpeed(s) {
    speed.value = s
    if (tl) tl.timeScale(s)
  }

  /** 跳转到指定分镜 */
  function seekToScene(idx, scriptData) {
    if (!tl || !scriptData) return
    let t = 0
    for (let i = 0; i < idx && i < scriptData.scenes.length; i++) {
      t += scriptData.scenes[i].duration
    }
    tl.seek(t)
  }

  function destroyTimeline() {
    if (tl) { tl.kill(); tl = null }
    isPlaying.value  = false
    currentScene.value = -1
    progress.value   = 0
  }

  return {
    tl: computed(() => tl),
    currentScene,
    isPlaying,
    speed,
    progress,
    currentTime,
    buildTimeline,
    play,
    pause,
    togglePlay,
    restart,
    setSpeed,
    seekToScene,
    destroyTimeline,
    onSceneChange,
  }
}
