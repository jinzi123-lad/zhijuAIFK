const app = getApp()
const { post } = require('../../utils/request')

Page({
    data: {
        role: '',
        isLoading: false
    },

    onLoad(options) {
        if (options.role) {
            this.setData({ role: options.role })
        }
    },

    async handleWechatLogin() {
        this.setData({ isLoading: true })

        // Simulate Wechat Login
        wx.login({
            success: async (res) => {
                if (res.code) {
                    try {
                        // In a real app, we would call the backend here:
                        // const result = await post('/auth/wechat-login', { 
                        //   code: res.code,
                        //   role: this.data.role 
                        // })

                        // Mocking successful login for demonstration
                        console.log('Login Code:', res.code)
                        const mockToken = 'mock-jwt-token-' + Date.now()

                        // Save to Storage & Global Data
                        wx.setStorageSync('token', mockToken)
                        wx.setStorageSync('currentRole', this.data.role)
                        app.globalData.token = mockToken
                        app.globalData.currentRole = this.data.role

                        wx.showToast({
                            title: '登录成功',
                            icon: 'success'
                        })

                        setTimeout(() => {
                            const url = this.data.role === 'TENANT'
                                ? '/pages/tenant/home/index'
                                : '/pages/landlord/home/index'

                            wx.reLaunch({ url })
                        }, 1000)

                    } catch (error) {
                        console.error(error)
                        wx.showToast({
                            title: '登录失败',
                            icon: 'none'
                        })
                    } finally {
                        this.setData({ isLoading: false })
                    }
                }
            },
            fail: () => {
                this.setData({ isLoading: false })
                wx.showToast({ title: '微信登录失败', icon: 'none' })
            }
        })
    },

    handlePhoneLogin() {
        wx.showToast({
            title: '暂未开放',
            icon: 'none'
        })
    }
})
