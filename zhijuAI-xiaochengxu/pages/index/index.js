Page({
    data: {
        // any dynamic data
    },

    selectRole(e) {
        const role = e.currentTarget.dataset.role;
        console.log('Role selected:', role);

        // Save role
        wx.setStorageSync('userRole', role);
        wx.setStorageSync('currentRole', role.toUpperCase()); // Sync with app.js expectation

        // MVP: Bypass Login, Go Direct
        const url = role === 'tenant'
            ? '/pages/tenant/home/index'
            : '/pages/landlord/home/index';

        console.log('Redirecting to:', url);

        // Use reLaunch to clear text stack and start fresh
        wx.reLaunch({
            url: url,
            fail: (err) => {
                console.error('Navigation failed:', err);
                wx.showToast({ title: '跳转失败', icon: 'none' });
            }
        });
    }
})
