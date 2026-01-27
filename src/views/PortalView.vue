<template>
  <div class="min-h-screen bg-matrix-bg flex flex-col relative overflow-hidden">
    <!-- Matrix Rain Canvas -->
    <canvas ref="matrixCanvas" class="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none"></canvas>

    <!-- Header -->
    <header class="relative z-20 flex justify-between items-center p-6 border-b border-matrix-dark bg-matrix-bg/80 backdrop-blur-sm">
        <div class="flex items-center gap-4">
             <div class="w-3 h-3 bg-matrix-primary rounded-full animate-pulse shadow-[0_0_10px_#00FF41]"></div>
             <h1 class="text-2xl font-mono font-bold text-matrix-primary tracking-widest">XSZR PORTAL</h1>
        </div>
        <div class="flex items-center gap-4 font-mono text-xs text-matrix-primary/70">
             <span>SYSTEM: ONLINE</span>
             <span>USER: {{ authStore.user?.username || 'ADMIN' }}</span>
             <button @click="logout" class="hover:text-red-500 transition-colors">[ KILL SESSION ]</button>
        </div>
    </header>

    <!-- Main Grid Content -->
    <main class="relative z-10 flex-1 p-10 flex items-center justify-center">
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-6xl">
            
            <!-- Static App Links -->
            <router-link to="/stock" class="group relative aspect-video glass-panel rounded-lg flex flex-col items-center justify-center hover:bg-matrix-primary/5 transition-all duration-300 hover:scale-105 cursor-pointer border border-matrix-dim hover:border-matrix-primary">
                <div class="text-4xl mb-4 group-hover:scale-110 transition-transform">📈</div>
                <span class="font-mono text-xl text-matrix-primary group-hover:shadow-[0_0_8px_#00FF41] transition-all">STOCK DASHBOARD</span>
                <p class="text-[10px] text-matrix-primary/50 mt-2 font-mono">A-SHARE / BACKTEST / ANALYTICS</p>
                <!-- Corner Accents -->
                <div class="absolute top-2 left-2 w-2 h-2 border-t border-l border-matrix-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div class="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-matrix-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </router-link>

            <router-link to="/favorites/study" class="group relative aspect-video glass-panel rounded-lg flex flex-col items-center justify-center hover:bg-matrix-primary/5 transition-all duration-300 hover:scale-105 cursor-pointer border border-matrix-dim hover:border-matrix-primary">
                 <div class="text-4xl mb-4 group-hover:scale-110 transition-transform">📚</div>
                <span class="font-mono text-xl text-center text-matrix-primary">KNOWLEDGE BASE</span>
            </router-link>

             <!-- Dynamic Links -->
             <a v-for="(link, index) in customLinks" :key="index" :href="link.url" target="_blank" class="group relative aspect-video glass-panel rounded-lg flex flex-col items-center justify-center hover:bg-matrix-primary/5 transition-all duration-300 hover:scale-105 cursor-pointer border border-matrix-dim hover:border-matrix-primary">
                <div class="text-4xl mb-4 group-hover:scale-110 transition-transform">🔗</div>
                <span class="font-mono text-lg text-matrix-primary truncate max-w-[80%]">{{ link.name }}</span>
                <button @click.prevent="removeLink(index)" class="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 hover:text-red-400 text-xs">[DEL]</button>
            </a>

            <!-- Add Link Button -->
            <button @click="showAddModal = true" class="aspect-video border-2 border-dashed border-matrix-dim rounded-lg flex flex-col items-center justify-center hover:border-matrix-primary hover:bg-matrix-primary/5 transition-all group">
                <div class="text-4xl text-matrix-dim group-hover:text-matrix-primary transition-colors">+</div>
                <span class="font-mono text-sm text-matrix-dim group-hover:text-matrix-primary mt-2">ADD MODULE</span>
            </button>
        </div>
    </main>

    <!-- Scanline -->
    <div class="scanline"></div>

    <!-- Add Link Modal -->
    <div v-if="showAddModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div class="glass-panel p-8 rounded-lg w-96 border border-matrix-primary shadow-[0_0_20px_rgba(0,255,65,0.2)]">
            <h3 class="text-xl font-mono text-matrix-primary mb-6 border-b border-matrix-dim pb-2">CONFIGURE NEW LINK</h3>
            
            <div class="space-y-4">
                <div>
                    <label class="block text-xs font-mono text-matrix-primary/70 mb-1">MODULE NAME</label>
                    <input v-model="newLink.name" type="text" class="w-full bg-black/50 border border-matrix-dim p-2 text-matrix-primary focus:border-matrix-primary outline-none font-mono text-sm" placeholder="e.g. GitHub">
                </div>
                <div>
                    <label class="block text-xs font-mono text-matrix-primary/70 mb-1">TARGET URL</label>
                    <input v-model="newLink.url" type="text" class="w-full bg-black/50 border border-matrix-dim p-2 text-matrix-primary focus:border-matrix-primary outline-none font-mono text-sm" placeholder="https://...">
                </div>
            </div>

            <div class="flex justify-end gap-4 mt-8">
                <button @click="showAddModal = false" class="text-matrix-primary/50 hover:text-matrix-primary font-mono text-sm">CANCEL</button>
                <button @click="addLink" class="bg-matrix-primary/20 hover:bg-matrix-primary/40 px-6 py-2 border border-matrix-primary text-matrix-primary font-mono text-sm">CONFIRM</button>
            </div>
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

const matrixCanvas = ref(null)
const showAddModal = ref(false)
const customLinks = ref([])
const newLink = ref({ name: '', url: '' })

let intervalId = null

// Load links from keys
const loadLinks = () => {
    const saved = localStorage.getItem('portal_links')
    if (saved) {
        customLinks.value = JSON.parse(saved)
    }
}

const addLink = () => {
    if (newLink.value.name && newLink.value.url) {
        customLinks.value.push({ ...newLink.value })
        localStorage.setItem('portal_links', JSON.stringify(customLinks.value))
        newLink.value = { name: '', url: '' }
        showAddModal.value = false
    }
}

const removeLink = (index) => {
    customLinks.value.splice(index, 1)
    localStorage.setItem('portal_links', JSON.stringify(customLinks.value))
}

const logout = () => {
    authStore.logout()
    router.push('/login')
}

// Reuse Matrix Logic (can be abstracted into composable later)
const initMatrix = () => {
    const canvas = matrixCanvas.value
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    const characters = '01' // Binary for portal
    const fontSize = 16
    const columns = canvas.width / fontSize
    const drops = []
    for (let i = 0; i < columns; i++) drops[i] = 1
    
    const draw = () => {
        ctx.fillStyle = 'rgba(13, 2, 8, 0.05)' // Dark Fade
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.fillStyle = '#008F11' // Darker Green for background
        ctx.font = fontSize + 'px monospace'
        for (let i = 0; i < drops.length; i++) {
            const text = characters.charAt(Math.floor(Math.random() * characters.length))
            ctx.fillText(text, i * fontSize, drops[i] * fontSize)
            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0
            drops[i]++
        }
    }
    intervalId = setInterval(draw, 50)
}

const handleResize = () => {
    if(matrixCanvas.value) {
        matrixCanvas.value.width = window.innerWidth
        matrixCanvas.value.height = window.innerHeight
    }
}

onMounted(() => {
    loadLinks()
    initMatrix()
    window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
    if (intervalId) clearInterval(intervalId)
    window.removeEventListener('resize', handleResize)
})
</script>
