import type { Property, Tenant, Contract, Payment, MaintenanceRequest } from "@/types/property"

// Mock tenants data
export const mockTenants: Tenant[] = [
  {
    id: 1,
    name: "张三",
    phone: "138****8888",
    idCard: "440***********1234",
    emergencyContact: "张父",
    emergencyPhone: "139****9999",
  },
  {
    id: 2,
    name: "李四",
    phone: "139****7777",
    idCard: "440***********5678",
  },
  {
    id: 3,
    name: "王五",
    phone: "137****6666",
    idCard: "440***********9012",
  },
  {
    id: 4,
    name: "赵六",
    phone: "136****6666",
    idCard: "440***********1235",
  },
  {
    id: 5,
    name: "孙七",
    phone: "135****5555",
    idCard: "440***********5679",
  },
  {
    id: 6,
    name: "周八",
    phone: "134****4444",
    idCard: "440***********9013",
  },
  {
    id: 7,
    name: "吴九",
    phone: "133****3333",
    idCard: "440***********1236",
  },
  {
    id: 8,
    name: "郑十",
    phone: "132****2222",
    idCard: "440***********5680",
  },
  {
    id: 9,
    name: "陈十一",
    phone: "131****1111",
    idCard: "440***********9014",
  },
  {
    id: 10,
    name: "林十二",
    phone: "130****0000",
    idCard: "440***********1237",
  },
  {
    id: 11,
    name: "黄十三",
    phone: "158****8888",
    idCard: "440***********5681",
  },
]

// Mock properties data
export const mockProperties: Property[] = [
  {
    id: 1,
    title: "阳光花园 302室",
    category: "residential",
    managementType: "scattered",
    status: "occupied",
    tenant: "张三",
    rent: 4500,
    image: "/modern-apartment.png",
    contractEndsIn: 180,
    maintenanceIssues: 0,
    address: "深圳市福田区阳光花园302室",
    area: 85,
    deposit: 9000,
    paymentDay: 5,
  },
  {
    id: 2,
    title: "碧水豪庭 A座1501",
    category: "urban_apartment",
    managementType: "centralized",
    status: "occupied",
    tenant: "李四",
    rent: 5200,
    image: "/luxury-villa-interior.png",
    contractEndsIn: 240,
    maintenanceIssues: 0,
    buildingName: "碧水豪庭A座",
    floor: 15,
    roomNumber: "1501",
    totalFloors: 32,
  },
  {
    id: 3,
    title: "翠湖雅苑 12栋201",
    category: "residential",
    managementType: "scattered",
    status: "occupied",
    tenant: "王五",
    rent: 3800,
    image: "/modern-loft-interior.jpg",
    contractEndsIn: -30,
    maintenanceIssues: 1,
  },
  {
    id: 4,
    title: "海景公寓 B座2203",
    category: "urban_apartment",
    managementType: "centralized",
    status: "occupied",
    tenant: "赵六",
    rent: 6500,
    image: "/cozy-apartment-bedroom.png",
    contractEndsIn: 120,
    maintenanceIssues: 0,
    buildingName: "海景公寓B座",
    floor: 22,
    roomNumber: "2203",
  },
  {
    id: 5,
    title: "市中心商务公寓 1208",
    category: "urban_apartment",
    managementType: "scattered",
    status: "occupied",
    tenant: "孙七",
    rent: 5800,
    image: "/modern-apartment.png",
    contractEndsIn: 90,
    maintenanceIssues: 0,
  },
  {
    id: 6,
    title: "绿洲花园 5栋303",
    category: "residential",
    managementType: "scattered",
    status: "occupied",
    tenant: "周八",
    rent: 4200,
    image: "/luxury-villa-interior.png",
    contractEndsIn: 200,
    maintenanceIssues: 0,
  },
  {
    id: 7,
    title: "锦绣豪庭 C座801",
    category: "urban_apartment",
    managementType: "centralized",
    status: "occupied",
    tenant: "吴九",
    rent: 7200,
    image: "/modern-loft-interior.jpg",
    contractEndsIn: 150,
    maintenanceIssues: 0,
    buildingName: "锦绣豪庭C座",
    floor: 8,
    roomNumber: "801",
  },
  {
    id: 8,
    title: "城南雅居 16栋102",
    category: "village_apartment",
    managementType: "scattered",
    status: "occupied",
    tenant: "郑十",
    rent: 2800,
    image: "/cozy-apartment-bedroom.png",
    contractEndsIn: 60,
    maintenanceIssues: 1,
  },
  {
    id: 9,
    title: "滨江国际 D座3501",
    category: "urban_apartment",
    managementType: "centralized",
    status: "occupied",
    tenant: "陈十一",
    rent: 8500,
    image: "/modern-apartment.png",
    contractEndsIn: 280,
    maintenanceIssues: 0,
    buildingName: "滨江国际D座",
    floor: 35,
    roomNumber: "3501",
  },
  {
    id: 10,
    title: "华府新城 8栋1201",
    category: "residential",
    managementType: "scattered",
    status: "occupied",
    tenant: "林十二",
    rent: 4800,
    image: "/luxury-villa-interior.png",
    contractEndsIn: 170,
    maintenanceIssues: 0,
  },
  {
    id: 11,
    title: "龙华商务公寓 2108",
    category: "urban_apartment",
    managementType: "scattered",
    status: "occupied",
    tenant: "黄十三",
    rent: 5500,
    image: "/modern-loft-interior.jpg",
    contractEndsIn: 110,
    maintenanceIssues: 0,
  },
  {
    id: 12,
    title: "南山科技园单身公寓 A503",
    category: "urban_apartment",
    managementType: "centralized",
    status: "vacant",
    rent: 3500,
    image: "/cozy-apartment-bedroom.png",
    contractEndsIn: 0,
    maintenanceIssues: 0,
    buildingName: "南山科技园A栋",
    floor: 5,
    roomNumber: "503",
  },
]

