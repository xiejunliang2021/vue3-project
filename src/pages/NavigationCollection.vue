<template>
  <div class="cyber-page">
    <div class="scanline"></div>
    <div class="glow-bg"></div>

    <div class="container mx-auto px-4 py-8 relative z-10">
      <!-- 头部 -->
      <div class="header-section">
        <div class="flex items-center gap-4">
          <div class="pulse-dot"></div>
          <h1 class="text-2xl font-black tracking-tight text-white cyber-glitch">
            搭建 Hermes Agent 多智能体团队
          </h1>
        </div>
        <p class="subtitle text-sm mt-2">
          隔离优先于提示词优化 // 打造自运转一人公司自媒体生产流
        </p>
      </div>

      <!-- 架构卡片与分镜对照 -->
      <el-row :gutter="30" class="mt-8">
        
        <!-- 左侧：多智能体隔离网络拓扑图 / 网页版视频 -->
        <el-col :xs="24" :lg="10">
          <el-card class="visualizer-card" shadow="never">
            <!-- Cyber Tab Headers -->
            <div class="flex gap-4 mb-4 border-b border-slate-800 pb-2">
              <button 
                @click="activeTab = 'topology'" 
                :class="['cyber-tab-btn', activeTab === 'topology' ? 'active' : '']"
              >
                🪐 隔离拓扑
              </button>
              <button 
                @click="activeTab = 'video'" 
                :class="['cyber-tab-btn', activeTab === 'video' ? 'active' : '']"
              >
                🎥 网页视频
              </button>
            </div>

            <div v-if="activeTab === 'topology'">
              <span class="visualizer-title block text-xs mb-6">
                多智能体网络物理隔离拓扑图 (点击节点查看详情)
              </span>
              
              <div class="orbit-wrapper">
                <!-- 默认主智能体 (大脑) -->
                <div class="center-node" @click="showNode('hermes')">
                  <span class="name">Hermes</span>
                  <span class="role">编排/总控</span>
                </div>
                
                <!-- 环绕轨道 -->
                <div class="orbit-circle"></div>

                <!-- 子智能体 -->
                <div class="sub-node allen" @click="showNode('allen')">
                  <span class="node-name">Allen</span>
                  <span class="node-role">数据研究</span>
                </div>

                <div class="sub-node mira" @click="showNode('mira')">
                  <span class="node-name">Mira</span>
                  <span class="node-role">叙事文案</span>
                </div>

                <div class="sub-node turing" @click="showNode('turing')">
                  <span class="node-name">Turing</span>
                  <span class="node-role">技术工程</span>
                </div>
              </div>

              <!-- 节点详情展示区 -->
              <div class="details-panel" id="details-box">
                <h4 class="details-title text-sm font-bold">{{ activeNode.title }}</h4>
                <p class="details-desc text-xs mt-2">{{ activeNode.desc }}</p>
              </div>
            </div>

            <div v-else-if="activeTab === 'video'" class="video-panel">
              <div class="video-container relative rounded-lg overflow-hidden border border-cyan-500/30 bg-black/50 aspect-video flex items-center justify-center">
                <video 
                  controls 
                  class="w-full h-full object-contain" 
                  :src="videoSrc"
                ></video>
              </div>
              
              <!-- Video details and switcher -->
              <div class="mt-4 p-4 border border-slate-800 bg-slate-950/40 rounded-lg">
                <div class="flex justify-between items-center mb-2">
                  <span class="text-xs text-slate-400">当前播放：</span>
                  <el-tag size="small" type="success" effect="dark" class="cyber-tag">
                    {{ videoVersion === 'original' ? '🎬 剪辑原版' : (videoVersion === 'smooth' ? '✨ AI 平滑重置版' : '🎨 B-Roll 混剪版') }}
                  </el-tag>
                </div>
                <p class="text-xs text-slate-400 leading-relaxed mb-4">
                  {{ videoVersion === 'original' 
                    ? '这是最原始的剪辑版视频，包含动作衔接处丢帧或身体位移不连贯的现象。' 
                    : (videoVersion === 'smooth' 
                      ? '使用双向运动插帧算法（MCI）重构的平滑版本。通过估算前后帧运动趋势进行光流计算，自动补充过度帧。'
                      : '终极剪辑优化版本。在原版视频的 6 处重大跳剪/身体位移瞬间，精准插入由 AI 从网络检索并经高斯模糊处理的科技概念图（B-Roll）进行画面遮盖，解决视觉不连贯问题。') }}
                </p>
                <div class="flex flex-wrap gap-2">
                  <el-button 
                    size="small" 
                    type="primary" 
                    plain 
                    :disabled="videoVersion === 'original'"
                    @click="setVideoVersion('original')"
                  >
                    剪辑原版
                  </el-button>
                  <el-button 
                    size="small" 
                    type="success" 
                    plain 
                    :disabled="videoVersion === 'smooth'"
                    @click="setVideoVersion('smooth')"
                  >
                    AI平滑版
                  </el-button>
                  <el-button 
                    size="small" 
                    type="warning" 
                    plain 
                    :disabled="videoVersion === 'broll'"
                    @click="setVideoVersion('broll')"
                  >
                    B-Roll混剪版
                  </el-button>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>

        <!-- 右侧：口播分镜表 -->
        <el-col :xs="24" :lg="14">
          <el-card class="script-card" shadow="never">
            <div class="script-header flex justify-between items-center mb-4">
              <h3 class="text-sm font-bold text-white">🎬 视频口播对照分镜脚本 (800-1000字 3-5分钟)</h3>
              <span class="text-xs text-emerald-400">陈述用“我们” // 提问用“你”</span>
            </div>
            
            <div class="script-table-wrapper">
              <el-table :data="tableData" style="width: 100%" class="cyber-table">
                <el-table-column label="时长" width="110">
                  <template #default="scope">
                    <span class="td-time">{{ scope.row.time }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="🎬 画面与视觉效果提示" width="220">
                  <template #default="scope">
                    <div class="td-visual" v-html="scope.row.visual"></div>
                  </template>
                </el-table-column>
                <el-table-column label="🎤 口播台词文本">
                  <template #default="scope">
                    <div class="td-audio" v-html="scope.row.audio"></div>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 底部卡片 -->
      <el-row :gutter="20" class="mt-8">
        <el-col :xs="24" :md="12">
          <el-card class="card-bottom" shadow="never">
            <div class="card-header flex items-center gap-2 mb-3 text-cyan-400">
              <div class="card-dot bg-cyan-400"></div>
              <h3 class="text-sm font-bold text-white">🔧 本期视频核心技术命令</h3>
            </div>
            <ul class="text-xs text-slate-400 leading-relaxed">
              <li class="mb-2"><strong>克隆配置</strong>：<code>hermes profile clone &lt;name&gt;</code> 复制引擎而不复制记忆。</li>
              <li class="mb-2"><strong>查询状态</strong>：<code>hermes profile list</code> 查看所有物理隔离运行的 Agent 列表。</li>
              <li class="mb-2"><strong>激活指令</strong>：<code>hermes -p &lt;name&gt; chat -q "指令"</code> 唤醒特定子智能体工作。</li>
            </ul>
          </el-card>
        </el-col>

        <el-col :xs="24" :md="12">
          <el-card class="card-bottom" shadow="never">
            <div class="card-header flex items-center gap-2 mb-3 text-rose-400">
              <div class="card-dot bg-rose-400"></div>
              <h3 class="text-sm font-bold text-white">💡 自媒体拍摄包装技巧</h3>
            </div>
            <ul class="text-xs text-slate-400 leading-relaxed">
              <li class="mb-2"><strong>视觉道具</strong>：主播身前可摆放印有 "Alan"、"Turing" 的立牌或终端平板，增强代入感。</li>
              <li class="mb-2"><strong>音效配合</strong>：提到 Turing 调试失败或 Allen 拦截幻觉时，配上刺耳的警报和报错音。</li>
              <li class="mb-2"><strong>节奏转换</strong>：展示实操命令部分，语速稍微拉慢，配合高亮字幕，以便观众截屏。</li>
            </ul>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const activeTab = ref('topology');
const videoVersion = ref('original');
const videoSrc = ref('/videos/6月23日_剪辑版.mp4');

const setVideoVersion = (version) => {
  videoVersion.value = version;
  if (version === 'original') {
    videoSrc.value = '/videos/6月23日_剪辑版.mp4';
  } else if (version === 'smooth') {
    videoSrc.value = '/videos/6月23日_平滑重置版.mp4';
  } else {
    videoSrc.value = '/videos/6月23日_Broll混剪版.mp4';
  }
};

const nodeDetails = {
  hermes: {
    title: "◆ Hermes (大脑 - 总控与工作流编排)",
    desc: "团队的大脑，只负责调度，绝不亲自干活。它的主要职责是定义大目标，将大项目拆解为原子化任务分发给 Allen、Turing 和 Mira，并对交付物进行最终整合与验收。在 Soul 中，它拥有最高的决策和指挥权。"
  },
  allen: {
    title: "◆ Allen (研究部 - 极度怀疑与事实源校验)",
    desc: "事实的守门人，持有极度怀疑的世界观。它不相信 AI 的‘常识’，只负责根据 Hermes 下发的线索进行源头验证和数据抓取，剔除冗余和幻觉，为下游团队提供 100% 纯净的事实源。在 PARA 中，它只向‘资料部 (Resources MOC)’注入数据。"
  },
  mira: {
    title: "◆ Mira (叙事部 - 受众沟通与文字叙事)",
    desc: "文字的雕琢师。当它不需要兼任程序员和分析师时，它的表达精度将获得飞跃。它只负责将 Allen 校验过的原始事实，按照抖音、小红书的受众习惯、卡点节奏改写为高网感口播稿。它严格遵守陈述用“我们”和提问用“你”的语调规则。"
  },
  turing: {
    title: "◆ Turing (工程部 - 隔离沙箱与代码开发)",
    desc: "硬性指标的终极执行人。它在完全物理隔离的沙箱环境内进行代码编写、日志分析和单元测试。它不用考虑文笔或运营，只需对代码的可靠性和测试红绿循环负责。它只以证据为导向，不让写手的妥协习惯毒害工程质量。"
  }
};

const activeNode = ref({
  title: "点击星轨节点激活终端",
  desc: "激活每个子智能体的配置文件，在物理层隔离其会话、技能、记忆，这是多智能体系统抗幻觉和抗上下文崩溃的底层支柱。"
});

const showNode = (nodeKey) => {
  const detail = nodeDetails[nodeKey];
  if (detail) {
    activeNode.value = detail;
  }
};

const tableData = ref([
  {
    time: "00:00 - 00:30",
    visual: "<strong>【黄金钩子与认知撕裂】</strong><br>主播严肃面向镜头，桌上放着四台闪着微弱霓虹灯的终端设备。文字特效在旁边弹出：“隔离优先于提示词优化”。",
    audio: "你是不是也经常写了几千字的提示词，却发现 AI 的回答依然前言不搭后语？听好了，<strong>隔离优先于提示词优化！</strong> 这是我们构建高可靠多智能体团队唯一的黄金法则。很多人的误区是，试图打造一个无所不能的“天才 AI”，既让他当程序员，又让他当主笔和 PM。结果就是上下文崩溃、记忆混乱。今天，我们手把手带你用 Hermes 架构，在物理层面给 AI 划分办公室，搭建一个 24 小时自运转的开发与自媒体团队！"
  },
  {
    time: "00:31 - 01:25",
    visual: "<strong>【核心机制：为什么要物理隔离】</strong><br>屏幕上拉出 Hermes 核心架构图，展示灵魂文件（Soul）和运行环境（Agent）是如何独立存在的。",
    audio: "为什么我们必须从单智能体走向团队协作？因为当一个 AI 里面塞满了代码报错、叙事规范和研究报告时，他的心智就被毒害了。<strong>绝对不要让写手继承代码调试器的习惯！</strong> 真正的专业化，源于物理层面的彻底隔离。在 Hermes 架构中，我们将智能体拆解为灵魂（Soul）和运行环境（Agent）。Soul 决定了他是谁，是保守的研究员还是奔放的文案师；而 Agent 决定了他在哪里办公，根据具体项目动态生成操作边界。"
  },
  {
    time: "01:26 - 02:30",
    visual: "<strong>【四位团队成员分工亮相】</strong><br>镜头随着主播手势移动，屏幕上配合网络拓扑图，逐个亮起 Hermes、Allen、Mira、Turing 的角色卡片。",
    audio: "来，认识一下我们的四位核心员工。首先是<strong>大脑 Hermes</strong>，它不亲自干活，只负责统筹、分发任务与合成最终结果。接着是<strong>数据研究员 Allen</strong>，它永远保持极度怀疑，专门负责交叉验证，把垃圾数据挡在门外。然后是<strong>文字守门人 Mira</strong>，负责把粗糙的原材料加工成通透的视频脚本。最后是<strong>程序员 Turing</strong>，只负责代码开发，在独立的沙箱里疯狂试错。这样各司其职，团队才可能零幻觉落地！"
  },
  {
    time: "02:31 - 03:30",
    visual: "<strong>【实操三步法：如何从0配置】</strong><br>镜头给到电脑屏幕，展示在终端通过克隆指令创建 Agent，并配置 `.env` 绑定 Telegram 机器人的全过程。",
    audio: "如何搭建？只需三步：<br>第一步，使用克隆命令，比如 <code>hermes profile clone</code>，快速复制基础的 API Key 和引擎，但彻底隔绝它的记忆和技能；<br>第二步，为每个 Agent 编写它专属的 <strong>Soul.md</strong>。记住，一定要写清楚团队的存在，否则 AI 就会觉得自己无所不能，直接越权干活；<br>第三步，在 <strong>.env</strong> 中分别配置它们的 Telegram token。这样，我们就能在手机上，通过群聊或私信，像指挥真正员工一样远程调度它们。"
  },
  {
    time: "03:31 - 04:00",
    visual: "<strong>【结尾总结与行动引导】</strong><br>主播面带微笑，镜头慢慢拉远。屏幕一侧弹出“一人公司”字样，并配合自动同步推送云端 R2 的指示。",
    audio: "总结一下，最强大的团队，永远拥有最清晰的边界。停止强迫 AI 包揽一切，把他们隔离开。如果你也想拿到我们的《多智能体团队一键配置灵魂手册》和代码命令，直接在评论区扣<strong>“智能体团队”</strong>，我们一起开启超级个体时代！"
  }
]);
</script>

<style scoped>
.cyber-page {
  background: #060913;
  min-height: 100vh;
  width: 100%;
  position: relative;
  overflow: hidden;
  color: #e2e8f0;
}

.scanline {
  width: 100%;
  height: 4px;
  background: rgba(0, 243, 255, 0.05);
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  animation: scan 8s linear infinite;
  z-index: 20;
}
@keyframes scan {
  0% { top: -5%; }
  100% { top: 105%; }
}

.glow-bg {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(0, 243, 255, 0.05) 0%, rgba(255, 0, 127, 0.02) 50%, rgba(0, 0, 0, 0) 70%);
  pointer-events: none;
}

