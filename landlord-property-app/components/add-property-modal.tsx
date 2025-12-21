"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { X, Home, Building2, Warehouse, Store, HelpCircle } from "lucide-react"
import type { PropertyCategory } from "@/types/property"
import { propertyCategoryLabels } from "@/types/property"

interface AddPropertyModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: PropertyFormData) => void
}

export interface PropertyFormData {
  category: PropertyCategory
  managementType: "scattered" | "centralized"
  title: string
  rent: number
  image?: string
}

const categoryIcons: Record<PropertyCategory, React.ReactNode> = {
  residential: <Home className="w-5 h-5" />,
  urban_apartment: <Building2 className="w-5 h-5" />,
  village_apartment: <Building2 className="w-5 h-5" />,
  villa: <Home className="w-5 h-5" />,
  factory: <Warehouse className="w-5 h-5" />,
  office: <Building2 className="w-5 h-5" />,
  shop: <Store className="w-5 h-5" />,
  other: <HelpCircle className="w-5 h-5" />,
}

export function AddPropertyModal({ isOpen, onClose, onSubmit }: AddPropertyModalProps) {
  const [step, setStep] = useState<"category" | "details">("category")
  const [selectedCategory, setSelectedCategory] = useState<PropertyCategory | null>(null)
  const [managementType, setManagementType] = useState<"scattered" | "centralized">("scattered")
  const [title, setTitle] = useState("")
  const [rent, setRent] = useState("")

  if (!isOpen) return null

  const handleCategorySelect = (category: PropertyCategory) => {
    setSelectedCategory(category)
    setStep("details")
  }

  const handleBack = () => {
    setStep("category")
    setSelectedCategory(null)
  }

  const handleSubmit = () => {
    if (!selectedCategory || !title || !rent) return

    onSubmit({
      category: selectedCategory,
      managementType,
      title,
      rent: Number.parseFloat(rent),
    })

    // 重置表单
    setStep("category")
    setSelectedCategory(null)
    setTitle("")
    setRent("")
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* 背景遮罩 */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* 模态框内容 */}
      <div className="relative w-full max-w-md bg-background/95 backdrop-blur-xl rounded-t-3xl sm:rounded-3xl shadow-2xl border border-white/20 max-h-[85vh] overflow-hidden animate-in slide-in-from-bottom duration-300 sm:slide-in-from-bottom-0">
        {/* 顶部拖动条 (移动端) */}
        <div className="sm:hidden flex justify-center pt-2 pb-1">
          <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
        </div>

        {/* 头部 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-foreground">
            {step === "category" ? "选择房源类型" : "填写房源信息"}
          </h2>
          <button onClick={onClose} className="p-1.5 hover:bg-muted/50 rounded-full transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* 内容区域 */}
        <div className="p-5 overflow-y-auto max-h-[calc(85vh-120px)]">
          {step === "category" ? (
            // 第一步：选择房源类型
            <div className="grid grid-cols-2 gap-3">
              {(Object.keys(propertyCategoryLabels) as PropertyCategory[]).map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategorySelect(category)}
                  className="glass-card p-4 rounded-2xl hover:shadow-lg transition-all duration-200 active:scale-95 flex flex-col items-center gap-2 group"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    {categoryIcons[category]}
                  </div>
                  <span className="text-sm font-medium text-foreground">{propertyCategoryLabels[category]}</span>
                </button>
              ))}
            </div>
          ) : (
            // 第二步：填写详细信息
            <div className="space-y-4">
              <div className="glass-card p-4 rounded-2xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  {selectedCategory && categoryIcons[selectedCategory]}
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">房源类型</div>
                  <div className="text-sm font-medium">
                    {selectedCategory && propertyCategoryLabels[selectedCategory]}
                  </div>
                </div>
              </div>

              {/* 管理方式 */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">管理方式</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setManagementType("scattered")}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      managementType === "scattered" ? "border-primary bg-primary/10" : "border-white/20 glass-card"
                    }`}
                  >
                    <div className="text-sm font-medium">分散式</div>
                    <div className="text-xs text-muted-foreground mt-1">独立房源</div>
                  </button>
                  <button
                    onClick={() => setManagementType("centralized")}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      managementType === "centralized" ? "border-primary bg-primary/10" : "border-white/20 glass-card"
                    }`}
                  >
                    <div className="text-sm font-medium">集中式</div>
                    <div className="text-xs text-muted-foreground mt-1">公寓楼栋</div>
                  </button>
                </div>
              </div>

              {/* 房源名称 */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">房源名称</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="例如：阳光小区 3栋 1201室"
                  className="w-full px-4 py-3 rounded-xl glass-card border border-white/20 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                />
              </div>

              {/* 租金 */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">月租金（元）</label>
                <input
                  type="number"
                  value={rent}
                  onChange={(e) => setRent(e.target.value)}
                  placeholder="例如：3500"
                  className="w-full px-4 py-3 rounded-xl glass-card border border-white/20 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                />
              </div>
            </div>
          )}
        </div>

        {/* 底部按钮 */}
        {step === "details" && (
          <div className="px-5 py-4 border-t border-white/10 flex gap-3">
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex-1 rounded-xl border-white/20 hover:bg-muted/50 bg-transparent"
            >
              返回
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!title || !rent}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
            >
              完成
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
