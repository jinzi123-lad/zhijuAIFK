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
    price: number;
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
    member_id: string;
    role: string;
    status: string;
}

interface RepairOrderInfo {
    id: string;
    title: string;
    status: string;
    priority: string;
    created_at: string;
}

interface ViewingInfo {
    id: string;
    guest_name: string;
    guest_phone: string;
    appointment_date: string;
    status: string;
}

interface PaymentInfo {
    id: string;
    amount: number;
    payment_type: string;
    status: string;
    due_date: string;
}

interface SettingsInfo {
    payment_qrcode: string | null;
    reminder_days: number[];
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
            // 从landlords表获取uuid_id
            const { data } = await supabase
                .from('landlords')
                .select('uuid_id')
                .eq('id', landlordId)
                .single();

            if (data?.uuid_id) {
                setLandlordUuid(data.uuid_id);
            } else {
                // 如果没有uuid_id，尝试直接使用landlordId
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
            // 并行加载所有数据
            const [propRes, contractRes, tenantRes, teamRes, repairRes, viewingRes, paymentRes, settingsRes] = await Promise.all([
                // 房源 (使用uuid查询)
                supabase.from('properties').select('id, title, address, status, price').eq('landlord_id', landlordUuid),
                // 合同
                supabase.from('contracts').select('id, rent_amount, status, start_date, end_date').eq('landlord_id', landlordUuid),
                // 租客 (通过合同关联)
                supabase.from('contracts').select('tenant_id').eq('landlord_id', landlordUuid),
                // 团队成员
                supabase.from('team_members').select('id, member_id, role, status').eq('landlord_id', landlordUuid),
                // 维修工单
                supabase.from('repair_orders').select('id, title, status, priority, created_at').eq('landlord_id', landlordUuid).order('created_at', { ascending: false }),
                // 预约看房
                supabase.from('viewing_appointments').select('id, guest_name, guest_phone, appointment_date, status').eq('landlord_id', landlordUuid).order('created_at', { ascending: false }),
                // 缴费记录
                supabase.from('payments').select('id, amount, payment_type, status, due_date').eq('landlord_id', landlordUuid).order('due_date', { ascending: false }),
                // 房东设置
                supabase.from('landlord_settings').select('payment_qrcode, reminder_days, daily_reminder').eq('landlord_id', landlordUuid).single()
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
                    .select('id, name, phone')
                    .in('id', tenantIds);
                setTenants(tenantData || []);
            }

        } catch (err) {
            console.error('加载数据失败', err);
        } finally {
            setLoading(false);
        }
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
            available: 'bg-green-100 text-green-700',
            AVAILABLE: 'bg-green-100 text-green-700',
            rented: 'bg-blue-100 text-blue-700',
            RENTED: 'bg-blue-100 text-blue-700',
            maintenance: 'bg-yellow-100 text-yellow-700',
            active: 'bg-green-100 text-green-700',
            expired: 'bg-gray-100 text-gray-600',
            terminated: 'bg-red-100 text-red-700',
            pending: 'bg-yellow-100 text-yellow-700',
            confirmed: 'bg-blue-100 text-blue-700',
            completed: 'bg-green-100 text-green-700',
            cancelled: 'bg-red-100 text-red-700',
            paid: 'bg-green-100 text-green-700',
            overdue: 'bg-red-100 text-red-700',
        };
        const labels: Record<string, string> = {
            available: '可租', AVAILABLE: '可租',
            rented: '已租', RENTED: '已租',
            maintenance: '维护中',
            active: '生效中',
            expired: '已过期',
            terminated: '已终止',
            draft: '草稿',
            pending: '待处理',
            confirmed: '已确认',
            completed: '已完成',
            cancelled: '已取消',
            paid: '已支付',
            overdue: '逾期',
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
        const labels: Record<string, string> = {
            urgent: '紧急', high: '高', medium: '中', low: '低',
        };
        return (
            <span className={`px-2 py-0.5 rounded text-xs ${styles[priority] || 'bg-gray-100'}`}>
                {labels[priority] || priority}
            </span>
        );
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white rounded-xl w-full max-w-5xl max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
                {/* 头部 */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold">{landlordName}</h2>
                            <p className="text-indigo-200 mt-1">房东ID: {landlordId}</p>
                            {landlordUuid && landlordUuid !== landlordId && (
                                <p className="text-indigo-200 text-xs">UUID: {landlordUuid}</p>
                            )}
                        </div>
                        <button onClick={onClose} className="text-white hover:bg-white/20 rounded-full p-2">
                            ✕
                        </button>
                    </div>

                    {/* 统计概览 - 只显示前4个 */}
                    <div className="grid grid-cols-4 gap-4 mt-6">
                        {tabs.slice(0, 4).map(tab => (
                            <div key={tab.key} className="bg-white/10 rounded-lg p-3 text-center cursor-pointer hover:bg-white/20" onClick={() => setActiveTab(tab.key)}>
                                <span className="text-2xl">{tab.icon}</span>
                                <p className="text-2xl font-bold mt-1">{tab.count}</p>
                                <p className="text-xs text-indigo-200">{tab.label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tab切换 */}
                <div className="border-b border-gray-200 overflow-x-auto">
                    <nav className="flex min-w-max">
                        {tabs.map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`py-3 px-4 text-sm font-medium border-b-2 whitespace-nowrap ${activeTab === tab.key
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
                                                    <p className="text-indigo-600 font-bold">¥{p.price}/月</p>
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
                                                        {m.role[0]}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">成员 #{m.member_id?.slice(0, 8)}</p>
                                                        <p className="text-sm text-gray-500">{m.role}</p>
                                                    </div>
                                                </div>
                                                {getStatusBadge(m.status)}
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {/* 维修工单 */}
                            {activeTab === 'repairs' && (
                                <div className="space-y-3">
                                    {repairs.length === 0 ? (
                                        <div className="text-center py-8 text-gray-400">暂无维修工单</div>
                                    ) : (
                                        repairs.map(r => (
                                            <div key={r.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                                                <div>
                                                    <p className="font-medium text-gray-900">{r.title}</p>
                                                    <p className="text-sm text-gray-500">{new Date(r.created_at).toLocaleDateString('zh-CN')}</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    {getPriorityBadge(r.priority)}
                                                    {getStatusBadge(r.status)}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {/* 预约看房 */}
                            {activeTab === 'viewings' && (
                                <div className="space-y-3">
                                    {viewings.length === 0 ? (
                                        <div className="text-center py-8 text-gray-400">暂无预约记录</div>
                                    ) : (
                                        viewings.map(v => (
                                            <div key={v.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                                                <div>
                                                    <p className="font-medium text-gray-900">{v.guest_name || '访客'}</p>
                                                    <p className="text-sm text-gray-500">{v.guest_phone} · {v.appointment_date}</p>
                                                </div>
                                                {getStatusBadge(v.status)}
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {/* 缴费记录 */}
                            {activeTab === 'payments' && (
                                <div className="space-y-3">
                                    {payments.length === 0 ? (
                                        <div className="text-center py-8 text-gray-400">暂无缴费记录</div>
                                    ) : (
                                        payments.map(p => (
                                            <div key={p.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                                                <div>
                                                    <p className="font-medium text-gray-900">¥{p.amount}</p>
                                                    <p className="text-sm text-gray-500">{p.payment_type} · 到期: {p.due_date}</p>
                                                </div>
                                                {getStatusBadge(p.status)}
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {/* 房东设置 */}
                            {activeTab === 'settings' && (
                                <div className="space-y-4">
                                    {!settings ? (
                                        <div className="text-center py-8 text-gray-400">暂无设置数据</div>
                                    ) : (
                                        <>
                                            <div className="p-4 bg-gray-50 rounded-lg">
                                                <p className="text-sm text-gray-500 mb-2">收款二维码</p>
                                                {settings.payment_qrcode ? (
                                                    <img src={settings.payment_qrcode} alt="收款码" className="w-32 h-32 object-contain" />
                                                ) : (
                                                    <p className="text-gray-400">未设置</p>
                                                )}
                                            </div>
                                            <div className="p-4 bg-gray-50 rounded-lg">
                                                <p className="text-sm text-gray-500 mb-2">提醒设置</p>
                                                <p className="font-medium">提前 {settings.reminder_days?.join('、')} 天提醒</p>
                                                <p className="text-sm text-gray-500">每日提醒: {settings.daily_reminder ? '开启' : '关闭'}</p>
                                            </div>
                                        </>
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

