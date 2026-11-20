<template>
  <div class="cyber-page" @click="handleCanvasClick">
    <div class="scanline"></div>
    <div class="glow-bg"></div>

    <!-- tsParticles 背景层 -->
    <div id="particles-bg" class="particles-container"></div>

    <!-- PixiJS 核心 WebGL 画布层 -->
    <div ref="pixiMountRef" class="pixi-container"></div>

    <!-- 顶部智能提词字幕面板（使用 iframe 独立播放时隐藏父级 HUD，避免挡住 iframe 自带字幕） -->
    <div v-if="!useIframe" class="top-hud-panel">
      <Motion
        :key="currentScene"
        :initial="{ opacity: 0, y: -40, scale: 0.95, filter: 'blur(10px)' }"
        :animate="{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }"
        :transition="{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }"
        class="subtitle-box"
      >
        <span class="scene-num font-mono">SCENE {{ currentScene + 1 }} //</span>
        <!-- 双容器：外层裁切，内层自由伸展滚动 -->
        <div class="subtitle-clip">
          <span class="subtitle-text">{{ activeSubtitle }}</span>
        </div>
      </Motion>
    </div>

    <!-- 极客 UI 与控制面板层 -->
    <div class="drawer-trigger" @click.stop="toggleDrawer" :class="{ 'drawer-open': isDrawerOpen }">
      <span class="menu-icon">{{ isDrawerOpen ? '✕' : '≡' }}</span>
    </div>

    <div class="drawer" :class="{ open: isDrawerOpen }" @click.stop>
      <h3 class="drawer-title font-mono">🎬 动效导演控制台</h3>
      <hr class="cyber-divider">
      
      <!-- 图谱列表切换 -->
      <div class="control-group">
        <label class="font-mono">📂 切换演示图谱</label>
        <div class="list-wrapper">
          <div 
            v-for="item in graphsList" 
            :key="item.id" 
            :class="['graph-item', activeGraphId === item.id ? 'active' : '']"
            @click="selectGraph(item)"
          >
            <div class="flex-row">
              <span class="graph-name truncate">{{ item.name }}</span>
            </div>
            <span class="graph-path font-mono">{{ item.file }}</span>
          </div>
        </div>
      </div>

      <div class="control-group">
        <label class="font-mono">⚙️ 播放控制 (Control)</label>
        <div class="btn-grid">
          <div class="btn active-cyber" @click="togglePlayState">
            {{ isPlaying ? '⏸ 暂停' : '▶ 播放' }}
          </div>
          <div class="btn" @click="restartTimeline">↺ 重置</div>
        </div>
      </div>

      <div class="control-group">
        <label class="font-mono">⚡ 播放倍速 (Speed)</label>
        <div class="btn-grid">
          <div 
            v-for="s in [0.5, 1.0, 1.5, 2.0]" 
            :key="s" 
            :class="['btn', speed === s ? 'active' : '']"
            @click="changeSpeed(s)"
          >
            {{ s }}x
          </div>
        </div>
      </div>

      <div class="control-group">
        <label class="font-mono">🎨 视觉主题 (Theme)</label>
        <div class="btn-grid">
          <div 
            v-for="t in ['cyberpunk', 'minimal', 'hacker']" 
            :key="t" 
            :class="['btn', activeTheme === t ? 'active' : '']"
            @click="changeTheme(t)"
          >
            {{ t === 'cyberpunk' ? '🪐 赛博' : t === 'minimal' ? '☀️ 极简' : '🟢 黑客' }}
          </div>
        </div>
      </div>

      <!-- 💾 独立分镜下载 (在AI员工分镜以及Obsidian与AI硅基合伙人动效显示) -->
      <div class="control-group" v-if="activeGraphId.startsWith('ai_employee_scene_') || activeGraphId === 'obsidian_silicon_partner'">
        <label class="font-mono">💾 导出独立分镜视频</label>
        
        <!-- 格式选择 -->
        <div class="btn-grid" style="grid-template-columns: repeat(2, 1fr); gap: 8px; margin-bottom: 12px;">
          <div 
            v-for="format in ['9_16', '6_19']" 
            :key="format" 
            :class="['btn', downloadFormat === format ? 'active' : '']"
            @click="downloadFormat = format"
          >
            {{ format === '9_16' ? '📱 竖屏 9:16' : '💻 宽屏 6:19' }}
          </div>
        </div>

        <!-- 镜头选择列表 -->
        <label class="font-mono" style="margin-top: 8px; display: block; margin-bottom: 4px;">🎬 选择下载的镜头</label>
        <div class="scenes-select-wrapper" style="max-height: 180px; overflow-y: auto; border: 1px solid rgba(0, 255, 204, 0.2); border-radius: 6px; padding: 10px; margin-bottom: 12px; background: rgba(0,0,0,0.25); display: flex; flex-direction: column; gap: 8px;">
          <!-- 全选控制 -->
          <div style="display: flex; align-items: center; gap: 8px; padding-bottom: 6px; border-bottom: 1px solid rgba(0, 255, 204, 0.15);">
            <input type="checkbox" id="select-all-scenes" :checked="selectedScenes.length === currentDownloadScenes.length" @change="toggleSelectAllScenes" style="accent-color: #00ffcc; cursor: pointer;" />
            <label for="select-all-scenes" class="font-mono" style="color: #fff; cursor: pointer; text-transform: none; font-size: 11px; margin: 0; user-select: none;">全选镜头</label>
          </div>
          
          <!-- 循环渲染分镜 -->
          <div v-for="scene in currentDownloadScenes" :key="scene.id" style="display: flex; align-items: center; gap: 8px;">
            <input type="checkbox" :id="scene.id" :value="scene.id" v-model="selectedScenes" style="accent-color: #00ffcc; cursor: pointer;" />
            <label :for="scene.id" style="color: #8c92ac; cursor: pointer; text-transform: none; font-size: 11px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; margin: 0; user-select: none;">
              {{ scene.name.replace('月薪200块AI员工 ', '') }}
            </label>
          </div>
        </div>

        <div class="btn active-cyber" @click="downloadSelectedScenes" :style="{ opacity: isDownloading ? 0.6 : 1, pointerEvents: isDownloading ? 'none' : 'auto', fontWeight: 'bold', width: '100%' }">
          {{ isDownloading ? `📦 正在打包 Zip (${downloadProgress}/${downloadTotal})...` : `⚡ 下载已选镜头 (${selectedScenes.length})` }}
        </div>
      </div>

      <!-- 📱 移动端画布垂直位置调节 -->
      <div class="control-group mobile-offset-group">
        <label class="font-mono">📱 画布垂直位置 (仅手机)</label>
        <div class="slider-row">
          <span class="font-mono slider-hint">上移</span>
          <input
            type="range"
            min="-30"
            max="30"
            step="1"
            :value="mobileOffsetPercent"
            @input="onMobileOffsetChange($event.target.value)"
            class="cyber-slider"
          />
          <span class="font-mono slider-hint">下移</span>
        </div>
        <div class="slider-value font-mono">{{ mobileOffsetPercent > 0 ? '+' : '' }}{{ mobileOffsetPercent }}%</div>
      </div>
    </div>

    <!-- 移动端滑动手势调节倍速 HUD 指示框 -->
    <Presence>
      <Motion
        v-if="showHud"
        :initial="{ opacity: 0, scale: 0.6, y: 50, filter: 'blur(8px)' }"
        :animate="{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }"
        :exit="{ opacity: 0, scale: 0.8, y: -30, filter: 'blur(8px)' }"
        :transition="{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }"
        class="hud-speed-box"
      >
        <div class="hud-inner">
          <div class="hud-label font-mono">SPEED DIAL</div>
          <div class="hud-value font-mono">{{ speed.toFixed(1) }}x</div>
        </div>
      </Motion>
    </Presence>

    <!-- 底部状态栏 -->
    <div v-if="!useIframe" class="speed-indicator font-mono">
      <span>{{ activeTheme.toUpperCase() }}</span>
      <span class="split">|</span>
      <span>TIME: {{ currentTime.toFixed(1) }}s</span>
      <span class="split">|</span>
      <span>PROGRESS: {{ (progress * 100).toFixed(0) }}%</span>
    </div>

    <!-- iframe 降级容器 (对无法进行 WebGL 重构的传统页面) -->
    <div v-if="useIframe" class="iframe-container">
      <iframe :src="iframeUrl" :style="iframeStyle"></iframe>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { Motion, Presence } from '@motionone/vue'

