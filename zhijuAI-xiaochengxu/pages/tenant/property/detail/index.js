// 租客-房源详情页
const app = getApp()

Page({
    data: {
        property: null,
        loading: true,
        showAppointmentModal: false,
        appointmentDate: '',
        appointmentTime: '',
        appointmentNotes: ''
    },

    onLoad(options) {
        if (options.id) {
            this.loadProperty(options.id)
        }
    },

    async loadProperty(id) {
        this.setData({ loading: true })
        try {
            // TODO: 从Supabase加载房源详情
            const mockData = {
                id: id,
                title: '阳光花园精装两居室',
                price: 3500,
                deposit: 7000,
                layout: '2室1厅1卫',
                area: 85,
                floor: '6/18层',
                location: '朝阳区',
                address: '阳光花园3号楼302室',
                description: '精装修，南北通透，采光好...',
                images: [],
                facilities: ['空调', '热水器', '洗衣机', '冰箱', 'WiFi'],
                landlord: { name: '张先生', verified: true },
                certified: true
            }
            this.setData({ property: mockData, loading: false })
        } catch (err) {
            console.error('加载失败', err)
            this.setData({ loading: false })
        }
    },

    // 打开预约弹窗
    openAppointment() {
        this.setData({ showAppointmentModal: true })
    },

    closeAppointment() {
        this.setData({ showAppointmentModal: false })
    },

    onDateChange(e) {
        this.setData({ appointmentDate: e.detail.value })
    },

    onTimeChange(e) {
        const times = ['上午', '下午', '晚上']
        this.setData({ appointmentTime: times[e.detail.value] })
    },

    onNotesInput(e) {
        this.setData({ appointmentNotes: e.detail.value })
    },

    // 提交预约
    async submitAppointment() {
        const { property, appointmentDate, appointmentTime, appointmentNotes } = this.data
        if (!appointmentDate || !appointmentTime) {
            wx.showToast({ title: '请选择时间', icon: 'none' })
            return
        }

        wx.showLoading({ title: '提交中...' })
        try {
            // TODO: 提交到Supabase
            console.log('预约信息:', { propertyId: property.id, appointmentDate, appointmentTime, appointmentNotes })

            wx.hideLoading()
            wx.showToast({ title: '预约成功', icon: 'success' })
            this.setData({ showAppointmentModal: false })
        } catch (err) {
            wx.hideLoading()
            wx.showToast({ title: '预约失败', icon: 'none' })
        }
    }
})
