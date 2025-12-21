"use client"

import { useState } from "react"
import { Building, Users, Home, ArrowLeft, CheckCircle2, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BatchOperationBar } from "@/components/batch-operation-bar"
import { BatchEditModal } from "@/components/batch-edit-modal"

interface Room {
  id: number
  title: string
  floor: number
  roomNumber: string
  status: "occupied" | "vacant"
  tenant: string | null
  rent: number
}

interface BuildingFloorViewProps {
  buildingName: string
  rooms: Room[]
  onBack: () => void
  onRoomClick: (room: Room) => void
  onViewCommonAreas?: () => void
}

export function BuildingFloorView({
  buildingName,
  rooms,
  onBack,
  onRoomClick,
  onViewCommonAreas,
}: BuildingFloorViewProps) {
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null)
  const [selectedRooms, setSelectedRooms] = useState<Set<number>>(new Set())
  const [isEditMode, setIsEditMode] = useState(false)
  const [showBatchEditModal, setShowBatchEditModal] = useState(false)

  // 按楼层分组
  const roomsByFloor = rooms.reduce(
    (acc, room) => {
      if (!acc[room.floor]) {
        acc[room.floor] = []
      }
      acc[room.floor].push(room)
      return acc
    },
    {} as Record<number, Room[]>,
  )

  const floors = Object.keys(roomsByFloor)
    .map(Number)
    .sort((a, b) => b - a)

  const totalOccupied = rooms.filter((r) => r.status === "occupied").length
  const occupancyRate = Math.round((totalOccupied / rooms.length) * 100)

  const handleRoomSelect = (roomId: number) => {
    const newSelected = new Set(selectedRooms)
    if (newSelected.has(roomId)) {
      newSelected.delete(roomId)
    } else {
      newSelected.add(roomId)
    }
    setSelectedRooms(newSelected)
  }

  const handleCancelSelection = () => {
    setSelectedRooms(new Set())
    setIsEditMode(false)
  }

  const handleBatchEdit = () => {
    setShowBatchEditModal(true)
  }

  const handleBatchDelete = () => {
    if (confirm(`确定要删除选中的 ${selectedRooms.size} 个房间吗？`)) {
      console.log("Deleting rooms:", Array.from(selectedRooms))
      handleCancelSelection()
    }
  }

  const handleBatchEditConfirm = (data: { rent?: number; status?: "occupied" | "vacant" }) => {
    console.log("Batch editing rooms:", Array.from(selectedRooms), "with data:", data)
    setShowBatchEditModal(false)
    handleCancelSelection()
  }

  const handleRoomAction = (room: Room) => {
    if (isEditMode) {
      handleRoomSelect(room.id)
    } else {
      onRoomClick(room)
    }
  }

  return (
    <div className="min-h-screen pb-6">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-light border-b border-white/30 px-4 py-4 mb-4">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={isEditMode ? handleCancelSelection : onBack}
              className="h-8 w-8 rounded-full hover:bg-white/20"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-primary">{buildingName}</h1>
              <p className="text-xs text-muted-foreground">{isEditMode ? "批量编辑模式" : "楼层视图"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isEditMode && onViewCommonAreas && (
              <Button
                size="sm"
                variant="outline"
                onClick={onViewCommonAreas}
                className="h-9 rounded-full border-primary/30 hover:bg-primary/10 bg-transparent"
              >
                <Settings className="w-3.5 h-3.5 mr-1.5" />
                公共区域
              </Button>
            )}
            {!isEditMode && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsEditMode(true)}
                className="h-9 rounded-full border-primary/30 hover:bg-primary/10"
              >
                批量管理
              </Button>
            )}
            <div className="text-right">
              <div className="text-xs text-muted-foreground">入住率</div>
              <div className="text-lg font-bold text-accent">{occupancyRate}%</div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4">
        {/* Building Stats */}
        <div className="glass-card rounded-2xl p-4 mb-4 grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{floors.length}</div>
            <div className="text-xs text-muted-foreground">楼层数</div>
          </div>
          <div className="text-center border-x border-white/20">
            <div className="text-2xl font-bold text-foreground">{rooms.length}</div>
            <div className="text-xs text-muted-foreground">房间数</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-success">{totalOccupied}</div>
            <div className="text-xs text-muted-foreground">已租</div>
          </div>
        </div>

        {/* Floor Selector */}
        <div className="mb-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-2 px-1">选择楼层</h3>
          <div className="flex flex-wrap gap-2">
            {floors.map((floor) => {
              const floorRooms = roomsByFloor[floor]
              const occupiedCount = floorRooms.filter((r) => r.status === "occupied").length
              const isSelected = selectedFloor === floor

              return (
                <button
                  key={floor}
                  onClick={() => setSelectedFloor(isSelected ? null : floor)}
                  className={`
                    glass-card rounded-xl px-4 py-3 min-w-[72px] transition-all duration-200
                    ${isSelected ? "ring-2 ring-primary shadow-lg scale-105" : "hover:shadow-md active:scale-95"}
                  `}
                >
                  <div className={`text-lg font-bold ${isSelected ? "text-primary" : "text-foreground"}`}>{floor}F</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    {occupiedCount}/{floorRooms.length}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Room Grid */}
        {selectedFloor ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-medium text-muted-foreground">{selectedFloor}楼 房间</h3>
              <div className="flex items-center gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-success" />
                  <span className="text-muted-foreground">已租</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-warning" />
                  <span className="text-muted-foreground">空置</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {roomsByFloor[selectedFloor].map((room) => {
                const isSelected = selectedRooms.has(room.id)

                return (
                  <button
                    key={room.id}
                    onClick={() => handleRoomAction(room)}
                    className={`
                      glass-card rounded-xl p-4 text-left transition-all duration-200
                      ${isEditMode ? "active:scale-95" : "hover:shadow-lg active:scale-95"}
                      ${isSelected ? "ring-2 ring-primary shadow-lg" : ""}
                    `}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Home className="w-4 h-4 text-primary" />
                        <span className="font-semibold text-foreground">{room.roomNumber}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {isEditMode && isSelected && <CheckCircle2 className="w-4 h-4 text-primary" />}
                        <div
                          className={`
                          w-2 h-2 rounded-full mt-1
                          ${room.status === "occupied" ? "bg-success" : "bg-warning"}
                        `}
                        />
                      </div>
                    </div>

                    {room.status === "occupied" && room.tenant ? (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                        <Users className="w-3 h-3" />
                        <span className="truncate">{room.tenant}</span>
                      </div>
                    ) : (
                      <div className="text-xs text-warning mb-2">待租</div>
                    )}

                    <div className="text-base font-bold text-accent">
                      ¥{room.rent.toLocaleString()}
                      <span className="text-[10px] font-normal text-muted-foreground">/月</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="glass-card rounded-2xl p-12 text-center">
            <Building className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">请选择楼层查看房间</p>
          </div>
        )}
      </div>

      {/* Batch Operation Bar */}
      <BatchOperationBar
        selectedCount={selectedRooms.size}
        onCancel={handleCancelSelection}
        onBatchEdit={handleBatchEdit}
        onBatchDelete={handleBatchDelete}
      />

      {/* Batch Edit Modal */}
      <BatchEditModal
        isOpen={showBatchEditModal}
        selectedCount={selectedRooms.size}
        onClose={() => setShowBatchEditModal(false)}
        onConfirm={handleBatchEditConfirm}
      />
    </div>
  )
}