// 导入三大层核心组合式 Hook 逻辑
import { SCRIPT_MAP } from '../composables/useScriptData.js'
import { useParticles } from '../composables/useParticles.js'
import { usePixiStage } from '../composables/usePixiStage.js'
import { useDirectorTimeline } from '../composables/useDirectorTimeline.js'

// 视图层 UI 状态
const graphsList = ref([])
const activeGraphId = ref('hermes_broll')
const isDrawerOpen = ref(true)
const useIframe = ref(false)
const iframeUrl = ref('')
const activeTheme = ref('cyberpunk')
const downloadFormat = ref('9_16')
const selectedScenes = ref([])

const windowWidth = ref(window.innerWidth)
const windowHeight = ref(window.innerHeight)

function handleWindowResize() {
  windowWidth.value = window.innerWidth
  windowHeight.value = window.innerHeight
}

const iframeStyle = computed(() => {
  const isMobile = windowWidth.value < 768
  const isObsidian = activeGraphId.value === 'obsidian_silicon_partner'
  
  let baseW = 900
  let baseH = 640
  
  if (isMobile && isObsidian) {
    // 强制使用 9:16 竖屏的尺寸
    baseW = 640
    baseH = 1138
  }
  
  const containerW = windowWidth.value
  const containerH = windowHeight.value
  const scaleX = containerW / baseW
  const scaleY = containerH / baseH
  
  let finalScale = 1.0
  if (isMobile) {
    // 手机端让它尽可能多占满空间，9:16 竖屏时使用 0.98 倍宽度缩放，这可以让它的物理高度正好占满 80% 以上的屏幕高度
    finalScale = (containerW / baseW) * 0.98
  } else {
    finalScale = Math.min(scaleX, scaleY, 1.0)
  }
  
  return {
    width: `${baseW}px`,
    height: `${baseH}px`,
    transform: `scale(${finalScale})`,
    transformOrigin: 'center center',
    border: 'none',
    flexShrink: 0
  }
})

