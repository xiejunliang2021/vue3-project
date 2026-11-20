/**
 * useParticles.js
 * ─────────────────────────────────────────────────────
 * 【背景层】tsParticles 4.x 赛博朋克微光粒子背景初始化 Hook
 *
 * 职责：
 *  - 在指定 DOM 容器上挂载 tsParticles 画布（全屏透明底层）
 *  - 渲染带有网络连线与呼吸 opacity 动效的青色微光粒子
 *  - 暴露 destroy() 方法供组件 onUnmounted 阶段清理
 *
 * 使用方式（在 Vue 3 组件中）：
 *   const { initParticles, destroyParticles } = useParticles()
 *   onMounted(() => initParticles('particles-bg'))
 *   onUnmounted(() => destroyParticles())
 * ─────────────────────────────────────────────────────
 */

import { ref } from 'vue'
// tsParticles 4.x：引擎实例从 @tsparticles/engine，插件注册从 tsparticles
import { tsParticles } from '@tsparticles/engine'
import { loadFull } from 'tsparticles'

// 全局只初始化一次 loadFull
let _engineReady = false
async function _ensureEngine() {
  if (!_engineReady) {
    await loadFull(tsParticles)
    _engineReady = true
  }
}

export function useParticles() {
  /** @type {import('tsparticles-engine').Container | null} */
  const particlesContainer = ref(null)

  /**
   * 初始化 tsParticles 背景
   * @param {string} domId - 挂载目标元素的 id (必须已存在于 DOM)
   * @param {object} [overrideOptions] - 可选覆盖配置，用于主题切换
   */
  async function initParticles(domId, overrideOptions = {}) {
    // 如果已有实例，先销毁
    if (particlesContainer.value) {
      particlesContainer.value.destroy()
      particlesContainer.value = null
    }

    // 确保引擎插件已加载
    await _ensureEngine()

    const defaultOptions = {
      // tsParticles 4.x 的 fullScreen 默认 false，需指定父容器
      fullScreen: { enable: false },

      background: {
        color: { value: 'transparent' },
      },

      fpsLimit: 60,

      interactivity: {
        events: {
          onHover: { enable: true, mode: 'repulse' },
          resize: { enable: true },
        },
        modes: {
          repulse: { distance: 80, duration: 0.4 },
        },
      },

      particles: {
        number: {
          value: 95,
          density: { enable: true, area: 900 },
        },
        color: {
          value: ['#00ffcc', '#00b3ff', '#aa00ff'],
        },
        shape: { type: 'circle' },
        opacity: {
          value: { min: 0.08, max: 0.45 },
          animation: {
            enable: true,
            speed: 0.6,
            sync: false,
            startValue: 'random',
          },
        },
        size: {
          value: { min: 1.5, max: 4.5 },
          animation: {
            enable: true,
            speed: 1.5,
            sync: false,
          },
        },
        links: {
          enable: true,
          distance: 150,
          color: '#00ffcc',
          opacity: 0.28,
          width: 1.2,
          triangles: { enable: false },
        },
        move: {
          enable: true,
          speed: 0.6,
          direction: 'none',
          random: true,
          straight: false,
          outModes: { default: 'out' },
          attract: { enable: false },
        },
        twinkle: {
          particles: {
            enable: true,
            frequency: 0.04,
            opacity: 0.8,
            color: { value: '#ffffff' },
          },
        },
      },

      detectRetina: true,
    }

    const mergedOptions = deepMerge(defaultOptions, overrideOptions)

    try {
      const container = await tsParticles.load({
        id: domId,
        options: mergedOptions,
      })
      particlesContainer.value = container
      console.log('[useParticles] tsParticles 背景层已初始化 ✅', domId)
    } catch (err) {
      console.error('[useParticles] 初始化失败:', err)
    }
  }

  /** 切换粒子颜色主题（不重建容器，直接刷新） */
  function setTheme(theme = 'cyberpunk') {
    const themeColorMap = {
      cyberpunk: ['#00ffcc', '#00b3ff', '#aa00ff'],
      minimal:   ['#cbd5e1', '#94a3b8', '#64748b'],
      hacker:    ['#00ff00', '#22c55e', '#16a34a'],
    }
    // tsParticles 4.x 通过容器 refresh 动态更新粒子配置
    if (particlesContainer.value) {
      const colors = themeColorMap[theme] || themeColorMap.cyberpunk
      // 更新粒子颜色并刷新
      particlesContainer.value.options.particles.color.value = colors
      particlesContainer.value.refresh()
    }
  }

  /** 暂停粒子动画（录制前暂停背景，避免干扰主画布） */
  function pauseParticles() {
    particlesContainer.value?.pause()
  }

  /** 恢复粒子动画 */
  function resumeParticles() {
    particlesContainer.value?.play()
  }

  /** 销毁粒子容器（在 onUnmounted 中调用） */
  function destroyParticles() {
    if (particlesContainer.value) {
      particlesContainer.value.destroy()
      particlesContainer.value = null
      console.log('[useParticles] 粒子背景层已销毁')
    }
  }

  return {
    particlesContainer,
    initParticles,
    destroyParticles,
    setTheme,
    pauseParticles,
    resumeParticles,
  }
}

// ─── 工具函数 ───────────────────────────────────────────────
/**
 * 简易深合并（合并两层对象，不引入额外依赖）
 * @param {object} target
 * @param {object} source
 */
function deepMerge(target, source) {
  const output = Object.assign({}, target)
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] })
        } else {
          output[key] = deepMerge(target[key], source[key])
        }
      } else {
        Object.assign(output, { [key]: source[key] })
      }
    })
  }
  return output
}

function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item)
}