.pulse-dot {
  width: 10px;
  height: 10px;
  background: var(--cyber-cyan);
  border-radius: 50%;
  box-shadow: 0 0 8px var(--cyber-cyan);
  animation: pulse 2s infinite;
}

.cyber-glitch {
  text-shadow: 0 0 10px rgba(0, 243, 255, 0.3);
}

.subtitle {
  color: #00ff41;
  opacity: 0.8;
  margin-left: 1.5rem;
}

/* 神经网络星轨卡片 */
.visualizer-card, .script-card, .card-bottom {
  background: rgba(13, 2, 8, 0.85);
  border: 1px solid #1e293b !important;
  border-radius: 0.75rem;
}

.visualizer-title {
  color: #94a3b8;
}

.orbit-wrapper {
  position: relative;
  width: 320px;
  height: 320px;
  margin: 20px auto;
  display: flex;
  justify-content: center;
  align-items: center;
}

.center-node {
  position: absolute;
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background: rgba(15, 23, 42, 0.95);
  border: 3px solid #ff007f;
  box-shadow: 0 0 20px rgba(255, 0, 127, 0.4), inset 0 0 8px rgba(255, 0, 127, 0.2);
  z-index: 10;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  cursor: pointer;
}

.center-node .name {
  font-size: 0.95rem;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 0 6px #ff007f;
}

