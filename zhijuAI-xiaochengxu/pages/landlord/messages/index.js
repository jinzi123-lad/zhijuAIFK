// 房东-消息中心页面
const app = getApp()
const { supabase } = require('../../../utils/supabase')

Page({
    data: {
        messages: [],
        loading: true,
        unreadCount: 0,
        tabs: [
            { key: 'all', label: '全部' },
            { key: 'system', label: '系统通知' },
            { key: 'tenant', label: '租客消息' },
            { key: 'payment', label: '收款提醒' }
        ],
        currentTab: 'all'
    },

    onLoad() {
        this.loadMessages()
    },

    onShow() {
        this.loadMessages()
    },

    onPullDownRefresh() {
        this.loadMessages().then(() => {
            wx.stopPullDownRefresh()
        })
    },

    async loadMessages() {
        this.setData({ loading: true })

        // messages表暂不存在，直接使用模拟数据
        const messages = this.getMockMessages()
        const unreadCount = messages.filter(m => !m.is_read).length
        this.setData({ messages, unreadCount, loading: false })
    },

    getMockMessages() {
        return [
            { id: 1, title: '新预约通知', content: '张三预约了阳光花园302室看房', type: 'tenant', is_read: false, created_at: new Date().toISOString() },
            { id: 2, title: '收款提醒', content: '李四的12月租金已到账', type: 'payment', is_read: true, created_at: new Date(Date.now() - 86400000).toISOString() },
            { id: 3, title: '系统通知', content: '您的实名认证已通过', type: 'system', is_read: true, created_at: new Date(Date.now() - 172800000).toISOString() }
        ].map(m => ({
            ...m,
            timeText: this.formatTime(m.created_at),
            typeIcon: this.getTypeIcon(m.type)
        }))
    },

    formatTime(dateStr) {
        const date = new Date(dateStr)
        const now = new Date()
        const diff = now - date
        if (diff < 60000) return '刚刚'
        if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前'
        if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前'
        if (diff < 604800000) return Math.floor(diff / 86400000) + '天前'
        return date.toLocaleDateString()
    },

    getTypeIcon(type) {
        const icons = {
            'system': '🔔',
            'tenant': '👤',
            'payment': '💰',
            'repair': '🔧'
        }
        return icons[type] || '📬'
    },

    switchTab(e) {
        const tab = e.currentTarget.dataset.tab
        this.setData({ currentTab: tab })
    },

    goToDetail(e) {
        const id = e.currentTarget.dataset.id
        // 标记已读
        this.markAsRead(id)
        wx.showToast({ title: '查看消息详情', icon: 'none' })
    },

    async markAsRead(id) {
        try {
            await supabase
                .from('messages')
                .update({ is_read: true })
                .eq('id', id)
                .exec()

            // 更新本地状态
            const messages = this.data.messages.map(m =>
                m.id === id ? { ...m, is_read: true } : m
            )
            const unreadCount = messages.filter(m => !m.is_read).length
            this.setData({ messages, unreadCount })
        } catch (err) {
            console.error('标记已读失败', err)
        }
    },

    markAllRead() {
        const messages = this.data.messages.map(m => ({ ...m, is_read: true }))
        this.setData({ messages, unreadCount: 0 })
        wx.showToast({ title: '全部已读', icon: 'success' })
    }
})
