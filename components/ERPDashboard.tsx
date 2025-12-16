
import React from 'react';
import { User, Order, Property, Client, OrderStatus, PropertyStatus, ClientStatus } from '../types';

interface ERPDashboardProps {
  user: User;
  orders: Order[];
  properties: Property[];
  clients: Client[];
  onNavigate: (page: string) => void;
}

const KPICard = ({ title, value, subtext, color }: { title: string, value: string | number, subtext: string, color: string }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-shadow">
        <div className={`absolute top-0 right-0 w-24 h-24 ${color} opacity-10 rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform`}></div>
        <div className="relative z-10">
            <h4 className="text-slate-500 text-sm font-medium mb-2">{title}</h4>
            <div className="text-3xl font-bold text-slate-800 mb-1">{value}</div>
            <div className="text-xs text-slate-400">{subtext}</div>
        </div>
    </div>
);

const ERPDashboard: React.FC<ERPDashboardProps> = ({ user, orders, properties, clients, onNavigate }) => {
  
  // Quick Stats Calculation
  const pendingOrders = orders.filter(o => o.status === OrderStatus.PENDING).length;
  const viewingOrders = orders.filter(o => o.status === OrderStatus.VIEWING).length;
  const activeProperties = properties.filter(p => p.status === PropertyStatus.AVAILABLE).length;
  const followClients = clients.filter(c => c.status === ClientStatus.FOLLOWING || c.status === ClientStatus.INTENTION).length;

  return (
    <div className="space-y-6 animate-fade-in">
        {/* Welcome Section */}
        <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">早安，{user.name} 👋</h2>
                <p className="text-slate-500 mt-1">今天是 {new Date().toLocaleDateString('zh-CN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}，祝您工作愉快！</p>
            </div>
            <div className="flex space-x-3">
                <button onClick={() => onNavigate('properties')} className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg font-bold text-sm hover:bg-indigo-100 transition-colors">
                    + 发布房源
                </button>
                <button onClick={() => onNavigate('clients')} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
                    + 录入客源
                </button>
            </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard title="待办签约" value={pendingOrders} subtext="需跟进的合同流程" color="bg-orange-500" />
            <KPICard title="今日带看" value={viewingOrders} subtext="已预约的看房任务" color="bg-blue-500" />
            <KPICard title="重点客户" value={followClients} subtext="高意向/跟进中客户" color="bg-green-500" />
            <KPICard title="在售/租库存" value={activeProperties} subtext="当前可用房源总数" color="bg-purple-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sales Funnel (Simplified Visual) */}
            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-800 mb-6 flex items-center">
                    <span className="w-1 h-5 bg-indigo-600 rounded-full mr-2"></span>
                    业务漏斗 (本月)
                </h3>
                <div className="space-y-4">
                    <div className="relative pt-1">
                        <div className="flex mb-2 items-center justify-between">
                            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-600 bg-indigo-200">
                                线索接入 (120)
                            </span>
                            <div className="text-right">
                                <span className="text-xs font-semibold inline-block text-indigo-600">100%</span>
                            </div>
                        </div>
                        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-100">
                            <div style={{ width: "100%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"></div>
                        </div>
                    </div>
                    <div className="relative pt-1 px-4">
                        <div className="flex mb-2 items-center justify-between">
                            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                                建立跟进 ({followClients})
                            </span>
                            <div className="text-right">
                                <span className="text-xs font-semibold inline-block text-blue-600">65%</span>
                            </div>
                        </div>
                        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-100">
                            <div style={{ width: "65%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"></div>
                        </div>
                    </div>
                    <div className="relative pt-1 px-8">
                        <div className="flex mb-2 items-center justify-between">
                            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-orange-600 bg-orange-200">
                                带看/谈判 ({viewingOrders})
                            </span>
                            <div className="text-right">
                                <span className="text-xs font-semibold inline-block text-orange-600">30%</span>
                            </div>
                        </div>
                        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-orange-100">
                            <div style={{ width: "30%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-orange-500"></div>
                        </div>
                    </div>
                     <div className="relative pt-1 px-12">
                        <div className="flex mb-2 items-center justify-between">
                            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-600 bg-green-200">
                                成交签约 ({orders.filter(o => o.status === OrderStatus.COMPLETED).length})
                            </span>
                            <div className="text-right">
                                <span className="text-xs font-semibold inline-block text-green-600">12%</span>
                            </div>
                        </div>
                        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-green-100">
                            <div style={{ width: "12%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Todo List / Quick Actions */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center">
                    <span className="w-1 h-5 bg-orange-500 rounded-full mr-2"></span>
                    待办提醒
                </h3>
                <div className="space-y-3">
                    {orders.filter(o => o.status === OrderStatus.VIEWING).slice(0, 3).map(o => (
                        <div key={o.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                            <div>
                                <div className="text-sm font-bold text-slate-800">带看: {o.clientName}</div>
                                <div className="text-xs text-slate-500 mt-1">{o.propertyTitle}</div>
                                <div className="text-xs text-blue-600 mt-1">{o.viewingDate}</div>
                            </div>
                        </div>
                    ))}
                    {clients.filter(c => c.status === ClientStatus.NEW).slice(0, 2).map(c => (
                        <div key={c.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                            <div>
                                <div className="text-sm font-bold text-slate-800">新客回访: {c.name}</div>
                                <div className="text-xs text-slate-500 mt-1">{c.phone}</div>
                            </div>
                        </div>
                    ))}
                    {orders.length === 0 && <div className="text-slate-400 text-sm text-center py-4">暂无待办事项</div>}
                </div>
                <button onClick={() => onNavigate('orders')} className="w-full mt-4 py-2 text-xs text-slate-500 hover:text-indigo-600 border border-slate-200 rounded hover:bg-slate-50 transition-colors">
                    查看全部任务
                </button>
            </div>
        </div>
    </div>
  );
};

export default ERPDashboard;
