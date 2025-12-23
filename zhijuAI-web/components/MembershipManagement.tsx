import React, { useState, useEffect } from 'react';

// 类型定义
interface Member {
    id: string;
    landlordId: string;
    landlordName: string;
    membershipStatus: 'free' | 'trial' | 'paid' | 'partner';
    membershipType?: string;
    expiresAt?: string;
    propertyCount: number;
    createdAt: string;
}

interface MembershipManagementProps {
    supabase: any;
}

const MembershipManagement: React.FC<MembershipManagementProps> = ({ supabase }) => {
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [showModal, setShowModal] = useState(false);
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);
    const [newExpiryDate, setNewExpiryDate] = useState('');
    const [newMembershipType, setNewMembershipType] = useState('paid');

    useEffect(() => {
        loadMembers();
    }, [statusFilter]);

    const loadMembers = async () => {
        setLoading(true);
        try {
            // TODO: 从Supabase获取真实数据
            const mockData = [
                { id: '1', landlordId: 'l1', landlordName: '张先生', membershipStatus: 'paid' as const, membershipType: '年度会员', expiresAt: '2025-12-31', propertyCount: 15, createdAt: '2024-01-15' },
                { id: '2', landlordId: 'l2', landlordName: '李女士', membershipStatus: 'trial' as const, membershipType: '试用', expiresAt: '2025-01-15', propertyCount: 3, createdAt: '2024-06-01' },
                { id: '3', landlordId: 'l3', landlordName: '王老板', membershipStatus: 'free' as const, propertyCount: 2, createdAt: '2024-09-20' },
                { id: '4', landlordId: 'l4', landlordName: '赵总', membershipStatus: 'partner' as const, membershipType: '战略合作', propertyCount: 50, createdAt: '2023-06-01' },
            ].filter(m => statusFilter === 'all' || m.membershipStatus === statusFilter) as Member[];

            setMembers(mockData);
        } catch (err) {
            console.error('加载数据失败', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredMembers = members.filter(m =>
        m.landlordName.includes(searchTerm)
    );

    const handleOpenMembership = (member: Member) => {
        setSelectedMember(member);
        setNewMembershipType('paid');
        setNewExpiryDate('');
        setShowModal(true);
    };

    const handleSaveMembership = async () => {
        if (!selectedMember || !newExpiryDate) return;

        // TODO: 更新Supabase
        setMembers(members.map(m =>
            m.id === selectedMember.id
                ? { ...m, membershipStatus: newMembershipType as any, expiresAt: newExpiryDate }
                : m
        ));
        setShowModal(false);
        setSelectedMember(null);
    };

    const handleCloseMembership = async (id: string) => {
        if (!confirm('确定关闭该房东的会员权限？')) return;

        // TODO: 更新Supabase
        setMembers(members.map(m =>
            m.id === id ? { ...m, membershipStatus: 'free' as const, expiresAt: undefined } : m
        ));
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            free: 'bg-gray-100 text-gray-600',
            trial: 'bg-blue-100 text-blue-700',
            paid: 'bg-purple-100 text-purple-700',
            partner: 'bg-yellow-100 text-yellow-700',
        };
        const labels: Record<string, string> = {
            free: '免费用户',
            trial: '试用中',
            paid: '付费会员',
            partner: '合作伙伴',
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs ${styles[status]}`}>
                {labels[status]}
            </span>
        );
    };

    const stats = {
        total: members.length,
        free: members.filter(m => m.membershipStatus === 'free').length,
        paid: members.filter(m => m.membershipStatus === 'paid').length,
        trial: members.filter(m => m.membershipStatus === 'trial').length,
        partner: members.filter(m => m.membershipStatus === 'partner').length,
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* 标题 */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">会员管理</h1>
                    <p className="text-gray-500 mt-1">管理房东会员状态和权限</p>
                </div>

                {/* 统计卡片 */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                    {[
                        { label: '付费会员', value: stats.paid, color: 'purple', icon: '💎' },
                        { label: '试用中', value: stats.trial, color: 'blue', icon: '⏱️' },
                        { label: '合作伙伴', value: stats.partner, color: 'yellow', icon: '🤝' },
                        { label: '免费用户', value: stats.free, color: 'gray', icon: '👤' },
                    ].map(stat => (
                        <div key={stat.label} className="bg-white p-4 rounded-lg shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">{stat.label}</p>
                                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                </div>
                                <span className="text-3xl">{stat.icon}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* 列表 */}
                <div className="bg-white rounded-lg shadow">
                    {/* 工具栏 */}
                    <div className="p-4 flex justify-between items-center border-b">
                        <div className="flex gap-2">
                            {['all', 'paid', 'trial', 'partner', 'free'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={`px-3 py-1.5 rounded-lg text-sm ${statusFilter === status
                                        ? 'bg-indigo-100 text-indigo-700'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    {status === 'all' ? '全部' :
                                        status === 'paid' ? '付费' :
                                            status === 'trial' ? '试用' :
                                                status === 'partner' ? '合作伙伴' : '免费'}
                                </button>
                            ))}
                        </div>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="搜索房东"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border rounded-lg w-48 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
                        </div>
                    </div>

                    {/* 表格 */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">房东</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">会员状态</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">到期时间</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">房源数</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">注册时间</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">加载中...</td>
                                    </tr>
                                ) : filteredMembers.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">暂无数据</td>
                                    </tr>
                                ) : (
                                    filteredMembers.map(member => (
                                        <tr key={member.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-medium">
                                                        {member.landlordName[0]}
                                                    </div>
                                                    <span className="ml-3 text-sm text-gray-900">{member.landlordName}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    {getStatusBadge(member.membershipStatus)}
                                                    {member.membershipType && (
                                                        <span className="ml-2 text-xs text-gray-500">{member.membershipType}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {member.expiresAt || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {member.propertyCount} 套
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {member.createdAt}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <button
                                                    onClick={() => handleOpenMembership(member)}
                                                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                                                >
                                                    开通/续费
                                                </button>
                                                {member.membershipStatus !== 'free' && (
                                                    <button
                                                        onClick={() => handleCloseMembership(member.id)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        关闭
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* 开通会员弹窗 */}
            {showModal && selectedMember && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg w-full max-w-md p-6">
                        <h3 className="text-lg font-bold mb-4">开通/续费会员</h3>
                        <p className="text-gray-500 mb-4">房东：{selectedMember.landlordName}</p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">会员类型</label>
                                <select
                                    value={newMembershipType}
                                    onChange={e => setNewMembershipType(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="trial">试用（7天）</option>
                                    <option value="paid">付费会员</option>
                                    <option value="partner">合作伙伴</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">到期日期</label>
                                <input
                                    type="date"
                                    value={newExpiryDate}
                                    onChange={e => setNewExpiryDate(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => { setShowModal(false); setSelectedMember(null); }}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                            >
                                取消
                            </button>
                            <button
                                onClick={handleSaveMembership}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                            >
                                确认
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MembershipManagement;