const SCENE_NAMES_OBSIDIAN = {
  1: "掌握核心工具链破局解",
  2: "存了上千条笔记却从未看过",
  3: "同频的硅基合伙人剪影",
  4: "拆解 Obsidian 闭环工作流",
  5: "用 Smart Connections 关联",
  6: "自动捞出关联的旧笔记",
  7: "Smart Context 打包打包盒",
  8: "AI 聊天基于我们自己的知识库",
  9: "Obsidian 内部跑 Claude Code",
  10: "建立 raw/templates/wiki 文件夹",
  11: "raw 文件夹只读收件箱小锁",
  12: "Obsidian 终端唤醒 Claude",
  13: "导入 wiki 指令对话气泡",
  14: "自动提取生成 Wiki 并更新索引",
  15: "AI 采取不平衡杠铃策略",
  16: "守住自己的思考和写作防线",
  17: "库中划出专属 AI 暂存区",
  18: "甄别过滤内容整合入宇宙",
  191: "人机协同工作流大纲回顾",
  192: "立即行动把 Obsidian 升级",
  20: "关注我们下一期带你上机实操"
}

const SCENE_NAMES_DONT_SCRAPE = {
  1: "你有没有遇到过这种情况？",
  2: "丢给 Agent Youtube 链接指望一键提取",
  3: "页面转圈最后超时或直接卡死报错",
  4: "问题并不是 Agent 脑子不够用或提示词不好",
  5: "而是让大脑硬刚一个专门防爬虫的平台",
  6: "用普通数据中心 IP 爬取没有登录态被封死",
  7: "最离谱的是一个没有公开字幕的九分钟视频",
  8: "Agent 默默下载音频并调用本地 Whisper 硬转",
  9: "CPU 满载服务器直接卡死瘫痪了半个小时",
  10: "痛点所在：我们将获取与理解数据混为一谈",
  11: "真正的解耦方案：将这两件事彻底分离开",
  12: "让 Hermes 做大脑，让 Supdata API 做入口",
  13: "三步走自媒体流水线重构逻辑展示",
  14: "第一步：Hermes 轻量检索元数据聚类",
  15: "第二步：人工根据数据勾选高价值视频",
  16: "第三步：Supdata 秒级提取干净对照逐字稿",
  17: "最后 Hermes 接手做提炼爆点并写入 Obsidian",
  18: "原来卡死 30 分钟现 3 分钟跑通 Token 省 80%",
  19: "金句：不要让 Agent 硬爬，让 Agent 调度",
  20: "立即行动：评论区打逐字稿，获取大礼包"
}

