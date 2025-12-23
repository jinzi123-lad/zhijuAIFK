// 全屏横屏签名页
const { supabase } = require('../../../../utils/supabase');

Page({
    data: {
        contractId: '',
        hasDrawn: false,
        canvasWidth: 0,
        canvasHeight: 0
    },

    canvas: null,
    ctx: null,
    isDrawing: false,
    lastX: 0,
    lastY: 0,

    onLoad(options) {
        if (options.id) {
            this.setData({ contractId: options.id });
        }

        // 初始化Canvas
        setTimeout(() => this.initCanvas(), 100);
    },

    initCanvas() {
        const query = wx.createSelectorQuery();
        query.select('#signCanvas')
            .fields({ node: true, size: true })
            .exec((res) => {
                if (res[0]) {
                    const canvas = res[0].node;
                    const ctx = canvas.getContext('2d');

                    // 设置canvas尺寸
                    const dpr = wx.getSystemInfoSync().pixelRatio;
                    canvas.width = res[0].width * dpr;
                    canvas.height = res[0].height * dpr;
                    ctx.scale(dpr, dpr);

                    // 设置画笔样式
                    ctx.strokeStyle = '#000000';
                    ctx.lineWidth = 4;
                    ctx.lineCap = 'round';
                    ctx.lineJoin = 'round';

                    // 绘制白色背景
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(0, 0, res[0].width, res[0].height);

                    this.canvas = canvas;
                    this.ctx = ctx;
                    this.setData({
                        canvasWidth: res[0].width,
                        canvasHeight: res[0].height
                    });
                }
            });
    },

    // 阻止页面滚动
    preventMove() {
        return false;
    },

    // 触摸开始
    touchStart(e) {
        const touch = e.touches[0];
        this.isDrawing = true;
        this.lastX = touch.x;
        this.lastY = touch.y;
        this.setData({ hasDrawn: true });
    },

    // 触摸移动
    touchMove(e) {
        if (!this.isDrawing || !this.ctx) return;

        const touch = e.touches[0];

        this.ctx.beginPath();
        this.ctx.moveTo(this.lastX, this.lastY);
        this.ctx.lineTo(touch.x, touch.y);
        this.ctx.stroke();

        this.lastX = touch.x;
        this.lastY = touch.y;
    },

    // 触摸结束
    touchEnd() {
        this.isDrawing = false;
    },

    // 清除画布
    clearCanvas() {
        if (this.ctx) {
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillRect(0, 0, this.data.canvasWidth, this.data.canvasHeight);
            this.setData({ hasDrawn: false });
        }
    },

    // 确认签名
    async confirmSign() {
        if (!this.data.hasDrawn) {
            wx.showToast({ title: '请先签名', icon: 'none' });
            return;
        }

        wx.showLoading({ title: '保存签名中...' });

        try {
            // 将canvas转为临时文件
            const tempFilePath = await new Promise((resolve, reject) => {
                wx.canvasToTempFilePath({
                    canvas: this.canvas,
                    success: (res) => resolve(res.tempFilePath),
                    fail: reject
                });
            });

            // 读取为base64
            const base64 = await new Promise((resolve, reject) => {
                wx.getFileSystemManager().readFile({
                    filePath: tempFilePath,
                    encoding: 'base64',
                    success: (res) => resolve('data:image/png;base64,' + res.data),
                    fail: reject
                });
            });

            // 先获取合同信息判断是否租客已签
            const { data: contracts } = await supabase
                .from('contracts')
                .select('tenant_signature')
                .eq('id', this.data.contractId)
                .exec();

            const tenantSigned = contracts && contracts[0]?.tenant_signature;

            // 保存到数据库
            const { error } = await supabase
                .from('contracts')
                .update({
                    landlord_signature: base64,
                    landlord_signed_at: new Date().toISOString(),
                    status: tenantSigned ? 'signed' : 'pending_tenant'
                })
                .eq('id', this.data.contractId)
                .exec();

            if (error) throw error;

            wx.hideLoading();
            wx.showToast({ title: '签名成功', icon: 'success' });

            // 返回上一页
            setTimeout(() => {
                const pages = getCurrentPages();
                if (pages.length > 1) {
                    const prevPage = pages[pages.length - 2];
                    if (prevPage.loadContract) {
                        prevPage.loadContract(this.data.contractId);
                    }
                }
                wx.navigateBack();
            }, 1500);
        } catch (err) {
            console.error('签名失败', err);
            wx.hideLoading();
            wx.showToast({ title: '签名失败', icon: 'none' });
        }
    },

    // 返回
    goBack() {
        if (this.data.hasDrawn) {
            wx.showModal({
                title: '确认离开',
                content: '签名尚未保存，确定要离开吗？',
                success: (res) => {
                    if (res.confirm) {
                        wx.navigateBack();
                    }
                }
            });
        } else {
            wx.navigateBack();
        }
    }
});
