<template>
  <!-- Visibility controlled by parent App.vue -->
  <div class="left-navigation">
    <el-scrollbar height="100vh">
      <el-menu :default-openeds="['1', '2']" class="border-r-0">
        <el-sub-menu index="1">
          <template #title>
            <el-icon><House /></el-icon>花本无心
          </template>
          <el-menu-item-group>
            <template #title>Group 1</template>
            <router-link to="/blog" custom>
              <template #default="{ navigate, href }">
                <el-menu-item index="1-1" :href="href" @click="navigate">
                  花本无心
                </el-menu-item>
              </template>
            </router-link>
          </el-menu-item-group>
          <el-menu-item-group title="Group 2">
            <el-menu-item index="1-3">Option 3</el-menu-item>
          </el-menu-item-group>
          <el-sub-menu index="1-4">
            <template #title
              ><el-icon><Notification /></el-icon>网站导航</template
            >
            <router-link to="/favorites/study" custom>
              <template #default="{ navigate, href }">
                <el-menu-item index="1-4-1" :href="href" @click="navigate">
                  学习相关
                </el-menu-item>
              </template>
            </router-link>
            <router-link to="/favorites/vps" custom>
              <template #default="{ navigate, href }">
                <el-menu-item index="1-4-2" :href="href" @click="navigate">
                  外网相关
                </el-menu-item>
              </template>
            </router-link>
          </el-sub-menu>
        </el-sub-menu>
        <el-sub-menu index="2">
          <template #title>
            <el-icon><Money /></el-icon>熙烨量化
          </template>
          <el-menu-item-group>
            <template #title>龙回头</template>
            <router-link to="/policy-details" custom>
              <template #default="{ navigate, href }">
                <el-menu-item index="2-1" :href="href" @click="navigate">
                  策略结果
                </el-menu-item>
              </template>
            </router-link>
            <el-menu-item index="2-2">策略详情</el-menu-item>
          </el-menu-item-group>
          <el-menu-item-group title="回测中心">
            <router-link to="/backtest" custom>
              <template #default="{ navigate, href }">
                <el-menu-item index="2-3" :href="href" @click="navigate">
                  策略回测
                </el-menu-item>
              </template>
            </router-link>
          </el-menu-item-group>
          <el-menu-item-group title="基本数据">
            <router-link to="/get_code_list" custom>
              <template #default="{ navigate, href }">
                <el-menu-item index="2-4" :href="href" @click="navigate">
                  股票列表
                </el-menu-item>
              </template>
            </router-link>
          </el-menu-item-group>
          <el-sub-menu index="2-5">
            <template #title>Option 4</template>
            <el-menu-item index="2-5-1">Option 4-1</el-menu-item>
          </el-sub-menu>
        </el-sub-menu>
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script setup>
import { House, Notification, Money } from "@element-plus/icons-vue";

defineProps(["title"]);
</script>

<style scoped>
.left-navigation {
  width: 250px;
  height: 100vh;
  overflow-y: auto;
}

/* Smooth scrollbar for webkit browsers */
.left-navigation::-webkit-scrollbar {
  width: 6px;
}

.left-navigation::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.left-navigation::-webkit-scrollbar-track {
  background: transparent;
}
</style>