import React, { useState, useEffect } from 'react';

interface LandlordDetailModalProps {
    supabase: any;
    landlordId: string;
    landlordName: string;
    onClose: () => void;
}

// 完整的数据接口
interface PropertyInfo {
    id: string;
    title: string;
    address: string;
    location: string;
    status: string;
    price: number;
    area: number;
    layout: string;
    category: string;
    type: string;
    description: string;
    created_at: string;
}

interface ContractInfo {
    id: string;
    tenant_id: string;
    property_id: string;
    rent_amount: number;
    deposit_amount: number;
    payment_day: number;
    status: string;
    start_date: string;
    end_date: string;
    landlord_signed_at: string;
    tenant_signed_at: string;
    created_at: string;
}

interface TenantInfo {
    id: string;
    name: string;
    phone: string;
    avatar_url: string;
    status: string;
    created_at: string;
}

interface TeamMemberInfo {
    id: string;
    member_id: string;
    role: string;
    status: string;
    property_scope: string;
    invited_at: string;
    joined_at: string;
}

interface RepairOrderInfo {
    id: string;
    title: string;
    description: string;
    category: string;
    status: string;
    priority: string;
    cost: number;
    cost_bearer: string;
    created_at: string;
    completed_at: string;
}

interface ViewingInfo {
    id: string;
    property_id: string;
    guest_name: string;
    guest_phone: string;
    appointment_date: string;
    appointment_time: string;
    notes: string;
    status: string;
    created_at: string;
}

interface PaymentInfo {
    id: string;
    contract_id: string;
    amount: number;
    payment_type: string;
    status: string;
    due_date: string;
    paid_date: string;
    payment_method: string;
    notes: string;
    created_at: string;
}

interface SettingsInfo {
    payment_qrcode: string | null;
    reminder_days: number[];
    notify_overdue_days: number;
    daily_reminder: boolean;
}

type TabKey = 'properties' | 'contracts' | 'tenants' | 'team' | 'repairs' | 'viewings' | 'payments' | 'settings';

