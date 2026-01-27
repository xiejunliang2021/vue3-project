<template>
  <el-dialog
    v-model="dialogVisible"
    :title="backtest?.strategy_name || '回测详情'"
    width="90%"
    top="5vh"
    :close-on-click-modal="false"
  >
    <template #header>
      <div class="dialog-header">
        <span class="dialog-title">{{ backtest?.strategy_name || '回测详情' }}</span>
        <el-button 
          type="danger" 
          size="small" 
          @click="handleDelete"
          :icon="Delete"
        >
          删除回测
        </el-button>
      </div>
    </template>
    <div v-if="backtest" class="detail-container">
      <!-- Performance Metrics -->
      <div class="metrics-section">
        <h3 class="section-title">
          <el-icon><DataAnalysis /></el-icon>
          绩效指标
        </h3>
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-icon profit">
              <el-icon><TrendCharts /></el-icon>
            </div>
            <div class="metric-content">
              <span class="metric-label">总收益率</span>
              <span class="metric-value" :class="getProfitClass(backtest.total_return)">
                {{ formatPercent(backtest.total_return) }}
              </span>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-icon">
              <el-icon><Coin /></el-icon>
            </div>
            <div class="metric-content">
              <span class="metric-label">总盈利</span>
              <span class="metric-value" :class="getProfitClass(backtest.total_profit)">
                {{ formatCurrency(backtest.total_profit) }}
              </span>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-icon loss">
              <el-icon><Bottom /></el-icon>
            </div>
            <div class="metric-content">
              <span class="metric-label">最大回撤</span>
              <span class="metric-value loss">
                {{ formatPercent(backtest.max_drawdown) }}
              </span>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-icon">
              <el-icon><Histogram /></el-icon>
            </div>
            <div class="metric-content">
              <span class="metric-label">胜率</span>
              <span class="metric-value">
                {{ formatPercent(backtest.win_rate) }}
              </span>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-icon">
              <el-icon><Document /></el-icon>
            </div>
            <div class="metric-content">
              <span class="metric-label">总交易次数</span>
              <span class="metric-value">{{ backtest.total_trades }}</span>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-icon profit">
              <el-icon><CircleCheck /></el-icon>
            </div>
            <div class="metric-content">
              <span class="metric-label">盈利次数</span>
              <span class="metric-value profit">{{ backtest.winning_trades }}</span>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-icon loss">
              <el-icon><CircleClose /></el-icon>
            </div>
            <div class="metric-content">
              <span class="metric-label">亏损次数</span>
              <span class="metric-value loss">{{ backtest.losing_trades }}</span>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-icon">
              <el-icon><Money /></el-icon>
            </div>
            <div class="metric-content">
              <span class="metric-label">最终资金</span>
              <span class="metric-value">{{ formatCurrency(backtest.final_capital) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Trade Logs -->
      <div class="trades-section">
        <h3 class="section-title">
          <el-icon><List /></el-icon>
          交易日志
          <el-tag v-if="tradeLogs.length > 0" type="info" size="small">
            共 {{ tradeLogs.length }} 笔交易
          </el-tag>
        </h3>

        <el-table
          v-loading="loadingTrades"
          :data="tradeLogs"
          stripe
          :header-cell-style="{ background: 'rgba(255,255,255,0.05)', color: '#94A3B8' }"
          :row-class-name="getRowClassName"
          max-height="400"
        >
          <el-table-column prop="stock_code" label="股票代码" width="110" fixed align="center" />
          <el-table-column prop="buy_date" label="买入日期" width="110" align="center" />
          <el-table-column prop="buy_price" label="买入价" width="90" align="right">
            <template #default="{ row }">
              ¥{{ Number(row.buy_price).toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column prop="sell_date" label="卖出日期" width="110" align="center" />
          <el-table-column prop="sell_price" label="卖出价" width="90" align="right">
            <template #default="{ row }">
              ¥{{ Number(row.sell_price).toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column prop="quantity" label="数量" width="90" align="right" />
          <el-table-column prop="hold_days" label="持仓天数" width="100" align="center" />
          <el-table-column prop="profit" label="盈亏" width="110" align="right">
            <template #default="{ row }">
              <span :class="getProfitClass(row.profit)">
                {{ formatCurrency(row.profit) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="return_rate" label="收益率" width="100" align="right">
            <template #default="{ row }">
              <span :class="getProfitClass(row.return_rate)">
                {{ formatPercent(row.return_rate) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="sell_reason_display" label="卖出原因" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="getSellReasonType(row.sell_reason)" size="small">
                {{ row.sell_reason_display || getSellReasonText(row.sell_reason) }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete } from '@element-plus/icons-vue'
import { getTradeLogList, deletePortfolioBacktest } from '@/api/modules/backtest'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  backtest: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'deleted'])

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const loadingTrades = ref(false)
const tradeLogs = ref([])

// Load trade logs when dialog opens
watch(() => props.modelValue, async (newVal) => {
  if (newVal && props.backtest?.id) {
    await loadTradeLogs()
  }
})

const loadTradeLogs = async () => {
  loadingTrades.value = true
  try {
    console.log('开始加载交易日志, backtest ID:', props.backtest.id)
    const response = await getTradeLogList(props.backtest.id)
    console.log('交易日志 API 响应:', response)
    
    // 处理不同的响应格式
    // DRF 分页格式: {count, next, previous, results}
    if (response.results && Array.isArray(response.results)) {
      tradeLogs.value = response.results
      console.log(`解析后的交易日志数量: ${response.results.length} / 总数: ${response.count}`)
      if (response.next) {
        console.warn('注意: 还有更多交易日志,当前只显示第一页')
        ElMessage.info(`加载了 ${response.results.length} 条交易日志,共 ${response.count} 条`)
      }
    } 
    // 普通格式: {data: [...]}
    else if (response.data) {
      tradeLogs.value = Array.isArray(response.data) ? response.data : []
      console.log('解析后的交易日志数量:', tradeLogs.value.length)
    } 
    // 直接数组格式: [...]
    else if (Array.isArray(response)) {
      tradeLogs.value = response
      console.log('解析后的交易日志数量:', tradeLogs.value.length)
    } 
    else {
      tradeLogs.value = []
      console.log('解析后的交易日志数量: 0')
    }
    
    if (tradeLogs.value.length === 0) {
      console.warn('该回测没有交易日志数据')
      ElMessage.warning('该回测暂无交易日志')
    }
  } catch (error) {
    console.error('加载交易日志失败:', error)
    console.error('错误详情:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url
    })
    ElMessage.error(`加载交易日志失败: ${error.response?.data?.detail || error.message}`)
    tradeLogs.value = []
  } finally {
    loadingTrades.value = false
  }
}

// Format helpers
const formatCurrency = (value) => {
  return `¥${Number(value).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const formatPercent = (value) => {
  const num = Number(value) * 100
  return `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`
}

const getProfitClass = (value) => {
  return Number(value) >= 0 ? 'profit' : 'loss'
}

const getRowClassName = ({ row }) => {
  return Number(row.profit) >= 0 ? 'profit-row' : 'loss-row'
}

const getSellReasonType = (reason) => {
  const typeMap = {
    'take_profit': 'success',
    'stop_loss': 'danger',
    'timeout': 'warning'
  }
  return typeMap[reason] || 'info'
}

const getSellReasonText = (reason) => {
  const textMap = {
    'take_profit': '止盈',
    'stop_loss': '止损',
    'timeout': '超时'
  }
  return textMap[reason] || reason
}

// 删除回测
const handleDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除回测 "${props.backtest.strategy_name}" 吗?此操作将同时删除所有相关的交易日志,且无法恢复!`,
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }
    )
    
    await deletePortfolioBacktest(props.backtest.id)
    ElMessage.success('回测记录已删除')
    dialogVisible.value = false
    emit('deleted', props.backtest.id)
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除回测失败:', error)
      ElMessage.error(`删除失败: ${error.response?.data?.error || error.message}`)
    }
  }
}
</script>

<style scoped>
.detail-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: #fff;
  margin: 0 0 1.5rem 0;
}

.metrics-section {
  background: rgba(255, 255, 255, 0.03);
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.metric-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.2s ease;
}

.metric-card:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-2px);
}

