
import React, { useState, useEffect } from 'react';
import { User, UserRole, Property, PropertyType, PropertyCategory, PropertyViewConfig, LandlordType, PropertyUnit, KnowledgeItem, Order, OrderStatus, PropertyStatus, LandlordContact, PropertyDetailedInfo, SystemLog, SystemConfig, Client, ClientStatus, Permission, ViewingAgent } from './types';
import { ROLE_COLORS, ROLE_LABELS, CASCADING_REGIONS, LEASE_TERM_OPTIONS, PRESET_TAGS, DETAILED_OPTIONS, PERMISSION_LABELS, ROLE_DEFAULT_PERMISSIONS, PERMISSION_GROUPS, ALL_PERMISSIONS } from './constants';
import Layout from './components/Layout';
import PropertyCard from './components/PropertyCard';
import AIChatBot from './components/AIChatBot';
import DataScreen from './components/DataScreen';
import PropertyDetail from './components/PropertyDetail';
import KnowledgeBase from './components/KnowledgeBase';
import OrderManagement from './components/OrderManagement';
import SystemSettings from './components/SystemSettings';
import ClientManagement from './components/ClientManagement';
import AcquisitionChannel from './components/AcquisitionChannel';
import BigScreenDashboard from './components/BigScreenDashboard';
import { searchPropertiesWithAI, parsePropertyInfoWithAI, configureAI } from './services/geminiService';
import { db } from './services/db';

