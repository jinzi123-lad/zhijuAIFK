import React, { useState, useEffect } from 'react';

// 类型定义
interface User {
    id: string;
    name: string;
    phone: string;
    email?: string;
    role: 'employee' | 'landlord' | 'tenant';
    status: 'active' | 'disabled';
    verificationStatus?: 'none' | 'pending' | 'approved' | 'rejected';
    membershipStatus?: 'free' | 'paid';
    createdAt: string;
}

interface AccountManagementProps {
    supabase: any;
}

const AccountManagement: React.FC<AccountManagementProps> = ({ supabase }) => {
    const [activeTab, setActiveTab] = useState<'employee' | 'landlord' | 'tenant'>('employee');
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [newUser, setNewUser] = useState({ name: '', phone: '', email: '', role: 'employee' });

    // 加载用户数据
    useEffect(() => {
        loadUsers();
    }, [activeTab]);

    const loadUsers = async () => {
        setLoading(true);
        try {
            // TODO: 从Supabase获取真实数据
            const mockData: User[] = [
                { id: '1', name: '张管理员', phone: '13800138001', email: 'admin@example.com', role: 'employee', status: 'active', createdAt: '2024-01-15' },
                { id: '2', name: '李房东', phone: '13900139002', role: 'landlord', status: 'active', verificationStatus: 'approved', membershipStatus: 'paid', createdAt: '2024-03-01' },
                { id: '3', name: '王租客', phone: '13700137003', role: 'tenant', status: 'active', verificationStatus: 'pending', createdAt: '2024-06-15' },
            ].filter(u => u.role === activeTab);

            setUsers(mockData);
        } catch (err) {
            console.error('加载用户失败', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(u =>
        u.name.includes(searchTerm) || u.phone.includes(searchTerm)
    );

    const handleStatusChange = async (id: string, newStatus: 'active' | 'disabled') => {
        // TODO: 更新Supabase
        setUsers(users.map(u => u.id === id ? { ...u, status: newStatus } : u));
    };

    const handleAddUser = async () => {
        // TODO: 添加到Supabase
        setShowAddModal(false);
        setNewUser({ name: '', phone: '', email: '', role: 'employee' });
        loadUsers();
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            active: 'bg-green-100 text-green-800',
            disabled: 'bg-red-100 text-red-800',
            approved: 'bg-green-100 text-green-800',
            pending: 'bg-yellow-100 text-yellow-800',
            rejected: 'bg-red-100 text-red-800',
            paid: 'bg-purple-100 text-purple-800',
            free: 'bg-gray-100 text-gray-600',
        };
        const labels: Record<string, string> = {
            active: '正常',
            disabled: '已禁用',
            approved: '已认证',
            pending: '待审核',
            rejected: '已驳回',
            paid: '付费会员',
            free: '免费用户',
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs ${styles[status] || 'bg-gray-100'}`}>
                {labels[status] || status}
            </span>
        );
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* 标题 */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">账号管理</h1>
                    <p className="text-gray-500 mt-1">管理系统中的所有用户账号</p>
                </div>

                {/* Tab切换 */}
                <div className="bg-white rounded-lg shadow mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="flex -mb-px">
                            {[
                                { key: 'employee', label: '员工账号', icon: '👔' },
                                { key: 'landlord', label: '房东账号', icon: '🏠' },
                                { key: 'tenant', label: '租客账号', icon: '👤' },
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

                    {/* 工具栏 */}
                    <div className="p-4 flex justify-between items-center border-b">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="搜索姓名/手机号"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
                        </div>
                        {activeTab === 'employee' && (
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                            >
                                + 添加员工
                            </button>
                        )}
                    </div>

                    {/* 表格 */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">姓名</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">手机号</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                                    {activeTab !== 'employee' && (
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">认证状态</th>
                                    )}
                                    {activeTab === 'landlord' && (
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">会员</th>
                                    )}
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">注册时间</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-gray-500">加载中...</td>
                                    </tr>
                                ) : filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-gray-500">暂无数据</td>
                                    </tr>
                                ) : (
                                    filteredUsers.map(user => (
                                        <tr key={user.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-medium">
                                                        {user.name[0]}
                                                    </div>
                                                    <span className="ml-3 text-sm text-gray-900">{user.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.phone}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(user.status)}</td>
                                            {activeTab !== 'employee' && (
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {getStatusBadge(user.verificationStatus || 'none')}
                                                </td>
                                            )}
                                            {activeTab === 'landlord' && (
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {getStatusBadge(user.membershipStatus || 'free')}
                                                </td>
                                            )}
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.createdAt}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <button className="text-indigo-600 hover:text-indigo-900 mr-3">查看</button>
                                                {user.status === 'active' ? (
                                                    <button
                                                        onClick={() => handleStatusChange(user.id, 'disabled')}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        禁用
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleStatusChange(user.id, 'active')}
                                                        className="text-green-600 hover:text-green-900"
                                                    >
                                                        启用
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

            {/* 添加员工弹窗 */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg w-full max-w-md p-6">
                        <h3 className="text-lg font-bold mb-4">添加员工</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
                                <input
                                    type="text"
                                    value={newUser.name}
                                    onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">手机号</label>
                                <input
                                    type="text"
                                    value={newUser.phone}
                                    onChange={e => setNewUser({ ...newUser, phone: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">邮箱（可选）</label>
                                <input
                                    type="email"
                                    value={newUser.email}
                                    onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                            >
                                取消
                            </button>
                            <button
                                onClick={handleAddUser}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                            >
                                添加
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AccountManagement;
