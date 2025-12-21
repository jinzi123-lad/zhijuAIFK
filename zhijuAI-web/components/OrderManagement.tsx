
import React, { useState } from 'react';
import { Order, OrderStatus, PropertyType } from '../types';

interface OrderManagementProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  onViewOrderDetails: (order: Order) => void;
}

const OrderManagement: React.FC<OrderManagementProps> = ({ orders, onUpdateOrderStatus, onViewOrderDetails }) => {
  const [activeTab, setActiveTab] = useState<'VIEWING' | 'PENDING' | 'HISTORY'>('VIEWING');

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'VIEWING') return order.status === OrderStatus.VIEWING;
    if (activeTab === 'PENDING') return order.status === OrderStatus.PENDING;
    if (activeTab === 'HISTORY') return order.status === OrderStatus.COMPLETED || order.status === OrderStatus.CANCELLED;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-xl font-bold text-slate-800">全流程订单管理</h2>
           <p className="text-sm text-slate-500 mt-1">管理客户看房、签约进度及历史成交记录</p>
        </div>
        <div className="flex bg-white rounded-lg shadow-sm p-1 border border-slate-200">
            <button 
                onClick={() => setActiveTab('VIEWING')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'VIEWING' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 hover:bg-slate-50'}`}
            >
                看房中 ({orders.filter(o => o.status === OrderStatus.VIEWING).length})
            </button>
            <button 
                onClick={() => setActiveTab('PENDING')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'PENDING' ? 'bg-orange-500 text-white shadow' : 'text-slate-600 hover:bg-slate-50'}`}
            >
                签约/进行中 ({orders.filter(o => o.status === OrderStatus.PENDING).length})
            </button>
            <button 
                onClick={() => setActiveTab('HISTORY')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'HISTORY' ? 'bg-slate-700 text-white shadow' : 'text-slate-600 hover:bg-slate-50'}`}
            >
                历史/成交 ({orders.filter(o => o.status === OrderStatus.COMPLETED || o.status === OrderStatus.CANCELLED).length})
            </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[500px]">
         <div className="overflow-x-auto">
             <table className="w-full text-sm text-left min-w-[1000px]">
                <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                    <tr>
                        <th className="px-6 py-4">房源信息</th>
                        <th className="px-6 py-4">客户信息</th>
                        <th className="px-6 py-4">经纪人</th>
                        <th className="px-6 py-4">金额</th>
                        <th className="px-6 py-4">关键时间</th>
                        <th className="px-6 py-4">当前状态</th>
                        <th className="px-6 py-4 text-right">操作</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {filteredOrders.map(order => (
                        <tr key={order.id} className="hover:bg-slate-50 transition-colors group">
                            <td className="px-6 py-4">
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-slate-200 rounded mr-3 overflow-hidden flex-shrink-0">
                                        {order.propertyImage && <img src={order.propertyImage} className="w-full h-full object-cover" alt="" />}
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-800 line-clamp-1 w-48" title={order.propertyTitle}>{order.propertyTitle}</div>
                                        {order.unitName && <div className="text-xs text-orange-600">{order.unitName}</div>}
                                        <div className="text-xs text-slate-400">ID: {order.propertyId}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="font-medium text-slate-800">{order.clientName}</div>
                                <div className="text-xs text-slate-500">{order.clientPhone || '未填写'}</div>
                            </td>
                            <td className="px-6 py-4 text-slate-600">{order.agentName}</td>
                            <td className="px-6 py-4">
                                 <span className="font-bold text-slate-700">
                                    ¥{order.price}/月
                                 </span>
                            </td>
                            <td className="px-6 py-4 text-slate-500">
                                {order.status === OrderStatus.VIEWING && (
                                    <div><span className="text-xs text-slate-400">看房:</span> {order.viewingDate}</div>
                                )}
                                {(order.status === OrderStatus.PENDING || order.status === OrderStatus.COMPLETED) && (
                                    <div><span className="text-xs text-slate-400">签约:</span> {order.contractDate || order.createdAt}</div>
                                )}
                                <div className="text-xs text-slate-300 mt-1">创建: {order.createdAt}</div>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                    order.status === OrderStatus.COMPLETED ? 'bg-green-100 text-green-700' :
                                    order.status === OrderStatus.PENDING ? 'bg-orange-100 text-orange-700' :
                                    order.status === OrderStatus.VIEWING ? 'bg-blue-100 text-blue-700' :
                                    'bg-slate-100 text-slate-500'
                                }`}>
                                    {order.status === OrderStatus.VIEWING ? '看房中' :
                                     order.status === OrderStatus.PENDING ? '签约中' :
                                     order.status === OrderStatus.COMPLETED ? '已成交' : '已取消'}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right space-x-2">
                                 {order.status === OrderStatus.VIEWING && (
                                     <button 
                                        onClick={() => onUpdateOrderStatus(order.id, OrderStatus.PENDING)}
                                        className="text-xs bg-orange-50 text-orange-600 px-2 py-1 rounded border border-orange-200 hover:bg-orange-100"
                                     >
                                         发起签约
                                     </button>
                                 )}
                                 {order.status === OrderStatus.PENDING && (
                                     <button 
                                        onClick={() => onUpdateOrderStatus(order.id, OrderStatus.COMPLETED)}
                                        className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded border border-green-200 hover:bg-green-100"
                                     >
                                         完成交易
                                     </button>
                                 )}
                                 {(order.status === OrderStatus.VIEWING || order.status === OrderStatus.PENDING) && (
                                     <button 
                                        onClick={() => onUpdateOrderStatus(order.id, OrderStatus.CANCELLED)}
                                        className="text-xs text-slate-400 hover:text-red-500"
                                     >
                                         取消
                                     </button>
                                 )}
                            </td>
                        </tr>
                    ))}
                    {filteredOrders.length === 0 && (
                        <tr>
                            <td colSpan={7} className="text-center py-20 text-slate-400">
                                暂无此类订单数据
                            </td>
                        </tr>
                    )}
                </tbody>
             </table>
         </div>
      </div>
    </div>
  );
};

export default OrderManagement;
