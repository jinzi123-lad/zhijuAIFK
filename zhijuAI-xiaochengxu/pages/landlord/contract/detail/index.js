// 房东-合同详情页
const app = getApp()
const { supabase } = require('../../../../utils/supabase')

Page({
  data: {
    contract: null,
    loading: true,
    contractId: ''
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ contractId: options.id })
      this.loadContract(options.id)
    } else {
      wx.showToast({ title: '参数错误', icon: 'none' })
      setTimeout(() => wx.navigateBack(), 1500)
    }
  },

  async loadContract(id) {
    this.setData({ loading: true })
    try {
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('id', id)
        .exec()

      if (error || !data || data.length === 0) {
        wx.showToast({ title: '合同不存在', icon: 'none' })
        setTimeout(() => wx.navigateBack(), 1500)
        return
      }

      const contract = data[0]
      const statusMap = {
        'pending_tenant': '待租客签约',
        'pending_landlord': '待房东确认',
        'signed': '已签约',
        'active': '生效中',
        'expired': '已到期',
        'terminated': '已终止'
      }
      contract.statusText = statusMap[contract.status] || contract.status

      this.setData({ contract, loading: false })
    } catch (err) {
      console.error('加载合同失败', err)
      wx.showToast({ title: '加载失败', icon: 'none' })
      this.setData({ loading: false })
    }
  },

  // 房东签名
  async signContract() {
    // TODO: 打开签名板
    wx.showToast({ title: '签名功能开发中', icon: 'none' })
  },

  // 终止合同
  terminateContract() {
    wx.showModal({
      title: '终止合同',
      content: '确定要终止该合同吗？此操作不可撤销。',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '处理中...' })
          try {
            const { error } = await supabase
              .from('contracts')
              .update({ status: 'terminated' })
              .eq('id', this.data.contractId)
              .exec()

            if (error) throw error

            wx.hideLoading()
            wx.showToast({ title: '已终止', icon: 'success' })
            setTimeout(() => wx.navigateBack(), 1500)
          } catch (err) {
            wx.hideLoading()
            wx.showToast({ title: '操作失败', icon: 'none' })
          }
        }
      }
    })
  },

  // 联系租客
  callTenant() {
    const phone = this.data.contract?.tenant_phone
    if (phone) {
      wx.makePhoneCall({ phoneNumber: phone })
    } else {
      wx.showToast({ title: '暂无联系方式', icon: 'none' })
    }
  },

  // 预览签名
  previewSignature(e) {
    const url = e.currentTarget.dataset.url
    if (url) {
      wx.previewImage({ urls: [url] })
    }
  }
})