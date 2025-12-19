
import React, { useState, useEffect } from 'react';
import { SystemLog, SystemConfig } from '../types';
import { seedAllProperties, seedBaseData } from '../services/seeder';

interface SystemSettingsProps {
    logs: SystemLog[];
    config: SystemConfig;
    onUpdateConfig: (newConfig: SystemConfig) => void;
}

const SystemSettings: React.FC<SystemSettingsProps> = ({ logs, config, onUpdateConfig }) => {
    const [activeTab, setActiveTab] = useState<'GENERAL' | 'SECURITY' | 'LOGS' | 'AI'>('GENERAL');

    // Local state for form editing
    const [localSettings, setLocalSettings] = useState<SystemConfig>(config);

    // Sync local state when prop changes
    useEffect(() => {
        setLocalSettings(config);
    }, [config]);

    const [isBackupLoading, setIsBackupLoading] = useState(false);
    const [isSeeding, setIsSeeding] = useState(false);
    const [searchUser, setSearchUser] = useState('');

    const handleSaveGeneral = () => {
        onUpdateConfig(localSettings);
        alert("配置已保存并生效！");
    };

    const handleBackup = () => {
        setIsBackupLoading(true);
        setTimeout(() => {
            setIsBackupLoading(false);
            alert('数据备份成功！备份文件已生成: backup_20231027.sql');
        }, 2000);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">系统全局管理</h2>
                    <p className="text-sm text-slate-500 mt-1">配置平台参数、安全设置及查看操作日志</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row min-h-[600px]">
                {/* Sidebar Tabs */}
                <div className="w-full md:w-64 bg-slate-50 border-r border-slate-200 p-4 flex flex-col space-y-2 flex-shrink-0">
                    <button
                        onClick={() => setActiveTab('GENERAL')}
                        className={`text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'GENERAL' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 hover:bg-slate-200'}`}
                    >
                        ⚙️ 常规设置
                    </button>

                    <button
                        onClick={() => setActiveTab('SECURITY')}
                        className={`text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'SECURITY' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 hover:bg-slate-200'}`}
                    >
                        🛡️ 安全与备份
                    </button>
                    <button
                        onClick={() => setActiveTab('LOGS')}
                        className={`text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'LOGS' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 hover:bg-slate-200'}`}
                    >
                        📜 操作日志
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 p-8 overflow-hidden">
                    {activeTab === 'GENERAL' && (
                        <div className="max-w-2xl space-y-6">
                            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">平台基础信息</h3>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">系统名称</label>
                                <input
                                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-colors"
                                    value={localSettings.systemName}
                                    onChange={(e) => setLocalSettings({ ...localSettings, systemName: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">系统公告 (显示在登录页)</label>
                                <textarea
                                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 h-24 resize-none focus:ring-2 focus:ring-indigo-500 outline-none transition-colors"
                                    value={localSettings.announcement}
                                    onChange={(e) => setLocalSettings({ ...localSettings, announcement: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">技术支持电话</label>
                                <input
                                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-colors"
                                    value={localSettings.supportPhone}
                                    onChange={(e) => setLocalSettings({ ...localSettings, supportPhone: e.target.value })}
                                />
                            </div>

                            <div className="pt-4">
                                <button
                                    onClick={handleSaveGeneral}
                                    className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-sm transition-colors"
                                >
                                    保存常规设置
                                </button>
                            </div>
                        </div>
                    )}



                    {activeTab === 'SECURITY' && (
                        <div className="max-w-2xl space-y-8">
                            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">系统安全控制</h3>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
                                    <div>
                                        <div className="font-bold text-slate-800">维护模式</div>
                                        <div className="text-xs text-slate-500">开启后，除超级管理员外，其他用户无法登录</div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            const newConfig = { ...localSettings, maintenanceMode: !localSettings.maintenanceMode };
                                            setLocalSettings(newConfig);
                                            onUpdateConfig(newConfig);
                                        }}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${localSettings.maintenanceMode ? 'bg-indigo-600' : 'bg-slate-300'}`}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${localSettings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </div>

                                <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
                                    <div>
                                        <div className="font-bold text-slate-800">开放注册</div>
                                        <div className="text-xs text-slate-500">允许新用户在登录页自行注册账号</div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            const newConfig = { ...localSettings, allowRegistration: !localSettings.allowRegistration };
                                            setLocalSettings(newConfig);
                                            onUpdateConfig(newConfig);
                                        }}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${localSettings.allowRegistration ? 'bg-indigo-600' : 'bg-slate-300'}`}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${localSettings.allowRegistration ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </div>
                            </div>

                            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2 pt-4">数据灾备</h3>
                            <div className="bg-yellow-50 p-5 rounded-xl border border-yellow-200">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h4 className="font-bold text-yellow-800">数据库全量备份</h4>
                                        <p className="text-xs text-yellow-700 mt-1">建议每周至少备份一次。上次备份: 2023-10-20</p>
                                    </div>
                                    <button
                                        onClick={handleBackup}
                                        disabled={isBackupLoading}
                                        className="px-4 py-2 bg-yellow-600 text-white font-bold rounded-lg hover:bg-yellow-700 shadow-sm transition-colors disabled:opacity-50"
                                    >
                                        {isBackupLoading ? '备份中...' : '立即备份'}
                                    </button>
                                </div>
                            </div>

                            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2 pt-4">数据管理 (开发调试)</h3>
                            <div className="bg-red-50 p-5 rounded-xl border border-red-200">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h4 className="font-bold text-red-800">一键生成/重置演示数据</h4>
                                        <p className="text-xs text-red-700 mt-1">
                                            危险操作：这将批量写入150套演示房源到数据库。
                                            <br />
                                            仅在初次部署或数据库为空时使用。
                                        </p>
                                    </div>
                                    <button
                                        onClick={async () => {
                                            if (confirm('确认要生成150套房源数据吗？这可能需要几十秒时间。')) {
                                                setIsSeeding(true);
                                                await seedBaseData(); // Seed users/clients first
                                                const count = await seedAllProperties();
                                                setIsSeeding(false);
                                                alert(`成功生成 ${count} 套房源！请并在 Supabase 后台确认。`);
                                            }
                                        }}
                                        disabled={isSeeding}
                                        className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 shadow-sm transition-colors disabled:opacity-50"
                                    >
                                        {isSeeding ? '生成中...' : '初始化演示数据'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'LOGS' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-end border-b border-slate-100 pb-2">
                                <h3 className="text-lg font-bold text-slate-800">最近操作日志</h3>
                                <div className="flex items-center gap-2">
                                    <label className="text-xs font-bold text-slate-500">按账号筛选:</label>
                                    <input
                                        type="text"
                                        className="px-3 py-1.5 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder="输入用户名..."
                                        value={searchUser}
                                        onChange={(e) => setSearchUser(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="overflow-x-auto border border-slate-200 rounded-lg">
                                <table className="w-full text-sm text-left min-w-[600px]">
                                    <thead className="bg-slate-50 text-slate-500 font-medium">
                                        <tr>
                                            <th className="px-4 py-3 rounded-l-lg">时间</th>
                                            <th className="px-4 py-3">操作人员</th>
                                            <th className="px-4 py-3">IP地址</th>
                                            <th className="px-4 py-3">操作内容</th>
                                            <th className="px-4 py-3 rounded-r-lg text-right">状态</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {logs.filter(log => log.user.toLowerCase().includes(searchUser.toLowerCase())).map(log => (
                                            <tr key={log.id} className="hover:bg-slate-50">
                                                <td className="px-4 py-3 text-slate-500 font-mono text-xs">{log.time}</td>
                                                <td className="px-4 py-3 font-medium text-slate-700">{log.user}</td>
                                                <td className="px-4 py-3 text-slate-500 text-xs">{log.ip}</td>
                                                <td className="px-4 py-3 text-slate-700">{log.action}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <span className={`px-2 py-1 rounded text-xs ${log.status === '成功' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        {log.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                        {logs.filter(log => log.user.toLowerCase().includes(searchUser.toLowerCase())).length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="text-center py-8 text-slate-400">
                                                    未找到该用户的操作记录
                                                </td>
                                            </tr>
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

export default SystemSettings;
