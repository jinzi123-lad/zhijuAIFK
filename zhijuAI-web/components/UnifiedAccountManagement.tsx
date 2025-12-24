import React, { useState, useEffect } from 'react';
import LandlordDetailModal from './LandlordDetailModal';

// ============== 类型定义 ==============
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
        e.name?.includes(searchTerm) || e.username?.includes(searchTerm)
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
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-slate-100 text-slate-600'}`}>
                {labels[status] || status || '正常'}
            </span>
        );
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('zh-CN');
    };

    const getTitle = () => {
        if (activeTab === 'employee') return '员工账号管理';
        if (activeTab === 'landlord') return '房东账号管理';
        return '租客账号管理';
    };

    const getDescription = () => {
        if (activeTab === 'employee') return '管理内部员工、分配销售团队及细化权限';
        if (activeTab === 'landlord') return '管理房东/业主账号，查看关联房源和业务数据';
        return '管理租客账号，查看租赁合同和缴费记录';
    };

    const getCount = () => {
        if (activeTab === 'employee') return filteredEmployees.length;
        if (activeTab === 'landlord') return filteredLandlords.length;
        return filteredTenants.length;
    };

    return (
        <div className="space-y-6">
            {/* 标题区 - 与全局风格一致 */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">{getTitle()}</h2>
                    <p className="text-sm text-slate-500 mt-1">{getDescription()}</p>
                </div>
                {activeTab === 'employee' && (
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors">
                        + 新增员工
                    </button>
                )}
            </div>

            {/* Tab切换 - 白色圆角按钮组 */}
            <div className="flex bg-white rounded-lg p-1 border border-slate-200 w-fit shadow-sm">
                <button
                    onClick={() => { setActiveTab('employee'); setSearchTerm(''); }}
                    className={`px-5 py-2.5 text-sm font-medium rounded-md transition-all ${activeTab === 'employee'
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                >
                    👔 员工账号
                </button>
                <button
                    onClick={() => { setActiveTab('landlord'); setSearchTerm(''); }}
                    className={`px-5 py-2.5 text-sm font-medium rounded-md transition-all ${activeTab === 'landlord'
                            ? 'bg-orange-500 text-white shadow-md'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                >
                    🏠 房东账号
                </button>
                <button
                    onClick={() => { setActiveTab('tenant'); setSearchTerm(''); }}
                    className={`px-5 py-2.5 text-sm font-medium rounded-md transition-all ${activeTab === 'tenant'
                            ? 'bg-green-600 text-white shadow-md'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                >
                    👤 租客账号
                </button>
            </div>

            {/* 数据表格卡片 */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {/* 工具栏 */}
                <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder={activeTab === 'employee' ? '搜索姓名/账号...' : '搜索姓名/手机号...'}
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg w-64 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-700"
                        />
                        <span className="absolute left-3 top-2.5 text-slate-400">🔍</span>
                    </div>
                    <span className="text-sm text-slate-500">共 {getCount()} 条记录</span>
                </div>

                {/* 表格内容 */}
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="py-20 text-center text-slate-400">
                            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                            加载中...
                        </div>
                    ) : (
                        <>
                            {/* 员工Tab */}
                            {activeTab === 'employee' && (
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                                        <tr>
                                            <th className="px-6 py-4 text-left">姓名/账号</th>
                                            <th className="px-6 py-4 text-left">角色</th>
                                            <th className="px-6 py-4 text-left">备注/组</th>
                                            <th className="px-6 py-4 text-left">权限数</th>
                                            <th className="px-6 py-4 text-left">操作</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredEmployees.length === 0 ? (
                                            <tr><td colSpan={5} className="px-6 py-16 text-center text-slate-400">暂无员工数据</td></tr>
                                        ) : filteredEmployees.map(emp => (
                                            <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-sm">
                                                            {emp.name?.[0] || '?'}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-slate-800">{emp.name}</div>
                                                            <div className="text-xs text-slate-400">{emp.username}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold border border-indigo-100">{emp.role}</span>
                                                </td>
                                                <td className="px-6 py-4 text-slate-500">{emp.group || '-'}</td>
                                                <td className="px-6 py-4 text-slate-500">{emp.permissions?.length || 0}项</td>
                                                <td className="px-6 py-4">
                                                    <button className="text-indigo-600 hover:text-indigo-800 font-medium mr-4">配置</button>
                                                    <button className="text-red-500 hover:text-red-700 font-medium" onClick={() => onDeleteEmployee(emp.id)}>删除</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}

                            {/* 房东Tab */}
                            {activeTab === 'landlord' && (
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                                        <tr>
                                            <th className="px-6 py-4 text-left">姓名</th>
                                            <th className="px-6 py-4 text-left">手机号</th>
                                            <th className="px-6 py-4 text-left">状态</th>
                                            <th className="px-6 py-4 text-left">注册时间</th>
                                            <th className="px-6 py-4 text-left">操作</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredLandlords.length === 0 ? (
                                            <tr><td colSpan={5} className="px-6 py-16 text-center text-slate-400">暂无房东数据</td></tr>
                                        ) : filteredLandlords.map(landlord => (
                                            <tr key={landlord.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-sm">
                                                            {(landlord.name || '?')[0]}
                                                        </div>
                                                        <span className="font-medium text-slate-800">{landlord.name || '未设置'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-slate-500">{landlord.phone}</td>
                                                <td className="px-6 py-4">{getStatusBadge(landlord.status)}</td>
                                                <td className="px-6 py-4 text-slate-500">{formatDate(landlord.created_at)}</td>
                                                <td className="px-6 py-4">
                                                    <button
                                                        onClick={() => setSelectedLandlord({ id: landlord.id, name: landlord.name || '房东' })}
                                                        className="text-orange-600 hover:text-orange-800 font-medium"
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
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                                        <tr>
                                            <th className="px-6 py-4 text-left">姓名</th>
                                            <th className="px-6 py-4 text-left">手机号</th>
                                            <th className="px-6 py-4 text-left">状态</th>
                                            <th className="px-6 py-4 text-left">注册时间</th>
                                            <th className="px-6 py-4 text-left">操作</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredTenants.length === 0 ? (
                                            <tr><td colSpan={5} className="px-6 py-16 text-center text-slate-400">暂无租客数据</td></tr>
                                        ) : filteredTenants.map(tenant => (
                                            <tr key={tenant.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-sm">
                                                            {(tenant.name || '?')[0]}
                                                        </div>
                                                        <span className="font-medium text-slate-800">{tenant.name || '未设置'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-slate-500">{tenant.phone}</td>
                                                <td className="px-6 py-4">{getStatusBadge(tenant.status)}</td>
                                                <td className="px-6 py-4 text-slate-500">{formatDate(tenant.created_at)}</td>
                                                <td className="px-6 py-4">
                                                    <button
                                                        onClick={() => setSelectedTenant(tenant)}
                                                        className="text-green-600 hover:text-green-800 font-medium"
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
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedTenant(null)}>
                    <div className="bg-white rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-2xl font-bold">{selectedTenant.name || '租客'}</h2>
                                    <p className="text-green-200 mt-1 text-sm">ID: {selectedTenant.id}</p>
                                </div>
                                <button onClick={() => setSelectedTenant(null)} className="text-white/80 hover:text-white hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-xl transition-colors">✕</button>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <p className="text-xs text-slate-400 font-medium mb-1">手机号</p>
                                    <p className="font-bold text-slate-800">{selectedTenant.phone}</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <p className="text-xs text-slate-400 font-medium mb-1">状态</p>
                                    <div className="mt-1">{getStatusBadge(selectedTenant.status)}</div>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <p className="text-xs text-slate-400 font-medium mb-1">注册时间</p>
                                    <p className="font-bold text-slate-800">{formatDate(selectedTenant.created_at)}</p>
                                </div>
                            </div>
                            <div className="pt-4 border-t border-slate-100 text-center">
                                <p className="text-slate-400 text-sm">🚧 租客详细信息（合同、账单、维修记录等）开发中...</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UnifiedAccountManagement;
