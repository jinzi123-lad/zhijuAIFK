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
            category: '集中式公寓', // Fixed for building

            // Location
            province: '上海',
            city: '上海',
            district: '',
            address: '',
            buildingNum: '',

            // Shared config
            paymentMethod: '',
            deposit: '押一付一',
            desc: '',
            tags: [],

            fees: {
                water: '',
                electricity: '',
                gas: '',
                propertyMgmt: '',
                internet: '',
                parking: '',
                serviceFee: ''
            },

            nearbyFacilities: [],

            images: [], // Exterior images
            videos: [],

            landlordContacts: [{ name: '', phone: '' }],

            // Centralized Specific
            units: [] // List of room objects
        },

        // Options
        depositOptions: ['押一付一', '押一付三', '押二付一', '年付', '面议'],
        paymentMethodOptions: ['月付', '季付', '半年付', '年付'],
        nearbyOptions: ['地铁', '公交', '商场', '超市', '医院', '学校', '公园', '健身房'],
        tagOptions: ['近地铁', '精装修', '随时看房', '首次出租', '独立卫生间', '有阳台', '可养宠', '民水民电'],

        // Province/City/District Options
        provinceOptions: Object.keys(CASCADING_REGIONS),
        cityOptions: Object.keys(CASCADING_REGIONS['上海'] || {}),
        districtOptions: CASCADING_REGIONS['上海']?.['上海'] || []
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

    // --- Unit Management ---
    onAddUnit() {
        wx.navigateTo({
            url: '/pages/landlord/property/form/unit/index',
            events: {
                saveUnitData: (data) => {
                    const units = this.data.formData.units;
                    units.push(data.unit);
                    this.setData({ ['formData.units']: units });
                }
            }
        })
    },

    onEditUnit(e) {
        const index = e.currentTarget.dataset.index;
        const unit = this.data.formData.units[index];
        wx.navigateTo({
            url: '/pages/landlord/property/form/unit/index',
            success: (res) => {
                res.eventChannel.emit('editUnitData', { unit, index });
            },
            events: {
                saveUnitData: (data) => {
                    const units = this.data.formData.units;
                    units[data.index] = data.unit;
                    this.setData({ ['formData.units']: units });
                }
            }
        })
    },

    onDeleteUnit(e) {
        const index = e.currentTarget.dataset.index;
        const units = this.data.formData.units;
        wx.showModal({
            title: '确认删除',
            content: '确定要删除这个房间吗？',
            success: (res) => {
                if (res.confirm) {
                    units.splice(index, 1);
                    this.setData({ ['formData.units']: units });
                }
            }
        })
    },

    // --- Inputs ---
    onInput(e) {
        const field = e.currentTarget.dataset.field
        this.setData({ [`formData.${field}`]: e.detail.value })
    },

    bindDepositChange(e) { this.setData({ ['formData.deposit']: this.data.depositOptions[e.detail.value] }) },
    bindPaymentChange(e) { this.setData({ ['formData.paymentMethod']: this.data.paymentMethodOptions[e.detail.value] }) },

    toggleTag(e) {
        const tag = e.currentTarget.dataset.tag
        let list = this.data.formData.tags
        if (list.includes(tag)) list = list.filter(t => t !== tag)
        else list.push(tag)
        this.setData({ ['formData.tags']: list })
    },

    toggleNearby(e) {
        const item = e.currentTarget.dataset.item
        let list = this.data.formData.nearbyFacilities
        if (list.includes(item)) list = list.filter(t => t !== item)
        else list.push(item)
        this.setData({ ['formData.nearbyFacilities']: list })
    },

    // --- Image Upload ---
    chooseImage() {
        wx.chooseMedia({
            count: 9 - this.data.formData.images.length,
            mediaType: ['image'],
            success: async (res) => {
                wx.showLoading({ title: '上传中...' });
                const urls = await this.uploadFiles(res.tempFiles.map(f => f.tempFilePath));
                this.setData({ ['formData.images']: this.data.formData.images.concat(urls) });
                wx.hideLoading();
            }
        })
    },
    removeImage(e) {
        const index = e.currentTarget.dataset.index
        const list = this.data.formData.images
        list.splice(index, 1)
        this.setData({ ['formData.images']: list })
    },

    async uploadFiles(filePaths) {
        const uploadedUrls = [];
        for (const filePath of filePaths) {
            try {
                const fileExt = filePath.split('.').pop();
                const fileName = `building_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
                const headers = Object.assign({}, supabase.headers);
                delete headers['Content-Type'];

                const uploadRes = await new Promise((resolve, reject) => {
                    wx.uploadFile({
                        url: `${supabase.url}/storage/v1/object/property-images/${fileName}`,
                        filePath: filePath,
                        name: 'file', header: headers, success: resolve, fail: reject
                    });
                });
                if (uploadRes.statusCode === 200) {
                    uploadedUrls.push(`${supabase.url}/storage/v1/object/public/property-images/${fileName}`);
                }
            } catch (e) { console.error(e); }
        }
        return uploadedUrls;
    },

    // --- Contacts ---
    updateContact(e) {
        const idx = e.currentTarget.dataset.index;
        const field = e.currentTarget.dataset.field;
        const contacts = this.data.formData.landlordContacts;
        contacts[idx][field] = e.detail.value;
        this.setData({ ['formData.landlordContacts']: contacts });
    },
    addContact() {
        const contacts = this.data.formData.landlordContacts;
        contacts.push({ name: '', phone: '' });
        this.setData({ ['formData.landlordContacts']: contacts });
    },

    // --- Submit ---
    async onSubmit() {
        const { title, community, category, province, city, district, address, buildingNum,
            deposit, desc, tags, images, videos,
            paymentMethod, fees, nearbyFacilities, landlordContacts, units } = this.data.formData;

        if (!community || units.length === 0) {
            return wx.showToast({ title: '请填写公寓名称并至少添加一个房间', icon: 'none' });
        }

        wx.showLoading({ title: '提交中...' });

        const payload = {
            title: title || `${community} (集中式)`,
            community: community,
            category: '集中式公寓',
            location: `${province}${city}${district}`,
            address: address, // base address

            // Building Info
            description: desc,
            tags: tags,
            property_type: 'commercial', // or concentrated

            image_url: images[0] || '',
            image_urls: images,
            video_urls: videos,

            // JSONB Details
            details: {
                paymentMethod,
                deposit,
                fees,
                nearbyFacilities,
                buildingNum,
                contacts: landlordContacts
            },

            // Units (Passed as JSON, Backend will handle or we store in units table later)
            // For now, mirroring Web's payload structure where it sends units
            units: units,

            landlord_id: getApp().globalData.landlordId || 'unknown'
        };

        const { error } = await supabase.from('properties').insert(payload).exec();

        wx.hideLoading();
        if (error) {
            console.error(error);
            wx.showToast({ title: '发布失败', icon: 'none' });
        } else {
            wx.showToast({ title: '发布成功', icon: 'success' });
            setTimeout(() => { wx.navigateBack() }, 1000);
        }
    }
})
