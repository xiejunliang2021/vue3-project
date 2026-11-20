<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  saveNodeConfig,
  getNodeConfig,
  convertNodesRemote
} from '@/api/modules/nodeConfig'

// ==========================================
// 状态与核心数据
// ==========================================
const configName = ref('香港-CF优选订阅-01')
const rawNodesText = ref('')
const preferredDomainsText = ref('')
const preferredIpsText = ref('')
const convertedNodesText = ref('')

const token = ref('b4a8e29f-7c16-4190-8d5e-e67c2937ad12')
const subUrl = ref('')

// 统一 Loading 状态管理（防重复提交）
const isSaving = ref(false)
const isRefreshing = ref(false)
const isConvertingLocal = ref(false)
const isSubmittingRemote = ref(false)

// 高级转换选项
const convertOptions = ref({
  addSni: true,
  appendLabel: true,
  replacePort: false,
  customPort: '443'
})

// 轻量 Toast 提示系统
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
// 文本行与有效计数计算属性 (自动过滤空白行)
// ==========================================
const parseCleanLines = (str) => {
  if (!str) return []
  return str
    .replace(/\\r\\n|\\n|\\r/g, '\n')
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.length > 0 && !line.startsWith('#') && !line.startsWith('//'))
}

const dedupLines = (value, { normalizeTarget = false, semanticNode = false } = {}) => {
  const seen = new Set()
  const result = []
  parseCleanLines(value).forEach(originalLine => {
    let line = originalLine
    let key = line
    if (normalizeTarget) {
      const target = line.replace(/^https?:\/\//i, '').split('#', 1)[0].trim().replace(/\/+$/, '').toLowerCase()
      key = target.includes(':') ? target : `${target}:443`
      line = key
    } else if (semanticNode && /^(vless|trojan|hysteria2|tuic):\/\//i.test(line)) {
      const hashIndex = line.indexOf('#')
      key = hashIndex >= 0 ? line.slice(0, hashIndex) : line
    }
    if (!seen.has(key)) { seen.add(key); result.push(line) }
  })
  return result
}

const cleanAllInputs = (showMessage = true) => {
  const before = rawNodesList.value.length + preferredDomainsList.value.length + preferredIpsList.value.length
  rawNodesText.value = dedupLines(rawNodesText.value, { semanticNode: true }).join('\n')
  preferredDomainsText.value = dedupLines(preferredDomainsText.value, { normalizeTarget: true }).join('\n')
  preferredIpsText.value = dedupLines(preferredIpsText.value, { normalizeTarget: true }).join('\n')
  const after = rawNodesList.value.length + preferredDomainsList.value.length + preferredIpsList.value.length
  if (showMessage) showToast(`已清理 ${before - after} 条重复/无效数据`, 'success')
}

const dedupInput = (type) => {
  if (type === 'nodes') rawNodesText.value = dedupLines(rawNodesText.value, { semanticNode: true }).join('\n')
  if (type === 'domains') preferredDomainsText.value = dedupLines(preferredDomainsText.value, { normalizeTarget: true }).join('\n')
  if (type === 'ips') preferredIpsText.value = dedupLines(preferredIpsText.value, { normalizeTarget: true }).join('\n')
  showToast('已完成去重与格式化', 'success')
}

const rawNodesList = computed(() => parseCleanLines(rawNodesText.value))
const preferredDomainsList = computed(() => parseCleanLines(preferredDomainsText.value))
const preferredIpsList = computed(() => parseCleanLines(preferredIpsText.value))
const convertedNodesList = computed(() => parseCleanLines(convertedNodesText.value))

const rawNodesCount = computed(() => rawNodesList.value.length)
const domainsCount = computed(() => preferredDomainsList.value.length)
const ipsCount = computed(() => preferredIpsList.value.length)
const convertedCount = computed(() => convertedNodesList.value.length)

// 完整订阅链接（基于环境变量或后端返回）
const fullSubscriptionUrl = computed(() => {
  if (subUrl.value) return subUrl.value
  if (!token.value) return ''
  const base = import.meta.env.VITE_SUB_BASE_URL || import.meta.env.VITE_API_BASE_URL || 'https://api.yourdomain.com'
  const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base
  return `${cleanBase}/api/sub/${token.value}/`
})

// ==========================================
// 剪贴板复制封装（原生 API + 降级兼容）
// ==========================================
const copyToClipboard = async (text, label = '内容') => {
  if (!text || text.trim() === '') {
    showToast(`复制失败：${label}为空`, 'error')
    return
  }

  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
    } else {
      // 降级使用传统 document.execCommand
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.left = '-9999px'
      textarea.style.top = '-9999px'
      document.body.appendChild(textarea)
      textarea.select()
      const successful = document.execCommand('copy')
      document.body.removeChild(textarea)
      if (!successful) throw new Error('execCommand copy failed')
    }
    showToast(`已成功复制 ${label} 到剪贴板！`, 'success')
  } catch (err) {
    console.error('Copy failed:', err)
    showToast(`复制失败，请手动选中文本复制`, 'error')
  }
}

