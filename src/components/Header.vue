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

      <!-- 标题/Logo -->
      <div class="brand-logo">
        <span class="logo-text">花本无心</span>
        <span class="logo-decoration"></span>
      </div>
    </div>

    <!-- 右侧区域 -->
    <div class="right-section">
      <!-- 已登录：显示头像和下拉菜单 -->
      <template v-if="authStore.isLoggedIn">
        <el-dropdown trigger="click" @command="handleCommand">
          <div class="user-profile">
            <el-avatar 
              :size="40" 
              :src="userAvatar" 
              class="user-avatar"
            >
              {{ userInitials }}
            </el-avatar>
            <span class="username">{{ authStore.currentUser?.username || 'User' }}</span>
            <el-icon class="el-icon--right"><arrow-down /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu class="scifi-dropdown">
              <el-dropdown-item command="profile">
                <el-icon><User /></el-icon>个人中心
              </el-dropdown-item>
              <el-dropdown-item divided command="logout">
                <el-icon><SwitchButton /></el-icon>退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </template>

      <!-- 未登录：显示按钮 -->
      <div v-else class="buttons">
        <el-button type="primary" @click="handleLogin" class="scifi-btn"> 登录 </el-button>
        <el-button type="danger" @click="handleRegister" class="scifi-btn-danger"> 注册 </el-button>
      </div>
    </div>

    <!-- 登录对话框 -->
    <LoginDialog v-if="showLoginDialog" v-model:visible="showLoginDialog" />
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { Expand, Fold, ArrowDown, User, SwitchButton } from '@element-plus/icons-vue'
import LoginDialog from "./LoginDialog.vue";
import { ElMessage } from "element-plus";

const props = defineProps({
  title: String,
  isSidebarVisible: Boolean,
  toggleSidebar: Function
});

const router = useRouter();
const authStore = useAuthStore();
const showLoginDialog = ref(false);

// 计算用户首字母
const userInitials = computed(() => {
  const name = authStore.currentUser?.username || 'U';
  return name.charAt(0).toUpperCase();
});

// 用户头像（如果有）
const userAvatar = computed(() => {
  return authStore.currentUser?.avatar || ''; // 假设用户对象有 avatar 字段
});

const handleLogin = () => {
  // 修改：打开登录对话框而不是跳转，或者根据需求保留跳转
  // 这里暂时保持跳转逻辑，如果 LoginDialog 是模态框则应该用 showLoginDialog.value = true
  // 之前的代码是 router.push("/login")，但代码里又引入了 LoginDialog。
  // 假设之前的逻辑是跳转页面
  router.push("/login");
};

const handleRegister = () => {
  router.push("/register");
};

const handleCommand = (command) => {
  switch (command) {
    case 'profile':
      router.push('/profile'); // 需要有 profile 路由
      break;
    case 'logout':
      handleLogout();
      break;
  }
};

const handleLogout = () => {
  authStore.logout();
  ElMessage.success('已退出登录');
  router.push('/login');
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@400;700&display=swap');

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  height: 64px;
  background: rgba(10, 10, 15, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 243, 255, 0.15);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
}

.left-section {
  display: flex;
  align-items: center;
  gap: 20px;
}

.brand-logo {
  position: relative;
  display: flex;
  align-items: center;
}

.logo-text {
  font-family: 'Orbitron', 'Share Tech Mono', monospace;
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(135deg, #00F3FF 0%, #BC13FE 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 10px rgba(0, 243, 255, 0.3);
  letter-spacing: 2px;
  position: relative;
  z-index: 1;
}

.logo-decoration {
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, transparent, #00F3FF, transparent);
  filter: blur(1px);
}

.toggle-btn {
  padding: 8px;
  height: auto;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.toggle-btn:hover {
  background: rgba(0, 243, 255, 0.1);
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 8px;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.user-profile:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}

.user-avatar {
  background: linear-gradient(135deg, #00F3FF, #0066FF);
  color: white;
  font-weight: bold;
  font-family: 'Share Tech Mono', monospace;
  border: 2px solid rgba(0, 243, 255, 0.3);
  box-shadow: 0 0 10px rgba(0, 243, 255, 0.2);
}

.username {
  color: #E0E0E0;
  font-family: 'Orbitron', sans-serif;
  font-size: 14px;
  letter-spacing: 0.5px;
}

.buttons {
  display: flex;
  gap: 12px;
}

.scifi-btn {
  background: rgba(0, 243, 255, 0.1) !important;
  border: 1px solid rgba(0, 243, 255, 0.5) !important;
  color: #00F3FF !important;
  font-family: 'Share Tech Mono', monospace !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  letter-spacing: 1px;
}

.scifi-btn:hover {
  background: rgba(0, 243, 255, 0.25) !important;
  box-shadow: 0 0 15px rgba(0, 243, 255, 0.4);
  text-shadow: 0 0 8px rgba(0, 243, 255, 0.6);
  transform: translateY(-1px);
}

.scifi-btn-danger {
  background: rgba(255, 77, 77, 0.1) !important;
  border: 1px solid rgba(255, 77, 77, 0.5) !important;
  color: #FF4D4D !important;
  font-family: 'Share Tech Mono', monospace !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  letter-spacing: 1px;
}

.scifi-btn-danger:hover {
  background: rgba(255, 77, 77, 0.25) !important;
  box-shadow: 0 0 15px rgba(255, 77, 77, 0.4);
  text-shadow: 0 0 8px rgba(255, 77, 77, 0.6);
  transform: translateY(-1px);
}

/* Element Plus 覆盖样式 */
:deep(.el-dropdown-menu__item) {
  font-family: 'Share Tech Mono', monospace;
}
</style>