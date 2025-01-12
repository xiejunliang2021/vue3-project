<template>
  <div class="block">
    <el-date-picker
      v-model="value1"
      type="date"
      placeholder="请选择日期"
      value-format="YYYY-MM-DD"
    />
    <el-button
      type="primary"
      round
      @click="checkAndFetchStocks"
      :loading="loading"
      >获取股票策略</el-button
    >
  </div>

  <h1>股票列表</h1>
  <span>通过输入日期参数来获取当天符合策略的股票代码</span>
  <div v-if="stocks.length">
    <el-table :data="stocks" style="width: 100%" border stripe>
      <el-table-column prop="ts_code" label="股票代码" width="180" />
      <el-table-column prop="trade_date" label="交易日期" width="180" />
    </el-table>
  </div>
  <p v-else>{{ loading ? "数据加载中..." : "没有数据" }}</p>

  <el-alert v-if="error" :title="error" type="error" show-icon closable />
</template>

<script setup>
import { ref } from "vue";
import { ElMessage } from "element-plus";
import { useStocksStore } from "@/stores/stocks";
import api from "@/api/index";

const stocksStore = useStocksStore();
const value1 = ref("");
const stocks = ref([]);
const error = ref("");
const loading = ref(false);

// 检查是否为开盘日并获取数据
const checkAndFetchStocks = async () => {
  if (!value1.value) {
    ElMessage.warning("请选择日期");
    return;
  }

  const selectedDate = value1.value;

  // 先检查 Pinia 中是否有数据
  if (stocksStore.hasStocks(selectedDate)) {
    stocks.value = stocksStore.getStocks(selectedDate);
    ElMessage.info("从pinia中获取股票数据");
    return;
  }

  loading.value = true;
  error.value = "";
  stocks.value = [];

  try {
    const checkResponse = await api.get_date_is_open(selectedDate);
    const dateInfo = checkResponse.data[0];

    if (dateInfo && dateInfo.is_open === 1) {
      await fetchStocks();
    } else {
      ElMessage.warning(`${selectedDate} 为非交易日，没有数据`);
      stocks.value = [];
    }
  } catch (err) {
    console.error("检查交易日期失败:", err);
    error.value = "检查交易日期失败，请稍后再试";
    ElMessage.error("检查交易日期失败，请稍后再试");
  } finally {
    loading.value = false;
  }
};

// 获取股票数据
// 获取股票数据
const fetchStocks = async () => {
  try {
    const response = await api.get_stock(value1.value);
    const stockData = response.data.message;

    let formattedStocks = [];
    if (Array.isArray(stockData)) {
      // 如果 stockData 是数组，直接格式化
      formattedStocks = stockData.map((stock) => ({
        ts_code: stock.ts_code,
        trade_date: stock.trade_date,
      }));
    } else if (typeof stockData === "object" && stockData !== null) {
      // 如果 stockData 是对象，检查并提取必要的信息
      if (stockData.ts_code && stockData.trade_date) {
        const tsCodesArray = Array.isArray(stockData.ts_code)
          ? stockData.ts_code
          : [stockData.ts_code];
        const tradeDatesArray = Array.isArray(stockData.trade_date)
          ? stockData.trade_date
          : [stockData.trade_date];

        formattedStocks = tsCodesArray.map((code, index) => ({
          ts_code: code,
          trade_date: tradeDatesArray[index] || tradeDatesArray[0],
        }));
      }
    } else {
      // 处理其他可能的返回类型
      ElMessage.warning("股票数据格式不正确");
    }

    stocks.value = formattedStocks;
    stocksStore.setStocks(value1.value, formattedStocks); // 保存到 Pinia

    if (stocks.value.length === 0) {
      ElMessage.info("没有找到符合条件的股票");
    }
  } catch (err) {
    console.error("请求失败:", err);
    error.value = "请求失败，请稍后再试";
    ElMessage.error("请求失败，请稍后再试");
  }
};
</script>


<style scoped>
.block {
  margin-bottom: 20px;
}

.el-button {
  margin-left: 5px;
}
</style>