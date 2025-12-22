// 租客-我的预约列表页
const app = getApp()

Page({
    data: {
        appointments: [],
        loading: true
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
            // TODO: 从Supabase加载我的预约
            const mockData = [
                {
                    id: '1',
                    propertyTitle: '阳光花园302室',
                    propertyImage: '',
                    date: '2024-12-25',
                    time: '下午',
                    status: 'pending',
                    statusText: '待确认',
                    landlordName: '张先生'
                },
                {
                    id: '2',
                    propertyTitle: '翠湖雅苑101',
                    propertyImage: '',
                    date: '2024-12-26',
                    time: '上午',
                    status: 'confirmed',
                    statusText: '已确认',
                    landlordName: '李女士'
                }
            ]
            this.setData({ appointments: mockData, loading: false })
        } catch (err) {
            console.error('加载预约失败', err)
            this.setData({ loading: false })
        }
    },

    // 查看房源详情
    goToProperty(e) {
        const id = e.currentTarget.dataset.propertyId
        wx.navigateTo({ url: `/pages/tenant/property/detail/index?id=${id}` })
    },

    // 取消预约
    cancelAppointment(e) {
        const id = e.currentTarget.dataset.id
        wx.showModal({
            title: '取消预约',
            content: '确定要取消此预约吗？',
            success: async (res) => {
                if (res.confirm) {
                    wx.showLoading({ title: '取消中...' })
                    try {
                        // TODO: 更新Supabase
                        wx.hideLoading()
                        wx.showToast({ title: '已取消', icon: 'success' })
                        this.loadAppointments()
                    } catch (err) {
                        wx.hideLoading()
                        wx.showToast({ title: '操作失败', icon: 'none' })
                    }
                }
            }
        })
    },

    // 同意改期
    agreeReschedule(e) {
        const id = e.currentTarget.dataset.id
        wx.showModal({
            title: '同意改期',
            content: '确定同意房东提出的新时间？',
            success: async (res) => {
                if (res.confirm) {
                    wx.showLoading({ title: '处理中...' })
                    try {
                        // TODO: 更新Supabase
                        wx.hideLoading()
                        wx.showToast({ title: '已同意', icon: 'success' })
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
