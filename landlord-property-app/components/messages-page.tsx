"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Home, TrendingUp, Plus, MessageSquare, User, Search, ChevronRight } from "lucide-react"

export function MessagesPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("messages")

  const messages = [
    {
      id: 1,
      type: "tenant",
      name: "张三",
      property: "阳光花园 302室",
      message: "空调不制冷了，能帮忙看看吗？",
      time: "10:30",
      unread: 2,
    },
    {
      id: 2,
      type: "system",
      name: "系统通知",
      message: "201室租金已到期，请及时提醒租客缴纳",
      time: "昨天",
      unread: 0,
    },
    {
      id: 3,
      type: "tenant",
      name: "李四",
      property: "碧水豪庭 A座1501",
      message: "下个月合同到期了，我想续租",
      time: "12-18",
      unread: 1,
    },
    {
      id: 4,
      type: "maintenance",
      name: "李师傅",
      message: "翠湖雅苑的漏水问题已经修好了",
      time: "12-18",
      unread: 0,
    },
  ]

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-light border-b border-white/30 px-4 py-3">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <h1 className="text-lg font-semibold text-primary">消息</h1>
          <Button variant="ghost" size="icon" className="w-9 h-9 rounded-full">
            <Search className="w-5 h-5 text-muted-foreground" />
          </Button>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 pt-6 space-y-3">
        {messages.map((message) => (
          <button
            key={message.id}
            onClick={() => router.push(`/messages/${message.id}`)}
            className="w-full glass-card rounded-2xl p-4 shadow-md hover:shadow-lg transition-shadow text-left group"
          >
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center flex-shrink-0">
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-foreground">{message.name}</h3>
                    {message.unread > 0 && (
                      <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-destructive text-white text-xs font-medium">
                        {message.unread}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">{message.time}</span>
                </div>
                {message.property && <p className="text-xs text-muted-foreground mb-1">{message.property}</p>}
                <p className="text-sm text-foreground/80 line-clamp-1">{message.message}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-2" />
            </div>
          </button>
        ))}

        {messages.length === 0 && (
          <div className="glass-card rounded-2xl p-12 text-center">
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-sm text-muted-foreground">暂无消息</p>
          </div>
        )}
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
              <Home className="w-6 h-6" />
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
              <TrendingUp className="w-6 h-6" />
              <span className="text-xs font-medium">房源</span>
            </button>
            <button onClick={() => router.push("/properties")} className="relative -top-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-r from-primary to-accent shadow-lg flex items-center justify-center">
                <Plus className="w-7 h-7 text-white" />
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
              <MessageSquare className="w-6 h-6" />
              <span className="text-xs font-medium">消息</span>
              <span className="absolute top-0 right-2 w-2 h-2 bg-destructive rounded-full" />
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
              <User className="w-6 h-6" />
              <span className="text-xs font-medium">我的</span>
            </button>
          </div>
        </div>
      </nav>
    </div>
  )
}
