import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const service = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000',
    timeout: 30000,  // 增加到30秒
    withCredentials: true
})

// Request interceptor
service.interceptors.request.use(
    config => {
        // You can add token here if needed, or other headers
        // const authStore = useAuthStore()
        // if (authStore.token) {
        //   config.headers['Authorization'] = 'Bearer ' + authStore.token
        // }
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
        const res = response.data
        // You can handle custom error codes here
        return res
    },
    error => {
        console.error('Response Error:', error)
        return Promise.reject(error)
    }
)

export default service
