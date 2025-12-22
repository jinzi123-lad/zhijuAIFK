// 租客-房源列表页（带筛选）
const app = getApp()
const { supabase } = require('../../../../utils/supabase')

Page({
    data: {
        properties: [],
        loading: true,
        searchKeyword: '',
        currentDistrict: '全部',
        currentPrice: '全部',
        currentLayout: '全部',
        districts: ['全部', '朝阳区', '海淀区', '丰台区', '东城区', '西城区'],
        priceRanges: ['全部', '2000以下', '2000-3000', '3000-5000', '5000以上'],
        layouts: ['全部', '1室', '2室', '3室', '4室及以上'],
        page: 1,
        pageSize: 20,
        hasMore: true
    },

    onLoad() {
        this.loadProperties()
    },

    onPullDownRefresh() {
        this.setData({ page: 1, hasMore: true })
        this.loadProperties().then(() => {
            wx.stopPullDownRefresh()
        })
    },

    onReachBottom() {
        if (this.data.hasMore && !this.data.loading) {
            this.loadMore()
        }
    },

    async loadProperties() {
        this.setData({ loading: true })
        try {
            // 从Supabase加载房源
            let query = supabase
                .from('properties')
                .select('*')
                .eq('status', 'available')
                .order('created_at', { ascending: false })
                .limit(this.data.pageSize)

            const { data, error } = await query.exec()

            if (error) {
                console.error('加载房源失败', error)
                this.setData({ loading: false })
                return
            }

            // 应用本地筛选
            let filtered = this.applyFilters(data || [])

            this.setData({
                properties: filtered,
                loading: false,
                hasMore: (data || []).length >= this.data.pageSize
            })
        } catch (err) {
            console.error('加载房源失败', err)
            wx.showToast({ title: '加载失败', icon: 'none' })
            this.setData({ loading: false })
        }
    },

    async loadMore() {
        const nextPage = this.data.page + 1
        this.setData({ page: nextPage, loading: true })

        try {
            const offset = (nextPage - 1) * this.data.pageSize
            const { data, error } = await supabase
                .from('properties')
                .select('*')
                .eq('status', 'available')
                .order('created_at', { ascending: false })
                .range(offset, offset + this.data.pageSize - 1)
                .exec()

            if (error) throw error

            let filtered = this.applyFilters(data || [])
            this.setData({
                properties: [...this.data.properties, ...filtered],
                loading: false,
                hasMore: (data || []).length >= this.data.pageSize
            })
        } catch (err) {
            console.error('加载更多失败', err)
            this.setData({ loading: false })
        }
    },

    // 应用筛选条件
    applyFilters(data) {
        const { currentDistrict, currentPrice, currentLayout, searchKeyword } = this.data
        return data.filter(item => {
            // 区域筛选
            if (currentDistrict !== '全部' && item.district !== currentDistrict) return false

            // 价格筛选
            const price = item.rent_amount || item.price || 0
            if (currentPrice === '2000以下' && price >= 2000) return false
            if (currentPrice === '2000-3000' && (price < 2000 || price > 3000)) return false
            if (currentPrice === '3000-5000' && (price < 3000 || price > 5000)) return false
            if (currentPrice === '5000以上' && price < 5000) return false

            // 户型筛选
            const layout = item.layout || ''
            if (currentLayout === '1室' && !layout.includes('1')) return false
            if (currentLayout === '2室' && !layout.includes('2')) return false
            if (currentLayout === '3室' && !layout.includes('3')) return false
            if (currentLayout === '4室及以上' && !layout.match(/[4-9]/)) return false

            // 关键词搜索
            if (searchKeyword && !item.title.includes(searchKeyword) &&
                !(item.address || '').includes(searchKeyword)) return false

            return true
        })
    },

    // 搜索输入
    onSearchInput(e) {
        this.setData({ searchKeyword: e.detail.value })
    },

    // 搜索确认
    onSearch() {
        this.setData({ page: 1 })
        this.loadProperties()
    },

    // 筛选变化
    onDistrictChange(e) {
        this.setData({ currentDistrict: this.data.districts[e.detail.value], page: 1 })
        this.loadProperties()
    },

    onPriceChange(e) {
        this.setData({ currentPrice: this.data.priceRanges[e.detail.value], page: 1 })
        this.loadProperties()
    },

    onLayoutChange(e) {
        this.setData({ currentLayout: this.data.layouts[e.detail.value], page: 1 })
        this.loadProperties()
    },

    goToDetail(e) {
        const id = e.currentTarget.dataset.id
        wx.navigateTo({ url: `/pages/tenant/property/detail/index?id=${id}` })
    }
})
