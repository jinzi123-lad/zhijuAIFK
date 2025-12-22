// 租客-报修页面
const app = getApp()
const { supabase } = require('../../../utils/supabase')

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
    ],
    contractId: '' // 当前生效合同ID
  },

  onLoad() {
    this.loadRepairs()
  },

  onShow() {
    this.loadRepairs()
  },

  onPullDownRefresh() {
    this.loadRepairs().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  async loadRepairs() {
    const tenantId = wx.getStorageSync('tenant_id') || wx.getStorageSync('user_id')
    if (!tenantId) {
      this.setData({ loading: false, repairs: [] })
      return
    }

    this.setData({ loading: true })
    try {
      // 从Supabase加载我的报修
      const { data, error } = await supabase
        .from('repair_orders')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })
        .exec()

      if (error) {
        console.error('加载报修失败', error)
        this.setData({ loading: false })
        return
      }

      // 处理状态文本
      const statusMap = {
        'pending': '待处理',
        'assigned': '已派单',
        'in_progress': '处理中',
        'completed': '已完成',
        'confirmed': '已确认',
        'cancelled': '已取消'
      }
      const categoryMap = {
        'plumbing': '水管/下水',
        'electrical': '电路/开关',
        'appliance': '家电故障',
        'structure': '门窗/墙面',
        'other': '其他问题'
      }

      const repairs = (data || []).map(item => ({
        ...item,
        statusText: statusMap[item.status] || item.status,
        categoryName: categoryMap[item.category] || item.category,
        canConfirm: item.status === 'completed'
      }))

      this.setData({ repairs, loading: false })
    } catch (err) {
      console.error('加载报修失败', err)
      wx.showToast({ title: '加载失败', icon: 'none' })
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

    const tenantId = wx.getStorageSync('tenant_id') || wx.getStorageSync('user_id')
    const landlordId = wx.getStorageSync('current_landlord_id') // 可能需要从合同获取

    wx.showLoading({ title: '提交中...' })
    try {
      // TODO: 上传图片到Storage
      // 实际应该先上传，这里暂用本地路径
      const imageUrls = newRepair.images.join(',')

      // 创建报修工单
      const { error } = await supabase
        .from('repair_orders')
        .insert([{
          tenant_id: tenantId,
          landlord_id: landlordId,
          title: newRepair.title,
          description: newRepair.description,
          category: newRepair.category,
          images: imageUrls,
          status: 'pending'
        }])
        .exec()

      if (error) throw error

      wx.hideLoading()
      wx.showToast({ title: '提交成功', icon: 'success' })
      this.closeCreateModal()
      this.loadRepairs()
    } catch (err) {
      console.error('提交失败', err)
      wx.hideLoading()
      wx.showToast({ title: '提交失败', icon: 'none' })
    }
  },

  // 查看详情
  goToDetail(e) {
    const id = e.currentTarget.dataset.id
    // 可以跳转到详情页或展开查看
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
          try {
            const { error } = await supabase
              .from('repair_orders')
              .update({ status: 'confirmed' })
              .eq('id', id)
              .exec()

            if (error) throw error

            wx.hideLoading()
            wx.showToast({ title: '已确认', icon: 'success' })
            this.loadRepairs()
          } catch (err) {
            console.error('确认失败', err)
            wx.hideLoading()
            wx.showToast({ title: '操作失败', icon: 'none' })
          }
        }
      }
    })
  }
})