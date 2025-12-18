import { supabase } from './supabaseClient';
import { Property, User, Client, Order, SystemLog, KnowledgeItem, SystemConfig, ViewingAgent } from '../types';
import { INITIAL_USERS, MOCK_PROPERTIES, MOCK_CLIENTS, MOCK_ORDERS, INITIAL_SYSTEM_LOGS, INITIAL_KNOWLEDGE_BASE, MOCK_VIEWING_AGENTS } from '../constants';

// --- Local In-Memory Store (Fallback for Mock Mode) ---
let _mockProperties = [...MOCK_PROPERTIES];
let _mockUsers = [...INITIAL_USERS];
let _mockClients = [...MOCK_CLIENTS];
let _mockOrders = [...MOCK_ORDERS];
let _mockKnowledge = [...INITIAL_KNOWLEDGE_BASE];
let _mockLogs = [...INITIAL_SYSTEM_LOGS];
let _mockConfig: SystemConfig | null = null;

// --- Data Mapping Helpers (App <-> Database) ---
const mapPropertyFromDB = (row: any): Property => ({
    ...row,
    imageUrl: row.image_url,
    imageUrls: row.image_urls || [],
    videoUrls: row.video_urls || [],
    commuteInfo: row.commute_info,
    floorPlanUrl: row.floor_plan_url,
    vrUrl: row.vr_url,
    leaseTerms: row.lease_terms || [],
    leaseCommissions: row.lease_commissions || {},
    landlordType: row.landlord_type,
    landlordContacts: row.landlord_contacts || [],
});

const mapPropertyToDB = (p: Property) => ({
    id: p.id,
    title: p.title,
    type: p.type,
    category: p.category,
    status: p.status,
    price: p.price,
    area: p.area,
    layout: p.layout,
    location: p.location,
    address: p.address,
    tags: p.tags,
    image_url: p.imageUrl,
    image_urls: p.imageUrls,
    video_urls: p.videoUrls,
    description: p.description,
    commute_info: p.commuteInfo,
    coordinates: p.coordinates,
    floor_plan_url: p.floorPlanUrl,
    vr_url: p.vrUrl,
    lease_terms: p.leaseTerms,
    lease_commissions: p.leaseCommissions,
    landlord_type: p.landlordType,
    units: p.units,
    landlord_contacts: p.landlordContacts,
    details: p.details
});

const mapUserFromDB = (row: any): User => ({
    ...row,
    group: row.group_name,
    managerId: row.manager_id,
});

const mapUserToDB = (u: User) => ({
    id: u.id,
    username: u.username,
    password: u.password,
    role: u.role,
    name: u.name,
    group_name: u.group,
    manager_id: u.managerId,
    permissions: u.permissions,
    favorites: u.favorites
});

const mapClientFromDB = (row: any): Client => ({
    ...row,
    agentId: row.agent_id,
    lastContactDate: row.last_contact_date,
});

const mapClientToDB = (c: Client) => ({
    id: c.id,
    name: c.name,
    phone: c.phone,
    requirements: c.requirements,
    budget: c.budget,
    status: c.status,
    source: c.source,
    agent_id: c.agentId,
    last_contact_date: c.lastContactDate,
    notes: c.notes
});

const mapOrderFromDB = (row: any): Order => ({
    ...row,
    propertyId: row.property_id,
    propertyTitle: row.property_title,
    propertyImage: row.property_image,
    unitName: row.unit_name,
    clientId: row.client_id,
    clientName: row.client_name,
    clientPhone: row.client_phone,
    agentId: row.agent_id,
    agentName: row.agent_name,
    viewingDate: row.viewing_date,
    contractDate: row.contract_date,
    createdAt: row.created_at_str || row.created_at,
});

const mapOrderToDB = (o: Order) => ({
    id: o.id,
    property_id: o.propertyId,
    property_title: o.propertyTitle,
    property_image: o.propertyImage,
    unit_name: o.unitName,
    client_id: o.clientId,
    client_name: o.clientName,
    client_phone: o.clientPhone,
    agent_id: o.agentId,
    agent_name: o.agentName,
    type: o.type,
    price: o.price,
    commission: o.commission,
    status: o.status,
    viewing_date: o.viewingDate,
    contract_date: o.contractDate,
    notes: o.notes,
    created_at_str: o.createdAt
});

const mapKnowledgeFromDB = (row: any): KnowledgeItem => ({
    ...row,
    sourceName: row.source_name,
    imageUrl: row.image_url,
    createdAt: row.created_at_str || row.created_at
});

const mapKnowledgeToDB = (k: KnowledgeItem) => ({
    id: k.id,
    title: k.title,
    category: k.category,
    type: k.type,
    content: k.content,
    source_name: k.sourceName,
    image_url: k.imageUrl,
    created_at_str: k.createdAt
});

const mapLogFromDB = (row: any): SystemLog => ({
    ...row,
    user: row.user_name,
});

