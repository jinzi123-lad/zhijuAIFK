import React, { useState, useEffect } from 'react';
import LandlordDetailModal from './LandlordDetailModal';

interface TeamMember {
    id: string;
    name: string;
    role: string;
    phone?: string;
    status: string;
    created_at?: string;
}

interface Landlord {
    id: string;
    name: string;
    phone: string;
    status: string;
    membershipStatus?: string;
    verificationStatus?: string;
    createdAt: string;
    teamMembers: TeamMember[];
    propertyCount: number;
}

interface LandlordTreeViewProps {
    supabase: any;
}

const LandlordTreeView: React.FC<LandlordTreeViewProps> = ({ supabase }) => {
    const [landlords, setLandlords] = useState<Landlord[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
    const [selectedLandlord, setSelectedLandlord] = useState<{ id: string; name: string } | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadLandlords();
    }, []);

    const loadLandlords = async () => {
        setLoading(true);
        try {
            // 加载房东列表
            const { data: landlordData, error: landlordError } = await supabase
                .from('landlords')
                .select('*')
                .order('created_at', { ascending: false });

            if (landlordError) {
                console.error('加载房东失败', landlordError);
                setLandlords([]);
                setLoading(false);
                return;
            }

            // 为每个房东加载团队成员和房源数量
            const landlordsWithDetails: Landlord[] = await Promise.all(
                (landlordData || []).map(async (landlord: any) => {
                    // 加载团队成员
                    const { data: teamData } = await supabase
                        .from('team_members')
                        .select('id, name, role, phone, status, created_at')
                        .eq('landlord_id', landlord.id);

                    // 加载房源数量
                    const { count: propCount } = await supabase
                        .from('properties')
                        .select('id', { count: 'exact', head: true })
                        .eq('landlord_id', landlord.id);

                    return {
                        id: landlord.id,
                        name: landlord.name || '未设置',
                        phone: landlord.phone || '',
                        status: landlord.status || 'active',
                        membershipStatus: landlord.membership_type || 'free',
                        verificationStatus: landlord.verification_status,
                        createdAt: landlord.created_at ? new Date(landlord.created_at).toLocaleDateString('zh-CN') : '',
                        teamMembers: teamData || [],
                        propertyCount: propCount || 0
                    };
                })
            );

            setLandlords(landlordsWithDetails);
        } catch (err) {
            console.error('加载数据失败', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleExpand = (id: string) => {
        const newExpanded = new Set(expandedIds);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedIds(newExpanded);
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            active: 'bg-green-100 text-green-700',
            disabled: 'bg-red-100 text-red-700',
            free: 'bg-gray-100 text-gray-600',
            paid: 'bg-purple-100 text-purple-700',
            premium: 'bg-purple-100 text-purple-700',
        };
        const labels: Record<string, string> = {
            active: '正常',
            disabled: '已禁用',
            free: '免费',
            paid: '付费会员',
            premium: '高级会员',
        };
        return (
            <span className={`px-2 py-0.5 rounded text-xs ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
                {labels[status] || status}
            </span>
        );
    };

    const filteredLandlords = landlords.filter(l =>
        l.name.includes(searchTerm) || l.phone.includes(searchTerm)
    );

    return (
        <div className="p-6 bg-gray-50">
            <div className="max-w-5xl mx-auto">
                {/* 标题和搜索 */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">🏠 房东账号管理</h2>
                        <p className="text-sm text-gray-500 mt-1">展开查看每个房东的团队成员</p>
                    </div>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="搜索房东..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border rounded-lg w-64 focus:ring-2 focus:ring-indigo-500"
                        />
                        <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
                    </div>
                </div>

                {/* 房东列表 */}
                {loading ? (
                    <div className="text-center py-12 text-gray-500">加载中...</div>
                ) : filteredLandlords.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">暂无房东账号</div>
                ) : (
                    <div className="space-y-3">
                        {filteredLandlords.map(landlord => (
                            <div key={landlord.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                {/* 房东主行 - 可点击展开 */}
                                <div
                                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                                    onClick={() => toggleExpand(landlord.id)}
                                >
                                    <div className="flex items-center gap-4">
                                        {/* 展开/折叠箭头 */}
                                        <span className={`text-gray-400 transition-transform ${expandedIds.has(landlord.id) ? 'rotate-90' : ''}`}>
                                            ▶
                                        </span>

                                        {/* 头像 */}
                                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                            {landlord.name[0]}
                                        </div>

                                        {/* 基本信息 */}
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-gray-900">{landlord.name}</span>
                                                {getStatusBadge(landlord.status)}
                                                {getStatusBadge(landlord.membershipStatus || 'free')}
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                                                <span>📱 {landlord.phone}</span>
                                                <span>🏠 {landlord.propertyCount}套房源</span>
                                                <span>👥 {landlord.teamMembers.length}个团队成员</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 操作按钮 */}
                                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                        <button
                                            onClick={() => setSelectedLandlord({ id: landlord.id, name: landlord.name })}
                                            className="px-3 py-1.5 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg"
                                        >
                                            查看详情
                                        </button>
                                    </div>
                                </div>

                                {/* 展开的团队成员区域 */}
                                {expandedIds.has(landlord.id) && (
                                    <div className="border-t border-gray-100 bg-gray-50 px-4 py-3">
                                        <div className="ml-12">
                                            <h4 className="text-sm font-medium text-gray-700 mb-3">👔 团队成员</h4>
                                            {landlord.teamMembers.length === 0 ? (
                                                <p className="text-sm text-gray-400 py-2">暂无团队成员</p>
                                            ) : (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                    {landlord.teamMembers.map(member => (
                                                        <div
                                                            key={member.id}
                                                            className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-100"
                                                        >
                                                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium text-sm">
                                                                {(member.name || '?')[0]}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium text-gray-900 truncate">{member.name}</p>
                                                                <p className="text-xs text-gray-500">{member.role} {member.phone && `• ${member.phone}`}</p>
                                                            </div>
                                                            {getStatusBadge(member.status)}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* 添加团队成员按钮 */}
                                            <button className="mt-3 text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                                                <span>+</span> 添加团队成员
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
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
        </div>
    );
};

export default LandlordTreeView;
