<script setup>
import { ref } from 'vue';
import { Expand, Fold } from '@element-plus/icons-vue'
import Header from "./components/Header.vue";
import LeftNavigation from "./components/LeftNavigation.vue";

const isSidebarVisible = ref(false); // Default hidden

const toggleSidebar = () => {
  isSidebarVisible.value = !isSidebarVisible.value;
};

const addClick = () => {
  console.log("这是父组件的方法");
};
</script>

<template>
  <div class="common-layout h-screen bg-scifi-bg overflow-hidden relative">
    <el-container class="h-full">
      <el-header class="p-0 h-auto border-b border-scifi-border/50">
        <Header 
          title="花本无心欢迎您的到来" 
          :addClick="addClick" 
          :isSidebarVisible="isSidebarVisible"
          :toggleSidebar="toggleSidebar"
        />
      </el-header>
      
      <el-container class="relative h-full overflow-hidden">
        <!-- Sidebar -->
        <div 
          class="transition-all duration-300 ease-in-out border-r border-scifi-border/50 bg-black/20"
          :style="{ width: isSidebarVisible ? '250px' : '0px', opacity: isSidebarVisible ? 1 : 0 }"
        >
          <div class="w-[250px] overflow-hidden">
            <LeftNavigation />
          </div>
        </div>

        <!-- Main Content -->
        <el-main class="p-0 bg-scifi-bg relative scroll-smooth">
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
</style>
  


