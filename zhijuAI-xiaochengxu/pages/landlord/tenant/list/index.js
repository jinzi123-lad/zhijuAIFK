// 房东-租客管理列表页
const { supabase } = require('../../../../utils/supabase');

Page({
    data: {
        searchQuery: '',
        filterStatus: 'all', // all, active, expiring
        allTenants: [],
        filteredTenants: [],
        stats: {
            total: 0,
            active: 0,
            expiring: 0
        },
        isLoading: true
    },

    onLoad() {
        this.fetchTenants();
    },

    onShow() {
        this.fetchTenants();
    },

    onPullDownRefresh() {
        this.fetchTenants().then(() => {
            wx.stopPullDownRefresh();
        });
    },

    async fetchTenants() {
        // 使用UUID查询
        const landlordUuid = wx.getStorageSync('landlord_uuid') || '11111111-1111-1111-1111-111111111111';

        this.setData({ isLoading: true });

        try {
            // 从合同表获取租客信息
            const { data, error } = await supabase
                .from('contracts')
                .select('*')
                .eq('landlord_id', landlordUuid)
                .range(0, 99)
                .order('created_at', { ascending: false })
                .exec();

            if (error) {
                console.error('获取租客失败', error);
                // 如果是表不存在或字段错误，显示空列表而不是报错
                this.setData({ isLoading: false, allTenants: [], filteredTenants: [] });
                return;
            }

            const allTenants = (data || []).map(c => ({
                id: c.id,
                name: c.tenant_name || '租客',
                phone: c.tenant_phone || '',
                property: c.property_title || c.property_address || '房源',
                rent: c.rent_amount || 0,
                contractEndDate: c.end_date,
                status: c.status || 'active',
                contractId: c.id
            }));

            this.setData({ allTenants, isLoading: false }, () => {
                this.processData();
            });
        } catch (err) {
            console.error('获取租客失败', err);
            this.setData({ isLoading: false, allTenants: [], filteredTenants: [] });
        }
    },

    processData() {
        const { searchQuery, filterStatus, allTenants } = this.data;
        const today = new Date();

        // 1. 计算统计和标记即将到期
        let expiringCount = 0;
        const processed = allTenants.map(t => {
            let isExpiringSoon = false;

            if (t.contractEndDate) {
                const endDate = new Date(t.contractEndDate);
                if (!isNaN(endDate.getTime())) {
                    // 90天内到期算即将到期
                    isExpiringSoon = (endDate > today) && ((endDate - today) / (1000 * 3600 * 24) < 90);
                }
            }

            if (isExpiringSoon) expiringCount++;

            return {
                ...t,
                isExpiringSoon
            };
        });

        // 2. 筛选
        const filtered = processed.filter(t => {
            const matchesSearch = (t.name || '').includes(searchQuery) ||
                (t.phone || '').includes(searchQuery) ||
                (t.property || '').includes(searchQuery);
            if (!matchesSearch) return false;

            if (filterStatus === 'all') return true;
            if (filterStatus === 'active') return t.status === 'active' || t.status === 'signed';
            if (filterStatus === 'expiring') return t.isExpiringSoon;
            return true;
        });

        this.setData({
            filteredTenants: filtered,
            stats: {
                total: allTenants.length,
                active: allTenants.filter(t => t.status === 'active' || t.status === 'signed').length,
                expiring: expiringCount
            }
        });
    },

    onSearchInput(e) {
        this.setData({ searchQuery: e.detail.value }, () => {
            this.processData();
        });
    },

    setFilter(e) {
        const status = e.currentTarget.dataset.status;
        this.setData({ filterStatus: status }, () => {
            this.processData();
        });
    },

    onAddTenant() {
        wx.navigateTo({
            url: '/pages/landlord/tenant/add/index'
        });
    },

    navToDetail(e) {
        const id = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: '/pages/landlord/tenant/detail/index?id=' + id
        });
    },

    // 拨打电话
    callTenant(e) {
        const phone = e.currentTarget.dataset.phone;
        if (phone) {
            wx.makePhoneCall({ phoneNumber: phone });
        }
    }
})
