import request from '@/api/request'

export function login(username, password) {
    return request({
        url: '/api/auth/login/',
        method: 'post',
        data: {
            username,
            password
        }
    })
}

export function loginByKey(key) {
    return request({
        url: '/api/auth/login_by_key/',
        method: 'post',
        data: {
            key
        }
    })
}

export function logout() {
    return request({
        url: '/api/auth/logout/',
        method: 'post'
    })
}

export function getUserInfo() {
    return request({
        url: '/api/auth/user/',
        method: 'get'
    })
}

export function updateProfile(data) {
    return request({
        url: '/api/auth/profile/update/',
        method: 'put',
        data
    })
}

export function changePassword(data) {
    return request({
        url: '/api/auth/password/change/',
        method: 'post',
        data
    })
}

export function refreshToken(refresh) {
    return request({
        url: '/api/auth/refresh/',
        method: 'post',
        data: { refresh }
    })
}

