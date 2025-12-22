// pages/landlord/revenue/index.js
Page({
    data: {
        years: ['2023', '2024', '2025'],
        selectedYear: '2024',
        viewMode: 'bar',
        stats: {
            totalIncome: '456.0',
            avgIncome: '38.0',
            growth: '12.5'
        },
        monthlyData: [
            { month: "1月", income: 32.0, target: 35, percent: 80, hitTarget: false },
            { month: "2月", income: 34.5, target: 35, percent: 85, hitTarget: false },
            { month: "3月", income: 36.8, target: 35, percent: 100, hitTarget: true },
            { month: "4月", income: 35.2, target: 37, percent: 90, hitTarget: false },
            { month: "5月", income: 38.6, target: 37, percent: 100, hitTarget: true },
            { month: "6月", income: 40.1, target: 37, percent: 100, hitTarget: true },
            // ... truncated for brevity in mock
            { month: "7月", income: 38.0, target: 40, percent: 95, hitTarget: false },
        ]
    },

    setYear(e) {
        this.setData({ selectedYear: e.currentTarget.dataset.year });
        wx.showToast({ title: '加载' + e.currentTarget.dataset.year + '数据', icon: 'none' });
    },

    setViewMode(e) {
        this.setData({ viewMode: e.currentTarget.dataset.mode });
    }
})
