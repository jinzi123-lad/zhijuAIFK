// 租客-预约看房创建页（独立页面版本）
const app = getApp()
const { supabase } = require('../../../../utils/supabase')

Page({
  data: {
    property: null,
    propertyId: '',
    loading: true,
    appointmentDate: '',
    appointmentTime: '',
    appointmentTimeIndex: 0,
    appointmentNotes: '',
    timeOptions: ['09:00-12:00 上午', '14:00-18:00 下午', '19:00-21:00 晚上'],
    minDate: '',
    submitting: false
  },

  onLoad(options) {
    const today = new Date()
    this.setData({ minDate: today.toISOString().split('T')[0] })

    if (options.propertyId) {
      this.setData({ propertyId: options.propertyId })
      this.loadProperty(options.propertyId)
    } else {
      this.setData({ loading: false })
    }
  },

  async loadProperty(id) {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .exec()

      if (data && data.length > 0) {
        this.setData({ property: data[0], loading: false })
      } else {
        this.setData({ loading: false })
      }
    } catch (err) {
      console.error('加载房源失败', err)
      this.setData({ loading: false })
    }
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

  async submit() {
    const { property, propertyId, appointmentDate, appointmentTime, appointmentNotes } = this.data

    if (!appointmentDate) {
      wx.showToast({ title: '请选择日期', icon: 'none' })
      return
    }
    if (!appointmentTime) {
      wx.showToast({ title: '请选择时间', icon: 'none' })
      return
    }

    const tenantId = wx.getStorageSync('tenant_id') || wx.getStorageSync('user_id')
    const tenantName = wx.getStorageSync('user_name') || '租客'
    const tenantPhone = wx.getStorageSync('user_phone') || ''

    this.setData({ submitting: true })
    wx.showLoading({ title: '提交中...' })

    try {
      const { error } = await supabase
        .from('viewing_appointments')
        .insert([{
          property_id: propertyId || property?.id,
          landlord_id: property?.landlord_id,
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

      if (error) throw error

      wx.hideLoading()
      wx.showToast({ title: '预约成功', icon: 'success' })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    } catch (err) {
      console.error('预约失败', err)
      wx.hideLoading()
      wx.showToast({ title: '预约失败', icon: 'none' })
      this.setData({ submitting: false })
    }
  }
})