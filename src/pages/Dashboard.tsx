import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import {
  CheckCircle2,
  Signal,
  GitBranch,
  AlertTriangle,
  Radar,
  TrendingUp,
  Bell,
  MessageSquare,
  Calendar,
} from 'lucide-react';
import { StatCard } from '../components/common/StatCard';
import { useTaskStore } from '../store/useTaskStore';
import { useAlertStore } from '../store/useAlertStore';
import { useReportStore } from '../store/useReportStore';
import type {
  Alert,
  ChiefNotification,
  DailyStats,
  PerformanceMetrics,
} from '../types';
import {
  AlertLevel,
  AlertLevelLabels,
  AlertReasonLabels,
  TaskStatus,
} from '../types';
import {
  formatDateTime,
  getRelativeTime,
} from '../utils/helpers';

export default function Dashboard() {
  const { tasks, getTasksByStatus } = useTaskStore();
  const { alerts } = useAlertStore();
  const { dailyStats, performance, chiefNotifications } = useReportStore();

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const todayCompletionRate = useMemo(() => {
    const completedStatuses: TaskStatus[] = [
      TaskStatus.COMPLETED,
      TaskStatus.APPROVED,
    ];
    const completedCount = tasks.filter((t) =>
      completedStatuses.includes(t.status)
    ).length;
    return tasks.length > 0 ? completedCount / tasks.length : 0;
  }, [tasks]);

  const avgSNR = useMemo(() => {
    const completedTasks = getTasksByStatus(TaskStatus.COMPLETED).filter(
      (t) => t.avgSNR !== undefined
    );
    if (completedTasks.length === 0) return 25.6;
    const sum = completedTasks.reduce(
      (acc, t) => acc + (t.avgSNR || 0),
      0
    );
    return sum / completedTasks.length;
  }, [getTasksByStatus]);

  const todayConvergenceCount = useMemo(() => {
    return dailyStats.length > 0
      ? dailyStats[dailyStats.length - 1].convergenceCount
      : 5;
  }, [dailyStats]);

  const todayAlertCount = useMemo(() => {
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    return alerts.filter(
      (a) => new Date(a.createdAt).getTime() >= startOfDay.getTime()
    ).length;
  }, [alerts, today]);

  const radarOption = useMemo(() => {
    const p: PerformanceMetrics = performance;
    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(10, 22, 40, 0.95)',
        borderColor: 'rgba(0, 212, 255, 0.3)',
        textStyle: { color: '#C8E6FF' },
      },
      radar: {
        indicator: [
          { name: '精度', max: 1 },
          { name: '效率', max: 1 },
          { name: '稳定性', max: 1 },
          { name: '收敛性', max: 1 },
          { name: '信噪比', max: 1 },
          { name: '覆盖率', max: 1 },
        ],
        shape: 'polygon',
        splitNumber: 4,
        axisName: {
          color: '#8FB8DE',
          fontSize: 12,
          fontFamily: 'Noto Sans SC',
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(0, 212, 255, 0.15)',
          },
        },
        splitArea: {
          areaStyle: {
            color: [
              'rgba(0, 212, 255, 0.02)',
              'rgba(0, 212, 255, 0.04)',
              'rgba(0, 212, 255, 0.06)',
              'rgba(0, 212, 255, 0.08)',
            ],
          },
        },
        axisLine: {
          lineStyle: {
            color: 'rgba(0, 212, 255, 0.25)',
          },
        },
      },
      series: [
        {
          name: '系统性能',
          type: 'radar',
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: {
            color: '#00D4FF',
            width: 2,
            shadowColor: 'rgba(0, 212, 255, 0.5)',
            shadowBlur: 10,
          },
          itemStyle: {
            color: '#00D4FF',
            borderColor: '#fff',
            borderWidth: 1,
          },
          areaStyle: {
            color: {
              type: 'radial',
              x: 0.5,
              y: 0.5,
              r: 0.8,
              colorStops: [
                { offset: 0, color: 'rgba(0, 212, 255, 0.4)' },
                { offset: 1, color: 'rgba(0, 212, 255, 0.05)' },
              ],
            },
          },
          data: [
            {
              value: [
                p.accuracy,
                p.efficiency,
                p.stability,
                p.convergence,
                p.snr,
                p.coverage,
              ],
              name: '当前性能',
            },
          ],
        },
      ],
    };
  }, [performance]);

  const trendOption = useMemo(() => {
    const stats: DailyStats[] = dailyStats;
    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(10, 22, 40, 0.95)',
        borderColor: 'rgba(0, 212, 255, 0.3)',
        textStyle: { color: '#C8E6FF' },
        axisPointer: {
          type: 'cross',
          crossStyle: { color: 'rgba(0, 212, 255, 0.3)' },
        },
      },
      legend: {
        data: ['任务总数', '完成任务数', '完成率'],
        textStyle: { color: '#8FB8DE', fontSize: 12 },
        top: 0,
        right: 10,
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '18%',
        containLabel: true,
      },
      xAxis: [
        {
          type: 'category',
          data: stats.map((s) => s.date),
          axisPointer: { type: 'shadow' },
          axisLine: { lineStyle: { color: 'rgba(0, 212, 255, 0.3)' } },
          axisLabel: { color: '#8FB8DE', fontSize: 11 },
        },
      ],
      yAxis: [
        {
          type: 'value',
          name: '任务数',
          nameTextStyle: { color: '#8FB8DE', fontSize: 11 },
          axisLine: { lineStyle: { color: 'rgba(0, 212, 255, 0.3)' } },
          axisLabel: { color: '#8FB8DE', fontSize: 11 },
          splitLine: { lineStyle: { color: 'rgba(0, 212, 255, 0.1)' } },
          minInterval: 1,
        },
        {
          type: 'value',
          name: '完成率',
          nameTextStyle: { color: '#8FB8DE', fontSize: 11 },
          axisLine: { lineStyle: { color: 'rgba(0, 255, 157, 0.3)' } },
          axisLabel: {
            color: '#8FB8DE',
            fontSize: 11,
            formatter: (value: number) => `${(value * 100).toFixed(0)}%`,
          },
          splitLine: { show: false },
          min: 0,
          max: 1,
        },
      ],
      series: [
        {
          name: '任务总数',
          type: 'bar',
          data: stats.map((s) => s.totalTasks),
          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(0, 212, 255, 0.8)' },
                { offset: 1, color: 'rgba(0, 212, 255, 0.2)' },
              ],
            },
            borderRadius: [4, 4, 0, 0],
          },
          barWidth: '28%',
        },
        {
          name: '完成任务数',
          type: 'bar',
          data: stats.map((s) => s.completedTasks),
          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(0, 255, 157, 0.8)' },
                { offset: 1, color: 'rgba(0, 255, 157, 0.2)' },
              ],
            },
            borderRadius: [4, 4, 0, 0],
          },
          barWidth: '28%',
        },
        {
          name: '完成率',
          type: 'line',
          yAxisIndex: 1,
          data: stats.map((s) => s.completionRate),
          smooth: true,
          symbol: 'circle',
          symbolSize: 7,
          lineStyle: {
            color: '#FFA64D',
            width: 2.5,
            shadowColor: 'rgba(255, 166, 77, 0.5)',
            shadowBlur: 8,
          },
          itemStyle: {
            color: '#FFA64D',
            borderColor: '#fff',
            borderWidth: 1.5,
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(255, 166, 77, 0.2)' },
                { offset: 1, color: 'rgba(255, 166, 77, 0)' },
              ],
            },
          },
        },
      ],
    };
  }, [dailyStats]);

  const sortedAlerts = useMemo(() => {
    return [...alerts]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 6);
  }, [alerts]);

  const sortedNotifications = useMemo(() => {
    return [...chiefNotifications].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [chiefNotifications]);

  const getAlertLevelStyle = (level: AlertLevel) => {
    switch (level) {
      case AlertLevel.LEVEL_1:
        return 'bg-warn-500/15 text-warn-400 border-warn-500/30';
      case AlertLevel.LEVEL_2:
        return 'bg-danger-500/15 text-danger-400 border-danger-500/30';
      case AlertLevel.LEVEL_3:
        return 'bg-danger-700/30 text-danger-400 border-danger-700/50';
      default:
        return 'bg-space-700/50 text-space-400 border-space-600/30';
    }
  };

  const getNotificationIcon = (type: ChiefNotification['type']) => {
    switch (type) {
      case 'deviation':
        return <AlertTriangle className="w-4 h-4 text-danger-400" />;
      case 'urgent':
        return <Bell className="w-4 h-4 text-warn-400" />;
      case 'system':
      default:
        return <MessageSquare className="w-4 h-4 text-cyber-400" />;
    }
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <span className="w-1 h-7 bg-gradient-to-b from-cyber-400 to-cyber-600 rounded-full" />
            综合看板
          </h1>
          <p className="text-sm text-space-500 mt-1 flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5" />
            {todayStr} · {formatDateTime(today)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="今日完成率"
          value={todayCompletionRate}
          icon={CheckCircle2}
          color="bio"
          asPercent
          trend={0.032}
          description="较昨日提升"
        />
        <StatCard
          title="平均信噪比"
          value={avgSNR}
          icon={Signal}
          suffix="dB"
          color="cyber"
          decimals={1}
          trend={0.018}
          description="系统整体性能"
        />
        <StatCard
          title="优化收敛次数"
          value={todayConvergenceCount}
          icon={GitBranch}
          color="warn"
          decimals={0}
          trend={-0.05}
          description="今日累计统计"
        />
        <StatCard
          title="异常预警数"
          value={todayAlertCount}
          icon={AlertTriangle}
          color="danger"
          decimals={0}
          trend={todayAlertCount > 0 ? 0.1 : 0}
          description="实时监测中"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <div className="glass-card p-5">
            <h2 className="section-title">
              <Radar className="w-5 h-5" />
              性能雷达图
            </h2>
            <ReactECharts
              option={radarOption}
              style={{ height: 340 }}
              opts={{ renderer: 'canvas' }}
            />
          </div>

          <div className="glass-card p-5">
            <h2 className="section-title">
              <TrendingUp className="w-5 h-5" />
              任务趋势（近7日）
            </h2>
            <ReactECharts
              option={trendOption}
              style={{ height: 320 }}
              opts={{ renderer: 'canvas' }}
            />
          </div>
        </div>

        <div className="space-y-5">
          <div className="glass-card p-5">
            <h2 className="section-title">
              <Bell className="w-5 h-5" />
              实时预警
            </h2>
            <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
              {sortedAlerts.length === 0 ? (
                <div className="text-center py-10 text-space-500 text-sm">
                  暂无预警信息
                </div>
              ) : (
                sortedAlerts.map((alert: Alert) => (
                  <div
                    key={alert.id}
                    className="p-3 rounded-md bg-space-900/40 border border-cyber-500/10 hover:border-cyber-500/25 transition-all duration-200"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <p className="text-sm font-medium text-white truncate flex-1">
                        {alert.taskName}
                      </p>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded border shrink-0 ${getAlertLevelStyle(
                          alert.level
                        )}`}
                      >
                        {AlertLevelLabels[alert.level]}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs text-cyber-400 font-mono">
                        {AlertReasonLabels[alert.reason]}
                      </span>
                      {alert.channelIndex !== undefined && (
                        <span className="text-xs text-space-500">
                          · 通道 {alert.channelIndex}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-space-400 leading-relaxed mb-2 line-clamp-2">
                      {alert.description}
                    </p>
                    <p className="text-[11px] text-space-500 font-mono">
                      {getRelativeTime(alert.createdAt)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="glass-card p-5">
            <h2 className="section-title">
              <MessageSquare className="w-5 h-5" />
              首席科学家通知
            </h2>
            <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
              {sortedNotifications.length === 0 ? (
                <div className="text-center py-10 text-space-500 text-sm">
                  暂无通知
                </div>
              ) : (
                sortedNotifications.map((notif: ChiefNotification) => (
                  <div
                    key={notif.id}
                    className={`p-3 rounded-md border transition-all duration-200 ${
                      notif.status === 'unread'
                        ? 'bg-cyber-500/5 border-cyber-500/20'
                        : 'bg-space-900/40 border-cyber-500/10 hover:border-cyber-500/25'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5 shrink-0">
                        {getNotificationIcon(notif.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium text-white truncate">
                            {notif.title}
                          </p>
                          {notif.status === 'unread' && (
                            <span className="w-1.5 h-1.5 rounded-full bg-cyber-400 shrink-0 breathing-glow" />
                          )}
                        </div>
                        <p className="text-xs text-space-400 leading-relaxed mb-2 line-clamp-2">
                          {notif.content}
                        </p>
                        <p className="text-[11px] text-space-500 font-mono">
                          {getRelativeTime(notif.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
