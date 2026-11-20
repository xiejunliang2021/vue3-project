<template>
  <div class="min-h-full flex flex-col p-6 sm:p-8 lg:p-10 max-w-7xl mx-auto text-slate-100">
    <!-- Hero Command Center Banner -->
    <div class="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950/80 backdrop-blur-xl p-6 sm:p-8 mb-8 shadow-2xl">
      <!-- Glow Gradients -->
      <div class="absolute -right-20 -top-20 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute -left-20 -bottom-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div class="flex items-center gap-2.5 mb-3">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
              <span class="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
              ENTERPRISE CLOUD SUITE
            </span>
            <span class="text-xs font-mono text-slate-400">v2.5.0-PRO</span>
          </div>

          <h1 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white mb-2">
            花本无心 <span class="bg-gradient-to-r from-indigo-400 via-cyan-400 to-indigo-300 bg-clip-text text-transparent">· 智算云枢</span>
          </h1>
          <p class="text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed">
            新一代高可用订阅调度、协议智能清洗去重与量化投研协同云平台
          </p>
        </div>

        <!-- Quick Action Buttons -->
        <div class="flex items-center gap-3 shrink-0">
          <router-link to="/subscriptions" class="saas-btn-primary px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>专属订阅管理</span>
          </router-link>
          <router-link to="/node-config" class="saas-btn-secondary px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2">
            <svg class="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>节点转换</span>
          </router-link>
        </div>
      </div>
    </div>

    <!-- KPI / Status Metrics Grid -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div class="glass-panel p-4 sm:p-5 rounded-xl flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div>
          <div class="text-xs text-slate-400 font-medium mb-1">去重清洗引擎</div>
          <div class="text-lg font-bold text-white flex items-center gap-2">
            <span>智能语义级</span>
            <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
          </div>
          <div class="text-[11px] text-slate-500 font-mono">保序去重 / 端口锁定</div>
        </div>
      </div>

      <div class="glass-panel p-4 sm:p-5 rounded-xl flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <div class="text-xs text-slate-400 font-medium mb-1">落地识别策略</div>
          <div class="text-lg font-bold text-white flex items-center gap-2">
            <span>多级优先级</span>
            <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
          </div>
          <div class="text-[11px] text-slate-500 font-mono">名称优先 + GeoIP2</div>
        </div>
      </div>

      <div class="glass-panel p-4 sm:p-5 rounded-xl flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <div>
          <div class="text-xs text-slate-400 font-medium mb-1">CDN 回源兼容</div>
          <div class="text-lg font-bold text-white flex items-center gap-2">
            <span>安全过滤生效</span>
          </div>
          <div class="text-[11px] text-slate-500 font-mono">Reality/Trojan 防击穿</div>
        </div>
      </div>

      <div class="glass-panel p-4 sm:p-5 rounded-xl flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 shrink-0">
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          </svg>
        </div>
        <div>
          <div class="text-xs text-slate-400 font-medium mb-1">量化投研中枢</div>
          <div class="text-lg font-bold text-white flex items-center gap-2">
            <span>就绪活跃</span>
          </div>
          <div class="text-[11px] text-slate-500 font-mono">龙回头 / 策略回测</div>
        </div>
      </div>
    </div>

    <!-- Core Cloud Modules Grid -->
    <div class="mb-10">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-bold text-white flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-indigo-500"></span>
          核心云服务模块
        </h2>
        <span class="text-xs text-slate-500 font-mono">6 CORE SERVICES</span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <!-- 专属订阅管理 -->
        <router-link to="/subscriptions" class="glass-panel p-6 rounded-2xl group cursor-pointer relative overflow-hidden flex flex-col justify-between">
          <div class="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all pointer-events-none"></div>
          <div>
            <div class="flex items-center justify-between mb-4">
              <div class="w-11 h-11 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <span class="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">CRUD / TOKEN</span>
            </div>
            <h3 class="text-base font-bold text-white mb-1.5 group-hover:text-indigo-300 transition-colors">专属订阅管理</h3>
            <p class="text-xs text-slate-400 leading-relaxed mb-4">
              针对不同设备与客户端的一站式专属订阅管理，支持 Token 重置、一键复制、状态开关与实时行数统计。
            </p>
          </div>
          <div class="flex items-center text-xs font-semibold text-indigo-400 gap-1 group-hover:translate-x-1 transition-transform">
            <span>进入管理面板</span>
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
          </div>
        </router-link>

        <!-- 节点转换器 -->
        <router-link to="/node-config" class="glass-panel p-6 rounded-2xl group cursor-pointer relative overflow-hidden flex flex-col justify-between">
          <div class="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all pointer-events-none"></div>
          <div>
            <div class="flex items-center justify-between mb-4">
              <div class="w-11 h-11 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span class="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-cyan-500/15 text-cyan-300 border border-cyan-500/25">MATRIX CONVERT</span>
            </div>
            <h3 class="text-base font-bold text-white mb-1.5 group-hover:text-cyan-300 transition-colors">节点转换器</h3>
            <p class="text-xs text-slate-400 leading-relaxed mb-4">
              支持 VLESS、VMess 多协议与优选 IP/域名笛卡尔积转换，原端口锁定，自动国家旗帜与 Base64 订阅输出。
            </p>
          </div>
          <div class="flex items-center text-xs font-semibold text-cyan-400 gap-1 group-hover:translate-x-1 transition-transform">
            <span>进入即时转换</span>
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
          </div>
        </router-link>

        <!-- 量化股票看板 -->
        <router-link to="/stock" class="glass-panel p-6 rounded-2xl group cursor-pointer relative overflow-hidden flex flex-col justify-between">
          <div class="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all pointer-events-none"></div>
          <div>
            <div class="flex items-center justify-between mb-4">
              <div class="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <span class="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">QUANT ANALYTICS</span>
            </div>
            <h3 class="text-base font-bold text-white mb-1.5 group-hover:text-emerald-300 transition-colors">A股量化看板</h3>
            <p class="text-xs text-slate-400 leading-relaxed mb-4">
              A股实时行情监测与参数化回测看板，整合策略信号与可视化图表分析。
            </p>
          </div>
          <div class="flex items-center text-xs font-semibold text-emerald-400 gap-1 group-hover:translate-x-1 transition-transform">
            <span>进入看板</span>
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
          </div>
        </router-link>

        <!-- 策略算法回测 -->
        <router-link to="/backtest" class="glass-panel p-6 rounded-2xl group cursor-pointer relative overflow-hidden flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-4">
              <div class="w-11 h-11 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-400 group-hover:scale-110 transition-transform">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <span class="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-violet-500/15 text-violet-300 border border-violet-500/25">ALGO TESTING</span>
            </div>
            <h3 class="text-base font-bold text-white mb-1.5 group-hover:text-violet-300 transition-colors">策略回测中心</h3>
            <p class="text-xs text-slate-400 leading-relaxed mb-4">
              基于历史交易数据的策略胜率模拟、收益率走势对比与风险回撤评测。
            </p>
          </div>
          <div class="flex items-center text-xs font-semibold text-violet-400 gap-1 group-hover:translate-x-1 transition-transform">
            <span>开始回测</span>
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
          </div>
        </router-link>

        <!-- 智能体网络 -->
        <router-link to="/favorites/study" class="glass-panel p-6 rounded-2xl group cursor-pointer relative overflow-hidden flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-4">
              <div class="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
              <span class="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/25">AI NETWORK</span>
            </div>
            <h3 class="text-base font-bold text-white mb-1.5 group-hover:text-amber-300 transition-colors">智能体网络</h3>
            <p class="text-xs text-slate-400 leading-relaxed mb-4">
              Hermes Agent 智能体协同网络，整合提示词库、自动化脚本与多模态知识资产。
            </p>
          </div>
          <div class="flex items-center text-xs font-semibold text-amber-400 gap-1 group-hover:translate-x-1 transition-transform">
            <span>浏览网络</span>
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
          </div>
        </router-link>

        <!-- 口播图谱 -->
        <router-link to="/graph-collection" class="glass-panel p-6 rounded-2xl group cursor-pointer relative overflow-hidden flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-4">
              <div class="w-11 h-11 rounded-xl bg-pink-500/15 border border-pink-500/30 flex items-center justify-center text-pink-400 group-hover:scale-110 transition-transform">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <span class="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-pink-500/15 text-pink-300 border border-pink-500/25">CONTENT GRAPH</span>
            </div>
            <h3 class="text-base font-bold text-white mb-1.5 group-hover:text-pink-300 transition-colors">口播图谱 & 导航</h3>
            <p class="text-xs text-slate-400 leading-relaxed mb-4">
              知识切片与短视频口播逻辑图谱，助力高质量内容输出与灵感复用。
            </p>
          </div>
          <div class="flex items-center text-xs font-semibold text-pink-400 gap-1 group-hover:translate-x-1 transition-transform">
            <span>进入图谱</span>
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
          </div>
        </router-link>
      </div>
    </div>

    <!-- Custom Quick Access Links Section -->
    <div class="mb-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-bold text-white flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-cyan-400"></span>
          快捷外部资源与自定义服务
        </h2>
        <button 
          @click="showAddModal = true" 
          class="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          添加外部链接
        </button>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <!-- Dynamic Custom Links -->
        <a 
          v-for="(link, index) in customLinks" 
          :key="index" 
          :href="link.url" 
          target="_blank" 
          class="glass-panel p-4 rounded-xl group relative hover:border-indigo-500/40 transition-all flex items-center justify-between"
        >
          <div class="flex items-center gap-3 overflow-hidden">
            <div class="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300 text-sm font-semibold shrink-0">
              {{ link.name.charAt(0).toUpperCase() }}
            </div>
            <div class="truncate">
              <div class="text-sm font-semibold text-slate-200 group-hover:text-white truncate">{{ link.name }}</div>
              <div class="text-[11px] text-slate-500 truncate font-mono">{{ link.url }}</div>
            </div>
          </div>
          <button 
            @click.prevent="removeLink(index)" 
            class="text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
            title="删除此链接"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </a>

        <!-- Add Card Button -->
        <button 
          @click="showAddModal = true" 
          class="border border-dashed border-slate-800 hover:border-indigo-500/50 hover:bg-indigo-500/5 p-4 rounded-xl flex items-center justify-center gap-2 text-slate-400 hover:text-indigo-300 transition-all text-xs font-semibold"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          <span>新增快捷服务</span>
        </button>
      </div>
    </div>

    <!-- Modern SaaS Add Link Modal -->
    <el-dialog
      v-model="showAddModal"
      title="配置新的快捷服务链接"
      width="440px"
      :show-close="true"
      destroy-on-close
    >
      <div class="space-y-4 py-2">
        <div>
          <label class="block text-xs font-medium text-slate-300 mb-1.5">服务/模块名称</label>
          <el-input v-model="newLink.name" placeholder="例如: GitHub / Cloudflare" />
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-300 mb-1.5">目标网址 URL</label>
          <el-input v-model="newLink.url" placeholder="https://..." />
        </div>
      </div>

      <template #footer>
        <div class="flex items-center justify-end gap-2.5 pt-3">
          <button @click="showAddModal = false" class="saas-btn-secondary px-4 py-2 rounded-lg text-xs font-medium">取消</button>
          <button @click="addLink" class="saas-btn-primary px-4 py-2 rounded-lg text-xs font-semibold">确认添加</button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'

