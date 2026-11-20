<template>
  <div class="aci-explainer-container flex flex-col justify-center items-center min-h-screen p-4 md:p-8 font-mono select-none relative overflow-hidden">
    
    <!-- 顶部 Neo-Brutalist 智能提词字幕面板 -->
    <div class="subtitle-banner bg-white border-[3px] border-black p-4 max-w-4xl w-full mb-6 shadow-[6px_6px_0px_#000] relative z-20 flex flex-col gap-2">
      <div class="flex justify-between items-center text-xs font-black border-b-2 border-black pb-2 text-black">
        <span>🎬 一人公司自动化 秒级分镜提词器</span>
        <span>{{ formattedCurrentTime }} / 120.0s</span>
      </div>
      <div class="text-sm md:text-base font-bold text-black min-h-[48px] flex items-center justify-center text-center px-2">
        {{ currentSubtitle }}
      </div>
    </div>

    <!-- 主极客演示面板（带有 0.9x 终幕收缩支持） -->
    <div 
      class="neo-board bg-white border-[3px] border-black p-6 md:p-10 max-w-4xl w-full relative flex flex-col md:flex-row justify-between items-center gap-8 shadow-[8px_8px_0px_#000] transition-transform duration-500"
      :style="{ transform: `scale(${state.globalScale})` }"
    >
      
      <!-- 左侧：AI 客户端 / AI 市场部 卡片 -->
      <div 
        id="left-card" 
        class="w-full md:w-[32%] bg-white border-[2.5px] border-black p-4 shadow-[4px_4px_0px_#000] relative z-10 transition-all duration-300"
        :style="{
          transform: `translateY(${state.leftCardY}px) scale(${state.leftCardScale})`,
          opacity: state.leftCardOpacity
        }"
      >
        <div class="flex items-center gap-2 border-b-2 border-black pb-2 mb-3">
          <div class="w-3 h-3 bg-red-500 rounded-full border border-black"></div>
          <div class="w-3 h-3 bg-yellow-400 rounded-full border border-black"></div>
          <div class="w-3 h-3 bg-green-400 rounded-full border border-black"></div>
          <span class="text-xs font-bold ml-auto text-black">{{ leftCardTag }}</span>
        </div>
        <h4 class="font-bold text-sm text-black mb-2">{{ leftCardTitle }}</h4>
        <div class="bg-gray-100 p-2 border border-black text-[10px] text-gray-700 leading-relaxed font-mono min-h-[70px]">
          <div v-for="(line, idx) in leftTerminalLines" :key="idx" class="truncate">
            {{ line }}
          </div>
        </div>
      </div>

      <!-- 中间：旋转的 ACI 钻石 & 虚线环 -->
      <div class="relative w-48 h-48 flex items-center justify-center">
        <!-- 流动连线粒子指示 -->
        <div v-if="state.showParticles" class="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div class="w-full h-[2px] bg-[#00FFF0] animate-pulse"></div>
        </div>

        <!-- 慢速自转的虚线环 -->
        <div 
          id="dashed-ring" 
          class="absolute w-40 h-40 border-[2.5px] border-dashed border-black rounded-full transition-transform"
          :style="{
            transform: `scale(${state.dashedRingScale}) rotate(${ringRotation}deg)`,
            borderColor: state.isAwakened ? '#FF2D78' : '#000'
          }"
        ></div>
        
        <!-- ACI 粉色菱形 (钻石) -->
        <div 
          id="aci-diamond" 
          class="relative w-16 h-16 bg-[#ff2d78] border-[3px] border-black rotate-45 flex items-center justify-center shadow-[4px_4px_0px_rgba(0,0,0,0.15)] transition-transform duration-300"
          :style="{
            transform: `rotate(45deg) scale(${state.diamondScale})`,
            boxShadow: state.isAwakened ? '0 0 25px #FF2D78' : '4px 4px 0px rgba(0,0,0,0.15)'
          }"
        >
          <!-- 内嵌旋转字符 -->
          <div class="rotate-[-45deg] text-white font-bold text-sm select-none">ACI</div>
        </div>
      </div>

      <!-- 右侧：接口假说 / AI 运营部 / AI 研发部 卡片 -->
      <div 
        id="right-card" 
        class="w-full md:w-[32%] bg-white border-[2.5px] border-black p-4 shadow-[4px_4px_0px_#000] relative z-10 transition-all duration-300"
        :style="{
          transform: `translateY(${state.rightCardY}px) scale(${state.rightCardScale})`,
          opacity: state.rightCardOpacity
        }"
      >
        <div class="flex items-center gap-2 border-b-2 border-black pb-2 mb-3">
          <span class="text-xs font-bold text-black">{{ rightCardTag }}</span>
        </div>
        <h4 class="font-bold text-sm text-black mb-3">{{ rightCardTitle }}</h4>
        
        <!-- 进度条 1 (绿色/客服响应率) -->
        <div class="mb-3">
          <div class="flex justify-between text-[11px] font-bold text-black mb-1">
            <span>{{ bar1Label }}</span>
            <span>{{ Math.floor(state.progress1) }}%</span>
          </div>
          <div class="h-4 bg-gray-200 border-2 border-black overflow-hidden">
            <div 
              class="h-full bg-[#39ff14] border-r border-black transition-all duration-100"
              :style="{ width: `${state.progress1Width}%` }"
            ></div>
          </div>
        </div>

        <!-- 进度条 2 (蓝色/自动化测试覆盖率) -->
        <div>
          <div class="flex justify-between text-[11px] font-bold text-black mb-1">
            <span>{{ bar2Label }}</span>
            <span>{{ Math.floor(state.progress2) }}%</span>
          </div>
          <div class="h-4 bg-gray-200 border-2 border-black overflow-hidden">
            <div 
              class="h-full bg-[#00b3ff] border-r border-black transition-all duration-100"
              :style="{ width: `${state.progress2Width}%` }"
            ></div>
          </div>
        </div>
      </div>

    </div>

    <!-- 底部 Neo-Brutalist 交互播放器控制栏 -->
    <div class="player-controls bg-white border-[3px] border-black p-4 max-w-4xl w-full mt-6 shadow-[6px_6px_0px_#000] flex flex-col md:flex-row items-center justify-between gap-4 z-20">
      <div class="flex items-center gap-3">
        <button 
          @click="togglePlay" 
          class="px-4 py-2 bg-[#ffd700] border-2 border-black font-black text-black text-xs shadow-[3px_3px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#000] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all cursor-pointer"
        >
          {{ isPlaying ? '⏸ 暂停' : '▶ 播放' }}
        </button>
        <button 
          @click="resetTimeline" 
          class="px-4 py-2 bg-gray-200 border-2 border-black font-black text-black text-xs shadow-[3px_3px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#000] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all cursor-pointer"
        >
          ↺ 重置
        </button>
      </div>

      <!-- 进度条滑块 -->
      <div class="flex items-center gap-2 w-full md:w-1/2">
        <span class="text-xs font-bold text-black">0s</span>
        <input 
          type="range" 
          min="0" 
          max="120" 
          step="0.1" 
          :value="currentTime" 
          @input="seekTime($event.target.value)" 
          class="w-full accent-black cursor-pointer"
        />
        <span class="text-xs font-bold text-black">120s</span>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue'
