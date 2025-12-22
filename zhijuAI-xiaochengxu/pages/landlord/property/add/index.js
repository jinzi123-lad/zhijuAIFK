Page({
    data: {
        navHeight: 88
    },

    onLoad() {
        const systemInfo = wx.getSystemInfoSync()
        const menuButton = wx.getMenuButtonBoundingClientRect()
        const navBarHeight = (menuButton.top - systemInfo.statusBarHeight) * 2 + menuButton.height
        this.setData({ navHeight: systemInfo.statusBarHeight + navBarHeight + 12 })
    },

    // 选择房源类型
    selectType(e) {
        const type = e.currentTarget.dataset.type
        if (type === 'single') {
            wx.navigateTo({ url: '/pages/landlord/property/form/single/index' })
        } else {
            wx.navigateTo({ url: '/pages/landlord/property/form/building/index' })
        }
    }
})
