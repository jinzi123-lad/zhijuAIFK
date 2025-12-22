// 租客-房源详情页
const app = getApp()
const { supabase } = require('../../../../utils/supabase')
const { ViewingService } = require('../../../../services/viewingService')

Page({
    data: {
        property: null,
        loading: true,
        showAppointmentModal: false,
        appointmentDate: '',
        appointmentTime: '',
        appointmentTimeIndex: 0,
        appointmentNotes: '',
        timeOptions: ['09:00-12:00 上午', '14:00-18:00 下午', '19:00-21:00 晚上'],
        minDate: ''
    },

    onLoad(options) {
        // 设置最小日期为今天
        const today = new Date()
        const minDate = today.toISOString().split('T')[0]
        this.setData({ minDate })

        if (options.id) {
            this.loadProperty(options.id)
        } else {
            wx.showToast({ title: '参数错误', icon: 'none' })
            setTimeout(() => wx.navigateBack(), 1500)
        }
    },

    async loadProperty(id) {
        this.setData({ loading: true })
        try {
            // 从Supabase加载房源详情
            const { data, error } = await supabase
                .from('properties')
                .select('*')
                .eq('id', id)
                .exec()

            if (error || !data || data.length === 0) {
                wx.showToast({ title: '房源不存在', icon: 'none' })
                setTimeout(() => wx.navigateBack(), 1500)
                return
            }

            const property = data[0]
            // 处理设施数据
            if (typeof property.facilities === 'string') {
                try {
                    property.facilities = JSON.parse(property.facilities)
                } catch (e) {
                    property.facilities = []
                }
            }

            this.setData({ property, loading: false })
        } catch (err) {
            console.error('加载失败', err)
            wx.showToast({ title: '加载失败', icon: 'none' })
            this.setData({ loading: false })
        }
    },

    // 打开预约弹窗
    openAppointment() {
        // 检查是否登录
        const tenantId = wx.getStorageSync('tenant_id') || wx.getStorageSync('user_id')
        if (!tenantId) {
            wx.showModal({
                title: '提示',
                content: '请先登录后再预约',
                confirmText: '去登录',
                success: (res) => {
                    if (res.confirm) {
                        wx.navigateTo({ url: '/pages/login/index' })
                    }
                }
            })
            return
        }
        this.setData({ showAppointmentModal: true })
    },

    closeAppointment() {
        this.setData({
            showAppointmentModal: false,
            appointmentDate: '',
            appointmentTime: '',
            appointmentTimeIndex: 0,
            appointmentNotes: ''
        })
    },

    onDateChange(e) {
        this.setData({ appointmentDate: e.detail.value })
    },

    onTimeChange(e) {
        const index = e.detail.value
        this.setData({
            appointmentTimeIndex: index,
            appointmentTime: this.data.timeOptions[index]
        })
    },

    onNotesInput(e) {
        this.setData({ appointmentNotes: e.detail.value })
    },

    // 提交预约
    async submitAppointment() {
        const { property, appointmentDate, appointmentTime, appointmentNotes } = this.data

        // 验证
        if (!appointmentDate) {
            wx.showToast({ title: '请选择日期', icon: 'none' })
            return
        }
        if (!appointmentTime) {
            wx.showToast({ title: '请选择时间段', icon: 'none' })
            return
        }

        const tenantId = wx.getStorageSync('tenant_id') || wx.getStorageSync('user_id')
        const tenantName = wx.getStorageSync('user_name') || '租客'
        const tenantPhone = wx.getStorageSync('user_phone') || ''

        wx.showLoading({ title: '提交中...' })
        try {
            // 提交到Supabase
            const { data, error } = await supabase
                .from('viewing_appointments')
                .insert([{
                    property_id: property.id,
                    landlord_id: property.landlord_id,
                    tenant_id: tenantId,
                    guest_name: tenantName,
                    guest_phone: tenantPhone,
                    appointment_date: appointmentDate,
                    appointment_time: appointmentTime,
                    notes: appointmentNotes,
                    source: 'miniapp',
                    status: 'pending'
                }])
                .exec()

            if (error) {
                throw error
            }

            wx.hideLoading()
            wx.showToast({ title: '预约成功', icon: 'success' })
            this.closeAppointment()

            // 提示跳转到我的预约
            setTimeout(() => {
                wx.showModal({
                    title: '预约已提交',
                    content: '房东确认后会通知您，是否查看我的预约？',
                    confirmText: '查看',
                    cancelText: '留在这里',
                    success: (res) => {
                        if (res.confirm) {
                            wx.navigateTo({ url: '/pages/tenant/viewing/list/index' })
                        }
                    }
                })
            }, 1000)
        } catch (err) {
            console.error('预约失败', err)
            wx.hideLoading()
            wx.showToast({ title: '预约失败，请重试', icon: 'none' })
        }
    },

    // 预览图片
    previewImage(e) {
        const current = e.currentTarget.dataset.url
        const urls = this.data.property.images || []
        if (urls.length > 0) {
            wx.previewImage({ current, urls })
        }
    },

    // 拨打电话
    callLandlord() {
        const phone = this.data.property.landlord_phone
        if (phone) {
            wx.makePhoneCall({ phoneNumber: phone })
        } else {
            wx.showToast({ title: '暂无联系方式', icon: 'none' })
        }
    }
})