const mapLogToDB = (l: SystemLog) => ({
    action: l.action,
    user_name: l.user,
    ip: l.ip,
    time: l.time,
    status: l.status
});

// Helper to handle response or fallback
const handleDBResponse = async <T>(
    operation: Promise<{ data: any, error: any }>,
    mockData: T,
    transform?: (data: any) => T
): Promise<T> => {
    try {
        const { data, error } = await operation;
        if (error) throw error;
        if (transform) return transform(data);
        return data as T;
    } catch (e) {
        // Silent fallback to mock data
        return mockData;
    }
};

export const db = {
    // --- Properties ---
    getProperties: async (): Promise<Property[]> => {
        try {
            const { data, error } = await supabase.from('properties').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            return data.map(mapPropertyFromDB);
        } catch (e) {
            return _mockProperties;
        }
    },
    saveProperty: async (item: Property): Promise<Property[]> => {
        try {
            const { error } = await supabase.from('properties').upsert(mapPropertyToDB(item));
            if (error) throw error;
            return db.getProperties();
        } catch (e) {
            // Fallback: update local mock
            const index = _mockProperties.findIndex(p => p.id === item.id);
            if (index >= 0) _mockProperties[index] = item;
            else _mockProperties.unshift(item);
            return _mockProperties;
        }
    },
    deleteProperty: async (id: string): Promise<Property[]> => {
        try {
            const { error } = await supabase.from('properties').delete().eq('id', id);
            if (error) throw error;
            return db.getProperties();
        } catch (e) {
            _mockProperties = _mockProperties.filter(p => p.id !== id);
            return _mockProperties;
        }
    },

    // --- Users ---
    getUsers: async (): Promise<User[]> => {
        try {
            const { data, error } = await supabase.from('erp_users').select('*');
            if (error) throw error;
            if (data.length === 0) return _mockUsers;
            return data.map(mapUserFromDB);
        } catch (e) {
            return _mockUsers;
        }
    },
    saveUser: async (item: User): Promise<User[]> => {
        try {
            const { error } = await supabase.from('erp_users').upsert(mapUserToDB(item));
            if (error) throw error;
            return db.getUsers();
        } catch (e) {
            const index = _mockUsers.findIndex(u => u.id === item.id);
            if (index >= 0) _mockUsers[index] = item;
            else _mockUsers.push(item);
            return _mockUsers;
        }
    },
    deleteUser: async (id: string): Promise<User[]> => {
        try {
            const { error } = await supabase.from('erp_users').delete().eq('id', id);
            if (error) throw error;
            return db.getUsers();
        } catch (e) {
            _mockUsers = _mockUsers.filter(u => u.id !== id);
            return _mockUsers;
        }
    },

    // --- Clients ---
    getClients: async (): Promise<Client[]> => {
        try {
            const { data, error } = await supabase.from('clients').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            return data.map(mapClientFromDB);
        } catch (e) {
            return _mockClients;
        }
    },
    saveClient: async (item: Client): Promise<Client[]> => {
        try {
            const { error } = await supabase.from('clients').upsert(mapClientToDB(item));
            if (error) throw error;
            return db.getClients();
        } catch (e) {
            const index = _mockClients.findIndex(c => c.id === item.id);
            if (index >= 0) _mockClients[index] = item;
            else _mockClients.unshift(item);
            return _mockClients;
        }
    },

    // --- Orders ---
    getOrders: async (): Promise<Order[]> => {
        try {
            const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            return data.map(mapOrderFromDB);
        } catch (e) {
            return _mockOrders;
        }
    },
    saveOrder: async (item: Order): Promise<Order[]> => {
        try {
            const { error } = await supabase.from('orders').upsert(mapOrderToDB(item));
            if (error) throw error;
            return db.getOrders();
        } catch (e) {
            const index = _mockOrders.findIndex(o => o.id === item.id);
            if (index >= 0) _mockOrders[index] = item;
            else _mockOrders.unshift(item);
            return _mockOrders;
        }
    },

    // --- Viewing Agents ---
    getViewingAgents: async (): Promise<ViewingAgent[]> => {
        // Simulate API delay
        await new Promise(r => setTimeout(r, 200));
        return [...MOCK_VIEWING_AGENTS];
    },

    // --- Knowledge ---
    getKnowledge: async (): Promise<KnowledgeItem[]> => {
        try {
            const { data, error } = await supabase.from('knowledge').select('*').order('created_at', { ascending: false });
            if (error) throw error;

            // Auto-seed if empty
            if (data.length === 0) {
                console.log('Knowledge Base empty, auto-seeding default content...');
                // We map and insert. Using upsert to be safe, though insert is fine for empty.
                const { error: seedError } = await supabase.from('knowledge').insert(INITIAL_KNOWLEDGE_BASE.map(mapKnowledgeToDB));

                if (!seedError) {
                    return INITIAL_KNOWLEDGE_BASE;
                }
                // If seed fails (e.g. permissions), just return defaults without saving
                return INITIAL_KNOWLEDGE_BASE;
            }

            return data.map(mapKnowledgeFromDB);
        } catch (e) {
            // Fallback to local mock
            if (_mockKnowledge.length === 0) {
                _mockKnowledge = [...INITIAL_KNOWLEDGE_BASE];
            }
            return _mockKnowledge;
        }
    },
    saveKnowledge: async (item: KnowledgeItem): Promise<KnowledgeItem[]> => {
        try {
            const { error } = await supabase.from('knowledge').upsert(mapKnowledgeToDB(item));
            if (error) throw error;
            return db.getKnowledge();
        } catch (e) {
            const index = _mockKnowledge.findIndex(k => k.id === item.id);
            if (index >= 0) _mockKnowledge[index] = item;
            else _mockKnowledge.unshift(item);
            return _mockKnowledge;
        }
    },
    deleteKnowledge: async (id: string): Promise<KnowledgeItem[]> => {
        try {
            const { error } = await supabase.from('knowledge').delete().eq('id', id);
            if (error) throw error;
            return db.getKnowledge();
        } catch (e) {
            _mockKnowledge = _mockKnowledge.filter(k => k.id !== id);
            return _mockKnowledge;
        }
    },

    // --- Logs ---
    getLogs: async (): Promise<SystemLog[]> => {
        try {
            const { data, error } = await supabase.from('system_logs').select('*').order('created_at', { ascending: false }).limit(50);
            if (error) throw error;
            return data.map(mapLogFromDB);
        } catch (e) {
            return _mockLogs;
        }
    },
    addLog: async (item: SystemLog): Promise<SystemLog[]> => {
        try {
            const { error } = await supabase.from('system_logs').insert(mapLogToDB(item));
            if (error) throw error;
            return db.getLogs();
        } catch (e) {
            // Fallback: Add to local mock array
            _mockLogs = [item, ..._mockLogs].slice(0, 50);
            return _mockLogs;
        }
    },

    // --- Config ---
    getConfig: async (defaults: SystemConfig): Promise<SystemConfig> => {
        try {
            const { data, error } = await supabase.from('system_config').select('config_json').eq('id', 'global').single();
            if (error || !data) throw error || new Error('No config');
            return { ...defaults, ...data.config_json };
        } catch (e) {
            return _mockConfig ? { ...defaults, ..._mockConfig } : defaults;
        }
    },
    saveConfig: async (config: SystemConfig): Promise<SystemConfig> => {
        try {
            const { error } = await supabase.from('system_config').upsert({ id: 'global', config_json: config });
            if (error) throw error;
            return config;
        } catch (e) {
            _mockConfig = config;
            return config;
        }
    },

    // --- Reset & Seed (Initialize Demo Data) ---
    resetDB: async () => {
        if (window.confirm('⚠️ 警告：这将清空 Supabase 数据库并重新写入演示数据。\n(如果当前未连接 Supabase，此操作只会重置本地演示数据)')) {
            try {
                // Attempt Supabase Reset
                const { error } = await supabase.from('properties').delete().neq('id', '0');
                if (error) throw error; // If this fails, assume disconnected and reset local

                await supabase.from('erp_users').delete().neq('id', '0');
                await supabase.from('clients').delete().neq('id', '0');
                await supabase.from('orders').delete().neq('id', '0');
                await supabase.from('knowledge').delete().neq('id', '0');
                await supabase.from('system_logs').delete().neq('id', 0);

                // Seed Constants
                await supabase.from('properties').insert(MOCK_PROPERTIES.map(mapPropertyToDB));
                await supabase.from('erp_users').insert(INITIAL_USERS.map(mapUserToDB));
                await supabase.from('clients').insert(MOCK_CLIENTS.map(mapClientToDB));
                await supabase.from('orders').insert(MOCK_ORDERS.map(mapOrderToDB));
                await supabase.from('knowledge').insert(INITIAL_KNOWLEDGE_BASE.map(mapKnowledgeToDB));
                await supabase.from('system_logs').insert(INITIAL_SYSTEM_LOGS.map(mapLogToDB));

                alert('✅ 云端数据库已成功初始化！页面将刷新。');
                window.location.reload();
            } catch (e) {
                // Reset Local Mock Data
                _mockProperties = [...MOCK_PROPERTIES];
                _mockUsers = [...INITIAL_USERS];
                _mockClients = [...MOCK_CLIENTS];
                _mockOrders = [...MOCK_ORDERS];
                _mockKnowledge = [...INITIAL_KNOWLEDGE_BASE];
                _mockLogs = [...INITIAL_SYSTEM_LOGS];

                console.warn('Supabase Reset Failed (Offline Mode), reset local data.');
                alert('⚠️ 无法连接云端数据库，已重置本地演示数据。');
                window.location.reload();
            }
        }
    }
};