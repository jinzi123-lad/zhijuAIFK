// 房东-合同模板管理页面
const app = getApp()
const { supabase } = require('../../../../utils/supabase')

Page({
  data: {
    templates: [],
    loading: true
  },

  onLoad() {
    this.loadTemplates()
  },

  onShow() {
    this.loadTemplates()
  },

  async loadTemplates() {
    const landlordId = wx.getStorageSync('landlord_id')
    this.setData({ loading: true })

    try {
      // 加载系统模板和自定义模板
      const { data, error } = await supabase
        .from('contract_templates')
        .select('*')
        .order('is_default', { ascending: false })
        .exec()

      if (error) {
        console.error('加载模板失败', error)
        this.setData({ loading: false })
        return
      }

      const templates = (data || []).map(t => ({
        ...t,
        typeLabel: t.is_default ? '系统模板' : '自定义',
        canEdit: !t.is_default
      }))

      // 如果没有模板，添加默认模板
      if (templates.length === 0) {
        templates.push({
          id: 'default',
          name: '标准住房租赁合同',
          is_default: true,
          typeLabel: '系统模板',
          canEdit: false
        })
      }

      this.setData({ templates, loading: false })
    } catch (err) {
      console.error('加载模板失败', err)
      this.setData({ loading: false })
    }
  },

  // 设为默认
  async setAsDefault(e) {
    const id = e.currentTarget.dataset.id
    const landlordId = wx.getStorageSync('landlord_id')

    wx.showLoading({ title: '设置中...' })
    try {
      // 先取消其他默认
      await supabase
        .from('contract_templates')
        .update({ is_default: false })
        .eq('landlord_id', landlordId)
        .exec()

      // 设置新默认
      const { error } = await supabase
        .from('contract_templates')
        .update({ is_default: true })
        .eq('id', id)
        .exec()

      if (error) throw error

      wx.hideLoading()
      wx.showToast({ title: '已设为默认', icon: 'success' })
      this.loadTemplates()
    } catch (err) {
      wx.hideLoading()
      wx.showToast({ title: '设置失败', icon: 'none' })
    }
  },

  // 预览模板
  previewTemplate(e) {
    const id = e.currentTarget.dataset.id
    wx.showToast({ title: '模板预览开发中', icon: 'none' })
  },

  // 编辑模板
  editTemplate(e) {
    const id = e.currentTarget.dataset.id
    wx.showToast({ title: '模板编辑开发中', icon: 'none' })
  },

  // 删除模板
  deleteTemplate(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '删除模板',
      content: '确定要删除该模板吗？',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '删除中...' })
          try {
            const { error } = await supabase
              .from('contract_templates')
              .delete()
              .eq('id', id)
              .exec()

            if (error) throw error

            wx.hideLoading()
            wx.showToast({ title: '已删除', icon: 'success' })
            this.loadTemplates()
          } catch (err) {
            wx.hideLoading()
            wx.showToast({ title: '删除失败', icon: 'none' })
          }
        }
      }
    })
  },

  // 新建模板
  addTemplate() {
    wx.showToast({ title: '新建模板开发中', icon: 'none' })
  }
})