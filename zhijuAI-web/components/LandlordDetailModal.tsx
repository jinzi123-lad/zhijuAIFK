import React, { useState, useEffect } from 'react';

interface LandlordDetailModalProps {
    supabase: any;
    landlordId: string;
    landlordName: string;
    onClose: () => void;
}

interface PropertyInfo {
    id: string;
    title: string;
    address: string;
    status: string;
    rent_amount: number;
}

interface ContractInfo {
    id: string;
    tenant_name?: string;
    property_address?: string;
    rent_amount: number;
    status: string;
    start_date: string;
    end_date: string;
}

interface TenantInfo {
    id: string;
    name: string;
    phone: string;
    property_address?: string;
}

interface TeamMemberInfo {
    id: string;
    name: string;
    role: string;
    phone?: string;
}

const LandlordDetailModal: React.FC<LandlordDetailModalProps> = ({
    supabase,
    landlordId,
    landlordName,
    onClose
}) => {
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'properties' | 'contracts' | 'tenants' | 'team'>('properties');
    const [properties, setProperties] = useState<PropertyInfo[]>([]);
    const [contracts, setContracts] = useState<ContractInfo[]>([]);
    const [tenants, setTenants] = useState<TenantInfo[]>([]);
    const [teamMembers, setTeamMembers] = useState<TeamMemberInfo[]>([]);

    useEffect(() => {
        loadAllData();
    }, [landlordId]);

    const loadAllData = async () => {
        setLoading(true);
        try {
            // 加载房源
            const { data: propData } = await supabase
                .from('properties')
                .select('id, title, address, status, rent_amount')
                .eq('landlord_id', landlordId);
            setProperties(propData || []);

            // 加载合同
            const { data: contractData } = await supabase
                .from('contracts')
                .select('id, rent_amount, status, start_date, end_date')
                .eq('landlord_id', landlordId);
            setContracts(contractData || []);

            // 加载租客（通过合同关联）
            const { data: tenantData } = await supabase
                .from('tenants')
                .select('id, name, phone')
                .limit(50);
            setTenants(tenantData || []);

            // 加载团队成员
            const { data: teamData } = await supabase
                .from('team_members')
                .select('id, name, role, phone')
                .eq('landlord_id', landlordId);
            setTeamMembers(teamData || []);

        } catch (err) {
            console.error('加载数据失败', err);
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { key: 'properties', label: '房源', icon: '🏠', count: properties.length },
        { key: 'contracts', label: '合同', icon: '📄', count: contracts.length },
        { key: 'tenants', label: '租客', icon: '👥', count: tenants.length },
        { key: 'team', label: '团队', icon: '👔', count: teamMembers.length },
    ];

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            available: 'bg-green-100 text-green-700',
            rented: 'bg-blue-100 text-blue-700',
            maintenance: 'bg-yellow-100 text-yellow-700',
            active: 'bg-green-100 text-green-700',
            expired: 'bg-gray-100 text-gray-600',
            terminated: 'bg-red-100 text-red-700',
        };
        const labels: Record<string, string> = {
            available: '可租',
            rented: '已租',
            maintenance: '维护中',
            active: '生效中',
            expired: '已过期',
            terminated: '已终止',
            draft: '草稿',
        };
        return (
            <span className={`px-2 py-0.5 rounded text-xs ${styles[status] || 'bg-gray-100'}`}>
                {labels[status] || status}
            </span>
        );
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white rounded-xl w-full max-w-4xl max-h-[85vh] overflow-hidden" onClick={e => e.stopPropagation()}>
                {/* 头部 */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold">{landlordName}</h2>
                            <p className="text-indigo-200 mt-1">房东ID: {landlordId}</p>
                        </div>
                        <button onClick={onClose} className="text-white hover:bg-white/20 rounded-full p-2">
                            ✕
                        </button>
                    </div>

                    {/* 统计概览 */}
                    <div className="grid grid-cols-4 gap-4 mt-6">
                        {tabs.map(tab => (
                            <div key={tab.key} className="bg-white/10 rounded-lg p-3 text-center">
                                <span className="text-2xl">{tab.icon}</span>
                                <p className="text-2xl font-bold mt-1">{tab.count}</p>
                                <p className="text-xs text-indigo-200">{tab.label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tab切换 */}
                <div className="border-b border-gray-200">
                    <nav className="flex">
                        {tabs.map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key as any)}
                                className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 ${activeTab === tab.key
                                        ? 'border-indigo-600 text-indigo-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {tab.icon} {tab.label} ({tab.count})
                            </button>
                        ))}
                    </nav>
                </div>

                {/* 内容区 */}
                <div className="p-6 overflow-y-auto max-h-[400px]">
                    {loading ? (
                        <div className="text-center py-12 text-gray-500">加载中...</div>
                    ) : (
                        <>
                            {/* 房源列表 */}
                            {activeTab === 'properties' && (
                                <div className="space-y-3">
                                    {properties.length === 0 ? (
                                        <div className="text-center py-8 text-gray-400">暂无房源数据</div>
                                    ) : (
                                        properties.map(p => (
                                            <div key={p.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                                                <div>
                                                    <p className="font-medium text-gray-900">{p.title || p.address}</p>
                                                    <p className="text-sm text-gray-500">{p.address}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-indigo-600 font-bold">¥{p.rent_amount}/月</p>
                                                    {getStatusBadge(p.status)}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {/* 合同列表 */}
                            {activeTab === 'contracts' && (
                                <div className="space-y-3">
                                    {contracts.length === 0 ? (
                                        <div className="text-center py-8 text-gray-400">暂无合同数据</div>
                                    ) : (
                                        contracts.map(c => (
                                            <div key={c.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                                                <div>
                                                    <p className="font-medium text-gray-900">合同 #{c.id.slice(0, 8)}</p>
                                                    <p className="text-sm text-gray-500">{c.start_date} ~ {c.end_date}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-indigo-600 font-bold">¥{c.rent_amount}/月</p>
                                                    {getStatusBadge(c.status)}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {/* 租客列表 */}
                            {activeTab === 'tenants' && (
                                <div className="space-y-3">
                                    {tenants.length === 0 ? (
                                        <div className="text-center py-8 text-gray-400">暂无租客数据</div>
                                    ) : (
                                        tenants.map(t => (
                                            <div key={t.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                                                        {(t.name || '?')[0]}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{t.name || '未知'}</p>
                                                        <p className="text-sm text-gray-500">{t.phone}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {/* 团队成员 */}
                            {activeTab === 'team' && (
                                <div className="space-y-3">
                                    {teamMembers.length === 0 ? (
                                        <div className="text-center py-8 text-gray-400">暂无团队成员</div>
                                    ) : (
                                        teamMembers.map(m => (
                                            <div key={m.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold">
                                                        {(m.name || '?')[0]}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{m.name}</p>
                                                        <p className="text-sm text-gray-500">{m.role}</p>
                                                    </div>
                                                </div>
                                                <p className="text-gray-500">{m.phone || '-'}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LandlordDetailModal;
