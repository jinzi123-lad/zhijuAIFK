"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { ArrowLeft, Search, Phone, MapPin, Calendar, ChevronRight, Plus } from "lucide-react"

// Mock data - 在真实应用中应该从数据库获取
const mockTenants = [
  {
    id: 1,
    name: "张三",
    phone: "138****5678",
    idCard: "440105********1234",
    emergencyContact: "李四",
    emergencyPhone: "139****9876",
    property: "阳光小区 3栋 302室",
    rent: 4500,
    contractEndDate: "2025-12-31",
    status: "active" as const,
    checkInDate: "2024-01-01",
  },
  {
    id: 2,
    name: "王芳",
    phone: "136****1234",
    idCard: "440106********5678",
    emergencyContact: "王明",
    emergencyPhone: "137****5432",
    property: "CBD公寓 A座 1805室",
    rent: 6800,
    contractEndDate: "2026-03-15",
    status: "active" as const,
    checkInDate: "2023-03-16",
  },
  {
    id: 3,
    name: "李强",
    phone: "135****8765",
    idCard: "440107********9012",
    emergencyContact: "李梅",
    emergencyPhone: "138****6789",
    property: "绿城花园 5栋 201室",
    rent: 3200,
    contractEndDate: "2025-08-20",
    status: "active" as const,
    checkInDate: "2024-08-21",
  },
  {
    id: 4,
    name: "赵敏",
    phone: "137****2345",
    idCard: "440108********3456",
    property: "都市豪庭 B座 2103室",
    rent: 5600,
    contractEndDate: "2025-11-30",
    status: "active" as const,
    checkInDate: "2023-12-01",
  },
  {
    id: 5,
    name: "刘洋",
    phone: "139****6789",
    idCard: "440109********7890",
    property: "星河公馆 12栋 1502室",
    rent: 4200,
    contractEndDate: "2026-02-28",
    status: "active" as const,
    checkInDate: "2024-03-01",
  },
]

export function TenantList() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "expiring">("all")

  const filteredTenants = mockTenants.filter((tenant) => {
    const matchesSearch =
      tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.phone.includes(searchQuery) ||
      tenant.property.toLowerCase().includes(searchQuery.toLowerCase())

    if (filterStatus === "all") return matchesSearch
    if (filterStatus === "active") return matchesSearch && tenant.status === "active"
    if (filterStatus === "expiring") {
      const endDate = new Date(tenant.contractEndDate)
      const today = new Date()
      const daysUntilExpiry = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      return matchesSearch && daysUntilExpiry <= 90 && daysUntilExpiry > 0
    }
    return matchesSearch
  })

  return (
    <div className="min-h-screen pb-6">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-light border-b border-white/30 px-4 py-3">
        <div className="flex items-center gap-3 max-w-md mx-auto">
          <Button variant="ghost" size="icon" className="w-9 h-9 rounded-full" onClick={() => router.push("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground flex-1">租客管理</h1>
          <Button
            variant="ghost"
            size="icon"
            className="w-9 h-9 rounded-full"
            onClick={() => {
              /* Add tenant modal */
            }}
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 pt-4 space-y-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="glass-card rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-primary mb-1">{mockTenants.length}</div>
            <div className="text-xs text-muted-foreground">总租客</div>
          </div>
          <div className="glass-card rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-success mb-1">
              {mockTenants.filter((t) => t.status === "active").length}
            </div>
            <div className="text-xs text-muted-foreground">在租</div>
          </div>
          <div className="glass-card rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-warning mb-1">
              {
                mockTenants.filter((t) => {
                  const endDate = new Date(t.contractEndDate)
                  const today = new Date()
                  const daysUntilExpiry = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                  return daysUntilExpiry <= 90 && daysUntilExpiry > 0
                }).length
              }
            </div>
            <div className="text-xs text-muted-foreground">即将到期</div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="glass-card rounded-2xl p-3 flex items-center gap-3">
          <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          <input
            type="text"
            placeholder="搜索租客姓名、电话或房源"
            className="flex-1 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setFilterStatus("all")}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filterStatus === "all"
                ? "bg-primary text-primary-foreground"
                : "glass-card text-muted-foreground hover:text-foreground"
            }`}
          >
            全部
          </button>
          <button
            onClick={() => setFilterStatus("active")}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filterStatus === "active"
                ? "bg-primary text-primary-foreground"
                : "glass-card text-muted-foreground hover:text-foreground"
            }`}
          >
            在租
          </button>
          <button
            onClick={() => setFilterStatus("expiring")}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filterStatus === "expiring"
                ? "bg-primary text-primary-foreground"
                : "glass-card text-muted-foreground hover:text-foreground"
            }`}
          >
            即将到期
          </button>
        </div>

        {/* Tenant List */}
        <div className="space-y-3">
          {filteredTenants.map((tenant) => {
            const endDate = new Date(tenant.contractEndDate)
            const today = new Date()
            const daysUntilExpiry = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
            const isExpiringSoon = daysUntilExpiry <= 90 && daysUntilExpiry > 0

            return (
              <button
                key={tenant.id}
                onClick={() => router.push(`/tenants/${tenant.id}`)}
                className="w-full glass-card rounded-2xl p-4 hover:shadow-lg transition-shadow group text-left"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <span className="text-lg font-semibold text-primary">{tenant.name[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-semibold text-foreground">{tenant.name}</h3>
                      {isExpiringSoon && (
                        <span className="px-2 py-0.5 rounded-full bg-warning/20 text-warning text-xs font-medium">
                          即将到期
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Phone className="w-3.5 h-3.5" />
                      <span>{tenant.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <MapPin className="w-3.5 h-3.5" />
                      <span className="truncate">{tenant.property}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-primary">¥{tenant.rent.toLocaleString()}/月</span>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>到期: {tenant.contractEndDate}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
                </div>
              </button>
            )
          })}
        </div>

        {filteredTenants.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">暂无租客信息</p>
          </div>
        )}
      </div>
    </div>
  )
}
