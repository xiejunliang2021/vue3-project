<template>
  <div>
    <el-carousel :interval="5000" type="card" height="400px">
      <el-carousel-item v-for="item in carouselImages" :key="item.id">
        <img :src="item.url" :alt="item.alt" class="carousel-image" />
      </el-carousel-item>
    </el-carousel>

    <h1>博客文章列表</h1>
    <el-row :gutter="20">
      <el-col v-for="blog in blogs" :key="blog.id" :span="8">
        <el-card>
          <h3>{{ blog.title }}</h3>
          <p>{{ blog.excerpt }}</p>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>
  
  <script setup>
import { ref } from "vue";

const carouselImages = ref([
  {
    id: 1,
    url: "https://img.huabenwuxin.com/微信图片_2019111620570231.jpg",
    alt: "Slide 1",
  },
  {
    id: 2,
    url: "https://img.huabenwuxin.com/微信图片_2019111620570235.jpg",
    alt: "Slide 2",
  },
  {
    id: 3,
    url: "https://img.huabenwuxin.com/微信图片_2019111620584324.jpg",
    alt: "Slide 3",
  },
]);

const blogs = ref([
  { id: 1, title: "博客文章 1", excerpt: "这是博客文章 1 的摘要内容。" },
  { id: 2, title: "博客文章 2", excerpt: "这是博客文章 2 的摘要内容。" },
  { id: 3, title: "博客文章 3", excerpt: "这是博客文章 3 的摘要内容。" },
  // 添加更多文章
]);
</script>
  
<style scoped>
.carousel-image {
  width: 100%;
  height: 100%;
  /* object-fit: cover; 等比例缩放，裁剪溢出部分 */
  object-fit: contain; /* 等比例缩放，完整显示图片 */
}
h1 {
  margin: 20px 0;
}
.el-card {
  margin-bottom: 20px;
}
</style>
  