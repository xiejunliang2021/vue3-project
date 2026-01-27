<template>
  <div class="min-h-screen bg-matrix-bg flex items-center justify-center relative overflow-hidden">
    <!-- Matrix Digital Rain Background Canvas -->
    <canvas ref="matrixCanvas" class="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none"></canvas>
    
    <!-- Particle Background Layer (CSS or Canvas, using CSS for simplicity first) -->
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-matrix-dim/20 to-transparent"></div>

    <!-- Login Container -->
    <div class="relative z-10 w-full max-w-md p-8 glass-panel rounded-lg transform transition-all duration-500 hover:scale-[1.01]">
        <!-- Scanline Effect -->
        <div class="scanline"></div>
        
        <div class="text-center mb-10">
            <h1 class="text-4xl font-mono text-matrix-primary font-bold animate-pulse tracking-widest">SYSTEM ACCESS</h1>
            <p class="text-matrix-primary/60 text-xs mt-2 font-mono">SECURE CONNECTION REQUIRED</p>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-6">
            <!-- Username Input -->
            <div class="group relative">
                <input 
                    v-model="username"
                    type="text" 
                    required
                    class="block w-full px-4 py-3 bg-matrix-bg/50 border border-matrix-dark text-matrix-primary placeholder-matrix-primary/30 focus:outline-none focus:border-matrix-primary focus:ring-1 focus:ring-matrix-primary transition-all font-mono"
                    placeholder=" "
                />
                <label class="absolute left-4 top-3 text-matrix-primary/50 text-sm transition-all duration-300 pointer-events-none group-focus-within:-top-6 group-focus-within:text-xs group-focus-within:text-matrix-primary peer-placeholder-shown:top-3">
                    OPERATOR ID
                </label>
                <!-- Corner accents -->
                <div class="absolute top-0 left-0 w-2 h-2 border-t border-l border-matrix-primary opacity-50 group-hover:opacity-100 transition-opacity"></div>
                <div class="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-matrix-primary opacity-50 group-hover:opacity-100 transition-opacity"></div>
            </div>

            <!-- Password Input -->
            <div class="group relative">
                <input 
                    v-model="password"
                    type="password" 
                    required
                    class="block w-full px-4 py-3 bg-matrix-bg/50 border border-matrix-dark text-matrix-primary placeholder-matrix-primary/30 focus:outline-none focus:border-matrix-primary focus:ring-1 focus:ring-matrix-primary transition-all font-mono"
                    placeholder=" "
                />
                <label class="absolute left-4 top-3 text-matrix-primary/50 text-sm transition-all duration-300 pointer-events-none group-focus-within:-top-6 group-focus-within:text-xs group-focus-within:text-matrix-primary peer-placeholder-shown:top-3">
                    ACCESS CODE
                </label>
                 <!-- Corner accents -->
                 <div class="absolute top-0 left-0 w-2 h-2 border-t border-l border-matrix-primary opacity-50 group-hover:opacity-100 transition-opacity"></div>
                 <div class="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-matrix-primary opacity-50 group-hover:opacity-100 transition-opacity"></div>
            </div>

            <!-- Biometric Button -->
            <button 
                type="submit" 
                :disabled="loading"
                class="w-full relative py-4 bg-matrix-dim/30 hover:bg-matrix-primary/10 border border-matrix-primary text-matrix-primary font-mono font-bold tracking-widest uppercase transition-all duration-300 group overflow-hidden"
            >
                <div class="absolute inset-0 bg-matrix-primary/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 skew-x-12"></div>
                <span class="relative flex items-center justify-center gap-2">
                    <span v-if="loading" class="animate-spin h-4 w-4 border-2 border-matrix-primary border-t-transparent rounded-full"></span>
                    {{ loading ? 'AUTHENTICATING...' : 'INITIATE UPLINK' }}
                </span>
            </button>
        </form>

        <div v-if="error" class="mt-4 p-2 border border-red-500 bg-red-900/20 text-red-500 text-xs font-mono text-center">
            ACCESS DENIED: {{ error }}
        </div>
        
        <div class="mt-8 text-center">
             <p class="text-[10px] text-matrix-primary/30 font-mono">AUTHORIZED PERSONNEL ONLY // UNSECURED TERMINALS WILL BE TERMINATED</p>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

// Matrix Rain Effect
const matrixCanvas = ref(null)
let intervalId = null

const initMatrix = () => {
    const canvas = matrixCanvas.value
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+'
    const fontSize = 14
    const columns = canvas.width / fontSize
    
    const drops = []
    for (let i = 0; i < columns; i++) {
        drops[i] = 1
    }
    
    const draw = () => {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        
        ctx.fillStyle = '#00FF41' // Matrix Green
        ctx.font = fontSize + 'px monospace'
        
        for (let i = 0; i < drops.length; i++) {
            const text = characters.charAt(Math.floor(Math.random() * characters.length))
            ctx.fillText(text, i * fontSize, drops[i] * fontSize)
            
            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0
            }
            drops[i]++
        }
    }
    
    intervalId = setInterval(draw, 33)
}

const handleResize = () => {
    if(matrixCanvas.value) {
        matrixCanvas.value.width = window.innerWidth
        matrixCanvas.value.height = window.innerHeight
    }
}

onMounted(() => {
    initMatrix()
    window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
    if (intervalId) clearInterval(intervalId)
    window.removeEventListener('resize', handleResize)
})

const handleLogin = async () => {
    loading.value = true
    error.value = ''
    try {
        await authStore.login(username.value, password.value)
        // Simulate scanning delay for effect
        setTimeout(() => {
             router.push('/home') // Or Portal
        }, 800)
    } catch (err) {
        error.value = err.response?.data?.message || 'INVALID CREDENTIALS'
    } finally {
        loading.value = false
    }
}
</script>

<style scoped>
/* Optional: specific view styles if not covered by global design system */
</style>
