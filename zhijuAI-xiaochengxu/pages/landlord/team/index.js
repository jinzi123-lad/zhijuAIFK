// 房东-团队管理页面
const app = getApp()
const { supabase } = require('../../../utils/supabase')

Page({
  data: {
    members: [],
    loading: true,
    showAddModal: false,
    showRoleModal: false,
    selectedMember: null,
    newMemberPhone: '',
    newMemberRole: 'manager',
    roles: [
      { id: 'manager', name: '管家', desc: '管理房源、处理预约和报修' },
      { id: 'sales', name: '销售', desc: '查看房源、处理预约、发起合同' },
      { id: 'finance', name: '财务', desc: '查看收支、确认收款' },
      { id: 'maintenance', name: '维修', desc: '处理分配的工单' }
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
    const landlordId = wx.getStorageSync('landlord_id')
    if (!landlordId) {
      this.setData({ loading: false, members: [] })
      return
    }

    this.setData({ loading: true })
    try {
      // 从Supabase加载团队成员
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('landlord_id', landlordId)
        .order('created_at', { ascending: false })
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
        roleName: roleMap[item.role] || item.role,
        isPending: item.status === 'pending'
      }))

      this.setData({ members, loading: false })
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
    this.setData({ showAddModal: false, newMemberPhone: '', newMemberRole: 'manager' })
  },

  onPhoneInput(e) {
    this.setData({ newMemberPhone: e.detail.value })
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
    const { newMemberPhone, newMemberRole } = this.data
    const landlordId = wx.getStorageSync('landlord_id')

    if (!newMemberPhone || newMemberPhone.length !== 11) {
      wx.showToast({ title: '请输入正确手机号', icon: 'none' })
      return
    }

    wx.showLoading({ title: '发送中...' })
    try {
      // 查询用户是否已存在
      const { data: existingUser } = await supabase
        .from('users')
        .select('id, name')
        .eq('phone', newMemberPhone)
        .exec()

      const memberName = existingUser && existingUser.length > 0
        ? existingUser[0].name
        : `用户${newMemberPhone.slice(-4)}`

      // 创建邀请记录
      const { error } = await supabase
        .from('team_members')
        .insert([{
          landlord_id: landlordId,
          member_phone: newMemberPhone,
          member_name: memberName,
          role: newMemberRole,
          status: 'pending'
        }])
        .exec()

      if (error) throw error

      wx.hideLoading()
      wx.showToast({ title: '邀请已发送', icon: 'success' })
      this.closeAddModal()
      this.loadMembers()
    } catch (err) {
      console.error('发送失败', err)
      wx.hideLoading()
      wx.showToast({ title: '发送失败', icon: 'none' })
    }
  },

  // 打开角色编辑弹窗
  openRoleModal(e) {
    const id = e.currentTarget.dataset.id
    const member = this.data.members.find(m => m.id === id)
    this.setData({ showRoleModal: true, selectedMember: { ...member } })
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
        .update({ role: selectedMember.role })
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

  // 移除成员
  removeMember(e) {
    const id = e.currentTarget.dataset.id
    const member = this.data.members.find(m => m.id === id)

    wx.showModal({
      title: '移除成员',
      content: `确定将 ${member.member_name || member.name} 移出团队？`,
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
  }
})