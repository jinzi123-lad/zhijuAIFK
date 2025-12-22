// pages/landlord/settings/index.js
Page({
    data: {
        settingsSections: [
            {
                title: "通知设置",
                items: [
                    { label: "消息通知", value: "已开启", path: "/settings/notifications" },
                    { label: "租金提醒", value: "提前3天", path: "/settings/rent-reminder" },
                ],
            },
            {
                title: "账户与安全",
                items: [
                    { label: "个人资料 (销售可见)", path: "/pages/landlord/profile/index" },
                    { label: "隐私设置", path: "/pages/landlord/settings/privacy" },
                ],
            },
            {
                title: "显示设置",
                items: [
                    { label: "语言", value: "简体中文", path: "/settings/language" },
                    { label: "深色模式", value: "跟随系统", path: "/settings/theme" },
                ],
            },
            {
                title: "帮助与支持",
                items: [
                    { label: "帮助中心", path: "/settings/help" },
                    { label: "用户协议", path: "/settings/terms" },
                    { label: "隐私政策", path: "/settings/policy" },
                ],
            },
        ]
    },

    navTo(e) {
        wx.showToast({ title: '跳转: ' + e.currentTarget.dataset.path, icon: 'none' });
    },

    onLogout() {
        wx.reLaunch({
            url: '/pages/index/index',
        });
    }
})
