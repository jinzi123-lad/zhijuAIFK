// 房东-验房管理页面
const app = getApp()
const { supabase } = require('../../../utils/supabase')

Page({
    data: {
        viewMode: 'calendar',
        year: 2024,
        month: 12,
        calendarDays: [],
        inspections: [],
        todayInspections: [],
        upcomingInspections: [],
        loading: true,
        stats: { scheduled: 0, completed: 0, upcoming: 0 }
    },

    onLoad() {
        const now = new Date()
        this.setData({ year: now.getFullYear(), month: now.getMonth() + 1 })
        this.loadInspections()
    },

    onShow() {
        this.loadInspections()
    },

    async loadInspections() {
        const landlordId = wx.getStorageSync('landlord_id')
        this.setData({ loading: true })

        try {
            // 从viewing_appointments加载（带状态completed的可作为验房记录）
            const { data, error } = await supabase
                .from('viewing_appointments')
                .select('*')
                .eq('landlord_id', landlordId)
                .order('appointment_date', { ascending: true })
                .exec()

            if (error) {
                console.error('加载失败', error)
                this.setData({ loading: false })
                return
            }

            const todayStr = new Date().toISOString().split('T')[0]
            const typeLabels = {
                'move_in': '入住检查',
                'move_out': '退房检查',
                'routine': '常规检查',
                'complaint': '投诉处理'
            }

            const inspections = (data || []).map(i => ({
                ...i,
                typeLabel: typeLabels[i.inspection_type] || '看房预约',
                typeClass: i.inspection_type === 'complaint' ? 'bg-destructive-10' :
                    i.inspection_type === 'move_in' ? 'bg-success-10' : 'bg-primary-10'
            }))

            const todayList = inspections.filter(i => i.appointment_date === todayStr)
            const upcomingList = inspections.filter(i =>
                i.appointment_date > todayStr && i.status !== 'cancelled'
            )

            const stats = {
                scheduled: inspections.filter(i => i.status === 'confirmed').length,
                completed: inspections.filter(i => i.status === 'completed').length,
                upcoming: upcomingList.length
            }

            this.setData({ inspections, todayInspections: todayList, upcomingInspections: upcomingList, stats, loading: false })
            this.generateCalendarGrid()
        } catch (err) {
            console.error('加载失败', err)
            this.setData({ loading: false })
        }
    },

    generateCalendarGrid() {
        const { year, month, inspections } = this.data
        const firstDay = new Date(year, month - 1, 1).getDay()
        const daysInMonth = new Date(year, month, 0).getDate()
        const todayStr = new Date().toISOString().split('T')[0]
        const days = []

        // 添加空白天
        for (let i = 0; i < firstDay; i++) {
            days.push({ day: null })
        }

        // 添加日期
        for (let i = 1; i <= daysInMonth; i++) {
            const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(i).padStart(2, '0')}`
            const isToday = dateStr === todayStr
            const hasTask = inspections.some(ins => ins.appointment_date === dateStr)
            days.push({ day: i, isToday, hasTask, dateStr })
        }

        this.setData({ calendarDays: days })
    },

    changeMonth(e) {
        const direction = e.currentTarget.dataset.direction
        let { year, month } = this.data
        if (direction === 'prev') {
            month--
            if (month < 1) { month = 12; year-- }
        } else {
            month++
            if (month > 12) { month = 1; year++ }
        }
        this.setData({ year, month })
        this.generateCalendarGrid()
    },

    setViewMode(e) {
        this.setData({ viewMode: e.currentTarget.dataset.mode })
    },

    onAddInspection() {
        wx.showToast({ title: '新建验房预约开发中', icon: 'none' })
    }
})
