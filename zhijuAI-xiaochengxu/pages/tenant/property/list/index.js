// 租客-房源列表页
const app = getApp()

Page({
    data: {
        properties: [],
        loading: true,
        filters: {
            district: '全部',
            priceRange: '全部',
            layout: '全部'
        }
    },

    onLoad() {
        this.loadProperties()
    },

    async loadProperties() {
        this.setData({ loading: true })
        try {
            // TODO: 从Supabase加载房源
            const mockData = [
                { id: '1', title: '阳光花园精装两居室', price: 3500, layout: '2室1厅', area: 85, location: '朝阳区' },
                { id: '2', title: '翠湖雅苑温馨一居', price: 2800, layout: '1室1厅', area: 60, location: '海淀区' }
            ]
            this.setData({ properties: mockData, loading: false })
        } catch (err) {
            console.error('加载房源失败', err)
            this.setData({ loading: false })
        }
    },

    goToDetail(e) {
        const id = e.currentTarget.dataset.id
        wx.navigateTo({ url: `/pages/tenant/property/detail/index?id=${id}` })
    }
})
