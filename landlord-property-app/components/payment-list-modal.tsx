"use client"

import { useState } from "react"
import { X, Calendar, CheckCircle2, Clock, AlertCircle, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Payment } from "@/types/property"

interface PaymentListModalProps {
  isOpen: boolean
  onClose: () => void
  propertyId: number
  propertyTitle: string
  onAddPayment: () => void
}

const mockPayments: Payment[] = [
  {
    id: 1,
    contractId: 1,
    propertyId: 1,
    amount: 4500,
    type: "rent",
    status: "paid",
    dueDate: "2025-01-05",
    paidDate: "2025-01-04",
    method: "wechat",
  },
  {
    id: 2,
    contractId: 1,
    propertyId: 1,
    amount: 4500,
    type: "rent",
    status: "pending",
    dueDate: "2025-02-05",
  },
  {
    id: 3,
    contractId: 1,
    propertyId: 1,
    amount: 200,
    type: "utilities",
    status: "overdue",
    dueDate: "2025-01-10",
    notes: "水电费",
  },
]

const paymentTypeLabels = {
  rent: "租金",
  deposit: "押金",
  utilities: "水电费",
  maintenance: "维修费",
}

const paymentMethodLabels = {
  cash: "现金",
  transfer: "银行转账",
  wechat: "微信",
  alipay: "支付宝",
}

export function PaymentListModal({ isOpen, onClose, propertyId, propertyTitle, onAddPayment }: PaymentListModalProps) {
  const [filterStatus, setFilterStatus] = useState<"all" | "paid" | "pending" | "overdue">("all")

  if (!isOpen) return null

  const filteredPayments = filterStatus === "all" ? mockPayments : mockPayments.filter((p) => p.status === filterStatus)

  const stats = {
    total: mockPayments.reduce((sum, p) => sum + p.amount, 0),
    paid: mockPayments.filter((p) => p.status === "paid").reduce((sum, p) => sum + p.amount, 0),
    pending: mockPayments.filter((p) => p.status === "pending").reduce((sum, p) => sum + p.amount, 0),
    overdue: mockPayments.filter((p) => p.status === "overdue").reduce((sum, p) => sum + p.amount, 0),
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
            <h2 className="text-lg font-semibold">账单管理</h2>
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
              <div className="text-sm font-bold">¥{stats.total.toLocaleString()}</div>
            </div>
            <div className="glass-card p-3 rounded-xl text-center border border-success/20">
              <div className="text-xs text-muted-foreground mb-1">已付</div>
              <div className="text-sm font-bold text-success">¥{stats.paid.toLocaleString()}</div>
            </div>
            <div className="glass-card p-3 rounded-xl text-center border border-warning/20">
              <div className="text-xs text-muted-foreground mb-1">待付</div>
              <div className="text-sm font-bold text-warning">¥{stats.pending.toLocaleString()}</div>
            </div>
            <div className="glass-card p-3 rounded-xl text-center border border-destructive/20">
              <div className="text-xs text-muted-foreground mb-1">逾期</div>
              <div className="text-sm font-bold text-destructive">¥{stats.overdue.toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* 筛选器 */}
        <div className="px-4 py-3 flex gap-2 overflow-x-auto border-b border-white/10">
          {[
            { key: "all", label: "全部" },
            { key: "paid", label: "已支付" },
            { key: "pending", label: "待支付" },
            { key: "overdue", label: "已逾期" },
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

        {/* 账单列表 */}
        <div className="p-4 space-y-3 overflow-y-auto max-h-[calc(90vh-400px)]">
          {filteredPayments.map((payment) => (
            <div key={payment.id} className="glass-card p-4 rounded-2xl">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      payment.status === "paid"
                        ? "bg-success/10 text-success"
                        : payment.status === "overdue"
                          ? "bg-destructive/10 text-destructive"
                          : "bg-warning/10 text-warning"
                    }`}
                  >
                    {payment.status === "paid" ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : payment.status === "overdue" ? (
                      <AlertCircle className="w-5 h-5" />
                    ) : (
                      <Clock className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{paymentTypeLabels[payment.type]}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      到期日：{payment.dueDate}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">¥{payment.amount.toLocaleString()}</div>
                  <div
                    className={`text-xs mt-0.5 ${
                      payment.status === "paid"
                        ? "text-success"
                        : payment.status === "overdue"
                          ? "text-destructive"
                          : "text-warning"
                    }`}
                  >
                    {payment.status === "paid" ? "已支付" : payment.status === "overdue" ? "已逾期" : "待支付"}
                  </div>
                </div>
              </div>

              {payment.paidDate && payment.method && (
                <div className="text-xs text-muted-foreground pt-2 border-t border-white/10">
                  支付时间：{payment.paidDate} · {paymentMethodLabels[payment.method]}
                </div>
              )}

              {payment.notes && (
                <div className="text-xs text-muted-foreground pt-2 border-t border-white/10">备注：{payment.notes}</div>
              )}
            </div>
          ))}
        </div>

        <div className="px-5 py-4 border-t border-white/10">
          <Button onClick={onAddPayment} className="w-full rounded-xl">
            <Plus className="w-4 h-4 mr-2" />
            添加账单
          </Button>
        </div>
      </div>
    </div>
  )
}
