// 房东-经营分析页面
const app = getApp()
const { supabase } = require('../../../utils/supabase')

Page({
    data: {
        periods: [
            { key: 'month', label: '本月' },
            { key: 'quarter', label: '本季度' },
            { key: 'year', label: '本年度' }
        ],
        selectedPeriod: 'month',
        loading: true,
        kpis: [],
        propertyDistribution: [],
        areaDistribution: []
    },

    onLoad() {
        this.loadAnalytics()
    },

    onShow() {
        this.loadAnalytics()
    },

    async loadAnalytics() {
        const landlordId = wx.getStorageSync('landlord_id')
        this.setData({ loading: true })

        try {
            // 加载房源数据
            const { data: properties } = await supabase
                .from('properties')
                .select('*')
                .eq('landlord_id', landlordId)
                .exec()

            // 加载收入数据
            const { data: payments } = await supabase
                .from('payments')
                .select('amount')
                .eq('landlord_id', landlordId)
                .eq('status', 'confirmed')
                .exec()

            const propertyList = properties || []
            const paymentList = payments || []

            // 计算KPI
            const totalIncome = paymentList.reduce((sum, p) => sum + (p.amount || 0), 0)
            const totalProperties = propertyList.length
            const occupiedCount = propertyList.filter(p => p.status === 'occupied').length
            const occupancyRate = totalProperties > 0 ? (occupiedCount / totalProperties * 100).toFixed(1) : 0
            const avgRent = propertyList.reduce((sum, p) => sum + (p.rent_amount || p.price || 0), 0) / (totalProperties || 1)

            const kpis = [
                { label: '总收入', value: `¥${(totalIncome / 1000).toFixed(0)}k`, growth: 0, icon: 'dollar', iconColor: '#10b981' },
                { label: '出租率', value: `${occupancyRate}%`, growth: 0, icon: 'chart', iconColor: '#2563eb' },
                { label: '平均租金', value: `¥${avgRent.toFixed(0)}`, growth: 0, icon: 'home', iconColor: '#f59e0b' },
                { label: '房源数量', value: String(totalProperties), valueDesc: `${totalProperties - occupiedCount}套空置`, icon: 'user', iconColor: '#6366f1' }
            ]

            // 房源类型分布
            const typeMap = {}
            propertyList.forEach(p => {
                const type = p.property_type || '其他'
                if (!typeMap[type]) typeMap[type] = { count: 0, revenue: 0 }
                typeMap[type].count++
                typeMap[type].revenue += (p.rent_amount || p.price || 0)
            })

            const propertyDistribution = Object.entries(typeMap).map(([type, data]) => ({
                type,
                count: data.count,
                revenue: (data.revenue / 1000).toFixed(0),
                percent: totalProperties > 0 ? (data.count / totalProperties * 100).toFixed(1) : 0
            }))

            // 区域分布
            const areaMap = {}
            propertyList.forEach(p => {
                const area = p.district || '其他区域'
                if (!areaMap[area]) areaMap[area] = 0
                areaMap[area] += (p.rent_amount || p.price || 0)
            })

            const totalAreaRevenue = Object.values(areaMap).reduce((a, b) => a + b, 0) || 1
            const areaDistribution = Object.entries(areaMap).map(([area, revenue]) => ({
                area,
                revenue: (revenue / 1000).toFixed(0),
                percent: Math.round(revenue / totalAreaRevenue * 100)
            }))

            this.setData({ kpis, propertyDistribution, areaDistribution, loading: false })
        } catch (err) {
            console.error('加载分析数据失败', err)
            this.setData({ loading: false })
        }
    },

    setPeriod(e) {
        this.setData({ selectedPeriod: e.currentTarget.dataset.period })
        this.loadAnalytics()
    }
})
