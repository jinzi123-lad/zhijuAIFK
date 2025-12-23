// 房东-编辑资料页面
const app = getApp()
const { supabase } = require('../../../../utils/supabase')

Page({
    data: {
        userInfo: {
            name: '',
            phone: ''
        },
        avatarUrl: '',
        hasWxInfo: false,
        saving: false
    },

    onLoad() {
        this.loadUserInfo()
    },

    loadUserInfo() {
        const userName = wx.getStorageSync('user_name') || ''
        const userPhone = wx.getStorageSync('user_phone') || ''
        const avatarUrl = wx.getStorageSync('user_avatar') || ''

        this.setData({
            userInfo: {
                name: userName,
                phone: userPhone
            },
            avatarUrl: avatarUrl,
            hasWxInfo: !!userName && !!avatarUrl
        })
    },

    // 输入昵称
    onNameInput(e) {
        this.setData({ 'userInfo.name': e.detail.value })
    },

    // 选择头像
    chooseAvatar() {
        wx.chooseMedia({
            count: 1,
            mediaType: ['image'],
            sizeType: ['compressed'],
            success: (res) => {
                const tempFilePath = res.tempFiles[0].tempFilePath
                this.setData({ avatarUrl: tempFilePath })
            }
        })
    },

    // 获取微信用户信息
    getUserProfile() {
        wx.getUserProfile({
            desc: '用于完善个人资料',
            success: (res) => {
                const { nickName, avatarUrl } = res.userInfo
                this.setData({
                    'userInfo.name': nickName,
                    avatarUrl: avatarUrl,
                    hasWxInfo: true
                })
                wx.showToast({ title: '获取成功', icon: 'success' })
            },
            fail: (err) => {
                console.error('获取用户信息失败', err)
                wx.showToast({ title: '获取失败', icon: 'none' })
            }
        })
    },

    // 获取手机号
    getPhoneNumber(e) {
        if (e.detail.errMsg === 'getPhoneNumber:ok') {
            // 这里需要调用后端解密手机号
            // 简化处理：提示用户手动输入
            wx.showModal({
                title: '绑定手机号',
                editable: true,
                placeholderText: '请输入手机号',
                success: (res) => {
                    if (res.confirm && res.content) {
                        const phone = res.content.trim()
                        if (/^1[3-9]\d{9}$/.test(phone)) {
                            this.setData({ 'userInfo.phone': phone })
                            wx.showToast({ title: '绑定成功', icon: 'success' })
                        } else {
                            wx.showToast({ title: '手机号格式错误', icon: 'none' })
                        }
                    }
                }
            })
        } else {
            // 用户拒绝授权，提供手动输入
            wx.showModal({
                title: '绑定手机号',
                editable: true,
                placeholderText: '请输入手机号',
                success: (res) => {
                    if (res.confirm && res.content) {
                        const phone = res.content.trim()
                        if (/^1[3-9]\d{9}$/.test(phone)) {
                            this.setData({ 'userInfo.phone': phone })
                            wx.showToast({ title: '绑定成功', icon: 'success' })
                        } else {
                            wx.showToast({ title: '手机号格式错误', icon: 'none' })
                        }
                    }
                }
            })
        }
    },

    // 保存资料
    async saveProfile() {
        const { userInfo, avatarUrl } = this.data

        if (!userInfo.name) {
            return wx.showToast({ title: '请输入昵称', icon: 'none' })
        }

        this.setData({ saving: true })
        wx.showLoading({ title: '保存中...' })

        try {
            // 保存到本地存储
            wx.setStorageSync('user_name', userInfo.name)
            wx.setStorageSync('user_phone', userInfo.phone)
            wx.setStorageSync('user_avatar', avatarUrl)

            // 如果有landlord_id，同步到数据库
            const landlordId = wx.getStorageSync('landlord_id')
            if (landlordId) {
                await supabase
                    .from('landlords')
                    .update({
                        name: userInfo.name,
                        phone: userInfo.phone,
                        avatar_url: avatarUrl
                    })
                    .eq('id', landlordId)
                    .exec()
            }

            wx.hideLoading()
            wx.showToast({ title: '保存成功', icon: 'success' })

            setTimeout(() => {
                wx.navigateBack()
            }, 1500)
        } catch (err) {
            console.error('保存失败', err)
            wx.hideLoading()
            // 即使数据库保存失败，本地存储已成功
            wx.showToast({ title: '保存成功', icon: 'success' })
            setTimeout(() => {
                wx.navigateBack()
            }, 1500)
        }
    }
})
