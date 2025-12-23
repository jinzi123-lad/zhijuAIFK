// 房东-发起签约页面
const app = getApp()
const { supabase } = require('../../../../utils/supabase')

Page({
  data: {
    // 页面状态
    loading: true,
    submitting: false,

    // 选择数据
    properties: [], // 可选房源
    templates: [], // 可选模板

    // 表单数据
    selectedPropertyIndex: -1,
    selectedProperty: null,
    selectedTemplateId: '',
    tenantPhone: '',
    selectedTenant: null,

    // 合同信息（自动填充+可修改）
    contractData: {
      rentAmount: '',
      depositAmount: '',
      paymentDay: '5',
      startDate: '',
      endDate: ''
    },

    // 租期快捷选项
    durationOptions: ['3个月', '6个月', '1年', '2年'],
    selectedDuration: '1年',
    minDate: ''
  },

  onLoad(options) {
    // 设置最小日期为今天
    const today = new Date()
    this.setData({ minDate: today.toISOString().split('T')[0] })

    // 如果从房源详情进来，预选房源
    if (options.propertyId) {
      this.setData({ preselectedPropertyId: options.propertyId })
    }
    this.loadData()
  },

  async loadData() {
    // 使用UUID查询
    const landlordUuid = wx.getStorageSync('landlord_uuid') || '11111111-1111-1111-1111-111111111111'
    this.setData({ loading: true })

    try {
      // 从Supabase加载房源
      const { data: properties, error } = await supabase
        .from('properties')
        .select('*')
        .eq('landlord_id', landlordUuid)
        .range(0, 99)
        .order('title')
        .exec()

      if (error) console.error('加载房源失败', error)

      // 加载合同模板（预设+自定义）
      const { data: templates } = await supabase
        .from('contract_templates')
        .select('*')
        .range(0, 99)
        .exec()

      const defaultTemplate = (templates || []).find(t => t.is_default) || templates?.[0]

      this.setData({
        properties: properties || [],
        templates: templates || [{ id: 'default', name: '标准住房租赁合同' }],
        selectedTemplateId: defaultTemplate?.id || 'default',
        loading: false
      })

      // 如果有预选房源ID，自动选中
      if (this.data.preselectedPropertyId) {
        const index = (properties || []).findIndex(p => p.id === this.data.preselectedPropertyId)
        if (index >= 0) {
          this.onPropertySelect({ detail: { value: index } })
        }
      }
    } catch (err) {
      console.error('加载数据失败', err)
      wx.showToast({ title: '加载失败', icon: 'none' })
      this.setData({ loading: false })
    }
  },

  // 选择房源
  onPropertySelect(e) {
    const index = parseInt(e.detail.value)
    const property = this.data.properties[index]
    if (property) {
      this.setData({
        selectedPropertyIndex: index,
        selectedProperty: property,
        'contractData.rentAmount': String(property.rent_amount || property.price || ''),
        'contractData.depositAmount': String(property.deposit || (property.rent_amount || property.price) * 2 || '')
      })
    }
  },

  // 选择模板
  onTemplateSelect(e) {
    const index = parseInt(e.detail.value)
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
    start.setDate(start.getDate() - 1)
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
  async onTenantPhoneInput(e) {
    const phone = e.detail.value
    this.setData({ tenantPhone: phone, selectedTenant: null })

    if (phone.length === 11) {
      // 从Supabase查询用户
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('phone', phone)
          .exec()

        if (data && data.length > 0) {
          const user = data[0]
          this.setData({
            selectedTenant: {
              id: user.id,
              name: user.name || user.nickname || '租客',
              phone: phone,
              verified: user.verified || false
            }
          })
        } else {
          // 用户不存在，使用临时租客
          this.setData({
            selectedTenant: {
              id: null,
              name: '新租客',
              phone: phone,
              verified: false,
              isNew: true
            }
          })
        }
      } catch (err) {
        console.error('查询用户失败', err)
      }
    }
  },

  // 提交合同
  async submitContract() {
    const { selectedProperty, selectedTemplateId, selectedTenant, contractData } = this.data
    const landlordUuid = wx.getStorageSync('landlord_uuid') || '11111111-1111-1111-1111-111111111111'

    // 校验
    if (!selectedProperty) {
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
    if (!contractData.rentAmount) {
      wx.showToast({ title: '请输入月租金', icon: 'none' })
      return
    }

    this.setData({ submitting: true })
    wx.showLoading({ title: '创建中...' })

    try {
      // 创建合同到Supabase
      const { data, error } = await supabase
        .from('contracts')
        .insert([{
          property_id: selectedProperty.id,
          landlord_id: landlordUuid,
          tenant_id: selectedTenant.id,
          tenant_phone: selectedTenant.phone,
          template_id: selectedTemplateId,
          rent_amount: parseFloat(contractData.rentAmount),
          deposit_amount: parseFloat(contractData.depositAmount || 0),
          payment_day: parseInt(contractData.paymentDay),
          start_date: contractData.startDate,
          end_date: contractData.endDate,
          status: 'pending_tenant',
          initiated_by: 'landlord'
        }])
        .exec()

      if (error) throw error

      wx.hideLoading()
      wx.showToast({ title: '已发送签约邀请', icon: 'success' })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    } catch (err) {
      console.error('创建合同失败', err)
      wx.hideLoading()
      wx.showToast({ title: '发送失败', icon: 'none' })
      this.setData({ submitting: false })
    }
  }
})