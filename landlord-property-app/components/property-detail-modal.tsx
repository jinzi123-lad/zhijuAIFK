"use client"

import { useState } from "react"
import { X, MapPin, Maximize, Coins, Calendar, FileText, PenTool as Tool, DollarSign, Users, Edit2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Property } from "@/types/property"
import { propertyCategoryLabels } from "@/types/property"
import Image from "next/image"

interface PropertyDetailModalProps {
  property: Property | null
  isOpen: boolean
  onClose: () => void
  onEdit: () => void
  onAddTenant: () => void
  onViewContract: () => void
  onAddPayment: () => void
  onAddMaintenance: () => void
}

export function PropertyDetailModal({
  property,
  isOpen,
  onClose,
  onEdit,
  onAddTenant,
  onViewContract,
  onAddPayment,
  onAddMaintenance,
}: PropertyDetailModalProps) {
  const [activeTab, setActiveTab] = useState<"info" | "tenant" | "payment" | "maintenance">("info")

  if (!isOpen || !property) return null

  const isOccupied = property.status === "occupied"

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-background/95 backdrop-blur-xl rounded-t-3xl sm:rounded-3xl shadow-2xl border border-white/20 max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom duration-300">
        <div className="sm:hidden flex justify-center pt-2 pb-1">
          <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
        </div>

        {/* 头部 */}
        <div className="relative">
          <div className="h-48 relative">
            <Image src={property.image || "/placeholder.svg"} alt={property.title} fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-black/40 backdrop-blur-sm hover:bg-black/60 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white text-balance mb-1">{property.title}</h2>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        isOccupied ? "bg-success text-white" : "bg-warning text-white"
                      }`}
                    >
                      {isOccupied ? "已租" : "空置"}
                    </span>
                    <span className="text-xs text-white/80">{propertyCategoryLabels[property.category]}</span>
                  </div>
                </div>
                <button
                  onClick={onEdit}
                  className="p-2 bg-black/40 backdrop-blur-sm hover:bg-black/60 rounded-full transition-colors"
                >
                  <Edit2 className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </div>

          {/* 标签页导航 */}
          <div className="flex border-b border-white/10 bg-background/50 backdrop-blur-sm overflow-x-auto">
            {[
              { key: "info", label: "基本信息", icon: FileText },
              { key: "tenant", label: "租客", icon: Users },
              { key: "payment", label: "账单", icon: DollarSign },
              { key: "maintenance", label: "维修", icon: Tool },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.key
                    ? "text-primary border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 内容区域 */}
        <div className="p-5 overflow-y-auto max-h-[calc(90vh-320px)]">
          {activeTab === "info" && (
            <div className="space-y-4">
              <div className="glass-card p-4 rounded-2xl space-y-3">
                {property.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground">地址</div>
                      <div className="text-sm">{property.address}</div>
                    </div>
                  </div>
                )}
                {property.area && (
                  <div className="flex items-start gap-3">
                    <Maximize className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground">面积</div>
                      <div className="text-sm">{property.area}㎡</div>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <Coins className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <div className="text-xs text-muted-foreground">租金</div>
                    <div className="text-lg font-bold text-accent">¥{property.rent.toLocaleString()}/月</div>
                  </div>
                </div>
                {property.deposit && (
                  <div className="flex items-start gap-3">
                    <DollarSign className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground">押金</div>
                      <div className="text-sm">¥{property.deposit.toLocaleString()}</div>
                    </div>
                  </div>
                )}
                {property.paymentDay && (
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground">每月收租日</div>
                      <div className="text-sm">每月{property.paymentDay}号</div>
                    </div>
                  </div>
                )}
              </div>

              {property.facilities && property.facilities.length > 0 && (
                <div className="glass-card p-4 rounded-2xl">
                  <div className="text-sm font-medium mb-3">配套设施</div>
                  <div className="flex flex-wrap gap-2">
                    {property.facilities.map((facility, index) => (
                      <span key={index} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs">
                        {facility}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {property.description && (
                <div className="glass-card p-4 rounded-2xl">
                  <div className="text-sm font-medium mb-2">房源描述</div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{property.description}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "tenant" && (
            <div className="space-y-3">
              {isOccupied ? (
                <>
                  <div className="glass-card p-4 rounded-2xl">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="text-sm font-medium mb-1">当前租客</div>
                        <div className="text-lg font-bold">{property.tenant}</div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-xl bg-transparent"
                        onClick={onViewContract}
                      >
                        查看合同
                      </Button>
                    </div>
                    {property.contractEndsIn !== null && (
                      <div className="text-xs text-muted-foreground">合同还有 {property.contractEndsIn} 天到期</div>
                    )}
                  </div>
                  <Button onClick={onViewContract} className="w-full rounded-xl">
                    管理租客信息
                  </Button>
                </>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-4">该房源暂无租客</p>
                  <Button onClick={onAddTenant} className="rounded-xl">
                    添加租客
                  </Button>
                </div>
              )}
            </div>
          )}

          {activeTab === "payment" && (
            <div className="space-y-3">
              <div className="text-center py-8">
                <DollarSign className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-4">暂无账单记录</p>
                <Button onClick={onAddPayment} className="rounded-xl">
                  添加账单
                </Button>
              </div>
            </div>
          )}

          {activeTab === "maintenance" && (
            <div className="space-y-3">
              {property.maintenanceIssues > 0 ? (
                <>
                  <div className="glass-card p-4 rounded-2xl">
                    <div className="text-sm font-medium mb-2">待处理维修</div>
                    <div className="text-2xl font-bold text-warning">{property.maintenanceIssues}</div>
                  </div>
                  <Button onClick={onAddMaintenance} className="w-full rounded-xl">
                    查看维修记录
                  </Button>
                </>
              ) : (
                <div className="text-center py-8">
                  <Tool className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-4">暂无维修记录</p>
                  <Button onClick={onAddMaintenance} className="rounded-xl">
                    报修
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
