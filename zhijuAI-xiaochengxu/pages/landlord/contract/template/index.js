// 合同模板页面
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
    this.setData({ loading: true })

    try {
      // 从数据库加载模板
      const { data, error } = await supabase
        .from('contract_templates')
        .select('*')
        .order('is_default', { ascending: false })
        .exec()

      if (error) {
        console.error('加载模板失败', error)
      }

      let templates = (data || []).map(t => ({
        ...t,
        typeLabel: t.is_default ? '系统模板' : '自定义模板',
        description: t.description || (t.is_default ? '标准住房租赁合同，适用于大多数场景' : '')
      }))

      // 如果没有模板，添加默认模板
      if (templates.length === 0) {
        templates = [
          {
            id: 'default-1',
            name: '标准住房租赁合同',
            is_default: true,
            typeLabel: '系统模板',
            description: '适用于普通住宅租赁，包含基本条款'
          },
          {
            id: 'default-2',
            name: '商业物业租赁合同',
            is_default: true,
            typeLabel: '系统模板',
            description: '适用于商铺、写字楼等商业物业'
          },
          {
            id: 'default-3',
            name: '短租合同模板',
            is_default: true,
            typeLabel: '系统模板',
            description: '适用于3个月以下的短期租赁'
          }
        ]
      }

      this.setData({ templates, loading: false })
    } catch (err) {
      console.error('加载模板失败', err)
      this.setData({ loading: false })
    }
  },

  // 预览模板
  previewTemplate(e) {
    const id = e.currentTarget.dataset.id
    wx.showToast({ title: '预览功能开发中', icon: 'none' })
  },

  // 使用模板
  useTemplate(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/landlord/contract/create/index?templateId=${id}`
    })
  },

  // 编辑模板
  editTemplate(e) {
    const id = e.currentTarget.dataset.id
    wx.showToast({ title: '编辑功能开发中', icon: 'none' })
  },

  // 创建新模板
  createTemplate() {
    wx.showToast({ title: '创建功能开发中', icon: 'none' })
  },

  // 选中模板
  selectTemplate(e) {
    // 点击卡片默认使用该模板
    this.useTemplate(e)
  }
})