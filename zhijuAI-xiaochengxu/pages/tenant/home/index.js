const { supabase } = require('../../../utils/supabase');

Page({
    data: {
        properties: [],
        isLoading: true,
        // Mock functions for quick access
        serviceMenu: [
            { icon: 'dollar', label: '在线缴费', path: '/pages/tenant/payment/index', color: '#FFD93D', bg: 'bg-yellow-light' },
            { icon: 'wrench', label: '报修申请', path: '/pages/tenant/repair/index', color: '#A8DADC', bg: 'bg-blue-light' },
            { icon: 'file', label: '我的合同', path: '/pages/tenant/contract/index', color: '#95E1D3', bg: 'bg-teal-light' },
            { icon: 'message', label: '联系房东', path: '', action: 'contact', color: '#FF6B9D', bg: 'bg-pink-light' }
        ]
    },

    onLoad() {
        this.fetchProperties();
    },

    onPullDownRefresh() {
        this.fetchProperties().then(() => {
            wx.stopPullDownRefresh();
        });
    },

    async fetchProperties() {
        this.setData({ isLoading: true });

        // Use our new Supabase client
        const { data, error } = await supabase
            .from('properties')
            .select('*')
            .order('created_at', { ascending: false }) // Assuming created_at exists, maybe adjust if table empty
            .exec();

        if (error) {
            console.error('Fetch properties failed', error);
            // Fallback (or show error toast)
            // Just for demo, if table is empty or error (e.g. no RLS), show empty state
            this.setData({ isLoading: false });
            return;
        }

        // If succesful but empty, the array is just empty
        this.setData({
            properties: data || [],
            isLoading: false
        });
    },

    navTo(e) {
        const path = e.currentTarget.dataset.path;
        const action = e.currentTarget.dataset.action;

        if (action === 'contact') {
            wx.showToast({ title: '联系房东功能开发中', icon: 'none' });
            return;
        }

        if (path) {
            wx.navigateTo({
                url: path,
                fail: () => wx.showToast({ title: '功能开发中', icon: 'none' })
            });
        }
    }
})
