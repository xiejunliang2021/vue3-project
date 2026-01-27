import request from '@/api/request'

// 执行组合回测
export function runPortfolioBacktest(data) {
    return request({
        url: '/api/backtest/portfolio/run/',
        method: 'post',
        data
    })
}

// 获取回测结果列表
export function getPortfolioBacktestList(params) {
    return request({
        url: '/api/backtest/portfolio/results/',
        method: 'get',
        params
    })
}

// 获取单个回测详情
export function getPortfolioBacktestDetail(id) {
    return request({
        url: `/api/backtest/portfolio/results/${id}/`,
        method: 'get'
    })
}

// 获取交易日志
export function getTradeLogList(backtestId) {
    return request({
        url: `/api/backtest/portfolio/${backtestId}/trades/`,
        method: 'get'
    })
}

// 删除回测记录
export function deletePortfolioBacktest(backtestId) {
    return request({
        url: `/api/backtest/portfolio/${backtestId}/delete/`,
        method: 'delete'
    })
}

// 获取任务状态 (保留兼容性)
export function getBacktestResults(taskId) {
    return request({
        url: `/api/backtest/results/${taskId}/`,
        method: 'get'
    })
}
