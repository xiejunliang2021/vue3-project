<template>
  <div class="min-h-screen bg-scifi-bg text-gray-200 font-sans relative overflow-hidden flex flex-col">
     <!-- Hexagon grid background -->
     <div class="absolute inset-0 opacity-10 pointer-events-none" style="background-image: radial-gradient(#00F3FF 1px, transparent 1px); background-size: 30px 30px;"></div>
     
     <header class="h-16 border-b border-scifi-border bg-scifi-bg/90 backdrop-blur flex items-center justify-between px-4 md:px-6 z-20 relative shrink-0">
        <div class="flex items-center gap-2 md:gap-4">
             <router-link to="/home" class="text-scifi-accent font-mono hover:text-white transition-colors flex items-center gap-1 md:gap-2 text-sm md:text-base">
                <span class="text-xl">&lt;</span> PORTAL
             </router-link>
             <div class="h-6 w-px bg-scifi-border hidden md:block"></div>
             <h1 class="font-mono font-bold text-base md:text-xl text-white tracking-wider hidden sm:block">STRATEGY <span class="text-scifi-accent">RESULTS</span></h1>
             <h1 class="font-mono font-bold text-sm text-white sm:hidden">STRATEGY</h1>
        </div>
        <div class="flex items-center gap-2 md:gap-4">
             <button @click="fetchData" class="px-2 md:px-4 py-1 border border-scifi-accent text-scifi-accent hover:bg-scifi-accent/10 font-mono text-xs md:text-sm transition-colors">
                REFRESH
             </button>
        </div>
     </header>

     <main class="relative z-10 p-3 md:p-6 flex-1 overflow-hidden flex flex-col gap-4">
        <div class="glass-panel p-0 rounded-lg overflow-hidden flex flex-col flex-1 border border-scifi-border/50">
            <!-- Custom Table Header - hide on mobile, show only on tablets and up -->
            <div class="hidden md:grid grid-cols-8 p-4 border-b border-scifi-border bg-black/40 font-mono text-xs text-scifi-accent uppercase tracking-wider">
                <div class="col-span-1">Date</div>
                <div class="col-span-1">Stock</div>
                <div class="col-span-1">Strategy</div>
                <div class="col-span-1">Status</div>
                <div class="col-span-1 text-right">Buy 1</div>
                <div class="col-span-1 text-right">Buy 2</div>
                <div class="col-span-1 text-right">Stop Loss</div>
                <div class="col-span-1 text-center">Strength</div>
            </div>

            <!-- Table Body -->
            <div class="overflow-auto flex-1 custom-scrollbar">
                <div v-if="loading" class="flex items-center justify-center h-40">
                    <span class="animate-pulse text-scifi-accent font-mono text-sm">LOADING...</span>
                </div>
                
                <div v-else-if="policyList.length === 0" class="flex items-center justify-center h-40 text-gray-500 font-mono text-sm">
                    NO RECORDS
                </div>

                <template v-else>
                    <!-- Desktop View (md and up) -->
                    <div class="hidden md:block">
                        <div v-for="(item, index) in policyList" :key="index" 
                             class="grid grid-cols-8 p-3 border-b border-scifi-border/10 hover:bg-scifi-accent/5 transition-colors font-mono text-sm items-center">
                            <div class="col-span-1 text-gray-300">{{ item.date }}</div>
                            <div class="col-span-1">
                                <span class="text-white font-bold">{{ item.stock_name || item.stock }}</span>
                                <span class="block text-[10px] text-gray-500">{{ typeof item.stock === 'object' ? item.stock.ts_code : item.stock }}</span>
                            </div>
                            <div class="col-span-1 text-scifi-accent/80">{{ item.strategy_type }}</div>
                            <div class="col-span-1">
                                <span :class="getStatusClass(item.current_status)" class="px-2 py-0.5 rounded text-[10px] border">
                                    {{ getStatusLabel(item.current_status) }}
                                </span>
                            </div>
                            <div class="col-span-1 text-right text-gray-300">{{ formatPrice(item.first_buy_point) }}</div>
                            <div class="col-span-1 text-right text-gray-400">{{ formatPrice(item.second_buy_point) }}</div>
                            <div class="col-span-1 text-right text-red-400/80">{{ formatPrice(item.stop_loss_point) }}</div>
                            <div class="col-span-1 text-center">
                                 <div class="w-16 h-1 bg-gray-700 mx-auto rounded overflow-hidden">
                                     <div class="h-full bg-scifi-accent" :style="{ width: getStrengthWidth(item.signal_strength) }"></div>
                                 </div>
                            </div>
                        </div>
                    </div>

                    <!-- Mobile View (< md) -->
                    <div class="md:hidden">
                        <div v-for="(item, index) in policyList" :key="index" 
                             class="p-4 border-b border-scifi-border/10 hover:bg-scifi-accent/5 transition-colors">
                            <div class="flex justify-between items-start mb-2">
                                <div>
                                    <div class="text-white font-bold font-mono text-sm">{{ item.stock_name || item.stock }}</div>
                                    <div class="text-[10px] text-gray-500 font-mono">{{ typeof item.stock === 'object' ? item.stock.ts_code : item.stock }}</div>
                                </div>
                                <span :class="getStatusClass(item.current_status)" class="px-2 py-0.5 rounded text-[10px] border font-mono">
                                    {{ getStatusLabel(item.current_status) }}
                                </span>
                            </div>
                            <div class="grid grid-cols-2 gap-2 text-xs font-mono">
                                <div><span class="text-gray-500">Date:</span> <span class="text-gray-300">{{ item.date }}</span></div>
                                <div><span class="text-gray-500">Strategy:</span> <span class="text-scifi-accent/80">{{ item.strategy_type }}</span></div>
                                <div><span class="text-gray-500">Buy 1:</span> <span class="text-gray-300">{{ formatPrice(item.first_buy_point) }}</span></div>
                                <div><span class="text-gray-500">Buy 2:</span> <span class="text-gray-400">{{ formatPrice(item.second_buy_point) }}</span></div>
                                <div><span class="text-gray-500">Stop:</span> <span class="text-red-400/80">{{ formatPrice(item.stop_loss_point) }}</span></div>
                                <div class="flex items-center gap-2">
                                    <span class="text-gray-500">Strength:</span>
                                    <div class="w-12 h-1 bg-gray-700 rounded overflow-hidden">
                                        <div class="h-full bg-scifi-accent" :style="{ width: getStrengthWidth(item.signal_strength) }"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </template>
            </div>
        </div>

        <!-- Pagination Controls -->
        <div class="glass-panel p-3 md:p-4 rounded-lg border border-scifi-border/50 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-sm">
            <div class="text-gray-400 text-xs md:text-sm">
                Total: <span class="text-scifi-accent">{{ totalCount }}</span> | 
                Page <span class="text-scifi-accent">{{ currentPage }}</span> / <span class="text-scifi-accent">{{ totalPages }}</span>
            </div>
            
            <div class="flex items-center gap-2 flex-wrap justify-center">
                <button @click="goToPage(1)" :disabled="currentPage === 1" 
                        class="px-2 md:px-3 py-1 border border-scifi-accent/50 text-scifi-accent hover:bg-scifi-accent/10 disabled:opacity-30 disabled:cursor-not-allowed text-xs md:text-sm transition-colors">
                    &lt;&lt;
                </button>
                <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 1" 
                        class="px-2 md:px-3 py-1 border border-scifi-accent/50 text-scifi-accent hover:bg-scifi-accent/10 disabled:opacity-30 disabled:cursor-not-allowed text-xs md:text-sm transition-colors">
                    &lt; PREV
                </button>
                
                <div class="flex items-center gap-2">
                    <span class="text-gray-500 text-xs">GO TO:</span>
                    <input v-model.number="pageInput" @keyup.enter="goToInputPage" 
                           type="number" min="1" :max="totalPages"
                           class="w-12 md:w-16 px-2 py-1 bg-black/50 border border-scifi-border text-scifi-accent text-center text-xs md:text-sm focus:border-scifi-accent outline-none">
                    <button @click="goToInputPage" 
                            class="px-2 md:px-3 py-1 bg-scifi-accent/20 border border-scifi-accent text-scifi-accent hover:bg-scifi-accent/30 text-xs md:text-sm transition-colors">
                        GO
                    </button>
                </div>
                
                <button @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages" 
                        class="px-2 md:px-3 py-1 border border-scifi-accent/50 text-scifi-accent hover:bg-scifi-accent/10 disabled:opacity-30 disabled:cursor-not-allowed text-xs md:text-sm transition-colors">
                    NEXT &gt;
                </button>
                <button @click="goToPage(totalPages)" :disabled="currentPage === totalPages" 
                        class="px-2 md:px-3 py-1 border border-scifi-accent/50 text-scifi-accent hover:bg-scifi-accent/10 disabled:opacity-30 disabled:cursor-not-allowed text-xs md:text-sm transition-colors">
                    &gt;&gt;
                </button>
            </div>
        </div>
     </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { getPolicyDetails } from '@/api/modules/basics'

