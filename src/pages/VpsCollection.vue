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
    name: "oracle",
    description: "oracle服务器",
    url: "https://cloud.oracle.com/?region=ap-melbourne-1",
  },
  {
    id: 2,
    name: "cloud flare",
    description: "CDN托管平台",
    url: "https://dash.cloudflare.com/",
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
    