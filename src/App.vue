<script setup>
import Header from "./components/Header.vue";
import LeftNavigation from "./components/LeftNavigation.vue";

const addClick = () => {
  console.log("这是父组件的方法");
};
</script>


  <template>
  <div class="common-layout">
    <el-container>
      <el-header
        ><Header title="花本无心欢迎您的到来" :addClick="addClick"
      /></el-header>
      <el-container>
        <el-aside width="200px">
          <LeftNavigation />
        </el-aside>
        <el-main><router-view /></el-main>
      </el-container>
    </el-container>
  </div>
</template>

<style scoped>
.common-layout {
  background-color: #fff;
}
.el-header {
  background-color: rgb(250, 181.5, 181.5);
  margin: 0;
}
.el-aside {
  background-color: rgb(159.5, 206.5, 255);
}
.el-main {
  background-color: rgb(177.3, 179.4, 183.6);
}
</style>
  


