// pages/landlord/maintenance/index.js
const mockRequests = [
    {
        id: 1,
        propertyTitle: "翠湖雅苑 12栋201",
        title: "卫生间漏水",
        description: "主卧卫生间天花板漏水，需要立即处理",
        category: "plumbing",
        categoryLabel: "水管",
        priority: "urgent",
        priorityLabel: "紧急",
        status: "in_progress",
        statusLabel: "处理中",
        reportedBy: "王五",
        reportedDate: "2024-12-18",
        assignedTo: "李师傅",
    },
    {
        id: 2,
        propertyTitle: "阳光花园 302室",
        title: "空调不制冷",
        description: "客厅空调开启后不制冷，疑似缺氟",
        category: "appliance",
        categoryLabel: "电器",
        priority: "high",
        priorityLabel: "高",
        status: "pending",
        statusLabel: "待处理",
        reportedBy: "张三",
        reportedDate: "2024-12-19",
    },
    {
        id: 4,
        propertyTitle: "碧水豪庭 A座1501",
        title: "门锁损坏",
        description: "入户门锁打不开，已更换为新锁",
        category: "structure",
        categoryLabel: "结构",
        priority: "urgent",
        priorityLabel: "紧急",
        status: "completed",
        statusLabel: "已完成",
        reportedBy: "李四",
        reportedDate: "2024-12-15",
        assignedTo: "王师傅",
    },
];

Page({
    data: {
        selectedStatus: 'all',
        selectedPriority: 'all',
        priorities: [
            { key: 'all', label: '全部' },
            { key: 'urgent', label: '紧急' },
            { key: 'high', label: '高' },
            { key: 'medium', label: '中' },
            { key: 'low', label: '低' }
        ],
        filteredRequests: [],
        allRequests: [],
        stats: {
            total: 0,
            pending: 0,
            in_progress: 0,
            completed: 0
        }
    },

    onLoad() {
        this.processData();
    },

    processData() {
        // Enrich data with styles
        const enriched = mockRequests.map(r => {
            let priorityClass = 'bg-muted';
            let iconColor = '#64748b';
            if (r.priority === 'urgent') { priorityClass = 'bg-destructive-10'; iconColor = '#ef4444'; }
            if (r.priority === 'high') { priorityClass = 'bg-warning-10'; iconColor = '#f59e0b'; }
            if (r.priority === 'medium') { priorityClass = 'bg-primary-10'; iconColor = '#2563eb'; }

            let statusClass = 'bg-muted';
            if (r.status === 'completed') statusClass = 'bg-success-10';
            if (r.status === 'in_progress') statusClass = 'bg-primary-10';
            if (r.status === 'pending') statusClass = 'bg-warning-10';

            return { ...r, priorityClass, iconColor, statusClass };
        });

        this.setData({ allRequests: enriched }, () => {
            this.filterData();
        });
    },

    filterData() {
        const { allRequests, selectedStatus, selectedPriority } = this.data;

        // Compute stats from ALL data, not filtered
        const stats = {
            total: allRequests.length,
            pending: allRequests.filter(r => r.status === 'pending').length,
            in_progress: allRequests.filter(r => r.status === 'in_progress').length,
            completed: allRequests.filter(r => r.status === 'completed').length,
        };

        const filtered = allRequests.filter(r => {
            if (selectedStatus !== 'all' && r.status !== selectedStatus) return false;
            if (selectedPriority !== 'all' && r.priority !== selectedPriority) return false;
            return true;
        });

        this.setData({ filteredRequests: filtered, stats });
    },

    setStatus(e) {
        this.setData({ selectedStatus: e.currentTarget.dataset.status }, () => {
            this.filterData();
        });
    },

    setPriority(e) {
        this.setData({ selectedPriority: e.currentTarget.dataset.priority }, () => {
            this.filterData();
        });
    },

    onAddRequest() {
        wx.showToast({ title: '新建工单', icon: 'none' });
    }
})
