// 房东-预约管理列表页
const app = getApp()
const { supabase } = require('../../../../utils/supabase')

Page({
    data: {
        appointments: [],
        loading: true,
        currentTab: 'pending', // all/pending/confirmed/completed/cancelled
        tabs: [
            { key: 'pending', label: '待处理' },
            { key: 'confirmed', label: '已确认' },
            { key: 'completed', label: '已完成' },
            { key: 'all', label: '全部' }
        ]
    },

    onLoad() {
        this.loadAppointments()
    },

    onShow() {
        this.loadAppointments()
    },

    onPullDownRefresh() {
        this.loadAppointments().then(() => {
            wx.stopPullDownRefresh()
        })
    },

    async loadAppointments() {
        // 使用UUID查询
        const landlordUuid = wx.getStorageSync('landlord_uuid') || '11111111-1111-1111-1111-111111111111'

        this.setData({ loading: true })
        try {
            // 构建查询
            let query = supabase
                .from('viewing_appointments')
                .select('*')
                .eq('landlord_id', landlordUuid)
                .range(0, 99)  // 返回最多100条
                .order('created_at', { ascending: false })

            // 状态筛选
            const { currentTab } = this.data
            if (currentTab !== 'all') {
                query = query.eq('status', currentTab)
            }

            const { data, error } = await query.exec()

            if (error) {
                console.error('加载预约失败', error)
                this.setData({ loading: false })
                return
            }

            // 处理状态文本
            const statusMap = {
                'pending': '待处理',
                'confirmed': '已确认',
                'rescheduled': '改期待确认',
                'cancelled': '已取消',
                'completed': '已完成'
            }

            const appointments = (data || []).map(item => ({
                ...item,
                statusText: statusMap[item.status] || item.status,
                statusClass: `status-${item.status}`,
                canConfirm: item.status === 'pending',
                canReschedule: item.status === 'pending' || item.status === 'confirmed',
                canComplete: item.status === 'confirmed'
            }))

            this.setData({ appointments, loading: false })
        } catch (err) {
            console.error('加载预约失败', err)
            wx.showToast({ title: '加载失败', icon: 'none' })
            this.setData({ loading: false })
        }
    },

    switchTab(e) {
        const tab = e.currentTarget.dataset.tab
        this.setData({ currentTab: tab })
        this.loadAppointments()
    },

    goToDetail(e) {
        const id = e.currentTarget.dataset.id
        wx.navigateTo({ url: `/pages/landlord/viewing/detail/index?id=${id}` })
    },

    // 快速确认
    async confirmAppointment(e) {
        const id = e.currentTarget.dataset.id
        wx.showModal({
            title: '确认预约',
            content: '确定接受此预约？',
            success: async (res) => {
                if (res.confirm) {
                    wx.showLoading({ title: '处理中...' })
                    try {
                        const { error } = await supabase
                            .from('viewing_appointments')
                            .update({ status: 'confirmed' })
                            .eq('id', id)
                            .exec()

                        if (error) throw error

                        wx.hideLoading()
                        wx.showToast({ title: '已确认', icon: 'success' })
                        this.loadAppointments()
                    } catch (err) {
                        console.error('确认失败', err)
                        wx.hideLoading()
                        wx.showToast({ title: '操作失败', icon: 'none' })
                    }
                }
            }
        })
    },

    // 快速完成
    async completeAppointment(e) {
        const id = e.currentTarget.dataset.id
        wx.showModal({
            title: '完成看房',
            content: '确认看房已完成？',
            success: async (res) => {
                if (res.confirm) {
                    wx.showLoading({ title: '处理中...' })
                    try {
                        const { error } = await supabase
                            .from('viewing_appointments')
                            .update({ status: 'completed' })
                            .eq('id', id)
                            .exec()

                        if (error) throw error

                        wx.hideLoading()
                        wx.showToast({ title: '已完成', icon: 'success' })
                        this.loadAppointments()
                    } catch (err) {
                        console.error('操作失败', err)
                        wx.hideLoading()
                        wx.showToast({ title: '操作失败', icon: 'none' })
                    }
                }
            }
        })
    }
})
