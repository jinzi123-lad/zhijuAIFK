

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN', // 超级管理员
  ADMIN = 'ADMIN',             // 管理员
  MANAGER = 'MANAGER',         // 主管
  SALES = 'SALES',             // 销售
  LANDLORD = 'LANDLORD',       // 房东
  USER = 'USER',               // 普通用户
  FINANCE = 'FINANCE',         // 财务专员
  ADMIN_STAFF = 'ADMIN_STAFF'  // 行政/运营
}

export type Permission =
  | 'PROPERTY_CREATE' | 'PROPERTY_EDIT' | 'PROPERTY_DELETE' | 'PROPERTY_VIEW_ALL' | 'PROPERTY_MANAGE_OWN'
  | 'CLIENT_CREATE' | 'CLIENT_EDIT' | 'CLIENT_VIEW_ALL' | 'CLIENT_ASSIGN'
  | 'ORDER_MANAGE' | 'DATA_EXPORT' | 'VIEW_DASHBOARD'
  | 'USER_MANAGE'
  | 'SYSTEM_SETTINGS';

export interface User {
  id: string;
  username: string;
  password?: string; // Only for mock auth logic
  role: UserRole;
  name: string;

  // Hierarchy & Grouping
  managerId?: string; // ID of direct supervisor
  group?: string;     // e.g. "Sales Team A", "Marketing"

  // Granular Permissions
  permissions: Permission[];

  favorites?: string[]; // List of favorited property IDs
}

export enum PropertyType {
  RENT = 'RENT',
  SALE = 'SALE'
}

export enum PropertyStatus {
  AVAILABLE = 'AVAILABLE', // 在租/在售
  LOCKED = 'LOCKED',       // 预定/签约中/交易中
  RENTED = 'RENTED',       // 已租
  SOLD = 'SOLD'            // 已售
}

export type PropertyCategory = '住宅' | '城市公寓' | '城中村公寓' | '别墅' | '工厂' | '写字楼' | '商铺' | '其他';

export enum LandlordType {
  INDIVIDUAL = 'INDIVIDUAL', // 个人房东 (Single Unit)
  CORPORATE = 'CORPORATE'    // 企业/集中式房东 (Multi-Unit)
}

export interface PropertyUnit {
  id: string;
  name: string; // e.g. "A户型-豪华大床房"
  price: number;
  area: number;
  layout: string;
  imageUrl?: string;
  imageUrls?: string[]; // [NEW] Multiple images for the unit
  description?: string;
  status?: PropertyStatus; // [NEW] Status for specific unit (Available, Rented, etc.)
}

export interface LandlordContact {
  name: string;
  phone: string;
  wechat?: string;
  note?: string;
}

// New Interface for Detailed Property Inspection & Compliance
export interface PropertyDetailedInfo {
  // Exact Location Details
  buildingNum?: string;   // 楼号
  unitNum?: string;       // 单元号
  floorNum?: string;      // 楼层

  // Documents
  documentUrls?: string[]; // IDs, Deeds, Contracts

  // Inspection / Physical Condition
  utilitiesStatus?: string; // 水电燃气家电状态
  wallCondition?: string;   // 墙面窗边状况 (裂缝/水印/掉皮)
  soundproofing?: string;   // 门窗隔音
  fireSafety?: string;      // 消防设施
  doorLock?: string;        // 门锁牢固度

  // Financial & Lease Terms
  paymentMethod?: string;   // 租金支付方式
  depositRatio?: string;    // 押金比例
  breachTerms?: string;     // 违约责任明确

  // Environment & Neighborhood
  moveInDate?: string;      // 可搬家时间
  surroundings?: string[];  // 周边环境 (Array of selected options)
  securityLevel?: string;   // 治安状况
  propertyMgmt?: string;    // 物业管理水平
  nearbyFacilities?: string[]; // 周边配套 (Traffic, Medical, Shopping)
}

