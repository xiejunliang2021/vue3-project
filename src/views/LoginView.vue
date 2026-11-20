<template>
  <div class="min-h-screen bg-[#090D16] tech-grid-bg flex items-center justify-center p-4 relative overflow-hidden text-slate-100">
    <!-- Ambient Tech Glow Orbs -->
    <div class="absolute -top-32 -left-32 w-96 h-96 bg-indigo-500/15 rounded-full blur-[120px] pointer-events-none"></div>
    <div class="absolute -bottom-32 -right-32 w-96 h-96 bg-cyan-500/15 rounded-full blur-[120px] pointer-events-none"></div>

    <!-- Login Container Card -->
    <div class="relative z-10 w-full max-w-md p-8 sm:p-10 rounded-2xl glass-panel shadow-2xl border border-slate-800/80">
      <!-- Brand Header -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 border border-indigo-500/30 text-indigo-400 mb-4 shadow-lg shadow-indigo-500/10">
          <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        <h1 class="text-2xl font-bold tracking-tight text-white">花本无心 · 智算云</h1>
        <p class="text-xs text-slate-400 mt-1.5">企业级订阅与量化平台统一身份认证</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-5">
        <!-- Access Key Input -->
        <div>
          <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">安全访问密钥 (Access Key)</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <input 
              v-model="loginKey"
              type="password" 
              required
              class="block w-full pl-10 pr-4 py-3 bg-slate-950/70 border border-slate-800 text-slate-100 placeholder-slate-500 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm font-mono transition-all"
              placeholder="请输入系统授权 Key"
            />
          </div>
        </div>

        <!-- Submit Button -->
        <button 
          type="submit" 
          :disabled="loading"
          class="saas-btn-primary w-full py-3 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <span v-if="loading" class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
          <span>{{ loading ? '正在验证身份...' : '进入云枢系统' }}</span>
          <svg v-if="!loading" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </form>

      <!-- Error message -->
      <div v-if="error" class="mt-4 p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs flex items-center gap-2">
        <svg class="w-4 h-4 shrink-0 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>认证失败: {{ error }}</span>
      </div>

      <div class="mt-8 text-center border-t border-slate-800/80 pt-6">
        <p class="text-[11px] text-slate-500 font-mono">
          SECURE SYSTEM GATEWAY // END-TO-END ENCRYPTED
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const loginKey = ref('')
const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  if (!loginKey.value.trim()) return
  loading.value = true
  error.value = ''
  try {
    await authStore.loginByKey(loginKey.value)
    router.push('/home')
  } catch (err) {
    error.value = err.response?.data?.error || err.response?.data?.message || '授权密钥无效或已过期'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* Inherits global SaaS styles */
</style>
