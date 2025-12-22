// 房东-团队管理页面
const app = getApp()

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

  async loadMembers() {
    this.setData({ loading: true })
    try {
      // TODO: 从Supabase加载团队成员
      const mockData = [
        { id: '1', name: '李管家', phone: '138****1234', role: 'manager', roleName: '管家', status: 'active', joinedAt: '2024-11-01' },
        { id: '2', name: '王销售', phone: '139****5678', role: 'sales', roleName: '销售', status: 'active', joinedAt: '2024-12-01' },
        { id: '3', name: '张师傅', phone: '137****9999', role: 'maintenance', roleName: '维修', status: 'pending', joinedAt: '' }
      ]
      this.setData({ members: mockData, loading: false })
    } catch (err) {
      console.error('加载失败', err)
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
    if (!newMemberPhone || newMemberPhone.length !== 11) {
      wx.showToast({ title: '请输入正确手机号', icon: 'none' })
      return
    }

    wx.showLoading({ title: '发送中...' })
    try {
      // TODO: 查询用户是否存在
      // TODO: 创建邀请记录
      // TODO: 发送通知

      wx.hideLoading()
      wx.showToast({ title: '邀请已发送', icon: 'success' })
      this.closeAddModal()
      this.loadMembers()
    } catch (err) {
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
    wx.showLoading({ title: '保存中...' })
    try {
      // TODO: 更新Supabase
      wx.hideLoading()
      wx.showToast({ title: '已保存', icon: 'success' })
      this.closeRoleModal()
      this.loadMembers()
    } catch (err) {
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
      content: `确定将 ${member.name} 移出团队？`,
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '移除中...' })
          // TODO: 更新Supabase
          setTimeout(() => {
            wx.hideLoading()
            wx.showToast({ title: '已移除', icon: 'success' })
            this.loadMembers()
          }, 500)
        }
      }
    })
  }
})