// -- Viewing Agent Entity --
export interface ViewingAgent {
  id: string;
  name: string;
  phone: string;
  region: string;      // e.g., "Chaoyang District"
  defaultFee?: number; // Default viewing fee
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Property {
  id: string;
  title: string;
  type: PropertyType;
  category: PropertyCategory;
  status?: PropertyStatus; // New status field
  price: number; // For Corporate, this can be the starting price
  area: number; // For Corporate, this can be the starting area
  layout: string;
  location: string;
  address: string;
  tags: string[];
  imageUrl: string;
  imageUrls?: string[];
  videoUrls?: string[];
  description: string;
  commuteInfo?: string;
  coordinates: { lat: number; lng: number };
  floorPlanUrl?: string;
  vrUrl?: string;
  leaseTerms?: string[];
  leaseCommissions?: Record<string, string>;

  // New Fields for Multi-Unit Support
  landlordType?: LandlordType;
  units?: PropertyUnit[];

  // Landlord Contacts
  landlordContacts?: LandlordContact[];

  // Detailed Inspection Info
  details?: PropertyDetailedInfo;
}

export interface PropertyViewConfig {
  showPrice: boolean;
  showAddress: boolean;
  showMedia: boolean;
  showDescription: boolean;
  showCommission: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

// -- Knowledge Base Types --
export type KnowledgeType = 'TEXT' | 'FILE' | 'URL' | 'IMAGE';

export interface KnowledgeItem {
  id: string;
  title: string;
  category: string; // Category for organization
  type: KnowledgeType;
  content: string; // The actual text content used for AI context
  sourceName?: string; // filename or url
  imageUrl?: string; // Display url for image types
  createdAt: string;
}

// -- CRM: Client Management Types --
export enum ClientStatus {
  PENDING = 'PENDING',     // 待分配
  NEW = 'NEW',             // 新客
  FOLLOWING = 'FOLLOWING', // 跟进中
  INTENTION = 'INTENTION', // 高意向
  SIGNED = 'SIGNED',       // 已签约 (成交)
  ARCHIVED = 'ARCHIVED'    // 已归档 (历史/无效)
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  requirements: string; // 需求描述
  budget: string;
  status: ClientStatus;
  source: string; // 来源
  agentId?: string; // 归属人
  lastContactDate: string;
  notes?: string;

  // Lifecycle & Archive
  archiveReason?: string;
  archivedAt?: string;

  // Contract Info (Renewal)
  contractId?: string;
  leaseStartDate?: string;
  leaseEndDate?: string;

  followUps?: FollowUpRecord[];
}

export interface FollowUpRecord {
  id: string;
  date: string;
  content: string;
  recorderName: string;
}

// -- Order Management Types --
export enum OrderStatus {
  VIEWING = 'VIEWING',     // 看房中
  PENDING = 'PENDING',     // 签约/进行中
  COMPLETED = 'COMPLETED', // 已成交
  CANCELLED = 'CANCELLED'  // 已取消
}

export interface Order {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyImage?: string;
  unitId?: string;       // [NEW] Linked Unit ID
  unitName?: string;     // For corporate units

  // [NEW] Snapshot of property and deal at the time of completion
  snapshot?: {
    propertyTitle: string;
    propertyAddress: string;
    propertySpecs: string;
    unitName?: string;
    clientName: string;
    clientContact: string;
    agentName: string;
    agentPhone: string;
    dealPrice: number;
    contractDate: string;
  };

  clientId: string; // Link to Client
  clientName: string;
  clientPhone?: string;

  agentId: string;
  agentName: string;

  type: PropertyType; // Rent Only
  price: number;      // Deal price (or viewing fee input in some contexts)
  commission?: number;

  // [NEW] Viewing Agent Info
  viewingAgentName?: string;  // Can be manual input
  viewingAgentPhone?: string;
  viewingFee?: number;        // Custom fee for this specific order
  viewingStatus?: 'ASSIGNED' | 'PENDING_DEAL' | 'PAID' | 'VOID';

  status: OrderStatus;

  viewingDate?: string; // For VIEWING
  contractDate?: string; // For PENDING/COMPLETED
  createdAt: string;
  notes?: string;
}

// -- System Logs Types --
export interface SystemLog {
  id: number | string;
  action: string;
  user: string;
  ip: string;
  time: string;
  status: '成功' | '失败';
}

// -- System Configuration --
export interface SystemConfig {
  systemName: string;
  announcement: string;
  supportPhone: string;
  maintenanceMode: boolean;
  allowRegistration: boolean;


}

// -- MediaPipe Hands Types --
export interface NormalizedLandmark {
  x: number;
  y: number;
  z: number;
}

export interface HandResults {
  multiHandLandmarks: NormalizedLandmark[][];
  multiHandedness: any[];
  image: any;
}
