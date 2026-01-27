<template>
  <div class="backtest-view">
    <!-- Header Section -->
    <div class="header-section">
      <div class="header-content">
        <div class="title-area">
          <h1 class="page-title">
            <el-icon class="title-icon"><TrendCharts /></el-icon>
            回测中心
          </h1>
          <p class="page-subtitle">量化策略回测与绩效分析</p>
        </div>
        <el-button type="primary" size="large" @click="showCreateDialog = true">
          <el-icon><Plus /></el-icon>
          新建回测
        </el-button>
      </div>
    </div>

    <!-- Filters Section -->
    <div class="filters-section">
      <el-form :inline="true" :model="filters" class="filter-form">
        <el-form-item label="策略类型">
          <el-select v-model="filters.strategy_type" placeholder="全部策略" clearable style="width: 160px">
            <el-option label="龙回头" value="龙回头" />
            <el-option label="连续涨停" value="连续涨停" />
          </el-select>
        </el-form-item>
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="filters.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 280px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadBacktestList">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button @click="resetFilters">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="3" animated />
    </div>

    <!-- Backtest Cards Grid -->
    <div v-else-if="backtestList.length > 0" class="backtest-grid">
      <div
        v-for="backtest in backtestList"
        :key="backtest.id"
        class="backtest-card"
        @click="showDetail(backtest)"
      >
        <div class="card-header">
          <h3 class="card-title">{{ backtest.strategy_name }}</h3>
          <el-tag :type="getReturnTagType(backtest.total_return)" size="large">
            {{ formatPercent(backtest.total_return) }}
          </el-tag>
        </div>
        
        <div class="card-body">
          <div class="metric-row">
            <div class="metric-item">
              <span class="metric-label">初始资金</span>
              <span class="metric-value">{{ formatCurrency(backtest.initial_capital) }}</span>
            </div>
            <div class="metric-item">
              <span class="metric-label">最终资金</span>
              <span class="metric-value" :class="getProfitClass(backtest.total_profit)">
                {{ formatCurrency(backtest.final_capital) }}
              </span>
            </div>
          </div>
          
          <div class="metric-row">
            <div class="metric-item">
              <span class="metric-label">总盈利</span>
              <span class="metric-value" :class="getProfitClass(backtest.total_profit)">
                {{ formatCurrency(backtest.total_profit) }}
              </span>
            </div>
            <div class="metric-item">
              <span class="metric-label">最大回撤</span>
              <span class="metric-value loss">{{ formatPercent(backtest.max_drawdown) }}</span>
            </div>
          </div>
          
          <div class="metric-row">
            <div class="metric-item">
              <span class="metric-label">交易次数</span>
              <span class="metric-value">{{ backtest.total_trades }}</span>
            </div>
            <div class="metric-item">
              <span class="metric-label">胜率</span>
              <span class="metric-value">{{ formatPercent(backtest.win_rate) }}</span>
            </div>
          </div>
        </div>
        
        <div class="card-footer">
          <span class="date-range">
            <el-icon><Calendar /></el-icon>
            {{ backtest.start_date }} ~ {{ backtest.end_date }}
          </span>
          <span class="created-time">{{ formatDateTime(backtest.created_at) }}</span>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <el-empty v-else description="暂无回测记录" :image-size="200">
      <el-button type="primary" @click="showCreateDialog = true">创建第一个回测</el-button>
    </el-empty>

    <!-- Create Backtest Dialog -->
    <BacktestFormDialog
      v-model="showCreateDialog"
      @success="handleCreateSuccess"
    />

    <!-- Detail Dialog -->
    <BacktestDetailDialog
      v-model="showDetailDialog"
      :backtest="selectedBacktest"
      @deleted="handleBacktestDeleted"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getPortfolioBacktestList } from '@/api/modules/backtest'
import BacktestFormDialog from '@/components/backtest/BacktestFormDialog.vue'
import BacktestDetailDialog from '@/components/backtest/BacktestDetailDialog.vue'

const loading = ref(false)
const backtestList = ref([])
const showCreateDialog = ref(false)
const showDetailDialog = ref(false)
const selectedBacktest = ref(null)

const filters = reactive({
  strategy_type: '',
  dateRange: null
})

