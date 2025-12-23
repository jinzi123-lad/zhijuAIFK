import React, { useState, useEffect } from 'react';

// 类型定义
interface Verification {
    id: string;
    userId: string;
    userName: string;
    userPhone: string;
    userType: 'landlord' | 'tenant';
    type: 'identity' | 'property'; // 实名认证 / 房产备案
    idCardFront?: string;
    idCardBack?: string;
    realName?: string;
    idNumber?: string;
    propertyCertImage?: string;
    propertyAddress?: string;
    status: 'pending' | 'approved' | 'rejected';
    rejectedReason?: string;
    submittedAt: string;
}

interface VerificationReviewProps {
    supabase: any;
}

const VerificationReview: React.FC<VerificationReviewProps> = ({ supabase }) => {
    const [activeTab, setActiveTab] = useState<'identity' | 'property'>('identity');
    const [statusFilter, setStatusFilter] = useState<'pending' | 'all'>('pending');
    const [verifications, setVerifications] = useState<Verification[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState<Verification | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [rejectReason, setRejectReason] = useState('');

    useEffect(() => {
        loadVerifications();
    }, [activeTab, statusFilter]);

    const loadVerifications = async () => {
        setLoading(true);
        try {
            // TODO: 从Supabase获取真实数据
            const mockData = [
                {
                    id: '1',
                    userId: 'u1',
                    userName: '李小姐',
                    userPhone: '138****1234',
                    userType: 'tenant' as const,
                    type: 'identity' as const,
                    realName: '李晓明',
                    idNumber: '110***********1234',
                    idCardFront: 'https://example.com/front.jpg',
                    idCardBack: 'https://example.com/back.jpg',
                    status: 'pending' as const,
                    submittedAt: '2024-12-20 14:30'
                },
                {
                    id: '2',
                    userId: 'u2',
                    userName: '张先生',
                    userPhone: '139****5678',
                    userType: 'landlord' as const,
                    type: 'property' as const,
                    propertyAddress: '朝阳区阳光花园3号楼302室',
                    propertyCertImage: 'https://example.com/cert.jpg',
                    status: 'pending' as const,
                    submittedAt: '2024-12-21 09:15'
                }
            ].filter(v => v.type === activeTab && (statusFilter === 'all' || v.status === statusFilter)) as Verification[];

            setVerifications(mockData);
        } catch (err) {
            console.error('加载数据失败', err);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        // TODO: 更新Supabase
        setVerifications(verifications.map(v =>
            v.id === id ? { ...v, status: 'approved' as const } : v
        ));
        setShowModal(false);
        setSelectedItem(null);
    };

    const handleReject = async (id: string) => {
        if (!rejectReason.trim()) {
            alert('请填写驳回原因');
            return;
        }
        // TODO: 更新Supabase
        setVerifications(verifications.map(v =>
            v.id === id ? { ...v, status: 'rejected' as const, rejectedReason: rejectReason } : v
        ));
        setShowModal(false);
        setSelectedItem(null);
        setRejectReason('');
    };

    const openDetail = (item: Verification) => {
        setSelectedItem(item);
        setShowModal(true);
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            pending: 'bg-yellow-100 text-yellow-800',
            approved: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800',
        };
        const labels: Record<string, string> = {
            pending: '待审核',
            approved: '已通过',
            rejected: '已驳回',
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs ${styles[status]}`}>
                {labels[status]}
            </span>
        );
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* 标题 */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">认证审核</h1>
                    <p className="text-gray-500 mt-1">审核用户提交的实名认证和房产备案</p>
                </div>

                {/* Tab切换 */}
                <div className="bg-white rounded-lg shadow mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="flex -mb-px">
                            {[
                                { key: 'identity', label: '实名认证', icon: '🪪' },
                                { key: 'property', label: '房产备案', icon: '🏠' },
                            ].map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key as any)}
                                    className={`flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === tab.key
                                        ? 'border-indigo-500 text-indigo-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    <span className="mr-2">{tab.icon}</span>
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* 筛选 */}
                    <div className="p-4 flex gap-2 border-b">
                        {['pending', 'all'].map(status => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status as any)}
                                className={`px-4 py-2 rounded-lg text-sm ${statusFilter === status
                                    ? 'bg-indigo-100 text-indigo-700'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {status === 'pending' ? '待审核' : '全部'}
                            </button>
                        ))}
                    </div>

                    {/* 列表 */}
                    <div className="divide-y divide-gray-200">
                        {loading ? (
                            <div className="p-12 text-center text-gray-500">加载中...</div>
                        ) : verifications.length === 0 ? (
                            <div className="p-12 text-center text-gray-500">暂无待审核项</div>
                        ) : (
                            verifications.map(item => (
                                <div key={item.id} className="p-4 hover:bg-gray-50 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-medium">
                                            {item.userName[0]}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-gray-900">{item.userName}</span>
                                                <span className="text-xs text-gray-500">
                                                    {item.userType === 'landlord' ? '房东' : '租客'}
                                                </span>
                                                {getStatusBadge(item.status)}
                                            </div>
                                            <div className="text-sm text-gray-500 mt-1">
                                                {item.type === 'identity'
                                                    ? `${item.realName} | ${item.idNumber}`
                                                    : item.propertyAddress
                                                }
                                            </div>
                                            <div className="text-xs text-gray-400 mt-1">
                                                提交时间：{item.submittedAt}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => openDetail(item)}
                                        className="px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                                    >
                                        审核
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* 审核弹窗 */}
            {showModal && selectedItem && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b">
                            <h3 className="text-lg font-bold">
                                {selectedItem.type === 'identity' ? '实名认证审核' : '房产备案审核'}
                            </h3>
                        </div>

                        <div className="p-6">
                            {/* 用户信息 */}
                            <div className="mb-6">
                                <h4 className="font-medium text-gray-700 mb-2">用户信息</h4>
                                <div className="bg-gray-50 p-4 rounded-lg grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-gray-500 text-sm">用户类型</span>
                                        <p className="font-medium">{selectedItem.userType === 'landlord' ? '房东' : '租客'}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 text-sm">手机号</span>
                                        <p className="font-medium">{selectedItem.userPhone}</p>
                                    </div>
                                </div>
                            </div>

                            {/* 认证材料 */}
                            <div className="mb-6">
                                <h4 className="font-medium text-gray-700 mb-2">认证材料</h4>
                                {selectedItem.type === 'identity' ? (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <span className="text-gray-500 text-sm">姓名</span>
                                                <p className="font-medium">{selectedItem.realName}</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-500 text-sm">身份证号</span>
                                                <p className="font-medium">{selectedItem.idNumber}</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <span className="text-gray-500 text-sm block mb-2">身份证正面</span>
                                                <div className="w-full h-40 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                                                    📷 图片预览区
                                                </div>
                                            </div>
                                            <div>
                                                <span className="text-gray-500 text-sm block mb-2">身份证反面</span>
                                                <div className="w-full h-40 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                                                    📷 图片预览区
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div>
                                            <span className="text-gray-500 text-sm">房产地址</span>
                                            <p className="font-medium">{selectedItem.propertyAddress}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 text-sm block mb-2">房产证照片</span>
                                            <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                                                📷 图片预览区
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* 驳回原因（仅在待审核时显示输入框） */}
                            {selectedItem.status === 'pending' && (
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        驳回原因（如需驳回请填写）
                                    </label>
                                    <textarea
                                        value={rejectReason}
                                        onChange={e => setRejectReason(e.target.value)}
                                        placeholder="如：照片模糊、信息不匹配等"
                                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        rows={3}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t flex justify-end gap-3">
                            <button
                                onClick={() => { setShowModal(false); setSelectedItem(null); setRejectReason(''); }}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                            >
                                取消
                            </button>
                            {selectedItem.status === 'pending' && (
                                <>
                                    <button
                                        onClick={() => handleReject(selectedItem.id)}
                                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                                    >
                                        驳回
                                    </button>
                                    <button
                                        onClick={() => handleApprove(selectedItem.id)}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                    >
                                        通过
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VerificationReview;
