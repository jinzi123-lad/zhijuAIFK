// 租客-我的合同列表页
const app = getApp()

Page({
  data: {
    contracts: [],
    loading: true,
    currentTab: 'active' // active/pending/expired
  },

  onLoad() {
    this.loadContracts()
  },

  onShow() {
    this.loadContracts()
  },

  async loadContracts() {
    this.setData({ loading: true })
    try {
      // TODO: 从Supabase加载我的合同
      const mockData = [
        {
          id: '1',
          propertyTitle: '阳光花园302室',
          propertyAddress: '朝阳区阳光花园3号楼302室',
          landlordName: '张先生',
          rentAmount: 3500,
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          status: 'active',
          statusText: '生效中',
          nextPayDate: '2024-12-25'
        },
        {
          id: '2',
          propertyTitle: '翠湖雅苑101',
          propertyAddress: '海淀区翠湖雅苑',
          landlordName: '李女士',
          rentAmount: 2800,
          startDate: '2025-01-01',
          endDate: '2025-12-31',
          status: 'pending_tenant',
          statusText: '待签约'
        }
      ]
      this.setData({ contracts: mockData, loading: false })
    } catch (err) {
      console.error('加载合同失败', err)
      this.setData({ loading: false })
    }
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({ currentTab: tab })
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