import gsap from 'gsap'

// 播放控制变量
const isPlaying = ref(false)
const currentTime = ref(0)
let timer = null

// 旋转角度
const ringRotation = ref(0)
let rotationTimer = null

// 响应式状态机变量 (由 reactive 统一绑定)
const state = reactive({
  globalScale: 1,
  
  leftCardY: 0,
  leftCardScale: 1,
  leftCardOpacity: 0,
  
  rightCardY: 0,
  rightCardScale: 1,
  rightCardOpacity: 0,
  
  diamondScale: 0.8,
  dashedRingScale: 1,
  isAwakened: false,
  
  progress1: 0,
  progress1Width: 0,
  
  progress2: 0,
  progress2Width: 0,

  showParticles: false
})

// 文案与数据绑定的标签
const leftCardTag = ref('CLIENT v1.0')
const leftCardTitle = ref('🤖 我们的 AI Agent')
const leftTerminalLines = ref(['[INIT] Loading Memory...', '[OK] Agent Core Online'])

const rightCardTag = ref('HYPOTHESIS')
const rightCardTitle = ref('📊 接口假说与模型参数')
const bar1Label = ref('LLM Parameter Match')
const bar2Label = ref('Interface Validation')

// 秒级分镜提词映射配置
const TIMELINE_CONFIG = [
  { start: 0.0, end: 13.0, text: "“一个人，零员工，只靠 3 个 AI 工具……今天直接上实操。”" },
  { start: 13.0, end: 32.0, text: "“为什么我们每天忙得像个陀螺……时薪连 20 块不到。”" },
  { start: 32.0, end: 43.0, text: "“一人公司的核心……指挥十个 AI 助手去干一百个人的活。”" },
  { start: 43.0, end: 60.0, text: "“第一，AI 市场部……直接生成符合我们人设的脚本和推文。”" },
  { start: 60.0, end: 76.0, text: "“第二，AI 运营部……3秒自动识别意图，24小时在线顶级客服。”" },
  { start: 76.5, end: 95.0, text: "“第三，AI 研发部……不仅帮你把代码写好，还能把测试跑通。”" },
  { start: 95.0, end: 110.0, text: "“整个链路跑通之后……剩下的全部由 AI 闭环执行。”" },
  { start: 110.0, end: 120.0, text: "“我们来算一笔账……关注我，回复‘一人公司’，一起开启超级个体之路。”" }
]

// 计算当前字幕
const currentSubtitle = computed(() => {
  const t = currentTime.value
  const item = TIMELINE_CONFIG.find(c => t >= c.start && t < c.end)
  return item ? item.text : "“一个人，零员工，开启超级个体之路。”"
})

// 格式化当前播放时间
const formattedCurrentTime = computed(() => {
  return `${currentTime.value.toFixed(1)}s`
})

