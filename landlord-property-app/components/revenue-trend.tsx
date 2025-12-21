"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { ArrowLeft, TrendingUp, Filter } from "lucide-react"

export function RevenueTrend() {
  const router = useRouter()
  const [selectedYear, setSelectedYear] = useState("2024")
  const [viewMode, setViewMode] = useState<"bar" | "line">("bar")

  const monthlyData = [
    { month: "1月", income: 32000, target: 35000 },
    { month: "2月", income: 34500, target: 35000 },
    { month: "3月", income: 36800, target: 35000 },
    { month: "4月", income: 35200, target: 37000 },
    { month: "5月", income: 38600, target: 37000 },
    { month: "6月", income: 40100, target: 37000 },
    { month: "7月", income: 38000, target: 40000 },
    { month: "8月", income: 39500, target: 40000 },
    { month: "9月", income: 41000, target: 40000 },
    { month: "10月", income: 42800, target: 42000 },
    { month: "11月", income: 44200, target: 42000 },
    { month: "12月", income: 45600, target: 42000 },
  ]

  const maxValue = Math.max(...monthlyData.map((m) => Math.max(m.income, m.target)))
  const totalIncome = monthlyData.reduce((sum, m) => sum + m.income, 0)
  const avgIncome = Math.round(totalIncome / monthlyData.length)
  const growth = ((monthlyData[11].income - monthlyData[0].income) / monthlyData[0].income) * 100

  return (
    <div className="min-h-screen pb-6">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-light border-b border-white/30 px-4 py-3">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <Button variant="ghost" size="icon" className="w-9 h-9 rounded-full" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold text-primary">收入趋势</h1>
          <Button variant="ghost" size="icon" className="w-9 h-9 rounded-full">
            <Filter className="w-5 h-5 text-muted-foreground" />
          </Button>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 pt-6 space-y-5">
        {/* Year Selector */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {["2023", "2024", "2025"].map((year) => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedYear === year
                    ? "bg-primary text-white shadow-md"
                    : "glass-card text-muted-foreground hover:text-foreground"
                }`}
              >
                {year}年
              </button>
            ))}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="glass-card rounded-2xl p-4 shadow-md">
            <span className="text-xs text-muted-foreground block mb-1">年度总收入</span>
            <div className="text-xl font-bold text-primary">¥{(totalIncome / 1000).toFixed(1)}k</div>
          </div>
          <div className="glass-card rounded-2xl p-4 shadow-md">
            <span className="text-xs text-muted-foreground block mb-1">月均收入</span>
            <div className="text-xl font-bold text-foreground">¥{(avgIncome / 1000).toFixed(1)}k</div>
          </div>
          <div className="glass-card rounded-2xl p-4 shadow-md">
            <span className="text-xs text-muted-foreground block mb-1">年度增长</span>
            <div className="text-xl font-bold text-success flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              {growth.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="glass-card rounded-2xl p-5 shadow-md">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-semibold text-foreground">月度收入趋势</h2>
            <div className="flex gap-1 p-1 bg-muted/20 rounded-lg">
              <button
                onClick={() => setViewMode("bar")}
                className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                  viewMode === "bar" ? "bg-white text-primary shadow-sm" : "text-muted-foreground"
                }`}
              >
                柱状图
              </button>
              <button
                onClick={() => setViewMode("line")}
                className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                  viewMode === "line" ? "bg-white text-primary shadow-sm" : "text-muted-foreground"
                }`}
              >
                折线图
              </button>
            </div>
          </div>

          {viewMode === "bar" ? (
            <div className="space-y-4">
              {monthlyData.map((data, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2 text-xs">
                    <span className="text-muted-foreground font-medium w-10">{data.month}</span>
                    <div className="flex-1 mx-3 relative">
                      <div className="h-8 bg-muted/20 rounded-lg overflow-hidden flex items-center">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-accent rounded-lg transition-all flex items-center justify-end pr-2"
                          style={{ width: `${(data.income / maxValue) * 100}%` }}
                        >
                          <span className="text-xs text-white font-semibold">¥{(data.income / 1000).toFixed(1)}k</span>
                        </div>
                      </div>
                      {data.income >= data.target && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-full flex items-center justify-center">
                          <TrendingUp className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                    </div>
                    <span className="text-muted-foreground text-xs w-16 text-right">
                      目标 {(data.target / 1000).toFixed(0)}k
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="relative h-64">
              <svg className="w-full h-full" viewBox="0 0 400 200">
                <defs>
                  <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="hsl(var(--primary))" />
                    <stop offset="100%" stopColor="hsl(var(--accent))" />
                  </linearGradient>
                </defs>
                {/* Grid lines */}
                {[0, 1, 2, 3, 4].map((i) => (
                  <line
                    key={i}
                    x1="0"
                    y1={i * 50}
                    x2="400"
                    y2={i * 50}
                    stroke="currentColor"
                    strokeWidth="1"
                    className="text-muted/20"
                  />
                ))}
                {/* Line path */}
                <path
                  d={monthlyData
                    .map(
                      (data, i) => `${i === 0 ? "M" : "L"} ${(i * 400) / 11} ${200 - (data.income / maxValue) * 180}`,
                    )
                    .join(" ")}
                  fill="none"
                  stroke="url(#lineGradient)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                {/* Data points */}
                {monthlyData.map((data, i) => (
                  <circle
                    key={i}
                    cx={(i * 400) / 11}
                    cy={200 - (data.income / maxValue) * 180}
                    r="4"
                    fill="hsl(var(--primary))"
                    className="drop-shadow-md"
                  />
                ))}
              </svg>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-primary to-accent" />
            <span className="text-muted-foreground">实际收入</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-success" />
            <span className="text-muted-foreground">达标</span>
          </div>
        </div>
      </div>
    </div>
  )
}
