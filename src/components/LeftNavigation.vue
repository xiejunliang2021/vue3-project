<template>
  <div class="left-navigation text-slate-200">
    <el-scrollbar height="100%">
      <div class="px-3 py-4">
        <div class="text-[10px] font-bold tracking-wider text-slate-500 uppercase px-3 mb-2 flex items-center justify-between">
          <span>核心工作台</span>
          <span class="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">WORKSPACE</span>
        </div>

        <el-menu 
          :default-openeds="['1', '2']" 
          class="saas-menu border-none bg-transparent"
        >
          <!-- 平台服务组 -->
          <el-sub-menu index="1" class="saas-sub-menu">
            <template #title>
              <div class="flex items-center gap-2.5">
                <div class="w-6 h-6 rounded-md bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-indigo-400">
                  <el-icon :size="14"><House /></el-icon>
                </div>
                <span class="font-semibold text-slate-200">综合控制台</span>
              </div>
            </template>

            <!-- 节点与订阅分组 -->
            <el-menu-item-group>
              <template #title>
                <span class="text-[10px] font-mono uppercase text-slate-500 px-1">网络 & 订阅核心</span>
              </template>

              <router-link to="/node-config" custom>
                <template #default="{ navigate, href }">
                  <el-menu-item index="1-3" :href="href" @click="navigate" class="saas-menu-item">
                    <div class="flex items-center justify-between w-full">
                      <span class="flex items-center gap-2">
                        <span class="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                        节点转换器
                      </span>
                      <span class="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/15 text-cyan-300 font-mono">CF优选</span>
                    </div>
                  </el-menu-item>
                </template>
              </router-link>

              <router-link to="/subscriptions" custom>
                <template #default="{ navigate, href }">
                  <el-menu-item index="1-3-2" :href="href" @click="navigate" class="saas-menu-item">
                    <div class="flex items-center justify-between w-full">
                      <span class="flex items-center gap-2">
                        <span class="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                        专属订阅管理
                      </span>
                      <span class="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/15 text-indigo-300 font-mono">CRUD</span>
                    </div>
                  </el-menu-item>
                </template>
              </router-link>
            </el-menu-item-group>

            <!-- 智能体 & 扩展导航 -->
            <el-menu-item-group>
              <template #title>
                <span class="text-[10px] font-mono uppercase text-slate-500 px-1">智能体 & 工具</span>
              </template>

              <router-link to="/blog" custom>
                <template #default="{ navigate, href }">
                  <el-menu-item index="1-1" :href="href" @click="navigate" class="saas-menu-item">
                    <span class="flex items-center gap-2">
                      <span class="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                      花本无心博客
                    </span>
                  </el-menu-item>
                </template>
              </router-link>

              <el-menu-item index="1-2" @click="openDashboard" class="saas-menu-item">
                <div class="flex items-center justify-between w-full">
                  <span class="flex items-center gap-2">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    Hermes Dashboard
                  </span>
                  <svg class="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </div>
              </el-menu-item>
            </el-menu-item-group>

            <!-- 导航子集 -->
            <el-sub-menu index="1-4" class="saas-nested-sub-menu">
              <template #title>
                <span class="text-xs text-slate-300 flex items-center gap-2">
                  <el-icon :size="12"><Notification /></el-icon>
                  资源导航图谱
                </span>
              </template>

              <router-link to="/favorites/study" custom>
                <template #default="{ navigate, href }">
                  <el-menu-item index="1-4-1" :href="href" @click="navigate" class="saas-menu-item">
                    智能体网络
                  </el-menu-item>
                </template>
              </router-link>

              <router-link to="/graph-collection" custom>
                <template #default="{ navigate, href }">
                  <el-menu-item index="1-4-3" :href="href" @click="navigate" class="saas-menu-item">
                    口播图谱
                  </el-menu-item>
                </template>
              </router-link>

              <router-link to="/favorites/vps" custom>
                <template #default="{ navigate, href }">
                  <el-menu-item index="1-4-2" :href="href" @click="navigate" class="saas-menu-item">
                    外网相关
                  </el-menu-item>
                </template>
              </router-link>

              <el-menu-item index="1-4-4" @click="openCliproxyapi" class="saas-menu-item">
                <span class="flex items-center justify-between w-full">
                  cliproxyapi
                  <svg class="w-3 h-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </span>
              </el-menu-item>
            </el-sub-menu>
          </el-sub-menu>

          <!-- 量化交易服务组 -->
          <el-sub-menu index="2" class="saas-sub-menu">
            <template #title>
              <div class="flex items-center gap-2.5">
                <div class="w-6 h-6 rounded-md bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                  <el-icon :size="14"><Money /></el-icon>
                </div>
                <span class="font-semibold text-slate-200">熙烨量化中枢</span>
              </div>
            </template>

            <el-menu-item-group>
              <template #title>
                <span class="text-[10px] font-mono uppercase text-slate-500 px-1">量化策略</span>
              </template>
              <router-link to="/policy-details" custom>
                <template #default="{ navigate, href }">
                  <el-menu-item index="2-1" :href="href" @click="navigate" class="saas-menu-item">
                    龙回头 · 策略结果
                  </el-menu-item>
                </template>
              </router-link>
            </el-menu-item-group>

            <el-menu-item-group>
              <template #title>
                <span class="text-[10px] font-mono uppercase text-slate-500 px-1">回测与数据</span>
              </template>
              <router-link to="/backtest" custom>
                <template #default="{ navigate, href }">
                  <el-menu-item index="2-3" :href="href" @click="navigate" class="saas-menu-item">
                    策略算法回测
                  </el-menu-item>
                </template>
              </router-link>
              <router-link to="/get_code_list" custom>
                <template #default="{ navigate, href }">
                  <el-menu-item index="2-4" :href="href" @click="navigate" class="saas-menu-item">
                    股票基础列表
                  </el-menu-item>
                </template>
              </router-link>
            </el-menu-item-group>
          </el-sub-menu>
        </el-menu>
      </div>
    </el-scrollbar>
  </div>