const employeeScenes = computed(() => {
  return graphsList.value.filter(g => g.id.startsWith('ai_employee_scene_'))
})

const obsidianScenes = computed(() => {
  const keys = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 191, 192, 20]
  return keys.map(k => {
    const name = SCENE_NAMES_OBSIDIAN[k]
    const suffix = k === 191 ? '19a' : k === 192 ? '19b' : k.toString()
    return {
      id: `obsidian_partner_scene_${suffix}`,
      name: `分镜 ${suffix}: ${name}`
    }
  })
})

const dontScrapeScenes = computed(() => {
  const keys = Array.from({length: 20}, (_, i) => i + 1)
  return keys.map(k => {
    const name = SCENE_NAMES_DONT_SCRAPE[k]
    return {
      id: `dont_scrape_scene_${k}`,
      name: `分镜 ${k}: ${name}`
    }
  })
})

const currentDownloadScenes = computed(() => {
  if (activeGraphId.value === 'obsidian_silicon_partner') {
    return obsidianScenes.value
  }
  if (activeGraphId.value === 'dont_scrape_workflow') {
    return dontScrapeScenes.value
  }
  return employeeScenes.value
})

function toggleSelectAllScenes(e) {
  if (e.target.checked) {
    selectedScenes.value = currentDownloadScenes.value.map(s => s.id)
  } else {
    selectedScenes.value = []
  }
}

// 监听 graphsList 变化自动勾选所有镜头
watch(currentDownloadScenes, (newScenes) => {
  if (newScenes.length > 0 && selectedScenes.value.length === 0) {
    selectedScenes.value = newScenes.map(s => s.id)
  }
}, { immediate: true })

const isDownloading = ref(false)
const downloadProgress = ref(0)
const downloadTotal = ref(0)

