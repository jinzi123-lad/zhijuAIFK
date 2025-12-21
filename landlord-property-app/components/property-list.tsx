"use client"

import { useState } from "react"
import { PropertyGroupSection } from "@/components/property-group-section"
import { BuildingFloorView } from "@/components/building-floor-view"
import { CommonAreasView } from "@/components/common-areas-view"
import { AddPropertyModal } from "@/components/add-property-modal"
import { PropertyDetailModal } from "@/components/property-detail-modal"
import { AddTenantModal } from "@/components/add-tenant-modal"
import { AddContractModal } from "@/components/add-contract-modal"
import { PaymentListModal } from "@/components/payment-list-modal"
import { MaintenanceListModal } from "@/components/maintenance-list-modal"
import { StatsBar } from "@/components/stats-bar"
import { FilterTabs } from "@/components/filter-tabs"
import { Button } from "@/components/ui/button"
import { Plus, Building2, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import type { Property, Tenant, Contract } from "@/types/property"

type PropertyStatus = "all" | "rented" | "vacant"

const properties: Property[] = [
  // 分散式房源
  {
    id: 1,
    title: "阳光公寓 302",
    category: "residential",
    managementType: "scattered",
    status: "occupied",
    tenant: "张伟",
    rent: 4500,
    image: "/modern-apartment.png",
    contractEndsIn: 20,
    maintenanceIssues: 0,
    address: "北京市朝阳区阳光路123号",
    area: 85,
    deposit: 9000,
    paymentDay: 5,
    facilities: ["空调", "冰箱", "洗衣机", "热水器", "宽带"],
    description: "精装修两室一厅，采光好，交通便利，近地铁站",
  },
  {
    id: 2,
    title: "翠谷别墅 8号",
    category: "villa",
    managementType: "scattered",
    status: "occupied",
    tenant: "李梅",
    rent: 8900,
    image: "/luxury-villa-interior.png",
    contractEndsIn: 45,
    maintenanceIssues: 1,
    address: "北京市海淀区翠谷路8号",
    area: 280,
    deposit: 26700,
    paymentDay: 10,
    facilities: ["花园", "车库", "地暖", "中央空调", "智能家居"],
    description: "独栋别墅，带私家花园和车库，高端社区",
  },
  {
    id: 3,
    title: "市中心阁楼 1205",
    category: "residential",
    managementType: "scattered",
    status: "vacant",
    tenant: null,
    rent: 5800,
    image: "/modern-loft-interior.jpg",
    contractEndsIn: null,
    maintenanceIssues: 0,
    address: "北京市东城区建国门大街",
    area: 95,
    deposit: 11600,
    paymentDay: 5,
    facilities: ["空调", "冰箱", "洗衣机"],
    description: "挑高loft，位于市中心核心地段",
  },
  // 集中式公寓 - 天悦公寓
  {
    id: 7,
    title: "1601室",
    category: "urban_apartment",
    managementType: "centralized",
    buildingName: "天悦公寓A座",
    floor: 16,
    roomNumber: "1601",
    status: "occupied",
    tenant: "赵丽",
    rent: 4200,
    image: "/modern-apartment.png",
    contractEndsIn: 30,
    maintenanceIssues: 0,
  },
  {
    id: 8,
    title: "1602室",
    category: "urban_apartment",
    managementType: "centralized",
    buildingName: "天悦公寓A座",
    floor: 16,
    roomNumber: "1602",
    status: "vacant",
    tenant: null,
    rent: 4200,
    image: "/cozy-apartment-bedroom.png",
    contractEndsIn: null,
    maintenanceIssues: 0,
  },
  {
    id: 9,
    title: "1503室",
    category: "urban_apartment",
    managementType: "centralized",
    buildingName: "天悦公寓A座",
    floor: 15,
    roomNumber: "1503",
    status: "occupied",
    tenant: "孙强",
    rent: 4100,
    image: "/modern-loft-interior.jpg",
    contractEndsIn: 55,
    maintenanceIssues: 1,
  },
  {
    id: 10,
    title: "801室",
    category: "urban_apartment",
    managementType: "centralized",
    buildingName: "天悦公寓B座",
    floor: 8,
    roomNumber: "801",
    status: "occupied",
    tenant: "周敏",
    rent: 3900,
    image: "/luxury-city-view-apartment.png",
    contractEndsIn: 15,
    maintenanceIssues: 0,
  },
  // 原有的分散式房源
  {
    id: 4,
    title: "珍珠花园 15B",
    category: "residential",
    managementType: "scattered",
    status: "occupied",
    tenant: "王强",
    rent: 3800,
    image: "/cozy-apartment-bedroom.png",
    contractEndsIn: 12,
    maintenanceIssues: 0,
    address: "北京市朝阳区珍珠花园15B",
    area: 70,
    deposit: 8000,
    paymentDay: 15,
    facilities: ["空调", "冰箱", "洗衣机", "热水器"],
    description: "舒适两室一厅，环境优雅",
  },
  {
    id: 5,
    title: "海景雅居 2301",
    category: "residential",
    managementType: "scattered",
    status: "occupied",
    tenant: "陈晓",
    rent: 7200,
    image: "/luxury-city-view-apartment.png",
    contractEndsIn: 67,
    maintenanceIssues: 2,
    address: "北京市朝阳区海景雅居2301",
    area: 120,
    deposit: 21600,
    paymentDay: 20,
    facilities: ["海景", "空调", "冰箱", "洗衣机"],
    description: "拥有海景的豪华公寓",
  },
  {
    id: 6,
    title: "江畔单身公寓 9号",
    category: "village_apartment",
    managementType: "scattered",
    status: "vacant",
    tenant: null,
    rent: 3200,
    image: "/small-studio-apartment.png",
    contractEndsIn: null,
    maintenanceIssues: 0,
    address: "北京市朝阳区江畔单身公寓9号",
    area: 50,
    deposit: 6000,
    paymentDay: 25,
    facilities: ["空调", "冰箱"],
    description: "简洁实用的单身公寓",
  },
]

const commonAreas = [
  {
    id: 1,
    buildingName: "天悦公寓A座",
    name: "1号电梯",
    type: "elevator" as const,
    status: "normal" as const,
    lastMaintenance: "2025-01-05",
    notes: "定期保养，运行正常",
  },
  {
    id: 2,
    buildingName: "天悦公寓A座",
    name: "2号电梯",
    type: "elevator" as const,
    status: "maintenance" as const,
    lastMaintenance: "2025-01-10",
    notes: "正在进行年度大修，预计1月20日完成",
  },
  {
    id: 3,
    buildingName: "天悦公寓A座",
    name: "地下停车场",
    type: "parking" as const,
    status: "normal" as const,
    lastMaintenance: "2024-12-28",
    notes: "共150个车位，照明系统已更换LED",
  },
  {
    id: 4,
    buildingName: "天悦公寓A座",
    name: "一层大堂",
    type: "lobby" as const,
    status: "warning" as const,
    lastMaintenance: "2024-11-15",
    notes: "自动门感应器故障，已联系维修人员",
  },
  {
    id: 5,
    buildingName: "天悦公寓B座",
    name: "健身房",
    type: "gym" as const,
    status: "normal" as const,
    lastMaintenance: "2025-01-08",
    notes: "器械已消毒，空调运行正常",
  },
]

export function PropertyList() {
  const router = useRouter()
  const [filter, setFilter] = useState<PropertyStatus>("all")
  const [viewMode, setViewMode] = useState<"list" | "building" | "commonAreas">("list")
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isAddTenantModalOpen, setIsAddTenantModalOpen] = useState(false)
  const [isAddContractModalOpen, setIsAddContractModalOpen] = useState(false)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false)
  const [newTenant, setNewTenant] = useState<(Tenant & { tenantId: number }) | null>(null)

  const filteredProperties = properties.filter((property) => {
    if (filter === "all") return true
    if (filter === "rented") return property.status === "occupied"
    if (filter === "vacant") return property.status === "vacant"
    return true
  })

  const scatteredProperties = filteredProperties.filter((p) => p.managementType === "scattered")
  const apartmentProperties = filteredProperties.filter((p) => p.managementType === "centralized")

  const stats = {
    total: properties.length,
    vacant: properties.filter((p) => p.status === "vacant").length,
    occupied: properties.filter((p) => p.status === "occupied").length,
  }

  const handleViewBuilding = (buildingName: string) => {
    setSelectedBuilding(buildingName)
    setViewMode("building")
  }

  const handleBackToList = () => {
    setViewMode("list")
    setSelectedBuilding(null)
  }

  const handleViewCommonAreas = (buildingName: string) => {
    setSelectedBuilding(buildingName)
    setViewMode("commonAreas")
  }

  const handleAddProperty = (property: Omit<Property, "id">) => {
    console.log("[v0] New property added:", property)
  }

  const handlePropertyClick = (property: Property) => {
    setSelectedProperty(property)
    setIsDetailModalOpen(true)
  }

  const handleRoomClick = (room: any) => {
    const property = properties.find((p) => p.id === room.id)
    if (property) {
      handlePropertyClick(property)
    }
  }

  const handleAddTenant = () => {
    setIsDetailModalOpen(false)
    setIsAddTenantModalOpen(true)
  }

  const handleTenantSubmit = (tenant: Omit<Tenant, "id">) => {
    console.log("[v0] New tenant:", tenant)
    const tenantWithId = { ...tenant, id: Date.now(), tenantId: Date.now() }
    setNewTenant(tenantWithId)
    setIsAddTenantModalOpen(false)
    setIsAddContractModalOpen(true)
  }

  const handleContractSubmit = (contract: Omit<Contract, "id">) => {
    console.log("[v0] New contract:", contract)
    setIsAddContractModalOpen(false)
    setIsDetailModalOpen(true)
  }

  const handleViewContract = () => {
    console.log("[v0] View contract for property:", selectedProperty?.id)
  }

  const handleAddPayment = () => {
    setIsDetailModalOpen(false)
    setIsPaymentModalOpen(true)
  }

  const handleAddMaintenance = () => {
    setIsDetailModalOpen(false)
    setIsMaintenanceModalOpen(true)
  }

  const handleEditProperty = () => {
    console.log("[v0] Edit property:", selectedProperty?.id)
  }

  if (viewMode === "commonAreas" && selectedBuilding) {
    const buildingCommonAreas = commonAreas.filter((area) => area.buildingName === selectedBuilding)
    return (
      <CommonAreasView buildingName={selectedBuilding} commonAreas={buildingCommonAreas} onBack={handleBackToList} />
    )
  }

  if (viewMode === "building" && selectedBuilding) {
    const buildingRooms = apartmentProperties.filter((p) => p.buildingName === selectedBuilding)
    return (
      <BuildingFloorView
        buildingName={selectedBuilding}
        rooms={buildingRooms.map((p) => ({
          id: p.id,
          title: p.title,
          floor: p.floor!,
          roomNumber: p.roomNumber!,
          status: p.status,
          tenant: p.tenant,
          rent: p.rent,
        }))}
        onBack={handleBackToList}
        onRoomClick={handleRoomClick}
        onViewCommonAreas={handleViewCommonAreas}
      />
    )
  }

  return (
    <div className="min-h-screen pb-6">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-light border-b border-white/30 px-4 py-4 mb-4">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.push("/")} className="w-9 h-9 rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Building2 className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-semibold text-primary">我的房产</h1>
          </div>
          <Button
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full h-9 px-4"
          >
            <Plus className="w-4 h-4 mr-1" />
            添加房产
          </Button>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 space-y-4">
        {/* Stats Bar */}
        <StatsBar stats={stats} />
        <FilterTabs currentFilter={filter} onFilterChange={setFilter} />

        {apartmentProperties.length > 0 && (
          <PropertyGroupSection
            title="集中式公寓"
            managementType="centralized"
            properties={apartmentProperties}
            onViewBuilding={handleViewBuilding}
            onPropertyClick={handlePropertyClick}
          />
        )}

        {scatteredProperties.length > 0 && (
          <PropertyGroupSection
            title="分散式房源"
            managementType="scattered"
            properties={scatteredProperties}
            onPropertyClick={handlePropertyClick}
          />
        )}

        {filteredProperties.length === 0 && (
          <div className="glass-card rounded-2xl p-12 text-center">
            <p className="text-muted-foreground">暂无房产</p>
          </div>
        )}
      </div>

      {/* Modals */}
      <AddPropertyModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSubmit={handleAddProperty} />

      <PropertyDetailModal
        property={selectedProperty}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onEdit={handleEditProperty}
        onAddTenant={handleAddTenant}
        onViewContract={handleViewContract}
        onAddPayment={handleAddPayment}
        onAddMaintenance={handleAddMaintenance}
      />

      <AddTenantModal
        isOpen={isAddTenantModalOpen}
        onClose={() => setIsAddTenantModalOpen(false)}
        onSubmit={handleTenantSubmit}
      />

      {selectedProperty && newTenant && (
        <AddContractModal
          isOpen={isAddContractModalOpen}
          onClose={() => setIsAddContractModalOpen(false)}
          onSubmit={handleContractSubmit}
          propertyId={selectedProperty.id}
          tenantId={newTenant.tenantId}
          suggestedRent={selectedProperty.rent}
        />
      )}

      {selectedProperty && (
        <>
          <PaymentListModal
            isOpen={isPaymentModalOpen}
            onClose={() => {
              setIsPaymentModalOpen(false)
              setIsDetailModalOpen(true)
            }}
            propertyId={selectedProperty.id}
            propertyTitle={selectedProperty.title}
            onAddPayment={() => console.log("[v0] Add payment")}
          />

          <MaintenanceListModal
            isOpen={isMaintenanceModalOpen}
            onClose={() => {
              setIsMaintenanceModalOpen(false)
              setIsDetailModalOpen(true)
            }}
            propertyId={selectedProperty.id}
            propertyTitle={selectedProperty.title}
            onAddMaintenance={() => console.log("[v0] Add maintenance")}
          />
        </>
      )}
    </div>
  )
}
