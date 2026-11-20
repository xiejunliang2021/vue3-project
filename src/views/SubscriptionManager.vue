<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  getProfiles,
  createProfile,
  updateProfile,
  patchProfile,
  deleteProfile,
  refreshProfileToken
} from '@/api/modules/subscription'

// ==========================================
// 状态与响应式数据
// ==========================================
const loading = ref(false)
const profileList = ref([])

// 搜索过滤与分页
const searchKeyword = ref('')
const filteredProfiles = computed(() => {
  if (!searchKeyword.value.trim()) return profileList.value
  const kw = searchKeyword.value.toLowerCase().trim()
  return profileList.value.filter(item =>
    (item.name && item.name.toLowerCase().includes(kw)) ||
    (item.token && item.token.toLowerCase().includes(kw))
  )
})

// 弹窗状态 (新建 / 编辑)
const dialogVisible = ref(false)
const isSubmitting = ref(false)
const isEditMode = ref(false)
const currentEditId = ref(null)

const formData = reactive({
  name: '',
  raw_nodes: '',
  preferred_domains: '',
  preferred_ips: '',
  is_active: true
})

// 单项操作 loading 记录 (防重复点击)
const actionLoading = reactive({})

// 自定义轻量 Toast
const toast = ref({
  show: false,
  message: '',
  type: 'success',
  timer: null
})

const showToast = (message, type = 'success', duration = 2500) => {
  if (toast.value.timer) clearTimeout(toast.value.timer)
  toast.value = {
    show: true,
    message,
    type,
    timer: setTimeout(() => {
      toast.value.show = false
    }, duration)
  }
}

