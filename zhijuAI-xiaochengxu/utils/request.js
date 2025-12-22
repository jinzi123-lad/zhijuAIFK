const config = {
    baseUrl: 'https://api.zhijuai.com/api', // 暂时硬编码，后续提取到配置文件
    timeout: 10000
}

const request = (options) => {
    return new Promise((resolve, reject) => {
        const token = wx.getStorageSync('token')

        wx.request({
            url: options.url.startsWith('http') ? options.url : config.baseUrl + options.url,
            method: options.method || 'GET',
            data: options.data || {},
            header: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : '',
                ...options.header
            },
            timeout: config.timeout,
            success: (res) => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(res.data)
                } else if (res.statusCode === 401) {
                    wx.removeStorageSync('token')
                    wx.reLaunch({
                        url: '/pages/login/index'
                    })
                    reject(new Error('Unauthorized'))
                } else {
                    wx.showToast({
                        title: res.data.message || '请求失败',
                        icon: 'none'
                    })
                    reject(res.data)
                }
            },
            fail: (err) => {
                wx.showToast({
                    title: '网络连接失败',
                    icon: 'none'
                })
                reject(err)
            }
        })
    })
}

const get = (url, data, header) => request({ url, method: 'GET', data, header })
const post = (url, data, header) => request({ url, method: 'POST', data, header })
const put = (url, data, header) => request({ url, method: 'PUT', data, header })
const del = (url, data, header) => request({ url, method: 'DELETE', data, header })

module.exports = {
    request,
    get,
    post,
    put,
    del
}
