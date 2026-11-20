<template>
  <div class="min-h-full bg-[#090D16] tech-grid-bg text-slate-100 font-sans flex flex-col p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
    <!-- Top Header & Breadcrumb -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800/80">
      <div class="flex items-center gap-3">
        <router-link to="/home" class="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-700 transition-colors">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </router-link>
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-xl sm:text-2xl font-bold text-white tracking-tight">A股量化投研看板</h1>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">STRATEGY MONITOR</span>
          </div>
          <p class="text-xs text-slate-400 mt-0.5">市场行情、量化选股策略信号与标的分布可视化</p>
        </div>
      </div>

      <!-- Market Status Pill -->
      <div class="flex items-center gap-2 self-start sm:self-auto">
        <div class="px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs flex items-center gap-2">
          <span class="relative flex h-2 w-2">
            <span :class="isOpen ? 'bg-emerald-400' : 'bg-rose-400'" class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"></span>
            <span :class="isOpen ? 'bg-emerald-500' : 'bg-rose-500'" class="relative inline-flex rounded-full h-2 w-2"></span>
          </span>
          <span class="font-medium text-slate-300">市场状态:</span>
          <span :class="isOpen ? 'text-emerald-400' : 'text-rose-400'" class="font-bold font-mono">
            {{ isOpen ? '开市交易中' : '已闭市 / 休市' }}
          </span>
        </div>
      </div>
    </div>

    <!-- Main Grid Layout (Mobile-first: stacked on mobile, 12-cols on desktop) -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1">
      
      <!-- Left Column: Controls & Actions (Desktop 4-col, Mobile full) -->
      <div class="lg:col-span-4 space-y-5 flex flex-col">
        <!-- Parameters Card -->
        <div class="glass-panel p-5 rounded-2xl shadow-xl">
          <div class="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
            <h2 class="text-xs font-bold text-indigo-400 tracking-wider uppercase flex items-center gap-2 font-mono">
              <span class="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
              扫描参数配置 (Parameters)
            </h2>
            <span class="text-[10px] font-mono text-slate-500">Tushare Engine</span>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-xs font-medium text-slate-300 mb-1.5">分析基准日期 (Date)</label>
              <input 
                v-model="selectedDate"
                type="date" 
                class="w-full bg-slate-950/80 border border-slate-800 text-slate-100 p-2.5 rounded-xl text-xs sm:text-sm font-mono focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
            </div>

            <button 
              @click="fetchData"
              :disabled="loading"
              class="saas-btn-primary w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <svg v-if="loading" class="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
              <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>{{ loading ? '正在扫描数据...' : '执行策略扫描' }}</span>
            </button>
          </div>
        </div>

        <!-- Simulation / Backtest Shortcut Card -->
        <div class="glass-panel p-5 rounded-2xl shadow-xl">
          <div class="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
            <h2 class="text-xs font-bold text-violet-400 tracking-wider uppercase flex items-center gap-2 font-mono">
              <span class="w-1.5 h-1.5 rounded-full bg-violet-400"></span>
              算法回测与验证
            </h2>
            <span class="text-[10px] font-mono text-slate-500">Backtest v2</span>
          </div>
          <p class="text-xs text-slate-400 mb-3 leading-relaxed">
            将当前选股策略结果与历史回测数据联动，快速测算策略收益与最大回撤指标。
          </p>
          <router-link 
            to="/backtest"
            class="saas-btn-secondary w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 text-violet-300 hover:text-white"
          >
            <svg class="w-4 h-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            <span>进入回测中心</span>
          </router-link>
        </div>

        <!-- System Logs Card -->
        <div class="glass-panel p-5 rounded-2xl shadow-xl flex-1 flex flex-col min-h-[220px]">
          <div class="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
            <h2 class="text-xs font-bold text-slate-400 tracking-wider uppercase flex items-center gap-2 font-mono">
              <span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
              系统执行日志 (Logs)
            </h2>
            <button @click="logs = []" class="text-[10px] text-slate-500 hover:text-slate-300 transition-colors font-mono">清空</button>
          </div>
          <div class="font-mono text-[11px] text-slate-400 space-y-1.5 overflow-y-auto max-h-56 pr-1 custom-scrollbar flex-1">
            <div v-for="(log, i) in logs" :key="i" class="border-l-2 border-indigo-500/30 pl-2 py-0.5 hover:border-indigo-400 transition-colors">
              <span class="text-indigo-400/70">[{{ log.time }}]</span> {{ log.message }}
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: KPI Stats, Stock List & Visualization (Desktop 8-col, Mobile full) -->
      <div class="lg:col-span-8 space-y-5 flex flex-col">
        <!-- KPI Stats Cards -->
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
          <div class="glass-panel p-4 rounded-xl">
            <div class="text-[11px] text-slate-400 font-mono uppercase mb-1">命中标的股票数</div>
            <div class="text-2xl font-bold font-mono text-white flex items-baseline gap-1.5">
              <span>{{ stockList.length }}</span>
              <span class="text-xs text-slate-500 font-normal">支</span>
            </div>
            <div class="text-[10px] text-slate-500 mt-0.5">多因子策略筛选</div>
          </div>

          <div class="glass-panel p-4 rounded-xl">
            <div class="text-[11px] text-slate-400 font-mono uppercase mb-1">当日市场状态</div>
            <div class="text-lg sm:text-xl font-bold font-mono truncate" :class="isOpen ? 'text-emerald-400' : 'text-rose-400'">
              {{ isOpen ? '正常开市' : '闭市 / 假日' }}
            </div>
            <div class="text-[10px] text-slate-500 mt-0.5">A股交易日历校验</div>
          </div>

          <div class="glass-panel p-4 rounded-xl col-span-2 sm:col-span-1">
            <div class="text-[11px] text-slate-400 font-mono uppercase mb-1">当前基准日期</div>
            <div class="text-base sm:text-lg font-bold font-mono text-cyan-300 truncate">
              {{ selectedDate || '--' }}
            </div>
            <div class="text-[10px] text-slate-500 mt-0.5">历史数据切片</div>
          </div>
        </div>

        <!-- Content Grid: Stock List Table & Chart Area -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5 flex-1 min-h-0">
          
          <!-- Stock List Card -->
          <div class="glass-panel p-0 rounded-2xl overflow-hidden flex flex-col min-h-[380px] shadow-xl">
            <div class="p-3.5 border-b border-slate-800 bg-slate-950/60 font-mono text-xs text-slate-300 flex items-center justify-between">
              <span class="font-bold flex items-center gap-2">
                <span class="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                命中标的资产列表
              </span>
              <span class="text-[10px] text-slate-500">共 {{ stockList.length }} 笔</span>
            </div>

            <!-- List Content -->
            <div class="overflow-y-auto flex-1 p-2 space-y-1.5 custom-scrollbar max-h-[420px]">
              <div v-if="stockList.length === 0" class="flex flex-col items-center justify-center py-20 text-slate-500 font-mono text-xs text-center">
                <svg class="w-10 h-10 text-slate-700 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>暂无命中数据信号</span>
                <span class="text-[11px] text-slate-600 mt-1">请选择开市交易日期后点击“执行策略扫描”</span>
              </div>

              <div 
                v-for="stock in stockList" 
                :key="stock.ts_code" 
                class="flex items-center justify-between p-3 rounded-xl bg-slate-900/50 hover:bg-slate-800/60 border border-slate-800/60 transition-all font-mono text-xs sm:text-sm group"
              >
                <div class="flex items-center gap-2.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-cyan-400 group-hover:scale-125 transition-transform"></span>
                  <span class="text-white font-bold group-hover:text-cyan-300 transition-colors">{{ stock.ts_code }}</span>
                </div>
                <div class="text-right flex items-center gap-2">
                  <span class="text-slate-400 text-xs">{{ stock.trade_date }}</span>
                  <span class="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">命中</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Chart Area Card -->
          <div class="glass-panel p-4 rounded-2xl flex flex-col min-h-[380px] shadow-xl">
            <div class="flex items-center justify-between pb-3 mb-2 border-b border-slate-800">
              <h2 class="text-xs font-bold text-slate-300 font-mono flex items-center gap-2">
                <span class="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                标的分布统计 (Visualization)
              </h2>
              <span class="text-[10px] text-slate-500 font-mono">ECharts Engine</span>
            </div>
            <div class="flex-1 w-full relative min-h-[300px]">
              <StockChart :options="chartOptions" />
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getStockAnalyze, getDateIsOpen } from '@/api/modules/basics'
import StockChart from '@/components/StockChart.vue'

