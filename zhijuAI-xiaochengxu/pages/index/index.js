// 入口页面 - 自动检测登录状态
const TEST_LANDLORD_UUID = '11111111-1111-1111-1111-111111111111'

Page({
    data: {},

    onLoad() {
        this.checkLoginStatus()
    },

    checkLoginStatus() {
        const currentRole = wx.getStorageSync('currentRole')
        const landlordId = wx.getStorageSync('landlord_id')
        const tenantId = wx.getStorageSync('tenant_id')
        const loginTime = wx.getStorageSync('login_time')

        console.log('检测登录状态:', { currentRole, landlordId, tenantId })

        // 如果有登录信息，直接进入对应首页
        if (currentRole && (landlordId || tenantId)) {
            // 检查是否过期（30天）
            const isExpired = loginTime && (Date.now() - loginTime > 30 * 24 * 60 * 60 * 1000)

            if (!isExpired) {
                // 强制设置UUID用于测试（覆盖旧值）
                wx.setStorageSync('landlord_uuid', TEST_LANDLORD_UUID)
                console.log('Current Landlord UUID:', TEST_LANDLORD_UUID)

                const url = currentRole === 'TENANT'
                    ? '/pages/tenant/home/index'
                    : '/pages/landlord/home/index'

                wx.reLaunch({ url })
                return
            } else {
                this.clearLoginData()
            }
        }

        // 未登录，显示角色选择页面
        console.log('未登录，显示角色选择')
    },

    clearLoginData() {
        wx.removeStorageSync('currentRole')
        wx.removeStorageSync('landlord_id')
        wx.removeStorageSync('tenant_id')
        wx.removeStorageSync('landlord_uuid')
        wx.removeStorageSync('tenant_uuid')
        wx.removeStorageSync('login_time')
        wx.removeStorageSync('user_name')
        wx.removeStorageSync('user_phone')
        wx.removeStorageSync('user_avatar')
    },

    selectRole(e) {
        const role = e.currentTarget.dataset.role
        console.log('选择角色:', role)

        // 为了测试，直接设置UUID并跳转首页
        if (role === 'landlord') {
            wx.setStorageSync('currentRole', 'LANDLORD')
            wx.setStorageSync('landlord_id', 'landlord-15840008791')
            wx.setStorageSync('landlord_uuid', TEST_LANDLORD_UUID)
            wx.setStorageSync('login_time', Date.now())

            wx.reLaunch({ url: '/pages/landlord/home/index' })
        } else {
            // 租客走正常登录流程
            wx.navigateTo({ url: '/pages/login/index?role=TENANT' })
        }
    }
})
