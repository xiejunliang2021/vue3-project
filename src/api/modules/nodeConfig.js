import request from '@/api/request'

/**
 * 节点与优选配置管理 API 接口
 * 适用于远端独立 Django 后端服务
 */

// 保存配置（新增或更新）
export function saveNodeConfig(data) {
  return request({
    url: '/api/node-config/save/',
    method: 'post',
    data
  })
}

// 获取配置详情（按 ID 或 token）
export function getNodeConfig(params) {
  return request({
    url: '/api/node-config/',
    method: 'get',
    params
  })
}

// 获取所有配置列表
export function getNodeConfigList() {
  return request({
    url: '/api/node-config/list/',
    method: 'get'
  })
}

// 提交至远端 Django 后端进行节点解析与组合转换
export function convertNodesRemote(data) {
  return request({
    url: '/api/node-config/convert/',
    method: 'post',
    data
  })
}

// 删除指定配置
export function deleteNodeConfig(id) {
  return request({
    url: `/api/node-config/${id}/`,
    method: 'delete'
  })
}
