// 租客-个人中心页面
const app = getApp()
const { supabase } = require('../../../utils/supabase')

Page({
  data: {
    userInfo: null,
    verification: null,
    stats: {
      contracts: 0,
      repairs: 0,
      payments: 0
    },
    menuItems: [
      { icon: '📋', label: '我的合同', path: '/pages/tenant/contract/list/index' },
      { icon: '📅', label: '我的预约', path: '/pages/tenant/viewing/list/index' },
      { icon: '💰', label: '缴费记录', path: '/pages/tenant/payment/index' },
      { icon: '🔧', label: '报修记录', path: '/pages/tenant/repair/index' },
      { icon: '🏠', label: '找房', path: '/pages/tenant/property/list/index' }
    ]
  },

  onLoad() {
    this.loadUserInfo()
    this.loadStats()
  },

  onShow() {
    this.loadUserInfo()
    this.loadStats()
  },

  async loadUserInfo() {
    const tenantId = wx.getStorageSync('tenant_id') || wx.getStorageSync('user_id')
    const userName = wx.getStorageSync('user_name')
    const userPhone = wx.getStorageSync('user_phone')

    this.setData({
      userInfo: {
        id: tenantId,
        name: userName || '租客用户',
        phone: userPhone || ''
      }
    })

    // 加载认证状态
    if (tenantId) {
      try {
        const { data } = await supabase
          .from('user_verifications')
          .select('status')
          .eq('user_id', tenantId)
          .eq('user_type', 'tenant')
          .order('created_at', { ascending: false })
          .limit(1)
          .exec()

        if (data && data.length > 0) {
          this.setData({ verification: data[0] })
        }
      } catch (err) {
        console.error('加载认证状态失败', err)
      }
    }
  },

  async loadStats() {
    const tenantId = wx.getStorageSync('tenant_id') || wx.getStorageSync('user_id')
    if (!tenantId) return

    try {
      // 合同数量
      const { data: contracts } = await supabase
        .from('contracts')
        .select('id')
        .eq('tenant_id', tenantId)
        .exec()

      // 报修数量
      const { data: repairs } = await supabase
        .from('repair_orders')
        .select('id')
        .eq('tenant_id', tenantId)
        .exec()

      // 待缴账单
      const { data: payments } = await supabase
        .from('payments')
        .select('id')
        .eq('tenant_id', tenantId)
        .eq('status', 'pending')
        .exec()

      this.setData({
        stats: {
          contracts: (contracts || []).length,
          repairs: (repairs || []).length,
          payments: (payments || []).length
        }
      })
    } catch (err) {
      console.error('加载统计失败', err)
    }
  },

  // 导航
  goTo(e) {
    const path = e.currentTarget.dataset.path
    if (path) {
      wx.navigateTo({ url: path })
    }
  },

  // 去认证
  goToVerify() {
    wx.navigateTo({ url: '/pages/tenant/profile/verify/index?type=tenant' })
  },

  // 登出
  logout() {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          wx.clearStorageSync()
          wx.reLaunch({ url: '/pages/index/index' })
        }
      }
    })
  },

  // 切换身份
  switchRole() {
    wx.showModal({
      title: '切换身份',
      content: '确定要切换到房东身份吗？',
      success: (res) => {
        if (res.confirm) {
          wx.setStorageSync('currentRole', 'LANDLORD')
          wx.reLaunch({ url: '/pages/landlord/home/index' })
        }
      }
    })
  }
})