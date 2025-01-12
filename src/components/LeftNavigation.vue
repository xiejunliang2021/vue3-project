<template>
  <div class="left-navigation">
    <el-scrollbar height="100vh">
      <el-menu :default-openeds="['1', '3']">
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
            <template #title>Group 1</template>
            <el-menu-item index="2-1">Option 1</el-menu-item>
            <el-menu-item index="2-2">Option 2</el-menu-item>
          </el-menu-item-group>
          <el-menu-item-group title="Group 2">
            <router-link to="/get_code_list" custom>
              <template #default="{ navigate, href }">
                <el-menu-item index="2-4" :href="href" @click="navigate">
                  查看股票列表
                </el-menu-item>
              </template>
            </router-link>
          </el-menu-item-group>
          <el-sub-menu index="2-4">
            <template #title>Option 4</template>
            <el-menu-item index="2-4-1">Option 4-1</el-menu-item>
          </el-sub-menu>
        </el-sub-menu>
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script setup>
import { House, User } from "@element-plus/icons-vue";

defineProps(["title"]);
</script>