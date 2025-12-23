// 房东-实名认证页面（复用租客逻辑）
const app = getApp()
const { supabase } = require('../../../../utils/supabase')

Page({
  data: {
    verification: null,
    loading: true,
    submitting: false,
    idCardFront: '',
    idCardBack: '',
    realName: '',
    idNumber: ''
  },

  onLoad() {
    this.loadVerification()
  },

  async loadVerification() {
    const landlordId = wx.getStorageSync('landlord_id')
    if (!landlordId) {
      this.setData({ loading: false })
      return
    }

    this.setData({ loading: true })
    try {
      const { data } = await supabase
        .from('user_verifications')
        .select('*')
        .eq('user_id', landlordId)
        .eq('user_type', 'landlord')
        .order('created_at', { ascending: false })
        .limit(1)
        .exec()

      if (data && data.length > 0) {
        const v = data[0]
        this.setData({
          verification: v,
          realName: v.real_name || '',
          idNumber: v.id_number || '',
          idCardFront: v.id_card_front || '',
          idCardBack: v.id_card_back || ''
        })
      } else {
        this.setData({ verification: { status: 'none' } })
      }
      this.setData({ loading: false })
    } catch (err) {
      console.error('加载失败', err)
      this.setData({ loading: false })
    }
  },

  uploadFront() {
    this.uploadImage('idCardFront')
  },

  uploadBack() {
    this.uploadImage('idCardBack')
  },

  uploadImage(field) {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      success: (res) => {
        this.setData({ [field]: res.tempFilePaths[0] })
      }
    })
  },

  onNameInput(e) {
    this.setData({ realName: e.detail.value })
  },

  onIdNumberInput(e) {
    this.setData({ idNumber: e.detail.value })
  },

  async submitVerification() {
    const { idCardFront, idCardBack, realName, idNumber, verification } = this.data
    const landlordId = wx.getStorageSync('landlord_id')

    if (!idCardFront || !idCardBack) {
      wx.showToast({ title: '请上传身份证照片', icon: 'none' })
      return
    }
    if (!realName || !idNumber) {
      wx.showToast({ title: '请填写姓名和身份证号', icon: 'none' })
      return
    }

    this.setData({ submitting: true })
    wx.showLoading({ title: '提交中...' })

    try {
      const data = {
        user_id: landlordId,
        user_type: 'landlord',
        real_name: realName,
        id_number: idNumber,
        id_card_front: idCardFront,
        id_card_back: idCardBack,
        status: 'pending'
      }

      if (verification && verification.id) {
        await supabase.from('user_verifications').update(data).eq('id', verification.id).exec()
      } else {
        await supabase.from('user_verifications').insert([data]).exec()
      }

      wx.hideLoading()
      // 设置已认证标记（提交成功即视为认证中）
      wx.setStorageSync('is_verified', true)
      wx.showToast({ title: '提交成功，等待审核', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 1500)
    } catch (err) {
      console.error('提交失败', err)
      wx.hideLoading()
      wx.showToast({ title: '提交失败', icon: 'none' })
      this.setData({ submitting: false })
    }
  }
})