<template>
  <div class="cyberpunk-container">
    <div class="scanline"></div>
    <div class="glow-bg"></div>
    
    <!-- 标题 -->
    <div class="header-title">
      <h1 class="glitch" data-text="一人公司总调度台">一人公司总调度台</h1>
      <p class="subtitle">DECISION TERMINAL V1.0.7 // STATUS: ACTIVE</p>
    </div>

    <!-- 神经网络星轨系统 -->
    <div class="orbit-wrapper" v-if="chairman">
      <!-- 董事长中心节点 (150px) -->
      <a :href="chairman.link" class="node-circle chairman-node">
        <div class="inner-circle">
          <span class="title">董事长</span>
          <span class="status-indicator">CORE</span>
        </div>
      </a>

      <!-- 核心旋转星轨系统 -->
      <div class="orbit-system">
        <!-- 环绕的六大部门 (100px) -->
        <div v-for="(dept, index) in orbitDepts" :key="dept.name" 
             class="node-circle orbit-node" 
             :style="getOrbitStyle(index)">
          <div class="inner-circle">
            <span class="dept-title">{{ dept.name }}</span>
            <a :href="dept.link" class="access-btn">ACCESS</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';

const allDepts = ref([]);

// 过滤出除董事长以外的六大部门
const orbitDepts = computed(() => {
  return allDepts.value.filter(d => d.name !== '董事长');
});

// 获取董事长数据
const chairman = computed(() => {
  return allDepts.value.find(d => d.name === '董事长') || {
    name: '董事长',
    link: 'obsidian://open?vault=obsidian&file=30%20Resources%2F%E8%91%A3%E4%BA%8B%E9%95%BF%E5%AE%A4'
  };
});

const getOrbitStyle = (index) => {
  const count = orbitDepts.value.length || 6;
  const angle = (index / count) * 2 * Math.PI;
  return {
    '--angle': `${angle}rad`
  };
};

onMounted(async () => {
  try {
    const res = await fetch('/data/depts_data.json');
    if (res.ok) {
      allDepts.value = await res.json();
    }
  } catch (err) {
    console.error("加载 Obsidian 数据失败，启动降级模式:", err);
  }
});
</script>

<style scoped>
/* 容器全屏及科技感背景 */
.cyberpunk-container {
  background: #060913;
  min-height: 100vh;
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  overflow: hidden;
  font-family: 'Courier New', Courier, monospace;
  color: #00f3ff;
  padding-top: 40px;
}

.glow-bg {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(0, 243, 255, 0.08) 0%, rgba(0, 0, 0, 0) 70%);
  pointer-events: none;
}

.header-title {
  text-align: center;
  z-index: 10;
  margin-bottom: 20px;
}

.glitch {
  font-size: 2.5rem;
  font-weight: 900;
  color: #fff;
  text-shadow: 0 0 10px #00f3ff, 0 0 20px #00f3ff;
  letter-spacing: 2px;
}

.subtitle {
  font-size: 0.8rem;
  color: #00ff41;
  opacity: 0.8;
  margin-top: 5px;
}

/* 神经网络系统包裹层 */
.orbit-wrapper {
  position: relative;
  width: 500px;
  height: 500px;
  margin-top: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 董事长中心节点 (绝对居中) */
.chairman-node {
  position: absolute;
  width: 150px;
  height: 150px;
  border-radius: 50% !important;
  background: rgba(13, 2, 8, 0.9);
  border: 3px solid #ff007f;
  box-shadow: 0 0 25px rgba(255, 0, 127, 0.6), inset 0 0 15px rgba(255, 0, 127, 0.3);
  z-index: 10;
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: auto;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.chairman-node:hover {
  transform: scale(1.1);
  border-color: #ff0055;
  box-shadow: 0 0 40px rgba(255, 0, 85, 0.9), inset 0 0 20px rgba(255, 0, 85, 0.5);
  cursor: pointer;
}

.chairman-node .inner-circle {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.chairman-node .title {
  color: #fff;
  font-size: 1.4rem;
  font-weight: bold;
  text-shadow: 0 0 8px #ff007f;
}

.status-indicator {
  font-size: 0.7rem;
  color: #ff007f;
  border: 1px solid #ff007f;
  padding: 2px 6px;
  margin-top: 6px;
  border-radius: 3px;
  background: rgba(255, 0, 127, 0.1);
}

/* 旋转系统圆环 */
.orbit-system {
  position: absolute;
  width: 360px;
  height: 360px;
  border: 1px dashed rgba(0, 243, 255, 0.3);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  animation: rotate-system 30s linear infinite;
  z-index: 5;
}

/* 统一部门圆形节点样式 */
.orbit-node {
  position: absolute;
  width: 100px;
  height: 100px;
  border-radius: 50% !important;
  background: rgba(13, 2, 8, 0.95);
  border: 2px solid #00f3ff;
  box-shadow: 0 0 15px rgba(0, 243, 255, 0.3), inset 0 0 10px rgba(0, 243, 255, 0.1);
  display: flex;
  justify-content: center;
  align-items: center;
  transform: rotate(var(--angle)) translate(180px) rotate(calc(-1 * var(--angle))) rotate(0deg);
  animation: rotate-node 30s linear infinite;
  transition: box-shadow 0.3s, border-color 0.3s;
}

.orbit-node .inner-circle {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.dept-title {
  color: #fff;
  font-size: 0.95rem;
  font-weight: bold;
  margin-bottom: 6px;
}

.access-btn {
  font-size: 0.65rem;
  color: #00ff41;
  border: 1px solid rgba(0, 255, 65, 0.5);
  background: rgba(0, 255, 65, 0.05);
  padding: 2px 6px;
  text-decoration: none;
  border-radius: 3px;
  transition: all 0.2s;
}

.access-btn:hover {
  background: #00ff41;
  color: #000;
  box-shadow: 0 0 8px #00ff41;
}

/* Hover 动画效果 */
.orbit-node:hover {
  border-color: #00ff41;
  box-shadow: 0 0 25px rgba(0, 255, 65, 0.8), inset 0 0 15px rgba(0, 255, 65, 0.3);
  transform: rotate(var(--angle)) translate(180px) rotate(calc(-1 * var(--angle))) scale(1.15);
  z-index: 12;
  cursor: pointer;
}

/* 星轨公转关键帧 */
@keyframes rotate-system {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 悬停时暂停整个旋转系统的动画 */
.orbit-wrapper:hover .orbit-system {
  animation-play-state: paused;
}

/* 悬停时同样暂停所有子节点的自转抵消动画 */
.orbit-wrapper:hover .orbit-node {
  animation-play-state: paused;
}

/* 抵消公转的节点自转关键帧 (保证文字不颠倒) */
@keyframes rotate-node {
  from { transform: rotate(var(--angle)) translate(180px) rotate(calc(-1 * var(--angle))) rotate(0deg); }
  to { transform: rotate(var(--angle)) translate(180px) rotate(calc(-1 * var(--angle))) rotate(-360deg); }
}

/* 扫描线效果 */
.scanline {
  width: 100%;
  height: 4px;
  background: rgba(0, 243, 255, 0.1);
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  animation: scan 6s linear infinite;
  z-index: 20;
}

@keyframes scan {
  0% { top: -5%; }
  100% { top: 105%; }
}
</style>