// ==========================================
// 文本行数与统计辅助
// ==========================================
const normalizeLines = (value, mode = 'plain') => {
  const seen = new Set()
  return parseCleanLines(value).filter(line => {
    let key = line
    if (mode === 'target') {
      const target = line.replace(/^https?:\/\//i, '').split('#', 1)[0].trim().replace(/\/+$/, '').toLowerCase()
      key = target.includes(':') ? target : `${target}:443`
      line = key
    } else if (mode === 'node') {
      const hashIndex = line.indexOf('#')
      if (/^(vless|trojan|hysteria2|tuic):\/\//i.test(line) && hashIndex >= 0) key = line.slice(0, hashIndex)
    }
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

const cleanFormData = () => {
  formData.raw_nodes = normalizeLines(formData.raw_nodes, 'node').join('\n')
  formData.preferred_domains = normalizeLines(formData.preferred_domains, 'target').join('\n')
  formData.preferred_ips = normalizeLines(formData.preferred_ips, 'target').join('\n')
}

const dedupFormField = (field, mode) => {
  const before = parseCleanLines(formData[field]).length
  formData[field] = normalizeLines(formData[field], mode).join('\n')
  const removed = before - parseCleanLines(formData[field]).length
  showToast(`已清理 ${removed} 条重复/无效数据`, 'success')
}

const parseCleanLines = (str) => {
  if (!str) return []
  return str
    .replace(/\\r\\n|\\n|\\r/g, '\n')
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.length > 0 && !line.startsWith('#') && !line.startsWith('//'))
}

const formRawNodesCount = computed(() => parseCleanLines(formData.raw_nodes).length)
const formDomainsCount = computed(() => parseCleanLines(formData.preferred_domains).length)
const formIpsCount = computed(() => parseCleanLines(formData.preferred_ips).length)

// 计算单项配置生成的总预估节点数
const getEstimatedNodeCount = (item) => {
  if (item.node_count !== undefined && item.node_count !== null) {
    return item.node_count
  }
  const raw = parseCleanLines(item.raw_nodes).length
  const dom = parseCleanLines(item.preferred_domains).length
  const ips = parseCleanLines(item.preferred_ips).length
  const targets = dom + ips
  if (raw === 0) return 0
  if (targets === 0) return raw
  return raw * targets
}

// 时间格式化
const formatDateTime = (dateStr) => {
  if (!dateStr) return '-'
  try {
    const d = new Date(dateStr)
    return d.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
  } catch (e) {
    return dateStr
  }
}

// ==========================================
// 剪贴板复制封装 (原生 API + 降级兼容)
// ==========================================
const copyToClipboard = async (text, label = '内容') => {
  if (!text || !text.trim()) {
    showToast(`${label}为空，无法复制`, 'error')
    return
  }

  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
    } else {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'
      ta.style.left = '-9999px'
      ta.style.top = '-9999px'
      document.body.appendChild(ta)
      ta.select()
      const successful = document.execCommand('copy')
      document.body.removeChild(ta)
      if (!successful) throw new Error('execCommand copy failed')
    }
    showToast(`已成功复制 ${label} 到剪贴板！`, 'success')
  } catch (err) {
    console.error('Copy failed:', err)
    showToast(`复制失败，请手动选中文本复制`, 'error')
  }
}

// ==========================================
// API 交互：拉取配置列表
// ==========================================
const fetchProfiles = async () => {
  loading.value = true
  try {
    const res = await getProfiles()
    if (Array.isArray(res)) {
      profileList.value = res
    } else if (res && res.results && Array.isArray(res.results)) {
      profileList.value = res.results
    } else if (res && res.data && Array.isArray(res.data)) {
      profileList.value = res.data
    } else {
      profileList.value = []
    }
  } catch (err) {
    console.error('Fetch profiles error:', err)
    showToast('获取订阅列表失败：' + (err.message || '网络或认证异常'), 'error')
  } finally {
    loading.value = false
  }
}

// ==========================================
// API 交互：开关状态即时 PATCH 更新
// ==========================================
const handleStatusChange = async (row) => {
  actionLoading[row.id] = true
  const nextStatus = row.is_active
  try {
    await patchProfile(row.id, { is_active: nextStatus })
    showToast(`配置 [${row.name}] 已${nextStatus ? '启用' : '禁用'}`, 'success')
  } catch (err) {
    console.error('Patch status error:', err)
    row.is_active = !nextStatus // 回滚前端开关状态
    showToast('更新状态失败：' + (err.message || '后端异常'), 'error')
  } finally {
    actionLoading[row.id] = false
  }
}

// ==========================================
// API 交互：【重置 UUID】二次危险确认与执行
// ==========================================
const handleRefreshToken = (row) => {
  ElMessageBox.confirm(
    '重置后旧订阅链接将立即失效，所有客户端（如 Clash / Shadowrocket / v2rayN）必须更新订阅地址，是否确认重新生成？',
    '⚠️ 危险操作：确认重置订阅 Token？',
    {
      confirmButtonText: '确认重新生成',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--danger',
      roundButton: true,
      customClass: 'glass-confirm-box'
    }
  ).then(async () => {
    actionLoading[`refresh_${row.id}`] = true
    try {
      const res = await refreshProfileToken(row.id)
      if (res && res.token) {
        // 实时更新当前行数据
        row.token = res.token
        if (res.subscription_url) {
          row.subscription_url = res.subscription_url
        }
        if (res.updated_at) {
          row.updated_at = res.updated_at
        }
        showToast(`配置 [${row.name}] 的 UUID 已成功重置！`, 'success')
        ElMessage.success({
          message: 'UUID 已更新，请及时替换客户端订阅地址',
          duration: 3000
        })
      } else {
        await fetchProfiles()
        showToast('UUID 已更新', 'success')
      }
    } catch (err) {
      console.error('Refresh token error:', err)
      showToast('重置 UUID 失败：' + (err.message || '网络错误'), 'error')
    } finally {
      actionLoading[`refresh_${row.id}`] = false
    }
  }).catch(() => {
    // 用户取消操作
  })
}

// ==========================================
// API 交互：【删除配置】二次确认与执行
// ==========================================
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要永久删除订阅配置 [${row.name}] 吗？删除后该订阅链接将彻底失效且无法恢复。`,
    '确认删除订阅配置',
    {
      confirmButtonText: '彻底删除',
      cancelButtonText: '取消',
      type: 'error',
      confirmButtonClass: 'el-button--danger',
      roundButton: true
    }
  ).then(async () => {
    actionLoading[`delete_${row.id}`] = true
    try {
      await deleteProfile(row.id)
      showToast(`配置 [${row.name}] 已删除`, 'success')
      await fetchProfiles()
    } catch (err) {
      console.error('Delete profile error:', err)
      showToast('删除失败：' + (err.message || '后端异常'), 'error')
    } finally {
      actionLoading[`delete_${row.id}`] = false
    }
  }).catch(() => {})
}

// ==========================================
// 新建与编辑表单处理
// ==========================================
const openCreateDialog = () => {
  isEditMode.value = false
  currentEditId.value = null
  formData.name = ''
  formData.raw_nodes = ''
  formData.preferred_domains = ''
  formData.preferred_ips = ''
  formData.is_active = true
  dialogVisible.value = true
}

const openEditDialog = (row) => {
  isEditMode.value = true
  currentEditId.value = row.id
  formData.name = row.name || ''
  formData.raw_nodes = row.raw_nodes || ''
  formData.preferred_domains = row.preferred_domains || ''
  formData.preferred_ips = row.preferred_ips || ''
  formData.is_active = row.is_active !== undefined ? row.is_active : true
  dialogVisible.value = true
}

const handleSaveProfile = async () => {
  cleanFormData()
  if (!formData.name.trim()) {
    showToast('请输入配置名称', 'error')
    return
  }

  isSubmitting.value = true
  try {
    const payload = {
      name: formData.name.trim(),
      raw_nodes: formData.raw_nodes,
      preferred_domains: formData.preferred_domains,
      preferred_ips: formData.preferred_ips,
      is_active: formData.is_active
    }

    if (isEditMode.value) {
      await updateProfile(currentEditId.value, payload)
      showToast('订阅配置已成功更新！', 'success')
    } else {
      await createProfile(payload)
      showToast('新订阅配置已创建！', 'success')
    }

    dialogVisible.value = false
    await fetchProfiles()
  } catch (err) {
    console.error('Save profile error:', err)
    showToast('保存失败：' + (err.message || '后端响应异常'), 'error')
  } finally {
    isSubmitting.value = false
  }
}

// 快速填入测试示例
const fillFormSample = () => {
  if (!formData.name) formData.name = '香港-CF优选专线-01'
  formData.raw_nodes = `vless://e408d669-8bc3-48b4-a631-f5b248a391c0@origin-sg.example.com:443?encryption=none&security=tls&type=ws&host=origin-sg.example.com&path=%2Fstream#新加坡01-原生
vless://93b5a742-1271-4a18-97dc-35ecb265aa11@origin-hk.example.com:443?encryption=none&security=tls&type=ws&host=origin-hk.example.com&path=%2Fws#香港02-高速`

  formData.preferred_domains = `hk.cf.example.com
sg-speed.cloudflare.net`

  formData.preferred_ips = `104.16.88.99
104.17.201.45
162.159.192.1`
}

onMounted(() => {
  fetchProfiles()
})
</script>

<template>
  <div class="glass-page-container min-h-screen text-slate-100 p-4 sm:p-6 lg:p-8 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">

    <!-- 顶部背景流光光斑 -->
    <div class="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div class="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div class="absolute top-1/3 -right-40 w-[30rem] h-[30rem] bg-indigo-500/10 rounded-full blur-3xl"></div>
      <div class="absolute -bottom-40 left-1/3 w-[36rem] h-[36rem] bg-emerald-500/10 rounded-full blur-3xl"></div>
    </div>

    <div class="relative z-10 max-w-7xl mx-auto space-y-6">

      <!-- ========================================== -->
      <!-- 顶部标题与操作栏 -->
      <!-- ========================================== -->
      <header class="glass-card p-5 sm:p-6 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div class="flex items-center gap-3.5">
          <div class="w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 border border-cyan-400/40">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <div class="flex items-center gap-2.5">
              <h1 class="text-lg sm:text-xl font-bold tracking-tight text-white">专属订阅管理</h1>
              <span class="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-mono">
                Profiles CRUD
              </span>
            </div>
            <p class="text-xs text-slate-400 mt-0.5">
              集中维护专属订阅方案 · 远端独立后端落库 · 安全重置 UUID · 客户端直连分发
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <!-- 搜索输入框 -->
          <div class="relative w-48 sm:w-60">
            <input
              v-model="searchKeyword"
              type="text"
              placeholder="搜索配置名称或 Token..."
              class="glass-input w-full pl-3 pr-8 py-2 rounded-xl text-xs sm:text-sm"
            />
            <svg class="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <!-- 刷新按钮 -->
          <button
            @click="fetchProfiles"
            :disabled="loading"
            class="glass-btn-secondary px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-1.5"
            title="刷新订阅列表"
          >
            <svg
              class="w-4 h-4 transition-transform duration-500"
              :class="{ 'animate-spin text-cyan-400': loading }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>刷新</span>
          </button>

          <!-- 新建订阅按钮 -->
          <button
            @click="openCreateDialog"
            class="glass-btn-primary px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-lg shadow-cyan-500/20"
          >
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>新建订阅</span>
          </button>
        </div>
      </header>

      <!-- ========================================== -->
      <!-- 订阅方案卡片列表展示区 (响应式网格) -->
      <!-- ========================================== -->
      <section v-if="loading && profileList.length === 0" class="glass-card p-12 rounded-2xl flex flex-col items-center justify-center space-y-3">
        <svg class="w-8 h-8 text-cyan-400 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
        </svg>
        <span class="text-sm text-slate-400 font-mono">正在连接远端后端加载订阅配置...</span>
      </section>

      <!-- 空状态 -->
      <section v-else-if="filteredProfiles.length === 0" class="glass-card p-12 rounded-2xl text-center space-y-4">
        <div class="w-16 h-16 mx-auto rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <div>
          <h3 class="text-base font-semibold text-white">暂无订阅配置</h3>
          <p class="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            当前后端尚未创建任何专属订阅。点击下方按钮新建配置，配置后即可生成永久专享客户端拉取链接。
          </p>
        </div>
        <button
          @click="openCreateDialog"
          class="glass-btn-primary px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold inline-flex items-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>立即新建第一套订阅方案</span>
        </button>
      </section>

      <!-- 列表网格卡片 -->
      <section v-else class="space-y-4">
        <div
          v-for="item in filteredProfiles"
          :key="item.id"
          class="glass-card p-5 sm:p-6 rounded-2xl transition-all duration-300 hover:border-cyan-500/40 relative overflow-hidden group"
        >
          <!-- 顶部状态指示横条 -->
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <!-- 方案名称与状态徽章 -->
            <div class="flex items-center gap-3">
              <div
                class="w-3 h-3 rounded-full flex-shrink-0"
                :class="item.is_active ? 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]' : 'bg-slate-500'"
              ></div>
              <h2 class="text-base sm:text-lg font-bold text-white tracking-wide flex items-center gap-2">
                {{ item.name }}
                <span class="text-xs font-normal text-slate-400 font-mono">#{{ item.id }}</span>
              </h2>

              <!-- 启用状态切换 Switch -->
              <div class="flex items-center gap-2 ml-2 pl-3 border-l border-white/10">
                <el-switch
                  v-model="item.is_active"
                  :loading="actionLoading[item.id]"
                  @change="handleStatusChange(item)"
                  active-color="#10B981"
                  inactive-color="#475569"
                  size="small"
                />
                <span class="text-xs font-medium" :class="item.is_active ? 'text-emerald-300' : 'text-slate-400'">
                  {{ item.is_active ? '已启用' : '已停用' }}
                </span>
              </div>
            </div>

            <!-- 数据统计徽章群 -->
            <div class="flex flex-wrap items-center gap-2 text-xs">
              <!-- 原始节点数 -->
              <span class="px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-mono">
                原始节点: <b class="font-bold">{{ parseCleanLines(item.raw_nodes).length }}</b>
              </span>
              <!-- 优选域名数 -->
              <span class="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-mono">
                优选域名: <b class="font-bold">{{ parseCleanLines(item.preferred_domains).length }}</b>
              </span>
              <!-- 优选 IP 数 -->
              <span class="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono">
                优选 IP: <b class="font-bold">{{ parseCleanLines(item.preferred_ips).length }}</b>
              </span>
              <!-- 组合总数 -->
              <span class="px-2.5 py-1 rounded-lg bg-purple-500/15 text-purple-300 border border-purple-500/30 font-mono">
                组合总数: <b class="font-bold text-white">{{ getEstimatedNodeCount(item) }}</b>
              </span>
              <!-- 更新时间 -->
              <span class="text-slate-400 text-[11px] ml-1 hidden sm:inline">
                更新于: {{ formatDateTime(item.updated_at) }}
              </span>
            </div>
          </div>

          <!-- 核心订阅链接直显与复制栏 -->
          <div class="py-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div class="flex-1 min-w-0 bg-black/30 p-3 rounded-xl border border-white/5 flex items-center gap-3">
              <span class="text-xs font-semibold uppercase tracking-wider text-cyan-400 flex-shrink-0 font-mono flex items-center gap-1.5">
                <svg class="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                专属订阅链接
              </span>
              <span class="text-xs sm:text-sm font-mono text-slate-200 truncate select-all flex-1">
                {{ item.subscription_url || `/api/sub/${item.token}/` }}
              </span>
              <button
                @click="copyToClipboard(item.subscription_url || item.token, `[${item.name}] 订阅链接`)"
                class="glass-btn-accent px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 flex-shrink-0"
              >
                <svg class="w-3.5 h-3.5 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>复制链接</span>
              </button>
            </div>
          </div>

          <!-- 底部 Token 展示与操作按钮组 -->
          <div class="pt-3 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div class="flex items-center gap-2 text-slate-400 font-mono text-[11px] truncate">
              <span>Token:</span>
              <span class="text-slate-300 select-all">{{ item.token }}</span>
            </div>

            <!-- 操作栏按钮群 -->
            <div class="flex items-center gap-2 self-end sm:self-auto">
              <!-- 编辑按钮 -->
              <button
                @click="openEditDialog(item)"
                class="glass-btn-secondary px-3 py-1.5 rounded-lg font-medium flex items-center gap-1 text-slate-200 hover:text-white"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>编辑</span>
              </button>

              <!-- 【重置 UUID】高危操作 -->
              <button
                @click="handleRefreshToken(item)"
                :disabled="actionLoading[`refresh_${item.id}`]"
                class="glass-btn-warning px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5"
                title="生成新 Token，旧订阅立即失效"
              >
                <svg
                  class="w-3.5 h-3.5 text-amber-400"
                  :class="{ 'animate-spin': actionLoading[`refresh_${item.id}`] }"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>{{ actionLoading[`refresh_${item.id}`] ? '重置中...' : '重置 UUID' }}</span>
              </button>

              <!-- 删除按钮 -->
              <button
                @click="handleDelete(item)"
                :disabled="actionLoading[`delete_${item.id}`]"
                class="glass-btn-danger px-3 py-1.5 rounded-lg font-medium flex items-center gap-1"
              >
                <svg class="w-3.5 h-3.5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>删除</span>
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>

    <!-- ========================================== -->
    <!-- 新建 / 编辑 弹窗 (Modal) -->
    <!-- ========================================== -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEditMode ? '编辑订阅方案' : '新建专属订阅方案'"
      width="780px"
      append-to-body
      destroy-on-close
      class="glass-dialog"
    >
      <div class="space-y-4 py-1 text-slate-200">

        <!-- 配置名称与状态 -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="flex-1">
            <label class="block text-xs font-semibold text-slate-300 mb-1.5">
              配置备注名称 <span class="text-rose-400">*</span>
            </label>
            <input
              v-model="formData.name"
              type="text"
              placeholder="例如：手机专享-香港CF高优"
              class="glass-input w-full px-3.5 py-2 rounded-xl text-sm"
            />
          </div>

          <div class="sm:pt-5 flex items-center gap-2">
            <el-switch
              v-model="formData.is_active"
              active-color="#10B981"
              inactive-color="#475569"
            />
            <span class="text-xs font-medium text-slate-300">
              {{ formData.is_active ? '立即激活' : '暂时禁用' }}
            </span>
            <button
              v-if="!isEditMode"
              @click="fillFormSample"
              type="button"
              class="text-xs text-cyan-400 hover:text-cyan-300 underline ml-2"
            >
              填充样例
            </button>
          </div>
        </div>

        <!-- 原始节点列表 -->
        <div>
          <div class="flex items-center justify-between mb-1.5">
            <label class="text-xs font-semibold text-slate-300 flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-cyan-400"></span>
              原始节点列表 (每行一个链接)
            </label>
            <button
              @click="dedupFormField('raw_nodes', 'node')"
              class="text-[11px] text-cyan-300 hover:text-white"
            >一键去重</button>
            <span class="text-xs font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
              已录入 {{ formRawNodesCount }} 个节点
            </span>
          </div>
          <textarea
            v-model="formData.raw_nodes"
            rows="6"
            placeholder="vless://...&#10;vmess://...&#10;trojan://..."
            class="glass-textarea w-full p-3 rounded-xl text-xs font-mono"
            spellcheck="false"
          ></textarea>
        </div>

        <!-- 优选域名列表 -->
        <div>
          <div class="flex items-center justify-between mb-1.5">
            <label class="text-xs font-semibold text-slate-300 flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-indigo-400"></span>
              优选域名列表 (每行一个，可带端口如 domain.com:8443)
            </label>
            <button
              @click="dedupFormField('preferred_domains', 'target')"
              class="text-[11px] text-cyan-300 hover:text-white"
            >一键去重</button>
            <span class="text-xs font-mono px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
              已录入 {{ formDomainsCount }} 个域名
            </span>
          </div>
          <textarea
            v-model="formData.preferred_domains"
            rows="4"
            placeholder="hk.cf.example.com&#10;sg-speed.cloudflare.net"
            class="glass-textarea w-full p-3 rounded-xl text-xs font-mono"
            spellcheck="false"
          ></textarea>
        </div>

        <!-- 优选 IP 列表 -->
        <div>
          <div class="flex items-center justify-between mb-1.5">
            <label class="text-xs font-semibold text-slate-300 flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
              优选 IP 列表 (每行一个，可带端口如 104.16.1.1:443)
            </label>
            <button
              @click="dedupFormField('preferred_ips', 'target')"
              class="text-[11px] text-cyan-300 hover:text-white"
            >一键去重</button>
            <span class="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              已录入 {{ formIpsCount }} 个 IP
            </span>
          </div>
          <textarea
            v-model="formData.preferred_ips"
            rows="4"
            placeholder="104.16.88.99&#10;104.17.201.45&#10;162.159.192.1"
            class="glass-textarea w-full p-3 rounded-xl text-xs font-mono"
            spellcheck="false"
          ></textarea>
        </div>

      </div>

      <template #footer>
        <div class="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
          <button
            @click="dialogVisible = false"
            class="glass-btn-secondary px-4 py-2 rounded-xl text-xs sm:text-sm font-medium"
          >
            取消
          </button>
          <button
            @click="handleSaveProfile"
            :disabled="isSubmitting || !formData.name.trim()"
            class="glass-btn-primary px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2"
          >
            <svg v-if="isSubmitting" class="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
            <span>{{ isSubmitting ? '保存中...' : (isEditMode ? '保存修改' : '确认创建') }}</span>
          </button>
        </div>
      </template>
    </el-dialog>

    <!-- ========================================== -->
    <!-- 原生玻璃风 Toast 提示框 -->
    <!-- ========================================== -->
    <transition name="toast-fade">
      <div
        v-if="toast.show"
        class="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl glass-toast shadow-2xl border"
        :class="{
          'border-emerald-500/40 text-emerald-300': toast.type === 'success',
          'border-cyan-500/40 text-cyan-300': toast.type === 'info',
          'border-rose-500/40 text-rose-300': toast.type === 'error'
        }"
      >
        <div class="w-2 h-2 rounded-full" :class="{
          'bg-emerald-400': toast.type === 'success',
          'bg-cyan-400': toast.type === 'info',
          'bg-rose-400': toast.type === 'error'
        }"></div>
        <span class="text-xs sm:text-sm font-medium">{{ toast.message }}</span>
      </div>
    </transition>

  </div>
