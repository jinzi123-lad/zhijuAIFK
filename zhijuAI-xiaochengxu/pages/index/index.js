Page({
    selectTenant() {
        wx.navigateTo({
            url: '/pages/login/index?role=TENANT'
        })
    },

    selectLandlord() {
        wx.navigateTo({
            url: '/pages/login/index?role=LANDLORD'
        })
    }
})
