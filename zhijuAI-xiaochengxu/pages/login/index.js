// 登录页面 - 获取微信信息和手机号，使用UUID
const app = getApp()
const { supabase } = require('../../utils/supabase')

// 固定的房东UUID（与测试数据对应）
const TEST_LANDLORD_UUID = '11111111-1111-1111-1111-111111111111'

Page({
    data: {
        role: '',
        isLoading: false,
        userInfo: null,
        phone: '',
        hasUserInfo: false,
        hasPhone: false
    },

    onLoad(options) {
        if (options.role) {
            this.setData({ role: options.role })
        }
    },

    getUserProfile() {
        wx.getUserProfile({
            desc: '用于完善您的个人资料',
            success: (res) => {
                this.setData({
                    userInfo: res.userInfo,
                    hasUserInfo: true
                })
                wx.showToast({ title: '获取成功', icon: 'success' })
            },
            fail: () => {
                wx.showToast({ title: '请授权获取信息', icon: 'none' })
            }
        })
    },

    getPhoneNumber(e) {
        if (e.detail.errMsg === 'getPhoneNumber:ok') {
            this.showPhoneInput()
        } else {
            this.showPhoneInput()
        }
    },

    showPhoneInput() {
        wx.showModal({
            title: '绑定手机号',
            editable: true,
            placeholderText: '请输入您的手机号',
            success: (res) => {
                if (res.confirm && res.content) {
                    const phone = res.content.trim()
                    if (/^1[3-9]\d{9}$/.test(phone)) {
                        this.setData({ phone, hasPhone: true })
                        wx.showToast({ title: '绑定成功', icon: 'success' })
                    } else {
                        wx.showToast({ title: '手机号格式错误', icon: 'none' })
                    }
                }
            }
        })
    },

    async handleWechatLogin() {
        const { userInfo, phone } = this.data

        if (!userInfo) {
            return wx.showModal({
                title: '提示',
                content: '请先点击"获取微信信息"按钮',
                showCancel: false
            })
        }

        if (!phone) {
            return wx.showModal({
                title: '提示',
                content: '请先绑定手机号',
                showCancel: false
            })
        }

        this.setData({ isLoading: true })

        try {
            await this.wxLogin()
            const user = await this.findOrCreateUser(userInfo, phone)
            this.saveLoginState(user, userInfo, phone)

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

    wxLogin() {
        return new Promise((resolve, reject) => {
            wx.login({ success: resolve, fail: reject })
        })
    },

    async findOrCreateUser(userInfo, phone) {
        const role = this.data.role
        const tableName = role === 'TENANT' ? 'tenants' : 'landlords'

        // 根据手机号查找用户
        try {
            const { data } = await supabase
                .from(tableName)
                .select('id, name, phone, uuid_id')
                .eq('phone', phone)
                .limit(1)
                .exec()

            if (data && data.length > 0) {
                // 找到已有用户
                await supabase
                    .from(tableName)
                    .update({
                        name: userInfo.nickName || data[0].name,
                        avatar_url: userInfo.avatarUrl,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', data[0].id)
                    .exec()

                console.log('找到已有用户:', data[0])
                // 返回UUID用于查询其他表
                return {
                    id: data[0].id,
                    uuid_id: data[0].uuid_id || TEST_LANDLORD_UUID,
                    isNew: false
                }
            }
        } catch (err) {
            console.log('查询用户失败')
        }

        // 创建新用户
        const newId = role === 'TENANT' ? 'tenant-' + phone : 'landlord-' + phone
        const newUuid = crypto.randomUUID ? crypto.randomUUID() : TEST_LANDLORD_UUID

        try {
            await supabase
                .from(tableName)
                .insert([{
                    id: newId,
                    name: userInfo.nickName || '',
                    phone: phone,
                    avatar_url: userInfo.avatarUrl || '',
                    uuid_id: newUuid,
                    status: 'active',
                    created_at: new Date().toISOString()
                }])
                .exec()

            console.log('创建新用户:', newId)
        } catch (err) {
            console.log('创建用户失败')
        }

        return { id: newId, uuid_id: newUuid, isNew: true }
    },

    saveLoginState(user, userInfo, phone) {
        const role = this.data.role

        wx.setStorageSync('user_name', userInfo.nickName || '')
        wx.setStorageSync('user_avatar', userInfo.avatarUrl || '')
        wx.setStorageSync('user_phone', phone)
        wx.setStorageSync('currentRole', role)
        wx.setStorageSync('login_time', Date.now())

        if (role === 'TENANT') {
            wx.setStorageSync('tenant_id', user.id)
            wx.setStorageSync('tenant_uuid', user.uuid_id)
            app.globalData.tenantId = user.id
            app.globalData.tenantUuid = user.uuid_id
        } else {
            wx.setStorageSync('landlord_id', user.id)
            // 关键：存储UUID用于查询其他表
            wx.setStorageSync('landlord_uuid', user.uuid_id)
            app.globalData.landlordId = user.id
            app.globalData.landlordUuid = user.uuid_id
        }

        console.log('登录状态已保存:', { role, id: user.id, uuid: user.uuid_id })
    },

    handlePhoneLogin() {
        this.handleWechatLogin()
    }
})
