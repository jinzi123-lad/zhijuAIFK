// pages/landlord/inspection/index.js
const mockInspections = [
    {
        id: 1,
        propertyTitle: "阳光花园 302室",
        date: "2024-12-20",
        time: "10:00",
        type: "routine",
        typeLabel: "常规检查",
        typeClass: "bg-primary-10",
        status: "scheduled",
        inspector: "张经理",
        tenant: "张三",
    },
    {
        id: 2,
        propertyTitle: "翠湖雅苑 12栋201",
        date: "2024-12-20",
        time: "14:30",
        type: "complaint",
        typeLabel: "投诉处理",
        typeClass: "bg-destructive-10",
        status: "scheduled",
        inspector: "李经理",
        tenant: "王五",
        notes: "租客投诉邻居噪音，需现场了解情况",
    },
    {
        id: 3,
        propertyTitle: "东方明珠 B区803",
        date: "2024-12-22",
        time: "09:00",
        type: "move_in",
        typeLabel: "入住检查",
        typeClass: "bg-success-10",
        status: "scheduled",
        inspector: "张经理",
        tenant: "赵六",
    },
    {
        id: 4,
        propertyTitle: "碧水豪庭 A座1501",
        date: "2024-12-18",
        time: "15:00",
        type: "routine",
        typeLabel: "常规检查",
        typeClass: "bg-primary-10",
        status: "completed",
        inspector: "李经理",
        tenant: "李四",
    },
];

Page({
    data: {
        viewMode: 'calendar',
        currentDate: new Date().toISOString(), // Simpler ref
        year: 2024,
        month: 12,
        calendarDays: [],
        allInspections: mockInspections,
        todayInspections: [],
        upcomingInspections: [],
        stats: { scheduled: 0, completed: 0, upcoming: 0 }
    },

    onLoad() {
        this.initCalendar();
        this.processData();
    },

    processData() {
        const { allInspections } = this.data;
        const todayStr = "2024-12-20"; // Mock today 

        const todayList = allInspections.filter(i => i.date === todayStr);
        const upcomingList = allInspections.filter(i => i.date > todayStr && i.status === 'scheduled');

        const stats = {
            scheduled: allInspections.filter(i => i.status === 'scheduled').length,
            completed: allInspections.filter(i => i.status === 'completed').length,
            upcoming: upcomingList.length
        };

        this.setData({
            todayInspections: todayList,
            upcomingInspections: upcomingList,
            stats
        });

        // Mark calendar days
        this.generateCalendarGrid();
    },

    initCalendar() {
        // Just mock Dec 2024
        this.setData({ year: 2024, month: 12 });
        this.generateCalendarGrid();
    },

    generateCalendarGrid() {
        // Dec 2024 starts on Sunday (1st)
        // 31 Days
        const days = [];
        // Empty slots for start of month? Dec 1 2024 is Sunday, so 0 padding
        for (let i = 0; i < 0; i++) days.push({ day: null });

        for (let i = 1; i <= 31; i++) {
            const dateStr = `2024-12-${String(i).padStart(2, '0')}`;
            const isToday = (i === 20); // Mock today
            const hasTask = this.data.allInspections.some(ins => ins.date === dateStr);

            days.push({ day: i, isToday, hasTask });
        }
        this.setData({ calendarDays: days });
    },

    changeMonth(e) {
        // Mock logic implies just flip, but we only have mock data for Dec
        wx.showToast({ title: '切换月份', icon: 'none' });
    },

    setViewMode(e) {
        this.setData({ viewMode: e.currentTarget.dataset.mode });
    },

    onAddInspection() {
        wx.showToast({ title: '新建预约', icon: 'none' });
    }
})
