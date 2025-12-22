// 房东-预约详情页（确认/改期/取消）
const app = getApp()

Page({
    data: {
        appointment: null,
        loading: true,
        showRescheduleModal: false,
        showCancelModal: false,
        rescheduleDate: '',
        rescheduleTime: '',
        rescheduleReason: '',
        cancelReason: ''
    },

    onLoad(options) {
        if (options.id) {
            this.loadAppointment(options.id)
        }
    },

    async loadAppointment(id) {
        this.setData({ loading: true })
        try {
            // TODO: 从Supabase加载预约详情
            const mockData = {
                id: id,
                propertyTitle: '阳光花园302室',
                propertyAddress: '朝阳区阳光花园3号楼302室',
                tenantName: '李小姐',
                tenantPhone: '13812341234',
                tenantAvatar: '',
                date: '2024-12-25',
                time: '下午',
                notes: '希望能看厨房',
                status: 'pending',
                createdAt: '2024-12-22 14:30'
            }
            this.setData({ appointment: mockData, loading: false })
        } catch (err) {
            console.error('加载失败', err)
            this.setData({ loading: false })
        }
    },

    // 确认预约
    async confirmAppointment() {
        wx.showModal({
            title: '确认预约',
            content: `确认于 ${this.data.appointment.date} ${this.data.appointment.time} 带看？`,
            success: async (res) => {
                if (res.confirm) {
                    wx.showLoading({ title: '处理中...' })
                    try {
                        // TODO: 更新Supabase预约状态为confirmed
                        // TODO: 发送通知给租客
                        wx.hideLoading()
                        wx.showToast({ title: '已确认', icon: 'success' })
                        setTimeout(() => wx.navigateBack(), 1500)
                    } catch (err) {
                        wx.hideLoading()
                        wx.showToast({ title: '操作失败', icon: 'none' })
                    }
                }
            }
        })
    },

    // 改期弹窗
    openReschedule() {
        this.setData({ showRescheduleModal: true })
    },

    closeReschedule() {
        this.setData({ showRescheduleModal: false })
    },

    onRescheduleDateChange(e) {
        this.setData({ rescheduleDate: e.detail.value })
    },

    onRescheduleTimeChange(e) {
        const times = ['上午', '下午', '晚上']
        this.setData({ rescheduleTime: times[e.detail.value] })
    },

    onRescheduleReasonInput(e) {
        this.setData({ rescheduleReason: e.detail.value })
    },

    async submitReschedule() {
        const { rescheduleDate, rescheduleTime, rescheduleReason } = this.data
        if (!rescheduleDate || !rescheduleTime) {
            wx.showToast({ title: '请选择新时间', icon: 'none' })
            return
        }

        wx.showLoading({ title: '提交中...' })
        try {
            // TODO: 更新Supabase预约，状态改为rescheduled
            // TODO: 发送通知给租客，询问是否同意新时间
            wx.hideLoading()
            wx.showToast({ title: '已发送改期请求', icon: 'success' })
            this.setData({ showRescheduleModal: false })
            setTimeout(() => wx.navigateBack(), 1500)
        } catch (err) {
            wx.hideLoading()
            wx.showToast({ title: '操作失败', icon: 'none' })
        }
    },

    // 取消弹窗
    openCancel() {
        this.setData({ showCancelModal: true })
    },

    closeCancel() {
        this.setData({ showCancelModal: false })
    },

    selectCancelReason(e) {
        const reason = e.currentTarget.dataset.reason
        this.setData({ cancelReason: reason })
    },

    async submitCancel() {
        const { cancelReason } = this.data
        if (!cancelReason) {
            wx.showToast({ title: '请选择取消原因', icon: 'none' })
            return
        }

        wx.showLoading({ title: '提交中...' })
        try {
            // TODO: 更新Supabase预约状态为cancelled
            // TODO: 发送通知给租客
            wx.hideLoading()
            wx.showToast({ title: '已取消', icon: 'success' })
            this.setData({ showCancelModal: false })
            setTimeout(() => wx.navigateBack(), 1500)
        } catch (err) {
            wx.hideLoading()
            wx.showToast({ title: '操作失败', icon: 'none' })
        }
    },

    // 拨打电话
    callTenant() {
        wx.makePhoneCall({
            phoneNumber: this.data.appointment.tenantPhone
        })
    }
})
