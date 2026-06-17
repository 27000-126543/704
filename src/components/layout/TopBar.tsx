import { Bell, Search, Plus, ChevronDown, User, Zap, Cpu } from 'lucide-react';
import { useAlertStore } from '../../store/useAlertStore';
import { useReportStore } from '../../store/useReportStore';
import { useUserStore } from '../../store/useUserStore';
import { UserRoleLabels } from '../../types';
import { useNavigate } from 'react-router-dom';

export function TopBar() {
  const pendingAlerts = useAlertStore((s) => s.getPendingCount());
  const unreadNotifs = useReportStore((s) => s.getUnreadNotificationCount());
  const currentUser = useUserStore((s) => s.currentUser);
  const navigate = useNavigate();

  return (
    <header className="h-16 bg-space-900/60 backdrop-blur-xl border-b border-cyber-500/10 flex items-center px-6 gap-6">
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-space-500" />
          <input
            type="text"
            placeholder="搜索任务ID、头模、光极布局..."
            className="w-full h-9 pl-10 pr-4 rounded-md bg-space-800/50 border border-cyber-500/10 text-sm text-cyan-50 placeholder:text-space-500 focus:outline-none focus:border-cyber-400/40 transition-colors"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-space-500 border border-space-600 rounded px-1.5 py-0.5">
            Ctrl+K
          </kbd>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden lg:flex items-center gap-4 px-4 py-2 rounded-md glass-card">
          <div className="flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-cyber-400" />
            <span className="text-[11px] text-space-400">GPU</span>
            <span className="text-xs font-mono text-cyber-300">34%</span>
          </div>
          <div className="w-px h-4 bg-space-600" />
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-bio-400" />
            <span className="text-[11px] text-space-400">任务</span>
            <span className="text-xs font-mono text-bio-300">运行中 5</span>
          </div>
        </div>

        <button
          onClick={() => navigate('/tasks/new')}
          className="cyber-button flex items-center gap-2 h-9"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm">新建模拟</span>
        </button>

        <button className="relative w-9 h-9 rounded-md glass-card-hover flex items-center justify-center transition-colors">
          <Bell className="w-4 h-4 text-space-300" />
          {pendingAlerts + unreadNotifs > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-danger-500 text-[9px] font-bold text-white flex items-center justify-center animate-pulse">
              {pendingAlerts + unreadNotifs}
            </span>
          )}
        </button>

        <div className="flex items-center gap-2 pl-4 border-l border-cyber-500/10 cursor-pointer group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyber-500 to-space-600 flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-space-200">{currentUser.name}</p>
            <p className="text-[10px] text-space-500">{UserRoleLabels[currentUser.role]}</p>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-space-500 group-hover:text-space-300 transition-colors" />
        </div>
      </div>
    </header>
  );
}
