// 房东-团队管理页面（优化版）
const app = getApp()
const { supabase } = require('../../../utils/supabase')

Page({
  data: {
    members: [],
    loading: true,
    activeCount: 0,
    pendingCount: 0,
    showAddModal: false,
    showRoleModal: false,
    selectedMember: null,
    newMemberPhone: '',
    newMemberName: '',
    newMemberRole: 'manager',
    roles: [
      { id: 'manager', name: '管家', iconName: 'userCog', iconColor: '#2563eb', desc: '全权管理房源、预约、合同和报修' },
      { id: 'sales', name: '销售', iconName: 'briefcase', iconColor: '#f59e0b', desc: '查看房源、处理预约、发起签约' },
      { id: 'finance', name: '财务', iconName: 'wallet', iconColor: '#10b981', desc: '查看收支报表、确认租金收款' },
      { id: 'maintenance', name: '维修', iconName: 'hammer', iconColor: '#ef4444', desc: '接收并处理分配的维修工单' }
    ]
  },

  onLoad() {
    this.loadMembers()
  },

  onShow() {
    this.loadMembers()
  },

  onPullDownRefresh() {
    this.loadMembers().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  async loadMembers() {
    // 使用UUID查询
    const landlordUuid = wx.getStorageSync('landlord_uuid') || '11111111-1111-1111-1111-111111111111'

    this.setData({ loading: true })
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('landlord_id', landlordUuid)
        .range(0, 99)
        .exec()

      if (error) {
        console.error('加载失败', error)
        this.setData({ loading: false })
        return
      }

      const roleMap = {
        'manager': '管家',
        'sales': '销售',
        'finance': '财务',
        'maintenance': '维修'
      }

      const members = (data || []).map(item => ({
        ...item,
        roleName: roleMap[item.role] || item.role
      }))

      const activeCount = members.filter(m => m.status === 'active').length
      const pendingCount = members.filter(m => m.status === 'pending').length

      this.setData({ members, activeCount, pendingCount, loading: false })
    } catch (err) {
      console.error('加载失败', err)
      wx.showToast({ title: '加载失败', icon: 'none' })
      this.setData({ loading: false })
    }
  },

  // 打开添加弹窗
  openAddModal() {
    this.setData({ showAddModal: true })
  },

  closeAddModal() {
    this.setData({
      showAddModal: false,
      newMemberPhone: '',
      newMemberName: '',
      newMemberRole: 'manager'
    })
  },

  onPhoneInput(e) {
    this.setData({ newMemberPhone: e.detail.value })
  },

  onNameInput(e) {
    this.setData({ newMemberName: e.detail.value })
  },

  selectRole(e) {
    const role = e.currentTarget.dataset.role
    if (this.data.showAddModal) {
      this.setData({ newMemberRole: role })
    } else if (this.data.showRoleModal && this.data.selectedMember) {
      this.setData({ 'selectedMember.role': role })
    }
  },

  // 发送邀请
  async sendInvite() {
    const { newMemberPhone, newMemberName, newMemberRole } = this.data
    const landlordId = wx.getStorageSync('landlord_id')

    if (!newMemberPhone || newMemberPhone.length !== 11) {
      wx.showToast({ title: '请输入正确手机号', icon: 'none' })
      return
    }

    // 检查是否已存在
    const existing = this.data.members.find(m => m.member_phone === newMemberPhone)
    if (existing) {
      wx.showToast({ title: '该成员已在团队中', icon: 'none' })
      return
    }

    wx.showLoading({ title: '发送中...' })
    try {
      // 查询用户是否已注册
      const { data: existingUser } = await supabase
        .from('users')
        .select('id, name')
        .eq('phone', newMemberPhone)
        .exec()

      const memberName = newMemberName ||
        (existingUser && existingUser.length > 0 ? existingUser[0].name : `用户${newMemberPhone.slice(-4)}`)

      // 创建邀请记录
      const { error } = await supabase
        .from('team_members')
        .insert([{
          landlord_id: landlordId,
          member_phone: newMemberPhone,
          member_name: memberName,
          role: newMemberRole,
          status: 'pending',
          invited_at: new Date().toISOString()
        }])
        .exec()

      if (error) throw error

      wx.hideLoading()
      wx.showToast({ title: '邀请已发送', icon: 'success' })
      this.closeAddModal()
      this.loadMembers()

      // TODO: 发送短信或推送通知给被邀请人
    } catch (err) {
      console.error('发送失败', err)
      wx.hideLoading()
      wx.showToast({ title: err.message || '发送失败', icon: 'none' })
    }
  },

  // 打开角色编辑弹窗
  openRoleModal(e) {
    const id = e.currentTarget.dataset.id
    const member = this.data.members.find(m => m.id === id)
    if (member) {
      this.setData({ showRoleModal: true, selectedMember: { ...member } })
    }
  },

  closeRoleModal() {
    this.setData({ showRoleModal: false, selectedMember: null })
  },

  // 保存角色变更
  async saveRole() {
    const { selectedMember } = this.data
    if (!selectedMember) return

    wx.showLoading({ title: '保存中...' })
    try {
      const { error } = await supabase
        .from('team_members')
        .update({
          role: selectedMember.role
        })
        .eq('id', selectedMember.id)
        .exec()

      if (error) throw error

      wx.hideLoading()
      wx.showToast({ title: '已保存', icon: 'success' })
      this.closeRoleModal()
      this.loadMembers()
    } catch (err) {
      console.error('保存失败', err)
      wx.hideLoading()
      wx.showToast({ title: '保存失败', icon: 'none' })
    }
  },

  // 重新发送邀请
  async resendInvite(e) {
    const id = e.currentTarget.dataset.id
    const member = this.data.members.find(m => m.id === id)
    if (!member) return

    wx.showLoading({ title: '发送中...' })
    try {
      // 更新邀请时间
      await supabase
        .from('team_members')
        .update({ invited_at: new Date().toISOString() })
        .eq('id', id)
        .exec()

      wx.hideLoading()
      wx.showToast({ title: '已重新发送', icon: 'success' })
      // TODO: 实际发送短信/推送
    } catch (err) {
      wx.hideLoading()
      wx.showToast({ title: '发送失败', icon: 'none' })
    }
  },

  // 移除成员
  removeMember(e) {
    const id = e.currentTarget.dataset.id
    const member = this.data.members.find(m => m.id === id)
    if (!member) return

    wx.showModal({
      title: '移除成员',
      content: `确定将 ${member.member_name} 移出团队吗？\n移除后该成员将无法再访问您的房源信息。`,
      confirmColor: '#ef4444',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '移除中...' })
          try {
            const { error } = await supabase
              .from('team_members')
              .delete()
              .eq('id', id)
              .exec()

            if (error) throw error

            wx.hideLoading()
            wx.showToast({ title: '已移除', icon: 'success' })
            this.loadMembers()
          } catch (err) {
            console.error('移除失败', err)
            wx.hideLoading()
            wx.showToast({ title: '操作失败', icon: 'none' })
          }
        }
      }
    })
  },

  // 阻止事件冒泡
  stopPropagation() {
    // 空方法，仅用于阻止事件冒泡
  }
})