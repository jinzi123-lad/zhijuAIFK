const { supabase } = require('../../../utils/supabase');
const app = getApp();

Page({
    data: {
        formData: {
            name: '',
            phone: '',
            wechat: ''
        },
        loading: true
    },

    onLoad() {
        this.fetchProfile();
    },

    async fetchProfile() {
        const landlordId = app.globalData.landlordId;
        const { data, error } = await supabase
            .from('landlord_profiles')
            .select('*')
            .eq('landlord_id', landlordId)
            .single();

        if (data) {
            this.setData({
                formData: {
                    name: data.name || '',
                    phone: data.phone || '',
                    wechat: data.wechat || ''
                }
            });
        }
        this.setData({ loading: false });
    },

    onInput(e) {
        const field = e.currentTarget.dataset.field;
        this.setData({
            [`formData.${field}`]: e.detail.value
        });
    },

    async onSave() {
        const { name, phone, wechat } = this.data.formData;
        if (!name || !phone) {
            return wx.showToast({ title: '姓名和电话必填', icon: 'none' });
        }

        const landlordId = app.globalData.landlordId;
        const payload = {
            landlord_id: landlordId,
            name,
            phone,
            wechat,
            updated_at: new Date().toISOString()
        };

        wx.showLoading({ title: '保存中...' });

        // Upsert by landlord_id
        const { error } = await supabase
            .from('landlord_profiles')
            .upsert(payload, { onConflict: 'landlord_id' })
            .exec();

        wx.hideLoading();

        if (error) {
            console.error('Save profile failed', error);
            wx.showToast({ title: '保存失败', icon: 'none' });
        } else {
            wx.showToast({ title: '保存成功', icon: 'success' });
            setTimeout(() => wx.navigateBack(), 1000);
        }
    }
})
