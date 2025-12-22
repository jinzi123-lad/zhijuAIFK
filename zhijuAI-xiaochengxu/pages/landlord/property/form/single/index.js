const { supabase } = require('../../../../../utils/supabase');
const { CASCADING_REGIONS } = require('../../../../../utils/constants');

const BACKEND_URL = 'https://zhiju-backend.vercel.app';

Page({
    data: {
        navHeight: 88,
        aiInputText: '',
        isAiParsing: false,

        formData: {
            title: '',
            community: '',
            category: '住宅', // New: Property Category

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
            leaseTerms: [], // New: ['1个月', '1年']
            commissions: {}, // New: { '1年': '50%' }

            fees: {
                water: '',
                electricity: '',
                gas: '',
                propertyMgmt: '',
                internet: '',
                parking: '',      // New
                serviceFee: ''    // New
            },

            wallCondition: '',    // New
            utilitiesStatus: '',  // New

            facilities: [], // Room params e.g. ['Wifi', 'AC']
            nearbyFacilities: [], // Nearby e.g. ['Subway']

            images: [], // Remote URLs
            videoUrl: '', // unused, kept for schema
            videos: [],   // New: Array of video URLs
            floorPlanUrl: '',
            vrUrl: '',    // New: VR link
            status: 'vacant', // New: Property status (vacant/rented/maintenance)

            landlordContacts: [{ name: '', phone: '' }] // New: Contacts
        },

        // Province/City/District Options (Dynamic)
        provinceOptions: Object.keys(CASCADING_REGIONS),
        cityOptions: Object.keys(CASCADING_REGIONS['上海'] || {}),
        districtOptions: CASCADING_REGIONS['上海']?.['上海'] || [],

        // Options (Synced with Web)
        categoryOptions: ['住宅', '城市公寓', '城中村公寓', '别墅', '工厂', '写字楼', '商铺', '其他'],
        layoutOptions: ['1室0厅1卫', '1室1厅1卫', '2室1厅1卫', '2室2厅1卫', '3室1厅1卫', '3室2厅2卫', '其他'],
        depositOptions: ['押一付一', '押一付三', '押二付一', '年付', '面议'],
        paymentMethodOptions: ['月付', '季付', '半年付', '年付'],
        moveInDateOptions: ['随时入住', '两周内', '一个月内', '协商'],

        leaseTermOptions: ['1个月', '3个月', '6个月', '1年', '2年'], // Web: LEASE_TERM_OPTIONS

        tagOptions: ['近地铁', '精装修', '随时看房', '首次出租', '独立卫生间', '有阳台', '可养宠', '民水民电'],
        facilityOptions: ['宽带', '空调', '热水器', '洗衣机', '冰箱', '电视', '沙发', '衣柜', '床', '暖气'],
        nearbyOptions: ['地铁', '公交', '商场', '超市', '医院', '学校', '公园', '健身房'], // Web: DETAILED_OPTIONS.nearbyFacilities
        wallOptions: ['新装修', '良好', '普通', '需翻修'],
        utilityOptions: ['民水民电', '商水商电', '民水商电', '包水电']
    },

    onLoad() {
        const systemInfo = wx.getSystemInfoSync()
        const menuButton = wx.getMenuButtonBoundingClientRect()
        const navBarHeight = (menuButton.top - systemInfo.statusBarHeight) * 2 + menuButton.height
        this.setData({ navHeight: systemInfo.statusBarHeight + navBarHeight + 12 })

        // Initialize province/city/district options
        const province = this.data.formData.province || '上海'
        const cityMap = CASCADING_REGIONS[province] || {}
        const cityOptions = Object.keys(cityMap)
        const city = cityOptions[0] || ''
        const districtOptions = cityMap[city] || []
        this.setData({
            provinceOptions: Object.keys(CASCADING_REGIONS),
            cityOptions,
            districtOptions,
            ['formData.city']: city
        })
    },

    // --- Province/City/District Cascading ---
    bindProvinceChange(e) {
        const province = this.data.provinceOptions[e.detail.value]
        const cityMap = CASCADING_REGIONS[province] || {}
        const cityOptions = Object.keys(cityMap)
        const city = cityOptions[0] || ''
        const districtOptions = cityMap[city] || []
        this.setData({
            ['formData.province']: province,
            ['formData.city']: city,
            ['formData.district']: districtOptions[0] || '',
            cityOptions,
            districtOptions
        })
    },

    bindCityChange(e) {
        const city = this.data.cityOptions[e.detail.value]
        const province = this.data.formData.province
        const districtOptions = CASCADING_REGIONS[province]?.[city] || []
        this.setData({
            ['formData.city']: city,
            ['formData.district']: districtOptions[0] || '',
            districtOptions
        })
    },

    bindDistrictChange(e) {
        const district = this.data.districtOptions[e.detail.value]
        this.setData({ ['formData.district']: district })
    },

    // --- Property Status Selection ---
    selectStatus(e) {
        const status = e.currentTarget.dataset.status
        this.setData({ ['formData.status']: status })
    },

    // --- Floor Plan Upload ---
    chooseFloorPlan() {
        wx.chooseMedia({
            count: 1,
            mediaType: ['image'],
            sourceType: ['album', 'camera'],
            success: async (res) => {
                wx.showLoading({ title: '上传中...' })
                const uploadedUrls = await this.uploadFiles([res.tempFiles[0].tempFilePath])
                if (uploadedUrls.length > 0) {
                    this.setData({ ['formData.floorPlanUrl']: uploadedUrls[0] })
                }
                wx.hideLoading()
            }
        })
    },

    removeFloorPlan() {
        this.setData({ ['formData.floorPlanUrl']: '' })
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
    bindCategoryChange(e) { this.setData({ ['formData.category']: this.data.categoryOptions[e.detail.value] }) },
    bindLayoutChange(e) { this.setData({ ['formData.layout']: this.data.layoutOptions[e.detail.value] }) },
    bindDepositChange(e) { this.setData({ ['formData.deposit']: this.data.depositOptions[e.detail.value] }) },
    bindPaymentChange(e) { this.setData({ ['formData.paymentMethod']: this.data.paymentMethodOptions[e.detail.value] }) },
    bindMoveInChange(e) { this.setData({ ['formData.moveInDate']: this.data.moveInDateOptions[e.detail.value] }) },

    bindWallChange(e) { this.setData({ ['formData.wallCondition']: this.data.wallOptions[e.detail.value] }) },
    bindUtilityChange(e) { this.setData({ ['formData.utilitiesStatus']: this.data.utilityOptions[e.detail.value] }) },

    // --- Toggles ---
    toggleTag(e) {
        const tag = e.currentTarget.dataset.tag
        let list = this.data.formData.tags
        if (list.includes(tag)) list = list.filter(t => t !== tag)
        else {
            if (list.length >= 5) return wx.showToast({ title: '最多选5个', icon: 'none' })
            list.push(tag)
        }
        this.setData({ ['formData.tags']: list })
    },

    toggleFacility(e) {
        const item = e.currentTarget.dataset.item
        let list = this.data.formData.facilities
        if (list.includes(item)) list = list.filter(t => t !== item)
        else list.push(item)
        this.setData({ ['formData.facilities']: list })
    },

    toggleNearby(e) {
        const item = e.currentTarget.dataset.item
        let list = this.data.formData.nearbyFacilities
        if (list.includes(item)) list = list.filter(t => t !== item)
        else list.push(item)
        this.setData({ ['formData.nearbyFacilities']: list })
    },

    // --- Lease Terms & Commissions ---
    toggleLeaseTerm(e) {
        const term = e.currentTarget.dataset.term;
        let terms = this.data.formData.leaseTerms;
        let commissions = this.data.formData.commissions;

        if (terms.includes(term)) {
            terms = terms.filter(t => t !== term);
            // Optional: delete commissions[term];
        } else {
            terms.push(term);
        }
        this.setData({
            ['formData.leaseTerms']: terms,
            ['formData.commissions']: commissions
        });
    },

    onCommissionInput(e) {
        const term = e.currentTarget.dataset.term;
        const value = e.detail.value;
        this.setData({
            [`formData.commissions.${term}`]: value
        });
    },

    // --- Contacts ---
    updateContact(e) {
        const idx = e.currentTarget.dataset.index;
        const field = e.currentTarget.dataset.field;
        const val = e.detail.value;
        const contacts = this.data.formData.landlordContacts;
        contacts[idx][field] = val;
        this.setData({ ['formData.landlordContacts']: contacts });
    },
    addContact() {
        const contacts = this.data.formData.landlordContacts;
        contacts.push({ name: '', phone: '' });
        this.setData({ ['formData.landlordContacts']: contacts });
    },
    removeContact(e) {
        const idx = e.currentTarget.dataset.index;
        const contacts = this.data.formData.landlordContacts;
        contacts.splice(idx, 1);
        this.setData({ ['formData.landlordContacts']: contacts });
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

    // --- Video Upload ---
    chooseVideo() {
        wx.chooseMedia({
            count: 1,
            mediaType: ['video'],
            sourceType: ['album', 'camera'],
            maxDuration: 60,
            camera: 'back',
            success: async (res) => {
                wx.showLoading({ title: '上传视频...' });
                // Reuse uploadFiles but might need mimetype adjustment ideally
                const uploadedUrls = await this.uploadFiles([res.tempFiles[0].tempFilePath]);
                if (uploadedUrls.length > 0) {
                    this.setData({
                        ['formData.videos']: this.data.formData.videos.concat(uploadedUrls)
                    });
                }
                wx.hideLoading();
            }
        })
    },
    removeVideo(e) {
        const index = e.currentTarget.dataset.index
        const list = this.data.formData.videos
        list.splice(index, 1)
        this.setData({ ['formData.videos']: list })
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
        const { title, community, category, province, city, district, address, buildingNum, unitNum, floorNum,
            layout, area, rent, deposit, desc, tags, images, videos, floorPlanUrl, vrUrl, status,
            paymentMethod, moveInDate, leaseTerms, commissions,
            fees, facilities, nearbyFacilities, wallCondition, utilitiesStatus, landlordContacts }
            = this.data.formData;

        if (!title || !area || !rent) {
            return wx.showToast({ title: '请填写标题、面积和租金', icon: 'none' });
        }

        wx.showLoading({ title: '提交中...' });

        // Construct Full Payload matching Web
        const fullAddress = `${address} ${buildingNum ? buildingNum + '号楼' : ''} ${unitNum ? unitNum + '单元' : ''} ${floorNum ? floorNum + '层' : ''}`;

        const payload = {
            title: title || `${community} ${layout}`,
            category: category,

            // Location
            location: `${province}${city}${district}`,
            address: fullAddress,

            // Basic
            area: parseFloat(area) || 0,
            rent_amount: parseFloat(rent) || 0,
            price: parseFloat(rent) || 0,
            layout: layout,

            // Config
            deposit_info: deposit,
            description: desc || '暂无描述',
            tags: tags,
            status: status || 'vacant', // New: Property status
            property_type: 'residential',

            // Images & Media
            image_url: images.length > 0 ? images[0] : '',
            image_urls: images,
            video_urls: videos,
            floor_plan_url: floorPlanUrl || '', // New: Floor plan
            vr_url: vrUrl || '', // New: VR link

            // Detailed JSONB fields (matching Web App.tsx details structure)
            details: {
                paymentMethod,
                moveInDate,
                buildingNum,
                unitNum,
                floorNum,
                fees, // { water, elec... }
                leaseTerms, // ['1年']
                commissions, // { '1年': '50%' }
                facilities, // Room facilities
                nearbyFacilities, // Nearby
                wallCondition,
                utilitiesStatus,
                contacts: landlordContacts
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
