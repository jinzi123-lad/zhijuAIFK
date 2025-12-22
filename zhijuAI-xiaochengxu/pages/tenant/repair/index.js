// 租客-报修页面
const app = getApp()

Page({
  data: {
    repairs: [],
    loading: true,
    showCreateModal: false,
    newRepair: {
      title: '',
      description: '',
      images: [],
      category: 'other'
    },
    categories: [
      { id: 'plumbing', name: '水管/下水', icon: '🚿' },
      { id: 'electrical', name: '电路/开关', icon: '💡' },
      { id: 'appliance', name: '家电故障', icon: '📺' },
      { id: 'structure', name: '门窗/墙面', icon: '🚪' },
      { id: 'other', name: '其他问题', icon: '🔧' }
    ]
  },

  onLoad() {
    this.loadRepairs()
  },

  onShow() {
    this.loadRepairs()
  },

  async loadRepairs() {
    this.setData({ loading: true })
    try {
      // TODO: 从Supabase加载我的报修
      const mockData = [
        {
          id: '1',
          title: '厨房水龙头漏水',
          category: 'plumbing',
          categoryName: '水管/下水',
          status: 'in_progress',
          statusText: '处理中',
          createdAt: '2024-12-20',
          images: []
        },
        {
          id: '2',
          title: '空调不制热',
          category: 'appliance',
          categoryName: '家电故障',
          status: 'completed',
          statusText: '已完成',
          createdAt: '2024-12-15',
          images: []
        }
      ]
      this.setData({ repairs: mockData, loading: false })
    } catch (err) {
      console.error('加载报修失败', err)
      this.setData({ loading: false })
    }
  },

  // 打开新建弹窗
  openCreateModal() {
    this.setData({ showCreateModal: true })
  },

  closeCreateModal() {
    this.setData({
      showCreateModal: false,
      newRepair: { title: '', description: '', images: [], category: 'other' }
    })
  },

  // 选择分类
  selectCategory(e) {
    const category = e.currentTarget.dataset.category
    this.setData({ 'newRepair.category': category })
  },

  // 输入标题
  onTitleInput(e) {
    this.setData({ 'newRepair.title': e.detail.value })
  },

  // 输入描述
  onDescriptionInput(e) {
    this.setData({ 'newRepair.description': e.detail.value })
  },

  // 选择图片
  chooseImages() {
    const { images } = this.data.newRepair
    const remaining = 9 - images.length
    if (remaining <= 0) {
      wx.showToast({ title: '最多9张图片', icon: 'none' })
      return
    }

    wx.chooseImage({
      count: remaining,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.setData({
          'newRepair.images': [...images, ...res.tempFilePaths]
        })
      }
    })
  },

  // 删除图片
  removeImage(e) {
    const index = e.currentTarget.dataset.index
    const { images } = this.data.newRepair
    images.splice(index, 1)
    this.setData({ 'newRepair.images': images })
  },

  // 提交报修
  async submitRepair() {
    const { newRepair } = this.data
    if (!newRepair.title.trim()) {
      wx.showToast({ title: '请输入问题描述', icon: 'none' })
      return
    }

    wx.showLoading({ title: '提交中...' })
    try {
      // TODO: 上传图片到Supabase
      // TODO: 创建报修工单
      // TODO: 通知房东

      wx.hideLoading()
      wx.showToast({ title: '提交成功', icon: 'success' })
      this.closeCreateModal()
      this.loadRepairs()
    } catch (err) {
      wx.hideLoading()
      wx.showToast({ title: '提交失败', icon: 'none' })
    }
  },

  // 查看详情
  goToDetail(e) {
    const id = e.currentTarget.dataset.id
    // TODO: 导航到详情页
    wx.showToast({ title: '详情页开发中', icon: 'none' })
  },

  // 确认完成
  confirmComplete(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '确认完成',
      content: '确认维修已完成？',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '确认中...' })
          // TODO: 更新Supabase
          setTimeout(() => {
            wx.hideLoading()
            wx.showToast({ title: '已确认', icon: 'success' })
            this.loadRepairs()
          }, 500)
        }
      }
    })
  }
})