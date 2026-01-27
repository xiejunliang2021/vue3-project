import request from '@/api/request'

export function getStockAnalyze(startDate) {
    return request({
        url: '/api/basics/analyze/',
        method: 'post',
        data: {
            start_date: startDate
        }
    })
}

export function getDateIsOpen(date) {
    return request({
        url: '/api/basics/date_is_open/',
        method: 'get',
        params: { date }
    })
}

export function getAllCodes() {
    return request({
        url: '/api/basics/all_codes/',
        method: 'get'
    })
}

export function getPolicyDetails(params) {
    return request({
        url: '/api/basics/policy-details/',
        method: 'get',
        params
    })
}
