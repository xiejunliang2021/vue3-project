import axios from "axios";

// =========================进行基本的配置=========================
// 后端接口域名的配置
axios.defaults.baseURL = "http://168.138.5.55:8000";

// axios默认请求成功的情况
axios.defaults.validateStatus = function (status) {
  return true;
};

// 默认跨域请求需要携带token的配置
axios.defaults.withCredentials = true;

// 添加请求拦截器
axios.interceptors.request.use(
  function (config) {
    // 在发送请求之前做些什么

    return config;
  },
  function (error) {
    // 对请求错误做些什么

    return Promise.reject(error);
  }
);

// 添加响应拦截器

axios.interceptors.response.use(
  function (response) {
    // 2xx 范围内的状态码都会触发该函数。

    // 对响应数据做点什么

    return response;
  },
  function (error) {
    // 超出 2xx 范围的状态码都会触发该函数。

    // 对响应错误做点什么

    return Promise.reject(error);
  }
);

// 后端请求的接口
// const axios = require('axios')
export default {
  Login() {
    return axios.post("/api/users/login/", {
      username: "zhangyuanyuan",
      password: "19850206xjl",
    });
  },
  get_stock(start_date) {
    return axios.post("/api/basics/analyze/", {
      start_date: start_date,
    });
  },
  get_date_is_open(date) {
    return axios.get("/api/basics/date_is_open/", {
      params: {
        date: date,
      },
    });
  },
};
