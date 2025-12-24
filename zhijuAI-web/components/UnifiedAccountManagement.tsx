import React, { useState, useEffect } from 'react';
import LandlordDetailModal from './LandlordDetailModal';

// ============== 类型定义 ==============
interface Employee {
    id: string;
    name: string;
    username: string;
    password?: string;
    role: string;
    group?: string;
    managerId?: string;
    permissions: string[];
}

interface LandlordAccount {
    id: string;
    name: string;
    phone: string;
    avatar_url?: string;
    status: string;
    uuid_id?: string;
    created_at: string;
}

interface TenantAccount {
    id: string;
    name: string;
    phone: string;
    avatar_url?: string;
    status: string;
    created_at: string;
}

interface UnifiedAccountManagementProps {
    supabase: any;
    // 员工相关 - 使用 any 兼容现有 User 类型
    employees: any[];
    onAddEmployee: (e: any) => void;
    onUpdateEmployee: (id: string, e: any) => void;
    onDeleteEmployee: (id: string) => void;
}

type TabKey = 'employee' | 'landlord' | 'tenant';

const UnifiedAccountManagement: React.FC<UnifiedAccountManagementProps> = ({
    supabase,
    employees,
    onAddEmployee,
    onUpdateEmployee,
    onDeleteEmployee
}) => {
    const [activeTab, setActiveTab] = useState<TabKey>('employee');
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // 房东数据
    const [landlords, setLandlords] = useState<LandlordAccount[]>([]);
    const [selectedLandlord, setSelectedLandlord] = useState<{ id: string; name: string } | null>(null);

    // 租客数据
    const [tenants, setTenants] = useState<TenantAccount[]>([]);
    const [selectedTenant, setSelectedTenant] = useState<TenantAccount | null>(null);

    // 加载数据
    useEffect(() => {
        if (activeTab === 'landlord') {
            loadLandlords();
        } else if (activeTab === 'tenant') {
            loadTenants();
        }
    }, [activeTab]);

    const loadLandlords = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('landlords')
                .select('*')
                .order('created_at', { ascending: false });
            if (!error && data) {
                setLandlords(data);
            }
        } catch (err) {
            console.error('加载房东失败', err);
        } finally {
            setLoading(false);
        }
    };

    const loadTenants = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('tenants')
                .select('*')
                .order('created_at', { ascending: false });
            if (!error && data) {
                setTenants(data);
            }
        } catch (err) {
            console.error('加载租客失败', err);
        } finally {
            setLoading(false);
        }
    };

    // 过滤搜索
    const filteredEmployees = employees.filter(e =>
        e.name.includes(searchTerm) || e.username.includes(searchTerm)
    );
    const filteredLandlords = landlords.filter(l =>
        l.name?.includes(searchTerm) || l.phone?.includes(searchTerm)
    );
    const filteredTenants = tenants.filter(t =>
        t.name?.includes(searchTerm) || t.phone?.includes(searchTerm)
    );

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            active: 'bg-green-100 text-green-700',
            disabled: 'bg-red-100 text-red-700',
            pending: 'bg-yellow-100 text-yellow-700',
        };
        const labels: Record<string, string> = {
            active: '正常',
            disabled: '已禁用',
            pending: '待审核',
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs ${styles[status] || 'bg-gray-100'}`}>
                {labels[status] || status || '正常'}
            </span>
        );
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('zh-CN');
    };

    const tabConfig = [
        { key: 'employee' as TabKey, label: '👔 员工账号', color: 'indigo' },
        { key: 'landlord' as TabKey, label: '🏠 房东账号', color: 'orange' },
        { key: 'tenant' as TabKey, label: '👤 租客账号', color: 'green' },
    ];

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* 标题 */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">账号管理</h1>
                    <p className="text-gray-500 mt-1">管理系统中的员工、房东和租客账号</p>
                </div>

                {/* Tab切换 */}
                <div className="bg-white rounded-xl shadow-sm mb-6">
                    <div className="flex border-b border-gray-200">
                        {tabConfig.map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => { setActiveTab(tab.key); setSearchTerm(''); }}
                                className={`flex-1 py-4 px-6 text-center font-medium text-sm border-b-2 transition-colors ${activeTab === tab.key
                                    ? `border-${tab.color}-500 text-${tab.color}-600 bg-${tab.color}-50`
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                    }`}
                                style={{
                                    borderBottomColor: activeTab === tab.key ? (tab.color === 'orange' ? '#f97316' : tab.color === 'green' ? '#22c55e' : '#6366f1') : 'transparent',
                                    color: activeTab === tab.key ? (tab.color === 'orange' ? '#ea580c' : tab.color === 'green' ? '#16a34a' : '#4f46e5') : undefined,
                                    backgroundColor: activeTab === tab.key ? (tab.color === 'orange' ? '#fff7ed' : tab.color === 'green' ? '#f0fdf4' : '#eef2ff') : undefined
                                }}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* 工具栏 */}
                    <div className="p-4 flex justify-between items-center border-b">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder={activeTab === 'employee' ? '搜索姓名/账号' : '搜索姓名/手机号'}
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
                        </div>
                        <div className="text-sm text-gray-500">
                            共 {activeTab === 'employee' ? filteredEmployees.length : activeTab === 'landlord' ? filteredLandlords.length : filteredTenants.length} 条记录
                        </div>
                    </div>

                    {/* 内容区 */}
                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="py-20 text-center text-gray-500">加载中...</div>
                        ) : (
                            <>
                                {/* 员工Tab */}
                                {activeTab === 'employee' && (
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">姓名/账号</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">角色</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">备注/组</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">权限数</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {filteredEmployees.length === 0 ? (
                                                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">暂无员工数据</td></tr>
                                            ) : filteredEmployees.map(emp => (
                                                <tr key={emp.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center">
                                                            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-medium">
                                                                {emp.name[0]}
                                                            </div>
                                                            <div className="ml-3">
                                                                <div className="text-sm font-medium text-gray-900">{emp.name}</div>
                                                                <div className="text-xs text-gray-500">{emp.username}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs">{emp.role}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-500">{emp.group || '-'}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-500">{emp.permissions?.length || 0}项</td>
                                                    <td className="px-6 py-4 text-sm">
                                                        <button className="text-indigo-600 hover:text-indigo-900 mr-3">配置</button>
                                                        <button className="text-red-600 hover:text-red-900" onClick={() => onDeleteEmployee(emp.id)}>删除</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}

                                {/* 房东Tab */}
                                {activeTab === 'landlord' && (
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">姓名</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">手机号</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">注册时间</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {filteredLandlords.length === 0 ? (
                                                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">暂无房东数据</td></tr>
                                            ) : filteredLandlords.map(landlord => (
                                                <tr key={landlord.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center">
                                                            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-medium">
                                                                {(landlord.name || '?')[0]}
                                                            </div>
                                                            <span className="ml-3 text-sm text-gray-900">{landlord.name || '未设置'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-500">{landlord.phone}</td>
                                                    <td className="px-6 py-4">{getStatusBadge(landlord.status)}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-500">{formatDate(landlord.created_at)}</td>
                                                    <td className="px-6 py-4 text-sm">
                                                        <button
                                                            onClick={() => setSelectedLandlord({ id: landlord.id, name: landlord.name || '房东' })}
                                                            className="text-orange-600 hover:text-orange-900 font-medium"
                                                        >
                                                            查看详情
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}

                                {/* 租客Tab */}
                                {activeTab === 'tenant' && (
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">姓名</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">手机号</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">注册时间</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {filteredTenants.length === 0 ? (
                                                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">暂无租客数据</td></tr>
                                            ) : filteredTenants.map(tenant => (
                                                <tr key={tenant.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center">
                                                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-medium">
                                                                {(tenant.name || '?')[0]}
                                                            </div>
                                                            <span className="ml-3 text-sm text-gray-900">{tenant.name || '未设置'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-500">{tenant.phone}</td>
                                                    <td className="px-6 py-4">{getStatusBadge(tenant.status)}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-500">{formatDate(tenant.created_at)}</td>
                                                    <td className="px-6 py-4 text-sm">
                                                        <button
                                                            onClick={() => setSelectedTenant(tenant)}
                                                            className="text-green-600 hover:text-green-900 font-medium"
                                                        >
                                                            查看详情
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* 房东详情弹窗 */}
            {selectedLandlord && (
                <LandlordDetailModal
                    supabase={supabase}
                    landlordId={selectedLandlord.id}
                    landlordName={selectedLandlord.name}
                    onClose={() => setSelectedLandlord(null)}
                />
            )}

            {/* 租客详情弹窗 */}
            {selectedTenant && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setSelectedTenant(null)}>
                    <div className="bg-white rounded-xl w-full max-w-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-2xl font-bold">{selectedTenant.name || '租客'}</h2>
                                    <p className="text-green-200 mt-1">ID: {selectedTenant.id}</p>
                                </div>
                                <button onClick={() => setSelectedTenant(null)} className="text-white hover:bg-white/20 rounded-full p-2 text-xl">✕</button>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-500">手机号</p>
                                    <p className="font-medium text-gray-900">{selectedTenant.phone}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-500">状态</p>
                                    <p className="font-medium">{getStatusBadge(selectedTenant.status)}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-500">注册时间</p>
                                    <p className="font-medium text-gray-900">{formatDate(selectedTenant.created_at)}</p>
                                </div>
                            </div>
                            <div className="pt-4 border-t text-center text-gray-400 text-sm">
                                租客详细信息（合同、账单、维修等）开发中...
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UnifiedAccountManagement;