const router = useRouter()
const authStore = useAuthStore()

const showAddModal = ref(false)
const customLinks = ref([])
const newLink = ref({ name: '', url: '' })

const loadLinks = () => {
  const saved = localStorage.getItem('portal_links')
  if (saved) {
    try {
      customLinks.value = JSON.parse(saved)
    } catch {
      customLinks.value = []
    }
  } else {
    customLinks.value = [
      { name: 'Cloudflare', url: 'https://dash.cloudflare.com' },
      { name: 'GitHub', url: 'https://github.com' },
      { name: 'Vercel', url: 'https://vercel.com' },
    ]
  }
}

const addLink = () => {
  if (!newLink.value.name.trim() || !newLink.value.url.trim()) {
    ElMessage.warning('请填写完整的名称与URL')
    return
  }
  customLinks.value.push({ ...newLink.value })
  localStorage.setItem('portal_links', JSON.stringify(customLinks.value))
  newLink.value = { name: '', url: '' }
  showAddModal.value = false
  ElMessage.success('已添加快捷服务')
}

const removeLink = (index) => {
  customLinks.value.splice(index, 1)
  localStorage.setItem('portal_links', JSON.stringify(customLinks.value))
  ElMessage.success('已移除')
}

onMounted(() => {
  loadLinks()
})
</script>

<style scoped>
/* Scoped styles inherit global SaaS classes */
</style>
