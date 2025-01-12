<template>
  <h1>Home</h1>
  <span>{{ user.token }}</span>
  <button @click="getToken" type="button">获取用户信息</button>
</template>

<script setup>
import { useUserStore } from "@/stores/user.js";
import api from "../api";

const user = useUserStore();

const getToken = async () => {
  try {
    const response = await api.Login();
    console.log(response.data.token);
    // 如果需要，可以在这里更新用户信息
    // user.setToken(response.token); // 示例：更新token
  } catch (error) {
    console.error("获取用户信息失败:", error);
  }
};
</script>

<style scoped>
html.dark {
  /* 自定义深色背景颜色 */
  --el-bg-color: #8a8cc0;
}
</style>
