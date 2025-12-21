"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import {
  Home,
  Users,
  DollarSign,
  FileText,
  Wrench,
  Calendar,
  TrendingUp,
  Settings,
  Plus,
  MessageSquare,
  User,
  Search,
  MoreVertical,
  ChevronRight,
  AlertCircle,
  Clock,
  BarChart3,
} from "lucide-react"

export function Dashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("home")

  const mainFunctions = [
    { icon: Users, label: "租客管理", color: "text-[#4ECDC4]", bg: "bg-[#E5F9F7]", path: "/tenants" },
    { icon: DollarSign, label: "财务报表", color: "text-[#FFD93D]", bg: "bg-[#FFF9E5]", path: "/finance" },
    { icon: FileText, label: "电子合同", color: "text-[#95E1D3]", bg: "bg-[#E5F9F4]", path: "/contracts" },
    { icon: Wrench, label: "维修工单", color: "text-[#A8DADC]", bg: "bg-[#EBF5F6]", path: "/maintenance" },
    { icon: Calendar, label: "查房预约", color: "text-[#F38181]", bg: "bg-[#FEEAEA]", path: "/inspections" },
    { icon: TrendingUp, label: "收入趋势", color: "text-[#6C5CE7]", bg: "bg-[#EEEBFC]", path: "/revenue" },
    { icon: BarChart3, label: "经营分析", color: "text-[#FF6B9D]", bg: "bg-[#FFEBF3]", path: "/analytics" },
    { icon: Settings, label: "系统设置", color: "text-[#A29BFE]", bg: "bg-[#EDECFE]", path: "/settings" },
  ]

  const months = ["1月", "2月", "3月", "4月", "5月", "6月", "7月"]

  const todos = [
    {
      id: 1,
      icon: AlertCircle,
      title: "201室 租金逾期",
      description: "逾期3天，请及时联系",
      time: "今天",
      urgent: true,
    },
    {
      id: 2,
      icon: Wrench,
      title: "102室 水管报修",
      description: "卫生间漏水，需紧急处理",
      time: "30分钟前",
      urgent: true,
    },
  ]

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-light border-b border-white/30 px-4 py-3">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <h1 className="text-lg font-semibold text-primary">智居AI-房东管理助手</h1>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="w-9 h-9 rounded-full icon-hover-scale">
              <MoreVertical className="w-5 h-5 text-muted-foreground" />
            </Button>
            <Button variant="ghost" size="icon" className="w-9 h-9 rounded-full icon-hover-scale">
              <Search className="w-5 h-5 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 pt-6 space-y-5">
        {/* Stats Card */}
        <button
          onClick={() => router.push("/properties")}
          className="w-full glass-card glass-shimmer rounded-3xl p-5 shadow-lg hover:shadow-xl transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground font-medium">房源管理</span>
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center icon-hover-bounce">
              <Home className="w-4 h-4 text-primary" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-primary">12</span>
              <span className="text-xs text-muted-foreground ml-1">总房源</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs text-success font-medium">已租 11</div>
                <div className="text-xs text-warning font-medium mt-0.5">空置 1</div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </button>

        {/* Main Functions */}
        <div>
          <h2 className="text-base font-semibold text-foreground mb-3 px-1">常用功能</h2>
          <div className="glass-card glass-shimmer rounded-3xl p-5 shadow-md">
            <div className="grid grid-cols-4 gap-6">
              {mainFunctions.map((func, index) => (
                <button
                  key={index}
                  onClick={() => router.push(func.path)}
                  className={`flex flex-col items-center gap-2 group icon-fade-in stagger-${index + 1}`}
                >
                  <div
                    className={`w-14 h-14 rounded-2xl ${func.bg} flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-active:scale-95`}
                  >
                    <func.icon className={`w-6 h-6 ${func.color} icon-glow`} />
                  </div>
                  <span className="text-xs text-foreground font-medium text-center leading-tight">{func.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* To-Do Items */}
        <div>
          <h2 className="text-base font-semibold text-foreground mb-3 px-1">待办事项</h2>
          <div className="space-y-3">
            {todos.map((todo) => (
              <button
                key={todo.id}
                className="w-full glass-card glass-shimmer rounded-2xl p-4 shadow-md hover:shadow-lg transition-shadow text-left group"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex-shrink-0 w-9 h-9 rounded-xl ${todo.urgent ? "bg-destructive/10" : "bg-primary/10"} flex items-center justify-center ${todo.urgent ? "icon-pulse" : ""}`}
                  >
                    <todo.icon className={`w-5 h-5 ${todo.urgent ? "text-destructive" : "text-primary"} icon-glow`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-foreground mb-1">{todo.title}</h3>
                    <p className="text-xs text-muted-foreground mb-2">{todo.description}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{todo.time}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 glass-light border-t border-white/30">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-around">
            <button
              onClick={() => {
                setActiveTab("home")
                router.push("/")
              }}
              className={`flex flex-col items-center gap-1 transition-colors ${
                activeTab === "home" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Home className={`w-6 h-6 icon-hover-scale ${activeTab === "home" ? "icon-float" : ""}`} />
              <span className="text-xs font-medium">首页</span>
            </button>
            <button
              onClick={() => {
                setActiveTab("discover")
                router.push("/properties")
              }}
              className={`flex flex-col items-center gap-1 transition-colors ${
                activeTab === "discover" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <TrendingUp className={`w-6 h-6 icon-hover-scale ${activeTab === "discover" ? "icon-float" : ""}`} />
              <span className="text-xs font-medium">房源</span>
            </button>
            <button onClick={() => router.push("/properties")} className="relative -top-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-r from-primary to-accent shadow-lg flex items-center justify-center icon-hover-bounce">
                <Plus className="w-7 h-7 text-white icon-hover-rotate" />
              </div>
            </button>
            <button
              onClick={() => {
                setActiveTab("messages")
                router.push("/messages")
              }}
              className={`flex flex-col items-center gap-1 transition-colors relative ${
                activeTab === "messages" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <MessageSquare className={`w-6 h-6 icon-hover-scale ${activeTab === "messages" ? "icon-float" : ""}`} />
              <span className="text-xs font-medium">消息</span>
              <span className="absolute top-0 right-2 w-2 h-2 bg-destructive rounded-full icon-pulse" />
            </button>
            <button
              onClick={() => {
                setActiveTab("profile")
                router.push("/profile")
              }}
              className={`flex flex-col items-center gap-1 transition-colors ${
                activeTab === "profile" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <User className={`w-6 h-6 icon-hover-scale ${activeTab === "profile" ? "icon-float" : ""}`} />
              <span className="text-xs font-medium">我的</span>
            </button>
          </div>
        </div>
      </nav>
    </div>
  )
}
