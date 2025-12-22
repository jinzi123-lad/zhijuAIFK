const { supabase } = require('../../../utils/supabase');

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

    onPullDownRefresh() {
        this.fetchTenants().then(() => {
            wx.stopPullDownRefresh();
        });
    },

    async fetchTenants() {
        this.setData({ isLoading: true });

        // Fetch tenants
        // Assuming 'tenants' table exists
        const { data, error } = await supabase
            .from('tenants')
            .select('*')
            .order('created_at', { ascending: false })
            .exec();

        if (error) {
            console.error('Fetch tenants error', error);
            wx.showToast({ title: '加载失败', icon: 'none' });
            this.setData({ isLoading: false });
            return;
        }

        const allTenants = (data || []).map(t => ({
            id: t.id,
            name: t.name,
            phone: t.phone,
            property: t.property_name || '未关联房源', // Ideally join with properties table
            rent: t.rent_amount || 0,
            contractEndDate: t.contract_end_date, // YYYY-MM-DD
            status: t.status || 'active'
        }));

        this.setData({ allTenants, isLoading: false }, () => {
            this.processData();
        });
    },

    processData() {
        const { searchQuery, filterStatus, allTenants } = this.data;
        const today = new Date();

        // 1. Calculate stats first
        let expiringCount = 0;
        const processed = allTenants.map(t => {
            let isExpiringSoon = false;

            if (t.contractEndDate) {
                const endDate = new Date(t.contractEndDate);
                // Check if valid date
                if (!isNaN(endDate.getTime())) {
                    isExpiringSoon = (endDate > today) && ((endDate - today) / (1000 * 3600 * 24) < 90);
                }
            }

            if (isExpiringSoon) expiringCount++;

            return {
                ...t,
                isExpiringSoon
            };
        });

        // 2. Filter
        const filtered = processed.filter(t => {
            const matchesSearch = (t.name || '').includes(searchQuery) || (t.phone || '').includes(searchQuery) || (t.property || '').includes(searchQuery);
            if (!matchesSearch) return false;

            if (filterStatus === 'all') return true;
            if (filterStatus === 'active') return t.status === 'active';
            if (filterStatus === 'expiring') return t.isExpiringSoon;
            return true;
        });

        this.setData({
            filteredTenants: filtered,
            stats: {
                total: allTenants.length,
                active: allTenants.filter(t => t.status === 'active').length,
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
        wx.showToast({ title: '查看租客详情: ' + id, icon: 'none' });
    }
})
