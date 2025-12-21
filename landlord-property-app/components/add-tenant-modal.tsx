"use client"

import { useState } from "react"
import { X, User, Phone, CreditCard, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Tenant } from "@/types/property"

interface AddTenantModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (tenant: Omit<Tenant, "id">) => void
}

export function AddTenantModal({ isOpen, onClose, onSubmit }: AddTenantModalProps) {
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [idCard, setIdCard] = useState("")
  const [emergencyContact, setEmergencyContact] = useState("")
  const [emergencyPhone, setEmergencyPhone] = useState("")

  if (!isOpen) return null

  const handleSubmit = () => {
    if (!name || !phone || !idCard) return

    onSubmit({
      name,
      phone,
      idCard,
      emergencyContact: emergencyContact || undefined,
      emergencyPhone: emergencyPhone || undefined,
    })

    setName("")
    setPhone("")
    setIdCard("")
    setEmergencyContact("")
    setEmergencyPhone("")
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-background/95 backdrop-blur-xl rounded-t-3xl sm:rounded-3xl shadow-2xl border border-white/20 max-h-[85vh] overflow-hidden animate-in slide-in-from-bottom duration-300">
        <div className="sm:hidden flex justify-center pt-2 pb-1">
          <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
        </div>

        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h2 className="text-lg font-semibold">添加租客信息</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-muted/50 rounded-full transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto max-h-[calc(85vh-140px)]">
          <div>
            <label className="block text-sm font-medium mb-2">
              <span className="text-destructive">* </span>姓名
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="请输入租客姓名"
                className="w-full pl-10 pr-4 py-3 rounded-xl glass-card border border-white/20 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              <span className="text-destructive">* </span>手机号
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="请输入手机号"
                className="w-full pl-10 pr-4 py-3 rounded-xl glass-card border border-white/20 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              <span className="text-destructive">* </span>身份证号
            </label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={idCard}
                onChange={(e) => setIdCard(e.target.value)}
                placeholder="请输入身份证号"
                className="w-full pl-10 pr-4 py-3 rounded-xl glass-card border border-white/20 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
              />
            </div>
          </div>

          <div className="glass-card p-4 rounded-xl border border-primary/20">
            <div className="flex items-start gap-2 mb-3">
              <AlertCircle className="w-4 h-4 text-primary mt-0.5" />
              <div className="text-xs text-muted-foreground">紧急联系人（可选）</div>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                placeholder="紧急联系人姓名"
                className="w-full px-4 py-2.5 rounded-xl glass-card border border-white/20 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
              />
              <input
                type="tel"
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
                placeholder="紧急联系人电话"
                className="w-full px-4 py-2.5 rounded-xl glass-card border border-white/20 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
              />
            </div>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-white/10 flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1 rounded-xl border-white/20 bg-transparent">
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={!name || !phone || !idCard} className="flex-1 rounded-xl">
            下一步：签订合同
          </Button>
        </div>
      </div>
    </div>
  )
}
