// 房东-维修工单列表页
const app = getApp()
const { supabase } = require('../../../utils/supabase')

Page({
    data: {
        selectedStatus: 'all',
        selectedPriority: 'all',
        priorities: [
            { key: 'all', label: '全部' },
            { key: 'urgent', label: '紧急' },
            { key: 'high', label: '高' },
            { key: 'medium', label: '中' },
            { key: 'low', label: '低' }
        ],
        repairs: [],
        filteredRequests: [],
        loading: true,
        stats: {
            total: 0,
            pending: 0,
            in_progress: 0,
            completed: 0
        }
    },

    onLoad() {
        this.loadRepairs()
    },

    onShow() {
        this.loadRepairs()
    },

    onPullDownRefresh() {
        this.loadRepairs().then(() => {
            wx.stopPullDownRefresh()
        })
    },

    async loadRepairs() {
        // 使用UUID查询
        const landlordUuid = wx.getStorageSync('landlord_uuid') || '11111111-1111-1111-1111-111111111111'

        this.setData({ loading: true })
        try {
            const { data, error } = await supabase
                .from('repair_orders')
                .select('*')
                .eq('landlord_id', landlordUuid)
                .range(0, 99)
                .order('created_at', { ascending: false })
                .exec()

            if (error) {
                console.error('加载工单失败', error)
                this.setData({ loading: false })
                return
            }

            const categoryMap = {
                'plumbing': '水管',
                'electrical': '电路',
                'appliance': '电器',
                'structure': '结构',
                'other': '其他'
            }
            const statusMap = {
                'pending': '待处理',
                'assigned': '已派单',
                'in_progress': '处理中',
                'completed': '已完成',
                'confirmed': '已确认'
            }

            const repairs = (data || []).map(r => {
                let priorityClass = 'bg-muted'
                let iconColor = '#64748b'
                const priority = r.priority || 'medium'
                if (priority === 'urgent') { priorityClass = 'bg-destructive-10'; iconColor = '#ef4444' }
                if (priority === 'high') { priorityClass = 'bg-warning-10'; iconColor = '#f59e0b' }
                if (priority === 'medium') { priorityClass = 'bg-primary-10'; iconColor = '#2563eb' }

                let statusClass = 'bg-muted'
                if (r.status === 'completed' || r.status === 'confirmed') statusClass = 'bg-success-10'
                if (r.status === 'in_progress' || r.status === 'assigned') statusClass = 'bg-primary-10'
                if (r.status === 'pending') statusClass = 'bg-warning-10'

                return {
                    ...r,
                    categoryLabel: categoryMap[r.category] || r.category,
                    statusLabel: statusMap[r.status] || r.status,
                    priorityLabel: priority === 'urgent' ? '紧急' : priority === 'high' ? '高' : priority === 'medium' ? '中' : '低',
                    priorityClass,
                    iconColor,
                    statusClass,
                    priority
                }
            })

            // 统计
            const stats = {
                total: repairs.length,
                pending: repairs.filter(r => r.status === 'pending').length,
                in_progress: repairs.filter(r => r.status === 'in_progress' || r.status === 'assigned').length,
                completed: repairs.filter(r => r.status === 'completed' || r.status === 'confirmed').length
            }

            this.setData({ repairs, stats, loading: false })
            this.filterData()
        } catch (err) {
            console.error('加载工单失败', err)
            wx.showToast({ title: '加载失败', icon: 'none' })
            this.setData({ loading: false })
        }
    },

    filterData() {
        const { repairs, selectedStatus, selectedPriority } = this.data
        let filtered = repairs

        if (selectedStatus !== 'all') {
            if (selectedStatus === 'in_progress') {
                filtered = filtered.filter(r => r.status === 'in_progress' || r.status === 'assigned')
            } else if (selectedStatus === 'completed') {
                filtered = filtered.filter(r => r.status === 'completed' || r.status === 'confirmed')
            } else {
                filtered = filtered.filter(r => r.status === selectedStatus)
            }
        }

        if (selectedPriority !== 'all') {
            filtered = filtered.filter(r => r.priority === selectedPriority)
        }

        this.setData({ filteredRequests: filtered })
    },

    setStatus(e) {
        this.setData({ selectedStatus: e.currentTarget.dataset.status })
        this.filterData()
    },

    setPriority(e) {
        this.setData({ selectedPriority: e.currentTarget.dataset.priority })
        this.filterData()
    },

    goToDetail(e) {
        const id = e.currentTarget.dataset.id
        wx.navigateTo({ url: `/pages/landlord/maintenance/detail/index?id=${id}` })
    },

    onAddRequest() {
        wx.showToast({ title: '房东端暂不支持新建工单', icon: 'none' })
    },

    // 别名方法
    navToDetail(e) {
        this.goToDetail(e)
    }
})
