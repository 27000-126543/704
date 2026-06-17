import { useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Brain,
  LayoutGrid,
  Signal,
  Clock,
  User,
  Calendar,
  AlertTriangle,
  Zap,
  Waves,
  Target,
  ChevronRight,
  Activity,
  FileText,
} from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';
import { ProgressRing } from '../components/common/ProgressRing';
import { useTaskStore } from '../store/useTaskStore';
import { useAlertStore } from '../store/useAlertStore';
import { useSimulationStore } from '../store/useSimulationStore';
import {
  TaskStatus,
  TaskStatusLabels,
  TaskStatusColors,
  DEFAULT_BRAIN_REGIONS,
  AlertReasonLabels,
  AlertLevelLabels,
  AlertLevel,
} from '../types';
import { formatDateTime, formatNumber, getRelativeTime } from '../utils/helpers';

export default function TaskDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getTaskById } = useTaskStore();
  const { alerts } = useAlertStore();
  const { layouts } = useSimulationStore();

  const task = id ? getTaskById(id) : undefined;

  const taskAlerts = useMemo(() => {
    if (!task) return [];
    return alerts.filter((a) => a.taskId === task.id);
  }, [task, alerts]);

  const taskLayout = useMemo(() => {
    if (!task) return undefined;
    return layouts.find((l) => l.id === task.layoutId);
  }, [task, layouts]);

  const activeRegions = useMemo(() => {
    if (!taskLayout) return [];
    const regionSet = new Set<string>();
    taskLayout.optrodes.forEach((o) => {
      if (o.brainRegion) regionSet.add(o.brainRegion);
    });
    taskLayout.channels.forEach((c) => {
      if (c.brainRegion) regionSet.add(c.brainRegion);
    });
    return DEFAULT_BRAIN_REGIONS.filter((r) =>
      Array.from(regionSet).some((name) => name.includes(r.abbreviation) || r.name.includes(name))
    );
  }, [taskLayout]);

  if (!task) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-space-500">
        <FileText className="w-16 h-16 mb-4 opacity-30" />
        <p className="text-lg mb-2">任务不存在</p>
        <p className="text-sm mb-6">ID: {id}</p>
        <button onClick={() => navigate('/tasks')} className="cyber-button-outline">
          返回任务列表
        </button>
      </div>
    );
  }

  const statusColor = TaskStatusColors[task.status];

  const getAlertLevelColor = (level: AlertLevel) => {
    switch (level) {
      case AlertLevel.LEVEL_1:
        return 'bg-warn-500/15 text-warn-400 border-warn-500/30';
      case AlertLevel.LEVEL_2:
        return 'bg-danger-500/15 text-danger-400 border-danger-500/30';
      case AlertLevel.LEVEL_3:
        return 'bg-danger-700/30 text-danger-400 border-danger-700/50';
    }
  };

  return (
    <div className="space-y-5 fade-in">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/tasks')}
          className="p-2 rounded-md text-space-400 hover:text-cyber-300 hover:bg-cyber-500/10 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-xs text-space-500 mb-1">
            <Link to="/tasks" className="hover:text-cyber-400 transition-colors">任务管理</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-space-400">任务详情</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white truncate">{task.name}</h1>
            <StatusBadge type="task" value={task.status} size="md" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        <div className="lg:col-span-1 space-y-5">
          <div className="glass-card p-6 flex flex-col items-center">
            <ProgressRing
              progress={task.progress}
              size={120}
              strokeWidth={10}
              color={statusColor}
              showLabel={true}
            />
            <p className="text-sm text-space-400 mt-3">任务进度</p>
            <p className="text-xs text-space-500 font-mono mt-1">ID: {task.id}</p>
          </div>

          <div className="glass-card p-5 space-y-4">
            <h3 className="text-sm font-semibold text-cyber-300 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              基本信息
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Brain className="w-4 h-4 text-space-500 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-space-500 uppercase tracking-wider">头模</p>
                  <p className="text-sm text-white truncate">{task.headModelName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <LayoutGrid className="w-4 h-4 text-space-500 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-space-500 uppercase tracking-wider">布局</p>
                  <p className="text-sm text-white truncate">{task.layoutName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-space-500 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-space-500 uppercase tracking-wider">创建者</p>
                  <p className="text-sm text-white truncate">{task.userName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-space-500 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-space-500 uppercase tracking-wider">创建时间</p>
                  <p className="text-sm text-white font-mono text-xs">{formatDateTime(task.createdAt)}</p>
                </div>
              </div>
              {task.completedAt && (
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-space-500 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-space-500 uppercase tracking-wider">完成时间</p>
                    <p className="text-sm text-white font-mono text-xs">{formatDateTime(task.completedAt)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="glass-card p-5 space-y-4">
            <h3 className="text-sm font-semibold text-cyber-300 flex items-center gap-2">
              <Signal className="w-4 h-4" />
              性能指标
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-space-400">通道数量</span>
                <span className="font-mono text-sm text-cyber-400">{task.channelCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-space-400">平均 SNR</span>
                <span className="font-mono text-sm text-bio-400">
                  {task.avgSNR !== undefined ? `${formatNumber(task.avgSNR, 1)} dB` : '--'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-space-400">收敛次数</span>
                <span className="font-mono text-sm text-warn-400">{task.convergenceCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-space-400">SNR 阈值</span>
                <span className="font-mono text-sm text-space-300">{task.snrThreshold} dB</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-5">
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-cyber-300 flex items-center gap-2 mb-4">
              <Settings2 className="w-4 h-4" />
              参数配置
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-space-900/40 rounded-lg p-4 border border-cyber-500/10">
                <div className="flex items-center gap-2 mb-2">
                  <Signal className="w-4 h-4 text-cyber-400" />
                  <span className="text-xs text-space-400">SNR 阈值</span>
                </div>
                <p className="text-lg font-mono font-bold text-cyber-400">{task.snrThreshold} dB</p>
              </div>
              <div className="bg-space-900/40 rounded-lg p-4 border border-cyber-500/10">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-warn-400" />
                  <span className="text-xs text-space-400">光源功率</span>
                </div>
                <p className="text-lg font-mono font-bold text-warn-400">
                  {taskLayout?.sourcePower || 5} mW
                </p>
              </div>
              <div className="bg-space-900/40 rounded-lg p-4 border border-cyber-500/10">
                <div className="flex items-center gap-2 mb-2">
                  <Waves className="w-4 h-4 text-bio-400" />
                  <span className="text-xs text-space-400">波长组合</span>
                </div>
                <p className="text-sm font-mono font-bold text-bio-400">
                  {taskLayout?.wavelengths?.map((w) => `${w}nm`).join(' / ') || '--'}
                </p>
              </div>
              <div className="bg-space-900/40 rounded-lg p-4 border border-cyber-500/10">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-purple-400" />
                  <span className="text-xs text-space-400">通道数</span>
                </div>
                <p className="text-lg font-mono font-bold text-purple-400">{task.channelCount}</p>
              </div>
            </div>
            {task.description && (
              <div className="mt-4 pt-4 border-t border-cyber-500/10">
                <p className="text-xs text-space-400 mb-2">任务描述</p>
                <p className="text-sm text-space-300">{task.description}</p>
              </div>
            )}
          </div>

          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-cyber-300 flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4" />
              状态时间线
            </h3>
            <div className="relative">
              <div className="absolute left-3 top-2 bottom-2 w-px bg-gradient-to-b from-cyber-500/60 via-cyber-500/20 to-cyber-500/0" />
              <div className="space-y-4">
                {task.statusHistory.slice().reverse().map((entry, index) => {
                  const color = TaskStatusColors[entry.status];
                  const isFirst = index === 0;
                  return (
                    <div key={entry.id} className="relative flex gap-4">
                      <div
                        className="relative z-10 w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                        style={{
                          backgroundColor: `${color}20`,
                          border: `2px solid ${color}`,
                          boxShadow: isFirst ? `0 0 12px ${color}60` : 'none',
                        }}
                      >
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                      </div>
                      <div className="flex-1 pb-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="text-sm font-semibold"
                            style={{ color }}
                          >
                            {TaskStatusLabels[entry.status]}
                          </span>
                          {isFirst && (
                            <span className="px-1.5 py-0.5 text-[10px] rounded bg-cyber-500/20 text-cyber-300">
                              当前
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-space-400 mb-1">{entry.message}</p>
                        <p className="text-[11px] text-space-500 font-mono">
                          {formatDateTime(entry.timestamp)} · {getRelativeTime(entry.timestamp)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-cyber-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  关联预警
                </h3>
                <span className="text-xs text-space-500">{taskAlerts.length} 条</span>
              </div>
              {taskAlerts.length === 0 ? (
                <div className="text-center py-8 text-space-500">
                  <AlertTriangle className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">暂无预警信息</p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                  {taskAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="p-3 rounded-md bg-space-900/40 border border-cyber-500/10 hover:border-cyber-500/25 transition-all"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <p className="text-xs font-medium text-white truncate flex-1">
                          {AlertReasonLabels[alert.reason]}
                        </p>
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border shrink-0 ${getAlertLevelColor(
                            alert.level
                          )}`}
                        >
                          {AlertLevelLabels[alert.level]}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-1.5">
                        {alert.channelIndex !== undefined && (
                          <span className="text-xs text-cyber-400 font-mono">
                            通道 {alert.channelIndex}
                          </span>
                        )}
                        <span className="text-xs text-space-500">
                          {formatNumber(alert.value, 2)} / {formatNumber(alert.threshold, 2)}
                        </span>
                      </div>
                      <p className="text-[11px] text-space-500 font-mono">
                        {getRelativeTime(alert.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-cyber-300 flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  激活脑区
                </h3>
                <span className="text-xs text-space-500">{activeRegions.length} 个区域</span>
              </div>
              {activeRegions.length === 0 ? (
                <div className="text-center py-8 text-space-500">
                  <Brain className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">暂无激活区域信息</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {activeRegions.map((region) => (
                    <div
                      key={region.id}
                      className="flex items-center gap-2.5 p-2.5 rounded-md bg-space-900/40 border border-cyber-500/10"
                    >
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{
                          backgroundColor: region.color,
                          boxShadow: `0 0 8px ${region.color}60`,
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-medium text-white">{region.name}</span>
                          <span className="text-[10px] font-mono text-space-500">
                            {region.abbreviation}
                          </span>
                        </div>
                        <p className="text-[10px] text-space-500">{region.lobe}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Settings2({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
