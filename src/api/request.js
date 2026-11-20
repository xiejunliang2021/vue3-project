import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import router from '@/router/router'

const service = axios.create({
    // 生产环境默认走同源 /api 代理，避免把浏览器请求指向本机 localhost 导致登录永远失败
    baseURL: import.meta.env.VITE_API_BASE_URL || '/',
    timeout: 30000,
    withCredentials: true
})

// Request interceptor
service.interceptors.request.use(
    config => {
        // 添加 Bearer Token
        const authStore = useAuthStore()
        if (authStore.accessToken) {
            config.headers['Authorization'] = 'Bearer ' + authStore.accessToken
        }
        return config
    },
    error => {
        console.error('Request Error:', error)
        return Promise.reject(error)
    }
)

// Response interceptor
service.interceptors.response.use(
    response => {
        return response.data
    },
    async error => {
        console.error('Response Error:', error)

        // 处理 401 未授权错误
        if (error.response && error.response.status === 401) {
            const authStore = useAuthStore()
            authStore.logout()

            // 重定向到登录页
            if (router.currentRoute.value.path !== '/login') {
                router.push('/login')
            }
        }

        return Promise.reject(error)
    }
)

export default service

