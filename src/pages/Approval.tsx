import { useState, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import {
  ClipboardCheck,
  History,
  AlertTriangle,
  Bell,
  Check,
  X,
  MessageSquare,
  Shield,
  ShieldAlert,
  Clock,
  Pause,
  Play,
  Eye,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';
import { useReportStore } from '../store/useReportStore';
import { useTaskStore } from '../store/useTaskStore';
import { useSimulationStore } from '../store/useSimulationStore';
import {
  ApprovalStatus,
  ApprovalLevel,
  ApprovalLevelLabels,
} from '../types';
import { formatDateTime, getRelativeTime } from '../utils/helpers';

type TabKey = 'pending' | 'history' | 'deviation' | 'notification';

export default function Approval() {
  const {
    approvals,
    getApprovalsByStatus,
    getApprovalsByLevel,
    updateApprovalStatus,
    deviationRecords,
    getDeviationsByHeadModel,
    checkDeviationThreshold,
    chiefNotifications,
    markNotificationRead,
  } = useReportStore();
  const { tasks } = useTaskStore();
  const {
    pausedHeadModels,
    toggleHeadModelPause,
    isHeadModelPaused,
  } = useSimulationStore();

  const [activeTab, setActiveTab] = useState<TabKey>('pending');
  const [approvalComments, setApprovalComments] = useState<Record<string, string>>({});
  const [expandedApproval, setExpandedApproval] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showNotification = (type: 'success' | 'error', text: string) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 4000);
  };

  const pendingApprovals = useMemo(() => getApprovalsByStatus(ApprovalStatus.PENDING), [getApprovalsByStatus]);
  const approvedApprovals = useMemo(() => getApprovalsByStatus(ApprovalStatus.APPROVED), [getApprovalsByStatus]);
  const rejectedApprovals = useMemo(() => getApprovalsByStatus(ApprovalStatus.REJECTED), [getApprovalsByStatus]);
  const historyApprovals = useMemo(() => [...approvedApprovals, ...rejectedApprovals].sort(
    (a, b) => new Date(b.decidedAt || b.createdAt).getTime() - new Date(a.decidedAt || a.createdAt).getTime()
  ), [approvedApprovals, rejectedApprovals]);

  const uniqueHeadModels = useMemo(() => {
    const map = new Map<string, { id: string; name: string }>();
    deviationRecords.forEach((d) => {
      if (!map.has(d.headModelId)) {
        map.set(d.headModelId, { id: d.headModelId, name: d.headModelName });
      }
    });
    return Array.from(map.values());
  }, [deviationRecords]);

  const unreadCount = chiefNotifications.filter((n) => n.status === 'unread').length;

  const handleApprove = (approvalId: string) => {
    updateApprovalStatus(
      approvalId,
      ApprovalStatus.APPROVED,
      'user_003',
      '王审批',
      approvalComments[approvalId] || '审批通过'
    );
    setApprovalComments((prev) => ({ ...prev, [approvalId]: '' }));
  };

  const handleReject = (approvalId: string) => {
    updateApprovalStatus(
      approvalId,
      ApprovalStatus.REJECTED,
      'user_003',
      '王审批',
      approvalComments[approvalId] || '审批驳回'
    );
    setApprovalComments((prev) => ({ ...prev, [approvalId]: '' }));
  };

  const handleTogglePause = (headModelId: string, headModelName: string) => {
    const isCurrentlyPaused = isHeadModelPaused(headModelId);
    toggleHeadModelPause(headModelId);
    const willPause = !isCurrentlyPaused;
    showNotification(
      'success',
      `${headModelName} 已${willPause ? '暂停' : '恢复'}，新建任务将${willPause ? '不可选择' : '可以选择'}该头模`
    );
  };

  const tabs: { key: TabKey; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number }[] = [
    { key: 'pending', label: '待审批', icon: ClipboardCheck, badge: pendingApprovals.length },
    { key: 'history', label: '审批记录', icon: History },
    { key: 'deviation', label: '偏差监控', icon: AlertTriangle },
    { key: 'notification', label: '通知中心', icon: Bell, badge: unreadCount },
  ];

  const deviationTrendOption = (headModelId: string) => {
    const deviations = getDeviationsByHeadModel(headModelId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    return {
      backgroundColor: 'transparent',
      grid: { left: 40, right: 20, top: 20, bottom: 30 },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(15, 31, 56, 0.95)',
        borderColor: '#00D4FF40',
        textStyle: { color: '#C8E6FF', fontFamily: 'JetBrains Mono' },
      },
      xAxis: {
        type: 'category',
        data: deviations.map((_, i) => `#${i + 1}`),
        axisLine: { lineStyle: { color: '#00D4FF30' } },
        axisLabel: { color: '#2A4F7A', fontSize: 10 },
      },
      yAxis: {
        type: 'value',
        name: 'mm',
        nameTextStyle: { color: '#2A4F7A', fontSize: 10 },
        axisLine: { lineStyle: { color: '#00D4FF30' } },
        axisLabel: { color: '#2A4F7A', fontFamily: 'JetBrains Mono', fontSize: 10 },
        splitLine: { lineStyle: { color: '#00D4FF10' } },
      },
      series: [
        {
          type: 'line',
          data: deviations.map((d) => d.deviationMm),
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          lineStyle: { color: '#FF3B5C', width: 2 },
          itemStyle: { color: '#FF3B5C' },
          areaStyle: { color: 'rgba(255, 59, 92, 0.1)' },
          markLine: {
            silent: true,
            lineStyle: { color: '#FF8A00', type: 'dashed' },
            data: [{ yAxis: 5, label: { formatter: '阈值5mm', color: '#FF8A00', fontSize: 10 } }],
          },
        },
      ],
    };
  };

  return (
    <div className="space-y-6">
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 glass-card px-5 py-3 flex items-center gap-3 animate-fade-in ${
            notification.type === 'success'
              ? 'border-bio-500/50 shadow-[0_0_20px_rgba(0,255,157,0.2)]'
              : 'border-danger-500/50 shadow-[0_0_20px_rgba(255,59,92,0.2)]'
          }`}
        >
          {notification.type === 'success' ? (
            <Check className="w-5 h-5 text-bio-400" />
          ) : (
            <AlertCircle className="w-5 h-5 text-danger-400" />
          )}
          <span className={`text-sm ${notification.type === 'success' ? 'text-bio-300' : 'text-danger-300'}`}>
            {notification.text}
          </span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-cyber-300 flex items-center gap-3">
            <ClipboardCheck className="w-7 h-7" />
            审批流程中心
          </h1>
          <p className="text-sm text-space-500 mt-1">模拟任务审批、偏差监控与通知管理</p>
        </div>
      </div>

      <div className="glass-card">
        <div className="flex border-b border-cyber-500/10">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-3.5 flex items-center gap-2 text-sm font-medium border-b-2 transition-all ${
                activeTab === tab.key
                  ? 'border-cyber-400 text-cyber-300 bg-cyber-500/5'
                  : 'border-transparent text-space-500 hover:text-space-300 hover:bg-space-800/30'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                  activeTab === tab.key ? 'bg-cyber-400 text-space-900' : 'bg-warn-500 text-space-900'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="p-5">
          {activeTab === 'pending' && (
            <div className="space-y-4">
              {pendingApprovals.length === 0 ? (
                <div className="py-12 text-center text-space-500">
                  <ClipboardCheck className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">暂无待审批任务</p>
                </div>
              ) : (
                pendingApprovals.map((approval) => {
                  const task = tasks.find((t) => t.id === approval.taskId);
                  const isExpanded = expandedApproval === approval.id;
                  const isLevel2 = approval.level === ApprovalLevel.LEVEL_2;
                  return (
                    <div
                      key={approval.id}
                      className={`glass-card p-4 transition-all ${
                        isLevel2 ? 'border-warn-500/40' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${
                            isLevel2
                              ? 'bg-warn-500/15 text-warn-400'
                              : 'bg-cyber-500/15 text-cyber-400'
                          }`}>
                            {isLevel2 ? (
                              <ShieldAlert className="w-5 h-5" />
                            ) : (
                              <Shield className="w-5 h-5" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <StatusBadge
                                type="approval"
                                value={approval.status}
                                size="md"
                              />
                              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                isLevel2
                                  ? 'bg-warn-500/20 text-warn-400 border border-warn-500/30'
                                  : 'bg-cyber-500/20 text-cyber-300 border border-cyber-500/30'
                              }`}>
                                {ApprovalLevelLabels[approval.level]}
                              </span>
                              <span className="text-xs text-space-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {getRelativeTime(approval.createdAt)}
                              </span>
                            </div>
                            <h3 className="text-cyber-200 font-medium mb-0.5">{approval.taskName}</h3>
                            <div className="flex items-center gap-4 text-xs text-space-500">
                              <span className="font-mono">{approval.taskId}</span>
                              <span>通道数: {task?.channelCount || '-'}</span>
                              <span>提交人: {task?.userName || '-'}</span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => setExpandedApproval(isExpanded ? null : approval.id)}
                          className="text-space-500 hover:text-cyber-400 transition-colors"
                        >
                          <ChevronRight className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                        </button>
                      </div>

                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-cyber-500/10 space-y-4">
                          <div className="grid grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="data-label mb-1">头模</p>
                              <p className="font-mono text-cyber-300 text-xs">{task?.headModelName || '-'}</p>
                            </div>
                            <div>
                              <p className="data-label mb-1">布局</p>
                              <p className="font-mono text-cyber-300 text-xs">{task?.layoutName || '-'}</p>
                            </div>
                            <div>
                              <p className="data-label mb-1">平均 SNR</p>
                              <p className="font-mono text-bio-400 text-xs">{task?.avgSNR?.toFixed(1) || '-'} dB</p>
                            </div>
                            <div>
                              <p className="data-label mb-1">SNR 阈值</p>
                              <p className="font-mono text-warn-400 text-xs">{task?.snrThreshold || '-'} dB</p>
                            </div>
                          </div>

                          <div>
                            <label className="data-label block mb-2 flex items-center gap-1.5">
                              <MessageSquare className="w-3 h-3" />
                              审批意见
                            </label>
                            <textarea
                              value={approvalComments[approval.id] || ''}
                              onChange={(e) =>
                                setApprovalComments((prev) => ({
                                  ...prev,
                                  [approval.id]: e.target.value,
                                }))
                              }
                              placeholder="请输入审批意见（可选）"
                              className="cyber-input h-20 resize-none text-sm"
                            />
                          </div>

                          <div className="flex justify-end gap-3">
                            <button
                              onClick={() => handleReject(approval.id)}
                              className="px-5 py-2 bg-danger-500/20 text-danger-400 border border-danger-500/40 rounded font-medium text-sm flex items-center gap-2 hover:bg-danger-500/30 transition-all"
                            >
                              <X className="w-4 h-4" />
                              驳回
                            </button>
                            <button
                              onClick={() => handleApprove(approval.id)}
                              className="px-5 py-2 bg-bio-500/20 text-bio-400 border border-bio-500/40 rounded font-medium text-sm flex items-center gap-2 hover:bg-bio-500/30 transition-all"
                            >
                              <Check className="w-4 h-4" />
                              通过
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-3">
              {historyApprovals.length === 0 ? (
                <div className="py-12 text-center text-space-500">
                  <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">暂无审批记录</p>
                </div>
              ) : (
                historyApprovals.map((approval) => (
                  <div
                    key={approval.id}
                    className="glass-card p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <StatusBadge type="approval" value={approval.status} size="md" />
                      <div>
                        <h3 className="text-cyber-200 font-medium text-sm">{approval.taskName}</h3>
                        <div className="flex items-center gap-3 text-xs text-space-500 mt-0.5">
                          <span className="font-mono">{approval.taskId}</span>
                          <span>{ApprovalLevelLabels[approval.level]}</span>
                          <span>审批人: {approval.approverName || '-'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-space-500">
                        {approval.decidedAt ? formatDateTime(approval.decidedAt) : '-'}
                      </p>
                      {approval.comment && (
                        <p className="text-xs text-space-400 mt-1 max-w-xs truncate">{approval.comment}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'deviation' && (
            <div className="space-y-5">
              {uniqueHeadModels.length === 0 ? (
                <div className="py-12 text-center text-space-500">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">暂无偏差记录</p>
                </div>
              ) : (
                uniqueHeadModels.map((hm) => {
                  const deviations = getDeviationsByHeadModel(hm.id)
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                  const isOverThreshold = checkDeviationThreshold(hm.id);
                  const isPaused = isHeadModelPaused(hm.id);

                  return (
                    <div
                      key={hm.id}
                      className={`glass-card p-5 ${
                        isOverThreshold ? 'border-danger-500/50 shadow-[0_0_20px_rgba(255,59,92,0.15)]' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            isOverThreshold
                              ? 'bg-danger-500/20 text-danger-400'
                              : 'bg-cyber-500/15 text-cyber-400'
                          }`}>
                            <AlertTriangle className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-cyber-200 font-medium">{hm.name}</h3>
                              {isOverThreshold && (
                                <span className="px-2 py-0.5 bg-danger-500/20 text-danger-400 border border-danger-500/40 rounded text-[10px] font-semibold flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" />
                                  连续3次超阈值
                                </span>
                              )}
                              {isPaused && (
                                <span className="px-2 py-0.5 bg-warn-500/20 text-warn-400 border border-warn-500/40 rounded text-[10px] font-semibold flex items-center gap-1">
                                  <Pause className="w-3 h-3" />
                                  已暂停
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-space-500 mt-0.5">
                              共 {deviations.length} 条偏差记录
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleTogglePause(hm.id, hm.name)}
                          className={`px-4 py-2 rounded text-sm font-medium flex items-center gap-2 transition-all ${
                            isPaused
                              ? 'bg-bio-500/20 text-bio-400 border border-bio-500/40 hover:bg-bio-500/30'
                              : 'bg-warn-500/20 text-warn-400 border border-warn-500/40 hover:bg-warn-500/30'
                          }`}
                        >
                          {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                          {isPaused ? '恢复任务' : '暂停新任务'}
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-5">
                        <div>
                          <ReactECharts option={deviationTrendOption(hm.id)} style={{ height: 180 }} />
                        </div>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {deviations.slice(0, 5).map((d) => (
                            <div
                              key={d.id}
                              className={`p-2.5 rounded border text-xs ${
                                d.deviationMm > 5
                                  ? 'bg-danger-500/5 border-danger-500/20'
                                  : 'bg-space-900/50 border-cyber-500/10'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-mono text-cyber-300">{d.taskId}</span>
                                <span className={`font-mono font-bold ${
                                  d.deviationMm > 5 ? 'text-danger-400' : 'text-bio-400'
                                }`}>
                                  {d.deviationMm.toFixed(1)} mm
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-space-500">
                                <span className="truncate">{d.taskName}</span>
                                <span>{getRelativeTime(d.createdAt)}</span>
                              </div>
                              <p className="text-space-400 mt-0.5">激活区: {d.activationRegion}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === 'notification' && (
            <div className="space-y-3">
              {chiefNotifications.length === 0 ? (
                <div className="py-12 text-center text-space-500">
                  <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">暂无通知</p>
                </div>
              ) : (
                chiefNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`glass-card p-4 cursor-pointer transition-all ${
                      notif.status === 'unread'
                        ? 'border-cyber-500/40 bg-cyber-500/5'
                        : 'hover:border-cyber-500/20'
                    }`}
                    onClick={() => notif.status === 'unread' && markNotificationRead(notif.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        notif.type === 'deviation'
                          ? 'bg-danger-500/15 text-danger-400'
                          : notif.type === 'urgent'
                            ? 'bg-warn-500/15 text-warn-400'
                            : 'bg-cyber-500/15 text-cyber-400'
                      }`}>
                        {notif.type === 'deviation' ? (
                          <AlertTriangle className="w-4 h-4" />
                        ) : notif.type === 'urgent' ? (
                          <Bell className="w-4 h-4" />
                        ) : (
                          <Bell className="w-4 h-4" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-cyber-200 font-medium text-sm">{notif.title}</h3>
                          {notif.status === 'unread' && (
                            <span className="w-2 h-2 rounded-full bg-cyber-400 breathing-glow" />
                          )}
                        </div>
                        <p className="text-xs text-space-400 leading-relaxed mb-2">{notif.content}</p>
                        <div className="flex items-center justify-between text-[11px] text-space-500">
                          <span>{getRelativeTime(notif.createdAt)}</span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {notif.status === 'unread' ? '点击标记已读' : '已读'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
