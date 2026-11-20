<template>
  <div class="header-content">
    <div class="left-section">
      <!-- Toggle Sidebar Button -->
      <button 
        @click="toggleSidebar" 
        class="toggle-btn"
        :title="isSidebarVisible ? '收起侧边栏' : '展开侧边栏'"
      >
        <el-icon :size="20" class="text-slate-400 group-hover:text-white transition-colors">
          <component :is="isSidebarVisible ? 'Fold' : 'Expand'" />
        </el-icon>
      </button>

      <!-- 品牌 Logo & 标题 -->
      <router-link to="/home" class="brand-logo group">
        <div class="logo-icon-wrapper">
          <svg class="w-5 h-5 text-indigo-400 group-hover:text-cyan-400 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
          </svg>
        </div>
        <div class="flex items-center gap-2">
          <span class="logo-text">花本无心</span>
          <span class="logo-badge">CLOUD SAAS</span>
        </div>
      </router-link>
    </div>

    <!-- 中间系统状态微标识 (Tech SaaS 风格) -->
    <div class="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-full bg-slate-900/60 border border-slate-800/80 text-xs text-slate-400">
      <span class="flex h-2 w-2 relative">
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
      </span>
      <span class="font-medium text-slate-300">智算云核心: 正常运行</span>
      <span class="text-slate-600">|</span>
      <span class="font-mono text-[11px] text-slate-400">API 延时 &lt;35ms</span>
    </div>

    <!-- 右侧用户状态区域 -->
    <div class="right-section">
      <!-- 已登录：显示头像和下拉菜单 -->
      <template v-if="authStore.isLoggedIn">
        <el-dropdown trigger="click" @command="handleCommand" popper-class="saas-dropdown-popper">
          <div class="user-profile">
            <el-avatar 
              :size="34" 
              :src="userAvatar" 
              class="user-avatar"
            >
              {{ userInitials }}
            </el-avatar>
            <div class="hidden sm:flex flex-col text-left">
              <span class="username">{{ authStore.currentUser?.username || 'Admin User' }}</span>
              <span class="text-[10px] text-indigo-400 font-mono">PRO SUBSCRIBER</span>
            </div>
            <el-icon class="el-icon--right text-slate-400"><arrow-down /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu class="saas-dropdown">
              <el-dropdown-item command="profile">
                <el-icon><User /></el-icon>个人中心
              </el-dropdown-item>
              <el-dropdown-item divided command="logout" class="text-rose-400">
                <el-icon><SwitchButton /></el-icon>退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </template>

      <!-- 未登录：显示现代 SaaS 登录/注册按钮 -->
      <div v-else class="flex items-center gap-2.5">
        <button @click="handleLogin" class="saas-header-btn-ghost">
          登录
        </button>
        <button @click="handleRegister" class="saas-header-btn-primary">
          <span>注册体验</span>
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
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

const userInitials = computed(() => {
  const name = authStore.currentUser?.username || 'U';
  return name.charAt(0).toUpperCase();
});

const userAvatar = computed(() => {
  return authStore.currentUser?.avatar || '';
});

const handleLogin = () => {
  router.push("/login");
};

const handleRegister = () => {
  router.push("/register");
};

const handleCommand = (command) => {
  switch (command) {
    case 'profile':
      router.push('/profile');
      break;
    case 'logout':
      handleLogout();
      break;
  }
};

const handleLogout = () => {
  authStore.logout();
  ElMessage.success('已安全退出登录');
  router.push('/login');
};
</script>

<style scoped>
.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 60px;
  background: rgba(9, 13, 22, 0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.4);
}

.left-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.08);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.toggle-btn:hover {
  background: rgba(51, 65, 85, 0.7);
  border-color: rgba(99, 102, 241, 0.3);
  transform: translateY(-1px);
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
}

.logo-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%);
  border: 1px solid rgba(99, 102, 241, 0.3);
  box-shadow: 0 0 15px -3px rgba(99, 102, 241, 0.25);
  transition: all 0.3s;
}

.brand-logo:hover .logo-icon-wrapper {
  border-color: rgba(6, 182, 212, 0.5);
  box-shadow: 0 0 20px -3px rgba(6, 182, 212, 0.4);
}

.logo-text {
  font-size: 17px;
  font-weight: 700;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, #FFFFFF 0%, #CBD5E1 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.logo-badge {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.05em;
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(99, 102, 241, 0.15);
  color: #A5B4FC;
  border: 1px solid rgba(99, 102, 241, 0.3);
}

.right-section {
  display: flex;
  align-items: center;
  gap: 14px;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 4px 10px;
  border-radius: 10px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.2s;
}

.user-profile:hover {
  background: rgba(30, 41, 59, 0.8);
  border-color: rgba(99, 102, 241, 0.3);
}

.user-avatar {
  background: linear-gradient(135deg, #6366F1 0%, #06B6D4 100%);
  color: white;
  font-weight: 600;
  font-size: 13px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.username {
  color: #F1F5F9;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.2;
}

.saas-header-btn-ghost {
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 500;
  color: #94A3B8;
  border-radius: 8px;
  background: transparent;
  border: 1px solid transparent;
  transition: all 0.2s;
  cursor: pointer;
}

.saas-header-btn-ghost:hover {
  color: #F8FAFC;
  background: rgba(255, 255, 255, 0.05);
}

.saas-header-btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 600;
  color: #FFFFFF;
  border-radius: 8px;
  background: linear-gradient(135deg, #6366F1 0%, #4F46E5 100%);
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 2px 10px rgba(99, 102, 241, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2);
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  cursor: pointer;
}

.saas-header-btn-primary:hover {
  background: linear-gradient(135deg, #4F46E5 0%, #4338CA 100%);
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.45);
  transform: translateY(-1px);
}
</style>
