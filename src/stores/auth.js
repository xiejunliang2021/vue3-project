import { defineStore } from 'pinia'
import { login } from '@/api/modules/auth'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: JSON.parse(localStorage.getItem('user')) || null,
        accessToken: localStorage.getItem('accessToken') || '',
        refreshToken: localStorage.getItem('refreshToken') || '',
        isAuthenticated: !!localStorage.getItem('accessToken')
    }),

    getters: {
        isLoggedIn: (state) => state.isAuthenticated && !!state.accessToken,
        currentUser: (state) => state.user,
        token: (state) => state.accessToken
    },

    actions: {
        async login(username, password) {
            try {
                const response = await login(username, password)

                // 后端返回格式: { access, refresh, user }
                this.accessToken = response.access
                this.refreshToken = response.refresh
                this.user = response.user
                this.isAuthenticated = true

                // 持久化到 localStorage
                localStorage.setItem('accessToken', response.access)
                localStorage.setItem('refreshToken', response.refresh)
                localStorage.setItem('user', JSON.stringify(response.user))

                return response
            } catch (error) {
                this.logout()
                throw error
            }
        },

        logout() {
            this.user = null
            this.accessToken = ''
            this.refreshToken = ''
            this.isAuthenticated = false

            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            localStorage.removeItem('user')
        },

        // 更新 token（用于刷新）
        setTokens(access, refresh) {
            this.accessToken = access
            if (refresh) {
                this.refreshToken = refresh
                localStorage.setItem('refreshToken', refresh)
            }
            localStorage.setItem('accessToken', access)
            this.isAuthenticated = true
        }
    }
})
