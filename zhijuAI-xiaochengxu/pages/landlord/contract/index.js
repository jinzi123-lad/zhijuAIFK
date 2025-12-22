// pages/landlord/contract/index.js
const mockContracts = [
    {
        id: 1,
        propertyTitle: "阳光花园 302室",
        tenantName: "张三",
        dateRange: "1/15 - 2025/1/14",
        rent: '4,500',
        deposit: '9,000',
        status: "active",
        statusLabel: "生效中",
        statusBadgeClass: "badge-active",
        docCount: 3
    },
    {
        id: 2,
        propertyTitle: "碧水豪庭 A座1501",
        tenantName: "李四",
        dateRange: "3/1 - 2025/2/28",
        rent: '5,200',
        deposit: '10,400',
        status: "active",
        statusLabel: "生效中",
        statusBadgeClass: "badge-active",
        docCount: 1
    },
    {
        id: 3,
        propertyTitle: "翠湖雅苑 12栋201",
        tenantName: "王五",
        dateRange: "12/10 - 2024/12/9",
        rent: '3,800',
        deposit: '7,600',
        status: "expired",
        statusLabel: "已到期",
        statusBadgeClass: "badge-expired",
        docCount: 0
    }
];

Page({
    data: {
        searchQuery: '',
        selectedStatus: 'all',
        allContracts: mockContracts,
        filteredContracts: [],
        stats: {
            total: 4,
            active: 2,
            expiring: 0,
            expired: 1
        }
    },

    onLoad() {
        this.filterData();
    },

    setStatus(e) {
        this.setData({ selectedStatus: e.currentTarget.dataset.status }, () => {
            this.filterData();
        });
    },

    onSearch(e) {
        this.setData({ searchQuery: e.detail.value }, () => {
            this.filterData();
        });
    },

    filterData() {
        const { allContracts, selectedStatus, searchQuery } = this.data;
        const filtered = allContracts.filter(c => {
            const matchSearch = c.propertyTitle.includes(searchQuery) || c.tenantName.includes(searchQuery);
            if (!matchSearch) return false;

            if (selectedStatus === 'all') return true;
            return c.status === selectedStatus;
        });

        this.setData({ filteredContracts: filtered });
    },

    onAddContract() {
        wx.showToast({ title: '新建合同', icon: 'none' });
    }
})
