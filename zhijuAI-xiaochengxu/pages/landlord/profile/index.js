// 房东-我的页面
const app = getApp()
const { supabase } = require('../../../utils/supabase')

Page({
    data: {
        userInfo: {
            name: '',
            phone: ''
        },
        verification: {
            status: 'none'
        }
    },

    onLoad() {
        this.loadUserInfo()
    },

    onShow() {
        this.loadUserInfo()
    },

    async loadUserInfo() {
        const landlordId = wx.getStorageSync('landlord_id')
        const userName = wx.getStorageSync('user_name')
        const userPhone = wx.getStorageSync('user_phone')
        const userAvatar = wx.getStorageSync('user_avatar')

        this.setData({
            userInfo: {
                name: userName || '房东用户',
                phone: userPhone || '',
                avatar: userAvatar || ''
            }
        })

        // 加载认证状态
        if (landlordId) {
            try {
                const { data } = await supabase
                    .from('user_verifications')
                    .select('status')
                    .eq('user_id', landlordId)
                    .eq('user_type', 'landlord')
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .exec()

                if (data && data.length > 0) {
                    this.setData({ verification: data[0] })
                }
            } catch (err) {
                console.error('加载认证状态失败', err)
            }
        }
    },

    // 编辑资料
    editProfile() {
        wx.navigateTo({ url: '/pages/landlord/profile/edit/index' })
    },

    // 导航
    goTo(e) {
        const path = e.currentTarget.dataset.path
        if (path) {
            wx.navigateTo({ url: path })
        }
    },

    // 切换身份
    switchRole() {
        wx.showModal({
            title: '切换身份',
            content: '确定要切换到租客身份吗？',
            success: (res) => {
                if (res.confirm) {
                    wx.setStorageSync('currentRole', 'TENANT')
                    wx.reLaunch({ url: '/pages/tenant/home/index' })
                }
            }
        })
    },

    // 退出登录
    logout() {
        wx.showModal({
            title: '退出登录',
            content: '确定要退出登录吗？',
            success: (res) => {
                if (res.confirm) {
                    wx.clearStorageSync()
                    wx.reLaunch({ url: '/pages/index/index' })
                }
            }
        })
    }
})
