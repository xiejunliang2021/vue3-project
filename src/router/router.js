import component from "element-plus/es/components/tree-select/src/tree-select-option.mjs";
import { createRouter, createWebHashHistory } from "vue-router";
import StockList from "../pages/StockList.vue";

const routes = [
  {
    path: "/",
    redirect: "/home",
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/Login.vue"),
  },
  {
    path: "/home",
    component: () => import("@/components/Home.vue"),
  },
  {
    path: "/get_code_list",
    component: StockList,
  },
  {
    path: "/blog",
    component: () => import("@/pages/Blog.vue"),
  },
  {
    path: "/favorites/study",
    component: () => import("@/pages/NavigationCollection.vue"),
  },
  {
    path: "/favorites/vps",
    component: () => import("@/pages/VpsCollection.vue"),
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