</template>

<script setup>
import { House, Notification, Money } from "@element-plus/icons-vue";

defineProps(["title"]);

const openDashboard = () => {
  window.open('/hermes-dashboard/', '_blank');
};

const openCliproxyapi = () => {
  window.open('https://cli.huabenwuxin.com/management.html', '_blank');
};
</script>

<style scoped>
.left-navigation {
  width: 260px;
  height: calc(100vh - 60px);
  background: transparent;
}

:deep(.saas-menu) {
  --el-menu-bg-color: transparent !important;
  --el-menu-hover-bg-color: transparent !important;
}

:deep(.el-sub-menu__title) {
  height: 40px !important;
  line-height: 40px !important;
  padding: 0 8px !important;
  border-radius: 8px !important;
  color: #E2E8F0 !important;
  font-size: 13px !important;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
}

:deep(.el-sub-menu__title:hover) {
  background: rgba(255, 255, 255, 0.04) !important;
}

:deep(.el-menu-item-group__title) {
  padding: 10px 10px 4px !important;
  line-height: normal !important;
}

:deep(.saas-menu-item) {
  height: 36px !important;
  line-height: 36px !important;
  margin: 2px 0 !important;
  padding: 0 12px !important;
  border-radius: 8px !important;
  color: #94A3B8 !important;
  font-size: 13px !important;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
}

:deep(.saas-menu-item:hover) {
  color: #F8FAFC !important;
  background: rgba(255, 255, 255, 0.06) !important;
}

:deep(.saas-menu-item.is-active) {
  color: #818CF8 !important;
  background: rgba(99, 102, 241, 0.12) !important;
  font-weight: 600 !important;
  border-left: 2px solid #6366F1 !important;
}
</style>