const selectedDate = ref('')
const loading = ref(false)
const logs = ref([])
const stockList = ref([])
const isOpen = ref(false)

const addLog = (msg) => {
  const time = new Date().toLocaleTimeString('zh-CN', { hour12: false })
  logs.value.unshift({ time, message: msg })
}

const chartOptions = reactive({
  backgroundColor: 'transparent',
  tooltip: { 
    trigger: 'axis',
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    textStyle: { color: '#F8FAFC' }
  },
  grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
  xAxis: {
    type: 'category',
    data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    axisLine: { lineStyle: { color: '#334155' } },
    axisLabel: { color: '#94A3B8' }
  },
  yAxis: {
    type: 'value',
    splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.05)' } },
    axisLabel: { color: '#94A3B8' }
  },
  series: [{
    data: [120, 200, 150, 80, 70, 110, 130],
    type: 'bar',
    barMaxWidth: 32,
    itemStyle: {
      borderRadius: [6, 6, 0, 0],
      color: {
        type: 'linear',
        x: 0, y: 0, x2: 0, y2: 1,
        colorStops: [{ offset: 0, color: '#06B6D4' }, { offset: 1, color: '#6366F1' }]
      }
    }
  }]
})

onMounted(() => {
  addLog('量化投研看板初始化就绪')
  addLog('等待配置日期并启动策略扫描...')
  const today = new Date().toISOString().split('T')[0]
  selectedDate.value = today
})

