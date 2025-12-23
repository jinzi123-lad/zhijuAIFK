// 房东-合同详情页
const app = getApp()
const { supabase } = require('../../../../utils/supabase')

Page({
  data: {
    contract: null,
    loading: true,
    contractId: '',
    // 签名相关
    showSignModal: false,
    canvasWidth: 0,
    canvasHeight: 0,
    isDrawing: false,
    lastX: 0,
    lastY: 0
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
      const statusMap = {
        'pending_tenant': '待租客签约',
        'pending_landlord': '待房东确认',
        'signed': '已签约',
        'active': '生效中',
        'expired': '已到期',
        'terminated': '已终止'
      }
      contract.statusText = statusMap[contract.status] || contract.status

      this.setData({ contract, loading: false })
    } catch (err) {
      console.error('加载合同失败', err)
      wx.showToast({ title: '加载失败', icon: 'none' })
      this.setData({ loading: false })
    }
  },

  // 跳转到全屏签名页
  signContract() {
    wx.navigateTo({
      url: `/pages/landlord/contract/sign/index?id=${this.data.contractId}`
    });
  },

  // 初始化Canvas
  initCanvas() {
    this.ctx = wx.createCanvasContext('signCanvas', this)
    this.ctx.setStrokeStyle('#000000')
    this.ctx.setLineWidth(3)
    this.ctx.setLineCap('round')
    this.ctx.setLineJoin('round')
    this.clearCanvas()
  },

  // 关闭签名板
  closeSignModal() {
    this.setData({ showSignModal: false })
  },

  // 阻止冒泡
  stopPropagation() { },

  // 触摸开始
  touchStart(e) {
    const touch = e.touches[0]
    this.setData({
      isDrawing: true,
      lastX: touch.x,
      lastY: touch.y
    })
  },

  // 触摸移动
  touchMove(e) {
    if (!this.data.isDrawing) return

    const touch = e.touches[0]
    const { lastX, lastY } = this.data

    this.ctx.beginPath()
    this.ctx.moveTo(lastX, lastY)
    this.ctx.lineTo(touch.x, touch.y)
    this.ctx.stroke()
    this.ctx.draw(true)

    this.setData({
      lastX: touch.x,
      lastY: touch.y
    })
  },

  // 触摸结束
  touchEnd() {
    this.setData({ isDrawing: false })
  },

  // 清除画布
  clearCanvas() {
    if (this.ctx) {
      this.ctx.clearRect(0, 0, this.data.canvasWidth, this.data.canvasHeight)
      this.ctx.setFillStyle('#ffffff')
      this.ctx.fillRect(0, 0, this.data.canvasWidth, this.data.canvasHeight)
      this.ctx.draw()
    }
  },

  // 确认签名
  async confirmSign() {
    wx.showLoading({ title: '保存签名中...' })

    try {
      // 将canvas转为图片
      const tempFilePath = await new Promise((resolve, reject) => {
        wx.canvasToTempFilePath({
          canvasId: 'signCanvas',
          success: (res) => resolve(res.tempFilePath),
          fail: reject
        }, this)
      })

      // 读取图片为base64（简化处理，实际可上传到存储）
      const base64 = await new Promise((resolve, reject) => {
        wx.getFileSystemManager().readFile({
          filePath: tempFilePath,
          encoding: 'base64',
          success: (res) => resolve('data:image/png;base64,' + res.data),
          fail: reject
        })
      })

      // 保存到数据库
      const { error } = await supabase
        .from('contracts')
        .update({
          landlord_signature: base64,
          landlord_signed_at: new Date().toISOString(),
          status: this.data.contract.tenant_signature ? 'signed' : 'pending_tenant'
        })
        .eq('id', this.data.contractId)
        .exec()

      if (error) throw error

      wx.hideLoading()
      wx.showToast({ title: '签名成功', icon: 'success' })
      this.closeSignModal()
      // 刷新数据
      this.loadContract(this.data.contractId)
    } catch (err) {
      console.error('签名失败', err)
      wx.hideLoading()
      wx.showToast({ title: '签名失败', icon: 'none' })
    }
  },

  // 终止合同
  terminateContract() {
    wx.showModal({
      title: '终止合同',
      content: '确定要终止该合同吗？此操作不可撤销。',
      confirmColor: '#ef4444',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '处理中...' })
          try {
            const { error } = await supabase
              .from('contracts')
              .update({ status: 'terminated' })
              .eq('id', this.data.contractId)
              .exec()

            if (error) throw error

            wx.hideLoading()
            wx.showToast({ title: '已终止', icon: 'success' })
            setTimeout(() => wx.navigateBack(), 1500)
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
    const phone = this.data.contract?.tenant_phone
    if (phone) {
      wx.makePhoneCall({ phoneNumber: phone })
    } else {
      wx.showToast({ title: '暂无联系方式', icon: 'none' })
    }
  },

  // 预览签名
  previewSignature(e) {
    const url = e.currentTarget.dataset.url
    if (url) {
      wx.previewImage({ urls: [url] })
    }
  }
})