const LandlordDetailModal: React.FC<LandlordDetailModalProps> = ({
    supabase,
    landlordId,
    landlordName,
    onClose
}) => {
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabKey>('properties');
    const [properties, setProperties] = useState<PropertyInfo[]>([]);
    const [contracts, setContracts] = useState<ContractInfo[]>([]);
    const [tenants, setTenants] = useState<TenantInfo[]>([]);
    const [teamMembers, setTeamMembers] = useState<TeamMemberInfo[]>([]);
    const [repairs, setRepairs] = useState<RepairOrderInfo[]>([]);
    const [viewings, setViewings] = useState<ViewingInfo[]>([]);
    const [payments, setPayments] = useState<PaymentInfo[]>([]);
    const [settings, setSettings] = useState<SettingsInfo | null>(null);

    // 展开的详情ID
    const [expandedId, setExpandedId] = useState<string | null>(null);

    // 获取房东的UUID (用于查询业务表)
    const [landlordUuid, setLandlordUuid] = useState<string>('');

    useEffect(() => {
        loadLandlordUuid();
    }, [landlordId]);

    useEffect(() => {
        if (landlordUuid) {
            loadAllData();
        }
    }, [landlordUuid]);

    const loadLandlordUuid = async () => {
        try {
            const { data } = await supabase
                .from('landlords')
                .select('uuid_id')
                .eq('id', landlordId)
                .single();

            if (data?.uuid_id) {
                setLandlordUuid(data.uuid_id);
            } else {
                setLandlordUuid(landlordId);
            }
        } catch (err) {
            console.error('获取房东UUID失败', err);
            setLandlordUuid(landlordId);
        }
    };

    const loadAllData = async () => {
        setLoading(true);
        try {
            // 并行加载所有数据（获取更多字段）
            const [propRes, contractRes, teamRes, repairRes, viewingRes, paymentRes, settingsRes] = await Promise.all([
                supabase.from('properties').select('*').eq('landlord_id', landlordUuid),
                supabase.from('contracts').select('*').eq('landlord_id', landlordUuid).order('created_at', { ascending: false }),
                supabase.from('team_members').select('*').eq('landlord_id', landlordUuid),
                supabase.from('repair_orders').select('*').eq('landlord_id', landlordUuid).order('created_at', { ascending: false }),
                supabase.from('viewing_appointments').select('*').eq('landlord_id', landlordUuid).order('created_at', { ascending: false }),
                supabase.from('payments').select('*').eq('landlord_id', landlordUuid).order('due_date', { ascending: false }),
                supabase.from('landlord_settings').select('*').eq('landlord_id', landlordUuid).single()
            ]);

            setProperties(propRes.data || []);
            setContracts(contractRes.data || []);
            setTeamMembers(teamRes.data || []);
            setRepairs(repairRes.data || []);
            setViewings(viewingRes.data || []);
            setPayments(paymentRes.data || []);
            setSettings(settingsRes.data || null);

            // 加载租客信息
            const tenantIds = (contractRes.data || []).map((c: any) => c.tenant_id).filter(Boolean);
            if (tenantIds.length > 0) {
                const { data: tenantData } = await supabase
                    .from('tenants')
                    .select('*')
                    .in('id', tenantIds);
                setTenants(tenantData || []);
            }

        } catch (err) {
            console.error('加载数据失败', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const tabs: { key: TabKey; label: string; icon: string; count: number }[] = [
        { key: 'properties', label: '房源', icon: '🏠', count: properties.length },
        { key: 'contracts', label: '合同', icon: '📄', count: contracts.length },
        { key: 'tenants', label: '租客', icon: '👥', count: tenants.length },
        { key: 'team', label: '团队', icon: '👔', count: teamMembers.length },
        { key: 'repairs', label: '维修', icon: '🔧', count: repairs.length },
        { key: 'viewings', label: '预约', icon: '📅', count: viewings.length },
        { key: 'payments', label: '账单', icon: '💰', count: payments.length },
        { key: 'settings', label: '设置', icon: '⚙️', count: settings ? 1 : 0 },
    ];

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            available: 'bg-green-100 text-green-700', AVAILABLE: 'bg-green-100 text-green-700',
            rented: 'bg-blue-100 text-blue-700', RENTED: 'bg-blue-100 text-blue-700',
            active: 'bg-green-100 text-green-700',
            pending: 'bg-yellow-100 text-yellow-700',
            confirmed: 'bg-blue-100 text-blue-700',
            completed: 'bg-green-100 text-green-700',
            cancelled: 'bg-red-100 text-red-700',
            paid: 'bg-green-100 text-green-700',
            overdue: 'bg-red-100 text-red-700',
            expired: 'bg-gray-100 text-gray-600',
            draft: 'bg-gray-100 text-gray-600',
            signed: 'bg-green-100 text-green-700',
        };
        const labels: Record<string, string> = {
            available: '可租', AVAILABLE: '可租',
            rented: '已租', RENTED: '已租',
            active: '生效中', pending: '待处理',
            confirmed: '已确认', completed: '已完成',
            cancelled: '已取消', paid: '已支付',
            overdue: '逾期', expired: '已过期',
            draft: '草稿', signed: '已签约',
        };
        return (
            <span className={`px-2 py-0.5 rounded text-xs ${styles[status] || 'bg-gray-100'}`}>
                {labels[status] || status}
            </span>
        );
    };

    const getPriorityBadge = (priority: string) => {
        const styles: Record<string, string> = {
            urgent: 'bg-red-100 text-red-700',
            high: 'bg-orange-100 text-orange-700',
            medium: 'bg-yellow-100 text-yellow-700',
            low: 'bg-gray-100 text-gray-600',
        };
        return (
            <span className={`px-2 py-0.5 rounded text-xs ${styles[priority] || 'bg-gray-100'}`}>
                {priority === 'urgent' ? '紧急' : priority === 'high' ? '高' : priority === 'medium' ? '中' : '低'}
            </span>
        );
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('zh-CN');
    };

    // 详情字段渲染
    const DetailRow = ({ label, value }: { label: string; value: any }) => (
        <div className="flex justify-between py-1 border-b border-gray-100 last:border-0">
            <span className="text-gray-500 text-sm">{label}</span>
            <span className="text-gray-900 text-sm font-medium">{value || '-'}</span>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white rounded-xl w-full max-w-5xl max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
                {/* 头部 */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold">{landlordName}</h2>
                            <p className="text-indigo-200 mt-1">ID: {landlordId}</p>
                            {landlordUuid && landlordUuid !== landlordId && (
                                <p className="text-indigo-200 text-xs">业务UUID: {landlordUuid}</p>
                            )}
                        </div>
                        <button onClick={onClose} className="text-white hover:bg-white/20 rounded-full p-2 text-xl">✕</button>
                    </div>

                    {/* 统计概览 */}
                    <div className="grid grid-cols-4 gap-3 mt-4">
                        {tabs.slice(0, 4).map(tab => (
                            <div key={tab.key} className="bg-white/10 rounded-lg p-2 text-center cursor-pointer hover:bg-white/20" onClick={() => setActiveTab(tab.key)}>
                                <span className="text-xl">{tab.icon}</span>
                                <p className="text-xl font-bold">{tab.count}</p>
                                <p className="text-xs text-indigo-200">{tab.label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tab切换 */}
                <div className="border-b border-gray-200 overflow-x-auto bg-gray-50">
                    <nav className="flex">
                        {tabs.map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => { setActiveTab(tab.key); setExpandedId(null); }}
                                className={`py-2 px-4 text-sm font-medium border-b-2 whitespace-nowrap ${activeTab === tab.key
                                    ? 'border-indigo-600 text-indigo-600 bg-white'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {tab.icon} {tab.label} ({tab.count})
                            </button>
                        ))}
                    </nav>
                </div>

                {/* 内容区 */}
                <div className="p-4 overflow-y-auto max-h-[50vh]">
                    {loading ? (
                        <div className="text-center py-12 text-gray-500">加载中...</div>
                    ) : (
                        <>
                            {/* 房源列表 */}
                            {activeTab === 'properties' && (
                                <div className="space-y-2">
                                    {properties.length === 0 ? (
                                        <div className="text-center py-8 text-gray-400">暂无房源数据</div>
                                    ) : properties.map(p => (
                                        <div key={p.id} className="border rounded-lg overflow-hidden">
                                            <div
                                                className="flex justify-between items-center p-3 bg-gray-50 cursor-pointer hover:bg-gray-100"
                                                onClick={() => toggleExpand(p.id)}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xl">🏠</span>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{p.title || '未命名房源'}</p>
                                                        <p className="text-sm text-gray-500">{p.address || p.location}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-indigo-600 font-bold">¥{p.price}/月</span>
                                                    {getStatusBadge(p.status)}
                                                    <span className="text-gray-400">{expandedId === p.id ? '▲' : '▼'}</span>
                                                </div>
                                            </div>
                                            {expandedId === p.id && (
                                                <div className="p-4 bg-white border-t grid grid-cols-2 gap-x-8 gap-y-1">
                                                    <DetailRow label="房源ID" value={p.id?.slice(0, 8) + '...'} />
                                                    <DetailRow label="类型" value={p.type} />
                                                    <DetailRow label="分类" value={p.category} />
                                                    <DetailRow label="面积" value={p.area ? `${p.area}㎡` : '-'} />
                                                    <DetailRow label="户型" value={p.layout} />
                                                    <DetailRow label="租金" value={`¥${p.price}/月`} />
                                                    <DetailRow label="地址" value={p.address} />
                                                    <DetailRow label="位置" value={p.location} />
                                                    <DetailRow label="创建时间" value={formatDate(p.created_at)} />
                                                    <DetailRow label="状态" value={p.status} />
                                                    <div className="col-span-2 mt-2">
                                                        <p className="text-gray-500 text-sm">描述</p>
                                                        <p className="text-gray-700 text-sm mt-1">{p.description || '无描述'}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* 合同列表 */}
                            {activeTab === 'contracts' && (
                                <div className="space-y-2">
                                    {contracts.length === 0 ? (
                                        <div className="text-center py-8 text-gray-400">暂无合同数据</div>
                                    ) : contracts.map(c => (
                                        <div key={c.id} className="border rounded-lg overflow-hidden">
                                            <div
                                                className="flex justify-between items-center p-3 bg-gray-50 cursor-pointer hover:bg-gray-100"
                                                onClick={() => toggleExpand(c.id)}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xl">📄</span>
                                                    <div>
                                                        <p className="font-medium text-gray-900">合同 #{c.id?.slice(0, 8)}</p>
                                                        <p className="text-sm text-gray-500">{c.start_date} ~ {c.end_date}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-indigo-600 font-bold">¥{c.rent_amount}/月</span>
                                                    {getStatusBadge(c.status)}
                                                    <span className="text-gray-400">{expandedId === c.id ? '▲' : '▼'}</span>
                                                </div>
                                            </div>
                                            {expandedId === c.id && (
                                                <div className="p-4 bg-white border-t grid grid-cols-2 gap-x-8 gap-y-1">
                                                    <DetailRow label="合同ID" value={c.id?.slice(0, 8) + '...'} />
                                                    <DetailRow label="租客ID" value={c.tenant_id?.slice(0, 8)} />
                                                    <DetailRow label="房源ID" value={c.property_id?.slice(0, 8)} />
                                                    <DetailRow label="月租金" value={`¥${c.rent_amount}`} />
                                                    <DetailRow label="押金" value={c.deposit_amount ? `¥${c.deposit_amount}` : '-'} />
                                                    <DetailRow label="缴费日" value={c.payment_day ? `每月${c.payment_day}号` : '-'} />
                                                    <DetailRow label="开始日期" value={c.start_date} />
                                                    <DetailRow label="结束日期" value={c.end_date} />
                                                    <DetailRow label="房东签约" value={c.landlord_signed_at ? formatDate(c.landlord_signed_at) : '未签'} />
                                                    <DetailRow label="租客签约" value={c.tenant_signed_at ? formatDate(c.tenant_signed_at) : '未签'} />
                                                    <DetailRow label="状态" value={c.status} />
                                                    <DetailRow label="创建时间" value={formatDate(c.created_at)} />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* 租客列表 */}
                            {activeTab === 'tenants' && (
                                <div className="space-y-2">
                                    {tenants.length === 0 ? (
                                        <div className="text-center py-8 text-gray-400">暂无租客数据</div>
                                    ) : tenants.map(t => (
                                        <div key={t.id} className="border rounded-lg overflow-hidden">
                                            <div
                                                className="flex justify-between items-center p-3 bg-gray-50 cursor-pointer hover:bg-gray-100"
                                                onClick={() => toggleExpand(t.id)}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                                                        {(t.name || '?')[0]}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{t.name || '未知'}</p>
                                                        <p className="text-sm text-gray-500">{t.phone}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    {getStatusBadge(t.status || 'active')}
                                                    <span className="text-gray-400">{expandedId === t.id ? '▲' : '▼'}</span>
                                                </div>
                                            </div>
                                            {expandedId === t.id && (
                                                <div className="p-4 bg-white border-t grid grid-cols-2 gap-x-8 gap-y-1">
                                                    <DetailRow label="租客ID" value={t.id} />
                                                    <DetailRow label="姓名" value={t.name} />
                                                    <DetailRow label="电话" value={t.phone} />
                                                    <DetailRow label="状态" value={t.status || 'active'} />
                                                    <DetailRow label="注册时间" value={formatDate(t.created_at)} />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* 团队成员 */}
                            {activeTab === 'team' && (
                                <div className="space-y-2">
                                    {teamMembers.length === 0 ? (
                                        <div className="text-center py-8 text-gray-400">暂无团队成员</div>
                                    ) : teamMembers.map(m => (
                                        <div key={m.id} className="border rounded-lg overflow-hidden">
                                            <div
                                                className="flex justify-between items-center p-3 bg-gray-50 cursor-pointer hover:bg-gray-100"
                                                onClick={() => toggleExpand(m.id)}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold">
                                                        {m.role?.[0] || '?'}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{m.role}</p>
                                                        <p className="text-sm text-gray-500">成员ID: {m.member_id?.slice(0, 8)}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    {getStatusBadge(m.status)}
                                                    <span className="text-gray-400">{expandedId === m.id ? '▲' : '▼'}</span>
                                                </div>
                                            </div>
                                            {expandedId === m.id && (
                                                <div className="p-4 bg-white border-t grid grid-cols-2 gap-x-8 gap-y-1">
                                                    <DetailRow label="记录ID" value={m.id?.slice(0, 8)} />
                                                    <DetailRow label="成员ID" value={m.member_id} />
                                                    <DetailRow label="角色" value={m.role} />
                                                    <DetailRow label="房源范围" value={m.property_scope === 'all' ? '全部房源' : '指定房源'} />
                                                    <DetailRow label="邀请时间" value={formatDate(m.invited_at)} />
                                                    <DetailRow label="加入时间" value={formatDate(m.joined_at)} />
                                                    <DetailRow label="状态" value={m.status} />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* 维修工单 */}
                            {activeTab === 'repairs' && (
                                <div className="space-y-2">
                                    {repairs.length === 0 ? (
                                        <div className="text-center py-8 text-gray-400">暂无维修工单</div>
                                    ) : repairs.map(r => (
                                        <div key={r.id} className="border rounded-lg overflow-hidden">
                                            <div
                                                className="flex justify-between items-center p-3 bg-gray-50 cursor-pointer hover:bg-gray-100"
                                                onClick={() => toggleExpand(r.id)}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xl">🔧</span>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{r.title}</p>
                                                        <p className="text-sm text-gray-500">{formatDate(r.created_at)}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    {getPriorityBadge(r.priority)}
                                                    {getStatusBadge(r.status)}
                                                    <span className="text-gray-400">{expandedId === r.id ? '▲' : '▼'}</span>
                                                </div>
                                            </div>
                                            {expandedId === r.id && (
                                                <div className="p-4 bg-white border-t grid grid-cols-2 gap-x-8 gap-y-1">
                                                    <DetailRow label="工单ID" value={r.id?.slice(0, 8)} />
                                                    <DetailRow label="分类" value={r.category} />
                                                    <DetailRow label="优先级" value={r.priority} />
                                                    <DetailRow label="状态" value={r.status} />
                                                    <DetailRow label="费用" value={r.cost ? `¥${r.cost}` : '-'} />
                                                    <DetailRow label="费用承担" value={r.cost_bearer} />
                                                    <DetailRow label="创建时间" value={formatDate(r.created_at)} />
                                                    <DetailRow label="完成时间" value={formatDate(r.completed_at)} />
                                                    <div className="col-span-2 mt-2">
                                                        <p className="text-gray-500 text-sm">问题描述</p>
                                                        <p className="text-gray-700 text-sm mt-1">{r.description || '无描述'}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* 预约看房 */}
                            {activeTab === 'viewings' && (
                                <div className="space-y-2">
                                    {viewings.length === 0 ? (
                                        <div className="text-center py-8 text-gray-400">暂无预约记录</div>
                                    ) : viewings.map(v => (
                                        <div key={v.id} className="border rounded-lg overflow-hidden">
                                            <div
                                                className="flex justify-between items-center p-3 bg-gray-50 cursor-pointer hover:bg-gray-100"
                                                onClick={() => toggleExpand(v.id)}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xl">📅</span>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{v.guest_name || '访客'}</p>
                                                        <p className="text-sm text-gray-500">{v.appointment_date} {v.appointment_time}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    {getStatusBadge(v.status)}
                                                    <span className="text-gray-400">{expandedId === v.id ? '▲' : '▼'}</span>
                                                </div>
                                            </div>
                                            {expandedId === v.id && (
                                                <div className="p-4 bg-white border-t grid grid-cols-2 gap-x-8 gap-y-1">
                                                    <DetailRow label="预约ID" value={v.id?.slice(0, 8)} />
                                                    <DetailRow label="房源ID" value={v.property_id?.slice(0, 8)} />
                                                    <DetailRow label="访客姓名" value={v.guest_name} />
                                                    <DetailRow label="访客电话" value={v.guest_phone} />
                                                    <DetailRow label="预约日期" value={v.appointment_date} />
                                                    <DetailRow label="预约时间" value={v.appointment_time} />
                                                    <DetailRow label="状态" value={v.status} />
                                                    <DetailRow label="创建时间" value={formatDate(v.created_at)} />
                                                    <div className="col-span-2 mt-2">
                                                        <p className="text-gray-500 text-sm">备注</p>
                                                        <p className="text-gray-700 text-sm mt-1">{v.notes || '无备注'}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* 缴费记录 */}
                            {activeTab === 'payments' && (
                                <div className="space-y-2">
                                    {payments.length === 0 ? (
                                        <div className="text-center py-8 text-gray-400">暂无缴费记录</div>
                                    ) : payments.map(p => (
                                        <div key={p.id} className="border rounded-lg overflow-hidden">
                                            <div
                                                className="flex justify-between items-center p-3 bg-gray-50 cursor-pointer hover:bg-gray-100"
                                                onClick={() => toggleExpand(p.id)}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xl">💰</span>
                                                    <div>
                                                        <p className="font-medium text-gray-900">¥{p.amount}</p>
                                                        <p className="text-sm text-gray-500">{p.payment_type} · 到期: {p.due_date}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    {getStatusBadge(p.status)}
                                                    <span className="text-gray-400">{expandedId === p.id ? '▲' : '▼'}</span>
                                                </div>
                                            </div>
                                            {expandedId === p.id && (
                                                <div className="p-4 bg-white border-t grid grid-cols-2 gap-x-8 gap-y-1">
                                                    <DetailRow label="账单ID" value={p.id?.slice(0, 8)} />
                                                    <DetailRow label="合同ID" value={p.contract_id?.slice(0, 8)} />
                                                    <DetailRow label="金额" value={`¥${p.amount}`} />
                                                    <DetailRow label="类型" value={p.payment_type} />
                                                    <DetailRow label="到期日" value={p.due_date} />
                                                    <DetailRow label="支付日" value={p.paid_date || '未支付'} />
                                                    <DetailRow label="支付方式" value={p.payment_method} />
                                                    <DetailRow label="状态" value={p.status} />
                                                    <DetailRow label="创建时间" value={formatDate(p.created_at)} />
                                                    <div className="col-span-2 mt-2">
                                                        <p className="text-gray-500 text-sm">备注</p>
                                                        <p className="text-gray-700 text-sm mt-1">{p.notes || '无备注'}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* 房东设置 */}
                            {activeTab === 'settings' && (
                                <div className="space-y-4">
                                    {!settings ? (
                                        <div className="text-center py-8 text-gray-400">暂无设置数据</div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="border rounded-lg p-4">
                                                <h4 className="font-medium text-gray-900 mb-3">💳 收款设置</h4>
                                                {settings.payment_qrcode ? (
                                                    <img src={settings.payment_qrcode} alt="收款码" className="w-40 h-40 object-contain border rounded" />
                                                ) : (
                                                    <p className="text-gray-400">未设置收款二维码</p>
                                                )}
                                            </div>
                                            <div className="border rounded-lg p-4">
                                                <h4 className="font-medium text-gray-900 mb-3">🔔 提醒设置</h4>
                                                <div className="space-y-2">
                                                    <DetailRow label="提前提醒" value={settings.reminder_days?.join('、') + ' 天'} />
                                                    <DetailRow label="逾期通知" value={settings.notify_overdue_days ? `逾期${settings.notify_overdue_days}天后` : '立即'} />
                                                    <DetailRow label="每日提醒" value={settings.daily_reminder ? '✅ 已开启' : '❌ 已关闭'} />
                                                </div>
                                            </div>
                                        </div>
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
