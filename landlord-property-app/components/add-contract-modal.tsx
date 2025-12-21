"use client"

import { useState } from "react"
import { X, Calendar, Coins, FileText, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Contract } from "@/types/property"

interface AddContractModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (contract: Omit<Contract, "id">) => void
  propertyId: number
  tenantId: number
  suggestedRent: number
}

export function AddContractModal({
  isOpen,
  onClose,
  onSubmit,
  propertyId,
  tenantId,
  suggestedRent,
}: AddContractModalProps) {
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [rent, setRent] = useState(suggestedRent.toString())
  const [deposit, setDeposit] = useState((suggestedRent * 2).toString())
  const [paymentDay, setPaymentDay] = useState("5")

  if (!isOpen) return null

  const handleSubmit = () => {
    if (!startDate || !endDate || !rent || !deposit || !paymentDay) return

    onSubmit({
      propertyId,
      tenantId,
      startDate,
      endDate,
      rent: Number.parseFloat(rent),
      deposit: Number.parseFloat(deposit),
      paymentDay: Number.parseInt(paymentDay),
      status: "active",
    })

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
          <h2 className="text-lg font-semibold">签订租赁合同</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-muted/50 rounded-full transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto max-h-[calc(85vh-140px)]">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-2">
                <span className="text-destructive">* </span>起租日期
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 rounded-xl glass-card border border-white/20 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                <span className="text-destructive">* </span>到期日期
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 rounded-xl glass-card border border-white/20 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              <span className="text-destructive">* </span>月租金（元）
            </label>
            <div className="relative">
              <Coins className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="number"
                value={rent}
                onChange={(e) => setRent(e.target.value)}
                placeholder="请输入月租金"
                className="w-full pl-10 pr-4 py-3 rounded-xl glass-card border border-white/20 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              <span className="text-destructive">* </span>押金（元）
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="number"
                value={deposit}
                onChange={(e) => setDeposit(e.target.value)}
                placeholder="请输入押金金额"
                className="w-full pl-10 pr-4 py-3 rounded-xl glass-card border border-white/20 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
              />
            </div>
            <div className="mt-2 flex gap-2">
              {[1, 2, 3].map((months) => (
                <button
                  key={months}
                  onClick={() => setDeposit((Number.parseFloat(rent) * months).toString())}
                  className="px-3 py-1.5 text-xs glass-card hover:bg-primary/10 rounded-lg transition-colors"
                >
                  {months}个月
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              <span className="text-destructive">* </span>每月收租日
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="number"
                min="1"
                max="31"
                value={paymentDay}
                onChange={(e) => setPaymentDay(e.target.value)}
                placeholder="例如：5"
                className="w-full pl-10 pr-4 py-3 rounded-xl glass-card border border-white/20 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
              />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">每月固定收租日期，1-31号</p>
          </div>

          <div className="glass-card p-4 rounded-xl bg-primary/5 border border-primary/20">
            <div className="text-xs text-muted-foreground mb-2">合同摘要</div>
            <div className="space-y-1 text-sm">
              <div>租期：{startDate && endDate ? `${startDate} 至 ${endDate}` : "请选择日期"}</div>
              <div>月租金：¥{rent ? Number.parseFloat(rent).toLocaleString() : "0"}</div>
              <div>押金：¥{deposit ? Number.parseFloat(deposit).toLocaleString() : "0"}</div>
              <div>每月{paymentDay}号收租</div>
            </div>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-white/10 flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1 rounded-xl border-white/20 bg-transparent">
            取消
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!startDate || !endDate || !rent || !deposit || !paymentDay}
            className="flex-1 rounded-xl"
          >
            完成签约
          </Button>
        </div>
      </div>
    </div>
  )
}
