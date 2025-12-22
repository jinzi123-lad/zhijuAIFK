// 房东-发起签约页面
const app = getApp()

Page({
  data: {
    // 页面状态
    loading: true,
    submitting: false,

    // 选择数据
    properties: [], // 可选房源
    templates: [], // 可选模板
    tenants: [], // 可选租客

    // 表单数据
    selectedPropertyId: '',
    selectedProperty: null,
    selectedTemplateId: '',
    selectedTenantId: '',
    selectedTenant: null,

    // 合同信息（自动填充+可修改）
    contractData: {
      rentAmount: '',
      depositAmount: '',
      paymentDay: '5',
      startDate: '',
      endDate: '',
      customTerms: ''
    },

    // 租期快捷选项
    durationOptions: ['3个月', '6个月', '1年', '2年'],
    selectedDuration: '1年'
  },

  onLoad(options) {
    // 如果从房源详情进来，预选房源
    if (options.propertyId) {
      this.setData({ selectedPropertyId: options.propertyId })
    }
    this.loadData()
  },

  async loadData() {
    this.setData({ loading: true })
    try {
      // TODO: 从Supabase加载房源、模板、租客列表
      const mockProperties = [
        { id: '1', title: '阳光花园302室', price: 3500, deposit: 7000, address: '朝阳区阳光花园3号楼302室' },
        { id: '2', title: '翠湖雅苑101', price: 2800, deposit: 5600, address: '海淀区翠湖雅苑1号楼101室' }
      ]
      const mockTemplates = [
        { id: 'system-1', name: '标准住房租赁合同', isDefault: true },
        { id: 'custom-1', name: '我的模板', isDefault: false }
      ]

      this.setData({
        properties: mockProperties,
        templates: mockTemplates,
        selectedTemplateId: 'system-1',
        loading: false
      })

      // 如果有预选房源，自动填充
      if (this.data.selectedPropertyId) {
        this.onPropertySelect({ detail: { value: '0' } })
      }
    } catch (err) {
      console.error('加载数据失败', err)
      this.setData({ loading: false })
    }
  },

  // 选择房源
  onPropertySelect(e) {
    const index = e.detail.value
    const property = this.data.properties[index]
    if (property) {
      this.setData({
        selectedPropertyId: property.id,
        selectedProperty: property,
        'contractData.rentAmount': String(property.price),
        'contractData.depositAmount': String(property.deposit)
      })
    }
  },

  // 选择模板
  onTemplateSelect(e) {
    const index = e.detail.value
    const template = this.data.templates[index]
    if (template) {
      this.setData({ selectedTemplateId: template.id })
    }
  },

  // 选择租期
  selectDuration(e) {
    const duration = e.currentTarget.dataset.duration
    this.setData({ selectedDuration: duration })
    this.calculateEndDate()
  },

  // 起租日期变化
  onStartDateChange(e) {
    this.setData({ 'contractData.startDate': e.detail.value })
    this.calculateEndDate()
  },

  // 计算到期日
  calculateEndDate() {
    const { startDate } = this.data.contractData
    const { selectedDuration } = this.data
    if (!startDate) return

    const start = new Date(startDate)
    let months = 12
    if (selectedDuration === '3个月') months = 3
    else if (selectedDuration === '6个月') months = 6
    else if (selectedDuration === '1年') months = 12
    else if (selectedDuration === '2年') months = 24

    start.setMonth(start.getMonth() + months)
    start.setDate(start.getDate() - 1) // 减一天
    const endDate = start.toISOString().split('T')[0]
    this.setData({ 'contractData.endDate': endDate })
  },

  // 输入租金
  onRentInput(e) {
    this.setData({ 'contractData.rentAmount': e.detail.value })
  },

  // 输入押金
  onDepositInput(e) {
    this.setData({ 'contractData.depositAmount': e.detail.value })
  },

  // 缴费日变化
  onPaymentDayChange(e) {
    this.setData({ 'contractData.paymentDay': e.detail.value })
  },

  // 输入租客手机号查找
  onTenantPhoneInput(e) {
    const phone = e.detail.value
    if (phone.length === 11) {
      // TODO: 查询租客
      this.setData({
        selectedTenant: { id: 'tenant-1', name: '李小姐', phone: phone, verified: true }
      })
    }
  },

  // 提交合同
  async submitContract() {
    const { selectedPropertyId, selectedTemplateId, selectedTenant, contractData } = this.data

    // 校验
    if (!selectedPropertyId) {
      wx.showToast({ title: '请选择房源', icon: 'none' })
      return
    }
    if (!selectedTenant) {
      wx.showToast({ title: '请输入租客手机号', icon: 'none' })
      return
    }
    if (!contractData.startDate || !contractData.endDate) {
      wx.showToast({ title: '请选择租期', icon: 'none' })
      return
    }

    this.setData({ submitting: true })
    wx.showLoading({ title: '发送中...' })

    try {
      // TODO: 创建合同到Supabase
      // TODO: 发送通知给租客

      wx.hideLoading()
      wx.showToast({ title: '已发送签约邀请', icon: 'success' })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    } catch (err) {
      wx.hideLoading()
      wx.showToast({ title: '发送失败', icon: 'none' })
      this.setData({ submitting: false })
    }
  }
})