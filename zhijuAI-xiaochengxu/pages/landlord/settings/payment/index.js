// 房东-收款码设置页面
const app = getApp()
const { supabase } = require('../../../../utils/supabase')

Page({
  data: {
    wechatQrcode: '',
    alipayQrcode: '',
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
          wechatQrcode: settings.wechat_qrcode || '',
          alipayQrcode: settings.alipay_qrcode || ''
        })
      }
      this.setData({ loading: false })
    } catch (err) {
      console.error('加载设置失败', err)
      this.setData({ loading: false })
    }
  },

  // 选择微信收款码
  chooseWechatQrcode() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      success: (res) => {
        this.setData({ wechatQrcode: res.tempFilePaths[0] })
      }
    })
  },

  // 选择支付宝收款码
  chooseAlipayQrcode() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      success: (res) => {
        this.setData({ alipayQrcode: res.tempFilePaths[0] })
      }
    })
  },

  // 删除收款码
  removeQrcode(e) {
    const type = e.currentTarget.dataset.type
    if (type === 'wechat') {
      this.setData({ wechatQrcode: '' })
    } else {
      this.setData({ alipayQrcode: '' })
    }
  },

  // 保存设置
  async saveSettings() {
    const landlordId = wx.getStorageSync('landlord_id')
    if (!landlordId) {
      wx.showToast({ title: '请先登录', icon: 'none' })
      return
    }

    this.setData({ saving: true })
    wx.showLoading({ title: '保存中...' })

    try {
      // TODO: 上传图片到Storage，这里暂用本地路径
      const payload = {
        landlord_id: landlordId,
        wechat_qrcode: this.data.wechatQrcode,
        alipay_qrcode: this.data.alipayQrcode,
        payment_qrcode: this.data.wechatQrcode || this.data.alipayQrcode // 主收款码
      }

      // 先检查是否存在
      const { data: existing } = await supabase
        .from('landlord_settings')
        .select('id')
        .eq('landlord_id', landlordId)
        .exec()

      let error
      if (existing && existing.length > 0) {
        const result = await supabase
          .from('landlord_settings')
          .update(payload)
          .eq('landlord_id', landlordId)
          .exec()
        error = result.error
      } else {
        const result = await supabase
          .from('landlord_settings')
          .insert([payload])
          .exec()
        error = result.error
      }

      if (error) throw error

      wx.hideLoading()
      wx.showToast({ title: '保存成功', icon: 'success' })
      this.setData({ saving: false })
    } catch (err) {
      console.error('保存失败', err)
      wx.hideLoading()
      wx.showToast({ title: '保存失败', icon: 'none' })
      this.setData({ saving: false })
    }
  },

  // 预览收款码
  previewQrcode(e) {
    const url = e.currentTarget.dataset.url
    if (url) {
      wx.previewImage({ urls: [url] })
    }
  }
})