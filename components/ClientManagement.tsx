
import React, { useState } from 'react';
import { Client, ClientStatus } from '../types';

interface ClientManagementProps {
  clients: Client[];
  onAddClient: (client: Client) => void;
  onUpdateClient: (id: string, updates: Partial<Client>) => void;
}

const ClientManagement: React.FC<ClientManagementProps> = ({ clients, onAddClient, onUpdateClient }) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClients = clients.filter(c => {
      if (filterStatus !== 'ALL' && c.status !== filterStatus) return false;
      if (searchTerm && !c.name.includes(searchTerm) && !c.phone.includes(searchTerm)) return false;
      return true;
  });

  const getStatusColor = (status: ClientStatus) => {
      switch(status) {
          case ClientStatus.NEW: return 'bg-green-100 text-green-700';
          case ClientStatus.FOLLOWING: return 'bg-blue-100 text-blue-700';
          case ClientStatus.INTENTION: return 'bg-orange-100 text-orange-700';
          case ClientStatus.DEAL: return 'bg-purple-100 text-purple-700';
          default: return 'bg-slate-100 text-slate-500';
      }
  };

  const getStatusLabel = (status: ClientStatus) => {
      switch(status) {
          case ClientStatus.NEW: return '新客';
          case ClientStatus.FOLLOWING: return '跟进中';
          case ClientStatus.INTENTION: return '高意向';
          case ClientStatus.DEAL: return '已成交';
          case ClientStatus.INVALID: return '无效';
          default: return status;
      }
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <div>
           <h2 className="text-xl font-bold text-slate-800">客源管理 (CRM)</h2>
           <p className="text-sm text-slate-500 mt-1">管理私海客户资源，跟进购房意向</p>
        </div>
        <button 
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
        >
          + 录入新客
        </button>
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
                  <option value={ClientStatus.NEW}>新客</option>
                  <option value={ClientStatus.FOLLOWING}>跟进中</option>
                  <option value={ClientStatus.INTENTION}>高意向</option>
                  <option value={ClientStatus.DEAL}>已成交</option>
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
                          <th className="px-6 py-4">最后跟进</th>
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
                              </td>
                              <td className="px-6 py-4 text-slate-600">{client.source}</td>
                              <td className="px-6 py-4 text-slate-500">{client.lastContactDate}</td>
                              <td className="px-6 py-4 text-right">
                                  <button className="text-indigo-600 hover:text-indigo-800 font-medium mr-3">写跟进</button>
                                  <button className="text-slate-400 hover:text-slate-600">详情</button>
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
    </div>
  );
};

export default ClientManagement;
