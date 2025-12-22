// 房东/租客-实名认证页面
const app = getApp()
const { supabase } = require('../../../../utils/supabase')

Page({
  data: {
    userType: 'tenant', // tenant/landlord
    verification: null,
    loading: true,
    submitting: false,
    idCardFront: '',
    idCardBack: '',
    realName: '',
    idNumber: '',
    userId: ''
  },

  onLoad(options) {
    const userType = options.type || 'tenant'
    const userId = userType === 'landlord'
      ? wx.getStorageSync('landlord_id')
      : (wx.getStorageSync('tenant_id') || wx.getStorageSync('user_id'))

    this.setData({ userType, userId })
    this.loadVerification()
  },

  async loadVerification() {
    const { userId, userType } = this.data
    if (!userId) {
      this.setData({ loading: false })
      return
    }

    this.setData({ loading: true })
    try {
      // 从Supabase加载认证状态
      const { data, error } = await supabase
        .from('user_verifications')
        .select('*')
        .eq('user_id', userId)
        .eq('user_type', userType)
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
          idCardBack: v.id_card_back || '',
          loading: false
        })
      } else {
        this.setData({
          verification: { status: 'none' },
          loading: false
        })
      }
    } catch (err) {
      console.error('加载失败', err)
      this.setData({ loading: false })
    }
  },

  // 上传身份证正面
  uploadFront() {
    this.uploadImage('idCardFront')
  },

  // 上传身份证反面
  uploadBack() {
    this.uploadImage('idCardBack')
  },

  uploadImage(field) {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempPath = res.tempFilePaths[0]
        this.setData({ [field]: tempPath })
        // TODO: 可调用OCR识别身份证信息
      }
    })
  },

  // 输入姓名
  onNameInput(e) {
    this.setData({ realName: e.detail.value })
  },

  // 输入身份证号
  onIdNumberInput(e) {
    this.setData({ idNumber: e.detail.value })
  },

  // 提交认证
  async submitVerification() {
    const { idCardFront, idCardBack, realName, idNumber, userId, userType, verification } = this.data

    if (!idCardFront || !idCardBack) {
      wx.showToast({ title: '请上传身份证照片', icon: 'none' })
      return
    }
    if (!realName || !idNumber) {
      wx.showToast({ title: '请填写姓名和身份证号', icon: 'none' })
      return
    }
    if (idNumber.length !== 18) {
      wx.showToast({ title: '身份证号格式不正确', icon: 'none' })
      return
    }

    this.setData({ submitting: true })
    wx.showLoading({ title: '提交中...' })

    try {
      // TODO: 上传图片到Storage，这里暂用本地路径
      const frontUrl = idCardFront
      const backUrl = idCardBack

      const verificationData = {
        user_id: userId,
        user_type: userType,
        real_name: realName,
        id_number: idNumber,
        id_card_front: frontUrl,
        id_card_back: backUrl,
        status: 'pending'
      }

      let error
      if (verification && verification.id) {
        // 更新已有记录
        const result = await supabase
          .from('user_verifications')
          .update(verificationData)
          .eq('id', verification.id)
          .exec()
        error = result.error
      } else {
        // 新增记录
        const result = await supabase
          .from('user_verifications')
          .insert([verificationData])
          .exec()
        error = result.error
      }

      if (error) throw error

      wx.hideLoading()
      wx.showToast({ title: '提交成功，等待审核', icon: 'success' })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    } catch (err) {
      console.error('提交失败', err)
      wx.hideLoading()
      wx.showToast({ title: '提交失败', icon: 'none' })
      this.setData({ submitting: false })
    }
  }
})