"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Wrench,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronRight,
  ImageIcon,
  User,
} from "lucide-react"
import type { MaintenanceRequest } from "@/types/property"

export function MaintenanceManagement() {
  const router = useRouter()
  const [selectedStatus, setSelectedStatus] = useState<"all" | "pending" | "in_progress" | "completed">("all")
  const [selectedPriority, setSelectedPriority] = useState<"all" | "urgent" | "high" | "medium" | "low">("all")

  const maintenanceRequests: (MaintenanceRequest & { propertyTitle: string })[] = [
    {
      id: 1,
      propertyId: 3,
      propertyTitle: "翠湖雅苑 12栋201",
      title: "卫生间漏水",
      description: "主卧卫生间天花板漏水，需要立即处理",
      category: "plumbing",
      priority: "urgent",
      status: "in_progress",
      reportedBy: "王五 (租客)",
      reportedDate: "2024-12-18 14:30",
      assignedTo: "李师傅",
      images: ["/bathroom-leak.jpg"],
    },
    {
      id: 2,
      propertyId: 1,
      propertyTitle: "阳光花园 302室",
      title: "空调不制冷",
      description: "客厅空调开启后不制冷，疑似缺氟",
      category: "appliance",
      priority: "high",
      status: "pending",
      reportedBy: "张三 (租客)",
      reportedDate: "2024-12-19 09:15",
    },
    {
      id: 3,
      propertyId: 5,
      propertyTitle: "东方明珠 B区803",
      title: "电灯不亮",
      description: "次卧灯泡坏了，需要更换",
      category: "electrical",
      priority: "low",
      status: "pending",
      reportedBy: "赵六 (租客)",
      reportedDate: "2024-12-19 16:20",
    },
    {
      id: 4,
      propertyId: 2,
      propertyTitle: "碧水豪庭 A座1501",
      title: "门锁损坏",
      description: "入户门锁打不开，已更换为新锁",
      category: "structure",
      priority: "urgent",
      status: "completed",
      reportedBy: "李四 (租客)",
      reportedDate: "2024-12-15 10:00",
      assignedTo: "王师傅",
      completedDate: "2024-12-15 15:30",
      cost: 280,
      images: ["/door-lock.jpg"],
    },
  ]

  const categoryLabels = {
    plumbing: "水管",
    electrical: "电路",
    appliance: "电器",
    structure: "结构",
    other: "其他",
  }

  const priorityLabels = {
    urgent: "紧急",
    high: "高",
    medium: "中",
    low: "低",
  }

  const statusLabels = {
    pending: "待处理",
    in_progress: "处理中",
    completed: "已完成",
    cancelled: "已取消",
  }

  const filteredRequests = maintenanceRequests.filter((request) => {
    if (selectedStatus !== "all" && request.status !== selectedStatus) return false
    if (selectedPriority !== "all" && request.priority !== selectedPriority) return false
    return true
  })

  const stats = {
    total: maintenanceRequests.length,
    pending: maintenanceRequests.filter((r) => r.status === "pending").length,
    in_progress: maintenanceRequests.filter((r) => r.status === "in_progress").length,
    completed: maintenanceRequests.filter((r) => r.status === "completed").length,
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "text-destructive bg-destructive/10"
      case "high":
        return "text-warning bg-warning/10"
      case "medium":
        return "text-primary bg-primary/10"
      case "low":
        return "text-muted-foreground bg-muted/20"
      default:
        return "text-muted-foreground bg-muted/20"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />
      case "in_progress":
        return <Wrench className="w-4 h-4" />
      case "completed":
        return <CheckCircle className="w-4 h-4" />
      case "cancelled":
        return <XCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen pb-6">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-light border-b border-white/30 px-4 py-3">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <Button variant="ghost" size="icon" className="w-9 h-9 rounded-full" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold text-primary">维修工单</h1>
          <Button
            onClick={() => {
              /* Create new maintenance request */
            }}
            size="icon"
            className="w-9 h-9 rounded-full bg-primary hover:bg-primary/90"
          >
            <Plus className="w-5 h-5 text-white" />
          </Button>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 pt-6 space-y-5">
        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => setSelectedStatus("all")}
            className={`glass-card rounded-xl p-3 shadow-md transition-all ${
              selectedStatus === "all" ? "ring-2 ring-primary" : ""
            }`}
          >
            <div className="text-2xl font-bold text-foreground mb-1">{stats.total}</div>
            <div className="text-xs text-muted-foreground">全部</div>
          </button>
          <button
            onClick={() => setSelectedStatus("pending")}
            className={`glass-card rounded-xl p-3 shadow-md transition-all ${
              selectedStatus === "pending" ? "ring-2 ring-warning" : ""
            }`}
          >
            <div className="text-2xl font-bold text-warning mb-1">{stats.pending}</div>
            <div className="text-xs text-muted-foreground">待处理</div>
          </button>
          <button
            onClick={() => setSelectedStatus("in_progress")}
            className={`glass-card rounded-xl p-3 shadow-md transition-all ${
              selectedStatus === "in_progress" ? "ring-2 ring-primary" : ""
            }`}
          >
            <div className="text-2xl font-bold text-primary mb-1">{stats.in_progress}</div>
            <div className="text-xs text-muted-foreground">处理中</div>
          </button>
          <button
            onClick={() => setSelectedStatus("completed")}
            className={`glass-card rounded-xl p-3 shadow-md transition-all ${
              selectedStatus === "completed" ? "ring-2 ring-success" : ""
            }`}
          >
            <div className="text-2xl font-bold text-success mb-1">{stats.completed}</div>
            <div className="text-xs text-muted-foreground">已完成</div>
          </button>
        </div>

        {/* Priority Filter */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {(["all", "urgent", "high", "medium", "low"] as const).map((priority) => (
            <button
              key={priority}
              onClick={() => setSelectedPriority(priority)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                selectedPriority === priority
                  ? "bg-primary text-white shadow-md"
                  : "glass-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {priority === "all" ? "全部优先级" : priorityLabels[priority]}
            </button>
          ))}
        </div>

        {/* Maintenance Requests List */}
        <div className="space-y-3">
          {filteredRequests.map((request) => (
            <button
              key={request.id}
              onClick={() => router.push(`/maintenance/${request.id}`)}
              className="w-full glass-card rounded-2xl p-4 shadow-md hover:shadow-lg transition-shadow text-left group"
            >
              <div className="flex items-start gap-3 mb-3">
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-xl ${getPriorityColor(request.priority)} flex items-center justify-center`}
                >
                  {request.priority === "urgent" ? (
                    <AlertTriangle className="w-5 h-5" />
                  ) : (
                    <Wrench className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="text-sm font-semibold text-foreground">{request.title}</h3>
                    <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2" />
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{request.propertyTitle}</p>
                  <p className="text-xs text-foreground/80 line-clamp-2">{request.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap mb-3">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}
                >
                  {priorityLabels[request.priority]}
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    request.status === "completed"
                      ? "bg-success/10 text-success"
                      : request.status === "in_progress"
                        ? "bg-primary/10 text-primary"
                        : "bg-warning/10 text-warning"
                  }`}
                >
                  {getStatusIcon(request.status)}
                  {statusLabels[request.status]}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-muted/20 text-muted-foreground">
                  {categoryLabels[request.category]}
                </span>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/20 text-xs">
                <div className="flex items-center gap-4 text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>{request.reportedBy}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(request.reportedDate).toLocaleDateString("zh-CN")}</span>
                  </div>
                  {request.images && request.images.length > 0 && (
                    <div className="flex items-center gap-1">
                      <ImageIcon className="w-3 h-3" />
                      <span>{request.images.length}</span>
                    </div>
                  )}
                </div>
                {request.assignedTo && <span className="text-primary font-medium">负责人: {request.assignedTo}</span>}
              </div>

              {request.status === "completed" && request.cost && (
                <div className="mt-2 text-xs text-success font-medium">维修费用: ¥{request.cost}</div>
              )}
            </button>
          ))}
        </div>

        {filteredRequests.length === 0 && (
          <div className="glass-card rounded-2xl p-12 text-center">
            <Wrench className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-sm text-muted-foreground">暂无维修工单</p>
          </div>
        )}
      </div>
    </div>
  )
}
