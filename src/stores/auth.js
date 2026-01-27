import { defineStore } from 'pinia'
import { login } from '@/api/modules/auth'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        token: localStorage.getItem('token') || '',
        isAuthenticated: false
    }),
    actions: {
        async login(username, password) {
            try {
                const response = await login(username, password)
                // Adjust based on actual response structure
                // Assuming response contains token or user info
                this.isAuthenticated = true
                // this.token = response.token
                // localStorage.setItem('token', response.token)
                return response
            } catch (error) {
                throw error
            }
        },
        logout() {
            this.user = null
            this.token = ''
            this.isAuthenticated = false
            localStorage.removeItem('token')
        }
    },
    persist: true
})