// Load backtest list
const loadBacktestList = async () => {
  loading.value = true
  try {
    const params = {}
    if (filters.strategy_type) {
      params.strategy_type = filters.strategy_type
    }
    if (filters.dateRange && filters.dateRange.length === 2) {
      params.start_date = filters.dateRange[0]
      params.end_date = filters.dateRange[1]
    }
    
    const response = await getPortfolioBacktestList(params)
    console.log('API Response:', response)
    
    // DRF ListAPIView returns array directly, not wrapped in {data: [...]}
    if (Array.isArray(response)) {
      backtestList.value = response
    } else if (response.data && Array.isArray(response.data)) {
      backtestList.value = response.data
    } else if (response.results && Array.isArray(response.results)) {
      // Handle paginated response
      backtestList.value = response.results
    } else {
      console.error('Unexpected response format:', response)
      backtestList.value = []
    }
    
    console.log('Backtest list loaded:', backtestList.value.length, 'records')
  } catch (error) {
    console.error('加载回测列表失败:', error)
    console.error('Error details:', error.response?.data)
    ElMessage.error('加载回测列表失败')
    backtestList.value = []
  } finally {
    loading.value = false
  }
}

// Reset filters
const resetFilters = () => {
  filters.strategy_type = ''
  filters.dateRange = null
  loadBacktestList()
}

// Show detail
const showDetail = (backtest) => {
  selectedBacktest.value = backtest
  showDetailDialog.value = true
}

// Handle create success
const handleCreateSuccess = () => {
  loadBacktestList()
}

// Handle backtest deleted
const handleBacktestDeleted = (deletedId) => {
  // 从列表中移除已删除的回测
  backtestList.value = backtestList.value.filter(item => item.id !== deletedId)
  console.log(`回测 ID ${deletedId} 已从列表中移除`)
}

// Format helpers
const formatCurrency = (value) => {
  return `¥${Number(value).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const formatPercent = (value) => {
  const num = Number(value) * 100
  return `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`
}

const formatDateTime = (dateStr) => {
  return new Date(dateStr).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getReturnTagType = (value) => {
  return Number(value) >= 0 ? 'success' : 'danger'
}

const getProfitClass = (value) => {
  return Number(value) >= 0 ? 'profit' : 'loss'
}

onMounted(() => {
  loadBacktestList()
})
</script>

<style scoped>
.backtest-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
  padding: 2rem;
}

.header-section {
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.title-area {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 2rem;
  font-weight: 700;
  color: #fff;
  margin: 0;
}

.title-icon {
  font-size: 2rem;
  color: #3B82F6;
}

.page-subtitle {
  color: #94A3B8;
  font-size: 0.95rem;
  margin: 0;
}

.filters-section {
  margin-bottom: 2rem;
  padding: 1.5rem 2rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.filter-form {
  margin: 0;
}

.loading-container {
  padding: 2rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
}

.backtest-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 1.5rem;
}

.backtest-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.backtest-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
  border-color: rgba(59, 130, 246, 0.5);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #fff;
  margin: 0;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1rem;
}

.metric-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.metric-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.metric-label {
  font-size: 0.85rem;
  color: #94A3B8;
}

.metric-value {
  font-size: 1.1rem;
  font-weight: 600;
  color: #E2E8F0;
}

.metric-value.profit {
  color: #10B981;
}

.metric-value.loss {
  color: #EF4444;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 0.85rem;
  color: #64748B;
}

.date-range {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.created-time {
  font-style: italic;
}

/* Dark theme adjustments for Element Plus */
:deep(.el-form-item__label) {
  color: #94A3B8;
}

:deep(.el-input__wrapper) {
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

:deep(.el-input__inner) {
  color: #E2E8F0;
}

:deep(.el-select__placeholder) {
  color: #64748B;
}

:deep(.el-empty__description p) {
  color: #94A3B8;
}

/* Responsive */
@media (max-width: 768px) {
  .backtest-view {
    padding: 1rem;
  }
  
  .header-content {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .backtest-grid {
    grid-template-columns: 1fr;
  }
  
  .filter-form {
    display: flex;
    flex-direction: column;
  }
}
</style>
