"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { ArrowLeft, ChevronRight, User, Phone, Mail, MapPin, Building, CreditCard, Star, Shield } from "lucide-react"

export function ProfilePage() {
  const router = useRouter()

  const userInfo = {
    name: "张经理",
    phone: "138****8888",
    email: "zhang@example.com",
    company: "安居房产管理",
    address: "深圳市福田区中心城",
    memberLevel: "高级会员",
    joinDate: "2023-06-15",
  }

  const profileSections = [
    {
      title: "个人信息",
      items: [
        { icon: User, label: "姓名", value: userInfo.name, path: "/profile/edit-name" },
        { icon: Phone, label: "手机号", value: userInfo.phone, path: "/profile/edit-phone" },
        { icon: Mail, label: "邮箱", value: userInfo.email, path: "/profile/edit-email" },
      ],
    },
    {
      title: "企业信息",
      items: [
        { icon: Building, label: "公司名称", value: userInfo.company, path: "/profile/edit-company" },
        { icon: MapPin, label: "办公地址", value: userInfo.address, path: "/profile/edit-address" },
      ],
    },
    {
      title: "账户服务",
      items: [
        { icon: Star, label: "会员等级", value: userInfo.memberLevel, path: "/profile/membership" },
        { icon: CreditCard, label: "我的钱包", path: "/profile/wallet" },
        { icon: Shield, label: "实名认证", value: "已认证", path: "/profile/verification" },
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
          <h1 className="text-lg font-semibold text-primary">我的</h1>
          <div className="w-9" />
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 pt-6 space-y-5">
        {/* Profile Card */}
        <div className="glass-card rounded-3xl p-6 shadow-lg text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-primary to-accent mx-auto mb-4 flex items-center justify-center">
            <User className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-1">{userInfo.name}</h2>
          <p className="text-sm text-muted-foreground mb-3">{userInfo.company}</p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10">
            <Star className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">{userInfo.memberLevel}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => router.push("/properties")}
            className="glass-card rounded-2xl p-4 shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="text-2xl font-bold text-primary mb-1">13</div>
            <div className="text-xs text-muted-foreground">房源</div>
          </button>
          <button
            onClick={() => router.push("/tenants")}
            className="glass-card rounded-2xl p-4 shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="text-2xl font-bold text-success mb-1">15</div>
            <div className="text-xs text-muted-foreground">租客</div>
          </button>
          <button
            onClick={() => router.push("/contracts")}
            className="glass-card rounded-2xl p-4 shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="text-2xl font-bold text-warning mb-1">12</div>
            <div className="text-xs text-muted-foreground">合同</div>
          </button>
        </div>

        {/* Profile Sections */}
        {profileSections.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 px-1">{section.title}</h3>
            <div className="glass-card rounded-2xl shadow-md overflow-hidden">
              {section.items.map((item, itemIndex) => (
                <button
                  key={itemIndex}
                  onClick={() => router.push(item.path)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/10 transition-colors group border-b border-white/10 last:border-0"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground mb-0.5">{item.label}</div>
                      {item.value && <div className="text-xs text-muted-foreground truncate">{item.value}</div>}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Join Date */}
        <div className="glass-card rounded-2xl p-4 shadow-md text-center">
          <p className="text-xs text-muted-foreground">
            加入时间: {new Date(userInfo.joinDate).toLocaleDateString("zh-CN")}
          </p>
        </div>
      </div>
    </div>
  )
}