.center-node .role {
  font-size: 0.55rem;
  color: #ff007f;
  border: 1px solid #ff007f;
  padding: 0px 4px;
  border-radius: 2px;
  margin-top: 2px;
}

.orbit-circle {
  position: absolute;
  width: 220px;
  height: 220px;
  border: 1px dashed rgba(0, 243, 255, 0.2);
  border-radius: 50%;
  animation: rotate-orbit 40s linear infinite;
  z-index: 5;
}

.orbit-wrapper:hover .orbit-circle {
  animation-play-state: paused;
}
.orbit-wrapper:hover .sub-node {
  animation-play-state: paused;
}

.sub-node {
  position: absolute;
  width: 65px;
  height: 65px;
  border-radius: 50%;
  background: rgba(15, 23, 42, 0.95);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  cursor: pointer;
  z-index: 8;
}

@keyframes counter-rotate-node {
  from { transform: rotate(var(--angle)) translate(110px) rotate(calc(-1 * var(--angle))) rotate(0deg); }
  to { transform: rotate(var(--angle)) translate(110px) rotate(calc(-1 * var(--angle))) rotate(-360deg); }
}

.sub-node.allen {
  --angle: 0rad;
  border: 2px solid #00f3ff;
  box-shadow: 0 0 10px rgba(0, 243, 255, 0.2);
  animation: counter-rotate-node 40s linear infinite;
}
.sub-node.mira {
  --angle: 2.094rad;
  border: 2px solid #a78bfa;
  box-shadow: 0 0 10px rgba(167, 139, 250, 0.2);
  animation: counter-rotate-node 40s linear infinite;
}
.sub-node.turing {
  --angle: 4.188rad;
  border: 2px solid #00ff41;
  box-shadow: 0 0 10px rgba(0, 255, 65, 0.2);
  animation: counter-rotate-node 40s linear infinite;
}

