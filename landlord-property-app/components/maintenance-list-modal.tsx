"use client"

import { useState } from "react"
import { X, Wrench, Calendar, CheckCircle2, AlertTriangle, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { MaintenanceRequest } from "@/types/property"

interface MaintenanceListModalProps {
  isOpen: boolean
  onClose: () => void
  propertyId: number
  propertyTitle: string
  onAddMaintenance: () => void
}

const mockMaintenanceRequests: MaintenanceRequest[] = [
  {
    id: 1,
    propertyId: 1,
    title: "卫生间水龙头漏水",
    description: "主卧卫生间洗手盆水龙头一直在滴水",
    category: "plumbing",
    priority: "medium",
    status: "in_progress",
    reportedBy: "张伟",
    reportedDate: "2025-01-15",
    assignedTo: "李师傅",
  },
  {
    id: 2,
    propertyId: 1,
    title: "空调不制热",
    description: "客厅空调开启制热模式后不出热风",
    category: "appliance",
    priority: "high",
    status: "pending",
    reportedBy: "张伟",
    reportedDate: "2025-01-16",
  },
  {
    id: 3,
    propertyId: 1,
    title: "更换门锁",
    description: "定期更换入户门锁芯",
    category: "other",
    priority: "low",
    status: "completed",
    reportedBy: "房东",
    reportedDate: "2025-01-10",
    completedDate: "2025-01-12",
    cost: 150,
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
  low: "低",
  medium: "中",
  high: "高",
  urgent: "紧急",
}

const statusLabels = {
  pending: "待处理",
  in_progress: "处理中",
  completed: "已完成",
  cancelled: "已取消",
}

export function MaintenanceListModal({
  isOpen,
  onClose,
  propertyId,
  propertyTitle,
  onAddMaintenance,
}: MaintenanceListModalProps) {
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "in_progress" | "completed">("all")

  if (!isOpen) return null

  const filteredRequests =
    filterStatus === "all" ? mockMaintenanceRequests : mockMaintenanceRequests.filter((r) => r.status === filterStatus)

  const stats = {
    total: mockMaintenanceRequests.length,
    pending: mockMaintenanceRequests.filter((r) => r.status === "pending").length,
    inProgress: mockMaintenanceRequests.filter((r) => r.status === "in_progress").length,
    completed: mockMaintenanceRequests.filter((r) => r.status === "completed").length,
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "text-destructive bg-destructive/10"
      case "high":
        return "text-warning bg-warning/10"
      case "medium":
        return "text-primary bg-primary/10"
      default:
        return "text-muted-foreground bg-muted/10"
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-background/95 backdrop-blur-xl rounded-t-3xl sm:rounded-3xl shadow-2xl border border-white/20 max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom duration-300">
        <div className="sm:hidden flex justify-center pt-2 pb-1">
          <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
        </div>

        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div>
            <h2 className="text-lg font-semibold">维修记录</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{propertyTitle}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-muted/50 rounded-full transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* 统计卡片 */}
        <div className="p-4 border-b border-white/10">
          <div className="grid grid-cols-4 gap-2">
            <div className="glass-card p-3 rounded-xl text-center">
              <div className="text-xs text-muted-foreground mb-1">总计</div>
              <div className="text-lg font-bold">{stats.total}</div>
            </div>
            <div className="glass-card p-3 rounded-xl text-center border border-warning/20">
              <div className="text-xs text-muted-foreground mb-1">待处理</div>
              <div className="text-lg font-bold text-warning">{stats.pending}</div>
            </div>
            <div className="glass-card p-3 rounded-xl text-center border border-primary/20">
              <div className="text-xs text-muted-foreground mb-1">处理中</div>
              <div className="text-lg font-bold text-primary">{stats.inProgress}</div>
            </div>
            <div className="glass-card p-3 rounded-xl text-center border border-success/20">
              <div className="text-xs text-muted-foreground mb-1">已完成</div>
              <div className="text-lg font-bold text-success">{stats.completed}</div>
            </div>
          </div>
        </div>

        {/* 筛选器 */}
        <div className="px-4 py-3 flex gap-2 overflow-x-auto border-b border-white/10">
          {[
            { key: "all", label: "全部" },
            { key: "pending", label: "待处理" },
            { key: "in_progress", label: "处理中" },
            { key: "completed", label: "已完成" },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setFilterStatus(item.key as typeof filterStatus)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                filterStatus === item.key
                  ? "bg-primary text-primary-foreground"
                  : "glass-card hover:bg-muted/50 text-muted-foreground"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* 维修列表 */}
        <div className="p-4 space-y-3 overflow-y-auto max-h-[calc(90vh-400px)]">
          {filteredRequests.map((request) => (
            <div key={request.id} className="glass-card p-4 rounded-2xl">
              <div className="flex items-start gap-3 mb-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    request.status === "completed"
                      ? "bg-success/10 text-success"
                      : request.status === "in_progress"
                        ? "bg-primary/10 text-primary"
                        : "bg-warning/10 text-warning"
                  }`}
                >
                  {request.status === "completed" ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : request.priority === "urgent" || request.priority === "high" ? (
                    <AlertTriangle className="w-5 h-5" />
                  ) : (
                    <Wrench className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-medium text-balance">{request.title}</h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getPriorityColor(request.priority)}`}
                    >
                      {priorityLabels[request.priority]}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{request.description}</p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {request.reportedDate}
                    </span>
                    <span className="px-2 py-0.5 glass-card rounded-full">{categoryLabels[request.category]}</span>
                    <span className="px-2 py-0.5 glass-card rounded-full">{statusLabels[request.status]}</span>
                  </div>
                </div>
              </div>

              {(request.assignedTo || request.cost) && (
                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                  {request.assignedTo && <span className="text-muted-foreground">负责人：{request.assignedTo}</span>}
                  {request.cost && <span className="font-medium">费用：¥{request.cost}</span>}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="px-5 py-4 border-t border-white/10">
          <Button onClick={onAddMaintenance} className="w-full rounded-xl">
            <Plus className="w-4 h-4 mr-2" />
            添加维修
          </Button>
        </div>
      </div>
    </div>
  )
}
