// 租客-签约确认页面（含电子签名）
const app = getApp()

Page({
  data: {
    contract: null,
    loading: true,
    showSignature: false,
    signatureData: '',
    agreed: false,
    submitting: false
  },

  onLoad(options) {
    if (options.id) {
      this.loadContract(options.id)
    }
  },

  async loadContract(id) {
    this.setData({ loading: true })
    try {
      // TODO: 从Supabase加载合同详情
      const mockData = {
        id: id,
        propertyTitle: '阳光花园302室',
        propertyAddress: '朝阳区阳光花园3号楼302室',
        landlordName: '张先生',
        landlordSignature: 'data:image/png;base64,xxxxx', // 房东已签名
        rentAmount: 3500,
        depositAmount: 7000,
        paymentDay: 5,
        startDate: '2025-01-01',
        endDate: '2025-12-31',
        content: [
          { title: '甲方（出租方）', value: '张先生' },
          { title: '乙方（承租方）', value: '待签署' },
          { title: '房屋地址', value: '朝阳区阳光花园3号楼302室' },
          { title: '月租金', value: '¥3,500元' },
          { title: '押金', value: '¥7,000元' },
          { title: '租赁期限', value: '2025年1月1日至2025年12月31日' },
          { title: '付款日期', value: '每月5日前' }
        ],
        terms: '1. 乙方应按时支付租金...\n2. 乙方不得擅自转租...\n3. 租赁期满前一个月...'
      }
      this.setData({ contract: mockData, loading: false })
    } catch (err) {
      console.error('加载合同失败', err)
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
  signatureCtx: null,
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
    if (!this.data.signatureData) {
      wx.showToast({ title: '请先签名', icon: 'none' })
      return
    }

    this.setData({ submitting: true })
    wx.showLoading({ title: '签约中...' })

    try {
      // TODO: 提交签名到Supabase
      // TODO: 更新合同状态
      // TODO: 如果双方都签名了，触发入住验房流程

      wx.hideLoading()
      wx.showModal({
        title: '签约成功',
        content: '请完成入住验房后合同正式生效',
        showCancel: false,
        success() {
          wx.redirectTo({ url: '/pages/tenant/contract/list/index' })
        }
      })
    } catch (err) {
      wx.hideLoading()
      wx.showToast({ title: '签约失败', icon: 'none' })
      this.setData({ submitting: false })
    }
  }
})