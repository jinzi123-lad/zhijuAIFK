"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Download,
  Filter,
  ChevronRight,
  AlertCircle,
} from "lucide-react"
import type { Payment } from "@/types/property"

export function FinanceReport() {
  const router = useRouter()
  const [selectedPeriod, setSelectedPeriod] = useState("month")
  const [selectedMonth, setSelectedMonth] = useState("2024-12")

  const financialSummary = {
    totalIncome: 45600,
    totalExpense: 8200,
    netProfit: 37400,
    incomeGrowth: 12.5,
    expenseGrowth: -3.2,
    profitGrowth: 15.8,
  }

  const monthlyRevenue = [
    { month: "7月", income: 38000, expense: 7200 },
    { month: "8月", income: 39500, expense: 7800 },
    { month: "9月", income: 41000, expense: 8500 },
    { month: "10月", income: 42800, expense: 7900 },
    { month: "11月", income: 44200, expense: 8600 },
    { month: "12月", income: 45600, expense: 8200 },
  ]

  const recentPayments: Payment[] = [
    {
      id: 1,
      contractId: 1,
      propertyId: 1,
      amount: 4500,
      type: "rent",
      status: "paid",
      dueDate: "2024-12-05",
      paidDate: "2024-12-03",
      method: "wechat",
    },
    {
      id: 2,
      contractId: 2,
      propertyId: 2,
      amount: 3800,
      type: "rent",
      status: "paid",
      dueDate: "2024-12-08",
      paidDate: "2024-12-08",
      method: "alipay",
    },
    {
      id: 3,
      contractId: 3,
      propertyId: 3,
      amount: 5200,
      type: "rent",
      status: "overdue",
      dueDate: "2024-12-10",
    },
    {
      id: 4,
      contractId: 4,
      propertyId: 4,
      amount: 300,
      type: "utilities",
      status: "pending",
      dueDate: "2024-12-25",
    },
  ]

  const paymentTypeLabels = {
    rent: "租金",
    deposit: "押金",
    utilities: "水电费",
    maintenance: "维修费",
  }

  const paymentStatusLabels = {
    paid: "已支付",
    pending: "待支付",
    overdue: "已逾期",
  }

  const paymentMethodLabels = {
    cash: "现金",
    transfer: "银行转账",
    wechat: "微信",
    alipay: "支付宝",
  }

  const maxRevenue = Math.max(...monthlyRevenue.map((m) => Math.max(m.income, m.expense)))

  return (
    <div className="min-h-screen pb-6">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-light border-b border-white/30 px-4 py-3">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <Button variant="ghost" size="icon" className="w-9 h-9 rounded-full" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold text-primary">财务报表</h1>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="w-9 h-9 rounded-full">
              <Filter className="w-5 h-5 text-muted-foreground" />
            </Button>
            <Button variant="ghost" size="icon" className="w-9 h-9 rounded-full">
              <Download className="w-5 h-5 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 pt-6 space-y-5">
        {/* Period Selector */}
        <div className="flex gap-2">
          {["month", "quarter", "year"].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedPeriod === period
                  ? "bg-primary text-white shadow-md"
                  : "glass-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {period === "month" ? "月度" : period === "quarter" ? "季度" : "年度"}
            </button>
          ))}
        </div>

        {/* Financial Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-card rounded-2xl p-4 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">总收入</span>
              <TrendingUp className="w-4 h-4 text-success" />
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">
              ¥{financialSummary.totalIncome.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 text-xs text-success">
              <TrendingUp className="w-3 h-3" />
              <span>{financialSummary.incomeGrowth}%</span>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-4 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">总支出</span>
              <TrendingDown className="w-4 h-4 text-destructive" />
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">
              ¥{financialSummary.totalExpense.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 text-xs text-success">
              <TrendingDown className="w-3 h-3" />
              <span>{Math.abs(financialSummary.expenseGrowth)}%</span>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-4 shadow-md col-span-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">净利润</span>
              <DollarSign className="w-4 h-4 text-primary" />
            </div>
            <div className="text-3xl font-bold text-primary mb-1">¥{financialSummary.netProfit.toLocaleString()}</div>
            <div className="flex items-center gap-1 text-xs text-success">
              <TrendingUp className="w-3 h-3" />
              <span>较上月增长 {financialSummary.profitGrowth}%</span>
            </div>
          </div>
        </div>

        {/* Revenue Trend Chart */}
        <div>
          <h2 className="text-base font-semibold text-foreground mb-3 px-1">收入趋势</h2>
          <div className="glass-card rounded-2xl p-5 shadow-md">
            <div className="space-y-4">
              {monthlyRevenue.map((data, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2 text-xs">
                    <span className="text-muted-foreground font-medium">{data.month}</span>
                    <span className="text-foreground font-semibold">¥{data.income.toLocaleString()}</span>
                  </div>
                  <div className="relative h-2 bg-muted/30 rounded-full overflow-hidden">
                    <div
                      className="absolute left-0 top-0 h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all"
                      style={{ width: `${(data.income / maxRevenue) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Payments */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-base font-semibold text-foreground">最近账单</h2>
            <button
              onClick={() => router.push("/payments")}
              className="text-xs text-primary font-medium flex items-center gap-1"
            >
              查看全部
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-3">
            {recentPayments.map((payment) => (
              <button
                key={payment.id}
                className="w-full glass-card rounded-2xl p-4 shadow-md hover:shadow-lg transition-shadow text-left group"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-1">
                      {paymentTypeLabels[payment.type]} - 房间{payment.propertyId}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      应缴日期: {new Date(payment.dueDate).toLocaleDateString("zh-CN")}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-primary">¥{payment.amount.toLocaleString()}</div>
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${
                        payment.status === "paid"
                          ? "bg-success/10 text-success"
                          : payment.status === "overdue"
                            ? "bg-destructive/10 text-destructive"
                            : "bg-warning/10 text-warning"
                      }`}
                    >
                      {paymentStatusLabels[payment.status]}
                    </span>
                  </div>
                </div>
                {payment.paidDate && payment.method && (
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>支付时间: {new Date(payment.paidDate).toLocaleDateString("zh-CN")}</span>
                    <span>•</span>
                    <span>{paymentMethodLabels[payment.method]}</span>
                  </div>
                )}
                {payment.status === "overdue" && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-destructive">
                    <AlertCircle className="w-3 h-3" />
                    <span>
                      已逾期 {Math.floor((Date.now() - new Date(payment.dueDate).getTime()) / (1000 * 60 * 60 * 24))} 天
                    </span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
