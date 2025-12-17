
import React, { useState } from 'react';
import { Client, ClientStatus, User } from '../types';

interface ClientManagementProps {
    clients: Client[];
    onAddClient: (client: Client) => void;
    onUpdateClient: (id: string, updates: Partial<Client>) => void;
    currentUser: User;
}

const ClientManagement: React.FC<ClientManagementProps> = ({ clients, onAddClient, onUpdateClient, currentUser }) => {
    const [activeTab, setActiveTab] = useState<'ACTIVE' | 'HISTORY'>('ACTIVE');
    const [filterStatus, setFilterStatus] = useState<string>('ALL');
    const [searchTerm, setSearchTerm] = useState('');

    // Archive Modal State
    const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
    const [archiveTargetId, setArchiveTargetId] = useState<string | null>(null);
    const [archiveReason, setArchiveReason] = useState('');

    // Add Client Modal State
    const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
    const [newClientName, setNewClientName] = useState('');
    const [newClientPhone, setNewClientPhone] = useState('');
    const [newClientReq, setNewClientReq] = useState('');
    const [newClientBudget, setNewClientBudget] = useState('');
    const [newClientSource, setNewClientSource] = useState('上门');

    const filteredClients = clients.filter(c => {
        // Tab Filter
        if (activeTab === 'ACTIVE') {
            if ([ClientStatus.SIGNED, ClientStatus.ARCHIVED].includes(c.status)) return false;
        } else {
            // History Tab
            if (![ClientStatus.SIGNED, ClientStatus.ARCHIVED].includes(c.status)) return false;
        }

        // Dropdown Filter
        if (filterStatus !== 'ALL' && c.status !== filterStatus) return false;

        // Search Filter
        if (searchTerm && !c.name.includes(searchTerm) && !c.phone.includes(searchTerm)) return false;
        return true;
    });

    const getStatusColor = (status: ClientStatus) => {
        switch (status) {
            case ClientStatus.NEW: return 'bg-green-100 text-green-700';
            case ClientStatus.FOLLOWING: return 'bg-blue-100 text-blue-700';
            case ClientStatus.INTENTION: return 'bg-orange-100 text-orange-700';
            case ClientStatus.SIGNED: return 'bg-purple-100 text-purple-700'; // Renamed from DEAL
            case ClientStatus.ARCHIVED: return 'bg-slate-200 text-slate-500'; // Renamed from INVALID
            default: return 'bg-slate-100 text-slate-500';
        }
    };

    const getStatusLabel = (status: ClientStatus) => {
        switch (status) {
            case ClientStatus.NEW: return '新客';
            case ClientStatus.FOLLOWING: return '跟进中';
            case ClientStatus.INTENTION: return '高意向';
            case ClientStatus.SIGNED: return '已成交';
            case ClientStatus.ARCHIVED: return '已归档';
            default: return status;
        }
    };

    const handleArchive = () => {
        if (archiveTargetId && archiveReason) {
            onUpdateClient(archiveTargetId, {
                status: ClientStatus.ARCHIVED,
                archiveReason: archiveReason,
                archivedAt: new Date().toISOString()
            });
            setIsArchiveModalOpen(false);
            setArchiveTargetId(null);
            setArchiveReason('');
        } else {
            alert("请填写归档/流失原因");
        }
    };

    const openArchiveModal = (id: string) => {
        setArchiveTargetId(id);
        setArchiveReason('');
        setIsArchiveModalOpen(true);
    };

    const handleCreateClient = () => {
        if (!newClientName || !newClientPhone) {
            alert("姓名和电话必填");
            return;
        }

        const newClient: Client = {
            id: `c_${Date.now()}`,
            name: newClientName,
            phone: newClientPhone,
            requirements: newClientReq || '暂无需求描述',
            budget: newClientBudget || '待定',
            status: ClientStatus.NEW,
            source: newClientSource,
            agentId: currentUser.id, // Auto-assign to current user
            lastContactDate: new Date().toISOString().split('T')[0]
        };

        onAddClient(newClient);
        setIsAddClientModalOpen(false);
        // Reset form
        setNewClientName(''); setNewClientPhone(''); setNewClientReq(''); setNewClientBudget('');
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">客源管理 (CRM)</h2>
                    <p className="text-sm text-slate-500 mt-1">管理私海客户资源，跟进购房意向</p>
                </div>
                <div className="flex gap-3">
                    <div className="bg-slate-100 p-1 rounded-lg flex text-sm font-bold">
                        <button
                            onClick={() => setActiveTab('ACTIVE')}
                            className={`px-4 py-1.5 rounded-md transition-all ${activeTab === 'ACTIVE' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            跟进中
                        </button>
                        <button
                            onClick={() => setActiveTab('HISTORY')}
                            className={`px-4 py-1.5 rounded-md transition-all ${activeTab === 'HISTORY' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            历史/成交
                        </button>
                    </div>
                    {activeTab === 'ACTIVE' && (
                        <button
                            onClick={() => setIsAddClientModalOpen(true)}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                        >
                            + 录入新客
                        </button>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Filters */}
                <div className="p-4 border-b border-slate-100 flex flex-wrap gap-4 bg-slate-50">
                    <select
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                        className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="ALL">全部状态</option>
                        {activeTab === 'ACTIVE' ? (
                            <>
                                <option value={ClientStatus.NEW}>新客</option>
                                <option value={ClientStatus.FOLLOWING}>跟进中</option>
                                <option value={ClientStatus.INTENTION}>高意向</option>
                            </>
                        ) : (
                            <>
                                <option value={ClientStatus.SIGNED}>已成交</option>
                                <option value={ClientStatus.ARCHIVED}>已归档</option>
                            </>
                        )}
                    </select>
                    <input
                        placeholder="搜索姓名或手机号..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-[200px]"
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left min-w-[900px]">
                        <thead className="bg-slate-50 text-slate-500 font-medium">
                            <tr>
                                <th className="px-6 py-4">客户信息</th>
                                <th className="px-6 py-4">需求/预算</th>
                                <th className="px-6 py-4">状态</th>
                                <th className="px-6 py-4">来源</th>
                                <th className="px-6 py-4">关键时间</th>
                                <th className="px-6 py-4 text-right">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredClients.map(client => (
                                <tr key={client.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-800">{client.name}</div>
                                        <div className="text-xs text-slate-500 font-mono">{client.phone}</div>
                                    </td>
                                    <td className="px-6 py-4 max-w-xs">
                                        <div className="truncate font-medium text-slate-700" title={client.requirements}>{client.requirements}</div>
                                        <div className="text-xs text-rose-500 mt-1">预算: {client.budget}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(client.status)}`}>
                                            {getStatusLabel(client.status)}
                                        </span>
                                        {client.status === ClientStatus.ARCHIVED && client.archiveReason && (
                                            <div className="text-xs text-slate-400 mt-1">注: {client.archiveReason}</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">{client.source}</td>
                                    <td className="px-6 py-4 text-slate-500">
                                        {activeTab === 'ACTIVE' ? (
                                            <>跟进: {client.lastContactDate}</>
                                        ) : (
                                            client.status === ClientStatus.SIGNED ?
                                                <><div className="text-xs">签约: {client.lastContactDate}</div><div className="text-xs text-indigo-500">到期: {client.leaseEndDate}</div></> :
                                                <>归档: {client.archivedAt?.split('T')[0] || '-'}</>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {activeTab === 'ACTIVE' ? (
                                            <>
                                                <button className="text-indigo-600 hover:text-indigo-800 font-medium mr-3">写跟进</button>
                                                <button
                                                    onClick={() => openArchiveModal(client.id)}
                                                    className="text-slate-400 hover:text-rose-500 transition-colors"
                                                >
                                                    标记流失
                                                </button>
                                            </>
                                        ) : (
                                            <button className="text-slate-400 hover:text-slate-600">查看详情</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filteredClients.length === 0 && (
                                <tr><td colSpan={6} className="text-center py-10 text-slate-400">暂无客户数据</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Archive Modal */}
            {isArchiveModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-[80] flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg w-[400px] p-6 animate-fade-in-up">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">标记流失/归档</h3>
                        <p className="text-sm text-slate-500 mb-4">该客户将移动到历史归档中，不再显示在活跃列表。</p>
                        <label className="block text-sm font-bold text-slate-700 mb-2">归档原因</label>
                        <textarea
                            className="w-full p-3 border border-slate-300 rounded-lg text-sm mb-4 h-24 focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="例如：已在他处购房、预算不足暂时搁置..."
                            value={archiveReason}
                            onChange={e => setArchiveReason(e.target.value)}
                        />
                        <div className="flex gap-3">
                            <button onClick={() => setIsArchiveModalOpen(false)} className="flex-1 py-2 text-slate-500 hover:bg-slate-100 rounded-lg">取消</button>
                            <button onClick={handleArchive} className="flex-1 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 font-bold">确认归档</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Client Modal */}
            {isAddClientModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-[80] flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl w-[500px] max-w-full p-6 animate-fade-in-up shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-slate-800">录入新客户</h3>
                            <button onClick={() => setIsAddClientModalOpen(false)} className="text-slate-400 hover:text-slate-600">×</button>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">客户姓名 *</label>
                                    <input className="w-full p-3 border rounded-lg bg-slate-50 focus:bg-white transition-colors" value={newClientName} onChange={e => setNewClientName(e.target.value)} placeholder="称呼" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">联系电话 *</label>
                                    <input className="w-full p-3 border rounded-lg bg-slate-50 focus:bg-white transition-colors" value={newClientPhone} onChange={e => setNewClientPhone(e.target.value)} placeholder="手机号" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">购房/租房需求</label>
                                <textarea className="w-full p-3 border rounded-lg bg-slate-50 focus:bg-white h-20 transition-colors" value={newClientReq} onChange={e => setNewClientReq(e.target.value)} placeholder="例如: 朝阳区两居室，近地铁..." />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">预算范围</label>
                                    <input className="w-full p-3 border rounded-lg bg-slate-50 focus:bg-white transition-colors" value={newClientBudget} onChange={e => setNewClientBudget(e.target.value)} placeholder="例如: 5000-8000" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">来源渠道</label>
                                    <select className="w-full p-3 border rounded-lg bg-slate-50 focus:bg-white outline-none" value={newClientSource} onChange={e => setNewClientSource(e.target.value)}>
                                        <option value="上门">上门</option>
                                        <option value="网络端口">网络端口</option>
                                        <option value="老客户推荐">老客户推荐</option>
                                        <option value="转介绍">转介绍</option>
                                        <option value="其他">其他</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3 mt-2">
                                <button onClick={() => setIsAddClientModalOpen(false)} className="px-5 py-2.5 text-slate-500 font-bold hover:bg-slate-100 rounded-lg">取消</button>
                                <button onClick={handleCreateClient} className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-200">确认录入</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientManagement;
