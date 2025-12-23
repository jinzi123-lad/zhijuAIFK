// 房东-添加租客页面
const { supabase } = require('../../../../utils/supabase');

Page({
    data: {
        formData: {
            name: '',
            phone: '',
            idNumber: '',
            rent: '',
            startDate: '',
            endDate: '',
            notes: ''
        },
        propertyOptions: [],        // 房源列表
        selectedPropertyIndex: -1,  // 选中的房源索引
        selectedProperty: null,     // 选中的房源对象
        submitting: false
    },

    onLoad() {
        // 设置默认日期
        const today = new Date();
        const startDate = this.formatDate(today);
        const nextYear = new Date(today);
        nextYear.setFullYear(nextYear.getFullYear() + 1);
        const endDate = this.formatDate(nextYear);

        this.setData({
            'formData.startDate': startDate,
            'formData.endDate': endDate
        });

        this.loadProperties();
    },

    formatDate(date) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    },

    // 加载房东的房源列表
    async loadProperties() {
        const landlordId = wx.getStorageSync('landlord_id');
        if (!landlordId) {
            wx.showToast({ title: '请先登录', icon: 'none' });
            return;
        }

        try {
            const { data, error } = await supabase
                .from('properties')
                .select('id, title, address, rent_price, status')
                .eq('owner_id', landlordId)
                .order('created_at', { ascending: false })
                .exec();

            if (error) {
                console.error('加载房源失败', error);
                return;
            }

            // 过滤出可用的房源（空置或待租）
            const availableProperties = (data || []).filter(p =>
                p.status === 'available' || p.status === 'vacant' || !p.status
            );

            const propertyOptions = availableProperties.map(p => ({
                id: p.id,
                title: p.title || p.address || '未命名房源',
                address: p.address,
                rentPrice: p.rent_price
            }));

            this.setData({ propertyOptions });
        } catch (err) {
            console.error('加载房源失败', err);
        }
    },

    onInput(e) {
        const field = e.currentTarget.dataset.field;
        this.setData({ [`formData.${field}`]: e.detail.value });
    },

    onPropertyChange(e) {
        const index = parseInt(e.detail.value);
        const property = this.data.propertyOptions[index];

        this.setData({
            selectedPropertyIndex: index,
            selectedProperty: property
        });

        // 自动填充房源的参考租金
        if (property && property.rentPrice && !this.data.formData.rent) {
            this.setData({ 'formData.rent': String(property.rentPrice) });
        }
    },

    onStartDateChange(e) {
        this.setData({ 'formData.startDate': e.detail.value });
    },

    onEndDateChange(e) {
        this.setData({ 'formData.endDate': e.detail.value });
    },

    async onSubmit() {
        const { formData, selectedProperty } = this.data;
        const landlordId = wx.getStorageSync('landlord_id');

        // 验证
        if (!formData.name) {
            return wx.showToast({ title: '请输入租客姓名', icon: 'none' });
        }
        if (!formData.phone || formData.phone.length !== 11) {
            return wx.showToast({ title: '请输入正确的手机号', icon: 'none' });
        }
        if (!selectedProperty) {
            return wx.showToast({ title: '请选择关联房源', icon: 'none' });
        }
        if (!formData.rent) {
            return wx.showToast({ title: '请输入月租金', icon: 'none' });
        }

        this.setData({ submitting: true });
        wx.showLoading({ title: '添加中...' });

        try {
            // 创建合同记录（租客信息存储在合同中）
            const { error } = await supabase
                .from('contracts')
                .insert([{
                    landlord_id: landlordId,
                    property_id: selectedProperty.id,
                    property_title: selectedProperty.title,
                    property_address: selectedProperty.address,
                    tenant_name: formData.name,
                    tenant_phone: formData.phone,
                    tenant_id_number: formData.idNumber || null,
                    rent_amount: parseFloat(formData.rent),
                    start_date: formData.startDate,
                    end_date: formData.endDate,
                    notes: formData.notes || null,
                    status: 'active'
                }])
                .exec();

            if (error) throw error;

            // 更新房源状态为已出租
            await supabase
                .from('properties')
                .update({ status: 'rented' })
                .eq('id', selectedProperty.id)
                .exec();

            wx.hideLoading();
            wx.showToast({ title: '添加成功', icon: 'success' });

            setTimeout(() => {
                wx.navigateBack();
            }, 1500);
        } catch (err) {
            console.error('添加失败', err);
            wx.hideLoading();
            wx.showToast({ title: err.message || '添加失败', icon: 'none' });
            this.setData({ submitting: false });
        }
    }
})
