// 房东-工单详情页
const app = getApp()
const { supabase } = require('../../../../utils/supabase')

Page({
  data: {
    repair: null,
    loading: true,
    repairId: '',
    showAssignModal: false,
    assigneeName: '',
    assigneePhone: ''
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ repairId: options.id })
      this.loadRepair(options.id)
    } else {
      wx.showToast({ title: '参数错误', icon: 'none' })
      setTimeout(() => wx.navigateBack(), 1500)
    }
  },

  async loadRepair(id) {
    this.setData({ loading: true })
    try {
      const { data, error } = await supabase
        .from('repair_orders')
        .select('*')
        .eq('id', id)
        .exec()

      if (error || !data || data.length === 0) {
        wx.showToast({ title: '工单不存在', icon: 'none' })
        setTimeout(() => wx.navigateBack(), 1500)
        return
      }

      const repair = data[0]
      const statusMap = {
        'pending': '待处理',
        'assigned': '已派单',
        'in_progress': '处理中',
        'completed': '已完成',
        'confirmed': '已确认'
      }
      const categoryMap = {
        'plumbing': '水管/下水',
        'electrical': '电路/开关',
        'appliance': '家电故障',
        'structure': '门窗/墙面',
        'other': '其他'
      }
      repair.statusText = statusMap[repair.status] || repair.status
      repair.categoryText = categoryMap[repair.category] || repair.category
      repair.canAssign = repair.status === 'pending'
      repair.canComplete = repair.status === 'assigned' || repair.status === 'in_progress'

      this.setData({ repair, loading: false })
    } catch (err) {
      console.error('加载工单失败', err)
      wx.showToast({ title: '加载失败', icon: 'none' })
      this.setData({ loading: false })
    }
  },

  // 打开派单弹窗
  openAssignModal() {
    this.setData({ showAssignModal: true })
  },

  closeAssignModal() {
    this.setData({ showAssignModal: false, assigneeName: '', assigneePhone: '' })
  },

  onAssigneeNameInput(e) {
    this.setData({ assigneeName: e.detail.value })
  },

  onAssigneePhoneInput(e) {
    this.setData({ assigneePhone: e.detail.value })
  },

  // 派单
  async assignRepair() {
    const { repairId, assigneeName, assigneePhone } = this.data
    if (!assigneeName) {
      wx.showToast({ title: '请输入维修人员姓名', icon: 'none' })
      return
    }

    wx.showLoading({ title: '派单中...' })
    try {
      const { error } = await supabase
        .from('repair_orders')
        .update({
          status: 'assigned',
          assigned_to: assigneeName,
          assigned_phone: assigneePhone
        })
        .eq('id', repairId)
        .exec()

      if (error) throw error

      wx.hideLoading()
      wx.showToast({ title: '派单成功', icon: 'success' })
      this.closeAssignModal()
      this.loadRepair(repairId)
    } catch (err) {
      console.error('派单失败', err)
      wx.hideLoading()
      wx.showToast({ title: '派单失败', icon: 'none' })
    }
  },

  // 标记完成
  async completeRepair() {
    wx.showModal({
      title: '完成维修',
      content: '确认维修已完成？',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '处理中...' })
          try {
            const { error } = await supabase
              .from('repair_orders')
              .update({ status: 'completed' })
              .eq('id', this.data.repairId)
              .exec()

            if (error) throw error

            wx.hideLoading()
            wx.showToast({ title: '已完成', icon: 'success' })
            this.loadRepair(this.data.repairId)
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
    const phone = this.data.repair?.tenant_phone
    if (phone) {
      wx.makePhoneCall({ phoneNumber: phone })
    } else {
      wx.showToast({ title: '暂无联系方式', icon: 'none' })
    }
  },

  // 联系维修人员
  callAssignee() {
    const phone = this.data.repair?.assigned_phone
    if (phone) {
      wx.makePhoneCall({ phoneNumber: phone })
    } else {
      wx.showToast({ title: '暂无联系方式', icon: 'none' })
    }
  },

  // 预览图片
  previewImage(e) {
    const url = e.currentTarget.dataset.url
    const images = (this.data.repair?.images || '').split(',').filter(Boolean)
    if (images.length > 0) {
      wx.previewImage({ current: url, urls: images })
    }
  }
})