// 监听时间轴精确卡点变阵
watch(currentTime, (t) => {
  // ─── 0.0s - 13.0s 序幕：ACI 钻石闪烁淡入 ─────────────────────────
  if (t >= 0.0 && t < 13.0) {
    state.globalScale = 1
    state.diamondScale = 1
    state.dashedRingScale = 1
    state.isAwakened = false
    state.leftCardOpacity = 1
    state.rightCardOpacity = 1
    state.leftCardScale = 1
    state.rightCardScale = 1
    state.leftCardY = 0
    state.rightCardY = 0
    state.showParticles = false
    
    leftCardTag.value = 'CLIENT v1.0'
    leftCardTitle.value = '🤖 我们的 AI Agent'
    leftTerminalLines.value = ['[INIT] Loading Memory...', '[OK] Agent Core Online', '[WAIT] Listening to ACI...']
    
    rightCardTag.value = 'HYPOTHESIS'
    rightCardTitle.value = '📊 接口假说与模型参数'
    bar1Label.value = 'LLM Parameter Match'
    bar2Label.value = 'Interface Validation'
  }
  
  // ─── 13.0s - 32.0s 执行陷阱：卡片缩小漂移颤动 ───────────────────────
  else if (t >= 13.0 && t < 32.0) {
    state.leftCardScale = 0.5
    state.rightCardScale = 0.5
    state.leftCardY = Math.sin(t * 3) * 10
    state.rightCardY = Math.cos(t * 3) * 10
    state.diamondScale = 0.8
    state.isAwakened = false
  }
  
  // ─── 32.0s - 43.0s 核心觉醒：推开杂乱，钻石猛烈放大 1.4 倍 ─────────
  else if (t >= 32.0 && t < 43.0) {
    state.leftCardScale = 0.3
    state.rightCardScale = 0.3
    state.leftCardOpacity = 0.2
    state.rightCardOpacity = 0.2
    state.diamondScale = 1.4
    state.dashedRingScale = 1.2
    state.isAwakened = true
  }
  
  // ─── 43.0s - 60.0s 第一：AI 市场部（雷霆之势砸入）─────────────────────
  else if (t >= 43.0 && t < 60.0) {
    state.leftCardOpacity = 1
    state.leftCardScale = 1
    state.leftCardY = 0
    state.diamondScale = 1.1
    state.isAwakened = true
    
    leftCardTag.value = 'MARKETING v2.0'
    leftCardTitle.value = '📢 AI 市场部'
    leftTerminalLines.value = ['[GEN] Generating Script...', '[OK] 脚本生成完成 (赛博风)', '[PUSH] 推文已就绪...']
  }
  
  // ─── 60.0s - 76.0s 第二：AI 运营部（客服响应率充能至 99%）───────────
  else if (t >= 60.0 && t < 76.5) {
    state.rightCardOpacity = 1
    state.rightCardScale = 1
    state.rightCardY = 0
    rightCardTag.value = 'OPERATIONS'
    rightCardTitle.value = '⚙️ AI 运营部'
    bar1Label.value = '客服响应率'
    
    // 进度条从 0 冲上 99%
    const progressProgress = Math.min(99, ((t - 60.0) / 3.0) * 99)
    state.progress1 = progressProgress
    state.progress1Width = progressProgress
  }
  
  // ─── 76.5s - 95.0s 第三：AI 研发部（测试覆盖率充能至 95%）───────────
  else if (t >= 76.5 && t < 95.0) {
    rightCardTag.value = 'DEV & QA'
    rightCardTitle.value = '🧪 AI 研发部'
    bar2Label.value = '自动化测试覆盖率'
    
    const progressProgress2 = Math.min(95, ((t - 76.5) / 3.0) * 95)
    state.progress2 = progressProgress2
    state.progress2Width = progressProgress2
  }
  
  // ─── 95.0s - 110.0s 全链路闭环：高频数据粒子流 ─────────────────────
  else if (t >= 95.0 && t < 110.0) {
    state.showParticles = true
    state.diamondScale = 1.2
    state.isAwakened = true
  }
  
  // ─── 110.0s - 120.0s 终幕收盘：收缩至 0.9x 留白黄金比例 ─────────────
  else if (t >= 110.0) {
    state.globalScale = 0.9
    state.showParticles = false
  }
})

// 播放控制
function togglePlay() {
  isPlaying.value = !isPlaying.value
  if (isPlaying.value) {
    timer = setInterval(() => {
      if (currentTime.value < 120) {
        currentTime.value += 0.1
      } else {
        isPlaying.value = false
        clearInterval(timer)
      }
    }, 100)
  } else {
    if (timer) clearInterval(timer)
  }
}

function resetTimeline() {
  if (timer) clearInterval(timer)
  isPlaying.value = false
  currentTime.value = 0
}

function seekTime(val) {
  currentTime.value = parseFloat(val)
}

onMounted(() => {
  // 启动自转
  rotationTimer = setInterval(() => {
    ringRotation.value = (ringRotation.value + (state.isAwakened ? 4 : 1)) % 360
  }, 30)
  
  // 默认自动播放启动
  togglePlay()
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
  if (rotationTimer) clearInterval(rotationTimer)
})
</script>

<style scoped>
.aci-explainer-container {
  background-color: #f5f4eb;
}
</style>
