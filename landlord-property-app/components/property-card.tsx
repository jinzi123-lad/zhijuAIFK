"use client"

import { Clock, Wrench, User, Building } from "lucide-react"
import Image from "next/image"
import type { Property } from "@/types/property"
import { propertyCategoryLabels } from "@/types/property"

interface PropertyCardProps {
  property: Property
  onClick?: () => void
}

export function PropertyCard({ property, onClick }: PropertyCardProps) {
  const isOccupied = property.status === "occupied"

  return (
    <div
      onClick={onClick}
      className="glass-card glass-shimmer rounded-2xl p-3 hover:shadow-lg transition-all duration-300 active:scale-[0.98] cursor-pointer"
    >
      <div className="flex gap-3">
        {/* Thumbnail */}
        <div className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden">
          <Image src={property.image || "/placeholder.svg"} alt={property.title} fill className="object-cover" />
          {/* Status Badge */}
          <div
            className={`
            absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-medium
            ${isOccupied ? "bg-success/90 text-white" : "bg-warning/90 text-white"}
          `}
          >
            {isOccupied ? "已租" : "空置"}
          </div>
          {property.managementType === "centralized" && property.buildingName && (
            <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-primary/80 text-white flex items-center gap-0.5">
              <Building className="w-2.5 h-2.5" />
              公寓
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {property.managementType === "centralized" && property.buildingName && (
            <div className="text-[10px] text-muted-foreground mb-0.5">
              {property.buildingName} {property.floor && `· ${property.floor}楼`} {property.roomNumber}
            </div>
          )}
          <h3 className="font-semibold text-foreground text-balance mb-1">{property.title}</h3>

          <div className="text-[10px] text-muted-foreground/70 mb-1">{propertyCategoryLabels[property.category]}</div>

          {/* Tenant Info */}
          {isOccupied && property.tenant && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
              <User className="w-3 h-3" />
              <span>{property.tenant}</span>
            </div>
          )}

          {/* Rent */}
          <p className="text-lg font-bold text-accent mb-2">
            ¥{property.rent.toLocaleString()}
            <span className="text-xs font-normal text-muted-foreground">/月</span>
          </p>

          {/* Footer Info */}
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            {isOccupied && property.contractEndsIn !== null && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{property.contractEndsIn}天后到期</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Wrench className="w-3 h-3" />
              <span>维修: {property.maintenanceIssues}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
