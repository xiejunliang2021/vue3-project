<script setup>
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import Header from "./components/Header.vue";
import LeftNavigation from "./components/LeftNavigation.vue";

const route = useRoute();
const isSidebarVisible = ref(false); // Default hidden

const toggleSidebar = () => {
  isSidebarVisible.value = !isSidebarVisible.value;
};

const closeSidebar = () => {
  isSidebarVisible.value = false;
};

const closeSidebarOnMobile = () => {
  if (typeof window !== 'undefined' && window.innerWidth < 768) {
    isSidebarVisible.value = false;
  }
};

// 移动端路由切换时自动收起抽屉
watch(() => route.fullPath, () => {
  if (typeof window !== 'undefined' && window.innerWidth < 768) {
    isSidebarVisible.value = false;
  }
});

const addClick = () => {
  console.log("父组件方法调用");
};
</script>

<template>
  <div class="common-layout h-screen bg-[#090D16] tech-grid-bg overflow-hidden relative text-slate-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
    <!-- Ambient Tech Glow Orbs -->
    <div class="fixed -top-40 -left-40 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
    <div class="fixed top-1/3 -right-40 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none z-0"></div>
    <div class="fixed -bottom-40 left-1/3 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[130px] pointer-events-none z-0"></div>

    <!-- 1. 移动端独立抽屉体系 (完全独立层级，避免任何 Stacking Context 遮挡) -->
    <div class="md:hidden">
      <!-- 遮罩背景 -->
      <transition name="drawer-fade">
        <div 
          v-if="isSidebarVisible" 
          @click="closeSidebar" 
          class="fixed inset-0 bg-black/75 backdrop-blur-sm z-[9998] transition-opacity duration-300"
        ></div>
      </transition>

      <!-- 侧滑抽屉主体 (最高层级 z-[9999]) -->
      <aside 
        class="fixed inset-y-0 left-0 z-[9999] w-[280px] max-w-[85vw] bg-[#090D16] border-r border-slate-800 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out"
        :class="isSidebarVisible ? 'translate-x-0' : '-translate-x-full pointer-events-none'"
      >
        <!-- 移动端顶部标题与快捷关闭 -->
        <div class="flex items-center justify-between px-4 h-14 border-b border-slate-800/80 bg-slate-950/90 shrink-0">
          <div class="flex items-center gap-2.5">
            <div class="w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              </svg>
            </div>
            <span class="text-sm font-bold text-white tracking-wide">花本无心 · 导航</span>
          </div>
          <button 
            @click="closeSidebar"
            class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white bg-slate-900 border border-slate-800 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- 移动端菜单列表容器 -->
        <div class="flex-1 overflow-y-auto">
          <LeftNavigation @click="closeSidebarOnMobile" />
        </div>
      </aside>
    </div>

    <!-- 2. 主页面布局体系 -->
    <el-container class="h-full relative z-10 flex flex-col">
      <!-- Top SaaS Header Bar -->
      <el-header class="p-0 h-auto border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl z-20">
        <Header 
          title="花本无心 · 智算云" 
          :addClick="addClick" 
          :isSidebarVisible="isSidebarVisible"
          :toggleSidebar="toggleSidebar"
        />
      </el-header>
      
      <el-container class="relative flex-1 overflow-hidden">
        <!-- PC端桌面侧边栏 (在屏幕 >= 768px 时生效，手机端隐藏) -->
        <aside 
          class="hidden md:block transition-all duration-300 ease-in-out border-r border-slate-800/80 bg-slate-950/75 backdrop-blur-xl h-full overflow-hidden"
          :class="isSidebarVisible ? 'w-[260px] opacity-100' : 'w-0 opacity-0 !border-transparent pointer-events-none'"
        >
          <div class="w-[260px] h-full overflow-hidden">
            <LeftNavigation />
          </div>
        </aside>

        <!-- Main Workspace View -->
        <el-main class="p-0 bg-transparent relative scroll-smooth overflow-y-auto z-10">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<style scoped>
/* Reset Element Plus container styles overrides */
.el-header {
  --el-header-padding: 0;
  height: auto;
}
.el-main {
  --el-main-padding: 0;
}

.drawer-fade-enter-active, .drawer-fade-leave-active {
  transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.drawer-fade-enter-from, .drawer-fade-leave-to {
  opacity: 0;
}
</style>
