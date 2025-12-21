// app.js
App({
    globalData: {
        userInfo: null,
        token: null,
        currentRole: null // 'landlord' | 'tenant'
    },
    onLaunch: function () {
        // 0. Ensure Landlord ID exists (Device-based isolation)
        let landlordId = wx.getStorageSync('landlord_id');
        if (!landlordId) {
            // Simple UUID generator
            landlordId = 'xxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
            wx.setStorageSync('landlord_id', landlordId);
        }
        this.globalData.landlordId = landlordId;
        console.log('Current Landlord ID:', landlordId);

        // 1. 获取本地存储的身份信息和 Token
        const token = wx.getStorageSync('token');
        const currentRole = wx.getStorageSync('currentRole') || 'LANDLORD'; // Default to landlord for dev

        // Auto-login logic (Simplified)
        if (currentRole) {
            // ... logic
        }
    }
})

