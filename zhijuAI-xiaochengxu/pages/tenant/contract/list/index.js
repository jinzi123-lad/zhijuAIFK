// 租客-我的合同列表页
const app = getApp()
const { supabase } = require('../../../../utils/supabase')

Page({
  data: {
    contracts: [],
    loading: true,
    currentTab: 'all', // all/pending/active/expired
    tabs: [
      { key: 'all', label: '全部' },
      { key: 'pending_tenant', label: '待签约' },
      { key: 'active', label: '生效中' },
      { key: 'expired', label: '已结束' }
    ]
  },

  onLoad() {
    this.loadContracts()
  },

  onShow() {
    this.loadContracts()
  },

  onPullDownRefresh() {
    this.loadContracts().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  async loadContracts() {
    const tenantId = wx.getStorageSync('tenant_id') || wx.getStorageSync('user_id')
    const tenantPhone = wx.getStorageSync('user_phone')

    if (!tenantId && !tenantPhone) {
      this.setData({ loading: false, contracts: [] })
      return
    }

    this.setData({ loading: true })
    try {
      // 从Supabase加载我的合同（按tenant_id或tenant_phone查询）
      let query = supabase
        .from('contracts')
        .select('*')
        .order('created_at', { ascending: false })

      if (tenantId) {
        query = query.eq('tenant_id', tenantId)
      } else if (tenantPhone) {
        query = query.eq('tenant_phone', tenantPhone)
      }

      const { data, error } = await query.exec()

      if (error) {
        console.error('加载合同失败', error)
        this.setData({ loading: false })
        return
      }

      // 处理状态文本
      const statusMap = {
        'pending_tenant': '待签约',
        'pending_landlord': '待房东确认',
        'signed': '已签约',
        'active': '生效中',
        'expired': '已到期',
        'terminated': '已终止'
      }

      const contracts = (data || []).map(item => ({
        ...item,
        statusText: statusMap[item.status] || item.status,
        canSign: item.status === 'pending_tenant',
        isActive: item.status === 'active' || item.status === 'signed'
      }))

      this.setData({ contracts, loading: false })
    } catch (err) {
      console.error('加载合同失败', err)
      wx.showToast({ title: '加载失败', icon: 'none' })
      this.setData({ loading: false })
    }
  },

  // 切换Tab
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({ currentTab: tab })
  },

  // 获取筛选后的列表
  getFilteredContracts() {
    const { contracts, currentTab } = this.data
    if (currentTab === 'all') return contracts
    if (currentTab === 'expired') {
      return contracts.filter(c => c.status === 'expired' || c.status === 'terminated')
    }
    return contracts.filter(c => c.status === currentTab)
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/tenant/contract/detail/index?id=${id}` })
  },

  goToSign(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/tenant/contract/sign/index?id=${id}` })
  }
})