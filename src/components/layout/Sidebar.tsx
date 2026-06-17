import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ListTodo,
  Kanban,
  Brain,
  Activity,
  ShieldCheck,
  FileBarChart,
  Sparkles,
  ClipboardCheck,
  Settings,
  BrainCircuit,
} from 'lucide-react';
import { cn } from '../../utils/helpers';

interface NavItem {
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  badge?: string | number;
}

const NAV_GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: '总览',
    items: [
      { path: '/', icon: LayoutDashboard, label: '综合看板' },
    ],
  },
  {
    title: '任务管理',
    items: [
      { path: '/tasks', icon: ListTodo, label: '任务列表' },
      { path: '/tasks/board', icon: Kanban, label: '状态看板' },
    ],
  },
  {
    title: '模拟计算',
    items: [
      { path: '/simulation', icon: Brain, label: '三维光传输模拟' },
      { path: '/monitor', icon: Activity, label: '实时监控中心' },
      { path: '/review', icon: ShieldCheck, label: '专家复核中心' },
    ],
  },
  {
    title: '结果输出',
    items: [
      { path: '/reports', icon: FileBarChart, label: '报告与数据导出' },
      { path: '/recommend', icon: Sparkles, label: '智能推荐引擎' },
    ],
  },
  {
    title: '审批管理',
    items: [
      { path: '/approval', icon: ClipboardCheck, label: '审批流程中心' },
    ],
  },
  {
    title: '系统',
    items: [
      { path: '/settings', icon: Settings, label: '系统设置' },
    ],
  },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 h-screen bg-space-900/80 backdrop-blur-xl border-r border-cyber-500/10 flex flex-col">
      <div className="p-5 border-b border-cyber-500/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyber-400 to-cyber-600 flex items-center justify-center shadow-glow-cyber">
            <BrainCircuit className="w-6 h-6 text-space-900" />
          </div>
          <div>
            <h1 className="font-bold text-cyber-300 text-sm tracking-wide">fNIRS-SIM</h1>
            <p className="text-[10px] text-space-500 font-mono">脑功能成像平台 v1.0</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto px-3 space-y-6">
        {NAV_GROUPS.map((group) => (
          <div key={group.title}>
            <p className="px-3 mb-2 text-[10px] font-semibold text-space-500 uppercase tracking-widest">
              {group.title}
            </p>
            <ul className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.path === '/'
                    ? location.pathname === '/'
                    : location.pathname.startsWith(item.path);
                return (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all duration-200 group',
                        isActive
                          ? 'bg-cyber-500/15 text-cyber-300 border-l-2 border-cyber-400 shadow-inner-glow'
                          : 'text-space-400 hover:text-cyber-300 hover:bg-cyber-500/5'
                      )}
                    >
                      <Icon
                        className={cn(
                          'w-4.5 h-4.5 transition-transform duration-200',
                          isActive ? 'text-cyber-400' : 'group-hover:scale-110'
                        )}
                      />
                      <span className="flex-1 font-medium">{item.label}</span>
                      {item.badge && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-danger-500/20 text-danger-400 font-mono">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-cyber-500/10">
        <div className="glass-card p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-bio-500 animate-pulse" />
            <span className="text-xs text-bio-400 font-medium">系统状态正常</span>
          </div>
          <p className="text-[10px] text-space-500 font-mono">GPU: 34% | MEM: 8.2GB</p>
        </div>
      </div>
    </aside>
  );
}
