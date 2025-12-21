"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BatchEditModalProps {
  isOpen: boolean
  selectedCount: number
  onClose: () => void
  onConfirm: (data: { rent?: number; status?: "occupied" | "vacant" }) => void
}

export function BatchEditModal({ isOpen, selectedCount, onClose, onConfirm }: BatchEditModalProps) {
  const [rent, setRent] = useState("")
  const [status, setStatus] = useState<"occupied" | "vacant" | "">("")

  if (!isOpen) return null

  const handleConfirm = () => {
    const data: { rent?: number; status?: "occupied" | "vacant" } = {}
    if (rent) data.rent = Number.parseFloat(rent)
    if (status) data.status = status

    onConfirm(data)
    setRent("")
    setStatus("")
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md glass-card rounded-t-3xl p-6 animate-in slide-in-from-bottom-6 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground">批量编辑</h2>
            <p className="text-sm text-muted-foreground">已选择 {selectedCount} 个房间</p>
          </div>
          <Button size="icon" variant="ghost" onClick={onClose} className="h-8 w-8 rounded-full">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Form */}
        <div className="space-y-4 mb-6">
          {/* Rent Input */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">租金（元/月）</label>
            <input
              type="number"
              value={rent}
              onChange={(e) => setRent(e.target.value)}
              placeholder="输入新租金，留空则不修改"
              className="w-full px-4 py-3 rounded-xl glass-card border border-white/20 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* Status Select */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">租赁状态</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setStatus(status === "occupied" ? "" : "occupied")}
                className={`
                  px-4 py-3 rounded-xl transition-all duration-200
                  ${
                    status === "occupied"
                      ? "glass-card ring-2 ring-success text-success font-medium"
                      : "glass-card border border-white/20 text-muted-foreground hover:border-success/50"
                  }
                `}
              >
                已租
              </button>
              <button
                onClick={() => setStatus(status === "vacant" ? "" : "vacant")}
                className={`
                  px-4 py-3 rounded-xl transition-all duration-200
                  ${
                    status === "vacant"
                      ? "glass-card ring-2 ring-warning text-warning font-medium"
                      : "glass-card border border-white/20 text-muted-foreground hover:border-warning/50"
                  }
                `}
              >
                空置
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">点击取消已选状态，留空则不修改</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1 rounded-full h-11 bg-transparent">
            取消
          </Button>
          <Button onClick={handleConfirm} className="flex-1 rounded-full h-11 bg-primary hover:bg-primary/90">
            确认修改
          </Button>
        </div>
      </div>
    </div>
  )
}