// Mock contracts data
export const mockContracts: Contract[] = [
  {
    id: 1,
    propertyId: 1,
    tenantId: 1,
    startDate: "2024-01-15",
    endDate: "2025-01-14",
    rent: 4500,
    deposit: 9000,
    paymentDay: 5,
    status: "active",
  },
  {
    id: 2,
    propertyId: 2,
    tenantId: 2,
    startDate: "2024-03-01",
    endDate: "2025-02-28",
    rent: 5200,
    deposit: 10400,
    paymentDay: 1,
    status: "active",
  },
]

// Mock payments data
export const mockPayments: Payment[] = [
  {
    id: 1,
    contractId: 1,
    propertyId: 1,
    amount: 4500,
    type: "rent",
    status: "paid",
    dueDate: "2024-12-05",
    paidDate: "2024-12-03",
    method: "wechat",
  },
  {
    id: 2,
    contractId: 1,
    propertyId: 1,
    amount: 4500,
    type: "rent",
    status: "overdue",
    dueDate: "2024-11-05",
  },
]

// Mock maintenance requests
export const mockMaintenanceRequests: MaintenanceRequest[] = [
  {
    id: 1,
    propertyId: 3,
    title: "卫生间漏水",
    description: "主卧卫生间天花板漏水，需要立即处理",
    category: "plumbing",
    priority: "urgent",
    status: "in_progress",
    reportedBy: "王五",
    reportedDate: "2024-12-18 14:30",
    assignedTo: "李师傅",
  },
]

// Helper functions to get related data
export function getTenantById(id: number): Tenant | undefined {
  return mockTenants.find((t) => t.id === id)
}

export function getPropertyById(id: number): Property | undefined {
  return mockProperties.find((p) => p.id === id)
}

export function getContractsByPropertyId(propertyId: number): Contract[] {
  return mockContracts.filter((c) => c.propertyId === propertyId)
}

export function getPaymentsByPropertyId(propertyId: number): Payment[] {
  return mockPayments.filter((p) => p.propertyId === propertyId)
}

export function getMaintenanceByPropertyId(propertyId: number): MaintenanceRequest[] {
  return mockMaintenanceRequests.filter((m) => m.propertyId === propertyId)
}