</template>

<style scoped>
/* 页面背景 */
.glass-page-container {
  background: radial-gradient(circle at 15% 15%, rgba(6, 182, 212, 0.08) 0%, transparent 40%),
              radial-gradient(circle at 85% 85%, rgba(99, 102, 241, 0.08) 0%, transparent 40%),
              linear-gradient(135deg, #090d16 0%, #0f172a 50%, #0b1120 100%);
}

/* 玻璃卡片 */
.glass-card {
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.09);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.38);
  transition: all 0.2s ease;
}

/* 玻璃输入控件 */
.glass-input {
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #f8fafc;
  outline: none;
  transition: all 0.2s ease;
}
.glass-input:focus {
  border-color: rgba(34, 211, 238, 0.8);
  box-shadow: 0 0 0 2px rgba(34, 211, 238, 0.2);
}

.glass-textarea {
  background: rgba(10, 15, 29, 0.75);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #e2e8f0;
  outline: none;
  line-height: 1.6;
}
.glass-textarea:focus {
  border-color: rgba(34, 211, 238, 0.7);
  box-shadow: 0 0 0 2px rgba(34, 211, 238, 0.15);
}

/* 按钮样式 */
.glass-btn-primary {
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.9) 0%, rgba(59, 130, 246, 0.85) 100%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;
}
.glass-btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, rgba(34, 211, 238, 1) 0%, rgba(96, 165, 250, 0.95) 100%);
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(6, 182, 212, 0.35);
}
.glass-btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.glass-btn-secondary {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #e2e8f0;
  cursor: pointer;
  transition: all 0.2s ease;
}
.glass-btn-secondary:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.glass-btn-accent {
  background: rgba(6, 182, 212, 0.15);
  border: 1px solid rgba(6, 182, 212, 0.4);
  color: #22d3ee;
  cursor: pointer;
  transition: all 0.2s ease;
}
.glass-btn-accent:hover:not(:disabled) {
  background: rgba(6, 182, 212, 0.25);
  color: #ffffff;
}

