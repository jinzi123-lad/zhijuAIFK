"use client"

import { PropertyCard } from "@/components/property-card"
import { Building2, Home, ChevronDown, Grid3x3 } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import type { Property, PropertyManagementType } from "@/types/property"

interface PropertyGroupSectionProps {
  title: string
  managementType: PropertyManagementType
  properties: Property[]
  defaultExpanded?: boolean
  onViewBuilding?: (buildingName: string) => void
}

export function PropertyGroupSection({
  title,
  managementType,
  properties,
  defaultExpanded = true,
  onViewBuilding,
}: PropertyGroupSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  const occupiedCount = properties.filter((p) => p.status === "occupied").length
  const vacantCount = properties.filter((p) => p.status === "vacant").length

  // 按楼栋分组（仅集中式）
  const buildingGroups =
    managementType === "centralized"
      ? properties.reduce(
          (acc, property) => {
            const building = property.buildingName || "未分类"
            if (!acc[building]) {
              acc[building] = []
            }
            acc[building].push(property)
            return acc
          },
          {} as Record<string, Property[]>,
        )
      : {}

  return (
    <div className="space-y-3">
      {/* Section Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-3 py-2 glass-card rounded-xl hover:shadow-md transition-all duration-200 active:scale-[0.98]"
      >
        <div className="flex items-center gap-2">
          {managementType === "centralized" ? (
            <Building2 className="w-4 h-4 text-primary" />
          ) : (
            <Home className="w-4 h-4 text-primary" />
          )}
          <span className="text-sm font-semibold text-foreground">{title}</span>
          <span className="text-xs text-muted-foreground">({properties.length})</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2 py-0.5 rounded-full bg-success/10 text-success font-medium">
              已租 {occupiedCount}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-warning/10 text-warning font-medium">空置 {vacantCount}</span>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {/* Property Cards */}
      {isExpanded && (
        <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          {managementType === "centralized" && Object.keys(buildingGroups).length > 0
            ? // 集中式公寓 - 按楼栋分组显示
              Object.entries(buildingGroups).map(([buildingName, buildingProperties]) => (
                <div key={buildingName} className="space-y-2">
                  <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-primary/70" />
                      <span className="text-xs font-medium text-muted-foreground">{buildingName}</span>
                      <span className="text-xs text-muted-foreground/60">({buildingProperties.length}间)</span>
                    </div>
                    {onViewBuilding && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onViewBuilding(buildingName)}
                        className="h-7 text-xs text-primary hover:text-primary/80 hover:bg-primary/10"
                      >
                        <Grid3x3 className="w-3 h-3 mr-1" />
                        楼层视图
                      </Button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {buildingProperties.map((property) => (
                      <PropertyCard key={property.id} property={property} />
                    ))}
                  </div>
                </div>
              ))
            : // 分散式房源 - 普通列表
              properties.map((property) => <PropertyCard key={property.id} property={property} />)}
        </div>
      )}
    </div>
  )
}
