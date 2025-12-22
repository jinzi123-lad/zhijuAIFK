// 房东-催租提醒设置页面
const app = getApp()
const { supabase } = require('../../../../utils/supabase')

Page({
  data: {
    enabled: true,
    reminderDays: 3, // 提前几天提醒
    reminderTime: '09:00',
    autoRemind: true, // 自动发送
    reminderMethod: 'sms', // sms/wechat/both
    loading: true,
    saving: false
  },

  onLoad() {
    this.loadSettings()
  },

  async loadSettings() {
    const landlordId = wx.getStorageSync('landlord_id')
    if (!landlordId) {
      this.setData({ loading: false })
      return
    }

    try {
      const { data } = await supabase
        .from('landlord_settings')
        .select('*')
        .eq('landlord_id', landlordId)
        .exec()

      if (data && data.length > 0) {
        const settings = data[0]
        this.setData({
          enabled: settings.rent_reminder_enabled !== false,
          reminderDays: settings.rent_reminder_days || 3,
          reminderTime: settings.rent_reminder_time || '09:00',
          autoRemind: settings.auto_remind !== false,
          reminderMethod: settings.reminder_method || 'sms'
        })
      }
      this.setData({ loading: false })
    } catch (err) {
      console.error('加载设置失败', err)
      this.setData({ loading: false })
    }
  },

  // 开关
  toggleEnabled() {
    this.setData({ enabled: !this.data.enabled })
  },

  toggleAutoRemind() {
    this.setData({ autoRemind: !this.data.autoRemind })
  },

  // 选择提前天数
  onDaysChange(e) {
    const days = parseInt(e.detail.value) + 1 // picker从0开始
    this.setData({ reminderDays: days })
  },

  // 选择时间
  onTimeChange(e) {
    this.setData({ reminderTime: e.detail.value })
  },

  // 选择方式
  selectMethod(e) {
    this.setData({ reminderMethod: e.currentTarget.dataset.method })
  },

  // 保存
  async saveSettings() {
    const landlordId = wx.getStorageSync('landlord_id')
    if (!landlordId) {
      wx.showToast({ title: '请先登录', icon: 'none' })
      return
    }

    this.setData({ saving: true })
    wx.showLoading({ title: '保存中...' })

    try {
      const payload = {
        landlord_id: landlordId,
        rent_reminder_enabled: this.data.enabled,
        rent_reminder_days: this.data.reminderDays,
        rent_reminder_time: this.data.reminderTime,
        auto_remind: this.data.autoRemind,
        reminder_method: this.data.reminderMethod
      }

      // 检查是否存在
      const { data: existing } = await supabase
        .from('landlord_settings')
        .select('id')
        .eq('landlord_id', landlordId)
        .exec()

      if (existing && existing.length > 0) {
        await supabase.from('landlord_settings').update(payload).eq('landlord_id', landlordId).exec()
      } else {
        await supabase.from('landlord_settings').insert([payload]).exec()
      }

      wx.hideLoading()
      wx.showToast({ title: '保存成功', icon: 'success' })
      this.setData({ saving: false })
    } catch (err) {
      console.error('保存失败', err)
      wx.hideLoading()
      wx.showToast({ title: '保存失败', icon: 'none' })
      this.setData({ saving: false })
    }
  }
})