<template>
  <el-dialog
    v-model="dialogVisible"
    title="新建回测任务"
    width="600px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="120px"
      label-position="left"
    >
      <el-form-item label="策略名称" prop="strategy_name">
        <el-input
          v-model="formData.strategy_name"
          placeholder="请输入策略名称,如: 龙回头-2023Q1"
          clearable
        />
      </el-form-item>

      <el-form-item label="策略类型" prop="strategy_type">
        <el-select v-model="formData.strategy_type" placeholder="请选择策略类型" style="width: 100%">
          <el-option label="龙回头" value="龙回头" />
          <el-option label="连续涨停" value="连续涨停" />
        </el-select>
      </el-form-item>

      <el-form-item label="回测日期" prop="dateRange">
        <el-date-picker
          v-model="formData.dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="初始资金" prop="total_capital">
        <el-input-number
          v-model="formData.total_capital"
          :min="10000"
          :max="100000000"
          :step="100000"
          :precision="2"
          controls-position="right"
          style="width: 100%"
        />
        <span class="form-hint">单位: 元</span>
      </el-form-item>

      <el-form-item label="单票资金占比" prop="capital_per_stock_ratio">
        <el-slider
          v-model="formData.capital_per_stock_ratio"
          :min="1"
          :max="50"
          :step="1"
          show-input
          :format-tooltip="(val) => `${val}%`"
        />
        <span class="form-hint">建议: 5%-20%</span>
      </el-form-item>

      <el-form-item label="最大持仓天数" prop="hold_timeout_days">
        <el-input-number
          v-model="formData.hold_timeout_days"
          :min="1"
          :max="365"
          :step="1"
          controls-position="right"
          style="width: 100%"
        />
        <span class="form-hint">超时自动平仓</span>
      </el-form-item>

      <el-form-item label="回测引擎" prop="use_backtrader">
        <el-radio-group v-model="formData.use_backtrader">
          <el-radio :label="false">自定义引擎 (快速)</el-radio>
          <el-radio :label="true">Backtrader (精确)</el-radio>
        </el-radio-group>
      </el-form-item>

      <template v-if="formData.use_backtrader">
        <el-form-item label="数据源" prop="data_source">
          <el-radio-group v-model="formData.data_source">
            <el-radio label="tushare">Tushare (前复权)</el-radio>
            <el-radio label="oracle">Oracle (原始)</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="佣金率" prop="commission">
          <el-input-number
            v-model="formData.commission"
            :min="0"
            :max="0.01"
            :step="0.0001"
            :precision="4"
            controls-position="right"
            style="width: 100%"
          />
          <span class="form-hint">默认: 0.0003 (万三)</span>
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="止盈目标" prop="profit_target">
              <el-input-number
                v-model="formData.profit_target"
                :min="0.01"
                :max="10.0"
                :step="0.01"
                :precision="2"
                controls-position="right"
                style="width: 100%"
              />
              <span class="form-hint">例如: 0.10 (10%)</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="止损阈值" prop="stop_loss">
              <el-input-number
                v-model="formData.stop_loss"
                :min="0.01"
                :max="1.0"
                :step="0.01"
                :precision="2"
                controls-position="right"
                style="width: 100%"
              />
              <span class="form-hint">例如: 0.05 (5%)</span>
            </el-form-item>
          </el-col>
        </el-row>
      </template>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          {{ submitting ? '提交中...' : '开始回测' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { runPortfolioBacktest } from '@/api/modules/backtest'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'success'])

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const formRef = ref(null)
const submitting = ref(false)

const formData = reactive({
  strategy_name: '',
  strategy_type: '连续涨停', // 默认为连续涨停
  dateRange: null,
  total_capital: 1000000,
  capital_per_stock_ratio: 10,
  hold_timeout_days: 60,
  use_backtrader: true, // 默认使用 Backtrader
  data_source: 'tushare', // 默认使用 Tushare
  commission: 0.0003,
  profit_target: 0.10,
  stop_loss: 0.05
})

const rules = {
  strategy_name: [
    { required: true, message: '请输入策略名称', trigger: 'blur' }
  ],
  strategy_type: [
    { required: true, message: '请选择策略类型', trigger: 'change' }
  ],
  dateRange: [
    { required: true, message: '请选择回测日期范围', trigger: 'change' }
  ],
  total_capital: [
    { required: true, message: '请输入初始资金', trigger: 'blur' }
  ],
  capital_per_stock_ratio: [
    { required: true, message: '请设置单票资金占比', trigger: 'blur' }
  ],
  hold_timeout_days: [
    { required: true, message: '请设置最大持仓天数', trigger: 'blur' }
  ],
  profit_target: [
    { required: true, message: '请设置止盈目标', trigger: 'blur' }
  ],
  stop_loss: [
    { required: true, message: '请设置止损阈值', trigger: 'blur' }
  ]
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    
    submitting.value = true
    try {
      const requestData = {
        filters: {
          strategy_name: formData.strategy_name,
          strategy_type: formData.strategy_type,
          start_date: formData.dateRange[0],
          end_date: formData.dateRange[1]
        },
        backtest_params: {
          total_capital: formData.total_capital,
          capital_per_stock_ratio: formData.capital_per_stock_ratio / 100,
          hold_timeout_days: formData.hold_timeout_days,
          db_alias: 'default',
          use_backtrader: formData.use_backtrader
        }
      }
      
      if (formData.use_backtrader) {
        requestData.backtest_params.commission = formData.commission
        requestData.backtest_params.data_source = formData.data_source
        requestData.backtest_params.profit_target = formData.profit_target
        requestData.backtest_params.stop_loss = formData.stop_loss
      }
      
      const response = await runPortfolioBacktest(requestData)

      
      ElMessage.success({
        message: `回测任务已启动! 任务ID: ${response.task_id || response.data?.task_id}`,
        duration: 5000
      })
      
      emit('success')
      handleClose()
    } catch (error) {
      console.error('提交回测任务失败:', error)
      ElMessage.error(error.response?.data?.message || '提交回测任务失败')
    } finally {
      submitting.value = false
    }
  })
}

const handleClose = () => {
  formRef.value?.resetFields()
  dialogVisible.value = false
}
</script>

<style scoped>
.form-hint {
  margin-left: 12px;
  font-size: 0.85rem;
  color: #94A3B8;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

:deep(.el-dialog) {
  background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

:deep(.el-dialog__title) {
  color: #fff;
  font-size: 1.25rem;
  font-weight: 600;
}

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

:deep(.el-input-number .el-input__inner) {
  text-align: left;
}

:deep(.el-radio__label) {
  color: #94A3B8;
}

:deep(.el-radio__input.is-checked + .el-radio__label) {
  color: #3B82F6;
}
</style>
