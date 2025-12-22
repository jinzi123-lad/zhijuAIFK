const { supabase } = require('../../../../../utils/supabase');

Page({
    data: {
        navHeight: 88,
        isEdit: false,
        editIndex: -1,

        formData: {
            roomNo: '',
            layout: '1室1厅1卫',
            area: '',
            rent: '',
            status: 'vacant', // vacant/rented
            images: [],
            desc: '',
            facilities: []
        },

        layoutOptions: ['1室0厅1卫', '1室1厅1卫', '2室1厅1卫', '2室2厅1卫', '3室1厅1卫', '3室2厅2卫', '其他'],
        facilityOptions: ['宽带', '空调', '热水器', '洗衣机', '冰箱', '电视', '沙发', '衣柜', '床', '暖气']
    },

    onLoad(options) {
        const systemInfo = wx.getSystemInfoSync()
        const menuButton = wx.getMenuButtonBoundingClientRect()
        const navBarHeight = (menuButton.top - systemInfo.statusBarHeight) * 2 + menuButton.height
        this.setData({ navHeight: systemInfo.statusBarHeight + navBarHeight + 12 })

        // Check if editing generic event channel data
        const eventChannel = this.getOpenerEventChannel();
        if (eventChannel && eventChannel.on) {
            eventChannel.on('editUnitData', (data) => {
                this.setData({
                    formData: data.unit,
                    isEdit: true,
                    editIndex: data.index
                });
            });
        }
    },

    // Handlers
    onInput(e) {
        const field = e.currentTarget.dataset.field
        this.setData({ [`formData.${field}`]: e.detail.value })
    },

    bindLayoutChange(e) { this.setData({ ['formData.layout']: this.data.layoutOptions[e.detail.value] }) },

    toggleFacility(e) {
        const item = e.currentTarget.dataset.item
        let list = this.data.formData.facilities || []
        if (list.includes(item)) list = list.filter(t => t !== item)
        else list.push(item)
        this.setData({ ['formData.facilities']: list })
    },

    toggleStatus(e) {
        const status = e.currentTarget.dataset.status;
        this.setData({ ['formData.status']: status });
    },

    // Image Upload
    chooseImage() {
        wx.chooseMedia({
            count: 9 - this.data.formData.images.length,
            mediaType: ['image'],
            sourceType: ['album', 'camera'],
            success: async (res) => {
                wx.showLoading({ title: '上传中...' });
                const uploadedUrls = await this.uploadFiles(res.tempFiles.map(f => f.tempFilePath));
                this.setData({
                    ['formData.images']: this.data.formData.images.concat(uploadedUrls)
                });
                wx.hideLoading();
            }
        })
    },

    removeImage(e) {
        const index = e.currentTarget.dataset.index
        const images = this.data.formData.images
        images.splice(index, 1)
        this.setData({ ['formData.images']: images })
    },

    async uploadFiles(filePaths) {
        const uploadedUrls = [];
        for (const filePath of filePaths) {
            try {
                const fileExt = filePath.split('.').pop();
                const fileName = `unit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
                const headers = Object.assign({}, supabase.headers);
                delete headers['Content-Type'];

                const uploadRes = await new Promise((resolve, reject) => {
                    wx.uploadFile({
                        url: `${supabase.url}/storage/v1/object/property-images/${fileName}`,
                        filePath: filePath,
                        name: 'file',
                        header: headers,
                        success: resolve,
                        fail: reject
                    });
                });
                if (uploadRes.statusCode === 200) {
                    uploadedUrls.push(`${supabase.url}/storage/v1/object/public/property-images/${fileName}`);
                }
            } catch (e) { console.error(e); }
        }
        return uploadedUrls;
    },

    onSave() {
        const { roomNo, rent, area } = this.data.formData;
        if (!roomNo || !rent) return wx.showToast({ title: '请填写房号和租金', icon: 'none' });

        const eventChannel = this.getOpenerEventChannel();
        eventChannel.emit('saveUnitData', {
            unit: this.data.formData,
            index: this.data.editIndex,
            isEdit: this.data.isEdit
        });
        wx.navigateBack();
    }
})
