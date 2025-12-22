// 租客-缴费页面
const app = getApp()

Page({
  data: {
    bills: [],
    loading: true,
    currentTab: 'pending', // pending/paid
    showPayModal: false,
    selectedBill: null,
    paymentQrcode: '', // 房东收款码
    proofImage: ''
  },

  onLoad() {
    this.loadBills()
  },

  onShow() {
    this.loadBills()
  },

  async loadBills() {
    this.setData({ loading: true })
    try {
      // TODO: 从Supabase加载账单
      const mockData = [
        {
          id: '1',
          propertyTitle: '阳光花园302室',
          type: 'rent',
          typeText: '房租',
          amount: 3500,
          dueDate: '2024-12-25',
          status: 'pending',
          statusText: '待缴费',
          isOverdue: false
        },
        {
          id: '2',
          propertyTitle: '阳光花园302室',
          type: 'rent',
          typeText: '房租',
          amount: 3500,
          dueDate: '2024-11-25',
          paidDate: '2024-11-23',
          status: 'confirmed',
          statusText: '已确认'
        }
      ]
      this.setData({ bills: mockData, loading: false })
    } catch (err) {
      console.error('加载账单失败', err)
      this.setData({ loading: false })
    }
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({ currentTab: tab })
  },

  // 打开支付弹窗
  openPayModal(e) {
    const id = e.currentTarget.dataset.id
    const bill = this.data.bills.find(b => b.id === id)
    // TODO: 加载房东收款码
    this.setData({
      showPayModal: true,
      selectedBill: bill,
      paymentQrcode: 'https://example.com/qrcode.png' // Mock
    })
  },

  closePayModal() {
    this.setData({ showPayModal: false, selectedBill: null, proofImage: '' })
  },

  // 选择凭证图片
  chooseProofImage() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.setData({ proofImage: res.tempFilePaths[0] })
      }
    })
  },

  // 提交缴费凭证
  async submitPayment() {
    const { selectedBill, proofImage } = this.data
    if (!proofImage) {
      wx.showToast({ title: '请上传支付凭证', icon: 'none' })
      return
    }

    wx.showLoading({ title: '提交中...' })
    try {
      // TODO: 上传凭证图片到Supabase
      // TODO: 更新账单状态为paid（待确认）
      // TODO: 发送通知给房东

      wx.hideLoading()
      wx.showToast({ title: '已提交，等待房东确认', icon: 'success' })
      this.setData({ showPayModal: false, proofImage: '' })
      this.loadBills()
    } catch (err) {
      wx.hideLoading()
      wx.showToast({ title: '提交失败', icon: 'none' })
    }
  },

  // 长按保存收款码
  saveQrcode() {
    wx.showActionSheet({
      itemList: ['保存到相册'],
      success: () => {
        wx.showToast({ title: '保存成功', icon: 'success' })
      }
    })
  }
})