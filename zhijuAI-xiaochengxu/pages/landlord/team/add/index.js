// 房东-添加团队成员页面
const app = getApp()
const { supabase } = require('../../../../utils/supabase')

Page({
  data: {
    memberPhone: '',
    memberName: '',
    selectedRole: 'manager',
    roles: [
      { id: 'manager', name: '管家', desc: '管理房源、处理预约和报修' },
      { id: 'sales', name: '销售', desc: '查看房源、处理预约、发起合同' },
      { id: 'finance', name: '财务', desc: '查看收支、确认收款' },
      { id: 'maintenance', name: '维修', desc: '处理分配的工单' }
    ],
    submitting: false
  },

  onLoad() { },

  onPhoneInput(e) {
    this.setData({ memberPhone: e.detail.value })
  },

  onNameInput(e) {
    this.setData({ memberName: e.detail.value })
  },

  selectRole(e) {
    this.setData({ selectedRole: e.currentTarget.dataset.role })
  },

  async submit() {
    const { memberPhone, memberName, selectedRole } = this.data
    const landlordId = wx.getStorageSync('landlord_id')

    if (!memberPhone || memberPhone.length !== 11) {
      wx.showToast({ title: '请输入正确手机号', icon: 'none' })
      return
    }

    this.setData({ submitting: true })
    wx.showLoading({ title: '发送邀请...' })

    try {
      // 检查用户是否存在
      const { data: existingUser } = await supabase
        .from('users')
        .select('id, name')
        .eq('phone', memberPhone)
        .exec()

      const finalName = memberName ||
        (existingUser && existingUser.length > 0 ? existingUser[0].name : `用户${memberPhone.slice(-4)}`)

      // 创建团队成员记录
      const { error } = await supabase
        .from('team_members')
        .insert([{
          landlord_id: landlordId,
          member_phone: memberPhone,
          member_name: finalName,
          role: selectedRole,
          status: 'pending'
        }])
        .exec()

      if (error) throw error

      wx.hideLoading()
      wx.showToast({ title: '邀请已发送', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 1500)
    } catch (err) {
      console.error('发送失败', err)
      wx.hideLoading()
      wx.showToast({ title: '发送失败', icon: 'none' })
      this.setData({ submitting: false })
    }
  }
})