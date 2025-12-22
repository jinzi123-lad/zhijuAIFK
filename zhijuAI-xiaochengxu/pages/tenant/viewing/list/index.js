// 租客-我的预约列表页
const app = getApp()
const { supabase } = require('../../../../utils/supabase')

Page({
    data: {
        appointments: [],
        loading: true,
        currentTab: 'all' // all/pending/confirmed/completed
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
        const tenantId = wx.getStorageSync('tenant_id') || wx.getStorageSync('user_id')
        if (!tenantId) {
            this.setData({ loading: false, appointments: [] })
            return
        }

        this.setData({ loading: true })
        try {
            // 从Supabase加载我的预约
            const { data, error } = await supabase
                .from('viewing_appointments')
                .select('*')
                .eq('tenant_id', tenantId)
                .order('created_at', { ascending: false })
                .exec()

            if (error) {
                console.error('加载预约失败', error)
                this.setData({ loading: false })
                return
            }

            // 处理状态文本
            const statusMap = {
                'pending': '待确认',
                'confirmed': '已确认',
                'rescheduled': '房东改期',
                'cancelled': '已取消',
                'completed': '已完成'
            }

            const appointments = (data || []).map(item => ({
                ...item,
                statusText: statusMap[item.status] || item.status,
                showReschedule: item.status === 'rescheduled',
                canCancel: item.status === 'pending' || item.status === 'confirmed'
            }))

            this.setData({ appointments, loading: false })
        } catch (err) {
            console.error('加载预约失败', err)
            wx.showToast({ title: '加载失败', icon: 'none' })
            this.setData({ loading: false })
        }
    },

    // 切换Tab
    switchTab(e) {
        const tab = e.currentTarget.dataset.tab
        this.setData({ currentTab: tab })
    },

    // 筛选后的列表
    getFilteredList() {
        const { appointments, currentTab } = this.data
        if (currentTab === 'all') return appointments
        return appointments.filter(a => a.status === currentTab)
    },

    // 查看房源详情
    goToProperty(e) {
        const id = e.currentTarget.dataset.propertyId
        if (id) {
            wx.navigateTo({ url: `/pages/tenant/property/detail/index?id=${id}` })
        }
    },

    // 取消预约
    cancelAppointment(e) {
        const id = e.currentTarget.dataset.id
        wx.showModal({
            title: '取消预约',
            content: '确定要取消此预约吗？',
            success: async (res) => {
                if (res.confirm) {
                    wx.showLoading({ title: '取消中...' })
                    try {
                        const { error } = await supabase
                            .from('viewing_appointments')
                            .update({ status: 'cancelled' })
                            .eq('id', id)
                            .exec()

                        if (error) throw error

                        wx.hideLoading()
                        wx.showToast({ title: '已取消', icon: 'success' })
                        this.loadAppointments()
                    } catch (err) {
                        console.error('取消失败', err)
                        wx.hideLoading()
                        wx.showToast({ title: '操作失败', icon: 'none' })
                    }
                }
            }
        })
    },

    // 同意改期
    agreeReschedule(e) {
        const id = e.currentTarget.dataset.id
        const item = this.data.appointments.find(a => a.id === id)

        wx.showModal({
            title: '同意改期',
            content: `确定同意改为 ${item.reschedule_date} ${item.reschedule_time}？`,
            success: async (res) => {
                if (res.confirm) {
                    wx.showLoading({ title: '处理中...' })
                    try {
                        // 更新预约时间为改期时间
                        const { error } = await supabase
                            .from('viewing_appointments')
                            .update({
                                status: 'confirmed',
                                appointment_date: item.reschedule_date,
                                appointment_time: item.reschedule_time,
                                reschedule_date: null,
                                reschedule_time: null
                            })
                            .eq('id', id)
                            .exec()

                        if (error) throw error

                        wx.hideLoading()
                        wx.showToast({ title: '已同意', icon: 'success' })
                        this.loadAppointments()
                    } catch (err) {
                        console.error('操作失败', err)
                        wx.hideLoading()
                        wx.showToast({ title: '操作失败', icon: 'none' })
                    }
                }
            }
        })
    },

    // 拒绝改期
    rejectReschedule(e) {
        const id = e.currentTarget.dataset.id
        wx.showModal({
            title: '拒绝改期',
            content: '拒绝后预约将被取消，确定吗？',
            success: async (res) => {
                if (res.confirm) {
                    wx.showLoading({ title: '处理中...' })
                    try {
                        const { error } = await supabase
                            .from('viewing_appointments')
                            .update({ status: 'cancelled' })
                            .eq('id', id)
                            .exec()

                        if (error) throw error

                        wx.hideLoading()
                        wx.showToast({ title: '已拒绝', icon: 'success' })
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
