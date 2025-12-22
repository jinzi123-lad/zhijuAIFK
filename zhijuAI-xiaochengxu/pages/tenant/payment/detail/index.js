// 租客-账单详情页
const app = getApp()
const { supabase } = require('../../../../utils/supabase')

Page({
  data: {
    bill: null,
    loading: true,
    billId: '',
    showPayModal: false,
    paymentQrcode: '',
    proofImage: ''
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ billId: options.id })
      this.loadBill(options.id)
    } else {
      wx.showToast({ title: '参数错误', icon: 'none' })
      setTimeout(() => wx.navigateBack(), 1500)
    }
  },

  async loadBill(id) {
    this.setData({ loading: true })
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('id', id)
        .exec()

      if (error || !data || data.length === 0) {
        wx.showToast({ title: '账单不存在', icon: 'none' })
        setTimeout(() => wx.navigateBack(), 1500)
        return
      }

      const bill = data[0]
      // 状态处理
      const statusMap = {
        'pending': '待缴费',
        'paid': '待确认',
        'confirmed': '已确认',
        'overdue': '已逾期'
      }
      const typeMap = {
        'rent': '房租',
        'deposit': '押金',
        'utility': '水电费',
        'other': '其他'
      }
      bill.statusText = statusMap[bill.status] || bill.status
      bill.typeText = typeMap[bill.payment_type] || bill.payment_type

      this.setData({ bill, loading: false })

      // 加载收款码
      if (bill.status === 'pending') {
        this.loadPaymentQrcode(bill.landlord_id)
      }
    } catch (err) {
      console.error('加载账单失败', err)
      wx.showToast({ title: '加载失败', icon: 'none' })
      this.setData({ loading: false })
    }
  },

  async loadPaymentQrcode(landlordId) {
    try {
      const { data } = await supabase
        .from('landlord_settings')
        .select('payment_qrcode')
        .eq('landlord_id', landlordId)
        .exec()

      if (data && data.length > 0 && data[0].payment_qrcode) {
        this.setData({ paymentQrcode: data[0].payment_qrcode })
      }
    } catch (err) {
      console.error('加载收款码失败', err)
    }
  },

  // 打开支付弹窗
  openPayModal() {
    this.setData({ showPayModal: true })
  },

  closePayModal() {
    this.setData({ showPayModal: false, proofImage: '' })
  },

  // 选择凭证
  chooseProofImage() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      success: (res) => {
        this.setData({ proofImage: res.tempFilePaths[0] })
      }
    })
  },

  // 提交凭证
  async submitPayment() {
    const { bill, proofImage } = this.data
    if (!proofImage) {
      wx.showToast({ title: '请上传支付凭证', icon: 'none' })
      return
    }

    wx.showLoading({ title: '提交中...' })
    try {
      const { error } = await supabase
        .from('payments')
        .update({
          status: 'paid',
          proof_url: proofImage,
          paid_date: new Date().toISOString().split('T')[0]
        })
        .eq('id', bill.id)
        .exec()

      if (error) throw error

      wx.hideLoading()
      wx.showToast({ title: '已提交，等待确认', icon: 'success' })
      this.closePayModal()
      this.loadBill(bill.id)
    } catch (err) {
      console.error('提交失败', err)
      wx.hideLoading()
      wx.showToast({ title: '提交失败', icon: 'none' })
    }
  },

  // 保存收款码
  saveQrcode() {
    if (!this.data.paymentQrcode) return
    wx.saveImageToPhotosAlbum({
      filePath: this.data.paymentQrcode,
      success: () => wx.showToast({ title: '保存成功', icon: 'success' }),
      fail: () => wx.showToast({ title: '保存失败', icon: 'none' })
    })
  }
})