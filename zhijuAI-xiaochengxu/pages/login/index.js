// 登录页面
const app = getApp()
const { supabase } = require('../../utils/supabase')

Page({
    data: {
        role: '',         // TENANT 或 LANDLORD
        isLoading: false,
        showUserProfile: false  // 是否显示获取用户信息
    },

    onLoad(options) {
        if (options.role) {
            this.setData({ role: options.role })
        }
    },

    // 微信登录
    async handleWechatLogin() {
        this.setData({ isLoading: true })

        try {
            // 1. 获取微信登录code
            const loginRes = await this.wxLogin()
            if (!loginRes.code) {
                throw new Error('获取登录凭证失败')
            }

            console.log('微信登录code:', loginRes.code)

            // 2. 生成唯一用户标识（使用code的hash作为临时openid）
            const uniqueId = this.generateUserId(loginRes.code)

            // 3. 检查用户是否已存在，不存在则创建
            const user = await this.findOrCreateUser(uniqueId)

            // 4. 保存登录状态
            this.saveLoginState(user)

            // 5. 跳转到对应页面
            wx.showToast({ title: '登录成功', icon: 'success' })

            setTimeout(() => {
                const url = this.data.role === 'TENANT'
                    ? '/pages/tenant/home/index'
                    : '/pages/landlord/home/index'
                wx.reLaunch({ url })
            }, 1000)

        } catch (error) {
            console.error('登录失败:', error)
            wx.showToast({ title: error.message || '登录失败', icon: 'none' })
        } finally {
            this.setData({ isLoading: false })
        }
    },

    // 封装微信登录为Promise
    wxLogin() {
        return new Promise((resolve, reject) => {
            wx.login({
                success: resolve,
                fail: reject
            })
        })
    },

    // 生成用户ID（基于微信code生成唯一标识）
    generateUserId(code) {
        // 简单的hash函数
        let hash = 0
        const str = code + Date.now().toString()
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i)
            hash = ((hash << 5) - hash) + char
            hash = hash & hash
        }
        return Math.abs(hash).toString(36) + Date.now().toString(36)
    },

    // 查找或创建用户
    async findOrCreateUser(uniqueId) {
        const role = this.data.role
        const tableName = role === 'TENANT' ? 'tenants' : 'landlords'

        // 先尝试从本地存储获取已有的用户ID
        const existingId = wx.getStorageSync(role === 'TENANT' ? 'tenant_id' : 'landlord_id')

        if (existingId) {
            // 已有用户，直接返回
            console.log('已有用户ID:', existingId)
            return {
                id: existingId,
                isNew: false
            }
        }

        // 创建新用户
        try {
            const newUser = {
                id: uniqueId,
                name: '',
                phone: '',
                avatar_url: '',
                status: 'active',
                created_at: new Date().toISOString()
            }

            const { data, error } = await supabase
                .from(tableName)
                .insert([newUser])
                .exec()

            if (error) {
                console.error('创建用户失败:', error)
                // 即使数据库创建失败，也使用本地ID
            }

            console.log('创建新用户:', uniqueId)
            return {
                id: uniqueId,
                isNew: true
            }
        } catch (err) {
            console.error('创建用户异常:', err)
            // 降级处理：使用本地ID
            return {
                id: uniqueId,
                isNew: true
            }
        }
    },

    // 保存登录状态
    saveLoginState(user) {
        const role = this.data.role

        // 保存到本地存储
        wx.setStorageSync('currentRole', role)
        wx.setStorageSync('login_time', Date.now())

        if (role === 'TENANT') {
            wx.setStorageSync('tenant_id', user.id)
        } else {
            wx.setStorageSync('landlord_id', user.id)
        }

        // 保存到全局数据
        app.globalData.currentRole = role
        if (role === 'TENANT') {
            app.globalData.tenantId = user.id
        } else {
            app.globalData.landlordId = user.id
        }

        console.log('登录状态已保存:', { role, userId: user.id })
    },

    // 手机号登录（暂未开放）
    handlePhoneLogin() {
        wx.showToast({ title: '暂未开放', icon: 'none' })
    }
})
