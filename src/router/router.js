import { createRouter, createWebHashHistory } from "vue-router";
import StockList from "../pages/StockList.vue";

// Helper to generate SVG favicon from emoji
const emojiFavicon = (emoji) => {
  return `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>${emoji}</text></svg>`;
};

const routes = [
  {
    path: "/",
    redirect: "/home",
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/LoginView.vue"),
    meta: { title: "登录", icon: emojiFavicon("🔐") }
  },
  {
    path: "/home",
    component: () => import("@/views/PortalView.vue"),
    meta: { title: "首页", icon: emojiFavicon("🏠") }
  },
  {
    path: "/stock",
    component: () => import("@/views/StockDashboard.vue"),
    meta: { title: "股票看板", icon: emojiFavicon("📈") }
  },
  {
    path: "/policy-details",
    component: () => import("@/views/PolicyDetailsView.vue"),
    meta: { title: "策略详情", icon: emojiFavicon("📄") }
  },
  {
    path: "/get_code_list",
    component: StockList,
    meta: { title: "股票列表", icon: emojiFavicon("📋") }
  },
  {
    path: "/blog",
    component: () => import("@/pages/Blog.vue"),
    meta: { title: "博客", icon: emojiFavicon("📰") }
  },
  {
    path: "/favorites/study",
    component: () => import("@/pages/NavigationCollection.vue"),
    meta: { title: "学习导航", icon: emojiFavicon("🎓") }
  },
  {
    path: "/favorites/vps",
    component: () => import("@/pages/VpsCollection.vue"),
    meta: { title: "VPS导航", icon: emojiFavicon("☁️") }
  },
  {
    path: "/backtest",
    name: "Backtest",
    component: () => import("@/views/BacktestView.vue"),
    meta: { title: "策略回测", icon: emojiFavicon("🧪") }
  },
  {
    path: "/profile",
    name: "Profile",
    component: () => import("@/views/ProfileView.vue"),
    meta: { requiresAuth: true, title: "个人中心", icon: emojiFavicon("👤") }
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

// 设置 Favicon 的函数
const setFavicon = (url) => {
  let link = document.querySelector("link[rel~='icon']");
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.getElementsByTagName('head')[0].appendChild(link);
  }
  link.href = url;
};

// 全局路由守卫
router.beforeEach((to, from, next) => {
  // 设置标题
  const title = to.meta.title ? `${to.meta.title} - 花本无心` : "花本无心";
  document.title = title;

  // 设置 Favicon
  if (to.meta.icon) {
    setFavicon(to.meta.icon);
  } else {
    setFavicon("/vite.svg");
  }

  // 统一身份验证拦截
  const token = localStorage.getItem('accessToken');
  
  if (to.path !== '/login' && !token) {
    // 未登录用户，且访问的不是登录页，强制跳转登录页
    next('/login');
  } else {
    // 已登录或访问登录页，放行
    next();
  }
});

export default router;
