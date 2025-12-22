// 租客-签约确认页面（含电子签名）
const app = getApp()
const { supabase } = require('../../../../utils/supabase')

Page({
  data: {
    contract: null,
    loading: true,
    showSignature: false,
    signatureData: '',
    agreed: false,
    submitting: false,
    contractId: ''
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ contractId: options.id })
      this.loadContract(options.id)
    } else {
      wx.showToast({ title: '参数错误', icon: 'none' })
      setTimeout(() => wx.navigateBack(), 1500)
    }
  },

  async loadContract(id) {
    this.setData({ loading: true })
    try {
      // 从Supabase加载合同详情
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('id', id)
        .exec()

      if (error || !data || data.length === 0) {
        wx.showToast({ title: '合同不存在', icon: 'none' })
        setTimeout(() => wx.navigateBack(), 1500)
        return
      }

      const contract = data[0]

      // 构建显示内容
      contract.content = [
        { title: '甲方（出租方）', value: contract.landlord_name || '房东' },
        { title: '乙方（承租方）', value: contract.tenant_signature ? '已签署' : '待签署' },
        { title: '房屋地址', value: contract.property_address || '-' },
        { title: '月租金', value: `¥${contract.rent_amount}元` },
        { title: '押金', value: `¥${contract.deposit_amount || 0}元` },
        { title: '租赁期限', value: `${contract.start_date} 至 ${contract.end_date}` },
        { title: '付款日期', value: `每月${contract.payment_day || 5}日前` }
      ]

      contract.terms = '1. 乙方应按时支付租金，不得无故拖欠。\n2. 乙方不得擅自转租、转借房屋。\n3. 租赁期满前一个月，双方应协商续租事宜。\n4. 乙方应爱护房屋及设施，损坏需照价赔偿。\n5. 发生不可抗力时，双方可协商解除合同。'

      this.setData({ contract, loading: false })
    } catch (err) {
      console.error('加载合同失败', err)
      wx.showToast({ title: '加载失败', icon: 'none' })
      this.setData({ loading: false })
    }
  },

  toggleAgreed() {
    this.setData({ agreed: !this.data.agreed })
  },

  // 打开签名板
  openSignature() {
    if (!this.data.agreed) {
      wx.showToast({ title: '请先阅读并同意合同条款', icon: 'none' })
      return
    }
    this.setData({ showSignature: true })
  },

  closeSignature() {
    this.setData({ showSignature: false })
  },

  // 签名相关
  lastX: 0,
  lastY: 0,

  onSignatureStart(e) {
    const touch = e.touches[0]
    this.lastX = touch.x
    this.lastY = touch.y
  },

  onSignatureMove(e) {
    const touch = e.touches[0]
    const ctx = wx.createCanvasContext('signatureCanvas', this)

    ctx.setLineWidth(3)
    ctx.setLineCap('round')
    ctx.setStrokeStyle('#333')
    ctx.beginPath()
    ctx.moveTo(this.lastX, this.lastY)
    ctx.lineTo(touch.x, touch.y)
    ctx.stroke()
    ctx.draw(true)

    this.lastX = touch.x
    this.lastY = touch.y
  },

  // 清除签名
  clearSignature() {
    const ctx = wx.createCanvasContext('signatureCanvas', this)
    ctx.clearRect(0, 0, 300, 150)
    ctx.draw()
    this.setData({ signatureData: '' })
  },

  // 确认签名
  confirmSignature() {
    const that = this
    wx.canvasToTempFilePath({
      canvasId: 'signatureCanvas',
      success(res) {
        // 转为base64
        wx.getFileSystemManager().readFile({
          filePath: res.tempFilePath,
          encoding: 'base64',
          success(fileRes) {
            const base64Data = 'data:image/png;base64,' + fileRes.data
            that.setData({
              signatureData: base64Data,
              showSignature: false
            })
          }
        })
      },
      fail(err) {
        wx.showToast({ title: '获取签名失败', icon: 'none' })
      }
    }, this)
  },

  // 提交签约
  async submitSign() {
    const { signatureData, contract } = this.data

    if (!signatureData) {
      wx.showToast({ title: '请先签名', icon: 'none' })
      return
    }

    this.setData({ submitting: true })
    wx.showLoading({ title: '签约中...' })

    try {
      // 更新合同：添加租客签名，更新状态
      const tenantId = wx.getStorageSync('tenant_id') || wx.getStorageSync('user_id')
      const updateData = {
        tenant_signature: signatureData,
        tenant_signed_at: new Date().toISOString(),
        tenant_id: tenantId
      }

      // 如果房东已签名，则合同状态变为signed
      if (contract.landlord_signature) {
        updateData.status = 'signed'
      } else {
        updateData.status = 'pending_landlord'
      }

      const { error } = await supabase
        .from('contracts')
        .update(updateData)
        .eq('id', contract.id)
        .exec()

      if (error) throw error

      wx.hideLoading()
      wx.showModal({
        title: '签约成功',
        content: contract.landlord_signature
          ? '双方签约完成，请完成入住验房后合同正式生效'
          : '签约已提交，等待房东签署',
        showCancel: false,
        success() {
          wx.redirectTo({ url: '/pages/tenant/contract/list/index' })
        }
      })
    } catch (err) {
      console.error('签约失败', err)
      wx.hideLoading()
      wx.showToast({ title: '签约失败', icon: 'none' })
      this.setData({ submitting: false })
    }
  }
})