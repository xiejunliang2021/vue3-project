<template>
  <div class="min-h-screen bg-scifi-bg text-gray-200 font-sans relative overflow-hidden flex flex-col">
     <!-- Hexagon grid background -->
     <div class="absolute inset-0 opacity-10 pointer-events-none" style="background-image: radial-gradient(#00F3FF 1px, transparent 1px); background-size: 30px 30px;"></div>
     
     <header class="h-16 border-b border-scifi-border bg-scifi-bg/90 backdrop-blur flex items-center justify-between px-6 z-20 relative shrink-0">
        <div class="flex items-center gap-4">
             <router-link to="/home" class="text-scifi-accent font-mono hover:text-white transition-colors flex items-center gap-2">
                <span class="text-xl">&lt;</span> PORTAL
             </router-link>
             <div class="h-6 w-px bg-scifi-border"></div>
             <h1 class="font-mono font-bold text-xl text-white tracking-wider">A-SHARE <span class="text-scifi-accent">DASHBOARD</span></h1>
        </div>
        <div class="flex items-center gap-4">
             <div class="px-3 py-1 border border-scifi-border rounded bg-scifi-glass text-xs font-mono text-scifi-accent flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-scifi-accent animate-pulse"></span>
                LIVE FEED
             </div>
        </div>
     </header>

     <main class="relative z-10 p-6 flex-1 overflow-hidden flex flex-col">
        <div class="grid grid-cols-12 gap-6 h-full">
            <!-- Sidebar / Control Panel -->
            <div class="col-span-3 space-y-6 flex flex-col h-full">
                <!-- Data Controls -->
                <div class="glass-panel p-4 rounded-lg bg-scifi-bg/50">
                    <h3 class="font-mono text-scifi-accent text-sm mb-4 border-b border-scifi-border/50 pb-2">PARAMETERS</h3>
                    
                    <div class="space-y-4">
                        <div>
                            <label class="block text-xs text-gray-400 font-mono mb-1">ANALYSIS DATE</label>
                            <input 
                                v-model="selectedDate"
                                type="date" 
                                class="w-full bg-black/40 border border-scifi-border/50 text-white p-2 text-sm font-mono focus:border-scifi-accent outline-none transition-colors"
                            />
                        </div>

                        <button 
                            @click="fetchData"
                            :disabled="loading"
                            class="w-full py-2 bg-scifi-accent/10 border border-scifi-accent text-scifi-accent hover:bg-scifi-accent/20 transition-all font-mono text-sm uppercase tracking-wider relative overflow-hidden group"
                        >
                            <span v-if="loading">SCANNING...</span>
                            <span v-else>INITIATE SCAN</span>
                            <div class="absolute bottom-0 left-0 h-1 bg-scifi-accent transition-all duration-1000" :style="{ width: loading ? '100%' : '0%' }"></div>
                        </button>
                    </div>
                </div>

                <!-- Run Backtest -->
                <div class="glass-panel p-4 rounded-lg bg-scifi-bg/50">
                    <h3 class="font-mono text-scifi-accent text-sm mb-4 border-b border-scifi-border/50 pb-2">SIMULATION</h3>
                    <button class="w-full py-2 bg-purple-500/10 border border-purple-500/50 text-purple-400 hover:bg-purple-500/20 transition-all font-mono text-sm">
                        RUN BACKTEST ALGORITHM
                    </button>
                </div>
                
                <!-- Logs -->
                 <div class="glass-panel p-4 rounded-lg bg-scifi-bg/50 flex-1 overflow-auto">
                    <h3 class="font-mono text-scifi-accent text-sm mb-4 border-b border-scifi-border/50 pb-2">SYSTEM LOGS</h3>
                    <div class="font-mono text-[10px] text-gray-400 space-y-1">
                        <p v-for="(log, i) in logs" :key="i" class="border-l-2 border-transparent pl-2 hover:border-scifi-accent transition-colors">
                            <span class="text-scifi-accent/50">[{{ log.time }}]</span> {{ log.message }}
                        </p>
                    </div>
                </div>
            </div>

            <!-- Main Display Area -->
            <div class="col-span-9 flex flex-col gap-6 h-full overflow-auto pr-2">
                 <!-- Stats Row -->
                 <div class="grid grid-cols-4 gap-4 shrink-0">
                     <div class="glass-panel p-4 rounded-lg">
                         <p class="text-xs text-gray-400 font-mono">TARGETS FOUND</p>
                         <p class="text-2xl text-white font-bold font-mono">{{ stockList.length }}</p>
                     </div>
                     <div class="glass-panel p-4 rounded-lg">
                         <p class="text-xs text-gray-400 font-mono">MARKET STATUS</p>
                         <p class="text-2xl font-bold font-mono" :class="isOpen ? 'text-green-400' : 'text-red-400'">{{ isOpen ? 'OPEN' : 'CLOSED' }}</p>
                     </div>
                 </div>

                 <!-- Content Grid -->
                 <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
                    <!-- Stock List Table -->
                    <div class="glass-panel p-0 rounded-lg overflow-hidden flex flex-col h-[500px]">
                        <div class="p-3 border-b border-scifi-border/30 bg-black/20 font-mono text-xs text-scifi-accent flex justify-between">
                            <span>IDENTIFIED ASSETS</span>
                            <span>TS_CODE // TRADE_DATE</span>
                        </div>
                        <div class="overflow-auto flex-1 p-2 space-y-1 custom-scrollbar">
                            <div v-if="stockList.length === 0" class="text-center py-20 text-gray-600 font-mono text-sm">
                                NO DATA SIGNAL RECEIVED
                            </div>
                            <div v-for="stock in stockList" :key="stock.ts_code" class="grid grid-cols-2 p-3 bg-black/20 hover:bg-scifi-accent/10 border-l-2 border-transparent hover:border-scifi-accent transition-all cursor-pointer font-mono text-sm">
                                <span class="text-white">{{ stock.ts_code }}</span>
                                <span class="text-gray-400 text-right">{{ stock.trade_date }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Chart Area -->
                    <div class="glass-panel p-4 rounded-lg border border-scifi-border flex flex-col h-[500px]">
                        <h3 class="font-mono text-scifi-accent text-xs mb-2">VISUALIZATION</h3>
                        <div class="flex-1 w-full relative">
                             <StockChart :options="chartOptions" />
                        </div>
                    </div>
                 </div>
            </div>
        </div>
     </main>
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
    const time = new Date().toLocaleTimeString('en-US', { hour12: false })
    logs.value.unshift({ time, message: msg })
}

