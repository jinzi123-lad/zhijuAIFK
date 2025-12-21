// pages/landlord/home/index.js
const { supabase } = require('../../../utils/supabase');

Page({
    data: {
        stats: {
            total: 0,
            occupied: 0,
            vacant: 0
        },
        mainFunctions: [
            { iconName: 'users', iconColor: '#4ECDC4', label: "租客管理", bgClass: "bg-cyan-light", path: "/pages/landlord/tenant/list/index" },
            { iconName: 'dollar', iconColor: '#FFD93D', label: "财务报表", bgClass: "bg-yellow-light", path: "/pages/landlord/finance/index" },
            { iconName: 'file', iconColor: '#95E1D3', label: "电子合同", bgClass: "bg-teal-light", path: "/pages/landlord/contract/index" },
            { iconName: 'wrench', iconColor: '#A8DADC', label: "维修工单", bgClass: "bg-blue-light", path: "/pages/landlord/maintenance/index" },
            { iconName: 'calendar', iconColor: '#F38181', label: "查房预约", bgClass: "bg-red-light", path: "/pages/landlord/inspection/index" },
            { iconName: 'chart', iconColor: '#6C5CE7', label: "收入趋势", bgClass: "bg-purple-light", path: "/pages/landlord/revenue/index" },
            { iconName: 'bar', iconColor: '#FF6B9D', label: "经营分析", bgClass: "bg-pink-light", path: "/pages/landlord/analytics/index" },
            { iconName: 'settings', iconColor: '#A29BFE', label: "系统设置", bgClass: "bg-indigo-light", path: "/pages/landlord/settings/index" },
        ],
        todos: [
            {
                id: 1,
                iconName: 'alert',
                title: "201室 租金逾期",
                description: "逾期3天，请及时联系",
                time: "今天",
                urgent: true,
            },
            {
                id: 2,
                iconName: 'wrench',
                title: "102室 水管报修",
                description: "卫生间漏水，需紧急处理",
                time: "30分钟前",
                urgent: true,
            },
        ]
    },

    onLoad() {
        wx.hideTabBar();
    },

    onShow() {
        this.fetchStats();
    },

    async fetchStats() {
        // Fetch properties to calc stats
        const landlordId = getApp().globalData.landlordId;
        const { data, error } = await supabase
            .from('properties')
            .select('id, status')
            .eq('landlord_id', landlordId)
            .exec();

        if (error) {
            console.error('Fetch stats failed', error);
            return;
        }

        const properties = data || [];
        const total = properties.length;
        const occupied = properties.filter(p => p.status === 'occupied').length;
        const vacant = properties.filter(p => p.status === 'vacant').length;

        this.setData({
            stats: { total, occupied, vacant }
        });
    },

    navToProperties() {
        wx.navigateTo({
            url: '/pages/landlord/property/list/index'
        });
    },

    navTo(e) {
        const path = e.currentTarget.dataset.path;
        wx.navigateTo({
            url: path,
            fail: (err) => {
                wx.showToast({ title: '功能开发中', icon: 'none' });
            }
        });
    },

    handleTodo(e) {
        wx.showToast({ title: '处理待办', icon: 'none' });
    }
})