// 复制全部转换后节点
const copyAllNodes = () => {
  copyToClipboard(convertedNodesText.value, `全部节点 (${convertedCount.value} 个)`)
}

// 复制 Base64 订阅文本
const copyBase64Subscription = () => {
  const content = convertedNodesText.value.trim()
  if (!content) {
    showToast('暂无转换结果可供导出 Base64', 'error')
    return
  }

  try {
    // 处理 UTF-8 字符转 Base64 避免中文乱码
    const utf8Bytes = encodeURIComponent(content).replace(/%([0-9A-F]{2})/g, (match, p1) => {
      return String.fromCharCode('0x' + p1)
    })
    const base64Str = btoa(utf8Bytes)
    copyToClipboard(base64Str, 'Base64 订阅内容')
  } catch (err) {
    console.error('Base64 encoding error:', err)
    showToast('Base64 编码失败', 'error')
  }
}

// 一键复制订阅链接
const copySubscriptionUrl = () => {
  copyToClipboard(fullSubscriptionUrl.value, '订阅链接')
}

// ==========================================
// 本地即时预览转换核心算法
// ==========================================
const convertNodeWithTarget = (rawLine, targetAddress, label) => {
  const customPort = convertOptions.value.replacePort ? convertOptions.value.customPort : null

  // 1. 处理 VLESS / TROJAN / HYSTERIA2 (标准 URL 协议格式)
  if (/^(vless|trojan|hysteria2|tuic):\/\//i.test(rawLine)) {
    try {
      const url = new URL(rawLine)
      const originalHost = url.hostname
      const originalPort = customPort || url.port
      const originalHash = decodeURIComponent(url.hash ? url.hash.slice(1) : '')

      // 保留原生 Host / SNI
      if (convertOptions.value.addSni && originalHost) {
        if (!url.searchParams.has('sni')) url.searchParams.set('sni', originalHost)
        if (!url.searchParams.has('host')) url.searchParams.set('host', originalHost)
      }

      // 替换目标优选 IP / 域名
      url.hostname = targetAddress
      if (originalPort) url.port = originalPort

      // 附加标识
      if (convertOptions.value.appendLabel) {
        url.hash = encodeURIComponent(`${originalHash || 'Node'} - [${label || targetAddress}]`)
      }

      return url.toString()
    } catch (e) {
      // 若 URL 解析异常，返回原文本
      return `${rawLine}#target=${targetAddress}`
    }
  }

  // 2. 处理 VMESS (Base64 JSON 格式)
  if (/^vmess:\/\//i.test(rawLine)) {
    try {
      const rawB64 = rawLine.replace(/^vmess:\/\//i, '').trim()
      const jsonStr = decodeURIComponent(
        atob(rawB64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )
      const obj = JSON.parse(jsonStr)
      const originalHost = obj.add

      if (convertOptions.value.addSni) {
        if (!obj.host) obj.host = originalHost
        if (!obj.sni) obj.sni = originalHost
      }

      obj.add = targetAddress
      if (customPort) obj.port = customPort
      if (convertOptions.value.appendLabel) {
        obj.ps = `${obj.ps || 'VMess'} - [${label || targetAddress}]`
      }

      const newJsonStr = JSON.stringify(obj)
      const newB64 = btoa(
        encodeURIComponent(newJsonStr).replace(/%([0-9A-F]{2})/g, (match, p1) => {
          return String.fromCharCode('0x' + p1)
        })
      )
      return `vmess://${newB64}`
    } catch (e) {
      return rawLine
    }
  }

  // 3. 处理 Shadowsocks (ss://)
  if (/^ss:\/\//i.test(rawLine)) {
    try {
      // 检查是否有 # 别名
      const parts = rawLine.split('#')
      const mainPart = parts[0]
      const originalRemark = parts[1] ? decodeURIComponent(parts[1]) : 'SS'

      if (mainPart.includes('@')) {
        const atIndex = mainPart.lastIndexOf('@')
        const authPart = mainPart.slice(0, atIndex)
        const hostPortPart = mainPart.slice(atIndex + 1)
        const colonIndex = hostPortPart.lastIndexOf(':')
        const port = customPort || (colonIndex !== -1 ? hostPortPart.slice(colonIndex + 1) : '443')

        const newMain = `${authPart}@${targetAddress}:${port}`
        const newRemark = convertOptions.value.appendLabel
          ? `${originalRemark} - [${label || targetAddress}]`
          : originalRemark
        return `${newMain}#${encodeURIComponent(newRemark)}`
      }
      return rawLine
    } catch (e) {
      return rawLine
    }
  }

  // 默认直接拼接或返回
  return `${rawLine}#${targetAddress}`
}

const runLocalConvert = () => {
  cleanAllInputs(false)
  if (rawNodesCount.value === 0) {
    showToast('请先输入至少一行原始节点', 'error')
    return
  }

  const targets = []
  // 添加优选域名
  preferredDomainsList.value.forEach(domain => {
    targets.push({ address: domain, label: `域名:${domain}` })
  })
  // 添加优选 IP
  preferredIpsList.value.forEach(ip => {
    targets.push({ address: ip, label: `IP:${ip}` })
  })

  isConvertingLocal.value = true
  const results = []

  try {
    if (targets.length === 0) {
      // 无优选对象时，输出整理后的原始节点
      results.push(...rawNodesList.value)
      showToast('未配置优选域名或 IP，已格式化输出原始节点', 'info')
    } else {
      // 遍历组合笛卡尔积转换
      for (const rawNode of rawNodesList.value) {
        for (const target of targets) {
          const generated = convertNodeWithTarget(rawNode, target.address, target.label)
          results.push(generated)
        }
      }
      showToast(`本地转换完成！共生成 ${results.length} 个组合节点`, 'success')
    }

    convertedNodesText.value = results.join('\n')
  } catch (err) {
    console.error('Local convert error:', err)
    showToast('本地转换异常：' + (err.message || '格式错误'), 'error')
  } finally {
    isConvertingLocal.value = false
  }
}

// ==========================================
// 提交后端远程转换
// ==========================================
const submitRemoteConvert = async () => {
  cleanAllInputs(false)
  if (rawNodesCount.value === 0) {
    showToast('请先录入原始节点', 'error')
    return
  }

  isSubmittingRemote.value = true
  try {
    const payload = {
      name: configName.value,
      raw_nodes: rawNodesList.value,
      preferred_domains: preferredDomainsList.value,
      preferred_ips: preferredIpsList.value,
      options: convertOptions.value
    }

    const res = await convertNodesRemote(payload)
    if (res && res.nodes) {
      convertedNodesText.value = Array.isArray(res.nodes) ? res.nodes.join('\n') : res.nodes
      if (res.token) token.value = res.token
      if (res.sub_url) subUrl.value = res.sub_url
      showToast('远端 Django 转换完成！', 'success')
    } else {
      // 兼容后端返回格式
      showToast('后端转换成功返回', 'success')
    }
  } catch (err) {
    console.warn('Remote convert API failed or not connected, falling back to local convert:', err)
    showToast('远端 API 响应异常，已自动切换为本地引擎计算并展示结果', 'info')
    runLocalConvert()
  } finally {
    isSubmittingRemote.value = false
  }
}

// ==========================================
// 保存配置至远程 Django (带本地缓存兜底)
// ==========================================
const handleSave = async () => {
  cleanAllInputs(false)
  if (!configName.value.trim()) {
    showToast('请输入配置名称', 'error')
    return
  }

  isSaving.value = true
  const payload = {
    name: configName.value.trim(),
    raw_nodes: rawNodesText.value,
    preferred_domains: preferredDomainsText.value,
    preferred_ips: preferredIpsText.value,
    converted_nodes: convertedNodesText.value,
    token: token.value
  }

  try {
    const res = await saveNodeConfig(payload)
    if (res && res.token) {
      token.value = res.token
      if (res.sub_url) subUrl.value = res.sub_url
    }
    // 本地持久化缓存一份
    localStorage.setItem('cached_node_config', JSON.stringify(payload))
    showToast('配置已成功保存！', 'success')
  } catch (err) {
    console.warn('Backend save failed, saving to localStorage as fallback:', err)
    localStorage.setItem('cached_node_config', JSON.stringify(payload))
    showToast('网络波动，已暂存至本地浏览器缓存！', 'info')
  } finally {
    isSaving.value = false
  }
}

// ==========================================
// 刷新与数据初始化
// ==========================================
const handleRefresh = async () => {
  isRefreshing.value = true
  try {
    const res = await getNodeConfig({ name: configName.value })
    if (res && res.data) {
      rawNodesText.value = res.data.raw_nodes || ''
      preferredDomainsText.value = res.data.preferred_domains || ''
      preferredIpsText.value = res.data.preferred_ips || ''
      if (res.data.token) token.value = res.data.token
      showToast('已从服务器拉取最新配置！', 'success')
    } else {
      loadCachedData()
      showToast('已重新加载当前本地配置', 'info')
    }
  } catch (err) {
    loadCachedData()
    showToast('未能连接后端，已加载本地缓存状态', 'info')
  } finally {
    setTimeout(() => {
      isRefreshing.value = false
    }, 400)
  }
}

const loadCachedData = () => {
  const cached = localStorage.getItem('cached_node_config')
  if (cached) {
    try {
      const data = JSON.parse(cached)
      if (data.name) configName.value = data.name
      if (data.raw_nodes) rawNodesText.value = data.raw_nodes
      if (data.preferred_domains) preferredDomainsText.value = data.preferred_domains
      if (data.preferred_ips) preferredIpsText.value = data.preferred_ips
      if (data.converted_nodes) convertedNodesText.value = data.converted_nodes
      if (data.token) token.value = data.token
    } catch (e) {
      console.error(e)
    }
  } else {
    // 首次进入提供演示模板数据
    fillSampleData()
  }
}

const fillSampleData = () => {
  rawNodesText.value = `vless://e408d669-8bc3-48b4-a631-f5b248a391c0@origin-sg.example.com:443?encryption=none&security=tls&type=ws&host=origin-sg.example.com&path=%2Fstream#新加坡01-原生
vless://93b5a742-1271-4a18-97dc-35ecb265aa11@origin-hk.example.com:443?encryption=none&security=tls&type=ws&host=origin-hk.example.com&path=%2Fws#香港02-高速`

  preferredDomainsText.value = `hk.cf.example.com
sg-fast.cloudflare.net`

  preferredIpsText.value = `104.16.88.99
104.17.201.45
162.159.192.1`
}

onMounted(() => {
  loadCachedData()
})
</script>

<template>
  <div class="glass-page-container min-h-screen text-slate-100 p-4 sm:p-6 lg:p-8 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
    <!-- 顶部环境光斑与背景网格 -->
    <div class="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div class="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div class="absolute top-1/3 -right-40 w-[30rem] h-[30rem] bg-indigo-500/10 rounded-full blur-3xl"></div>
      <div class="absolute -bottom-40 left-1/3 w-[36rem] h-[36rem] bg-emerald-500/10 rounded-full blur-3xl"></div>
    </div>

    <div class="relative z-10 max-w-7xl mx-auto space-y-6">

      <!-- ========================================== -->
      <!-- 顶部控制区 (Header Area) -->
      <!-- ========================================== -->
      <header class="glass-card p-5 sm:p-6 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <!-- 标题与配置名称 -->
        <div class="flex flex-col sm:flex-row sm:items-center gap-3.5 flex-1">
          <div class="flex items-center gap-2.5">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 border border-cyan-400/40">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h1 class="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                节点与优选转换器
                <span class="text-xs px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-mono">v2.5 Pro</span>
              </h1>
              <p class="text-xs text-slate-400 hidden sm:block">多协议节点合并 · 优选 IP / 域名批量注入 · 独立订阅生成</p>
            </div>
          </div>

          <!-- 配置名称输入 -->
          <div class="relative flex-1 max-w-md">
            <input
              v-model="configName"
              type="text"
              placeholder="请输入配置名称 (如: 香港-CF-方案A)"
              class="glass-input w-full pl-3.5 pr-9 py-2 rounded-xl text-sm font-medium"
            />
            <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 pointer-events-none">
              🏷️
            </span>
          </div>
        </div>

        <!-- 操作按钮组 -->
        <div class="flex items-center gap-2.5 self-end md:self-auto">
          <!-- 刷新按钮 -->
          <button
            @click="handleRefresh"
            :disabled="isRefreshing"
            class="glass-btn-secondary px-3.5 py-2 rounded-xl text-sm font-medium flex items-center gap-2"
            title="重新拉取配置"
          >
            <svg
              class="w-4 h-4 transition-transform duration-500"
              :class="{ 'animate-spin text-cyan-400': isRefreshing }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>刷新</span>
          </button>

          <!-- 快速示例数据 -->
          <button
            @click="fillSampleData"
            class="glass-btn-secondary px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white"
            title="填充演示样例数据"
          >
            示例
          </button>

          <!-- 全部去重按钮 -->
          <button
            @click="cleanAllInputs()"
            class="glass-btn-accent px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2"
            title="清理三类输入中的空白、重复与非规范目标"
          >
            <span>全部去重</span>
          </button>

          <!-- 保存按钮 -->
          <button
            @click="handleSave"
            :disabled="isSaving || !configName.trim()"
            class="glass-btn-primary px-5 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg shadow-cyan-500/20"
          >
            <svg v-if="isSaving" class="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
            <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            <span>{{ isSaving ? '保存中...' : '保存配置' }}</span>
          </button>
        </div>
      </header>

      <!-- ========================================== -->
      <!-- 订阅展示栏 (Subscription Bar) -->
      <!-- ========================================== -->
      <section
        v-if="fullSubscriptionUrl"
        class="glass-card-accent p-4 sm:p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-cyan-500/30"
      >
        <div class="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
          <div class="relative flex-shrink-0 mt-0.5 sm:mt-0">
            <div class="w-3 h-3 rounded-full bg-emerald-400"></div>
            <div class="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75"></div>
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <span class="text-xs font-semibold uppercase tracking-wider text-cyan-300">专属订阅通道</span>
              <span class="text-[11px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                Active
              </span>
            </div>
            <div class="mt-1 flex items-center gap-2">
              <p class="font-mono text-xs sm:text-sm text-slate-200 truncate select-all">
                {{ fullSubscriptionUrl }}
              </p>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2 self-end md:self-auto flex-shrink-0">
          <button
            @click="copySubscriptionUrl"
            class="glass-btn-accent px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2"
          >
            <svg class="w-4 h-4 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span>一键复制订阅</span>
          </button>
        </div>
      </section>

      <!-- ========================================== -->
      <!-- 三栏式输入布局 (3-Column Layout) -->
      <!-- ========================================== -->
      <section class="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <!-- 栏目 1：原始节点列表 -->
        <div class="glass-card p-5 rounded-2xl flex flex-col space-y-3 relative group">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
              <h2 class="font-semibold text-sm sm:text-base text-white">原始节点列表</h2>
            </div>
            <!-- 行数徽章 -->
            <div class="flex items-center gap-2">
              <button
                @click="dedupInput('nodes')"
                class="text-[11px] text-cyan-300 hover:text-white transition-colors"
                title="清理空行、重复节点并忽略名称片段差异"
              >
                一键去重
              </button>
              <button
                v-if="rawNodesCount > 0"
                @click="rawNodesText = ''"
                class="text-[11px] text-slate-400 hover:text-rose-400 transition-colors"
                title="清空"
              >
                清空
              </button>
              <span class="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                {{ rawNodesCount }} 节点
              </span>
            </div>
          </div>
          <p class="text-xs text-slate-400">
            支持 VLESS / VMess / Trojan / SS，每行一个节点链接
          </p>
          <div class="relative flex-1 min-h-[260px]">
            <textarea
              v-model="rawNodesText"
              rows="12"
              placeholder="vless://...&#10;vmess://...&#10;trojan://..."
              class="glass-textarea w-full h-full p-3.5 rounded-xl text-xs sm:text-sm font-mono resize-y"
              spellcheck="false"
            ></textarea>
          </div>
        </div>

        <!-- 栏目 2：优选域名列表 -->
        <div class="glass-card p-5 rounded-2xl flex flex-col space-y-3 relative group">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-indigo-400"></span>
              <h2 class="font-semibold text-sm sm:text-base text-white">优选域名列表</h2>
            </div>
            <!-- 行数徽章 -->
            <div class="flex items-center gap-2">
              <button
                @click="dedupInput('domains')"
                class="text-[11px] text-cyan-300 hover:text-white transition-colors"
                title="去除协议前缀、补齐端口并去重"
              >
                一键去重
              </button>
              <button
                v-if="domainsCount > 0"
                @click="preferredDomainsText = ''"
                class="text-[11px] text-slate-400 hover:text-rose-400 transition-colors"
                title="清空"
              >
                清空
              </button>
              <span class="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                {{ domainsCount }} 域名
              </span>
            </div>
          </div>
          <p class="text-xs text-slate-400">
            CDN 优选二级域名或自建反代域名，每行一个
          </p>
          <div class="relative flex-1 min-h-[260px]">
            <textarea
              v-model="preferredDomainsText"
              rows="12"
              placeholder="hk.cf.yourdomain.com&#10;sg-speed.cloudflare.net&#10;cdn.speedtest.net"
              class="glass-textarea w-full h-full p-3.5 rounded-xl text-xs sm:text-sm font-mono resize-y"
              spellcheck="false"
            ></textarea>
          </div>
        </div>

        <!-- 栏目 3：优选 IP 列表 -->
        <div class="glass-card p-5 rounded-2xl flex flex-col space-y-3 relative group">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <h2 class="font-semibold text-sm sm:text-base text-white">优选 IP 列表</h2>
            </div>
            <!-- 行数徽章 -->
            <div class="flex items-center gap-2">
              <button
                @click="dedupInput('ips')"
                class="text-[11px] text-cyan-300 hover:text-white transition-colors"
                title="去除协议前缀、补齐端口并去重"
              >
                一键去重
              </button>
              <button
                v-if="ipsCount > 0"
                @click="preferredIpsText = ''"
                class="text-[11px] text-slate-400 hover:text-rose-400 transition-colors"
                title="清空"
              >
                清空
              </button>
              <span class="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                {{ ipsCount }} IP
              </span>
            </div>
          </div>
          <p class="text-xs text-slate-400">
            Cloudflare Anycast / 测速最优直连 IP，每行一个
          </p>
          <div class="relative flex-1 min-h-[260px]">
            <textarea
              v-model="preferredIpsText"
              rows="12"
              placeholder="104.16.88.99&#10;104.17.201.45&#10;162.159.192.1"
              class="glass-textarea w-full h-full p-3.5 rounded-xl text-xs sm:text-sm font-mono resize-y"
              spellcheck="false"
            ></textarea>
          </div>
        </div>

      </section>

      <!-- ========================================== -->
      <!-- 预览生成与转换板块 (Preview & Converter Section) -->
      <!-- ========================================== -->
      <section class="glass-card p-6 rounded-2xl space-y-5">
        
        <!-- 转换控制横条 -->
        <div class="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <div>
              <h3 class="text-base font-bold text-white">组合节点预览与转换输出</h3>
              <p class="text-xs text-slate-400">
                预期组合总数：<span class="text-cyan-300 font-mono">{{ rawNodesCount * ((domainsCount + ipsCount) || 1) }}</span> 个节点
              </p>
            </div>
          </div>

          <!-- 转换触发按钮组 -->
          <div class="flex items-center gap-3">
            <!-- 本地即时预览转换 -->
            <button
              @click="runLocalConvert"
              :disabled="isConvertingLocal"
              class="glass-btn-primary px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg shadow-cyan-500/20"
            >
              <svg v-if="isConvertingLocal" class="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
              <svg v-else class="w-4 h-4 text-cyan-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>{{ isConvertingLocal ? '计算中...' : '本地即时预览转换' }}</span>
            </button>

            <!-- 提交后端转换 -->
            <button
              @click="submitRemoteConvert"
              :disabled="isSubmittingRemote"
              class="glass-btn-secondary px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 hover:border-purple-400/40"
            >
              <svg v-if="isSubmittingRemote" class="animate-spin w-4 h-4 text-purple-300" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
              <svg v-else class="w-4 h-4 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span>{{ isSubmittingRemote ? '远端处理中...' : '提交后端转换' }}</span>
            </button>
          </div>
        </div>

        <!-- 转换结果展示区域 -->
        <div class="space-y-3">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div class="flex items-center gap-2">
              <span class="text-xs font-semibold text-slate-300">生成的组合节点列表</span>
              <span class="px-2 py-0.5 rounded-full text-xs font-mono font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
                已生成 {{ convertedCount }} 个节点
              </span>
            </div>

            <!-- 复制按钮组 -->
            <div class="flex items-center gap-2.5">
              <button
                @click="copyAllNodes"
                :disabled="convertedCount === 0"
                class="glass-btn-secondary px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5"
              >
                <svg class="w-3.5 h-3.5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                <span>复制全部节点</span>
              </button>

              <button
                @click="copyBase64Subscription"
                :disabled="convertedCount === 0"
                class="glass-btn-accent px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5"
              >
                <svg class="w-3.5 h-3.5 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>复制 Base64 订阅</span>
              </button>
            </div>
          </div>

          <!-- 结果文本域 -->
          <div class="relative">
            <textarea
              v-model="convertedNodesText"
              rows="10"
              readonly
              placeholder="点击上方【本地即时预览转换】或【提交后端转换】后，在此生成并展示优选组合节点..."
              class="glass-textarea-result w-full p-4 rounded-xl text-xs sm:text-sm font-mono resize-y"
              spellcheck="false"
            ></textarea>
            <div
              v-if="convertedCount === 0"
              class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-slate-500 text-xs gap-2"
            >
              <svg class="w-8 h-8 opacity-40 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>等待生成节点转换结果</span>
            </div>
          </div>
        </div>

      </section>

    </div>

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
/* ===================================================
   Glassmorphism (玻璃拟态) 风格核心规范
   基于 ui-ux-pro-max 设计指南
=================================================== */

.glass-page-container {
  background: radial-gradient(circle at 15% 15%, rgba(6, 182, 212, 0.08) 0%, transparent 40%),
              radial-gradient(circle at 85% 85%, rgba(99, 102, 241, 0.08) 0%, transparent 40%),
              linear-gradient(135deg, #090d16 0%, #0f172a 50%, #0b1120 100%);
}

/* 磨砂玻璃卡片 */
.glass-card {
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.09);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.38);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.glass-card:hover {
  border-color: rgba(255, 255, 255, 0.14);
}

/* 强调型玻璃卡片 (用于订阅栏) */
.glass-card-accent {
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(15, 23, 42, 0.75) 100%);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow: 0 8px 32px 0 rgba(6, 182, 212, 0.12);
}

/* 玻璃输入框 */
.glass-input {
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #f8fafc;
  outline: none;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.glass-input:focus {
  border-color: rgba(34, 211, 238, 0.8);
  box-shadow: 0 0 0 2px rgba(34, 211, 238, 0.2);
}

/* 文本域 (输入区) */
.glass-textarea {
  background: rgba(10, 15, 29, 0.75);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #e2e8f0;
  outline: none;
  line-height: 1.6;
  transition: all 0.2s ease;
}

.glass-textarea:focus {
  border-color: rgba(34, 211, 238, 0.7);
  box-shadow: 0 0 0 2px rgba(34, 211, 238, 0.15);
  background: rgba(10, 15, 29, 0.88);
}

/* 结果文本域 (只读展示区) */
.glass-textarea-result {
  background: rgba(8, 12, 22, 0.85);
  backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #a5f3fc;
  outline: none;
  line-height: 1.65;
}

.glass-textarea-result:focus {
  border-color: rgba(168, 85, 247, 0.5);
}

/* 主按钮 (微发光、平滑反馈) */
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

.glass-btn-primary:active:not(:disabled) {
  transform: translateY(0);
}

.glass-btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 次级按钮 */
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
  border-color: rgba(255, 255, 255, 0.22);
  color: #ffffff;
}

.glass-btn-secondary:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

/* 强调操作按钮 */
.glass-btn-accent {
  background: rgba(6, 182, 212, 0.15);
  border: 1px solid rgba(6, 182, 212, 0.4);
  color: #22d3ee;
  cursor: pointer;
  transition: all 0.2s ease;
}

.glass-btn-accent:hover:not(:disabled) {
  background: rgba(6, 182, 212, 0.25);
  border-color: rgba(34, 211, 238, 0.6);
  color: #ffffff;
}

.glass-btn-accent:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Toast 动画与样式 */
.glass-toast {
  background: rgba(15, 23, 42, 0.9);
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

/* 自定义滚动条美化 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: rgba(15, 23, 42, 0.5);
  border-radius: 4px;
}
::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.25);
}
</style>
