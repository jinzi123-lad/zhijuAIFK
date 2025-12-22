// pages/landlord/analytics/index.js
Page({
    data: {
        periods: [
            { key: 'month', label: '本月' },
            { key: 'quarter', label: '本季度' },
            { key: 'year', label: '本年度' }
        ],
        selectedPeriod: 'month',
        kpis: [
            { label: "总收入", value: "¥468k", growth: 15.8, icon: "dollar", iconColor: "#10b981" },
            { label: "出租率", value: "92.3%", growth: 3.5, icon: "chart", iconColor: "#2563eb" },
            { label: "平均租金", value: "¥4,200", growth: 8.2, icon: "home", iconColor: "#f59e0b" },
            { label: "房源数量", value: "13", valueDesc: "1套空置", icon: "user", iconColor: "#6366f1" } // Reuse user icon as generic
        ],
        propertyDistribution: [
            { type: "住宅", count: 5, revenue: 180, percent: 38.5 },
            { type: "城市公寓", count: 4, revenue: 168, percent: 30.8 },
            { type: "城中村公寓", count: 3, revenue: 96, percent: 23.1 },
            { type: "写字楼", count: 1, revenue: 24, percent: 7.6 }
        ],
        areaDistribution: [
            { area: "福田区", revenue: 156, percent: 33 },
            { area: "南山区", revenue: 132, percent: 28 },
            { area: "罗湖区", revenue: 108, percent: 23 },
            { area: "宝安区", revenue: 72, percent: 15 }
        ]
    },

    setPeriod(e) {
        this.setData({ selectedPeriod: e.currentTarget.dataset.period });
    }
})
