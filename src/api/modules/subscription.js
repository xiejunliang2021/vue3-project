import request from '@/api/request'

/**
 * 专属订阅管理 API 模块
 * 对接远端 Django REST Framework /api/profiles/
 */

// 获取订阅配置列表
export function getProfiles(params) {
  return request({
    url: '/api/profiles/',
    method: 'get',
    params
  })
}

// 获取单个订阅详情
export function getProfile(id) {
  return request({
    url: `/api/profiles/${id}/`,
    method: 'get'
  })
}

// 新建订阅配置
export function createProfile(data) {
  return request({
    url: '/api/profiles/',
    method: 'post',
    data
  })
}

// 全量更新订阅配置
export function updateProfile(id, data) {
  return request({
    url: `/api/profiles/${id}/`,
    method: 'put',
    data
  })
}

// 局部更新订阅配置（如切换启用状态）
export function patchProfile(id, data) {
  return request({
    url: `/api/profiles/${id}/`,
    method: 'patch',
    data
  })
}

// 删除订阅配置
export function deleteProfile(id) {
  return request({
    url: `/api/profiles/${id}/`,
    method: 'delete'
  })
}

// 重置/刷新 UUID Token
export function refreshProfileToken(id) {
  return request({
    url: `/api/profiles/${id}/refresh_token/`,
    method: 'post'
  })
}
