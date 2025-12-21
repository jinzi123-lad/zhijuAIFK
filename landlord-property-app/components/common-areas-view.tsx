"use client"

import { useState } from "react"
import {
  ArrowLeft,
  Building,
  Car,
  Dumbbell,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  MoreVertical,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface CommonArea {
  id: number
  name: string
  type: "elevator" | "parking" | "lobby" | "gym" | "other"
  status: "normal" | "maintenance" | "warning"
  lastMaintenance: string
  notes?: string
}

interface CommonAreasViewProps {
  buildingName: string
  commonAreas: CommonArea[]
  onBack: () => void
}

const areaTypeConfig = {
  elevator: { icon: Building, label: "电梯", color: "text-blue-500" },
  parking: { icon: Car, label: "停车场", color: "text-purple-500" },
  lobby: { icon: Building, label: "大堂", color: "text-green-500" },
  gym: { icon: Dumbbell, label: "健身房", color: "text-orange-500" },
  other: { icon: Building, label: "其他", color: "text-gray-500" },
}

const statusConfig = {
  normal: { icon: CheckCircle2, label: "正常", color: "text-success", bgColor: "bg-success/10" },
  maintenance: { icon: Wrench, label: "维护中", color: "text-warning", bgColor: "bg-warning/10" },
  warning: { icon: AlertTriangle, label: "故障", color: "text-destructive", bgColor: "bg-destructive/10" },
}

export function CommonAreasView({ buildingName, commonAreas, onBack }: CommonAreasViewProps) {
  const [filter, setFilter] = useState<"all" | "normal" | "maintenance" | "warning">("all")

  const filteredAreas = commonAreas.filter((area) => {
    if (filter === "all") return true
    return area.status === filter
  })

  const stats = {
    total: commonAreas.length,
    normal: commonAreas.filter((a) => a.status === "normal").length,
    maintenance: commonAreas.filter((a) => a.status === "maintenance").length,
    warning: commonAreas.filter((a) => a.status === "warning").length,
  }

  return (
    <div className="min-h-screen pb-6">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-light border-b border-white/30 px-4 py-4 mb-4">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8 rounded-full hover:bg-white/20">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-primary">{buildingName}</h1>
              <p className="text-xs text-muted-foreground">公共区域管理</p>
            </div>
          </div>
          <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full h-9 px-4">
            <Plus className="w-4 h-4 mr-1" />
            添加区域
          </Button>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 space-y-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`glass-card rounded-xl p-3 transition-all duration-200 ${
              filter === "all" ? "ring-2 ring-primary shadow-lg" : "hover:shadow-md"
            }`}
          >
            <div className="text-xl font-bold text-foreground">{stats.total}</div>
            <div className="text-[10px] text-muted-foreground">全部</div>
          </button>

          <button
            onClick={() => setFilter("normal")}
            className={`glass-card rounded-xl p-3 transition-all duration-200 ${
              filter === "normal" ? "ring-2 ring-success shadow-lg" : "hover:shadow-md"
            }`}
          >
            <div className="text-xl font-bold text-success">{stats.normal}</div>
            <div className="text-[10px] text-muted-foreground">正常</div>
          </button>

          <button
            onClick={() => setFilter("maintenance")}
            className={`glass-card rounded-xl p-3 transition-all duration-200 ${
              filter === "maintenance" ? "ring-2 ring-warning shadow-lg" : "hover:shadow-md"
            }`}
          >
            <div className="text-xl font-bold text-warning">{stats.maintenance}</div>
            <div className="text-[10px] text-muted-foreground">维护中</div>
          </button>

          <button
            onClick={() => setFilter("warning")}
            className={`glass-card rounded-xl p-3 transition-all duration-200 ${
              filter === "warning" ? "ring-2 ring-destructive shadow-lg" : "hover:shadow-md"
            }`}
          >
            <div className="text-xl font-bold text-destructive">{stats.warning}</div>
            <div className="text-[10px] text-muted-foreground">故障</div>
          </button>
        </div>

        {/* Common Areas List */}
        <div className="space-y-3">
          {filteredAreas.length > 0 ? (
            filteredAreas.map((area) => {
              const TypeIcon = areaTypeConfig[area.type].icon
              const StatusIcon = statusConfig[area.status].icon

              return (
                <div key={area.id} className="glass-card rounded-2xl p-4 hover:shadow-lg transition-all duration-200">
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0">
                      <TypeIcon className={`w-6 h-6 ${areaTypeConfig[area.type].color}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-foreground">{area.name}</h3>
                          <p className="text-xs text-muted-foreground">{areaTypeConfig[area.type].label}</p>
                        </div>
                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full -mt-1">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Status */}
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className={`flex items-center gap-1 px-2 py-1 rounded-full ${statusConfig[area.status].bgColor}`}
                        >
                          <StatusIcon className={`w-3 h-3 ${statusConfig[area.status].color}`} />
                          <span className={`text-xs font-medium ${statusConfig[area.status].color}`}>
                            {statusConfig[area.status].label}
                          </span>
                        </div>
                      </div>

                      {/* Last Maintenance */}
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>上次维护: {area.lastMaintenance}</span>
                      </div>

                      {/* Notes */}
                      {area.notes && (
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2 bg-white/30 rounded-lg px-2 py-1">
                          {area.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="glass-card rounded-2xl p-12 text-center">
              <Building className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">暂无符合条件的公共区域</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
