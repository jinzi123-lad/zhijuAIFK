export type PropertyCategory =
  | "residential"
  | "urban_apartment"
  | "village_apartment"
  | "villa"
  | "factory"
  | "office"
  | "shop"
  | "other"
export type PropertyManagementType = "scattered" | "centralized"
export type PropertyStatus = "occupied" | "vacant"

export interface Property {
  id: number
  title: string
  category: PropertyCategory // 房源类型：住宅、城市公寓等
  managementType: PropertyManagementType // 管理类型：分散式或集中式
  status: PropertyStatus
  tenant: string | null
  rent: number
  image: string
  contractEndsIn: number | null
  maintenanceIssues: number
  buildingName?: string
  floor?: number
  roomNumber?: string
  totalFloors?: number
  totalRooms?: number
  address?: string
  area?: number
  deposit?: number
  paymentDay?: number
  facilities?: string[]
  description?: string
}

export const propertyCategoryLabels: Record<PropertyCategory, string> = {
  residential: "住宅",
  urban_apartment: "城市公寓",
  village_apartment: "城中村公寓",
  villa: "别墅",
  factory: "工厂",
  office: "写字楼",
  shop: "商铺",
  other: "其他",
}

export interface ApartmentBuilding {
  id: number
  name: string
  address: string
  totalFloors: number
  totalRooms: number
  rooms: Property[]
}

export interface CommonArea {
  id: number
  buildingId: number
  name: string
  type: "elevator" | "parking" | "lobby" | "gym" | "other"
  status: "normal" | "maintenance" | "warning"
  lastMaintenance: string
  notes?: string
}

export interface Tenant {
  id: number
  name: string
  phone: string
  idCard: string
  emergencyContact?: string
  emergencyPhone?: string
}

export interface Contract {
  id: number
  propertyId: number
  tenantId: number
  startDate: string
  endDate: string
  rent: number
  deposit: number
  paymentDay: number
  status: "active" | "expired" | "terminated"
  documents?: string[]
}

export interface Payment {
  id: number
  contractId: number
  propertyId: number
  amount: number
  type: "rent" | "deposit" | "utilities" | "maintenance"
  status: "paid" | "pending" | "overdue"
  dueDate: string
  paidDate?: string
  method?: "cash" | "transfer" | "wechat" | "alipay"
  notes?: string
}

export interface MaintenanceRequest {
  id: number
  propertyId: number
  title: string
  description: string
  category: "plumbing" | "electrical" | "appliance" | "structure" | "other"
  priority: "low" | "medium" | "high" | "urgent"
  status: "pending" | "in_progress" | "completed" | "cancelled"
  reportedBy: string
  reportedDate: string
  assignedTo?: string
  completedDate?: string
  cost?: number
  images?: string[]
}
