"use client"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Phone,
  MapPin,
  Calendar,
  FileText,
  Edit,
  Trash2,
  MessageSquare,
  User,
  Clock,
  CheckCircle,
} from "lucide-react"

interface TenantDetailProps {
  tenantId: number
}

// Mock data
const mockTenantData = {
  1: {
    id: 1,
    name: "张三",
    phone: "138****5678",
    fullPhone: "13812345678",
    idCard: "440105********1234",
    emergencyContact: "李四",
    emergencyPhone: "139****9876",
    property: "阳光小区 3栋 302室",
    rent: 4500,
    deposit: 4500,
    contractStartDate: "2024-01-01",
    contractEndDate: "2025-12-31",
    status: "active" as const,
    checkInDate: "2024-01-01",
    paymentDay: 5,
    avatar: "",
    email: "zhangsan@example.com",
  },
}

export function TenantDetail({ tenantId }: TenantDetailProps) {
  const router = useRouter()
  const tenant = mockTenantData[tenantId as keyof typeof mockTenantData]

  if (!tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">租客信息不存在</p>
      </div>
    )
  }

  const endDate = new Date(tenant.contractEndDate)
  const today = new Date()
  const daysUntilExpiry = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  const isExpiringSoon = daysUntilExpiry <= 90 && daysUntilExpiry > 0

  // Mock payment history
  const paymentHistory = [
    { id: 1, date: "2024-12-05", amount: 4500, status: "paid" as const, type: "rent" },
    { id: 2, date: "2024-11-05", amount: 4500, status: "paid" as const, type: "rent" },
    { id: 3, date: "2024-10-05", amount: 4500, status: "paid" as const, type: "rent" },
  ]

  return (
    <div className="min-h-screen pb-6">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-light border-b border-white/30 px-4 py-3">
        <div className="flex items-center gap-3 max-w-md mx-auto">
          <Button variant="ghost" size="icon" className="w-9 h-9 rounded-full" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground flex-1">租客详情</h1>
          <Button variant="ghost" size="icon" className="w-9 h-9 rounded-full">
            <Edit className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 pt-6 space-y-4">
        {/* Tenant Profile Card */}
        <div className="glass-card rounded-3xl p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">{tenant.name[0]}</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold text-foreground">{tenant.name}</h2>
                {isExpiringSoon && (
                  <span className="px-2 py-1 rounded-full bg-warning/20 text-warning text-xs font-medium">
                    合同即将到期
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-3">入住时间：{tenant.checkInDate}</p>
              <div className="flex gap-2">
                <Button size="sm" className="rounded-full gap-2">
                  <Phone className="w-4 h-4" />
                  联系
                </Button>
                <Button size="sm" variant="outline" className="rounded-full gap-2 bg-transparent">
                  <MessageSquare className="w-4 h-4" />
                  消息
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-background/50 rounded-xl p-3">
              <div className="text-xs text-muted-foreground mb-1">月租金</div>
              <div className="text-lg font-bold text-primary">¥{tenant.rent.toLocaleString()}</div>
            </div>
            <div className="bg-background/50 rounded-xl p-3">
              <div className="text-xs text-muted-foreground mb-1">押金</div>
              <div className="text-lg font-bold text-foreground">¥{tenant.deposit.toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="glass-card rounded-3xl p-5">
          <h3 className="text-base font-semibold text-foreground mb-4">联系方式</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="text-xs text-muted-foreground mb-0.5">手机号码</div>
                <div className="text-sm font-medium text-foreground">{tenant.fullPhone}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-accent" />
              </div>
              <div className="flex-1">
                <div className="text-xs text-muted-foreground mb-0.5">身份证号</div>
                <div className="text-sm font-medium text-foreground">{tenant.idCard}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5 text-success" />
              </div>
              <div className="flex-1">
                <div className="text-xs text-muted-foreground mb-0.5">紧急联系人</div>
                <div className="text-sm font-medium text-foreground">
                  {tenant.emergencyContact} - {tenant.emergencyPhone}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Property Information */}
        <div className="glass-card rounded-3xl p-5">
          <h3 className="text-base font-semibold text-foreground mb-4">租赁信息</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="text-xs text-muted-foreground mb-0.5">房源地址</div>
                <div className="text-sm font-medium text-foreground">{tenant.property}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-accent" />
              </div>
              <div className="flex-1">
                <div className="text-xs text-muted-foreground mb-0.5">合同期限</div>
                <div className="text-sm font-medium text-foreground">
                  {tenant.contractStartDate} 至 {tenant.contractEndDate}
                </div>
                <div className="text-xs text-warning mt-1">剩余 {daysUntilExpiry} 天</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-success" />
              </div>
              <div className="flex-1">
                <div className="text-xs text-muted-foreground mb-0.5">收款日</div>
                <div className="text-sm font-medium text-foreground">每月 {tenant.paymentDay} 号</div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment History */}
        <div className="glass-card rounded-3xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-foreground">缴费记录</h3>
            <Button variant="ghost" size="sm" className="text-primary h-auto p-0">
              查看全部
            </Button>
          </div>
          <div className="space-y-3">
            {paymentHistory.map((payment) => (
              <div key={payment.id} className="flex items-center gap-3 p-3 bg-background/50 rounded-xl">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    payment.status === "paid" ? "bg-success/10" : "bg-warning/10"
                  }`}
                >
                  {payment.status === "paid" ? (
                    <CheckCircle className="w-5 h-5 text-success" />
                  ) : (
                    <Clock className="w-5 h-5 text-warning" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-foreground">
                      {payment.type === "rent" ? "租金" : "其他"}
                    </span>
                    <span className="text-sm font-bold text-foreground">¥{payment.amount.toLocaleString()}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">{payment.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="rounded-full gap-2 h-12 bg-transparent">
            <FileText className="w-4 h-4" />
            查看合同
          </Button>
          <Button
            variant="outline"
            className="rounded-full gap-2 h-12 text-destructive border-destructive/50 bg-transparent"
          >
            <Trash2 className="w-4 h-4" />
            删除租客
          </Button>
        </div>
      </div>
    </div>
  )
}