async function downloadSelectedScenes() {
  if (selectedScenes.value.length === 0) return
  
  isDownloading.value = true
  downloadProgress.value = 0
  downloadTotal.value = selectedScenes.value.length
  
  let targetFormat = downloadFormat.value
  if (targetFormat === '6_19') {
    targetFormat = '16_9'
  }
  
  const zip = new JSZip()
  
  for (const sceneId of selectedScenes.value) {
    let filename = ''
    if (sceneId.startsWith('obsidian_partner_scene_')) {
      const match = sceneId.match(/obsidian_partner_scene_(.+)/)
      if (!match) continue
      const sceneNum = match[1]
      filename = `obsidian_partner_scene_${sceneNum}_${targetFormat}.mp4`
    } else if (sceneId.startsWith('dont_scrape_scene_')) {
      const match = sceneId.match(/dont_scrape_scene_(\d+)/)
      if (!match) continue
      const sceneNum = match[1]
      filename = `dont_scrape_scene_${sceneNum}_${targetFormat}.mp4`
    } else {
      const match = sceneId.match(/ai_employee_scene_(\d+)/)
      if (!match) continue
      const sceneNum = match[1]
      filename = `scene_${sceneNum}_${targetFormat}.mp4`
    }
    
    try {
      const response = await fetch(`/videos/${filename}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const blob = await response.blob()
      zip.file(filename, blob)
    } catch (e) {
      console.error(`Failed to download ${filename}:`, e)
    }
    downloadProgress.value++
  }
  
  try {
    const content = await zip.generateAsync({ type: 'blob' })
    saveAs(content, `selected_scenes_${targetFormat}.zip`)
  } catch (e) {
    console.error('Failed to generate zip file:', e)
  } finally {
    isDownloading.value = false
  }
}

// 移动端 HUD 状态
const showHud = ref(false)
let hudTimer = null

// PixiJS 画布挂载 Ref
const pixiMountRef = ref(null)

// 实例化三大 Hook
const { initParticles, destroyParticles, setTheme } = useParticles()
const {
  initStage,
  destroyStage,
  buildSceneObjects,
  createBarrier,
  clearFx,
  startGlowBreathe,
  stopGlowBreathe,
  nodeMap,
  linkMap,
  fxLayer,
  contentContainer,
  handleResize,
} = usePixiStage()

// 📱 移动端画布垂直偏移（单位：百分比，-30~30，负=上移，正=下移）
const mobileOffsetPercent = ref(-12)

function onMobileOffsetChange(val) {
  mobileOffsetPercent.value = Number(val)
  // 实时触发重绘，把新的偏移系数传入
  if (pixiMountRef.value) {
    handleResize(pixiMountRef.value, mobileOffsetPercent.value / 100)
  }
}

const {
  tl,
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
  onSceneChange
} = useDirectorTimeline(nodeMap, linkMap, fxLayer, createBarrier, clearFx, contentContainer)

// 计算当前提词文本
const activeSubtitle = computed(() => {
  const script = SCRIPT_MAP[activeGraphId.value]
  if (script && script.scenes[currentScene.value]) {
    return script.scenes[currentScene.value].subtitle
  }
  return '正在准备分镜画布...'
})

// 手机端：每次切换场景后，精确计算滚动距离并注入 CSS 变量
watch(currentScene, async (sceneIdx) => {
  if (window.innerWidth > 768) return
  await nextTick()

  const textEl = document.querySelector('.subtitle-text')
  const clipEl = document.querySelector('.subtitle-clip')
  if (!textEl || !clipEl) return

  // 获取当前分镜时长
  const script = SCRIPT_MAP[activeGraphId.value]
  const sceneDur = script?.scenes?.[sceneIdx]?.duration ?? 6

  // 先完全移除动画，让 DOM 还原自然高度，再测量真实 scrollHeight
  textEl.style.animation = 'none'
  textEl.style.transform = 'translateY(0)'
  void textEl.offsetWidth  // 强制 reflow

  // 此时 textEl 没有 clamp 也没有动画，scrollHeight 是真实全文高度
  const fullH   = textEl.scrollHeight
  const clipH   = clipEl.clientHeight   // 外层裁切高度（两行）
  const overflow = fullH - clipH

  if (overflow <= 2) {
    // 文本不超过两行，静止即可
    textEl.style.animation = 'none'
  } else {
    // 滚动：15% 时间停在顶，85% 时间滚到底，配合 ease-in-out 缓出
    // 使用 px 绝对值避免百分比在 span 内无效
    textEl.style.setProperty('--scroll-dist', `-${overflow}px`)
    textEl.style.setProperty('--subtitle-dur', `${(sceneDur * 0.88).toFixed(1)}s`)
    textEl.style.animation = 'subtitle-scroll var(--subtitle-dur) ease-in-out forwards'
  }
})

// ─── 统一手势与播放控制 ───────────────────────────────────────
function togglePlayState() {
  if (useIframe.value) {
    isPlaying.value = !isPlaying.value
    const iframeEl = document.querySelector('.iframe-container iframe')
    if (iframeEl && iframeEl.contentWindow) {
      iframeEl.contentWindow.postMessage({ type: 'togglePlay' }, '*')
    }
    return
  }
  togglePlay()
}

function restartTimeline() {
  if (useIframe.value) {
    isPlaying.value = true
    const iframeEl = document.querySelector('.iframe-container iframe')
    if (iframeEl && iframeEl.contentWindow) {
      iframeEl.contentWindow.postMessage({ type: 'restart' }, '*')
    }
    return
  }
  restart()
}

function changeSpeed(s) {
  if (useIframe.value) {
    speed.value = s
    const iframeEl = document.querySelector('.iframe-container iframe')
    if (iframeEl && iframeEl.contentWindow) {
      iframeEl.contentWindow.postMessage({ type: 'setSpeed', speed: s }, '*')
    }
    triggerHudNotification()
    return
  }
  setSpeed(s)
  triggerHudNotification()
}

function toggleDrawer() {
  isDrawerOpen.value = !isDrawerOpen.value
}

function handleCanvasClick(e) {
  // 点击空白处暂停/播放，同时自动闪隐菜单
  if (useIframe.value) return
  togglePlayState()
  if (isPlaying.value) {
    isDrawerOpen.value = false
  } else {
    isDrawerOpen.value = true
  }
}

// ─── 移动端上下滑动调节 timeScale ─────────────────────────────
let touchStartY = 0
let touchStartX = 0
let lastTouchTime = 0

function handleTouchStart(e) {
  if (e.touches.length === 1) {
    touchStartY = e.touches[0].clientY
    touchStartX = e.touches[0].clientX
  }
}

function handleTouchEnd(e) {
  if (e.changedTouches.length === 1) {
    const deltaY = e.changedTouches[0].clientY - touchStartY
    const deltaX = Math.abs(e.changedTouches[0].clientX - touchStartX)
    const now = Date.now()
    lastTouchTime = now

    // 上下滑动且水平偏移较小时触发倍速调节
    if (Math.abs(deltaY) > 40 && deltaX < 50) {
      e.preventDefault()
      let nextSpeed = speed.value
      if (deltaY < 0) {
        // 向上滑，加速
        nextSpeed = Math.min(2.0, speed.value + 0.1)
      } else {
        // 向下滑，减速
        nextSpeed = Math.max(0.5, speed.value - 0.1)
      }
      changeSpeed(parseFloat(nextSpeed.toFixed(1)))
    }
  }
}

function triggerHudNotification() {
  showHud.value = true
  if (hudTimer) clearTimeout(hudTimer)
  hudTimer = setTimeout(() => {
    showHud.value = false
  }, 1000)
}

// ─── 空格键支持 ──────────────────────────────────────────────
function handleKeyDown(e) {
  if (e.code === 'Space') {
    e.preventDefault()
    togglePlayState()
  }
}

// ─── 选择加载图谱（WebGL/Iframe 双通道机制）─────────────────────
async function selectGraph(graph) {
  activeGraphId.value = graph.id
  
  // 检查是否在 useScriptData 中有 WebGL 分镜配置
  if (SCRIPT_MAP[graph.id] && SCRIPT_MAP[graph.id].nodes.length > 0) {
    useIframe.value = false
    iframeUrl.value = ''
    
    // 初始化/重新加载 WebGL 场景
    if (pixiMountRef.value) {
      // 彻底彻底清洗舞台，防止新旧节点冲突或 addChild 失败
      fxLayer.value?.removeChildren()
      nodeMap.value = {}
      linkMap.value = {}
      
      const script = SCRIPT_MAP[graph.id]
      buildSceneObjects(script)
      buildTimeline(script)
      play()
    }
  } else {
    // 降级使用 iframe 加载传统的静态页面
    useIframe.value = true
    iframeUrl.value = graph.file + '?t=' + Date.now()
    isPlaying.value = true
    speed.value = 1.0
    destroyTimeline()
  }
  isDrawerOpen.value = false
}

function changeTheme(theme) {
  activeTheme.value = theme
  document.body.className = theme
  setTheme(theme)
}

// ─── 生命周期编排 ────────────────────────────────────────────
onMounted(async () => {
  // 1. 获取并渲染可用图谱列表（加上时间戳防止强缓存）
  try {
    const res = await fetch(`/data/graphs_list.json?t=${Date.now()}`)
    if (res.ok) {
      graphsList.value = await res.json()
    }
  } catch (err) {
    console.error('加载图谱列表失败:', err)
  }

  // 2. 初始化底层 tsParticles 背景层
  await initParticles('particles-bg')

  // 3. 初始化 PixiJS WebGL 画布并渲染
  if (pixiMountRef.value) {
    await initStage(pixiMountRef.value, 900, 640)
    
    // 加载默认 WebGL 图谱
    const defaultScript = SCRIPT_MAP[activeGraphId.value]
    if (defaultScript) {
      buildSceneObjects(defaultScript)
      buildTimeline(defaultScript)
      startGlowBreathe()
      play()
    }
  }

  // 4. 手势与键盘事件挂载
  window.addEventListener('resize', handleWindowResize)
  window.addEventListener('keydown', handleKeyDown)
  document.addEventListener('touchstart', handleTouchStart, { passive: false })
  document.addEventListener('touchend', handleTouchEnd, { passive: false })
})

onUnmounted(() => {
  window.removeEventListener('resize', handleWindowResize)
  window.removeEventListener('keydown', handleKeyDown)
  document.removeEventListener('touchstart', handleTouchStart)
  document.removeEventListener('touchend', handleTouchEnd)
  destroyParticles()
  destroyStage()
  destroyTimeline()
})
</script>

<style scoped>
/* ==================== 极客底层布局 ==================== */
.cyber-page {
  background: #060913;
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: background-color 0.4s ease;
}

.particles-container {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}

.pixi-container {
  width: 80vw !important;
  height: 100vh !important;
  max-width: none !important;
  max-height: none !important;
  z-index: 2;
  position: relative;
}

.scanline {
  width: 100%;
  height: 4px;
  background: linear-gradient(to bottom, rgba(0, 243, 255, 0) 0%, rgba(0, 243, 255, 0.05) 10%, rgba(0, 243, 255, 0) 100%);
  position: absolute;
  animation: scan 6s linear infinite;
  z-index: 1;
  pointer-events: none;
}

@keyframes scan {
  0% { top: -4px; }
  100% { top: 100%; }
}

.glow-bg {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle, rgba(0, 243, 255, 0.02) 0%, rgba(0, 0, 0, 0) 70%);
  z-index: 1;
  pointer-events: none;
}

/* ==================== 顶部智能提词层 ==================== */
.top-hud-panel {
  position: absolute;
  top: 25px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  pointer-events: none;
  width: 80vw !important;
  max-width: none !important;
}

.subtitle-box {
  background: rgba(11, 13, 22, 0.85);
  border: 1px solid rgba(0, 255, 204, 0.35);
  box-shadow: 0 0 25px rgba(0, 255, 204, 0.15);
  backdrop-filter: blur(12px);
  border-radius: 30px;
  padding: 10px 18px;
  color: #00ffcc;
  font-size: 14px;
  line-height: 1.5;
  text-align: left;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  mix-blend-mode: screen;
}

/* 外层裁切容器：固定两行高度，超出隐藏 */
.subtitle-clip {
  flex: 1;
  min-width: 0;
  height: calc(1.5em * 2);   /* 精确两行 */
  overflow: hidden;
}

/* 内层文本：自然伸展，不做任何截断，滚动动画作用于此 */
.subtitle-text {
  display: block;
  line-height: 1.5;
  /* 滚动动画通过 JS 动态挂载，初始静止 */
}

/* 手机端纵向滚动关键帧 */
@keyframes subtitle-scroll {
  0%   { transform: translateY(0); }
  12%  { transform: translateY(0); }                          /* 开头停留 */
  88%  { transform: translateY(var(--scroll-dist, 0px)); }    /* 滚到底 */
  100% { transform: translateY(var(--scroll-dist, 0px)); }    /* 结尾停留 */
}

@media (max-width: 768px) {
  .top-hud-panel {
    top: 14px;
    width: 86vw !important;
  }

  .subtitle-box {
    font-size: 12px;
    padding: 8px 14px;
    border-radius: 20px;
    align-items: flex-start;
  }

  .subtitle-clip {
    height: calc(1.5em * 2);  /* 手机端也是固定两行 */
    overflow: hidden;
  }
}

.scene-num {
  color: rgba(0, 255, 204, 0.5);
  font-weight: bold;
}

/* ==================== 极客控制侧边栏 ==================== */
.drawer-trigger {
  position: absolute;
  top: 20px;
  left: 20px;
  width: 44px;
  height: 44px;
  background: rgba(15, 18, 30, 0.8);
  border: 1px solid rgba(0, 255, 204, 0.4);
  border-radius: 12px;
  color: #00ffcc;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  z-index: 15;
  box-shadow: 0 0 15px rgba(0, 255, 204, 0.2);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.drawer-trigger:hover, .drawer-trigger.drawer-open {
  transform: scale(1.08);
  border-color: #00ffcc;
  background: rgba(0, 255, 204, 0.2);
  box-shadow: 0 0 20px rgba(0, 255, 204, 0.4);
}

.menu-icon {
  font-size: 20px;
  font-weight: bold;
}

.drawer {
  position: absolute;
  top: 0;
  left: -320px;
  width: 300px;
  height: 100%;
  background: rgba(11, 13, 22, 0.95);
  border-right: 1px solid rgba(0, 255, 204, 0.3);
  box-shadow: 10px 0 35px rgba(0, 0, 0, 0.6);
  z-index: 14;
  transition: left 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  padding: 30px 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  backdrop-filter: blur(16px);
  overflow-y: auto;
}

.drawer::-webkit-scrollbar {
  width: 4px;
}

.drawer::-webkit-scrollbar-thumb {
  background: rgba(0, 255, 204, 0.3);
  border-radius: 2px;
}

.drawer.open {
  left: 0;
}

.drawer-title {
  margin: 0;
  color: #00ffcc;
  font-size: 16px;
  letter-spacing: 1px;
}

.cyber-divider {
  border: none;
  border-top: 1px solid rgba(0, 255, 204, 0.25);
  margin: 0;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.control-group label {
  font-size: 11px;
  color: #8c92ac;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.btn-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.btn {
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 6px;
  color: #ffffff;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;
  text-align: center;
}

.btn:hover, .btn.active {
  background: rgba(0, 255, 204, 0.15);
  border-color: #00ffcc;
  color: #00ffcc;
  box-shadow: 0 0 10px rgba(0, 255, 204, 0.2);
}

.btn.active-cyber {
  background: rgba(0, 255, 204, 0.25);
  border-color: #00ffcc;
  color: #00ffcc;
  font-weight: bold;
}

/* ==================== 极客图谱列表 ==================== */
.list-wrapper {
  max-height: 180px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-right: 4px;
}

.list-wrapper::-webkit-scrollbar {
  width: 4px;
}

.list-wrapper::-webkit-scrollbar-thumb {
  background: rgba(0, 255, 204, 0.3);
  border-radius: 2px;
}

.graph-item {
  border: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(255, 255, 255, 0.01);
  padding: 8px 10px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.25s ease;
}

.graph-item:hover {
  border-color: rgba(0, 255, 204, 0.35);
  background: rgba(0, 255, 204, 0.04);
}

.graph-item.active {
  border-color: #00ffcc;
  background: rgba(0, 255, 204, 0.1);
  box-shadow: 0 0 10px rgba(0, 255, 204, 0.15);
}

.graph-name {
  color: #ffffff;
  font-size: 12px;
  font-weight: bold;
}

.graph-path {
  display: block;
  font-size: 9px;
  color: #8c92ac;
  margin-top: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ==================== 屏幕中央 HUD 暂存框 ==================== */
.hud-speed-box {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 20;
  pointer-events: none;
}

.hud-inner {
  background: rgba(11, 13, 22, 0.9);
  border: 2px solid #00ffcc;
  box-shadow: 0 0 35px rgba(0, 255, 204, 0.35);
  padding: 16px 28px;
  border-radius: 16px;
  text-align: center;
  backdrop-filter: blur(8px);
}

.hud-label {
  color: rgba(0, 255, 204, 0.6);
  font-size: 10px;
  letter-spacing: 2px;
}

.hud-value {
  color: #ffffff;
  font-size: 26px;
  font-weight: bold;
  margin-top: 4px;
}

/* ==================== 底部状态栏 ==================== */
/* ==================== 移动端垂直位置滑块 ==================== */
.mobile-offset-group .slider-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

.slider-hint {
  font-size: 10px;
  color: rgba(0, 255, 204, 0.55);
  white-space: nowrap;
}

.cyber-slider {
  flex: 1;
  -webkit-appearance: none;
  appearance: none;
  height: 4px;
  border-radius: 2px;
  background: linear-gradient(to right, rgba(0,255,204,0.2), rgba(0,255,204,0.6));
  outline: none;
  cursor: pointer;
}
.cyber-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #00ffcc;
  box-shadow: 0 0 8px rgba(0, 255, 204, 0.8);
  cursor: pointer;
  border: 2px solid #0b0d16;
}
.cyber-slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #00ffcc;
  box-shadow: 0 0 8px rgba(0, 255, 204, 0.8);
  cursor: pointer;
  border: 2px solid #0b0d16;
}

.slider-value {
  text-align: center;
  font-size: 12px;
  color: #00ffcc;
  margin-top: 4px;
  letter-spacing: 0.05em;
}

.speed-indicator {
  position: absolute;
  bottom: 15px;
  right: 20px;
  background: rgba(11, 13, 22, 0.8);
  border: 1px solid rgba(0, 255, 204, 0.3);
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 11px;
  color: #00ffcc;
  z-index: 10;
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  gap: 8px;
  mix-blend-mode: screen;
}

.split {
  color: rgba(0, 255, 204, 0.3);
}

/* ==================== iframe 降级兼容层 ==================== */
.iframe-container {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 8;
  background: #080b14;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
