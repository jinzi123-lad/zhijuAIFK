"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, Home, Users, Percent } from "lucide-react"

export function BusinessAnalytics() {
  const router = useRouter()
  const [selectedPeriod, setSelectedPeriod] = useState<"month" | "quarter" | "year">("month")

  const kpis = {
    totalRevenue: 468000,
    revenueGrowth: 15.8,
    occupancyRate: 92.3,
    occupancyChange: 3.5,
    avgRent: 4200,
    rentChange: 8.2,
    totalProperties: 13,
    vacantProperties: 1,
  }

  const propertyTypeDistribution = [
    { type: "住宅", count: 5, percentage: 38.5, revenue: 180000 },
    { type: "城市公寓", count: 4, percentage: 30.8, revenue: 168000 },
    { type: "城中村公寓", count: 3, percentage: 23.1, revenue: 96000 },
    { type: "写字楼", count: 1, percentage: 7.6, revenue: 24000 },
  ]

  const revenueByArea = [
    { area: "福田区", revenue: 156000, percentage: 33.3 },
    { area: "南山区", revenue: 132000, percentage: 28.2 },
    { area: "罗湖区", revenue: 108000, percentage: 23.1 },
    { area: "宝安区", revenue: 72000, percentage: 15.4 },
  ]

  const monthlyTrend = [
    { month: "7月", revenue: 38000, expenses: 7200, profit: 30800 },
    { month: "8月", revenue: 39500, expenses: 7800, profit: 31700 },
    { month: "9月", revenue: 41000, expenses: 8500, profit: 32500 },
    { month: "10月", revenue: 42800, expenses: 7900, profit: 34900 },
    { month: "11月", revenue: 44200, expenses: 8600, profit: 35600 },
    { month: "12月", revenue: 45600, expenses: 8200, profit: 37400 },
  ]

  const performanceMetrics = [
    {
      title: "租金收缴率",
      value: 96.5,
      unit: "%",
      trend: 2.3,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "平均出租周期",
      value: 7,
      unit: "天",
      trend: -12.5,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "维修响应时间",
      value: 2.5,
      unit: "小时",
      trend: -18.2,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "租客满意度",
      value: 4.7,
      unit: "/5",
      trend: 6.8,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
  ]

  const maxRevenue = Math.max(...monthlyTrend.map((m) => m.revenue))

  return (
    <div className="min-h-screen pb-6">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-light border-b border-white/30 px-4 py-3">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <Button variant="ghost" size="icon" className="w-9 h-9 rounded-full" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold text-primary">经营分析</h1>
          <div className="w-9" />
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 pt-6 space-y-5">
        {/* Period Selector */}
        <div className="flex gap-2">
          {(["month", "quarter", "year"] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedPeriod === period
                  ? "bg-primary text-white shadow-md"
                  : "glass-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {period === "month" ? "本月" : period === "quarter" ? "本季度" : "本年度"}
            </button>
          ))}
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-card rounded-2xl p-4 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">总收入</span>
              <DollarSign className="w-4 h-4 text-success" />
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">¥{(kpis.totalRevenue / 1000).toFixed(0)}k</div>
            <div className="flex items-center gap-1 text-xs text-success">
              <TrendingUp className="w-3 h-3" />
              <span>+{kpis.revenueGrowth}%</span>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-4 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">出租率</span>
              <Percent className="w-4 h-4 text-primary" />
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">{kpis.occupancyRate}%</div>
            <div className="flex items-center gap-1 text-xs text-success">
              <TrendingUp className="w-3 h-3" />
              <span>+{kpis.occupancyChange}%</span>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-4 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">平均租金</span>
              <Home className="w-4 h-4 text-warning" />
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">¥{kpis.avgRent}</div>
            <div className="flex items-center gap-1 text-xs text-success">
              <TrendingUp className="w-3 h-3" />
              <span>+{kpis.rentChange}%</span>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-4 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">房源数量</span>
              <Users className="w-4 h-4 text-accent" />
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">{kpis.totalProperties}</div>
            <div className="text-xs text-muted-foreground">{kpis.vacantProperties} 套空置</div>
          </div>
        </div>

        {/* Revenue Trend */}
        <div>
          <h2 className="text-base font-semibold text-foreground mb-3 px-1">收入趋势</h2>
          <div className="glass-card rounded-2xl p-5 shadow-md space-y-4">
            {monthlyTrend.map((data, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2 text-xs">
                  <span className="text-muted-foreground font-medium w-10">{data.month}</span>
                  <span className="text-foreground font-semibold">¥{(data.revenue / 1000).toFixed(1)}k</span>
                </div>
                <div className="relative h-2 bg-muted/30 rounded-full overflow-hidden">
                  <div
                    className="absolute left-0 top-0 h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all"
                    style={{ width: `${(data.revenue / maxRevenue) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Property Type Distribution */}
        <div>
          <h2 className="text-base font-semibold text-foreground mb-3 px-1">房源类型分布</h2>
          <div className="glass-card rounded-2xl p-5 shadow-md space-y-4">
            {propertyTypeDistribution.map((item, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{item.type}</span>
                    <span className="text-xs text-muted-foreground">({item.count}套)</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-primary">¥{(item.revenue / 1000).toFixed(0)}k</div>
                    <div className="text-xs text-muted-foreground">{item.percentage}%</div>
                  </div>
                </div>
                <div className="relative h-2 bg-muted/30 rounded-full overflow-hidden">
                  <div
                    className="absolute left-0 top-0 h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue by Area */}
        <div>
          <h2 className="text-base font-semibold text-foreground mb-3 px-1">区域收入分布</h2>
          <div className="glass-card rounded-2xl p-5 shadow-md">
            <div className="grid grid-cols-2 gap-4">
              {revenueByArea.map((item, index) => (
                <div key={index} className="text-center">
                  <div className="relative w-20 h-20 mx-auto mb-2">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="40"
                        cy="40"
                        r="35"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="8"
                        className="text-muted/20"
                      />
                      <circle
                        cx="40"
                        cy="40"
                        r="35"
                        fill="none"
                        stroke="url(#gradient)"
                        strokeWidth="8"
                        strokeDasharray={`${item.percentage * 2.2} 220`}
                        className="transition-all"
                      />
                      <defs>
                        <linearGradient id="gradient">
                          <stop offset="0%" stopColor="hsl(var(--primary))" />
                          <stop offset="100%" stopColor="hsl(var(--accent))" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">{item.percentage.toFixed(0)}%</span>
                    </div>
                  </div>
                  <div className="text-xs font-medium text-foreground mb-1">{item.area}</div>
                  <div className="text-xs text-muted-foreground">¥{(item.revenue / 1000).toFixed(0)}k</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div>
          <h2 className="text-base font-semibold text-foreground mb-3 px-1">运营指标</h2>
          <div className="grid grid-cols-2 gap-3">
            {performanceMetrics.map((metric, index) => (
              <div key={index} className="glass-card rounded-2xl p-4 shadow-md">
                <span className="text-xs text-muted-foreground block mb-2">{metric.title}</span>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className={`text-2xl font-bold ${metric.color}`}>{metric.value}</span>
                  <span className="text-xs text-muted-foreground">{metric.unit}</span>
                </div>
                <div className={`flex items-center gap-1 text-xs ${metric.color}`}>
                  {metric.trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  <span>
                    {metric.trend > 0 ? "+" : ""}
                    {metric.trend}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
