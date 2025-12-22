const { supabase } = require('../../../../../utils/supabase');

const BACKEND_URL = 'https://zhiju-backend.vercel.app';

Page({
    data: {
        navHeight: 88,
        aiInputText: '',
        isAiParsing: false,

        formData: {
            community: '',
            address: '',
            floor: '',
            roomNo: '',
            layout: '1室1厅1卫',
            area: '',
            rent: '',
            deposit: '押一付一',
            desc: '',
            tags: [],
            images: [] // Array of paths (remote URLs)
        },
        // Options
        layoutOptions: ['1室0厅1卫', '1室1厅1卫', '2室1厅1卫', '2室2厅1卫', '3室1厅1卫', '3室2厅2卫', '其他'],
        depositOptions: ['押一付一', '押一付三', '押二付一', '年付', '面议'],
        tagOptions: ['近地铁', '精装修', '随时看房', '首次出租', '独立卫生间', '有阳台', '可养宠', '民水民电']
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
            - community: 小区名称 (string)
            - roomNo: 门牌号 (string)
            - floor: 楼层 (number)
            - area: 面积数字 (number)
            - layout: 户型 (string, e.g. "2室1厅1卫")
            - rent: 租金数字 (number)
            - tags: [string]
            
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

                    // Auto-fill form
                    const updates = {};
                    if (data.community) updates['formData.community'] = data.community;
                    if (data.roomNo) updates['formData.roomNo'] = data.roomNo;
                    if (data.floor) updates['formData.floor'] = data.floor;
                    if (data.area) updates['formData.area'] = data.area;
                    if (data.rent) updates['formData.rent'] = data.rent;
                    if (data.layout) updates['formData.layout'] = data.layout;
                    if (data.tags && Array.isArray(data.tags)) {
                        // Merge tags unique
                        const newTags = [...new Set([...this.data.formData.tags, ...data.tags])].slice(0, 3);
                        updates['formData.tags'] = newTags;
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

    // Input Handlers
    onInput(e) {
        const field = e.currentTarget.dataset.field
        this.setData({
            [`formData.${field}`]: e.detail.value
        })
    },

    // Pickers
    bindLayoutChange(e) {
        this.setData({ ['formData.layout']: this.data.layoutOptions[e.detail.value] })
    },

    bindDepositChange(e) {
        this.setData({ ['formData.deposit']: this.data.depositOptions[e.detail.value] })
    },

    // Tag Selection
    toggleTag(e) {
        const tag = e.currentTarget.dataset.tag
        let tags = this.data.formData.tags
        if (tags.includes(tag)) {
            tags = tags.filter(t => t !== tag)
        } else {
            if (tags.length >= 3) return wx.showToast({ title: '最多选3个标签', icon: 'none' })
            tags.push(tag)
        }
        this.setData({ ['formData.tags']: tags })
    },

    // --- Image Upload Logic (Direct to Supabase) ---
    chooseImage() {
        wx.chooseMedia({
            count: 9 - this.data.formData.images.length,
            mediaType: ['image'],
            sourceType: ['album', 'camera'],
            success: async (res) => {
                wx.showLoading({ title: '上传中...' });
                const tempFiles = res.tempFiles;
                const uploadedUrls = [];

                for (const file of tempFiles) {
                    try {
                        const fileExt = file.tempFilePath.split('.').pop();
                        const fileName = `prop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
                        const filePath = file.tempFilePath;

                        // Note: WeChat's uploadFile is simpler but requires correct FormData
                        // Supabase storage endpoint: POST /storage/v1/object/{bucket}/{path}
                        // Required Header: Authorization: Bearer {KEY}

                        // Prepare headers (exclude Content-Type to let wx set multipart boundary)
                        const headers = Object.assign({}, supabase.headers);
                        delete headers['Content-Type'];

                        const uploadRes = await new Promise((resolve, reject) => {
                            wx.uploadFile({
                                url: `${supabase.url}/storage/v1/object/property-images/${fileName}`,
                                filePath: filePath,
                                name: 'file', // Supabase expects 'file' or just binary body? standard multipart is 'file'
                                header: headers,
                                success: resolve,
                                fail: reject
                            });
                        });

                        if (uploadRes.statusCode === 200) {
                            // Construct public URL manually since upload returns metadata
                            const publicUrl = `${supabase.url}/storage/v1/object/public/property-images/${fileName}`;
                            uploadedUrls.push(publicUrl);
                        } else {
                            console.error('Upload Failed', uploadRes);
                        }
                    } catch (e) {
                        console.error('Upload Error', e);
                    }
                }

                this.setData({
                    ['formData.images']: this.data.formData.images.concat(uploadedUrls)
                });
                wx.hideLoading();
            },
            fail: () => {
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

    // Submit
    async onSubmit() {
        const { community, address, floor, roomNo, layout, area, rent, deposit, desc, tags, images } = this.data.formData;

        if (!community || !address || !rent) {
            return wx.showToast({ title: '请补全核心信息', icon: 'none' });
        }

        wx.showLoading({ title: '正在发布...' });

        const title = `${community}${roomNo ? ' ' + roomNo : ''}`;

        const payload = {
            title: title,
            address: address,
            floor: parseInt(floor) || 0,
            room_number: roomNo,
            layout: layout,
            area: parseFloat(area) || 0,
            rent_amount: parseFloat(rent) || 0,
            deposit_info: deposit,
            description: desc || '暂无描述',
            tags: tags,
            status: 'vacant',
            property_type: 'residential',
            image_url: images.length > 0 ? images[0] : '', // Cover
            image_urls: images, // Store all images if specific column exists, otherwise just convention
            landlord_id: getApp().globalData.landlordId || 'unknown'
        };

        const { data, error } = await supabase
            .from('properties')
            .insert(payload)
            .exec();

        wx.hideLoading();

        if (error) {
            console.error('Insert Payload:', payload);
            console.error('Insert failed Detailed:', error);
            wx.showToast({ title: '发布失败', icon: 'none' });
        } else {
            wx.showToast({ title: '发布成功', icon: 'success' });
            setTimeout(() => {
                const pages = getCurrentPages();
                if (pages.length > 1) {
                    wx.navigateBack();
                } else {
                    wx.reLaunch({ url: '/pages/landlord/property/list/index' });
                }
            }, 1500);
        }
    }
})
