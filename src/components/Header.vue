<template>
  <div class="header-content">
    <!-- 标题 -->
    <div class="title">
      {{ title || "默认标题" }}
    </div>

    <!-- 按钮区域 -->
    <div class="buttons">
      <el-button type="primary" @click="handleLogin"> 登录 </el-button>
      <el-button type="danger" @click="handleRegister"> 注册 </el-button>
    </div>

    <!-- 登录对话框 -->
    <LoginDialog v-if="showLoginDialog" v-model:visible="showLoginDialog" />
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import LoginDialog from "./LoginDialog.vue";

const props = defineProps({
  title: String,
});

const router = useRouter();
const showLoginDialog = ref(false);

const handleLogin = () => {
  router.push("/login");
};

const handleRegister = () => {
  router.push("/register");
};
</script>

<style scoped>
.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 60px;
  background-color: #fff;
  border-bottom: 1px solid #eee;
}

.title {
  font-size: 18px;
  font-weight: bold;
  color: aquamarine;
}

.buttons {
  display: flex;
  gap: 10px;
}
</style>