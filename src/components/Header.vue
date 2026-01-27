<template>
  <div class="header-content">
    <div class="left-section">
      <!-- Toggle Sidebar Button -->
      <el-button 
        type="primary" 
        link 
        @click="toggleSidebar" 
        class="toggle-btn"
      >
        <el-icon :size="24" class="text-scifi-accent hover:text-white transition-colors">
          <component :is="isSidebarVisible ? 'Fold' : 'Expand'" />
        </el-icon>
      </el-button>

      <!-- 标题 -->
      <div class="title">
        {{ title || "默认标题" }}
      </div>
    </div>

    <!-- 按钮区域 -->
    <div class="buttons">
      <el-button type="primary" @click="handleLogin" class="scifi-btn"> 登录 </el-button>
      <el-button type="danger" @click="handleRegister" class="scifi-btn-danger"> 注册 </el-button>
    </div>

    <!-- 登录对话框 -->
    <LoginDialog v-if="showLoginDialog" v-model:visible="showLoginDialog" />
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { Expand, Fold } from '@element-plus/icons-vue'
import LoginDialog from "./LoginDialog.vue";

const props = defineProps({
  title: String,
  isSidebarVisible: Boolean,
  toggleSidebar: Function
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
  background-color: rgba(13, 2, 8, 0.9); /* scifi-bg with opacity */
  backdrop-filter: blur(4px);
  border-bottom: 1px solid rgba(0, 243, 255, 0.2); /* scifi-accent/20 */
}

.left-section {
  display: flex;
  align-items: center;
  gap: 15px;
}

.toggle-btn {
  padding: 0;
  height: auto;
}

.title {
  font-size: 18px;
  font-weight: bold;
  color: #fff;
  font-family: 'Share Tech Mono', monospace;
  letter-spacing: 1px;
}

.buttons {
  display: flex;
  gap: 10px;
}

.scifi-btn {
  background: rgba(0, 243, 255, 0.1);
  border-color: rgba(0, 243, 255, 0.5);
  color: #00F3FF;
  font-family: 'Share Tech Mono', monospace;
}
.scifi-btn:hover {
  background: rgba(0, 243, 255, 0.2);
  border-color: #00F3FF;
  color: #fff;
}

.scifi-btn-danger {
  background: rgba(255, 0, 0, 0.1);
  border-color: rgba(255, 0, 0, 0.5);
  color: #ff4d4d;
  font-family: 'Share Tech Mono', monospace;
}
.scifi-btn-danger:hover {
  background: rgba(255, 0, 0, 0.2);
  border-color: #ff4d4d;
  color: #fff;
}
</style>