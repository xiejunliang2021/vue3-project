<template>
  <div ref="chart" class="w-full h-full min-h-[300px]"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  options: {
    type: Object,
    required: true
  }
})

const chart = ref(null)
let chartInstance = null

const initChart = () => {
    if (chart.value) {
        chartInstance = echarts.init(chart.value)
        chartInstance.setOption(props.options)
        window.addEventListener('resize', resizeChart)
    }
}

const resizeChart = () => {
    chartInstance?.resize()
}

watch(() => props.options, (newOptions) => {
    chartInstance?.setOption(newOptions)
}, { deep: true })

onMounted(() => {
    initChart()
})

onUnmounted(() => {
    window.removeEventListener('resize', resizeChart)
    chartInstance?.dispose()
})
</script>
