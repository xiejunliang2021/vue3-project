<template>
  <div class="favorites-container">
    <h1>我的收藏导航</h1>
    <el-row :gutter="20">
      <el-col v-for="link in favoriteLinks" :key="link.id" :span="8">
        <el-card>
          <h3>{{ link.name }}</h3>
          <p>{{ link.description }}</p>
          <el-link :href="link.url" target="_blank" type="primary"
            >访问链接</el-link
          >
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>
  
  <script setup>
import { ref } from "vue";

const favoriteLinks = ref([
  {
    id: 1,
    name: "Vue.js",
    description: "渐进式 JavaScript 框架",
    url: "https://vuejs.org/",
  },
  {
    id: 2,
    name: "Element Plus",
    description: "基于 Vue 3 的桌面端组件库",
    url: "https://element-plus.org/",
  },
  {
    id: 3,
    name: "GitHub",
    description: "代码托管平台",
    url: "https://github.com/",
  },
  // 添加更多收藏链接
]);
</script>
  
  <style scoped>
.favorites-container {
  padding: 20px;
}

.el-card {
  margin-bottom: 20px;
}

h1 {
  margin-bottom: 20px;
}
</style>
  