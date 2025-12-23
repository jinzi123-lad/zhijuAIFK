// 房东-预约详情页（确认/改期/取消）
const app = getApp()
const { supabase } = require('../../../../utils/supabase')

Page({
    data: {
        appointment: null,
        loading: true,
        showRescheduleModal: false,
        showCancelModal: false,
        rescheduleDate: '',
        rescheduleTime: '',
        rescheduleTimeIndex: 0,
        rescheduleReason: '',
        cancelReason: '',
        timeOptions: ['09:00-12:00 上午', '14:00-18:00 下午', '19:00-21:00 晚上'],
        cancelReasons: ['时间冲突', '房源已出租', '租客反馈不合适', '其他原因'],
        minDate: '',
        appointmentId: ''
    },

    onLoad(options) {
        // 设置最小日期为今天
        const today = new Date()
        const minDate = today.toISOString().split('T')[0]
        this.setData({ minDate })

        if (options.id) {
            this.setData({ appointmentId: options.id })
            this.loadAppointment(options.id)
        } else {
            wx.showToast({ title: '参数错误', icon: 'none' })
            setTimeout(() => wx.navigateBack(), 1500)
        }
    },

    async loadAppointment(id) {
        this.setData({ loading: true })
        try {
            // 从Supabase加载预约详情
            const { data, error } = await supabase
                .from('viewing_appointments')
                .select('*')
                .eq('id', id)
                .exec()

            if (error || !data || data.length === 0) {
                wx.showToast({ title: '预约不存在', icon: 'none' })
                setTimeout(() => wx.navigateBack(), 1500)
                return
            }

            const appointment = data[0]
            // 处理状态文本
            const statusMap = {
                'pending': '待处理',
                'confirmed': '已确认',
                'rescheduled': '改期待确认',
                'cancelled': '已取消',
                'completed': '已完成'
            }
            appointment.statusText = statusMap[appointment.status] || appointment.status
            appointment.canConfirm = appointment.status === 'pending'
            appointment.canReschedule = appointment.status === 'pending' || appointment.status === 'confirmed'
            appointment.canCancel = appointment.status === 'pending' || appointment.status === 'confirmed'
            appointment.canComplete = appointment.status === 'confirmed'

            this.setData({ appointment, loading: false })
        } catch (err) {
            console.error('加载失败', err)
            wx.showToast({ title: '加载失败', icon: 'none' })
            this.setData({ loading: false })
        }
    },

    // 确认预约
    async confirmAppointment() {
        const { appointment } = this.data
        wx.showModal({
            title: '确认预约',
            content: `确认于 ${appointment.appointment_date} ${appointment.appointment_time} 带看？`,
            success: async (res) => {
                if (res.confirm) {
                    wx.showLoading({ title: '处理中...' })
                    try {
                        const { error } = await supabase
                            .from('viewing_appointments')
                            .update({ status: 'confirmed' })
                            .eq('id', appointment.id)
                            .exec()

                        if (error) throw error

                        wx.hideLoading()
                        wx.showToast({ title: '已确认', icon: 'success' })
                        setTimeout(() => wx.navigateBack(), 1500)
                    } catch (err) {
                        console.error('确认失败', err)
                        wx.hideLoading()
                        wx.showToast({ title: '操作失败', icon: 'none' })
                    }
                }
            }
        })
    },

    // 标记完成
    async completeAppointment() {
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
                            .eq('id', this.data.appointment.id)
                            .exec()

                        if (error) throw error

                        wx.hideLoading()
                        wx.showToast({ title: '已完成', icon: 'success' })
                        setTimeout(() => wx.navigateBack(), 1500)
                    } catch (err) {
                        console.error('操作失败', err)
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
        this.setData({
            showRescheduleModal: false,
            rescheduleDate: '',
            rescheduleTime: '',
            rescheduleReason: ''
        })
    },

    onRescheduleDateChange(e) {
        this.setData({ rescheduleDate: e.detail.value })
    },

    onRescheduleTimeChange(e) {
        const index = e.detail.value
        this.setData({
            rescheduleTimeIndex: index,
            rescheduleTime: this.data.timeOptions[index]
        })
    },

    onRescheduleReasonInput(e) {
        this.setData({ rescheduleReason: e.detail.value })
    },

    async submitReschedule() {
        const { rescheduleDate, rescheduleTime, rescheduleReason, appointment } = this.data
        if (!rescheduleDate || !rescheduleTime) {
            wx.showToast({ title: '请选择新时间', icon: 'none' })
            return
        }

        wx.showLoading({ title: '提交中...' })
        try {
            const { error } = await supabase
                .from('viewing_appointments')
                .update({
                    status: 'rescheduled',
                    reschedule_date: rescheduleDate,
                    reschedule_time: rescheduleTime,
                    reschedule_reason: rescheduleReason
                })
                .eq('id', appointment.id)
                .exec()

            if (error) throw error

            wx.hideLoading()
            wx.showToast({ title: '已发送改期请求', icon: 'success' })
            this.closeReschedule()
            setTimeout(() => wx.navigateBack(), 1500)
        } catch (err) {
            console.error('提交失败', err)
            wx.hideLoading()
            wx.showToast({ title: '操作失败', icon: 'none' })
        }
    },

    // 取消弹窗
    openCancel() {
        this.setData({ showCancelModal: true })
    },

    closeCancel() {
        this.setData({ showCancelModal: false, cancelReason: '' })
    },

    selectCancelReason(e) {
        const reason = e.currentTarget.dataset.reason
        this.setData({ cancelReason: reason })
    },

    async submitCancel() {
        const { cancelReason, appointment } = this.data
        if (!cancelReason) {
            wx.showToast({ title: '请选择取消原因', icon: 'none' })
            return
        }

        wx.showLoading({ title: '提交中...' })
        try {
            const { error } = await supabase
                .from('viewing_appointments')
                .update({
                    status: 'cancelled',
                    cancel_reason: cancelReason
                })
                .eq('id', appointment.id)
                .exec()

            if (error) throw error

            wx.hideLoading()
            wx.showToast({ title: '已取消', icon: 'success' })
            this.closeCancel()
            setTimeout(() => wx.navigateBack(), 1500)
        } catch (err) {
            console.error('取消失败', err)
            wx.hideLoading()
            wx.showToast({ title: '操作失败', icon: 'none' })
        }
    },

    // 拨打电话
    callTenant() {
        const phone = this.data.appointment.guest_phone
        if (phone) {
            wx.makePhoneCall({ phoneNumber: phone })
        } else {
            wx.showToast({ title: '暂无联系方式', icon: 'none' })
        }
    },

    // 阻止冒泡
    stopPropagation() {
        // 空方法，仅用于阻止事件冒泡
    }
})