const policyList = ref([])
const loading = ref(false)
const currentPage = ref(1)
const totalCount = ref(0)
const pageSize = ref(20) // 每页显示20条
const pageInput = ref(1)

const totalPages = computed(() => {
    return Math.ceil(totalCount.value / pageSize.value) || 1
})

const fetchData = async (page = currentPage.value) => {
    loading.value = true
    try {
        console.log('开始获取策略数据...')
        const startTime = Date.now()
        
        currentPage.value = page
        const response = await getPolicyDetails({ 
            page: page,
            page_size: pageSize.value 
        })
        
        const duration = Date.now() - startTime
        console.log(`请求耗时: ${duration}ms`)
        console.log('完整响应:', response)
        
        // 处理DRF分页响应
        if (response.results) {
            policyList.value = response.results
            totalCount.value = response.count || 0
        } else if (Array.isArray(response)) {
            policyList.value = response
            totalCount.value = response.length
        } else if (response.data) {
            policyList.value = response.data
            totalCount.value = response.data.length
        } else {
            console.warn('未识别的响应结构:', response)
            policyList.value = []
            totalCount.value = 0
        }
        
        console.log('数据数量:', policyList.value.length)
        console.log('总计数:', totalCount.value)
    } catch (error) {
        console.error('获取策略详情失败:', error)
        console.error('错误代码:', error.code)
    } finally {
        loading.value = false
    }
}

