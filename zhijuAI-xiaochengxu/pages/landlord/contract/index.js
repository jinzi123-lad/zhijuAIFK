// 房东-合同列表页
const app = getApp()
const { supabase } = require('../../../utils/supabase')

Page({
    data: {
        searchQuery: '',
        selectedStatus: 'all',
        contracts: [],
        loading: true,
        stats: {
            total: 0,
            active: 0,
            expiring: 0,
            expired: 0
        }
    },

    onLoad() {
        this.loadContracts()
    },

    onShow() {
        this.loadContracts()
    },

    onPullDownRefresh() {
        this.loadContracts().then(() => {
            wx.stopPullDownRefresh()
        })
    },

    async loadContracts() {
        const landlordUuid = wx.getStorageSync('landlord_uuid') || '11111111-1111-1111-1111-111111111111'

        this.setData({ loading: true })
        try {
            const { data, error } = await supabase
                .from('contracts')
                .select('*')
                .eq('landlord_id', landlordUuid)
                .range(0, 99)
                .order('created_at', { ascending: false })
                .exec()

            if (error) {
                console.error('加载合同失败', error)
                this.setData({ loading: false })
                return
            }

            // 计算30天内到期的合同
            const now = new Date()
            const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

            const contracts = (data || []).map(c => {
                let statusLabel = '待签约'
                let statusBadgeClass = 'badge-pending'

                if (c.status === 'active' || c.status === 'signed') {
                    statusLabel = '生效中'
                    statusBadgeClass = 'badge-active'
                } else if (c.status === 'expired' || c.status === 'terminated') {
                    statusLabel = '已到期'
                    statusBadgeClass = 'badge-expired'
                } else if (c.status === 'pending_tenant') {
                    statusLabel = '待租客签约'
                    statusBadgeClass = 'badge-pending'
                }

                // 检查是否即将到期
                if (c.end_date) {
                    const endDate = new Date(c.end_date)
                    if (endDate <= thirtyDaysLater && endDate > now && (c.status === 'active' || c.status === 'signed')) {
                        statusLabel = '即将到期'
                        statusBadgeClass = 'badge-expiring'
                    }
                }

                return {
                    ...c,
                    statusLabel,
                    statusBadgeClass,
                    dateRange: `${c.start_date} - ${c.end_date}`
                }
            })

            // 计算统计
            const stats = {
                total: contracts.length,
                active: contracts.filter(c => c.status === 'active' || c.status === 'signed').length,
                expiring: contracts.filter(c => c.statusLabel === '即将到期').length,
                expired: contracts.filter(c => c.status === 'expired' || c.status === 'terminated').length
            }

            this.setData({ contracts, stats, loading: false })
            this.filterData()
        } catch (err) {
            console.error('加载合同失败', err)
            wx.showToast({ title: '加载失败', icon: 'none' })
            this.setData({ loading: false })
        }
    },

    setStatus(e) {
        this.setData({ selectedStatus: e.currentTarget.dataset.status })
        this.filterData()
    },

    onSearch(e) {
        this.setData({ searchQuery: e.detail.value })
        this.filterData()
    },

    filterData() {
        const { contracts, selectedStatus, searchQuery } = this.data
        let filtered = contracts

        // 状态筛选
        if (selectedStatus !== 'all') {
            if (selectedStatus === 'active') {
                filtered = filtered.filter(c => c.status === 'active' || c.status === 'signed')
            } else if (selectedStatus === 'expiring') {
                filtered = filtered.filter(c => c.statusLabel === '即将到期')
            } else if (selectedStatus === 'expired') {
                filtered = filtered.filter(c => c.status === 'expired' || c.status === 'terminated')
            }
        }

        // 搜索筛选
        if (searchQuery) {
            filtered = filtered.filter(c =>
                (c.property_address || '').includes(searchQuery) ||
                (c.tenant_name || '').includes(searchQuery)
            )
        }

        this.setData({ filteredContracts: filtered })
    },

    goToDetail(e) {
        const id = e.currentTarget.dataset.id
        wx.navigateTo({ url: `/pages/landlord/contract/detail/index?id=${id}` })
    },

    onAddContract() {
        wx.navigateTo({ url: '/pages/landlord/contract/create/index' })
    },

    goToTemplate() {
        wx.navigateTo({ url: '/pages/landlord/contract/template/index' })
    }
})
