// pages/landlord/property/list/index.js
const { supabase } = require('../../../../utils/supabase');

const fullProperties = [
    // Mock data copied from property-list.tsx
    {
        id: 1,
        title: "阳光公寓 302",
        category: "residential",
        managementType: "scattered",
        status: "occupied",
        tenant: "张伟",
        rent: 4500,
        image: "", // Use default
        contractEndsIn: 20,
        maintenanceIssues: 0,
        address: "北京市朝阳区阳光路123号",
        area: 85,
        deposit: 9000,
        paymentDay: 5,
    },
    {
        id: 2,
        title: "翠谷别墅 8号",
        category: "villa",
        managementType: "scattered",
        status: "occupied",
        tenant: "李梅",
        rent: 8900,
        image: "",
        contractEndsIn: 45,
        maintenanceIssues: 1,
    },
    {
        id: 3,
        title: "市中心阁楼 1205",
        category: "residential",
        managementType: "scattered",
        status: "vacant",
        tenant: null,
        rent: 5800,
        image: "",
        contractEndsIn: null,
        maintenanceIssues: 0,
    },
    // Centralized
    {
        id: 7,
        title: "1601室",
        category: "urban_apartment",
        managementType: "centralized",
        buildingName: "天悦公寓A座",
        floor: 16,
        roomNumber: "1601",
        status: "occupied",
        tenant: "赵丽",
        rent: 4200,
        contractEndsIn: 30,
        maintenanceIssues: 0,
    },
    {
        id: 8,
        title: "1602室",
        category: "urban_apartment",
        managementType: "centralized",
        buildingName: "天悦公寓A座",
        floor: 16,
        roomNumber: "1602",
        status: "vacant",
        tenant: null,
        rent: 4200,
    },
    {
        id: 9,
        title: "1503室",
        category: "urban_apartment",
        managementType: "centralized",
        buildingName: "天悦公寓A座",
        floor: 15,
        roomNumber: "1503",
        status: "occupied",
        tenant: "孙强",
        rent: 4100,
        contractEndsIn: 55,
        maintenanceIssues: 1,
    },
    {
        id: 4,
        title: "珍珠花园 15B",
        category: "residential",
        managementType: "scattered",
        status: "occupied",
        tenant: "王强",
        rent: 3800,
        contractEndsIn: 12,
        maintenanceIssues: 0,
    },
];

Page({
    data: {
        filter: 'all',
        fullProperties: fullProperties,
        filteredProperties: [],
        apartmentProperties: [],
        scatteredProperties: [],
        stats: {
            total: 0,
            vacant: 0,
            occupied: 0
        }
    },

    onLoad() {
        wx.hideTabBar();
        this.fetchProperties();
    },

    onPullDownRefresh() {
        this.fetchProperties().then(() => {
            wx.stopPullDownRefresh();
        });
    },

    async fetchProperties() {
        // 使用UUID查询
        const landlordUuid = wx.getStorageSync('landlord_uuid') || '11111111-1111-1111-1111-111111111111';
        const { data, error } = await supabase
            .from('properties')
            .select('*')
            .eq('landlord_id', landlordUuid)
            .range(0, 99)
            .order('created_at', { ascending: false })
            .exec();

        if (error) {
            console.error('Fetch properties failed', error);
            wx.showToast({ title: '加载失败', icon: 'none' });
            return;
        }

        const fullProperties = (data || []).map(p => ({
            // Map DB snake_case to UI camelCase if needed, or stick to snake_case if UI updated
            // Let's assume standard mapping for safety based on mock structure
            id: p.id,
            title: p.title || p.name || '未命名房源',
            category: p.property_type || 'residential', // Assuming DB field
            managementType: p.management_type || 'scattered',
            status: p.status || 'vacant',
            tenant: p.tenant_name || null, // Might be relation later
            rent: p.rent_amount || 0,
            image: p.image_url || '',
            roomNumber: p.room_number || '',
            area: p.area || 0,
            address: p.address || '',
            contractEndsIn: null, // Hard to calc without real contract data
            maintenanceIssues: 0
        }));

        this.setData({ fullProperties }, () => {
            this.refreshData();
        });
    },

    refreshData() {
        const { filter, fullProperties } = this.data;

        const filtered = fullProperties.filter(p => {
            if (filter === 'all') return true;
            if (filter === 'rented') return p.status === 'occupied';
            if (filter === 'vacant') return p.status === 'vacant';
            return true;
        });

        const apartment = filtered.filter(p => p.managementType === 'centralized');
        const scattered = filtered.filter(p => p.managementType !== 'centralized'); // Default to scattered

        const stats = {
            total: fullProperties.length,
            vacant: fullProperties.filter(p => p.status === 'vacant').length,
            occupied: fullProperties.filter(p => p.status === 'occupied').length
        };

        this.setData({
            filteredProperties: filtered,
            apartmentProperties: apartment,
            scatteredProperties: scattered,
            stats
        });
    },

    onFilterChange(e) {
        this.setData({ filter: e.detail.filter }, () => {
            this.refreshData();
        });
    },

    onPropertyClick(e) {
        const property = e.detail.property;
        wx.showToast({
            title: '查看: ' + property.title,
            icon: 'none'
        });
        // Handle navigation to detail later
    },

    onAddProperty() {
        wx.navigateTo({
            url: '/pages/landlord/property/add/index'
        });
    },

    navHome() {
        wx.switchTab({
            url: '/pages/landlord/home/index'
        });
    }
})
