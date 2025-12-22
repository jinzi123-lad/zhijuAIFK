// 租客-合同详情页
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
      // 状态处理
      const statusMap = {
        'pending_tenant': '待签约',
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

  // 去签约
  goToSign() {
    const { contractId } = this.data
    wx.navigateTo({ url: `/pages/tenant/contract/sign/index?id=${contractId}` })
  },

  // 查看房源
  goToProperty() {
    const propertyId = this.data.contract?.property_id
    if (propertyId) {
      wx.navigateTo({ url: `/pages/tenant/property/detail/index?id=${propertyId}` })
    }
  },

  // 联系房东
  callLandlord() {
    // TODO: 获取房东联系方式
    wx.showToast({ title: '联系方式获取中', icon: 'none' })
  },

  // 预览签名
  previewSignature(e) {
    const url = e.currentTarget.dataset.url
    if (url) {
      wx.previewImage({ urls: [url] })
    }
  }
})