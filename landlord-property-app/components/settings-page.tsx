"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  ChevronRight,
  Bell,
  Lock,
  Languages,
  Moon,
  HelpCircle,
  FileText,
  Shield,
  LogOut,
} from "lucide-react"

export function SettingsPage() {
  const router = useRouter()

  const settingsSections = [
    {
      title: "通知设置",
      items: [
        { icon: Bell, label: "消息通知", value: "已开启", path: "/settings/notifications" },
        { icon: Bell, label: "租金提醒", value: "提前3天", path: "/settings/rent-reminder" },
      ],
    },
    {
      title: "账户与安全",
      items: [
        { icon: Lock, label: "修改密码", path: "/settings/password" },
        { icon: Shield, label: "隐私设置", path: "/settings/privacy" },
      ],
    },
    {
      title: "显示设置",
      items: [
        { icon: Languages, label: "语言", value: "简体中文", path: "/settings/language" },
        { icon: Moon, label: "深色模式", value: "跟随系统", path: "/settings/theme" },
      ],
    },
    {
      title: "帮助与支持",
      items: [
        { icon: HelpCircle, label: "帮助中心", path: "/settings/help" },
        { icon: FileText, label: "用户协议", path: "/settings/terms" },
        { icon: FileText, label: "隐私政策", path: "/settings/policy" },
      ],
    },
  ]

  return (
    <div className="min-h-screen pb-6">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-light border-b border-white/30 px-4 py-3">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <Button variant="ghost" size="icon" className="w-9 h-9 rounded-full" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold text-primary">系统设置</h1>
          <div className="w-9" />
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 pt-6 space-y-5">
        {settingsSections.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            <h2 className="text-sm font-semibold text-muted-foreground mb-3 px-1">{section.title}</h2>
            <div className="glass-card rounded-2xl shadow-md overflow-hidden">
              {section.items.map((item, itemIndex) => (
                <button
                  key={itemIndex}
                  onClick={() => router.push(item.path)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/10 transition-colors group border-b border-white/10 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-foreground">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.value && <span className="text-xs text-muted-foreground">{item.value}</span>}
                    <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* App Info */}
        <div className="glass-card rounded-2xl p-4 shadow-md text-center">
          <p className="text-xs text-muted-foreground mb-1">房源管理系统</p>
          <p className="text-xs text-muted-foreground">版本 1.0.0</p>
        </div>

        {/* Logout Button */}
        <Button
          variant="outline"
          className="w-full h-12 rounded-2xl glass-card border-destructive/20 text-destructive hover:bg-destructive/10 font-medium bg-transparent"
          onClick={() => {
            /* Handle logout */
          }}
        >
          <LogOut className="w-4 h-4 mr-2" />
          退出登录
        </Button>
      </div>
    </div>
  )
}
