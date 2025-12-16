
import React, { ReactNode, useState } from 'react';
import { User, UserRole } from '../types';
import { ROLE_LABELS } from '../constants';

interface LayoutProps {
  user: User;
  onLogout: () => void;
  children: ReactNode;
  activePage: string;
  onNavigate: (page: string) => void;
}

// Updated NavItem to handle collapsed state
const NavItem = ({ label, active, onClick, icon, isCollapsed }: { label: string; active: boolean; onClick: () => void; icon: ReactNode; isCollapsed: boolean }) => (
  <button
    onClick={onClick}
    title={isCollapsed ? label : ''} // Show tooltip on hover when collapsed
    className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'space-x-3 px-4'} py-2.5 text-sm font-medium transition-all duration-300 rounded-lg mb-1
      ${active ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100 hover:text-indigo-600'}`}
  >
    <div className="flex-shrink-0">{icon}</div>
    {!isCollapsed && <span className="whitespace-nowrap overflow-hidden transition-opacity duration-300">{label}</span>}
  </button>
);

// Updated NavGroup to handle collapsed state
const NavGroup = ({ title, children, isCollapsed }: { title: string, children?: ReactNode, isCollapsed: boolean }) => (
    <div className="mb-4">
        {!isCollapsed ? (
             <h3 className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 transition-opacity duration-300 delay-100">{title}</h3>
        ) : (
             <div className="h-4 flex items-center justify-center mb-2">
                 <div className="w-8 h-[1px] bg-slate-200"></div>
             </div>
        )}
        {children}
    </div>
);

const Layout: React.FC<LayoutProps> = ({ user, onLogout, children, activePage, onNavigate }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Determine if user has access to Admin panel
  const canAccessAdmin = user.role === UserRole.SUPER_ADMIN;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside 
        className={`${isCollapsed ? 'w-20' : 'w-64'} bg-white border-r border-slate-200 flex flex-col shadow-sm z-10 transition-all duration-300 ease-in-out relative flex-shrink-0`}
      >
        {/* Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-9 bg-white border border-slate-200 text-slate-500 rounded-full p-1 shadow-sm hover:bg-slate-50 hover:text-indigo-600 z-50 focus:outline-none transition-colors"
          title={isCollapsed ? "展开侧边栏" : "收起侧边栏"}
        >
          {isCollapsed ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
          )}
        </button>

        <div className={`p-6 border-b border-slate-100 flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} transition-all duration-300`}>
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-200 flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          {!isCollapsed && (
              <div className="overflow-hidden whitespace-nowrap">
                  <span className="text-lg font-bold text-slate-800 block leading-tight">智居 AI 房产</span>
                  <span className="text-[10px] text-slate-400 font-medium tracking-wide">ERP 管理系统 Pro</span>
              </div>
          )}
        </div>

        <nav className="flex-1 p-3 overflow-y-auto custom-scrollbar overflow-x-hidden">
          
          <div className="my-2"></div>

          <NavGroup title="资源中心" isCollapsed={isCollapsed}>
             <NavItem 
                label="房源库" 
                active={activePage === 'properties'} 
                onClick={() => onNavigate('properties')}
                isCollapsed={isCollapsed}
                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>}
              />
              <NavItem 
                label="AI 地图找房" 
                active={activePage === 'data-screen'} 
                onClick={() => onNavigate('data-screen')}
                isCollapsed={isCollapsed}
                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>}
              />
              <NavItem 
                 label="知识库" 
                 active={activePage === 'knowledge'} 
                 onClick={() => onNavigate('knowledge')}
                 isCollapsed={isCollapsed}
                 icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>}
               />
          </NavGroup>

          <NavGroup title="业务中心" isCollapsed={isCollapsed}>
              <NavItem 
                label="客源管理" 
                active={activePage === 'clients'} 
                onClick={() => onNavigate('clients')}
                isCollapsed={isCollapsed}
                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
              />
              <NavItem 
                label="订单管理" 
                active={activePage === 'orders'} 
                onClick={() => onNavigate('orders')}
                isCollapsed={isCollapsed}
                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
              />
          </NavGroup>

          <NavGroup title="营销获客" isCollapsed={isCollapsed}>
              <NavItem 
                label="获客接入" 
                active={activePage === 'acquisition'} 
                onClick={() => onNavigate('acquisition')}
                isCollapsed={isCollapsed}
                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
              />
              {/* Only show Dashboard if user has permission */}
              {user.permissions.includes('VIEW_DASHBOARD') && (
               <NavItem 
                label="数据大屏" 
                active={activePage === 'big-screen'} 
                onClick={() => onNavigate('big-screen')}
                isCollapsed={isCollapsed}
                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
              />
              )}
          </NavGroup>

          {canAccessAdmin && (
            <NavGroup title="管理后台" isCollapsed={isCollapsed}>
              <NavItem 
                label="账号管理" 
                active={activePage === 'users'} 
                onClick={() => onNavigate('users')}
                isCollapsed={isCollapsed}
                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
              />
              <NavItem 
                label="历史成交" 
                active={activePage === 'history'} 
                onClick={() => onNavigate('history')}
                isCollapsed={isCollapsed}
                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              />
              <NavItem 
                label="系统管理" 
                active={activePage === 'system-settings'} 
                onClick={() => onNavigate('system-settings')}
                isCollapsed={isCollapsed}
                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
              />
            </NavGroup>
          )}
        </nav>

        <div className={`p-4 border-t border-slate-200 transition-all duration-300 ${isCollapsed ? 'flex justify-center' : ''}`}>
          <div className={`flex items-center space-x-3 mb-4 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold border-2 border-white shadow-sm flex-shrink-0">
              {user.name.charAt(0)}
            </div>
            {!isCollapsed && (
                <div className="flex-1 min-w-0 transition-opacity duration-300">
                  <p className="text-sm font-bold text-slate-800 truncate">{user.name}</p>
                  <p className="text-slate-500 truncate uppercase tracking-wide text-[10px]">{ROLE_LABELS[user.role]}</p>
                </div>
            )}
          </div>
          <button 
            onClick={onLogout}
            title={isCollapsed ? "退出登录" : ""}
            className={`w-full px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all flex items-center ${isCollapsed ? 'justify-center' : 'justify-center'}`}
          >
            <svg className={`w-4 h-4 ${!isCollapsed ? 'mr-2' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            {!isCollapsed && "退出登录"}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative min-w-0">
        {activePage !== 'data-screen' && (
          <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 shadow-sm flex-shrink-0 z-10 transition-all">
            <h1 className="text-lg md:text-xl font-bold text-slate-800 flex items-center gap-2 truncate">
              {activePage === 'properties' && '房源库 Property Library'}
              {activePage === 'clients' && '客源管理 Client CRM'}
              {activePage === 'orders' && '订单管理 Order Process'}
              {activePage === 'users' && '账号管理'}
              {activePage === 'system-settings' && '系统管理'}
              {activePage === 'history' && '历史成交'}
              {activePage === 'knowledge' && '知识库'}
              {activePage === 'acquisition' && '多渠道获客中心'}
            </h1>
            <div className="flex items-center space-x-4 flex-shrink-0">
              <span className="text-xs md:text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full hidden sm:inline-block">{new Date().toLocaleDateString('zh-CN')}</span>
            </div>
          </header>
        )}

        <div className={`flex-1 overflow-auto ${activePage === 'data-screen' ? 'p-0' : 'p-4 md:p-8 bg-slate-100/50'} scroll-smooth relative`}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