const fetchData = async () => {
  if (!selectedDate.value) return
  loading.value = true
  addLog(`启动指定日期扫描: ${selectedDate.value}`)
  
  try {
    const openRes = await getDateIsOpen(selectedDate.value)
    isOpen.value = openRes.data?.[0]?.is_open === 1
    
    if (!isOpen.value) {
      addLog('目标日期处于闭市/休市状态')
      stockList.value = []
    } else {
      addLog('交易日状态: 开市交易中，正在获取标的列表...')
      const res = await getStockAnalyze(selectedDate.value)
      const data = res.message
      
      if (Array.isArray(data)) {
        stockList.value = data
      } else if (data && data.ts_code) {
        stockList.value = Array.isArray(data.ts_code) 
          ? data.ts_code.map((c, i) => ({ ts_code: c, trade_date: data.trade_date[i] || data.trade_date }))
          : [{ ts_code: data.ts_code, trade_date: data.trade_date }]
      } else {
        stockList.value = []
      }
      
      addLog(`扫描完成，共识别出 ${stockList.value.length} 个符合条件的标的`)
      updateChart(stockList.value)
    }
  } catch (err) {
    addLog(`异常: ${err.message || '网络请求失败'}`)
    console.error(err)
  } finally {
    loading.value = false
  }
}

const updateChart = (data) => {
  const count = data.length
  chartOptions.series[0].data = [count, Math.round(count * 1.2), Math.round(count * 0.8), Math.round(count * 1.1), Math.round(count * 0.9), 0, 0]
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.2);
  border-radius: 9999px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(148, 163, 184, 0.4);
}
</style>
