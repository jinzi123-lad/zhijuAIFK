// 房东首页
const { supabase } = require('../../../utils/supabase');

Page({
    data: {
        stats: {
            total: 0,
            occupied: 0,
            vacant: 0
        },
        mainFunctions: [
            { iconName: 'users', iconColor: '#4ECDC4', label: "租客管理", bgClass: "bg-cyan-light", path: "/pages/landlord/tenant/list/index" },
            { iconName: 'dollar', iconColor: '#FFD93D', label: "财务报表", bgClass: "bg-yellow-light", path: "/pages/landlord/finance/index" },
            { iconName: 'file', iconColor: '#95E1D3', label: "电子合同", bgClass: "bg-teal-light", path: "/pages/landlord/contract/index" },
            { iconName: 'wrench', iconColor: '#A8DADC', label: "维修工单", bgClass: "bg-blue-light", path: "/pages/landlord/maintenance/index" },
            { iconName: 'calendar', iconColor: '#F38181', label: "预约看房", bgClass: "bg-red-light", path: "/pages/landlord/viewing/list/index" },
            { iconName: 'chart', iconColor: '#6C5CE7', label: "收入趋势", bgClass: "bg-purple-light", path: "/pages/landlord/revenue/index" },
            { iconName: 'bar', iconColor: '#FF6B9D', label: "经营分析", bgClass: "bg-pink-light", path: "/pages/landlord/analytics/index" },
            { iconName: 'users', iconColor: '#A29BFE', label: "团队管理", bgClass: "bg-indigo-light", path: "/pages/landlord/team/index" },
        ],
        todos: []
    },

    onLoad() {
        wx.hideTabBar();
    },

    onShow() {
        // 检查是否已实名认证
        this.checkVerification();
        this.fetchStats();
        this.fetchTodos();
    },

    // 检查实名认证状态
    checkVerification() {
        const isVerified = wx.getStorageSync('is_verified');

        if (!isVerified) {
            // 未实名认证，显示提示并跳转
            wx.showModal({
                title: '实名认证',
                content: '为保障您的权益，请先完成实名认证后再使用',
                showCancel: false,
                confirmText: '去认证',
                success: () => {
                    wx.navigateTo({
                        url: '/pages/landlord/profile/verify/index'
                    });
                }
            });
        }
    },

    // 获取房东UUID（用于查询数据库）
    getLandlordUuid() {
        // 优先使用UUID，如果没有则使用固定测试UUID
        return wx.getStorageSync('landlord_uuid') || '11111111-1111-1111-1111-111111111111';
    },

    async fetchStats() {
        const landlordUuid = this.getLandlordUuid();

        try {
            const { data, error } = await supabase
                .from('properties')
                .select('id, status')
                .eq('landlord_id', landlordUuid)
                .range(0, 99)
                .exec();

            if (error) {
                console.error('获取房源统计失败', error);
                return;
            }

            const properties = data || [];
            const total = properties.length;
            const occupied = properties.filter(p => p.status === 'rented' || p.status === 'occupied').length;
            const vacant = properties.filter(p => p.status === 'available' || p.status === 'vacant' || !p.status).length;

            this.setData({ stats: { total, occupied, vacant } });
        } catch (err) {
            console.error('获取房源统计失败', err);
        }
    },

    async fetchTodos() {
        const landlordUuid = this.getLandlordUuid();
        const todos = [];

        try {
            // 1. 待处理预约
            const { data: viewings } = await supabase
                .from('viewing_appointments')
                .select('id, guest_name, appointment_date, status')
                .eq('landlord_id', landlordUuid)
                .eq('status', 'pending')
                .range(0, 9)
                .order('created_at', { ascending: false })
                .exec();

            if (viewings && viewings.length > 0) {
                viewings.forEach(v => {
                    todos.push({
                        id: 'viewing-' + v.id,
                        iconName: 'calendar',
                        title: `${v.guest_name || '访客'} 预约看房`,
                        description: `预约日期：${v.appointment_date}`,
                        time: '待确认',
                        urgent: false,
                        path: '/pages/landlord/viewing/list/index'
                    });
                });
            }

            // 2. 待处理报修
            const { data: repairs } = await supabase
                .from('repair_orders')
                .select('id, title, priority, created_at')
                .eq('landlord_id', landlordUuid)
                .eq('status', 'pending')
                .range(0, 9)
                .order('created_at', { ascending: false })
                .exec();

            if (repairs && repairs.length > 0) {
                repairs.forEach(r => {
                    todos.push({
                        id: 'repair-' + r.id,
                        iconName: 'wrench',
                        title: r.title,
                        description: r.priority === 'high' ? '紧急维修' : '普通维修',
                        time: this.formatTime(r.created_at),
                        urgent: r.priority === 'high' || r.priority === 'urgent',
                        path: '/pages/landlord/maintenance/index'
                    });
                });
            }

            // 3. 逾期账单
            const { data: overduePayments } = await supabase
                .from('payments')
                .select('id, amount, due_date')
                .eq('landlord_id', landlordUuid)
                .eq('status', 'overdue')
                .range(0, 9)
                .order('due_date', { ascending: true })
                .exec();

            if (overduePayments && overduePayments.length > 0) {
                overduePayments.forEach(p => {
                    todos.push({
                        id: 'payment-' + p.id,
                        iconName: 'alert',
                        title: `租金逾期 ¥${p.amount}`,
                        description: `应付日期：${p.due_date}`,
                        time: '逾期',
                        urgent: true,
                        path: '/pages/landlord/finance/index'
                    });
                });
            }

            this.setData({ todos: todos.slice(0, 5) });
        } catch (err) {
            console.error('获取待办失败', err);
            this.setData({ todos: [] });
        }
    },

    formatTime(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) return `${diffMins}分钟前`;
        if (diffHours < 24) return `${diffHours}小时前`;
        if (diffDays < 7) return `${diffDays}天前`;
        return date.toLocaleDateString('zh-CN');
    },

    navToProperties() {
        wx.navigateTo({ url: '/pages/landlord/property/list/index' });
    },

    navTo(e) {
        const path = e.currentTarget.dataset.path;
        wx.navigateTo({
            url: path,
            fail: () => {
                wx.showToast({ title: '功能开发中', icon: 'none' });
            }
        });
    },

    handleTodo(e) {
        const path = e.currentTarget.dataset.path;
        if (path) {
            wx.navigateTo({ url: path });
        }
    }
})
