"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  FileText,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  ChevronRight,
} from "lucide-react"
import type { Contract } from "@/types/property"

export function ContractManagement() {
  const router = useRouter()
  const [selectedStatus, setSelectedStatus] = useState<"all" | "active" | "expiring" | "expired">("all")
  const [searchQuery, setSearchQuery] = useState("")

  const contracts: (Contract & { propertyTitle: string; tenantName: string })[] = [
    {
      id: 1,
      propertyId: 1,
      tenantId: 1,
      propertyTitle: "阳光花园 302室",
      tenantName: "张三",
      startDate: "2024-01-15",
      endDate: "2025-01-14",
      rent: 4500,
      deposit: 9000,
      paymentDay: 5,
      status: "active",
      documents: ["contract_001.pdf", "id_front.jpg", "id_back.jpg"],
    },
    {
      id: 2,
      propertyId: 2,
      tenantId: 2,
      propertyTitle: "碧水豪庭 A座1501",
      tenantName: "李四",
      startDate: "2024-03-01",
      endDate: "2025-02-28",
      rent: 5200,
      deposit: 10400,
      paymentDay: 1,
      status: "active",
      documents: ["contract_002.pdf"],
    },
    {
      id: 3,
      propertyId: 3,
      tenantId: 3,
      propertyTitle: "翠湖雅苑 12栋201",
      tenantName: "王五",
      startDate: "2023-12-10",
      endDate: "2024-12-09",
      rent: 3800,
      deposit: 7600,
      paymentDay: 10,
      status: "expired",
    },
    {
      id: 4,
      propertyId: 5,
      tenantId: 4,
      propertyTitle: "东方明珠 B区803",
      tenantName: "赵六",
      startDate: "2024-11-20",
      endDate: "2025-01-19",
      rent: 4200,
      deposit: 8400,
      paymentDay: 20,
      status: "active",
      documents: ["contract_004.pdf", "deposit_receipt.jpg"],
    },
  ]

  const statusLabels = {
    active: "生效中",
    expired: "已到期",
    terminated: "已终止",
  }

  const getDaysUntilExpiry = (endDate: string) => {
    const days = Math.floor((new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    return days
  }

  const getContractStatus = (contract: Contract) => {
    const days = getDaysUntilExpiry(contract.endDate)
    if (days < 0) return "expired"
    if (days <= 30) return "expiring"
    return "active"
  }

  const filteredContracts = contracts.filter((contract) => {
    const status = getContractStatus(contract)
    if (selectedStatus !== "all" && status !== selectedStatus) return false
    if (
      searchQuery &&
      !contract.propertyTitle.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !contract.tenantName.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false
    }
    return true
  })

  const stats = {
    total: contracts.length,
    active: contracts.filter((c) => getContractStatus(c) === "active").length,
    expiring: contracts.filter((c) => getContractStatus(c) === "expiring").length,
    expired: contracts.filter((c) => getContractStatus(c) === "expired").length,
  }

  return (
    <div className="min-h-screen pb-6">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-light border-b border-white/30 px-4 py-3">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <Button variant="ghost" size="icon" className="w-9 h-9 rounded-full" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold text-primary">电子合同</h1>
          <Button
            onClick={() => {
              /* Add new contract */
            }}
            size="icon"
            className="w-9 h-9 rounded-full bg-primary hover:bg-primary/90"
          >
            <Plus className="w-5 h-5 text-white" />
          </Button>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 pt-6 space-y-5">
        {/* Search Bar */}
        <div className="glass-card rounded-2xl p-3 shadow-md flex items-center gap-3">
          <Search className="w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="搜索房源或租客..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full">
            <Filter className="w-4 h-4 text-muted-foreground" />
          </Button>
        </div>

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
            onClick={() => setSelectedStatus("active")}
            className={`glass-card rounded-xl p-3 shadow-md transition-all ${
              selectedStatus === "active" ? "ring-2 ring-success" : ""
            }`}
          >
            <div className="text-2xl font-bold text-success mb-1">{stats.active}</div>
            <div className="text-xs text-muted-foreground">生效中</div>
          </button>
          <button
            onClick={() => setSelectedStatus("expiring")}
            className={`glass-card rounded-xl p-3 shadow-md transition-all ${
              selectedStatus === "expiring" ? "ring-2 ring-warning" : ""
            }`}
          >
            <div className="text-2xl font-bold text-warning mb-1">{stats.expiring}</div>
            <div className="text-xs text-muted-foreground">即将到期</div>
          </button>
          <button
            onClick={() => setSelectedStatus("expired")}
            className={`glass-card rounded-xl p-3 shadow-md transition-all ${
              selectedStatus === "expired" ? "ring-2 ring-destructive" : ""
            }`}
          >
            <div className="text-2xl font-bold text-destructive mb-1">{stats.expired}</div>
            <div className="text-xs text-muted-foreground">已到期</div>
          </button>
        </div>

        {/* Contracts List */}
        <div className="space-y-3">
          {filteredContracts.map((contract) => {
            const status = getContractStatus(contract)
            const daysUntilExpiry = getDaysUntilExpiry(contract.endDate)

            return (
              <button
                key={contract.id}
                onClick={() => router.push(`/contracts/${contract.id}`)}
                className="w-full glass-card rounded-2xl p-4 shadow-md hover:shadow-lg transition-shadow text-left group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-foreground mb-1">{contract.propertyTitle}</h3>
                    <p className="text-xs text-muted-foreground">租客: {contract.tenantName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        status === "active"
                          ? "bg-success/10 text-success"
                          : status === "expiring"
                            ? "bg-warning/10 text-warning"
                            : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      {status === "active" ? (
                        <CheckCircle className="w-3 h-3 inline mr-1" />
                      ) : status === "expiring" ? (
                        <Clock className="w-3 h-3 inline mr-1" />
                      ) : (
                        <AlertCircle className="w-3 h-3 inline mr-1" />
                      )}
                      {status === "active" ? "生效中" : status === "expiring" ? `${daysUntilExpiry}天后到期` : "已到期"}
                    </span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
                  <div>
                    <span className="text-muted-foreground">合同期限</span>
                    <div className="text-foreground font-medium mt-1">
                      {new Date(contract.startDate).toLocaleDateString("zh-CN", { month: "numeric", day: "numeric" })} -{" "}
                      {new Date(contract.endDate).toLocaleDateString("zh-CN", {
                        year: "numeric",
                        month: "numeric",
                        day: "numeric",
                      })}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">租金/押金</span>
                    <div className="text-foreground font-medium mt-1">
                      ¥{contract.rent.toLocaleString()} / ¥{contract.deposit.toLocaleString()}
                    </div>
                  </div>
                </div>

                {contract.documents && contract.documents.length > 0 && (
                  <div className="flex items-center gap-2 pt-3 border-t border-white/20">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{contract.documents.length} 个附件</span>
                    <div className="flex-1" />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs hover:bg-primary/10"
                      onClick={(e) => {
                        e.stopPropagation()
                      }}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      查看
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs hover:bg-primary/10"
                      onClick={(e) => {
                        e.stopPropagation()
                      }}
                    >
                      <Download className="w-3 h-3 mr-1" />
                      下载
                    </Button>
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {filteredContracts.length === 0 && (
          <div className="glass-card rounded-2xl p-12 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-sm text-muted-foreground">暂无合同记录</p>
          </div>
        )}
      </div>
    </div>
  )
}
