
import React, { useState } from 'react';
import { Client, ClientStatus, User, UserRole } from '../types';

interface AcquisitionChannelProps {
  clients: Client[];
  users: User[];
  onAddClient: (client: Client) => void;
  onAssignClient: (clientId: string, agentId: string) => void;
}

const AcquisitionChannel: React.FC<AcquisitionChannelProps> = ({ clients, users, onAddClient, onAssignClient }) => {
  const [activeTab, setActiveTab] = useState<'MANUAL' | 'BATCH' | 'POOL' | 'HISTORY'>('MANUAL');
  
  // Manual Entry State
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newReq, setNewReq] = useState('');
  const [newSource, setNewSource] = useState('网络端口');

  // History Search State
  const [historySearch, setHistorySearch] = useState('');

  const pendingClients = clients.filter(c => c.status === ClientStatus.PENDING);
  const salesAgents = users.filter(u => u.role === UserRole.SALES || u.role === UserRole.MANAGER);

  // Get Agent Name Helper
  const getAgentName = (agentId?: string) => {
      if (!agentId) return '-';
      const agent = users.find(u => u.id === agentId);
      return agent ? agent.name : '未知';
  };

  const handleManualSubmit = () => {
      if (!newName || !newPhone) {
          alert('请填写姓名和电话');
          return;
      }
      const newClient: Client = {
          id: `c_${Date.now()}`,
          name: newName,
          phone: newPhone,
          requirements: newReq || '待补充需求',
          budget: '待确认',
          status: ClientStatus.PENDING,
          source: newSource,
          lastContactDate: new Date().toISOString().split('T')[0],
      };
      onAddClient(newClient);
      setNewName(''); setNewPhone(''); setNewReq('');
      alert('客户已录入至公海池，请及时分配！');
      setActiveTab('POOL');
  };

  const handleBatchUpload = () => {
      alert('模拟上传成功！已解析 5 条线索数据并导入公海池。');
      // Mock importing data
      for(let i=1; i<=5; i++) {
          onAddClient({
            id: `import_${Date.now()}_${i}`,
            name: `导入客户${i}`,
            phone: `1390000${Math.floor(Math.random()*10000)}`,
            requirements: '批量导入数据 - 意向待确认',
            budget: '待确认',
            status: ClientStatus.PENDING,
            source: 'Excel导入',
            lastContactDate: new Date().toISOString().split('T')[0],
          });
      }
      setActiveTab('POOL');
  };

  return (
    <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
            <div>
                <h2 className="text-xl font-bold text-slate-800">多渠道获客中心</h2>
                <p className="text-sm text-slate-500 mt-1">接入外部流量线索，统一清洗与分配</p>
            </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row min-h-[500px]">
            {/* Sidebar Tabs */}
            <div className="w-full md:w-56 bg-slate-50 border-r border-slate-200 p-2 flex flex-col gap-1">
                <button onClick={() => setActiveTab('MANUAL')} className={`text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'MANUAL' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 hover:bg-slate-200'}`}>
                    ✍️ 手动录入
                </button>
                <button onClick={() => setActiveTab('BATCH')} className={`text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'BATCH' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 hover:bg-slate-200'}`}>
                    📂 批量导入
                </button>
                <button onClick={() => setActiveTab('POOL')} className={`text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'POOL' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 hover:bg-slate-200'}`}>
                    🌊 线索公海 ({pendingClients.length})
                </button>
                <div className="border-t border-slate-200 my-1"></div>
                <button onClick={() => setActiveTab('HISTORY')} className={`text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'HISTORY' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 hover:bg-slate-200'}`}>
                    📜 历史记录查询
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 p-8">
                {activeTab === 'MANUAL' && (
                    <div className="max-w-lg space-y-5">
                        <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4 text-lg">录入单条线索</h3>
                        
                        <div className="grid grid-cols-2 gap-4">
                             <div className="col-span-1">
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">客户姓名</label>
                                <input 
                                    className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" 
                                    placeholder="请输入姓名"
                                    value={newName} 
                                    onChange={e => setNewName(e.target.value)} 
                                />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">联系电话</label>
                                <input 
                                    className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" 
                                    placeholder="请输入手机号"
                                    value={newPhone} 
                                    onChange={e => setNewPhone(e.target.value)} 
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">渠道来源</label>
                            <select 
                                className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" 
                                value={newSource} 
                                onChange={e => setNewSource(e.target.value)}
                            >
                                <option>网络端口</option>
                                <option>老带新</option>
                                <option>线下活动</option>
                                <option>其他</option>
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">初步需求备注</label>
                            <textarea 
                                className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all h-28 resize-none" 
                                placeholder="例如：预算5000左右，想租在地铁附近..."
                                value={newReq} 
                                onChange={e => setNewReq(e.target.value)} 
                            />
                        </div>
                        
                        <div className="pt-2">
                            <button 
                                onClick={handleManualSubmit} 
                                className="w-full py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-md transition-all active:scale-[0.98]"
                            >
                                确认录入公海池
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'BATCH' && (
                    <div className="text-center py-12 space-y-4">
                        <div className="w-24 h-24 bg-slate-100 rounded-full mx-auto flex items-center justify-center text-4xl text-slate-400">
                            📂
                        </div>
                        <h3 className="font-bold text-slate-800">上传 Excel / CSV 文件</h3>
                        <p className="text-sm text-slate-500 max-w-sm mx-auto">请上传标准格式的客户名单文件，系统将自动去重并导入公海池。</p>
                        <div className="flex justify-center gap-4 mt-6">
                            <button className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 bg-white">下载模板</button>
                            <button onClick={handleBatchUpload} className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200">
                                点击上传文件
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'POOL' && (
                    <div className="space-y-4">
                        <h3 className="font-bold text-slate-800 flex justify-between items-center">
                            待分配线索
                            <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-1 rounded">共 {pendingClients.length} 条</span>
                        </h3>
                        
                        <div className="overflow-x-auto border border-slate-200 rounded-lg">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-500 font-medium">
                                    <tr>
                                        <th className="px-4 py-3">姓名</th>
                                        <th className="px-4 py-3">电话</th>
                                        <th className="px-4 py-3">来源</th>
                                        <th className="px-4 py-3">录入时间</th>
                                        <th className="px-4 py-3 text-right">分配给</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {pendingClients.map(client => (
                                        <tr key={client.id} className="hover:bg-slate-50">
                                            <td className="px-4 py-3 font-bold text-slate-700">{client.name}</td>
                                            <td className="px-4 py-3 font-mono text-slate-500">{client.phone}</td>
                                            <td className="px-4 py-3 text-slate-600">{client.source}</td>
                                            <td className="px-4 py-3 text-slate-400 text-xs">{client.lastContactDate}</td>
                                            <td className="px-4 py-3 text-right flex justify-end gap-2">
                                                <select 
                                                    className="px-2 py-1 bg-white border border-slate-300 rounded text-xs w-32 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900"
                                                    onChange={(e) => {
                                                        if (e.target.value) onAssignClient(client.id, e.target.value);
                                                    }}
                                                    value=""
                                                >
                                                    <option value="" disabled>选择顾问...</option>
                                                    {salesAgents.map(agent => (
                                                        <option key={agent.id} value={agent.id}>{agent.name}</option>
                                                    ))}
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                    {pendingClients.length === 0 && (
                                        <tr><td colSpan={5} className="text-center py-8 text-slate-400">公海池暂无待分配线索</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'HISTORY' && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-end border-b border-slate-100 pb-3">
                            <div>
                                <h3 className="font-bold text-slate-800">全量线索历史</h3>
                                <p className="text-xs text-slate-500 mt-1">包含已分配和待分配的所有接入记录</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-500">搜索:</span>
                                <input 
                                    className="px-3 py-1.5 bg-white border border-slate-300 rounded text-sm outline-none focus:ring-2 focus:ring-indigo-500 w-48 text-slate-900"
                                    placeholder="姓名或手机号"
                                    value={historySearch}
                                    onChange={e => setHistorySearch(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto border border-slate-200 rounded-lg max-h-[600px] overflow-y-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-500 font-medium sticky top-0 shadow-sm z-10">
                                    <tr>
                                        <th className="px-4 py-3">线索ID</th>
                                        <th className="px-4 py-3">客户信息</th>
                                        <th className="px-4 py-3">渠道来源</th>
                                        <th className="px-4 py-3 w-48">初始需求内容</th>
                                        <th className="px-4 py-3">接入时间</th>
                                        <th className="px-4 py-3">当前状态</th>
                                        <th className="px-4 py-3">归属人</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {clients
                                        .filter(c => c.name.includes(historySearch) || c.phone.includes(historySearch))
                                        .map(client => (
                                        <tr key={client.id} className="hover:bg-slate-50">
                                            <td className="px-4 py-3 text-xs text-slate-400 font-mono">{client.id}</td>
                                            <td className="px-4 py-3">
                                                <div className="font-bold text-slate-700">{client.name}</div>
                                                <div className="text-xs text-slate-500 font-mono">{client.phone}</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs border border-slate-200">
                                                    {client.source}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-slate-600 truncate max-w-xs" title={client.requirements}>
                                                {client.requirements}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-slate-500">{client.lastContactDate}</td>
                                            <td className="px-4 py-3">
                                                 <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                                     client.status === ClientStatus.PENDING ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                                                 }`}>
                                                     {client.status === ClientStatus.PENDING ? '待分配' : '已接单'}
                                                 </span>
                                            </td>
                                            <td className="px-4 py-3 font-medium text-indigo-700 text-xs">
                                                {getAgentName(client.agentId)}
                                            </td>
                                        </tr>
                                    ))}
                                    {clients.filter(c => c.name.includes(historySearch) || c.phone.includes(historySearch)).length === 0 && (
                                        <tr><td colSpan={7} className="text-center py-10 text-slate-400">未找到匹配的线索记录</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default AcquisitionChannel;
