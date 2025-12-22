// 房东-营收统计页面
const app = getApp()
const { supabase } = require('../../../utils/supabase')

Page({
    data: {
        years: [],
        selectedYear: '',
        viewMode: 'bar',
        loading: true,
        stats: {
            totalIncome: '0',
            avgIncome: '0',
            growth: '0'
        },
        monthlyData: []
    },

    onLoad() {
        const currentYear = new Date().getFullYear()
        const years = [String(currentYear - 1), String(currentYear), String(currentYear + 1)]
        this.setData({ years, selectedYear: String(currentYear) })
        this.loadRevenue()
    },

    async loadRevenue() {
        const landlordId = wx.getStorageSync('landlord_id')
        const { selectedYear } = this.data
        this.setData({ loading: true })

        try {
            // 从payments表加载已确认的收款
            const startDate = `${selectedYear}-01-01`
            const endDate = `${selectedYear}-12-31`

            const { data, error } = await supabase
                .from('payments')
                .select('*')
                .eq('landlord_id', landlordId)
                .eq('status', 'confirmed')
                .gte('paid_date', startDate)
                .lte('paid_date', endDate)
                .exec()

            if (error) {
                console.error('加载收入失败', error)
                this.setData({ loading: false })
                return
            }

            // 按月汇总
            const monthlyMap = {}
            for (let i = 1; i <= 12; i++) {
                monthlyMap[i] = 0
            }

            let totalIncome = 0
                ; (data || []).forEach(p => {
                    const month = parseInt(p.paid_date?.split('-')[1] || 1)
                    const amount = p.amount || 0
                    monthlyMap[month] += amount
                    totalIncome += amount
                })

            // 计算最大值用于百分比
            const maxIncome = Math.max(...Object.values(monthlyMap), 1)
            const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']

            const monthlyData = monthNames.map((name, index) => ({
                month: name,
                income: (monthlyMap[index + 1] / 1000).toFixed(1),
                incomeRaw: monthlyMap[index + 1],
                percent: Math.round(monthlyMap[index + 1] / maxIncome * 100)
            }))

            const avgIncome = totalIncome / 12

            this.setData({
                monthlyData,
                stats: {
                    totalIncome: (totalIncome / 1000).toFixed(1),
                    avgIncome: (avgIncome / 1000).toFixed(1),
                    growth: '0' // 需要同比数据计算
                },
                loading: false
            })
        } catch (err) {
            console.error('加载收入失败', err)
            this.setData({ loading: false })
        }
    },

    setYear(e) {
        this.setData({ selectedYear: e.currentTarget.dataset.year })
        this.loadRevenue()
    },

    setViewMode(e) {
        this.setData({ viewMode: e.currentTarget.dataset.mode })
    }
})
