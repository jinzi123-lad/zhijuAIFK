// components/navbar/index.js
const app = getApp();

Component({
    properties: {
        title: {
            type: String,
            value: ''
        },
        showBack: {
            type: Boolean,
            value: true // Default to showing back button as requested
        },
        background: {
            type: String,
            value: 'rgba(255,255,255,0)' // Transparent by default
        }
    },

    data: {
        statusBarHeight: 20,
        navBarHeight: 44,
        menuHeight: 32
    },

    lifetimes: {
        attached() {
            const systemInfo = wx.getWindowInfo();
            const menuButtonInfo = wx.getMenuButtonBoundingClientRect();

            const statusBarHeight = systemInfo.statusBarHeight;
            const navBarHeight = (menuButtonInfo.top - systemInfo.statusBarHeight) * 2 + menuButtonInfo.height;
            const menuHeight = menuButtonInfo.height;

            this.setData({
                statusBarHeight,
                navBarHeight,
                menuHeight
            });
        }
    },

    methods: {
        goBack() {
            // Logic: if can go back, back. Else go to role selection or home
            const pages = getCurrentPages();
            if (pages.length > 1) {
                wx.navigateBack();
            } else {
                // Fallback for "Fake" back button on home page: Go to Role Selection?
                // Or just do nothing if strictly "Back"
                wx.reLaunch({
                    url: '/pages/index/index' // Assuming role selection is index
                });
            }
        }
    }
})
