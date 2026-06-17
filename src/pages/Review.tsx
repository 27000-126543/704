import { useState } from 'react';
import {
  ClipboardList,
  Settings2,
  History,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ChevronRight,
  ArrowRightLeft,
  Zap,
  Wrench,
  User,
  Clock,
  MessageSquare,
  Lightbulb,
  Sparkles,
  TrendingUp,
  Sun,
  Waves,
  Ruler,
  AlertCircle,
  Check,
  Link,
} from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';
import { useAlertStore } from '../store/useAlertStore';
import { useTaskStore } from '../store/useTaskStore';
import {
  AlertLevel,
  AlertStatus,
  AlertReason,
  AlertReasonLabels,
  AdjustmentTypeLabels,
  AdjustmentType,
  TaskStatus,
} from '../types';
import { formatNumber, formatDateTime, cn } from '../utils/helpers';

type TabType = 'pending' | 'adjustment' | 'log';

const TABS: { key: TabType; label: string; icon: any }[] = [
  { key: 'pending', label: '待复核', icon: ClipboardList },
  { key: 'adjustment', label: '调整方案', icon: Settings2 },
  { key: 'log', label: '调整日志', icon: History },
];

export default function Review() {
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const [reviewComments, setReviewComments] = useState<Record<string, string>>({});
  const [applyMessage, setApplyMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { alerts, updateAlertStatus } = useAlertStore();
  const { adjustmentLogs, addAdjustmentLog, updateTaskStatus, getTaskById, tasks } = useTaskStore();

  const pendingAlerts = alerts.filter(
    (a) => a.status === AlertStatus.PENDING || a.status === AlertStatus.UNDER_REVIEW
  );

  const showMessage = (type: 'success' | 'error', text: string) => {
    setApplyMessage({ type, text });
    setTimeout(() => setApplyMessage(null), 4000);
  };

  const handleReview = (alertId: string, status: AlertStatus) => {
    const comment = reviewComments[alertId] || '';
    updateAlertStatus(alertId, status, comment, 'user_002', '李成像专家');
    setReviewComments({ ...reviewComments, [alertId]: '' });
    if (status === AlertStatus.RESOLVED) {
      setSelectedAlertId(alertId);
      setActiveTab('adjustment');
      showMessage('success', '已通过复核，下方选择调整方案并确认应用');
    } else {
      setSelectedAlertId(null);
      showMessage('error', '已驳回复核');
    }
  };

  const getLinkedAlert = () => {
    if (!selectedAlertId) return null;
    return alerts.find((a) => a.id === selectedAlertId) || null;
  };

  const getLinkedTask = () => {
    const alert = getLinkedAlert();
    if (!alert) return null;
    return getTaskById(alert.taskId) || null;
  };

  const handleApplyAdjustment = (rec: typeof recommendations[0]) => {
    const adjustmentType = rec.type as AdjustmentType;

    const linkedAlert = getLinkedAlert();
    if (!linkedAlert) {
      showMessage('error', '请先在待复核列表中选择并通过一条预警');
      return;
    }

    const task = getLinkedTask();
    if (!task) {
      showMessage('error', '未找到关联任务');
      return;
    }

    addAdjustmentLog({
      taskId: task.id,
      taskName: task.name,
      adjustmentType,
      beforeValue: rec.before,
      afterValue: rec.after,
      reason: rec.reason,
      adjustedBy: '李成像专家',
    });

    updateTaskStatus(
      task.id,
      TaskStatus.PENDING_VALIDATION,
      `参数调整：${AdjustmentTypeLabels[adjustmentType]} ${rec.before} → ${rec.after}，已重新进入待校验队列`
    );

    const { updateTaskProgress } = useTaskStore.getState();
    updateTaskProgress(task.id, 0);

    updateAlertStatus(linkedAlert.id, AlertStatus.RESOLVED, `已应用调整方案：${rec.title}`, 'user_002', '李成像专家');

    setSelectedAlertId(null);
    setActiveTab('log');

    showMessage('success', `${rec.title}已应用：${AdjustmentTypeLabels[adjustmentType]} ${rec.before} → ${rec.after}，任务#${task.id}已回到待校验状态`);
  };

  const recommendations: { type: AdjustmentType; icon: any; title: string; reason: string; affectedChannels: number[] | string; before: string; after: string; expectedImprovement: string; confidence: number }[] = [
    {
      type: 'optrode_spacing',
      icon: Ruler,
      title: '光极间距调整',
      reason: '通道信噪比低于阈值，建议增大间距提升穿透深度',
      affectedChannels: [5, 8, 17, 23],
      before: '30 mm',
      after: '35 mm',
      expectedImprovement: '预计 SNR 提升 15-25%',
      confidence: 0.92,
    },
    {
      type: 'source_power',
      icon: Zap,
      title: '光源功率调整',
      reason: '血氧信号微弱，增大功率增强信号强度',
      affectedChannels: [3, 12, 22],
      before: '8 mW',
      after: '12 mW',
      expectedImprovement: '预计信号幅度提升 30%',
      confidence: 0.87,
    },
    {
      type: 'wavelength',
      icon: Waves,
      title: '波长组合调整',
      reason: '增加波长提高反演精度，添加等吸收点校准',
      affectedChannels: '全通道',
      before: '760, 850 nm',
      after: '735, 805, 850 nm',
      expectedImprovement: '预计反演误差降低 18%',
      confidence: 0.85,
    },
  ];

  return (
    <div className="h-full flex flex-col gap-4">
      {applyMessage && (
        <div
          className={`fixed top-4 right-4 z-50 glass-card px-5 py-3 flex items-center gap-3 animate-fade-in ${
            applyMessage.type === 'success'
              ? 'border-bio-500/50 shadow-[0_0_20px_rgba(0,255,157,0.2)]'
              : 'border-danger-500/50 shadow-[0_0_20px_rgba(255,59,92,0.2)]'
          }`}
        >
          {applyMessage.type === 'success' ? (
            <Check className="w-5 h-5 text-bio-400" />
          ) : (
            <AlertCircle className="w-5 h-5 text-danger-400" />
          )}
          <span className={`text-sm ${applyMessage.type === 'success' ? 'text-bio-300' : 'text-danger-300'}`}>
            {applyMessage.text}
          </span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ClipboardList className="w-7 h-7 text-cyber-400" />
            专家复核中心
          </h1>
          <p className="text-sm text-space-500 mt-1">复核预警信息、调整参数方案与历史记录</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-space-400">
          <User className="w-3.5 h-3.5" />
          <span>当前专家：李成像专家</span>
        </div>
      </div>

      <div className="flex items-center gap-1 glass-card p-1.5 w-fit">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.key;
          const badge =
            tab.key === 'pending' && pendingAlerts.length > 0 ? pendingAlerts.length : null;
          return (
            <button
              key={tab.key}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition-all duration-200',
                active
                  ? 'bg-cyber-500/20 text-cyber-300 border border-cyber-400/40'
                  : 'text-space-400 hover:text-cyber-300 hover:bg-cyber-500/5'
              )}
              onClick={() => setActiveTab(tab.key)}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {badge !== null && (
                <span className="ml-1 px-1.5 py-0.5 rounded bg-danger-500/20 text-danger-400 text-[10px] font-mono min-w-[20px] text-center">
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto pr-1">
        {activeTab === 'pending' && (
          <div className="space-y-3">
            {pendingAlerts.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <CheckCircle2 className="w-12 h-12 text-bio-400 mx-auto mb-3" />
                <p className="text-sm text-space-400">暂无待复核预警</p>
              </div>
            ) : (
              pendingAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={cn(
                    'glass-card p-4 transition-all duration-300',
                    selectedAlertId === alert.id && 'ring-1 ring-cyber-400/50 shadow-glow-cyber'
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-1.5 self-stretch rounded-full"
                      style={{
                        backgroundColor:
                          alert.level === AlertLevel.LEVEL_1
                            ? '#FF8A00'
                            : alert.level === AlertLevel.LEVEL_2
                            ? '#FF3B5C'
                            : '#992438',
                      }}
                    />

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <StatusBadge type="alert-level" value={alert.level} size="md" />
                          <StatusBadge type="alert-status" value={alert.status} size="md" />
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-space-500 font-mono">
                          <Clock className="w-3 h-3" />
                          {formatDateTime(alert.createdAt)}
                        </div>
                      </div>

                      <h3 className="text-base font-semibold text-white mb-1">{alert.taskName}</h3>

                      <div className="flex items-center gap-3 mb-2 text-xs">
                        {alert.channelIndex !== undefined && (
                          <span className="px-2 py-0.5 rounded bg-cyber-500/15 text-cyber-400 font-mono">
                            通道 CH{String(alert.channelIndex).padStart(2, '0')}
                          </span>
                        )}
                        <span className="text-space-400">
                          <AlertTriangle className="w-3 h-3 inline mr-1" />
                          {AlertReasonLabels[alert.reason]}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-3 mb-3">
                        <div className="p-2.5 rounded bg-space-900/50">
                          <p className="text-[10px] text-space-500 mb-1">当前值</p>
                          <p
                            className="font-mono text-lg font-semibold"
                            style={{
                              color:
                                alert.level === AlertLevel.LEVEL_1
                                  ? '#FF8A00'
                                  : alert.level === AlertLevel.LEVEL_2
                                  ? '#FF3B5C'
                                  : '#FF6B85',
                            }}
                          >
                            {formatNumber(alert.value, 2)}
                          </p>
                        </div>
                        <div className="p-2.5 rounded bg-space-900/50">
                          <p className="text-[10px] text-space-500 mb-1">阈值</p>
                          <p className="font-mono text-lg text-space-400">{formatNumber(alert.threshold, 2)}</p>
                        </div>
                        <div className="p-2.5 rounded bg-space-900/50">
                          <p className="text-[10px] text-space-500 mb-1">偏差</p>
                          <p className="font-mono text-lg font-semibold text-danger-400">
                            {alert.value < alert.threshold ? '-' : '+'}
                            {formatNumber(Math.abs(alert.threshold - alert.value), 2)}
                          </p>
                        </div>
                      </div>

                      <p className="text-xs text-space-400 mb-3">{alert.description}</p>

                      {selectedAlertId === alert.id ? (
                        <div className="space-y-3 fade-in">
                          <div>
                            <label className="data-label mb-1.5 block flex items-center gap-1.5">
                              <MessageSquare className="w-3 h-3" />
                              复核意见
                            </label>
                            <textarea
                              className="cyber-input text-sm min-h-[80px] resize-none"
                              placeholder="请输入复核意见..."
                              value={reviewComments[alert.id] || ''}
                              onChange={(e) =>
                                setReviewComments({ ...reviewComments, [alert.id]: e.target.value })
                              }
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              className="px-4 py-2 rounded text-sm font-medium border border-bio-500/50 text-bio-400 hover:bg-bio-500/10 transition-colors flex items-center gap-1.5"
                              onClick={() => handleReview(alert.id, AlertStatus.RESOLVED)}
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              通过
                            </button>
                            <button
                              className="px-4 py-2 rounded text-sm font-medium border border-danger-500/50 text-danger-400 hover:bg-danger-500/10 transition-colors flex items-center gap-1.5"
                              onClick={() => handleReview(alert.id, AlertStatus.REJECTED)}
                            >
                              <XCircle className="w-4 h-4" />
                              驳回
                            </button>
                            <button
                              className="px-4 py-2 rounded text-sm font-medium text-space-400 hover:text-space-300 transition-colors"
                              onClick={() => setSelectedAlertId(null)}
                            >
                              取消
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            className="cyber-button-outline py-1.5 px-3 text-xs flex items-center gap-1.5"
                            onClick={() => setSelectedAlertId(alert.id)}
                          >
                            <Wrench className="w-3.5 h-3.5" />
                            复核处理
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'adjustment' && (
          <div className="space-y-4">
            {(() => {
              const linkedAlert = getLinkedAlert();
              const linkedTask = getLinkedTask();
              return (
                <>
                  {linkedAlert && linkedTask ? (
                    <div className="glass-card p-4 border-cyber-400/40 shadow-glow-cyber">
                      <div className="flex items-center gap-2 mb-2">
                        <Link className="w-4 h-4 text-cyber-400" />
                        <h3 className="text-sm font-semibold text-cyber-300">已关联预警与任务</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <p className="text-[10px] text-space-500 uppercase tracking-wider">预警信息</p>
                          <p className="text-sm font-medium text-white">{AlertReasonLabels[linkedAlert.reason] || linkedAlert.description}</p>
                          <div className="flex items-center gap-2 text-xs text-space-400">
                            <span className="font-mono">{linkedAlert.id}</span>
                            <StatusBadge type="alert-level" value={linkedAlert.level} size="sm" />
                            <StatusBadge type="alert-status" value={linkedAlert.status} size="sm" />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <p className="text-[10px] text-space-500 uppercase tracking-wider">关联任务</p>
                          <p className="text-sm font-medium text-white">{linkedTask.name}</p>
                          <div className="flex items-center gap-2 text-xs text-space-400">
                            <span className="font-mono">{linkedTask.id}</span>
                            <StatusBadge type="task" value={linkedTask.status} size="sm" />
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-space-400 mt-2 pt-2 border-t border-space-700/50">
                        下方选择调整方案并点击"确认应用"，将对 <span className="text-cyber-300 font-medium">{linkedTask.name}</span> 执行参数调整并重新模拟
                      </p>
                    </div>
                  ) : (
                    <div className="glass-card p-4 border-warn-500/40">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-warn-500/15 flex items-center justify-center flex-shrink-0">
                          <AlertTriangle className="w-5 h-5 text-warn-400" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-warn-300 mb-1">尚未选择预警</h3>
                          <p className="text-xs text-space-400">
                            请先回到"待复核"标签页，选择一条预警并点击"通过复核"，通过后调整方案会自动关联到对应的任务
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="glass-card p-4 flex items-start gap-3 border-bio-500/20">
                    <div className="w-10 h-10 rounded-lg bg-bio-500/15 flex items-center justify-center flex-shrink-0">
                      <Lightbulb className="w-5 h-5 text-bio-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-bio-300 mb-1">AI 智能推荐</h3>
                      <p className="text-xs text-space-400">
                        基于历史 128 个相似任务的分析结果，系统自动推荐以下参数调整方案。所有方案均经过模拟验证，预计可有效提升信号质量。
                      </p>
                    </div>
                  </div>
                </>
              );
            })()}

            {recommendations.map((rec, idx) => {
              const Icon = rec.icon;
              return (
                <div key={idx} className="glass-card p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-lg bg-cyber-500/15 flex items-center justify-center flex-shrink-0 border border-cyber-500/30">
                      <Icon className="w-5 h-5 text-cyber-400" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-sm font-semibold text-white mb-0.5">{rec.title}</h3>
                          <p className="text-xs text-space-400">{rec.reason}</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-space-500">置信度</span>
                          <span className="font-mono text-sm text-bio-400 font-semibold">
                            {formatNumber(rec.confidence * 100, 0)}%
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-3 text-[10px]">
                        <span className="text-space-500">影响通道：</span>
                        {Array.isArray(rec.affectedChannels) ? (
                          rec.affectedChannels.map((ch) => (
                            <span
                              key={ch}
                              className="px-1.5 py-0.5 rounded bg-warn-500/15 text-warn-400 font-mono"
                            >
                              CH{String(ch).padStart(2, '0')}
                            </span>
                          ))
                        ) : (
                          <span className="px-1.5 py-0.5 rounded bg-cyber-500/15 text-cyber-400 font-mono">
                            {rec.affectedChannels}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-3 mb-3">
                        <div className="p-3 rounded bg-space-900/60 border border-space-700/50">
                          <p className="text-[10px] text-space-500 mb-1">调整前</p>
                          <p className="font-mono text-base text-space-300">{rec.before}</p>
                        </div>
                        <div className="p-3 rounded bg-cyber-500/5 border border-cyber-500/20 flex items-center justify-center">
                          <ArrowRightLeft className="w-5 h-5 text-cyber-400" />
                        </div>
                        <div className="p-3 rounded bg-bio-500/5 border border-bio-500/30">
                          <p className="text-[10px] text-space-500 mb-1">调整后</p>
                          <p className="font-mono text-base text-bio-400 font-semibold">{rec.after}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs">
                          <TrendingUp className="w-3.5 h-3.5 text-bio-400" />
                          <span className="text-bio-300">{rec.expectedImprovement}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleApplyAdjustment(rec)}
                            className="cyber-button py-1.5 px-3 text-xs flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5" />
                            确认应用
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'log' && (
          <div className="relative">
            <div className="absolute left-[22px] top-2 bottom-2 w-px bg-gradient-to-b from-cyber-500/40 via-cyber-500/20 to-transparent" />

            <div className="space-y-3">
              {adjustmentLogs.length === 0 ? (
                <div className="glass-card p-12 text-center">
                  <History className="w-12 h-12 text-space-500 mx-auto mb-3" />
                  <p className="text-sm text-space-400">暂无调整日志</p>
                </div>
              ) : (
                adjustmentLogs.map((log, idx) => {
                  const typeIcon =
                    log.adjustmentType === 'optrode_spacing'
                      ? Ruler
                      : log.adjustmentType === 'source_power'
                      ? Zap
                      : log.adjustmentType === 'wavelength'
                      ? Waves
                      : Wrench;
                  const TypeIcon = typeIcon;
                  return (
                    <div key={log.id} className="flex gap-4 relative pl-12">
                      <div
                        className={cn(
                          'absolute left-0 w-11 h-11 rounded-lg flex items-center justify-center border-2',
                          idx === 0
                            ? 'bg-cyber-500/20 border-cyber-400/60 shadow-glow-cyber'
                            : 'bg-space-800 border-cyber-500/30'
                        )}
                      >
                        <TypeIcon
                          className={cn('w-5 h-5', idx === 0 ? 'text-cyber-300' : 'text-cyber-500')}
                        />
                      </div>

                      <div className="flex-1 glass-card p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-sm font-semibold text-white mb-0.5">
                              {AdjustmentTypeLabels[log.adjustmentType]} 调整
                            </h3>
                            <div className="flex items-center gap-2 text-[10px] text-space-500">
                              <User className="w-3 h-3" />
                              <span>{log.adjustedBy}</span>
                              <span>·</span>
                              <Clock className="w-3 h-3" />
                              <span className="font-mono">{formatDateTime(log.createdAt)}</span>
                              <span>·</span>
                              <span className="font-mono">任务 {log.taskId}</span>
                              <span>·</span>
                              <span>{log.taskName}</span>
                            </div>
                          </div>
                          {idx === 0 && (
                            <span className="px-2 py-0.5 rounded bg-cyber-500/20 text-cyber-400 text-[10px] font-medium">
                              最新
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-3 gap-3 mb-2">
                          <div className="p-2 rounded bg-space-900/50">
                            <p className="text-[10px] text-space-500 mb-0.5">调整前</p>
                            <p className="font-mono text-sm text-space-300">{log.beforeValue}</p>
                          </div>
                          <div className="p-2 rounded bg-cyber-500/5 flex items-center justify-center">
                            <ChevronRight className="w-4 h-4 text-cyber-400" />
                          </div>
                          <div className="p-2 rounded bg-bio-500/5">
                            <p className="text-[10px] text-space-500 mb-0.5">调整后</p>
                            <p className="font-mono text-sm text-bio-400 font-semibold">{log.afterValue}</p>
                          </div>
                        </div>

                        <p className="text-xs text-space-400">{log.reason}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