.metric-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: rgba(59, 130, 246, 0.2);
  color: #3B82F6;
  font-size: 1.5rem;
}

.metric-icon.profit {
  background: rgba(16, 185, 129, 0.2);
  color: #10B981;
}

.metric-icon.loss {
  background: rgba(239, 68, 68, 0.2);
  color: #EF4444;
}

.metric-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.metric-label {
  font-size: 0.85rem;
  color: #94A3B8;
}

.metric-value {
  font-size: 1.25rem;
  font-weight: 600;
  color: #E2E8F0;
}

.metric-value.profit {
  color: #10B981;
}

.metric-value.loss {
  color: #EF4444;
}

.trades-section {
  background: rgba(255, 255, 255, 0.03);
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

:deep(.el-dialog) {
  background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

:deep(.el-dialog__title) {
  color: #fff;
  font-size: 1.5rem;
  font-weight: 600;
}

:deep(.el-table) {
  background: transparent;
  color: #E2E8F0;
}

:deep(.el-table tr) {
  background: transparent;
}

:deep(.el-table td.el-table__cell) {
  border-color: rgba(255, 255, 255, 0.05);
}

:deep(.el-table__body tr.profit-row) {
  background: rgba(16, 185, 129, 0.05);
}

:deep(.el-table__body tr.loss-row) {
  background: rgba(239, 68, 68, 0.05);
}

:deep(.el-table__body tr:hover > td) {
  background: rgba(255, 255, 255, 0.08) !important;
}

.profit {
  color: #10B981;
}

.loss {
  color: #EF4444;
}

@media (max-width: 768px) {
  .metrics-grid {
    grid-template-columns: 1fr;
  }
}
</style>

<style>
/* Dialog header styles - global to override Element Plus */
.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding-right: 20px;
}

.dialog-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #fff;
}
</style>
