import { defineStore } from "pinia";

export const useStocksStore = defineStore("stocks", {
  state: () => ({
    stocksData: {},
  }),
  actions: {
    setStocks(date, data) {
      this.stocksData[date] = data;
    },
    getStocks(date) {
      return this.stocksData[date] || [];
    },
    hasStocks(date) {
      return !!this.stocksData[date];
    },
  },
  persist: true, // 启用持久化
});
