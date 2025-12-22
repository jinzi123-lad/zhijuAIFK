const { supabase } = require('../../../../../utils/supabase');

const BACKEND_URL = 'https://zhiju-backend.vercel.app';

Page({
    data: {
        navHeight: 88,
        aiInputText: '',
        isAiParsing: false,

        formData: {
            title: '',
            community: '',
            // detailed location
            province: '上海',
            city: '上海',
            district: '',
            address: '',
            buildingNum: '',
            unitNum: '',
            floorNum: '',

            layout: '1室1厅1卫',
            area: '',
            rent: '',
            deposit: '押一付一',
            desc: '',
            tags: [],

            // Full Parity Fields
            paymentMethod: '',
            moveInDate: '',

            fees: {
                water: '',
                electricity: '',
                gas: '',
                propertyMgmt: '',
                internet: ''
            },

            facilities: [], // e.g. ['Wifi', 'AC']

            images: [], // Remote URLs
            videoUrl: '',
            floorPlanUrl: '' // added
        },

        // Options (Synced with Web)
        layoutOptions: ['1室0厅1卫', '1室1厅1卫', '2室1厅1卫', '2室2厅1卫', '3室1厅1卫', '3室2厅2卫', '其他'],
        depositOptions: ['押一付一', '押一付三', '押二付一', '年付', '面议'],
        paymentMethodOptions: ['月付', '季付', '半年付', '年付'],
        moveInDateOptions: ['随时入住', '两周内', '一个月内', '协商'],
        tagOptions: ['近地铁', '精装修', '随时看房', '首次出租', '独立卫生间', '有阳台', '可养宠', '民水民电'],
        facilityOptions: ['宽带', '空调', '热水器', '洗衣机', '冰箱', '电视', '沙发', '衣柜', '床', '暖气']
    },

    onLoad() {
        const systemInfo = wx.getSystemInfoSync()
        const menuButton = wx.getMenuButtonBoundingClientRect()
        const navBarHeight = (menuButton.top - systemInfo.statusBarHeight) * 2 + menuButton.height
        this.setData({ navHeight: systemInfo.statusBarHeight + navBarHeight + 12 })
    },

    // --- AI Smart Fill Logic ---
    onAiInput(e) {
        this.setData({ aiInputText: e.detail.value });
    },

    async onSmartFill() {
        if (!this.data.aiInputText) return wx.showToast({ title: '请先粘贴文本', icon: 'none' });

        this.setData({ isAiParsing: true });
        wx.showLoading({ title: 'AI 识别中...' });

        try {
            const prompt = `
            你是一个智能房产信息提取助手。请根据提供的文本内容，提取房源的关键信息，并以 JSON 格式返回。
            
            输入文本:
            ${this.data.aiInputText}
            
            请尽可能提取以下字段。如果信息不存在，请留空或使用默认值。
            - title: 标题 (string)
            - community: 小区名称 (string)
            - buildingNum: 楼号 (string)
            - unitNum: 单元号 (string)
            - floorNum: 楼层 (string)
            - area: 面积数字 (number)
            - layout: 户型 (string)
            - rent: 租金数字 (number)
            - tags: [string]
            - facilities: [string] (配套设施)
            
            注意：请务必返回纯 JSON。
            `;

            const res = await new Promise((resolve, reject) => {
                wx.request({
                    url: `${BACKEND_URL}/ai/chat`,
                    method: 'POST',
                    header: { 'Content-Type': 'application/json' },
                    data: {
                        messages: [
                            { role: 'system', content: 'Return valid JSON only.' },
                            { role: 'user', content: prompt }
                        ]
                    },
                    success: resolve,
                    fail: reject
                });
            });

            if (res.statusCode === 200 && res.data) {
                const content = res.data.choices?.[0]?.message?.content || res.data.response;
                if (content) {
                    const cleanJson = content.replace(/```json/g, '').replace(/```/g, '').trim();
                    const data = JSON.parse(cleanJson);

                    const updates = {};
                    if (data.title) updates['formData.title'] = data.title;
                    if (data.community) updates['formData.community'] = data.community;
                    if (data.buildingNum) updates['formData.buildingNum'] = data.buildingNum;
                    if (data.unitNum) updates['formData.unitNum'] = data.unitNum;
                    if (data.floorNum) updates['formData.floorNum'] = data.floorNum;
                    if (data.area) updates['formData.area'] = data.area;
                    if (data.rent) updates['formData.rent'] = data.rent;
                    if (data.layout) updates['formData.layout'] = data.layout;

                    if (data.tags && Array.isArray(data.tags)) {
                        const newTags = [...new Set([...this.data.formData.tags, ...data.tags])].slice(0, 5);
                        updates['formData.tags'] = newTags;
                    }
                    if (data.facilities && Array.isArray(data.facilities)) {
                        const newFacs = [...new Set([...this.data.formData.facilities, ...data.facilities])];
                        updates['formData.facilities'] = newFacs;
                    }

                    this.setData(updates);
                    wx.showToast({ title: '识别成功', icon: 'success' });
                }
            } else {
                throw new Error('AI Backend Error');
            }

        } catch (e) {
            console.error(e);
            wx.showToast({ title: '识别失败，请手填', icon: 'none' });
        } finally {
            this.setData({ isAiParsing: false });
            wx.hideLoading();
        }
    },

    // --- Input Handlers ---
    onInput(e) {
        const field = e.currentTarget.dataset.field
        // Support nested paths like 'fees.water'
        this.setData({
            [`formData.${field}`]: e.detail.value
        })
    },

    // --- Pickers ---
    bindLayoutChange(e) { this.setData({ ['formData.layout']: this.data.layoutOptions[e.detail.value] }) },
    bindDepositChange(e) { this.setData({ ['formData.deposit']: this.data.depositOptions[e.detail.value] }) },
    bindPaymentChange(e) { this.setData({ ['formData.paymentMethod']: this.data.paymentMethodOptions[e.detail.value] }) },
    bindMoveInChange(e) { this.setData({ ['formData.moveInDate']: this.data.moveInDateOptions[e.detail.value] }) },

    // --- Toggles ---
    toggleTag(e) {
        const tag = e.currentTarget.dataset.tag
        let tags = this.data.formData.tags
        if (tags.includes(tag)) {
            tags = tags.filter(t => t !== tag)
        } else {
            if (tags.length >= 5) return wx.showToast({ title: '最多选5个标签', icon: 'none' })
            tags.push(tag)
        }
        this.setData({ ['formData.tags']: tags })
    },

    toggleFacility(e) {
        const item = e.currentTarget.dataset.item
        let list = this.data.formData.facilities
        if (list.includes(item)) {
            list = list.filter(t => t !== item)
        } else {
            list.push(item)
        }
        this.setData({ ['formData.facilities']: list })
    },

    // --- Image Upload (Supabase) ---
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

    // --- Generic Upload Helper ---
    async uploadFiles(filePaths) {
        const uploadedUrls = [];
        for (const filePath of filePaths) {
            try {
                const fileExt = filePath.split('.').pop();
                const fileName = `prop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

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
            } catch (e) {
                console.error('Upload Error', e);
            }
        }
        return uploadedUrls;
    },


    // --- Submit ---
    async onSubmit() {
        const { title, community, province, city, district, address, buildingNum, unitNum, floorNum,
            layout, area, rent, deposit, desc, tags, images,
            paymentMethod, moveInDate, fees, facilities } = this.data.formData;

        if (!title || !area || !rent) {
            return wx.showToast({ title: '请填写标题、面积和租金', icon: 'none' });
        }

        wx.showLoading({ title: '提交中...' });

        // Construct Full Payload matching Web
        const fullAddress = `${address} ${buildingNum ? buildingNum + '号楼' : ''} ${unitNum ? unitNum + '单元' : ''} ${floorNum ? floorNum + '层' : ''}`;

        const payload = {
            title: title || `${community} ${layout}`,

            // Location
            location: `${province}${city}${district}`,
            address: fullAddress, // Merged for display

            // Basic
            area: parseFloat(area) || 0,
            rent_amount: parseFloat(rent) || 0,
            price: parseFloat(rent) || 0, // Sync field
            layout: layout,

            // Config
            deposit_info: deposit,
            description: desc || '暂无描述',
            tags: tags,
            status: 'vacant',
            property_type: 'residential',

            // Images
            image_url: images.length > 0 ? images[0] : '',
            image_urls: images,

            // Detailed JSONB fields (matching Web App.tsx details structure)
            details: {
                paymentMethod,
                moveInDate,
                buildingNum,
                unitNum,
                floorNum,
                fees,
                nearbyFacilities: facilities
            },

            landlord_id: getApp().globalData.landlordId || 'unknown'
        };

        const { error } = await supabase.from('properties').insert(payload).exec();

        wx.hideLoading();

        if (error) {
            console.error('Insert Error:', error);
            wx.showToast({ title: '发布失败', icon: 'none' });
        } else {
            wx.showToast({ title: '发布成功', icon: 'success' });
            setTimeout(() => {
                const pages = getCurrentPages();
                if (pages.length > 1) wx.navigateBack();
                else wx.reLaunch({ url: '/pages/landlord/property/list/index' });
            }, 1000);
        }
    }
})