.glass-btn-warning {
  background: rgba(245, 158, 11, 0.15);
  border: 1px solid rgba(245, 158, 11, 0.35);
  color: #fcd34d;
  cursor: pointer;
  transition: all 0.2s ease;
}
.glass-btn-warning:hover:not(:disabled) {
  background: rgba(245, 158, 11, 0.25);
  border-color: rgba(245, 158, 11, 0.5);
  color: #ffffff;
}
.glass-btn-warning:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.glass-btn-danger {
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #fca5a5;
  cursor: pointer;
  transition: all 0.2s ease;
}
.glass-btn-danger:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.22);
  color: #ffffff;
}

/* Toast 动画 */
.glass-toast {
  background: rgba(15, 23, 42, 0.92);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}
.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translateY(12px) scale(0.96);
}
</style>

<style>
/* 全局覆盖 Element Plus 对话框玻璃暗色风格 */
.glass-dialog .el-dialog {
  background: rgba(15, 23, 42, 0.92) !important;
  backdrop-filter: blur(24px) !important;
  -webkit-backdrop-filter: blur(24px) !important;
  border: 1px solid rgba(255, 255, 255, 0.12) !important;
  border-radius: 16px !important;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6) !important;
}
.glass-dialog .el-dialog__title {
  color: #f8fafc !important;
  font-weight: 700 !important;
  font-size: 16px !important;
}
.glass-dialog .el-dialog__headerbtn .el-dialog__close {
  color: #94a3b8 !important;
}
.glass-dialog .el-dialog__headerbtn:hover .el-dialog__close {
  color: #f8fafc !important;
}
</style>
