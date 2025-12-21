"use client"

import { X, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BatchOperationBarProps {
  selectedCount: number
  onCancel: () => void
  onBatchEdit: () => void
  onBatchDelete: () => void
}

export function BatchOperationBar({ selectedCount, onCancel, onBatchEdit, onBatchDelete }: BatchOperationBarProps) {
  if (selectedCount === 0) return null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 duration-300">
      <div className="glass-card rounded-full px-6 py-3 shadow-2xl border border-white/30">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-semibold">
              {selectedCount}
            </div>
            <span className="text-sm font-medium text-foreground">已选</span>
          </div>

          <div className="h-4 w-px bg-white/30" />

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={onBatchEdit}
              className="h-9 px-3 rounded-full hover:bg-primary/10 hover:text-primary"
            >
              <Edit className="w-4 h-4 mr-1.5" />
              批量编辑
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={onBatchDelete}
              className="h-9 px-3 rounded-full hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-1.5" />
              删除
            </Button>

            <Button size="sm" variant="ghost" onClick={onCancel} className="h-9 w-9 p-0 rounded-full hover:bg-muted">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
