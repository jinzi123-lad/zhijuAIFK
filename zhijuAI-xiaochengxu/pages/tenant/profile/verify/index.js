// 房东/租客-实名认证页面
const app = getApp()

Page({
  data: {
    userType: 'tenant', // tenant/landlord
    verification: null,
    loading: true,
    submitting: false,
    idCardFront: '',
    idCardBack: '',
    realName: '',
    idNumber: ''
  },

  onLoad(options) {
    this.setData({ userType: options.type || 'tenant' })
    this.loadVerification()
  },

  async loadVerification() {
    this.setData({ loading: true })
    try {
      // TODO: 从Supabase加载认证状态
      const mockData = {
        status: 'pending', // none/pending/approved/rejected
        realName: '',
        idNumber: '',
        idCardFront: '',
        idCardBack: '',
        rejectedReason: ''
      }
      this.setData({ verification: mockData, loading: false })
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
        // TODO: 调用OCR识别身份证信息
        if (field === 'idCardFront') {
          // 模拟OCR识别
          this.setData({
            realName: '张三',
            idNumber: '110***********1234'
          })
        }
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
    const { idCardFront, idCardBack, realName, idNumber } = this.data

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
      // TODO: 上传图片到Supabase
      // TODO: 创建认证记录

      wx.hideLoading()
      wx.showToast({ title: '提交成功，等待审核', icon: 'success' })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    } catch (err) {
      wx.hideLoading()
      wx.showToast({ title: '提交失败', icon: 'none' })
      this.setData({ submitting: false })
    }
  }
})