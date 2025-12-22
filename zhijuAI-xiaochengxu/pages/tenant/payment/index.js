// 租客-缴费页面
const app = getApp()
const { supabase } = require('../../../utils/supabase')

Page({
  data: {
    bills: [],
    loading: true,
    currentTab: 'pending', // pending/paid
    showPayModal: false,
    selectedBill: null,
    paymentQrcode: '',
    proofImage: '',
    landlordSettings: null
  },

  onLoad() {
    this.loadBills()
  },

  onShow() {
    this.loadBills()
  },

  onPullDownRefresh() {
    this.loadBills().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  async loadBills() {
    const tenantId = wx.getStorageSync('tenant_id') || wx.getStorageSync('user_id')
    if (!tenantId) {
      this.setData({ loading: false, bills: [] })
      return
    }

    this.setData({ loading: true })
    try {
      // 从Supabase加载账单
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('due_date', { ascending: false })
        .exec()

      if (error) {
        console.error('加载账单失败', error)
        this.setData({ loading: false })
        return
      }

      // 处理状态和逾期判断
      const today = new Date().toISOString().split('T')[0]
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

      const bills = (data || []).map(item => ({
        ...item,
        statusText: statusMap[item.status] || item.status,
        typeText: typeMap[item.payment_type] || item.payment_type,
        isOverdue: item.status === 'pending' && item.due_date < today,
        canPay: item.status === 'pending'
      }))

      this.setData({ bills, loading: false })
    } catch (err) {
      console.error('加载账单失败', err)
      wx.showToast({ title: '加载失败', icon: 'none' })
      this.setData({ loading: false })
    }
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({ currentTab: tab })
  },

  // 打开支付弹窗
  async openPayModal(e) {
    const id = e.currentTarget.dataset.id
    const bill = this.data.bills.find(b => b.id === id)
    if (!bill) return

    this.setData({ selectedBill: bill, showPayModal: true })

    // 加载房东收款码
    try {
      const { data } = await supabase
        .from('landlord_settings')
        .select('payment_qrcode')
        .eq('landlord_id', bill.landlord_id)
        .exec()

      if (data && data.length > 0 && data[0].payment_qrcode) {
        this.setData({ paymentQrcode: data[0].payment_qrcode })
      }
    } catch (err) {
      console.error('加载收款码失败', err)
    }
  },

  closePayModal() {
    this.setData({ showPayModal: false, selectedBill: null, proofImage: '', paymentQrcode: '' })
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
      // TODO: 先上传图片到Storage
      // 这里暂时直接用本地路径，实际需要上传
      const proofUrl = proofImage

      // 更新账单状态
      const { error } = await supabase
        .from('payments')
        .update({
          status: 'paid',
          proof_url: proofUrl,
          paid_date: new Date().toISOString().split('T')[0]
        })
        .eq('id', selectedBill.id)
        .exec()

      if (error) throw error

      wx.hideLoading()
      wx.showToast({ title: '已提交，等待房东确认', icon: 'success' })
      this.closePayModal()
      this.loadBills()
    } catch (err) {
      console.error('提交失败', err)
      wx.hideLoading()
      wx.showToast({ title: '提交失败', icon: 'none' })
    }
  },

  // 长按保存收款码
  saveQrcode() {
    if (!this.data.paymentQrcode) {
      wx.showToast({ title: '暂无收款码', icon: 'none' })
      return
    }
    wx.saveImageToPhotosAlbum({
      filePath: this.data.paymentQrcode,
      success: () => {
        wx.showToast({ title: '保存成功', icon: 'success' })
      },
      fail: () => {
        wx.showToast({ title: '保存失败', icon: 'none' })
      }
    })
  }
})