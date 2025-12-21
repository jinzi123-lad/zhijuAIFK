"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  CalendarIcon,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  CheckCircle,
  AlertCircle,
} from "lucide-react"

interface Inspection {
  id: number
  propertyId: number
  propertyTitle: string
  date: string
  time: string
  type: "routine" | "move_in" | "move_out" | "complaint"
  status: "scheduled" | "completed" | "cancelled"
  inspector?: string
  notes?: string
  tenant?: string
}

export function InspectionSchedule() {
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar")

  const inspections: Inspection[] = [
    {
      id: 1,
      propertyId: 1,
      propertyTitle: "阳光花园 302室",
      date: "2024-12-20",
      time: "10:00",
      type: "routine",
      status: "scheduled",
      inspector: "张经理",
      tenant: "张三",
    },
    {
      id: 2,
      propertyId: 3,
      propertyTitle: "翠湖雅苑 12栋201",
      date: "2024-12-20",
      time: "14:30",
      type: "complaint",
      status: "scheduled",
      inspector: "李经理",
      tenant: "王五",
      notes: "租客投诉邻居噪音，需现场了解情况",
    },
    {
      id: 3,
      propertyId: 5,
      propertyTitle: "东方明珠 B区803",
      date: "2024-12-22",
      time: "09:00",
      type: "move_in",
      status: "scheduled",
      inspector: "张经理",
      tenant: "赵六",
    },
    {
      id: 4,
      propertyId: 2,
      propertyTitle: "碧水豪庭 A座1501",
      date: "2024-12-18",
      time: "15:00",
      type: "routine",
      status: "completed",
      inspector: "李经理",
      tenant: "李四",
      notes: "房屋状况良好，已完成常规检查",
    },
  ]

  const typeLabels = {
    routine: "常规检查",
    move_in: "入住检查",
    move_out: "退租检查",
    complaint: "投诉处理",
  }

  const statusLabels = {
    scheduled: "待查房",
    completed: "已完成",
    cancelled: "已取消",
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "routine":
        return "bg-primary/10 text-primary"
      case "move_in":
        return "bg-success/10 text-success"
      case "move_out":
        return "bg-warning/10 text-warning"
      case "complaint":
        return "bg-destructive/10 text-destructive"
      default:
        return "bg-muted/20 text-muted-foreground"
    }
  }

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const changeMonth = (offset: number) => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + offset, 1))
  }

  const getInspectionsForDate = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0]
    return inspections.filter((i) => i.date === dateStr)
  }

  const todayInspections = getInspectionsForDate(new Date())
  const upcomingInspections = inspections
    .filter((i) => new Date(i.date) > new Date() && i.status === "scheduled")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const daysInMonth = getDaysInMonth(selectedDate)
  const firstDay = getFirstDayOfMonth(selectedDate)
  const calendarDays = []

  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null)
  }

  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day)
  }

  return (
    <div className="min-h-screen pb-6">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-light border-b border-white/30 px-4 py-3">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <Button variant="ghost" size="icon" className="w-9 h-9 rounded-full" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold text-primary">查房预约</h1>
          <Button
            onClick={() => {
              /* Create new inspection */
            }}
            size="icon"
            className="w-9 h-9 rounded-full bg-primary hover:bg-primary/90"
          >
            <Plus className="w-5 h-5 text-white" />
          </Button>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 pt-6 space-y-5">
        {/* View Mode Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("calendar")}
            className={`flex-1 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              viewMode === "calendar"
                ? "bg-primary text-white shadow-md"
                : "glass-card text-muted-foreground hover:text-foreground"
            }`}
          >
            <CalendarIcon className="w-4 h-4 inline mr-2" />
            日历视图
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`flex-1 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              viewMode === "list"
                ? "bg-primary text-white shadow-md"
                : "glass-card text-muted-foreground hover:text-foreground"
            }`}
          >
            列表视图
          </button>
        </div>

        {viewMode === "calendar" ? (
          <>
            {/* Calendar Header */}
            <div className="glass-card rounded-2xl p-4 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full" onClick={() => changeMonth(-1)}>
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <h2 className="text-base font-semibold text-foreground">
                  {selectedDate.getFullYear()}年 {selectedDate.getMonth() + 1}月
                </h2>
                <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full" onClick={() => changeMonth(1)}>
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>

              {/* Weekday Headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {["日", "一", "二", "三", "四", "五", "六"].map((day) => (
                  <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => {
                  if (!day) {
                    return <div key={index} className="aspect-square" />
                  }

                  const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day)
                  const dateInspections = getInspectionsForDate(date)
                  const isToday = date.toDateString() === new Date().toDateString()
                  const hasInspections = dateInspections.length > 0

                  return (
                    <button
                      key={index}
                      className={`aspect-square rounded-lg text-sm font-medium transition-all relative ${
                        isToday
                          ? "bg-primary text-white shadow-md"
                          : hasInspections
                            ? "bg-accent/20 text-foreground hover:bg-accent/30"
                            : "text-foreground/70 hover:bg-muted/20"
                      }`}
                    >
                      {day}
                      {hasInspections && !isToday && (
                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                          {dateInspections.slice(0, 3).map((_, i) => (
                            <div key={i} className="w-1 h-1 rounded-full bg-primary" />
                          ))}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Today's Inspections */}
            {todayInspections.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 px-1">今日查房</h3>
                <div className="space-y-3">
                  {todayInspections.map((inspection) => (
                    <button
                      key={inspection.id}
                      onClick={() => router.push(`/inspections/${inspection.id}`)}
                      className="w-full glass-card rounded-2xl p-4 shadow-md hover:shadow-lg transition-shadow text-left group"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-foreground mb-1">{inspection.propertyTitle}</h4>
                          <p className="text-xs text-muted-foreground">租客: {inspection.tenant}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(inspection.type)}`}>
                          {typeLabels[inspection.type]}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{inspection.time}</span>
                        </div>
                        {inspection.inspector && (
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span>{inspection.inspector}</span>
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="glass-card rounded-xl p-3 shadow-md">
                <div className="text-2xl font-bold text-warning mb-1">
                  {inspections.filter((i) => i.status === "scheduled").length}
                </div>
                <div className="text-xs text-muted-foreground">待查房</div>
              </div>
              <div className="glass-card rounded-xl p-3 shadow-md">
                <div className="text-2xl font-bold text-success mb-1">
                  {inspections.filter((i) => i.status === "completed").length}
                </div>
                <div className="text-xs text-muted-foreground">已完成</div>
              </div>
              <div className="glass-card rounded-xl p-3 shadow-md">
                <div className="text-2xl font-bold text-primary mb-1">{upcomingInspections.length}</div>
                <div className="text-xs text-muted-foreground">即将进行</div>
              </div>
            </div>

            {/* Upcoming Inspections */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3 px-1">即将查房</h3>
              <div className="space-y-3">
                {upcomingInspections.map((inspection) => (
                  <button
                    key={inspection.id}
                    onClick={() => router.push(`/inspections/${inspection.id}`)}
                    className="w-full glass-card rounded-2xl p-4 shadow-md hover:shadow-lg transition-shadow text-left group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-foreground mb-1">{inspection.propertyTitle}</h4>
                        <p className="text-xs text-muted-foreground mb-2">租客: {inspection.tenant}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="w-3 h-3" />
                            <span>{new Date(inspection.date).toLocaleDateString("zh-CN")}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{inspection.time}</span>
                          </div>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(inspection.type)}`}>
                        {typeLabels[inspection.type]}
                      </span>
                    </div>
                    {inspection.inspector && (
                      <div className="flex items-center gap-2 pt-3 border-t border-white/20 text-xs">
                        <User className="w-3 h-3 text-muted-foreground" />
                        <span className="text-muted-foreground">负责人:</span>
                        <span className="text-primary font-medium">{inspection.inspector}</span>
                      </div>
                    )}
                    {inspection.notes && (
                      <div className="flex items-start gap-2 mt-2 p-2 bg-warning/10 rounded-lg">
                        <AlertCircle className="w-3 h-3 text-warning flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-warning flex-1">{inspection.notes}</p>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Completed Inspections */}
            {inspections.filter((i) => i.status === "completed").length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 px-1">已完成</h3>
                <div className="space-y-3">
                  {inspections
                    .filter((i) => i.status === "completed")
                    .map((inspection) => (
                      <button
                        key={inspection.id}
                        onClick={() => router.push(`/inspections/${inspection.id}`)}
                        className="w-full glass-card rounded-2xl p-4 shadow-md hover:shadow-lg transition-shadow text-left group opacity-70 hover:opacity-100"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold text-foreground mb-1">{inspection.propertyTitle}</h4>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <CalendarIcon className="w-3 h-3" />
                                <span>{new Date(inspection.date).toLocaleDateString("zh-CN")}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <CheckCircle className="w-3 h-3 text-success" />
                                <span className="text-success">已完成</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        {inspection.notes && <p className="text-xs text-muted-foreground mt-2">{inspection.notes}</p>}
                      </button>
                    ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
