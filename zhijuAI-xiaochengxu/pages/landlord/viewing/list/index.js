// 房东-预约管理列表页
const app = getApp()

Page({
    data: {
        appointments: [],
        loading: true,
        currentTab: 'pending' // pending/confirmed/completed/cancelled
    },

    onLoad() {
        this.loadAppointments()
    },

    onShow() {
        this.loadAppointments()
    },

    async loadAppointments() {
        this.setData({ loading: true })
        try {
            // TODO: 从Supabase加载预约
            const mockData = [
                {
                    id: '1',
                    propertyTitle: '阳光花园302室',
                    tenantName: '李小姐',
                    tenantPhone: '138****1234',
                    date: '2024-12-25',
                    time: '下午',
                    notes: '希望能看厨房',
                    status: 'pending',
                    createdAt: '2024-12-22 14:30'
                },
                {
                    id: '2',
                    propertyTitle: '翠湖雅苑101',
                    tenantName: '王先生',
                    tenantPhone: '139****5678',
                    date: '2024-12-26',
                    time: '上午',
                    notes: '',
                    status: 'confirmed',
                    createdAt: '2024-12-21 10:15'
                }
            ]
            this.setData({ appointments: mockData, loading: false })
        } catch (err) {
            console.error('加载预约失败', err)
            this.setData({ loading: false })
        }
    },

    switchTab(e) {
        const tab = e.currentTarget.dataset.tab
        this.setData({ currentTab: tab })
        this.loadAppointments()
    },

    goToDetail(e) {
        const id = e.currentTarget.dataset.id
        wx.navigateTo({ url: `/pages/landlord/viewing/detail/index?id=${id}` })
    },

    // 快速确认
    async confirmAppointment(e) {
        const id = e.currentTarget.dataset.id
        wx.showModal({
            title: '确认预约',
            content: '确定接受此预约？',
            success: async (res) => {
                if (res.confirm) {
                    wx.showLoading({ title: '处理中...' })
                    try {
                        // TODO: 更新Supabase
                        wx.hideLoading()
                        wx.showToast({ title: '已确认', icon: 'success' })
                        this.loadAppointments()
                    } catch (err) {
                        wx.hideLoading()
                        wx.showToast({ title: '操作失败', icon: 'none' })
                    }
                }
            }
        })
    }
})
