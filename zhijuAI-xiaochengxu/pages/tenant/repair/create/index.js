// 租客-报修创建页（独立页面版本）
const app = getApp()
const { supabase } = require('../../../../utils/supabase')

Page({
  data: {
    title: '',
    description: '',
    category: 'other',
    images: [],
    categories: [
      { id: 'plumbing', name: '水管/下水', icon: '🚿' },
      { id: 'electrical', name: '电路/开关', icon: '💡' },
      { id: 'appliance', name: '家电故障', icon: '📺' },
      { id: 'structure', name: '门窗/墙面', icon: '🚪' },
      { id: 'other', name: '其他问题', icon: '🔧' }
    ],
    submitting: false
  },

  onLoad(options) {
    // 可以从参数获取房源ID
    if (options.propertyId) {
      this.setData({ propertyId: options.propertyId })
    }
  },

  // 选择分类
  selectCategory(e) {
    const category = e.currentTarget.dataset.category
    this.setData({ category })
  },

  // 输入标题
  onTitleInput(e) {
    this.setData({ title: e.detail.value })
  },

  // 输入描述
  onDescriptionInput(e) {
    this.setData({ description: e.detail.value })
  },

  // 选择图片
  chooseImages() {
    const { images } = this.data
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
          images: [...images, ...res.tempFilePaths]
        })
      }
    })
  },

  // 删除图片
  removeImage(e) {
    const index = e.currentTarget.dataset.index
    const { images } = this.data
    images.splice(index, 1)
    this.setData({ images })
  },

  // 提交
  async submit() {
    const { title, description, category, images } = this.data

    if (!title.trim()) {
      wx.showToast({ title: '请输入问题描述', icon: 'none' })
      return
    }

    const tenantId = wx.getStorageSync('tenant_id') || wx.getStorageSync('user_id')
    const landlordId = wx.getStorageSync('current_landlord_id')

    this.setData({ submitting: true })
    wx.showLoading({ title: '提交中...' })

    try {
      // TODO: 上传图片到Storage
      const imageUrls = images.join(',')

      const { error } = await supabase
        .from('repair_orders')
        .insert([{
          tenant_id: tenantId,
          landlord_id: landlordId,
          title: title,
          description: description,
          category: category,
          images: imageUrls,
          status: 'pending'
        }])
        .exec()

      if (error) throw error

      wx.hideLoading()
      wx.showToast({ title: '提交成功', icon: 'success' })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    } catch (err) {
      console.error('提交失败', err)
      wx.hideLoading()
      wx.showToast({ title: '提交失败', icon: 'none' })
      this.setData({ submitting: false })
    }
  }
})