const chartOptions = reactive({
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
        type: 'category',
        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        axisLine: { lineStyle: { color: '#4facfe' } },
        axisLabel: { color: '#a1a1a1' }
    },
    yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
        axisLabel: { color: '#a1a1a1' }
    },
    series: [{
        data: [120, 200, 150, 80, 70, 110, 130],
        type: 'bar',
        itemStyle: {
            color: {
                type: 'linear',
                x: 0, y: 0, x2: 0, y2: 1,
                colorStops: [{ offset: 0, color: '#00f2fe' }, { offset: 1, color: '#4facfe' }]
            }
        }
    }]
})

onMounted(() => {
    addLog('System initialized.')
    addLog('Waiting for user input...')
    // Set default date to today or yesterday?
    const today = new Date().toISOString().split('T')[0]
    selectedDate.value = today
})

const fetchData = async () => {
    if (!selectedDate.value) return
    loading.value = true
    addLog(`Initiating scan for date: ${selectedDate.value}`)
    
    try {
        // Check if Open
        const openRes = await getDateIsOpen(selectedDate.value)
        isOpen.value = openRes.data?.[0]?.is_open === 1
        
        if (!isOpen.value) {
            addLog('Market closed on selected date.')
            stockList.value = []
        } else {
            addLog('Market status: OPEN. Fetching ticker data...')
            const res = await getStockAnalyze(selectedDate.value)
            const data = res.message
            
            if (Array.isArray(data)) {
                stockList.value = data
            } else if (data && data.ts_code) {
                // Unified standard format
                stockList.value = Array.isArray(data.ts_code) 
                    ? data.ts_code.map((c, i) => ({ ts_code: c, trade_date: data.trade_date[i] || data.trade_date }))
                    : [{ ts_code: data.ts_code, trade_date: data.trade_date }]
            } else {
                stockList.value = []
            }
            
            addLog(`Scan complete. ${stockList.value.length} targets identified.`)
            updateChart(stockList.value)
        }
    } catch (err) {
        addLog(`ERROR: ${err.message}`)
        console.error(err)
    } finally {
        loading.value = false
    }
}

const updateChart = (data) => {
    // Determine what to visualize. For now, just count
    // Real implementation would look at specific metric distribution
    const count = data.length
    chartOptions.series[0].data = [count, count * 1.2, count * 0.8] // Dummy update
    // Update X-Axis or other props as real data comes in
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: var(--scifi-accent);
  opacity: 0.5;
}
</style>
