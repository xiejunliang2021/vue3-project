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
import api from "@/api/index";

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

  loading.value = true;
  error.value = "";
  stocks.value = [];

  try {
    // 首先检查是否为开盘日
    const checkResponse = await api.get_date_is_open(value1.value);

    // 添加调试日志
    console.log("日期检查响应:", checkResponse);

    // 获取数组中的第一个元素
    const dateInfo = checkResponse.data[0];
    console.log("日期信息:", dateInfo);

    // 判断是否为开盘日
    if (dateInfo && dateInfo.is_open === 1) {
      console.log("是交易日，开始获取股票数据");
      await fetchStocks();
    } else {
      console.log("非交易日，当前is_open值为:", dateInfo?.is_open);
      ElMessage.warning(`${value1.value} 为非交易日，没有数据`);
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
const fetchStocks = async () => {
  try {
    const response = await api.get_stock(value1.value);
    console.log("股票数据响应:", response);

    // 处理后端返回的数据
    if (response.data && response.data.message) {
      const stockData = response.data.message;

      if (typeof stockData === "object") {
        const formattedStocks = [];
        if (stockData.ts_code && stockData.trade_date) {
          const tsCodesArray = Array.isArray(stockData.ts_code)
            ? stockData.ts_code
            : [stockData.ts_code];
          const tradeDatesArray = Array.isArray(stockData.trade_date)
            ? stockData.trade_date
            : [stockData.trade_date];

          tsCodesArray.forEach((code, index) => {
            formattedStocks.push({
              ts_code: code,
              trade_date: tradeDatesArray[index] || tradeDatesArray[0],
            });
          });
        }
        stocks.value = formattedStocks;
      }
    }

    if (stocks.value.length === 0) {
      ElMessage.info("没有找到符合条件的股票");
    }
  } catch (err) {
    console.error("请求失败:", err);
    error.value = "请求失败，请稍后再试";
    ElMessage.error("请求失败，请稍后再试");
    throw err;
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