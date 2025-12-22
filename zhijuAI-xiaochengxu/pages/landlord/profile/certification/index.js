// 房东-房产备案认证页面
const app = getApp()
const { supabase } = require('../../../../utils/supabase')

Page({
  data: {
    certifications: [],
    loading: true,
    showAddModal: false,
    newCert: {
      propertyAddress: '',
      ownerName: '',
      certificateNo: '',
      certificateImage: ''
    },
    submitting: false
  },

  onLoad() {
    this.loadCertifications()
  },

  onShow() {
    this.loadCertifications()
  },

  async loadCertifications() {
    const landlordId = wx.getStorageSync('landlord_id')
    if (!landlordId) {
      this.setData({ loading: false })
      return
    }

    this.setData({ loading: true })
    try {
      const { data, error } = await supabase
        .from('property_certifications')
        .select('*')
        .eq('landlord_id', landlordId)
        .order('created_at', { ascending: false })
        .exec()

      if (error) {
        console.error('加载失败', error)
      }

      const statusMap = {
        'pending': '审核中',
        'approved': '已通过',
        'rejected': '未通过'
      }

      const certifications = (data || []).map(c => ({
        ...c,
        statusText: statusMap[c.status] || c.status
      }))

      this.setData({ certifications, loading: false })
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
    this.setData({
      showAddModal: false,
      newCert: { propertyAddress: '', ownerName: '', certificateNo: '', certificateImage: '' }
    })
  },

  onAddressInput(e) {
    this.setData({ 'newCert.propertyAddress': e.detail.value })
  },

  onOwnerInput(e) {
    this.setData({ 'newCert.ownerName': e.detail.value })
  },

  onCertNoInput(e) {
    this.setData({ 'newCert.certificateNo': e.detail.value })
  },

  // 上传房产证
  uploadCertificate() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      success: (res) => {
        this.setData({ 'newCert.certificateImage': res.tempFilePaths[0] })
      }
    })
  },

  // 提交
  async submitCertification() {
    const { newCert } = this.data
    const landlordId = wx.getStorageSync('landlord_id')

    if (!newCert.propertyAddress) {
      wx.showToast({ title: '请输入房产地址', icon: 'none' })
      return
    }
    if (!newCert.certificateImage) {
      wx.showToast({ title: '请上传房产证', icon: 'none' })
      return
    }

    this.setData({ submitting: true })
    wx.showLoading({ title: '提交中...' })

    try {
      const { error } = await supabase
        .from('property_certifications')
        .insert([{
          landlord_id: landlordId,
          property_address: newCert.propertyAddress,
          owner_name: newCert.ownerName,
          certificate_no: newCert.certificateNo,
          certificate_image: newCert.certificateImage,
          status: 'pending'
        }])
        .exec()

      if (error) throw error

      wx.hideLoading()
      wx.showToast({ title: '提交成功', icon: 'success' })
      this.closeAddModal()
      this.loadCertifications()
      this.setData({ submitting: false })
    } catch (err) {
      console.error('提交失败', err)
      wx.hideLoading()
      wx.showToast({ title: '提交失败', icon: 'none' })
      this.setData({ submitting: false })
    }
  },

  // 阻止事件冒泡
  stopPropagation() { },

  // 预览图片
  previewImage(e) {
    const url = e.currentTarget.dataset.url
    if (url) {
      wx.previewImage({ urls: [url], current: url })
    }
  }
})