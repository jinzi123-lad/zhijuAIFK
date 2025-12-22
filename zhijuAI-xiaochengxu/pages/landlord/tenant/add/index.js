// pages/landlord/tenant/add/index.js
const { supabase } = require('../../../../utils/supabase');

Page({
    data: {
        navHeight: 88,
        formData: {
            name: '',
            phone: '',
            propertyName: '',
            rent: '',
            startDate: '2025-01-01',
            endDate: '2026-01-01',
            status: 'active'
        }
    },

    onLoad() {
        const systemInfo = wx.getWindowInfo();
        const menuButton = wx.getMenuButtonBoundingClientRect();
        const navBarHeight = (menuButton.top - systemInfo.statusBarHeight) * 2 + menuButton.height;
        this.setData({ navHeight: systemInfo.statusBarHeight + navBarHeight + 12 });
    },

    onInput(e) {
        const field = e.currentTarget.dataset.field;
        this.setData({
            [`formData.${field}`]: e.detail.value
        });
    },

    bindStartDateChange(e) {
        this.setData({ ['formData.startDate']: e.detail.value });
    },

    bindEndDateChange(e) {
        this.setData({ ['formData.endDate']: e.detail.value });
    },

    async onSubmit() {
        const { name, phone, propertyName, rent, startDate, endDate } = this.data.formData;

        if (!name || !phone) {
            return wx.showToast({ title: '请填写姓名和电话', icon: 'none' });
        }

        wx.showLoading({ title: '添加中...' });

        const payload = {
            name,
            phone,
            property_name: propertyName, // Simplified string for now
            rent_amount: parseFloat(rent) || 0,
            contract_start_date: startDate,
            contract_end_date: endDate,
            status: 'active',
            landlord_id: getApp().globalData.landlordId
        };

        const { error } = await supabase
            .from('tenants')
            .insert(payload)
            .exec();

        wx.hideLoading();

        if (error) {
            console.error('Add tenant failed', error);
            wx.showToast({ title: '添加失败: ' + (error.message || '网络错误'), icon: 'none' });
        } else {
            wx.showToast({ title: '添加成功', icon: 'success' });
            setTimeout(() => {
                const pages = getCurrentPages();
                if (pages.length > 1) {
                    wx.navigateBack();
                } else {
                    wx.reLaunch({ url: '/pages/landlord/tenant/list/index' });
                }
            }, 1500);
        }
    }
})