.sub-node:hover {
  transform: rotate(var(--angle)) translate(110px) rotate(calc(-1 * var(--angle))) scale(1.1) !important;
  z-index: 15;
}
.sub-node.allen:hover { border-color: #fff; box-shadow: 0 0 20px #00f3ff; }
.sub-node.mira:hover { border-color: #fff; box-shadow: 0 0 20px #a78bfa; }
.sub-node.turing:hover { border-color: #fff; box-shadow: 0 0 20px #00ff41; }

.sub-node .node-name {
  font-size: 0.75rem;
  font-weight: 700;
  color: #fff;
}
.sub-node .node-role {
  font-size: 0.55rem;
  color: #94a3b8;
}

.details-panel {
  margin-top: 1.5rem;
  width: 100%;
  border-top: 1px solid #1e293b;
  padding-top: 1rem;
}
.details-title {
  color: #00f3ff;
}
.details-desc {
  color: #94a3b8;
  line-height: 1.6;
}

/* 口播分镜表 */
.script-card {
  height: 520px;
  display: flex;
  flex-direction: column;
}
.script-table-wrapper {
  flex: 1;
  overflow-y: auto;
  border: 1px solid #1e293b;
  border-radius: 4px;
}

:deep(.cyber-table) {
  background: transparent !important;
  color: #e2e8f0;
}
:deep(.cyber-table th.el-table__cell) {
  background: #0f172a !important;
  color: #fff;
  border-bottom: 1px solid #1e293b;
}
:deep(.cyber-table td.el-table__cell) {
  border-bottom: 1px solid #1e293b;
  background: transparent !important;
  padding: 12px 8px;
}
:deep(.cyber-table .el-table__row:hover td.el-table__cell) {
  background: rgba(30, 41, 59, 0.4) !important;
}

.td-time {
  font-weight: bold;
  color: #00f3ff;
}
.td-visual {
  color: #94a3b8;
  font-size: 0.7rem;
}
.td-audio {
  color: #e2e8f0;
  font-size: 0.75rem;
}

/* 底部卡片列表 */
.card-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  box-shadow: 0 0 6px currentColor;
}

/* Cyber Tab Buttons */
.cyber-tab-btn {
  background: transparent;
  border: none;
  color: #64748b;
  font-size: 0.85rem;
  font-weight: bold;
  padding: 4px 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}
.cyber-tab-btn:hover {
  color: #e2e8f0;
}
.cyber-tab-btn.active {
  color: #00f3ff;
  text-shadow: 0 0 8px rgba(0, 243, 255, 0.4);
}
.cyber-tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: -9px;
  left: 0;
  width: 100%;
  height: 2px;
  background: #00f3ff;
  box-shadow: 0 0 8px #00f3ff;
}

.video-panel {
  animation: fadeIn 0.4s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
