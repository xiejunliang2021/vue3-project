import { createApp } from "vue";
import router from "./router/router";
import App from "./App.vue";
// 引入elementplus相关
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import zhCn from "element-plus/es/locale/lang/zh-cn";
// 暗黑模式
import "element-plus/theme-chalk/dark/css-vars.css";
// 导入图标库
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";

const app = createApp(App);

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

app
  .use(router)
  .use(pinia)
  .use(ElementPlus, { size: "small", zIndex: 3000, locale: zhCn });

app.mount("#app");