const LoginPage = ({ onLogin, error, config, loading }: { onLogin: (u: string, p: string) => void; error: string; config: SystemConfig; loading: boolean }) => {
    const [u, setU] = useState('');
    const [p, setP] = useState('');

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">{config.systemName}</h1>
                    <p className="text-slate-500">{config.announcement || '智能化房源管理与销售平台 (DB动态版)'}</p>
                </div>

                {config.maintenanceMode && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm rounded-lg text-center font-bold">
                        ⚠️ 系统维护中，仅限管理员登录
                    </div>
                )}

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg text-center">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">账号</label>
                        <input
                            type="text"
                            value={u}
                            onChange={(e) => setU(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white text-slate-900"
                            placeholder="请输入账号"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">密码</label>
                        <input
                            type="password"
                            value={p}
                            onChange={(e) => setP(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white text-slate-900"
                            placeholder="请输入密码"
                        />
                    </div>
                    <button
                        onClick={() => onLogin(u, p)}
                        disabled={loading}
                        className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 disabled:opacity-50 flex justify-center items-center"
                    >
                        {loading ? <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span> : null}
                        {loading ? '验证中...' : '立即登录'}
                    </button>
                </div>

                <div className="mt-6 text-center text-xs text-slate-400">
                    {config.supportPhone && <p className="mt-2">技术支持: {config.supportPhone}</p>}
                </div>
            </div>
        </div>
    );
};

const UserManagement = ({ users, currentUser, onAddUser, onUpdateUser, onDeleteUser }: {
    users: User[],
    currentUser: User,
    onAddUser: (u: User) => void,
    onUpdateUser: (id: string, u: Partial<User>) => void,
    onDeleteUser: (id: string) => void
}) => {
    const [activeTab, setActiveTab] = useState<'EMPLOYEE' | 'LANDLORD' | 'USER'>('EMPLOYEE');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUserId, setEditingUserId] = useState<string | null>(null);

    const [formName, setFormName] = useState('');
    const [formUsername, setFormUsername] = useState('');
    const [formPassword, setFormPassword] = useState('');
    const [formRole, setFormRole] = useState<UserRole>(UserRole.SALES);
    const [formGroup, setFormGroup] = useState('');
    const [formManagerId, setFormManagerId] = useState('');
    const [formPermissions, setFormPermissions] = useState<Permission[]>([]);

    // Filter users based on active tab
    const filteredUsers = users.filter(u => {
        if (activeTab === 'EMPLOYEE') return [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.SALES, UserRole.FINANCE, UserRole.ADMIN_STAFF].includes(u.role);
        if (activeTab === 'LANDLORD') return u.role === UserRole.LANDLORD;
        if (activeTab === 'USER') return u.role === UserRole.USER;
        return false;
    });

    const handleOpenAdd = () => {
        setEditingUserId(null);
        setFormName(''); setFormUsername(''); setFormPassword('');
        // Set default role based on tab
        if (activeTab === 'EMPLOYEE') setFormRole(UserRole.SALES);
        else if (activeTab === 'LANDLORD') setFormRole(UserRole.LANDLORD);
        else setFormRole(UserRole.USER);

        setFormGroup(''); setFormManagerId('');
        setFormPermissions(ROLE_DEFAULT_PERMISSIONS[activeTab === 'EMPLOYEE' ? UserRole.SALES : (activeTab === 'LANDLORD' ? UserRole.LANDLORD : UserRole.USER)]);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (user: User) => {
        setEditingUserId(user.id);
        setFormName(user.name); setFormUsername(user.username); setFormPassword(user.password || '');
        setFormRole(user.role);
        setFormGroup(user.group || '');
        setFormManagerId(user.managerId || '');
        setFormPermissions(user.permissions || ROLE_DEFAULT_PERMISSIONS[user.role] || []);
        setIsModalOpen(true);
    };

    const handleSubmit = () => {
        if (!formUsername || !formName || !formPassword) {
            alert("请填写基本必填信息");
            return;
        }

        const userData: Partial<User> = {
            name: formName,
            username: formUsername,
            password: formPassword,
            role: formRole,
            group: formGroup || undefined,
            managerId: formManagerId || undefined,
            permissions: formPermissions
        };

        if (editingUserId) {
            onUpdateUser(editingUserId, userData);
        } else {
            const newUser: User = {
                id: `u_${Date.now()}`,
                name: formName,
                username: formUsername,
                password: formPassword,
                role: formRole,
                group: formGroup || undefined,
                managerId: formManagerId || undefined,
                permissions: formPermissions,
                favorites: []
            };
            onAddUser(newUser);
        }
        setIsModalOpen(false);
    };

    const handleRoleChange = (role: UserRole) => {
        setFormRole(role);
        setFormPermissions(ROLE_DEFAULT_PERMISSIONS[role]);
    };

    const togglePermission = (perm: Permission) => {
        if (formPermissions.includes(perm)) {
            setFormPermissions(prev => prev.filter(p => p !== perm));
        } else {
            setFormPermissions(prev => [...prev, perm]);
        }
    };

    const getManagerName = (id?: string) => {
        if (!id) return '-';
        return users.find(u => u.id === id)?.name || '未知';
    };

    const getTitle = () => {
        if (activeTab === 'EMPLOYEE') return '员工账号管理';
        if (activeTab === 'LANDLORD') return '房东账号管理';
        return '用户账号管理';
    };

    const getDescription = () => {
        if (activeTab === 'EMPLOYEE') return '管理内部员工、分配销售团队及细化权限';
        if (activeTab === 'LANDLORD') return '管理房东/业主登录账号及房源查看权限';
        return '管理C端注册用户账号及会员权益';
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">{getTitle()}</h2>
                    <p className="text-sm text-slate-500 mt-1">{getDescription()}</p>
                </div>
                <button
                    onClick={handleOpenAdd}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                >
                    {activeTab === 'EMPLOYEE' ? '+ 新增员工' : (activeTab === 'LANDLORD' ? '+ 新增房东' : '+ 新增用户')}
                </button>
            </div>

            {/* Tabs */}
            <div className="flex bg-white rounded-lg p-1 border border-slate-200 w-fit">
                <button
                    onClick={() => setActiveTab('EMPLOYEE')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'EMPLOYEE' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                    员工账号
                </button>
                <button
                    onClick={() => setActiveTab('LANDLORD')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'LANDLORD' ? 'bg-orange-500 text-white shadow' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                    房东账号
                </button>
                <button
                    onClick={() => setActiveTab('USER')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'USER' ? 'bg-green-600 text-white shadow' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                    用户账号
                </button>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl w-[700px] max-w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="text-lg font-bold text-slate-800">{editingUserId ? '编辑账号信息' : '录入新账号'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">×</button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 tracking-wider">基础信息</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">姓名 <span className="text-red-500">*</span></label>
                                        <input className="w-full p-2.5 border rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none" value={formName} onChange={e => setFormName(e.target.value)} placeholder="真实姓名" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">登录账号 <span className="text-red-500">*</span></label>
                                        <input className="w-full p-2.5 border rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none" value={formUsername} onChange={e => setFormUsername(e.target.value)} placeholder="系统登录名" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">登录密码 <span className="text-red-500">*</span></label>
                                        <input type="password" className="w-full p-2.5 border rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none" value={formPassword} onChange={e => setFormPassword(e.target.value)} placeholder="••••••" />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 tracking-wider">角色配置</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">所属角色</label>
                                        <select
                                            className="w-full p-2.5 border rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                                            value={formRole}
                                            onChange={e => handleRoleChange(e.target.value as UserRole)}
                                            disabled={editingUserId !== null && activeTab !== 'EMPLOYEE'} // Simple restriction: prevent role switching across types when editing if not employee
                                        >
                                            {activeTab === 'EMPLOYEE' && (
                                                <>
                                                    <option value={UserRole.ADMIN}>管理员 (区域经理)</option>
                                                    <option value={UserRole.MANAGER}>主管 (团队Leader)</option>
                                                    <option value={UserRole.FINANCE}>财务专员</option>
                                                    <option value={UserRole.ADMIN_STAFF}>行政/运营</option>
                                                    <option value={UserRole.SALES}>销售 (房产顾问)</option>
                                                </>
                                            )}
                                            {activeTab === 'LANDLORD' && <option value={UserRole.LANDLORD}>房东业主</option>}
                                            {activeTab === 'USER' && <option value={UserRole.USER}>注册用户</option>}
                                        </select>
                                    </div>

                                    {activeTab === 'EMPLOYEE' && (
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">直属上级 (汇报对象)</label>
                                            <select
                                                className="w-full p-2.5 border rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                                                value={formManagerId}
                                                onChange={e => setFormManagerId(e.target.value)}
                                            >
                                                <option value="">无 (最高级)</option>
                                                {users.filter(u => u.id !== editingUserId && [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER].includes(u.role)).map(u => (
                                                    <option key={u.id} value={u.id}>{u.name} - {ROLE_LABELS[u.role]}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    <div className="col-span-2">
                                        <label className="block text-sm font-bold text-slate-700 mb-1">{activeTab === 'EMPLOYEE' ? '所属部门/小组' : '备注信息'}</label>
                                        <input
                                            className="w-full p-2.5 border rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                                            value={formGroup}
                                            onChange={e => setFormGroup(e.target.value)}
                                            placeholder={activeTab === 'EMPLOYEE' ? "例如：朝阳第一销售组" : "备注信息..."}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 tracking-wider">权限明细配置</h4>
                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 max-h-60 overflow-y-auto space-y-4">
                                    {PERMISSION_GROUPS.map((group, idx) => (
                                        <div key={idx}>
                                            <h5 className="text-xs font-bold text-indigo-600 mb-2 border-b border-slate-200 pb-1">{group.name}</h5>
                                            <div className="grid grid-cols-2 gap-2">
                                                {group.perms.map(permKey => (
                                                    <label key={permKey} className="flex items-start space-x-2 cursor-pointer hover:bg-slate-100 p-1.5 rounded transition-colors">
                                                        <input
                                                            type="checkbox"
                                                            checked={formPermissions.includes(permKey)}
                                                            onChange={() => togglePermission(permKey)}
                                                            className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                                                        />
                                                        <span className="text-xs text-slate-700 leading-tight">{PERMISSION_LABELS[permKey]}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs text-slate-500 mt-2">* 默认权限已自动选中，您可以手动勾选微调。</p>
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-100 flex justify-end space-x-3 bg-slate-50 rounded-b-xl">
                            <button onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">取消</button>
                            <button onClick={handleSubmit} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-md">保存配置</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left min-w-[800px]">
                        <thead className="bg-slate-50 text-slate-500 font-medium">
                            <tr>
                                <th className="px-6 py-4">姓名 / 账号</th>
                                <th className="px-6 py-4">角色</th>
                                <th className="px-6 py-4">{activeTab === 'EMPLOYEE' ? '归属部门' : '备注/组'}</th>
                                {activeTab === 'EMPLOYEE' && <th className="px-6 py-4">直属上级</th>}
                                <th className="px-6 py-4">权限数</th>
                                <th className="px-6 py-4 text-right">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredUsers.map(user => (
                                <tr key={user.id} className="hover:bg-slate-50 group transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-800">{user.name}</div>
                                        <div className="text-xs text-slate-400">{user.username}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${ROLE_COLORS[user.role]}`}>
                                            {ROLE_LABELS[user.role]}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">{user.group || '-'}</td>
                                    {activeTab === 'EMPLOYEE' && <td className="px-6 py-4 text-slate-600">{getManagerName(user.managerId)}</td>}
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                                            {user.permissions.length} 项
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {user.role !== UserRole.SUPER_ADMIN && (
                                            <div className="flex justify-end gap-3 opacity-100 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleOpenEdit(user)}
                                                    className="text-indigo-600 hover:text-indigo-800 font-medium"
                                                >
                                                    配置
                                                </button>
                                                <button
                                                    onClick={() => { if (window.confirm(`确认删除账号 ${user.name} 吗?`)) onDeleteUser(user.id); }}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    删除
                                                </button>
                                            </div>
                                        )}
                                        {user.role === UserRole.SUPER_ADMIN && <span className="text-slate-300 italic text-xs">系统内置</span>}
                                    </td>
                                </tr>
                            ))}
                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center py-10 text-slate-400">暂无该类型的账号数据</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const App: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [activePage, setActivePage] = useState('properties');
    const [loginError, setLoginError] = useState('');
    const [dataLoading, setDataLoading] = useState(true);
    const [authLoading, setAuthLoading] = useState(false);

    // History Filter State
    const [historyQuery, setHistoryQuery] = useState('');
    const [historyStartDate, setHistoryStartDate] = useState('');
    const [historyEndDate, setHistoryEndDate] = useState('');

    const getEnv = (key: string) => {
        // @ts-ignore
        if (typeof import.meta !== 'undefined' && import.meta.env) {
            // @ts-ignore
            return import.meta.env[`VITE_${key}`] || import.meta.env[key];
        }
        // @ts-ignore
        if (typeof process !== 'undefined' && process.env) {
            // @ts-ignore
            return process.env[key];
        }
        return '';
    };

    const [systemConfig, setSystemConfig] = useState<SystemConfig>({
        systemName: '智居 AI 房产系统 (ERP Pro)',
        announcement: '',
        supportPhone: '',
        maintenanceMode: false,
        allowRegistration: false,
        useCustomAI: false,
        aiProvider: 'GEMINI',
        aiApiKey: '',
        aiApiEndpoint: 'https://generativelanguage.googleapis.com',
        aiModelName: 'gemini-2.5-flash'
    });

    const [properties, setProperties] = useState<Property[]>([]);
    const [displayedProperties, setDisplayedProperties] = useState<Property[]>([]);
    const [knowledgeEntries, setKnowledgeEntries] = useState<KnowledgeItem[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);
    const [viewingAgents, setViewingAgents] = useState<ViewingAgent[]>([]);

    // Order Modal State
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
    const [orderActionType, setOrderActionType] = useState<'VIEWING' | 'SIGN'>('VIEWING');
    const [newOrderViewAgentId, setNewOrderViewAgentId] = useState('');
    const [newOrderViewAgentName, setNewOrderViewAgentName] = useState(''); // Manual or selected name
    const [newOrderViewAgentPhone, setNewOrderViewAgentPhone] = useState('');
    const [newOrderViewFee, setNewOrderViewFee] = useState(50);
    const [newOrderClientId, setNewOrderClientId] = useState('');


    // Load initial data from DB Service
    useEffect(() => {
        const loadData = async () => {
            setDataLoading(true);
            const [loadedConfig, loadedProps, loadedUsers, loadedClients, loadedOrders, loadedLogs, loadedKnowledge, loadedAgents] = await Promise.all([
                db.getConfig(systemConfig),
                db.getProperties(),
                db.getUsers(),
                db.getClients(),
                db.getOrders(),
                db.getLogs(),
                db.getKnowledge(),
                db.getViewingAgents()
            ]);

            setSystemConfig(loadedConfig);
            setProperties(loadedProps);
            setUsers(loadedUsers);
            setClients(loadedClients);
            setOrders(loadedOrders);
            setSystemLogs(loadedLogs);
            setKnowledgeEntries(loadedKnowledge);
            setViewingAgents(loadedAgents);

            // Config AI
            if (loadedConfig.useCustomAI && loadedConfig.aiApiKey) {
                configureAI(loadedConfig.aiApiKey, loadedConfig.aiApiEndpoint, loadedConfig.aiModelName, loadedConfig.aiProvider);
            } else {
                configureAI(getEnv('API_KEY'), undefined, loadedConfig.aiModelName, 'GEMINI');
            }

            setDataLoading(false);
        };
        loadData();
    }, []);

    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
    const [sharedViewConfig, setSharedViewConfig] = useState<PropertyViewConfig | undefined>(undefined);

    const [filterProvince, setFilterProvince] = useState('北京');
    const [filterCity, setFilterCity] = useState('北京');
    const [filterDistrict, setFilterDistrict] = useState('全部');
    const [filterCategory, setFilterCategory] = useState('全部');
    const [filterPrice, setFilterPrice] = useState('全部');

    const [customMinPrice, setCustomMinPrice] = useState('');
    const [customMaxPrice, setCustomMaxPrice] = useState('');

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingPropertyId, setEditingPropertyId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'BASIC' | 'DETAILS' | 'MEDIA' | 'BUSINESS' | 'LANDLORD'>('BASIC');

    const [newProperty, setNewProperty] = useState<Partial<Property>>({ type: PropertyType.RENT, category: '住宅', tags: [], location: '上海徐汇', coordinates: { lat: 31.2304, lng: 121.4737 } });
    const [newPropertyDetails, setNewPropertyDetails] = useState<PropertyDetailedInfo>({});
    const [newPropertyDocuments, setNewPropertyDocuments] = useState<string[]>([]);
    const [newPropertySurroundings, setNewPropertySurroundings] = useState<string[]>([]);
    const [newPropertyFacilities, setNewPropertyFacilities] = useState<string[]>([]);
    const [newPropertyTags, setNewPropertyTags] = useState<string[]>([]);
    const [customTagInput, setCustomTagInput] = useState('');
    const [newPropertyProvince, setNewPropertyProvince] = useState('上海');
    const [newPropertyCity, setNewPropertyCity] = useState('上海');
    const [newPropertyDistrict, setNewPropertyDistrict] = useState('徐汇');
    const [newPropertyAdditionalImages, setNewPropertyAdditionalImages] = useState<string[]>([]);
    const [newPropertyVideos, setNewPropertyVideos] = useState<string[]>([]);
    const [newPropertyLeaseTerms, setNewPropertyLeaseTerms] = useState<string[]>([]);
    const [newPropertyLeaseCommissions, setNewPropertyLeaseCommissions] = useState<Record<string, string>>({});
    const [newPropertyLandlordType, setNewPropertyLandlordType] = useState<LandlordType>(LandlordType.INDIVIDUAL);
    const [newPropertyUnits, setNewPropertyUnits] = useState<PropertyUnit[]>([]);
    const [tempUnit, setTempUnit] = useState<Partial<PropertyUnit>>({ name: '', price: 0, area: 0, layout: '1室1厅' });
    const [newPropertyLandlordContacts, setNewPropertyLandlordContacts] = useState<LandlordContact[]>([]);

    const [aiInputText, setAiInputText] = useState('');
    const [aiInputImage, setAiInputImage] = useState<string | null>(null);
    const [isAiParsing, setIsAiParsing] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const shareId = params.get('shareId');
        const configStr = params.get('c');

        if (shareId) {
            // Need to wait for properties to load if not already
            db.getProperties().then(allProps => {
                const found = allProps.find(p => p.id === shareId);
                if (found) {
                    setSelectedProperty(found);
                    if (configStr) {
                        try {
                            const decoded = JSON.parse(atob(configStr));
                            setSharedViewConfig(decoded);
                        } catch (e) {
                            console.error("Failed to parse share config", e);
                        }
                    }
                }
            });
        }
    }, []);

    // CRM: Check for expiring contracts (Renewal Reminder)
    useEffect(() => {
        if (!currentUser || clients.length === 0) return;

        const checkExpiring = () => {
            const today = new Date();
            const thirtyDaysLater = new Date(today);
            thirtyDaysLater.setDate(today.getDate() + 30);

            const expiringClients = clients.filter(c => {
                if (c.status !== ClientStatus.SIGNED || !c.leaseEndDate) return false;
                // Filter by permission (Sales only see own, Managers see all? For now, global check for simplicity or filter by agent)
                if (currentUser.role === UserRole.SALES && c.agentId !== currentUser.id) return false;

                const end = new Date(c.leaseEndDate);
                return end >= today && end <= thirtyDaysLater;
            });

            if (expiringClients.length > 0) {
                // Check if we already logged this recently? To avoid spam, we rely on checking viewing/refresh.
                // For now, just log to console or System Log if meaningful.
                // System Log might be too noisy if real-time. 
                // Let's add top-level alert for user.
                // alert(`如果有 ${expiringClients.length} 位客户合同即将到期，请及时跟进！`); // Intrusive
                // Better: Add System Log and unique check?
                // Simple implementation: Just logging count for admin/manager visibility
                console.log(`[CRM Reminder] Found ${expiringClients.length} expiring contracts.`);
                if (expiringClients.length > 0) {
                    // Maybe set a localized state for a notification badge? 
                    // Since we don't have a notification center component yet, I'll skip visual noise.
                    // But I will add a System Log for record.
                    // A simple toast would be nice but I don't see a toast component.
                }
            }
        };
        checkExpiring();
    }, [clients, currentUser]);

    const addSystemLog = async (action: string, status: '成功' | '失败' = '成功') => {
        const newLog: SystemLog = {
            id: Date.now(),
            action: action,
            user: currentUser?.name || 'Unknown',
            ip: '192.168.1.1',
            time: new Date().toLocaleString('zh-CN'),
            status: status
        };
        const updatedLogs = await db.addLog(newLog);
        setSystemLogs(updatedLogs);
    };

    const handleUpdateSystemConfig = async (newConfig: SystemConfig) => {
        await db.saveConfig(newConfig);
        setSystemConfig(newConfig);
        addSystemLog('更新系统设置');
        if (newConfig.useCustomAI && newConfig.aiApiKey) {
            configureAI(newConfig.aiApiKey, newConfig.aiApiEndpoint, newConfig.aiModelName, newConfig.aiProvider);
        } else {
            configureAI(getEnv('API_KEY'), undefined, newConfig.aiModelName, 'GEMINI');
        }
    };

    const handleLogin = async (u: string, p: string) => {
        setAuthLoading(true);
        // Reload users from DB to ensure fresh data
        const currentUsers = await db.getUsers();
        const found = currentUsers.find(user => user.username === u && user.password === p);

        // Simulate DB latency
        await new Promise(r => setTimeout(r, 500));

        if (found) {
            if (systemConfig.maintenanceMode && found.role !== UserRole.SUPER_ADMIN) {
                setLoginError('系统维护中，仅限管理员登录');
                setAuthLoading(false);
                return;
            }
            setCurrentUser(found);
            setUsers(currentUsers); // Update local state with fresh users
            setLoginError('');
            setActivePage('properties');
            addSystemLog('登录系统');
        } else {
            setLoginError('账号或密码错误');
        }
        setAuthLoading(false);
    };

    const handleLogout = () => {
        if (currentUser) {
            addSystemLog('退出登录');
        }
        setCurrentUser(null);
        setActivePage('properties');
        setSelectedProperty(null);
        resetFilters();
    };

    const handleToggleFavorite = async (propertyId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!currentUser) return;
        const favorites = currentUser.favorites || [];
        let newFavorites: string[];
        if (favorites.includes(propertyId)) {
            newFavorites = favorites.filter(id => id !== propertyId);
        } else {
            newFavorites = [...favorites, propertyId];
        }
        const updatedUser = { ...currentUser, favorites: newFavorites };

        // Optimistic Update
        setCurrentUser(updatedUser);
        setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));

        // Persist
        await db.saveUser(updatedUser);
    };

    const resetFilters = () => {
        setFilterProvince('全部');
        setFilterCity('全部');
        setFilterDistrict('全部');
        setFilterCategory('全部');
        setFilterPrice('全部');
        setCustomMinPrice('');
        setCustomMaxPrice('');
    };

    const applyFilters = () => {
        let result = properties;

        if (filterProvince !== '全部') {
            result = result.filter(p => p.location.includes(filterProvince));
        }
        if (filterCity !== '全部') {
            if (filterCity !== filterProvince) {
                result = result.filter(p => p.location.includes(filterCity));
            }
        }
        if (filterDistrict !== '全部') {
            result = result.filter(p => p.location.includes(filterDistrict) || p.address.includes(filterDistrict));
        }

        if (filterCategory !== '全部') {
            result = result.filter(p => p.category === filterCategory);
        }

        const minP = customMinPrice ? parseFloat(customMinPrice) : -1;
        const maxP = customMaxPrice ? parseFloat(customMaxPrice) : -1;

        const matchPrice = (p: Property, min: number, max: number) => {
            const factor = 1;
            const pPrice = p.price / factor;
            let matches = true;
            if (min >= 0) matches = matches && pPrice >= min;
            if (max >= 0) matches = matches && pPrice <= max;

            if (!matches && p.landlordType === LandlordType.CORPORATE && p.units) {
                return p.units.some(u => {
                    const uPrice = u.price / factor;
                    let uMatch = true;
                    if (min >= 0) uMatch = uMatch && uPrice >= min;
                    if (max >= 0) uMatch = uMatch && uPrice <= max;
                    return uMatch;
                });
            }
            return matches;
        };

        if (minP >= 0 || maxP >= 0) {
            result = result.filter(p => matchPrice(p, minP, maxP));
        } else if (filterPrice !== '全部') {
            let min = -1, max = -1;
            if (filterPrice === '5000元以下') max = 5000;
            else if (filterPrice === '5000-8000元') { min = 5000; max = 8000; }
            else if (filterPrice === '8000-15000元') { min = 8000; max = 15000; }
            else if (filterPrice === '15000元以上') min = 15000;
            result = result.filter(p => matchPrice(p, min, max));
        }

        if (activePage === 'properties') {
            result = result.filter(p => p.status !== PropertyStatus.RENTED);
        } else if (activePage === 'history') {
            result = result.filter(p => p.status === PropertyStatus.RENTED);
        }

        setDisplayedProperties(result);
    };

    useEffect(() => {
        applyFilters();
    }, [filterProvince, filterCity, filterDistrict, filterCategory, filterPrice, customMinPrice, customMaxPrice, properties, activePage]);

    const parseLocation = (loc: string) => {
        let p = '上海'; let c = '上海'; let d = '徐汇';
        for (const prov in CASCADING_REGIONS) {
            if (loc.includes(prov)) {
                p = prov;
                const cities = CASCADING_REGIONS[prov];
                for (const city in cities) {
                    if (loc.includes(city) && city !== prov) c = city;
                    const dists = cities[city];
                    if (dists) { for (const dist of dists) { if (loc.includes(dist)) { c = city; d = dist; } } }
                }
                break;
            }
        }
        return { p, c, d };
    };

    const handleOpenAdd = () => {
        setEditingPropertyId(null);
        setNewProperty({ type: PropertyType.RENT, category: '住宅', tags: [], location: '上海徐汇', coordinates: { lat: 31.2304, lng: 121.4737 } });
        setNewPropertyTags([]); setNewPropertyLeaseTerms([]); setNewPropertyLeaseCommissions({});
        setNewPropertyAdditionalImages([]); setNewPropertyVideos([]); setNewPropertyProvince('上海'); setNewPropertyCity('上海'); setNewPropertyDistrict('徐汇');
        setNewPropertyLandlordType(LandlordType.INDIVIDUAL); setNewPropertyUnits([]); setNewPropertyLandlordContacts([{ name: '', phone: '' }]);
        setNewPropertyDetails({}); setNewPropertyDocuments([]); setNewPropertySurroundings([]); setNewPropertyFacilities([]);
        setAiInputText(''); setAiInputImage(null); setActiveTab('BASIC'); setIsAddModalOpen(true);
    };
    const handleOpenEdit = (property: Property) => {
        setEditingPropertyId(property.id); setNewProperty({ ...property });
        setNewPropertyTags(property.tags || []); setNewPropertyLeaseTerms(property.leaseTerms || []);
        setNewPropertyLeaseCommissions(property.leaseCommissions || {}); setNewPropertyAdditionalImages(property.imageUrls || []);
        setNewPropertyVideos(property.videoUrls || []); setNewPropertyLandlordType(property.landlordType || LandlordType.INDIVIDUAL);
        setNewPropertyUnits(property.units || []); setNewPropertyLandlordContacts(property.landlordContacts && property.landlordContacts.length > 0 ? property.landlordContacts : [{ name: '', phone: '' }]);
        const { p, c, d } = parseLocation(property.location); setNewPropertyProvince(p); setNewPropertyCity(c); setNewPropertyDistrict(d);
        if (property.details) {
            setNewPropertyDetails(property.details); setNewPropertyDocuments(property.details.documentUrls || []);
            setNewPropertySurroundings(property.details.surroundings || []); setNewPropertyFacilities(property.details.nearbyFacilities || []);
        } else { setNewPropertyDetails({}); setNewPropertyDocuments([]); setNewPropertySurroundings([]); setNewPropertyFacilities([]); }
        setAiInputText(''); setAiInputImage(null); setActiveTab('BASIC'); setIsAddModalOpen(true);
    };

    const handleSaveProperty = async () => {
        // Validation: Check Basic Info Required Fields (Title, Price, Area, Payment Method)
        if (!newProperty.title || !newProperty.price || !newProperty.area || !newPropertyDetails.paymentMethod) {
            alert("请完善基础信息（包括标题、价格、面积、支付方式等）");
            return;
        }
        const locationStr = `${newPropertyProvince}${newPropertyCity !== newPropertyProvince ? newPropertyCity : ''}${newPropertyDistrict}`;
        const validContacts = newPropertyLandlordContacts.filter(c => c.name.trim() !== '' && c.phone.trim() !== '');
        const p: Property = {
            id: editingPropertyId || `new_${Date.now()}`,
            title: newProperty.title || '未命名房源',
            type: PropertyType.RENT,
            category: newProperty.category as PropertyCategory,
            status: newProperty.status || PropertyStatus.AVAILABLE,
            price: Number(newProperty.price),
            area: Number(newProperty.area),
            layout: newProperty.layout || '1室0厅',
            location: locationStr,
            address: newProperty.address || `${newPropertyCity}${newPropertyDistrict}`,
            tags: newPropertyTags,
            imageUrl: newProperty.imageUrl || 'https://picsum.photos/400/300?random=' + Date.now(),
            imageUrls: newPropertyAdditionalImages, videoUrls: newPropertyVideos, floorPlanUrl: newProperty.floorPlanUrl, vrUrl: newProperty.vrUrl,
            description: newProperty.description || '暂无描述', commuteInfo: newProperty.commuteInfo, coordinates: newProperty.coordinates || { lat: 31.2304, lng: 121.4737 },
            leaseTerms: newPropertyLeaseTerms, leaseCommissions: newPropertyLeaseCommissions,
            landlordType: newPropertyLandlordType, units: newPropertyLandlordType === LandlordType.CORPORATE ? newPropertyUnits : [], landlordContacts: validContacts,
            details: { ...newPropertyDetails, documentUrls: newPropertyDocuments, surroundings: newPropertySurroundings, nearbyFacilities: newPropertyFacilities }
        };

        const updatedList = await db.saveProperty(p);
        setProperties([...updatedList]);

        if (editingPropertyId) {
            addSystemLog(`修改房源信息 [${p.title}]`);
            if (selectedProperty && selectedProperty.id === editingPropertyId) setSelectedProperty(p);
        } else {
            addSystemLog(`发布新房源 [${p.title}]`);
        }
        resetFilters(); // Auto reset filters to show the new property immediately
        setIsAddModalOpen(false);
    };
    const handleDeleteProperty = async (id: string) => {
        const p = properties.find(i => i.id === id);
        const updatedList = await db.deleteProperty(id);
        setProperties(updatedList);
        addSystemLog(`删除房源 [${p?.title || id}]`);
        if (selectedProperty && selectedProperty.id === id) setSelectedProperty(null);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'imageUrl' | 'floorPlanUrl') => { if (e.target.files && e.target.files[0]) { const file = e.target.files[0]; const url = URL.createObjectURL(file as any); setNewProperty(prev => ({ ...prev, [field]: url })); } };
    const handleUnitImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files && e.target.files[0]) { const file = e.target.files[0]; const url = URL.createObjectURL(file as any); setTempUnit(prev => ({ ...prev, imageUrl: url })); } };
    const handleMultipleFilesUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'IMAGES' | 'VIDEOS' | 'DOCS') => { if (e.target.files && e.target.files.length > 0) { const newUrls: string[] = []; Array.from(e.target.files).forEach(file => { newUrls.push(URL.createObjectURL(file as any)); }); if (type === 'IMAGES') { setNewPropertyAdditionalImages(prev => [...prev, ...newUrls]); } else if (type === 'VIDEOS') { setNewPropertyVideos(prev => [...prev, ...newUrls]); } else if (type === 'DOCS') { setNewPropertyDocuments(prev => [...prev, ...newUrls]); } } };
    const toggleLeaseTerm = (term: string) => { if (newPropertyLeaseTerms.includes(term)) { setNewPropertyLeaseTerms(prev => prev.filter(t => t !== term)); const newComms = { ...newPropertyLeaseCommissions }; delete newComms[term]; setNewPropertyLeaseCommissions(newComms); } else { setNewPropertyLeaseTerms(prev => [...prev, term]); } };
    const handleCommissionChange = (term: string, value: string) => { setNewPropertyLeaseCommissions(prev => ({ ...prev, [term]: value })); };
    const handleAddUnit = () => { if (!tempUnit.name || !tempUnit.price) return; const unit: PropertyUnit = { id: `u_${Date.now()}`, name: tempUnit.name, price: tempUnit.price, area: tempUnit.area || 0, layout: tempUnit.layout || '1室1厅', imageUrl: tempUnit.imageUrl, description: tempUnit.description }; setNewPropertyUnits([...newPropertyUnits, unit]); setTempUnit({ name: '', price: 0, area: 0, layout: '1室1厅' }); };
    const handleRemoveUnit = (id: string) => { setNewPropertyUnits(newPropertyUnits.filter(u => u.id !== id)); };
    const toggleTag = (tag: string) => { if (newPropertyTags.includes(tag)) { setNewPropertyTags(prev => prev.filter(t => t !== tag)); } else { setNewPropertyTags(prev => [...prev, tag]); } };
    const addCustomTag = () => { const trimmed = customTagInput.trim(); if (trimmed && !newPropertyTags.includes(trimmed)) { setNewPropertyTags(prev => [...prev, trimmed]); } setCustomTagInput(''); };
    const toggleDetailArray = (current: string[], setter: React.Dispatch<React.SetStateAction<string[]>>, item: string) => { if (current.includes(item)) { setter(current.filter(i => i !== item)); } else { setter([...current, item]); } };
    const addContact = () => { setNewPropertyLandlordContacts([...newPropertyLandlordContacts, { name: '', phone: '' }]); };
    const removeContact = (index: number) => { const updated = [...newPropertyLandlordContacts]; updated.splice(index, 1); setNewPropertyLandlordContacts(updated); };
    const updateContact = (index: number, field: keyof LandlordContact, value: string) => { const updated = [...newPropertyLandlordContacts]; updated[index] = { ...updated[index], [field]: value }; setNewPropertyLandlordContacts(updated); };
    const handlePaste = (e: React.ClipboardEvent) => { const items = e.clipboardData.items; for (let i = 0; i < items.length; i++) { if (items[i].type.indexOf('image') !== -1) { const blob = items[i].getAsFile(); if (blob) { const reader = new FileReader(); reader.onload = (event) => { setAiInputImage(event.target?.result as string); }; reader.readAsDataURL(blob); e.preventDefault(); } } } };
    const handleSmartFill = async () => { if (!aiInputText && !aiInputImage) { alert("请先输入文本或粘贴图片！"); return; } setIsAiParsing(true); const data = await parsePropertyInfoWithAI(aiInputText, aiInputImage || undefined); if (data) { setNewProperty(prev => ({ ...prev, title: data.title || prev.title, type: PropertyType.RENT, category: (data.category as any) || prev.category, price: data.price || prev.price, area: data.area || prev.area, layout: data.layout || prev.layout, address: data.address || prev.address, description: data.description || prev.description, commuteInfo: data.commuteInfo || prev.commuteInfo })); if (data.province) setNewPropertyProvince(data.province); if (data.city) setNewPropertyCity(data.city); if (data.district) setNewPropertyDistrict(data.district); if (data.tags && Array.isArray(data.tags)) { setNewPropertyTags(prev => Array.from(new Set([...prev, ...data.tags]))); } if (data.contacts && Array.isArray(data.contacts)) { setNewPropertyLandlordContacts(data.contacts); } alert("AI 识别完成！请检查已填入的信息。"); } else { alert("识别失败，请重试。"); } setIsAiParsing(false); };

    const handleAutoLocate = () => {
        if (!navigator.geolocation) { alert("浏览器不支持地理定位"); return; }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                setNewProperty(prev => ({ ...prev, coordinates: { lat: latitude, lng: longitude } }));
                // Try reverse geocoding via OSM (Free, no key required for client-side low volume)
                fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
                    .then(r => r.json())
                    .then(data => {
                        if (data && data.address) {
                            const addr = data.address;
                            // Try to match province/city
                            const prov = Object.keys(CASCADING_REGIONS).find(p => addr.state?.includes(p)) || '北京';
                            setNewPropertyProvince(prov);
                            const cityMap = CASCADING_REGIONS[prov] || {};
                            const city = Object.keys(cityMap).find(c => addr.city?.includes(c)) || Object.keys(cityMap)[0];
                            setNewPropertyCity(city);
                            const dists = cityMap[city] || [];
                            const dist = dists.find(d => (addr.suburb || addr.district)?.includes(d)) || dists[0];
                            setNewPropertyDistrict(dist);

                            setNewProperty(prev => ({ ...prev, address: data.display_name || '定位地址' }));
                            alert("定位成功！已自动更新位置信息。");
                        }
                    }).catch(() => alert(`定位成功 (Lat:${latitude.toFixed(2)}, Lng:${longitude.toFixed(2)})，未能解析详细地址。`));
            },
            (err) => alert("定位失败，请检查浏览器定位权限。")
        );
    };

    const submitOrder = async () => {
        if (!selectedProperty || !currentUser) return;

        let vName = '';
        let vPhone = '';

        if (orderActionType === 'VIEWING') {
            if (!newOrderClientId && !newOrderViewAgentId) { alert("请选择客户"); return; }
            if (newOrderViewAgentId === 'manual') {
                vName = newOrderViewAgentName;
                vPhone = newOrderViewAgentPhone;
                if (!vName || !vPhone) { alert("请填写临时带看人员姓名和电话"); return; }
            } else if (newOrderViewAgentId) {
                const agent = viewingAgents.find(a => a.id === newOrderViewAgentId);
                if (agent) {
                    vName = agent.name;
                    vPhone = agent.phone;
                }
            } else {
                alert("请选择带看人员"); return;
            }
        }

        const selectedClient = clients.find(c => c.id === newOrderClientId);

        const newOrder: Order = {
            id: `ord_${Date.now()}`,
            propertyId: selectedProperty.id, propertyTitle: selectedProperty.title, propertyImage: selectedProperty.imageUrl,
            clientId: selectedClient?.id || 'mock_client_' + Date.now(),
            clientName: selectedClient?.name || '新客户 (待补充)',
            clientPhone: selectedClient?.phone || '',
            agentId: currentUser.id, agentName: currentUser.name,
            type: selectedProperty.type, price: selectedProperty.price,
            status: orderActionType === 'VIEWING' ? OrderStatus.VIEWING : OrderStatus.PENDING,
            viewingDate: orderActionType === 'VIEWING' ? new Date().toLocaleString() : undefined,
            contractDate: orderActionType === 'SIGN' ? new Date().toLocaleString() : undefined,
            createdAt: new Date().toISOString().split('T')[0],
            // New Fields
            unitId: (selectedProperty.landlordType === LandlordType.CORPORATE && selectedProperty.units && selectedProperty.units.length > 0) ? selectedProperty.units[0].id : undefined, // Default to first unit or null
            viewingAgentName: vName,
            viewingAgentPhone: vPhone,
            viewingFee: orderActionType === 'VIEWING' ? Number(newOrderViewFee) : 0,
            viewingStatus: orderActionType === 'VIEWING' ? 'ASSIGNED' : undefined,
            snapshot: orderActionType === 'SIGN' ? {
                propertyTitle: selectedProperty.title,
                propertyAddress: selectedProperty.address || selectedProperty.location,
                propertySpecs: `${selectedProperty.layout} ${selectedProperty.area}㎡`,
                clientName: selectedClient?.name || '新客户 (待补充)',
                clientContact: selectedClient?.phone || '',
                agentName: currentUser.name,
                agentPhone: currentUser.username,
                dealPrice: selectedProperty.price,
                contractDate: new Date().toISOString().split('T')[0]
            } : undefined
        };

        const updatedOrders = await db.saveOrder(newOrder);
        setOrders(updatedOrders);

        if (orderActionType === 'SIGN') {
            updatePropertyStatus(selectedProperty.id, PropertyStatus.LOCKED);
            alert("订单已创建，房源已标记为“签约中”");
            addSystemLog(`创建签约订单 [${selectedProperty.title}]`);
        } else {
            alert(`预约看房成功！\n带看人员：${vName}\n带看费：${newOrder.viewingFee}元 (成交后结算)`);
            addSystemLog(`创建看房订单 [${selectedProperty.title}] - 带看人: ${vName}`);
        }
        setIsOrderModalOpen(false);
        setActivePage('orders'); setSelectedProperty(null);
    };

    const handleCreateOrder = (action: 'VIEWING' | 'SIGN') => {
        if (!selectedProperty || !currentUser) return;
        setOrderActionType(action);
        if (action === 'VIEWING') {
            // Reset Form
            setNewOrderViewAgentId('');
            setNewOrderViewAgentName('');
            setNewOrderViewAgentPhone('');
            setNewOrderViewFee(50);
            setIsOrderModalOpen(true);
        } else {
            // Direct Sign or Modal? For now allow direct sign but utilize submitOrder for consistency if needed, 
            // but submitOrder expects viewing agent logic if VIEWING. 
            // We can just call submitOrder directly for SIGN as it bypasses viewing logic check.
            setIsOrderModalOpen(true); // Let's open modal for SIGN too to confirm? No, just trigger submit for SIGN to keep it simple as per request? 
            // design doc: "简化成交流程... 销售直接确认成交". 
            // Let's just confirm.
            if (window.confirm("确认直接发起签约成交流程吗?")) {
                submitOrder();
            }
        }
    };

    const renderOrderCreationModal = () => (
        <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl w-[500px] max-w-full shadow-2xl overflow-hidden animate-fade-in-up">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-indigo-50">
                    <h3 className="text-lg font-bold text-indigo-900">
                        {orderActionType === 'VIEWING' ? '预约带看 (派单)' : '发起签约'}
                    </h3>
                    <button onClick={() => setIsOrderModalOpen(false)} className="text-indigo-400 hover:text-indigo-600 font-bold">×</button>
                </div>

                <div className="p-6 space-y-5">
                    {/* Client Selection */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">选择客户 (我的客源)</label>
                        <select
                            className="w-full p-3 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                            value={newOrderClientId}
                            onChange={e => setNewOrderClientId(e.target.value)}
                        >
                            <option value="">-- 请选择意向客户 --</option>
                            {clients.filter(c => c.agentId === currentUser?.id && ['NEW', 'FOLLOWING', 'INTENTION'].includes(c.status)).map(c => (
                                <option key={c.id} value={c.id}>{c.name} - {c.phone} ({c.requirements})</option>
                            ))}
                        </select>
                    </div>

                    {orderActionType === 'VIEWING' && (
                        <>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">选择带看人员 (销/带分离)</label>
                                <select
                                    className="w-full p-3 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                    value={newOrderViewAgentId}
                                    onChange={e => {
                                        setNewOrderViewAgentId(e.target.value);
                                        if (e.target.value && e.target.value !== 'manual') {
                                            const agent = viewingAgents.find(a => a.id === e.target.value);
                                            if (agent) setNewOrderViewFee(agent.defaultFee || 50);
                                        }
                                    }}
                                >
                                    <option value="">-- 请选择带看专员 --</option>
                                    {viewingAgents.map(agent => (
                                        <option key={agent.id} value={agent.id}>{agent.name} ({agent.region}) - ¥{agent.defaultFee}/次</option>
                                    ))}
                                    <option value="manual">➕ 自定义 / 临时人员</option>
                                </select>
                            </div>

                            {newOrderViewAgentId === 'manual' && (
                                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">姓名</label>
                                        <input className="w-full p-2 border rounded text-sm" value={newOrderViewAgentName} onChange={e => setNewOrderViewAgentName(e.target.value)} placeholder="带看人姓名" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">电话</label>
                                        <input className="w-full p-2 border rounded text-sm" value={newOrderViewAgentPhone} onChange={e => setNewOrderViewAgentPhone(e.target.value)} placeholder="联系电话" />
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">带看劳务费 (成交后结算)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-slate-500">¥</span>
                                    <input
                                        type="number"
                                        className="w-full pl-7 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-indigo-600"
                                        value={newOrderViewFee}
                                        onChange={e => setNewOrderViewFee(Number(e.target.value))}
                                    />
                                    <span className="absolute right-3 top-3 text-xs text-orange-500 font-medium">不成交不收费</span>
                                </div>
                            </div>
                        </>
                    )}

                    {orderActionType === 'SIGN' && (
                        <div className="text-center py-6">
                            <p className="text-slate-600">确认直接发起签约流程？</p>
                            <p className="text-xs text-slate-400 mt-2">房源将被锁定，等待财务审核或自动归档。</p>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-slate-100 flex gap-3 bg-slate-50">
                    <button onClick={() => setIsOrderModalOpen(false)} className="flex-1 py-2.5 text-slate-500 font-bold hover:bg-slate-200 rounded-lg transition-colors">取消</button>
                    <button onClick={submitOrder} className="flex-1 py-2.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95">
                        {orderActionType === 'VIEWING' ? '确认派单' : '确认成交'}
                    </button>
                </div>
            </div>
        </div>
    );
    const updatePropertyStatus = async (pid: string, status: PropertyStatus) => {
        const prop = properties.find(p => p.id === pid);
        if (prop) {
            const updatedProp = { ...prop, status };
            const newList = await db.saveProperty(updatedProp);
            setProperties(newList);
        }
    };
    const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
        const order = orders.find(o => o.id === orderId);
        if (!order) return;

        let finalOrder = { ...order, status: newStatus };

        // Deal Confirmation Logic
        if (newStatus === OrderStatus.COMPLETED) {
            // Generate Snapshot at completion
            const finalProp = properties.find(p => p.id === order.propertyId);
            const agentUser = users.find(u => u.id === order.agentId);

            finalOrder.snapshot = {
                propertyTitle: finalProp?.title || order.propertyTitle,
                propertyAddress: finalProp?.address || finalProp?.location || '',
                propertySpecs: finalProp ? `${finalProp.layout} ${finalProp.area}㎡` : '',
                clientName: order.clientName,
                clientContact: order.clientPhone || '',
                agentName: order.agentName,
                agentPhone: agentUser?.username || '', // Assuming username serves as phone/contact ID as per convention
                dealPrice: order.price,
                contractDate: new Date().toISOString().split('T')[0]
            };

            // Update Viewing Agent Status
            if (finalOrder.viewingStatus === 'ASSIGNED') {
                finalOrder.viewingStatus = 'PENDING_DEAL'; // Fee is now due
            }

            const targetStatus = PropertyStatus.RENTED;
            updatePropertyStatus(order.propertyId, targetStatus);
            addSystemLog(`订单成交确认 [${order.propertyTitle}] - 成交价: ${order.price}`);

            // Sync Client Status
            if (order.clientId) {
                const client = clients.find(c => c.id === order.clientId);
                if (client) {
                    const today = new Date();
                    const nextYear = new Date(today);
                    nextYear.setFullYear(today.getFullYear() + 1);

                    const updatedClient = {
                        ...client,
                        status: ClientStatus.SIGNED,
                        contractId: order.id,
                        leaseStartDate: finalOrder.snapshot?.contractDate || today.toISOString().split('T')[0],
                        leaseEndDate: nextYear.toISOString().split('T')[0],
                        lastContactDate: today.toLocaleString().split(' ')[0]
                    };
                    const newClientList = await db.saveClient(updatedClient);
                    setClients(newClientList);
                }
            }
        }

        if (newStatus === OrderStatus.CANCELLED) {
            if (finalOrder.viewingStatus) finalOrder.viewingStatus = 'VOID'; // No deal, no pay
            if (order.status === OrderStatus.PENDING) {
                updatePropertyStatus(order.propertyId, PropertyStatus.AVAILABLE);
            }
        }

        const updatedOrders = await db.saveOrder(finalOrder);
        setOrders(updatedOrders);
    };

    const handleAddClient = async (client: Client) => {
        const updated = await db.saveClient(client);
        setClients([...updated]);
    };
    const handleUpdateClient = async (id: string, updates: Partial<Client>) => {
        const client = clients.find(c => c.id === id);
        if (client) {
            const updatedClient = { ...client, ...updates };
            const list = await db.saveClient(updatedClient);
            setClients(list);
        }
    };
    const handleAssignClient = async (clientId: string, agentId: string) => {
        const client = clients.find(c => c.id === clientId);
        if (client) {
            const updatedClient = { ...client, agentId: agentId, status: ClientStatus.NEW };
            const list = await db.saveClient(updatedClient);
            setClients(list);
            const agentName = users.find(u => u.id === agentId)?.name;
            addSystemLog(`分配线索 [${clientId}] 给 [${agentName}]`);
        }
    };

    const handleAddUser = async (u: User) => {
        const list = await db.saveUser(u);
        setUsers(list);
    };
    const handleUpdateUser = async (id: string, u: Partial<User>) => {
        const existing = users.find(user => user.id === id);
        if (existing) {
            const updated = { ...existing, ...u };
            const list = await db.saveUser(updated);
            setUsers(list);
        }
    };
    const handleDeleteUser = async (id: string) => {
        const list = await db.deleteUser(id);
        setUsers(list);
    };

    const handleSaveKnowledge = async (item: KnowledgeItem) => {
        const list = await db.saveKnowledge(item);
        setKnowledgeEntries(list);
    };
    const handleDeleteKnowledge = async (id: string) => {
        const list = await db.deleteKnowledge(id);
        setKnowledgeEntries(list);
    };

    // Filter History Data based on user input
    const filteredHistoryOrders = orders.filter(o => {
        if (o.status !== OrderStatus.COMPLETED && o.status !== OrderStatus.CANCELLED) return false;
        if (historyQuery) {
            const q = historyQuery.toLowerCase();
            const match = o.propertyTitle.toLowerCase().includes(q) ||
                o.clientName.toLowerCase().includes(q) ||
                o.agentName.toLowerCase().includes(q);
            if (!match) return false;
        }
        const dateToCheck = o.contractDate ? o.contractDate.split(' ')[0] : o.createdAt;
        if (historyStartDate && dateToCheck < historyStartDate) return false;
        if (historyEndDate && dateToCheck > historyEndDate) return false;
        return true;
    });

    const exportHistoryToExcel = () => {
        const BOM = "\uFEFF";
        const headers = ['订单ID', '房源名称', '房源ID', '成交价格', '签约日期', '客户姓名', '客户电话', '负责销售', '订单状态'];
        const csvRows = filteredHistoryOrders.map(o => {
            return [
                o.id, `"${o.propertyTitle}"`, o.propertyId, o.price, o.contractDate || o.createdAt, o.clientName, o.clientPhone || '', o.agentName,
                o.status === OrderStatus.COMPLETED ? '已成交' : '已取消'
            ].join(',');
        });
        const csvContent = BOM + [headers.join(','), ...csvRows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `history_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const renderAddPropertyModal = () => (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl w-[1000px] max-w-full h-[90vh] flex flex-col shadow-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-white z-20 shadow-sm flex-shrink-0">
                    <h3 className="text-xl font-bold text-slate-800">{editingPropertyId ? '编辑房源' : '发布新房源'}</h3>
                    <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">×</button>
                </div>
                <div className="flex bg-slate-50 border-b border-slate-200 px-6 space-x-6 flex-shrink-0 overflow-x-auto">
                    {[{ id: 'BASIC', label: '基础信息 & 商务条款', icon: '📝' }, { id: 'DETAILS', label: '房况配套', icon: '🏗️' }, { id: 'MEDIA', label: '影像资料', icon: '📷' }, { id: 'LANDLORD', label: '房东与房型', icon: '👤' }].map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`py-3 text-sm font-bold border-b-2 transition-colors flex items-center whitespace-nowrap ${activeTab === tab.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}><span className="mr-2">{tab.icon}</span> {tab.label}</button>
                    ))}
                </div>
                <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-white scroll-smooth">
                    {activeTab === 'BASIC' && (
                        <div className="space-y-6">
                            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-5 rounded-xl border border-indigo-100 mb-6">
                                <h4 className="text-indigo-800 font-bold mb-2 flex items-center text-sm"><span className="mr-2">✨</span> AI 智能识别 (图文一键填单)</h4>
                                <div className="flex gap-3">
                                    <textarea value={aiInputText} onChange={e => setAiInputText(e.target.value)} onPaste={handlePaste} placeholder="在此粘贴房源描述文本，或直接粘贴聊天截图 (Ctrl+V)..." className="flex-1 h-20 bg-white border border-indigo-200 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-300 resize-none text-slate-700 placeholder-slate-400" />
                                    <div className="flex flex-col gap-2"><button onClick={handleSmartFill} disabled={isAiParsing} className="h-full px-4 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-xs shadow-md whitespace-nowrap">{isAiParsing ? '分析中...' : '一键识别'}</button></div>
                                </div>
                            </div>
                            <div className="grid grid-cols-12 gap-4">
                                <div className="col-span-12 md:col-span-6"><label className="block text-sm font-bold text-slate-700 mb-1">房源标题</label><input className="w-full p-2.5 bg-slate-50 text-slate-900 border border-slate-300 rounded-lg" value={newProperty.title || ''} onChange={e => setNewProperty({ ...newProperty, title: e.target.value })} /></div>
                                <div className="col-span-12 md:col-span-6"><label className="block text-sm font-bold text-slate-700 mb-1">物业分类</label>
                                    <select className="w-full p-2.5 bg-slate-50 text-slate-900 border border-slate-300 rounded-lg" value={newProperty.category} onChange={e => setNewProperty({ ...newProperty, category: e.target.value as any })}>
                                        {['住宅', '城市公寓', '城中村公寓', '别墅', '工厂', '写字楼', '商铺', '其他'].map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="col-span-12 md:col-span-6"><label className="block text-sm font-bold text-slate-700 mb-1">租金 (元/月)</label><input type="number" className="w-full p-2.5 bg-slate-50 text-slate-900 border border-slate-300 rounded-lg" value={newProperty.price || ''} onChange={e => setNewProperty({ ...newProperty, price: Number(e.target.value) })} /></div>
                                <div className="col-span-12 md:col-span-6"><label className="block text-sm font-bold text-slate-700 mb-1">面积 (㎡)</label><input type="number" className="w-full p-2.5 bg-slate-50 text-slate-900 border border-slate-300 rounded-lg" value={newProperty.area || ''} onChange={e => setNewProperty({ ...newProperty, area: Number(e.target.value) })} /></div>

                                <div className="col-span-12 border-t border-slate-200 pt-3 mt-1 pb-3">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">地理位置</label>
                                    <div className="grid grid-cols-3 gap-2 mb-2">
                                        <select className="p-2 border rounded-lg bg-slate-50 text-slate-800 text-sm" value={newPropertyProvince} onChange={e => setNewPropertyProvince(e.target.value)}>
                                            {Object.keys(CASCADING_REGIONS).map(p => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                        <select className="p-2 border rounded-lg bg-slate-50 text-slate-800 text-sm" value={newPropertyCity} onChange={e => setNewPropertyCity(e.target.value)}>
                                            {Object.keys(CASCADING_REGIONS[newPropertyProvince] || {}).map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                        <select className="p-2 border rounded-lg bg-slate-50 text-slate-800 text-sm" value={newPropertyDistrict} onChange={e => setNewPropertyDistrict(e.target.value)}>
                                            {(CASCADING_REGIONS[newPropertyProvince]?.[newPropertyCity] || []).map(d => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                    </div>
                                    <div className="flex gap-2">
                                        <input className="flex-1 p-2.5 bg-slate-50 text-slate-900 border border-slate-300 rounded-lg" placeholder="详细地址 (小区/街道/门牌号)..." value={newProperty.address || ''} onChange={e => setNewProperty({ ...newProperty, address: e.target.value })} />
                                        <button onClick={handleAutoLocate} className="px-4 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 flex items-center whitespace-nowrap">📍 自动定位</button>
                                    </div>
                                </div>

                                <div className="col-span-12 md:col-span-4"><label className="block text-sm font-bold text-slate-700 mb-1">楼号</label><input className="w-full p-2.5 bg-slate-50 text-slate-900 border border-slate-300 rounded-lg" value={newPropertyDetails.buildingNum || ''} onChange={e => setNewPropertyDetails({ ...newPropertyDetails, buildingNum: e.target.value })} /></div>
                                <div className="col-span-12 md:col-span-4"><label className="block text-sm font-bold text-slate-700 mb-1">单元号</label><input className="w-full p-2.5 bg-slate-50 text-slate-900 border border-slate-300 rounded-lg" value={newPropertyDetails.unitNum || ''} onChange={e => setNewPropertyDetails({ ...newPropertyDetails, unitNum: e.target.value })} /></div>
                                <div className="col-span-12 md:col-span-4"><label className="block text-sm font-bold text-slate-700 mb-1">楼层</label><input className="w-full p-2.5 bg-slate-50 text-slate-900 border border-slate-300 rounded-lg" value={newPropertyDetails.floorNum || ''} onChange={e => setNewPropertyDetails({ ...newPropertyDetails, floorNum: e.target.value })} /></div>

                                <div className="col-span-12 border-t border-slate-200 pt-4 mt-2">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">特色标签 (无限添加)</label>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {newPropertyTags.map(tag => (
                                            <span key={tag} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold flex items-center">
                                                {tag}
                                                <button onClick={() => toggleTag(tag)} className="ml-2 hover:text-indigo-900">×</button>
                                            </span>
                                        ))}
                                    </div>
                                    <div className="flex gap-2 mb-2">
                                        <input className="flex-1 p-2 border rounded-lg text-sm bg-white text-slate-900" placeholder="自定义标签..." value={customTagInput} onChange={e => setCustomTagInput(e.target.value)} />
                                        <button onClick={addCustomTag} className="px-4 py-2 bg-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-300">添加</button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {Object.entries(PRESET_TAGS).map(([cat, tags]) => (
                                            tags.map(tag => (
                                                <button key={tag} onClick={() => toggleTag(tag)} className={`px-2 py-1 text-xs rounded border transition-colors ${newPropertyTags.includes(tag) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300'}`}>
                                                    {tag}
                                                </button>
                                            ))
                                        ))}
                                    </div>
                                </div>

                                {/* Merged Business & Lease Info */}
                                <div className="col-span-12 border-t border-slate-200 pt-4 mt-2">
                                    <h4 className="font-bold text-slate-800 mb-3 text-sm">租赁周期与商务条款</h4>

                                    {/* Lease Terms */}
                                    <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 mb-4">
                                        <h5 className="font-bold text-orange-800 mb-2 text-xs">租赁方式 (可多选)</h5>
                                        <div className="flex flex-wrap gap-3 mb-3">
                                            {LEASE_TERM_OPTIONS.map(term => (
                                                <button
                                                    key={term}
                                                    onClick={() => toggleLeaseTerm(term)}
                                                    className={`px-4 py-2 rounded-lg text-sm font-bold border transition-colors ${newPropertyLeaseTerms.includes(term) ? 'bg-orange-500 text-white border-orange-600 shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:bg-orange-50'}`}
                                                >
                                                    {term}
                                                </button>
                                            ))}
                                        </div>
                                        {newPropertyLeaseTerms.length > 0 && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 border-t border-orange-200 pt-3">
                                                {newPropertyLeaseTerms.map(term => (
                                                    <div key={term} className="flex items-center gap-2">
                                                        <span className="w-20 text-xs font-bold text-slate-600">{term}佣金</span>
                                                        <input className="flex-1 p-2 border border-slate-300 rounded text-sm bg-white text-slate-900 h-8" placeholder="如: 1个月" value={newPropertyLeaseCommissions[term] || ''} onChange={e => handleCommissionChange(term, e.target.value)} />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Payment & Contract Terms */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">支付方式</label>
                                            <select className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900" value={newPropertyDetails.paymentMethod || ''} onChange={e => setNewPropertyDetails({ ...newPropertyDetails, paymentMethod: e.target.value })}>
                                                <option value="">请选择...</option>
                                                {DETAILED_OPTIONS.paymentMethod.map(o => <option key={o} value={o}>{o}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">违约责任</label>
                                            <select className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900" value={newPropertyDetails.breachTerms || ''} onChange={e => setNewPropertyDetails({ ...newPropertyDetails, breachTerms: e.target.value })}>
                                                <option value="">请选择...</option>
                                                {DETAILED_OPTIONS.breachTerms.map(o => <option key={o} value={o}>{o}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">入住时间</label>
                                            <select className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900" value={newPropertyDetails.moveInDate || ''} onChange={e => setNewPropertyDetails({ ...newPropertyDetails, moveInDate: e.target.value })}>
                                                <option value="">请选择...</option>
                                                {DETAILED_OPTIONS.moveInDate.map(o => <option key={o} value={o}>{o}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'DETAILS' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {['utilities', 'wallCondition', 'soundproofing', 'fireSafety', 'doorLock', 'securityLevel', 'propertyMgmt'].map(key => (
                                    <div key={key}>
                                        <label className="block text-sm font-bold text-slate-700 mb-1 capitalize">
                                            {key === 'utilities' ? '水电燃气' :
                                                key === 'wallCondition' ? '墙面状况' :
                                                    key === 'soundproofing' ? '隔音效果' :
                                                        key === 'fireSafety' ? '消防设施' :
                                                            key === 'doorLock' ? '门锁类型' :
                                                                key === 'securityLevel' ? '安保等级' :
                                                                    key === 'propertyMgmt' ? '物业服务' : key}
                                        </label>
                                        <select
                                            className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                                            // @ts-ignore
                                            value={newPropertyDetails[key === 'utilities' ? 'utilitiesStatus' : key] || ''}
                                            onChange={(e) => {
                                                const fieldName = key === 'utilities' ? 'utilitiesStatus' : key;
                                                setNewPropertyDetails({ ...newPropertyDetails, [fieldName]: e.target.value });
                                            }}
                                        >
                                            <option value="">请选择...</option>
                                            {/* @ts-ignore */}
                                            {DETAILED_OPTIONS[key].map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                                        </select>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-slate-200 pt-4">
                                <label className="block text-sm font-bold text-slate-700 mb-2">周边配套 (多选)</label>
                                <div className="flex flex-wrap gap-2">
                                    {DETAILED_OPTIONS.nearbyFacilities.map((fac: string) => (
                                        <button
                                            key={fac}
                                            onClick={() => toggleDetailArray(newPropertyFacilities, setNewPropertyFacilities, fac)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${newPropertyFacilities.includes(fac) ? 'bg-green-100 text-green-700 border-green-200' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
                                        >
                                            {fac}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">环境噪音/宜居度 (多选)</label>
                                <div className="flex flex-wrap gap-2">
                                    {DETAILED_OPTIONS.surroundings.map((sur: string) => (
                                        <button
                                            key={sur}
                                            onClick={() => toggleDetailArray(newPropertySurroundings, setNewPropertySurroundings, sur)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${newPropertySurroundings.includes(sur) ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
                                        >
                                            {sur}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'MEDIA' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">主图 (封面)</label>
                                    <div className="w-full h-48 bg-slate-100 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center overflow-hidden relative group hover:border-indigo-400 transition-colors">
                                        {newProperty.imageUrl ? (
                                            <img src={newProperty.imageUrl} className="w-full h-full object-cover" alt="Main" />
                                        ) : (
                                            <div className="text-center text-slate-400">
                                                <div className="text-2xl mb-1">📷</div>
                                                <div className="text-xs">点击上传主图</div>
                                            </div>
                                        )}
                                        <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'imageUrl')} className="absolute inset-0 opacity-0 cursor-pointer" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">户型图</label>
                                    <div className="w-full h-48 bg-slate-100 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center overflow-hidden relative group hover:border-indigo-400 transition-colors">
                                        {newProperty.floorPlanUrl ? (
                                            <img src={newProperty.floorPlanUrl} className="w-full h-full object-contain" alt="FloorPlan" />
                                        ) : (
                                            <div className="text-center text-slate-400">
                                                <div className="text-2xl mb-1">📐</div>
                                                <div className="text-xs">点击上传户型图</div>
                                            </div>
                                        )}
                                        <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'floorPlanUrl')} className="absolute inset-0 opacity-0 cursor-pointer" />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">VR 看房链接 (URL)</label>
                                <input
                                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                                    placeholder="https://vr.example.com/..."
                                    value={newProperty.vrUrl || ''}
                                    onChange={e => setNewProperty({ ...newProperty, vrUrl: e.target.value })}
                                />
                            </div>

                            <div className="border-t border-slate-200 pt-4">
                                <label className="block text-sm font-bold text-slate-700 mb-2">更多实拍图 (支持批量)</label>
                                <div className="flex flex-wrap gap-3">
                                    {newPropertyAdditionalImages.map((url, idx) => (
                                        <div key={idx} className="w-24 h-24 bg-slate-100 rounded-lg overflow-hidden relative group">
                                            <img src={url} className="w-full h-full object-cover" alt="" />
                                            <button
                                                onClick={() => setNewPropertyAdditionalImages(prev => prev.filter((_, i) => i !== idx))}
                                                className="absolute top-1 right-1 bg-black/50 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                    <div className="w-24 h-24 bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center relative hover:border-indigo-400 hover:bg-indigo-50 transition-colors">
                                        <span className="text-2xl text-slate-400">+</span>
                                        <input type="file" multiple accept="image/*" onChange={(e) => handleMultipleFilesUpload(e, 'IMAGES')} className="absolute inset-0 opacity-0 cursor-pointer" />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">房源视频 (MP4)</label>
                                <div className="flex flex-wrap gap-3">
                                    {newPropertyVideos.map((url, idx) => (
                                        <div key={idx} className="w-40 h-24 bg-black rounded-lg overflow-hidden relative group">
                                            <video src={url} className="w-full h-full object-cover opacity-80" />
                                            <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-xs pointer-events-none">VIDEO {idx + 1}</div>
                                            <button
                                                onClick={() => setNewPropertyVideos(prev => prev.filter((_, i) => i !== idx))}
                                                className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                    <div className="w-40 h-24 bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center relative hover:border-indigo-400 hover:bg-indigo-50 transition-colors">
                                        <div className="text-center text-slate-400">
                                            <div className="text-xl mb-1">🎬</div>
                                            <div className="text-[10px]">添加视频</div>
                                        </div>
                                        <input type="file" multiple accept="video/mp4" onChange={(e) => handleMultipleFilesUpload(e, 'VIDEOS')} className="absolute inset-0 opacity-0 cursor-pointer" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}


                    {activeTab === 'LANDLORD' && (
                        <div className="space-y-6">
                            <div className="flex gap-4 mb-4">
                                <button
                                    onClick={() => setNewPropertyLandlordType(LandlordType.INDIVIDUAL)}
                                    className={`flex-1 py-3 rounded-lg border-2 font-bold text-sm transition-all ${newPropertyLandlordType === LandlordType.INDIVIDUAL ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'}`}
                                >
                                    👤 个人房东 (普通住宅)
                                </button>
                                <button
                                    onClick={() => setNewPropertyLandlordType(LandlordType.CORPORATE)}
                                    className={`flex-1 py-3 rounded-lg border-2 font-bold text-sm transition-all ${newPropertyLandlordType === LandlordType.CORPORATE ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'}`}
                                >
                                    🏢 企业/公寓运营商 (集中式)
                                </button>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <div className="flex justify-between items-center mb-3">
                                    <h4 className="font-bold text-slate-800 text-sm">联系人信息</h4>
                                    <button onClick={addContact} className="text-xs text-indigo-600 font-bold hover:underline">+ 添加联系人</button>
                                </div>
                                <div className="space-y-3">
                                    {newPropertyLandlordContacts.map((contact, idx) => (
                                        <div key={idx} className="flex gap-3 items-start flex-wrap">
                                            <input className="w-24 p-2 text-sm border border-slate-300 rounded bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="姓名" value={contact.name} onChange={e => updateContact(idx, 'name', e.target.value)} />
                                            <input className="w-32 p-2 text-sm border border-slate-300 rounded bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="电话" value={contact.phone} onChange={e => updateContact(idx, 'phone', e.target.value)} />
                                            <input className="flex-1 p-2 text-sm border border-slate-300 rounded bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none min-w-[150px]" placeholder="微信/备注" value={contact.note || ''} onChange={e => updateContact(idx, 'note', e.target.value)} />
                                            {idx > 0 && <button onClick={() => removeContact(idx)} className="text-red-500 text-sm px-2">×</button>}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {newPropertyLandlordType === LandlordType.CORPORATE && (
                                <div className="border-t border-slate-200 pt-6">
                                    <h4 className="font-bold text-slate-800 mb-4 flex items-center">
                                        <span className="mr-2">🏘️</span> 子户型管理 (公寓/酒店房型)
                                    </h4>

                                    {/* Add Unit Form */}
                                    <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 mb-4">
                                        <h5 className="text-xs font-bold text-purple-800 uppercase mb-2">添加新户型</h5>
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                                            <input className="p-2 text-sm border border-slate-300 rounded bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="户型名称 (如: 豪华大床房)" value={tempUnit.name} onChange={e => setTempUnit({ ...tempUnit, name: e.target.value })} />
                                            <input type="number" className="p-2 text-sm border border-slate-300 rounded bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="价格 (元)" value={tempUnit.price || ''} onChange={e => setTempUnit({ ...tempUnit, price: Number(e.target.value) })} />
                                            <input type="number" className="p-2 text-sm border border-slate-300 rounded bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="面积 (㎡)" value={tempUnit.area || ''} onChange={e => setTempUnit({ ...tempUnit, area: Number(e.target.value) })} />
                                            <input className="p-2 text-sm border border-slate-300 rounded bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="格局 (1室0厅)" value={tempUnit.layout} onChange={e => setTempUnit({ ...tempUnit, layout: e.target.value })} />
                                        </div>
                                        <div className="flex gap-3 flex-wrap">
                                            <div className="flex-1 min-w-[200px] bg-white border border-slate-200 rounded flex items-center px-3 text-sm text-slate-400 relative overflow-hidden h-10">
                                                {tempUnit.imageUrl ? '已选择图片' : '点击上传户型图'}
                                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleUnitImageUpload} />
                                            </div>
                                            <button onClick={handleAddUnit} className="px-6 py-2 bg-purple-600 text-white font-bold rounded hover:bg-purple-700 text-sm">添加户型</button>
                                        </div>
                                    </div>

                                    {/* Unit List */}
                                    <div className="space-y-2">
                                        {newPropertyUnits.map(unit => (
                                            <div key={unit.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 bg-slate-100 rounded overflow-hidden">
                                                        {unit.imageUrl ? <img src={unit.imageUrl} className="w-full h-full object-cover" alt="" /> : <span className="text-xs text-slate-300 block text-center mt-4">无图</span>}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-800 text-sm">{unit.name}</div>
                                                        <div className="text-xs text-slate-500">{unit.layout} · {unit.area}㎡</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="font-bold text-rose-600">¥{unit.price}</div>
                                                    <button onClick={() => handleRemoveUnit(unit.id)} className="text-xs text-red-500 hover:underline">删除</button>
                                                </div>
                                            </div>
                                        ))}
                                        {newPropertyUnits.length === 0 && <div className="text-center text-slate-400 text-sm py-4">暂无子户型</div>}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center z-20 flex-shrink-0">
                    <div className="text-xs text-slate-400">信息自动保存，点击发布即可生效</div>
                    <div className="flex gap-3"><button onClick={() => setIsAddModalOpen(false)} className="px-6 py-2.5 rounded-lg border border-slate-300 text-slate-600 font-medium hover:bg-white transition-colors">取消</button><button onClick={handleSaveProperty} className="px-8 py-2.5 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-transform active:scale-95">{editingPropertyId ? '保存修改' : '立即发布'}</button></div>
                </div>
            </div>
        </div>
    );

    if (dataLoading) {
        return <div className="h-screen w-screen flex items-center justify-center bg-slate-100 text-slate-500 flex-col gap-2">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <div className="text-sm font-bold">正在连接数据库...</div>
        </div>;
    }

    if (!currentUser) {
        return <LoginPage onLogin={handleLogin} error={loginError} config={systemConfig} loading={authLoading} />;
    }

    if (activePage === 'big-screen') {
        if (!currentUser.permissions.includes('VIEW_DASHBOARD')) {
            setActivePage('properties');
            return null;
        }
        return <BigScreenDashboard properties={properties} orders={orders} onExit={() => setActivePage('properties')} />;
    }

    return (
        <Layout user={currentUser} onLogout={handleLogout} activePage={activePage} onNavigate={setActivePage}>
            {isAddModalOpen && renderAddPropertyModal()}
            {isOrderModalOpen && renderOrderCreationModal()}
            <AIChatBot knowledgeBase={knowledgeEntries} />

            {activePage === 'properties' && (
                <>
                    {selectedProperty ? (
                        <PropertyDetail
                            property={selectedProperty}
                            onBack={() => { setSelectedProperty(null); setSharedViewConfig(undefined); }}
                            onEdit={() => handleOpenEdit(selectedProperty)}
                            onDelete={() => handleDeleteProperty(selectedProperty.id)}
                            onOrderAction={handleCreateOrder}
                            viewConfig={sharedViewConfig}
                        />
                    ) : (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800">房源资产库</h2>
                                    <p className="text-sm text-slate-500 mt-1">共 {displayedProperties.length} 套房源</p>
                                </div>
                                <div className="flex gap-3">
                                    {currentUser.permissions.includes('VIEW_DASHBOARD') && (
                                        <button onClick={() => setActivePage('data-screen')} className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg font-bold text-sm">地图找房</button>
                                    )}
                                    <button onClick={handleOpenAdd} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm shadow-lg">+ 发布房源</button>
                                </div>
                            </div>

                            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 mb-1 ml-1">省份</label>
                                        <select value={filterProvince} onChange={e => setFilterProvince(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-700">
                                            <option value="全部">全部省份</option>
                                            {Object.keys(CASCADING_REGIONS).map(p => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 mb-1 ml-1">城市</label>
                                        <select value={filterCity} onChange={e => setFilterCity(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-700">
                                            <option value="全部">全部城市</option>
                                            {filterProvince !== '全部' && Object.keys(CASCADING_REGIONS[filterProvince] || {}).map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 mb-1 ml-1">区域</label>
                                        <select value={filterDistrict} onChange={e => setFilterDistrict(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-700">
                                            <option value="全部">全部区域</option>
                                            {filterCity !== '全部' && CASCADING_REGIONS[filterProvince]?.[filterCity]?.map(d => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 mb-1 ml-1">物业分类</label>
                                        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-700">
                                            <option value="全部">不限</option>
                                            {['住宅', '城市公寓', '城中村公寓', '别墅', '工厂', '写字楼', '商铺', '其他'].map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 mb-1 ml-1">租金范围</label>
                                        <select value={filterPrice} onChange={e => setFilterPrice(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-700">
                                            <option value="全部">不限</option>
                                            <option value="5000元以下">5000元以下</option>
                                            <option value="5000-8000元">5000-8000元</option>
                                            <option value="8000-15000元">8000-15000元</option>
                                            <option value="15000元以上">15000元以上</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                                    <button onClick={resetFilters} className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors flex items-center">
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                        重置筛选条件
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {displayedProperties.map(p => (
                                    <PropertyCard
                                        key={p.id}
                                        property={p}
                                        onClick={() => setSelectedProperty(p)}
                                        isFavorite={currentUser.favorites?.includes(p.id)}
                                        onToggleFavorite={(e) => handleToggleFavorite(p.id, e)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}

            {activePage === 'data-screen' && (
                <DataScreen properties={properties} onViewProperty={setSelectedProperty} />
            )}

            {activePage === 'clients' && (
                <ClientManagement clients={clients} currentUser={currentUser!} onAddClient={handleAddClient} onUpdateClient={handleUpdateClient} />
            )}

            {activePage === 'orders' && (
                <OrderManagement orders={orders} onUpdateOrderStatus={handleUpdateOrderStatus} onViewOrderDetails={() => { }} />
            )}

            {activePage === 'users' && (
                <UserManagement users={users} currentUser={currentUser!} onAddUser={handleAddUser} onUpdateUser={handleUpdateUser} onDeleteUser={handleDeleteUser} />
            )}

            {activePage === 'system-settings' && (
                <SystemSettings logs={systemLogs} config={systemConfig} onUpdateConfig={handleUpdateSystemConfig} />
            )}

            {activePage === 'knowledge' && (
                <KnowledgeBase
                    entries={knowledgeEntries}
                    onSaveEntry={handleSaveKnowledge}
                    onDeleteEntry={handleDeleteKnowledge}
                    canEdit={currentUser?.role !== UserRole.SALES}
                />
            )}

            {activePage === 'acquisition' && (
                <AcquisitionChannel clients={clients} users={users} onAddClient={handleAddClient} onAssignClient={handleAssignClient} />
            )}

            {activePage === 'history' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">历史成交档案</h2>
                            <p className="text-sm text-slate-500 mt-1">共 {filteredHistoryOrders.length} 条成交记录</p>
                        </div>
                        {currentUser?.permissions.includes('DATA_EXPORT') && (
                            <button
                                onClick={exportHistoryToExcel}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg font-bold text-sm shadow-md hover:bg-green-700 flex items-center"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                导出 Excel 报表
                            </button>
                        )}
                    </div>

                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap gap-4 items-end">
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-xs font-bold text-slate-500 mb-1">关键词搜索</label>
                            <input
                                placeholder="房源名 / 客户名 / 销售名..."
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={historyQuery}
                                onChange={(e) => setHistoryQuery(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">签约开始日期</label>
                            <input
                                type="date"
                                className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700"
                                value={historyStartDate}
                                onChange={(e) => setHistoryStartDate(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">签约结束日期</label>
                            <input
                                type="date"
                                className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700"
                                value={historyEndDate}
                                onChange={(e) => setHistoryEndDate(e.target.value)}
                            />
                        </div>
                        <div className="pb-0.5">
                            <button
                                onClick={() => { setHistoryQuery(''); setHistoryStartDate(''); setHistoryEndDate(''); }}
                                className="text-sm text-slate-500 hover:text-indigo-600 px-2"
                            >
                                重置
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left min-w-[1000px]">
                                <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-4">房源信息</th>
                                        <th className="px-6 py-4">成交价格</th>
                                        <th className="px-6 py-4">签约日期</th>
                                        <th className="px-6 py-4">客户信息</th>
                                        <th className="px-6 py-4">负责销售</th>
                                        <th className="px-6 py-4 text-right">状态</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredHistoryOrders.map(order => (
                                        <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-16 h-12 bg-slate-200 rounded overflow-hidden flex-shrink-0 border border-slate-200">
                                                        <img src={order.propertyImage} className="w-full h-full object-cover" alt="" />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-800 line-clamp-1">{order.propertyTitle}</div>
                                                        <div className="text-xs text-slate-400">ID: {order.propertyId}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-bold text-rose-600">¥{order.price}<span className="text-xs text-slate-400 font-normal">/月</span></span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">
                                                {order.contractDate || order.createdAt}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-700">{order.clientName}</div>
                                                <div className="text-xs text-slate-500">{order.clientPhone || '-'}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
                                                    {order.agentName}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${order.status === OrderStatus.COMPLETED ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                                                    }`}>
                                                    {order.status === OrderStatus.COMPLETED ? '已成交' : '已取消'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredHistoryOrders.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="text-center py-20 text-slate-400">
                                                暂无符合条件的成交记录
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

        </Layout>
    );
};

export default App;