const goToPage = (page) => {
    if (page < 1 || page > totalPages.value) return
    fetchData(page)
}

const goToInputPage = () => {
    const page = parseInt(pageInput.value)
    if (isNaN(page) || page < 1 || page > totalPages.value) {
        pageInput.value = currentPage.value
        return
    }
    goToPage(page)
}

const formatPrice = (price) => {
    return price ? parseFloat(price).toFixed(2) : '-'
}

const getStatusLabel = (status) => {
    const map = {
        'L': 'LIVE',
        'S': 'SUCCESS',
        'F': 'FAILED',
        'W': 'WAITING'
    }
    return map[status] || status || 'UNKNOWN'
}

const getStatusClass = (status) => {
    const map = {
        'L': 'border-blue-500 text-blue-400 bg-blue-500/10',
        'S': 'border-green-500 text-green-400 bg-green-500/10',
        'F': 'border-red-500 text-red-400 bg-red-500/10',
        'W': 'border-yellow-500 text-yellow-400 bg-yellow-500/10'
    }
    return map[status] || 'border-gray-500 text-gray-400'
}

const getStrengthWidth = (strength) => {
    if (strength === 'H' || strength === 'high') return '100%'
    if (strength === 'M' || strength === 'medium') return '60%'
    if (strength === 'L' || strength === 'low') return '30%'
    return '0%'
}

onMounted(() => {
    fetchData(1)
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: var(--scifi-accent);
  opacity: 0.5;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(0,0,0,0.3);
}
</style>
