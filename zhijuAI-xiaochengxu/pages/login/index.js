Page({
    data: {
        role: 'TENANT',
        roleName: '租客'
    },

    onLoad(options) {
        if (options.role) {
            this.setData({
                role: options.role,
                roleName: options.role === 'LANDLORD' ? '房东' : '租客'
            })
        }
    },

    handleLogin() {
        wx.showLoading({
            title: '登录中...',
        })

        // Mock Login Delay and Success
        setTimeout(() => {
            wx.hideLoading()

            // Store user info (Mock)
            wx.setStorageSync('userRole', this.data.role);
            wx.setStorageSync('isLoggedIn', true);

            // Navigate to respective home
            const url = this.data.role === 'LANDLORD'
                ? '/pages/landlord/home/index'
                : '/pages/tenant/home/index';

            wx.reLaunch({
                url: url
            })
        }, 1500)
    }
})
