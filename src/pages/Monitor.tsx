import { useState, useEffect, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import {
  Activity,
  Wifi,
  SignalHigh,
  AlertTriangle,
  Heart,
  Droplet,
  CheckCircle,
  XCircle,
  Send,
  Clock,
  Eye,
  AlertCircle,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { StatCard } from '../components/common/StatCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { useTaskStore } from '../store/useTaskStore';
import { useAlertStore } from '../store/useAlertStore';
import { useSimulationStore } from '../store/useSimulationStore';
import { AlertLevel, AlertStatus, AlertReason, AlertReasonLabels } from '../types';
import { formatNumber, formatDateTime, randomInRange, clamp } from '../utils/helpers';
import { cn } from '../utils/helpers';

const CHANNEL_COUNT = 32;
const SNR_THRESHOLD = 20;

export default function Monitor() {
  const { tasks } = useTaskStore();
  const { alerts } = useAlertStore();
  const { layouts, selectedLayoutId } = useSimulationStore();

  const [selectedChannel, setSelectedChannel] = useState<number>(0);
  const [liveData, setLiveData] = useState(() => {
    const channels = [];
    for (let i = 0; i < CHANNEL_COUNT; i++) {
      channels.push({
        snr: randomInRange(18, 32),
        hbO: randomInRange(55, 75),
        hbR: randomInRange(30, 45),
        hbT: randomInRange(85, 120),
      });
    }
    return channels;
  });

  const [bloodOxygenHistory, setBloodOxygenHistory] = useState<Record<number, { t: number; hbO: number; hbR: number; hbT: number }[]>>(() => {
    const init: Record<number, any[]> = {};
    for (let i = 0; i < CHANNEL_COUNT; i++) {
      init[i] = [];
      for (let t = 0; t < 60; t++) {
        init[i].push({
          t,
          hbO: 65 + Math.sin(t * 0.15) * 8 + randomInRange(-3, 3),
          hbR: 38 + Math.cos(t * 0.12) * 5 + randomInRange(-2, 2),
          hbT: 103 + Math.sin(t * 0.1) * 10 + randomInRange(-4, 4),
        });
      }
    }
    return init;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveData((prev) =>
        prev.map((ch) => ({
          snr: clamp(ch.snr + randomInRange(-1.5, 1.5), 10, 40),
          hbO: clamp(ch.hbO + randomInRange(-2, 2), 40, 90),
          hbR: clamp(ch.hbR + randomInRange(-1.5, 1.5), 20, 60),
          hbT: clamp(ch.hbT + randomInRange(-3, 3), 60, 150),
        }))
      );

      setBloodOxygenHistory((prev) => {
        const next: typeof prev = {};
        for (let i = 0; i < CHANNEL_COUNT; i++) {
          const last = prev[i][prev[i].length - 1];
          next[i] = [
            ...prev[i].slice(-59),
            {
              t: last.t + 1,
              hbO: clamp(last.hbO + randomInRange(-1.5, 1.5), 45, 85),
              hbR: clamp(last.hbR + randomInRange(-1, 1), 25, 55),
              hbT: clamp(last.hbT + randomInRange(-2, 2), 70, 140),
            },
          ];
        }
        return next;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  const avgSNR = useMemo(() => {
    const sum = liveData.reduce((s, c) => s + c.snr, 0);
    return sum / liveData.length;
  }, [liveData]);

  const validChannels = useMemo(
    () => liveData.filter((c) => c.snr >= SNR_THRESHOLD).length,
    [liveData]
  );

  const pendingAlerts = alerts.filter((a) => a.status === AlertStatus.PENDING || a.status === AlertStatus.UNDER_REVIEW);

  const snrChartOption = useMemo(() => ({
    backgroundColor: 'transparent',
    grid: { left: 50, right: 20, top: 30, bottom: 40 },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(10, 22, 40, 0.95)',
      borderColor: 'rgba(0, 212, 255, 0.3)',
      textStyle: { color: '#C8E6FF', fontSize: 11 },
      formatter: (params: any) => {
        const p = params[0];
        const below = p.value < SNR_THRESHOLD;
        return `<div style="font-family: monospace;">
          <div style="margin-bottom:4px">通道 ${p.name}</div>
          <div style="color:${below ? '#FF3B5C' : '#00D4FF'}">SNR: ${p.value.toFixed(1)} dB</div>
          ${below ? '<div style="color:#FF8A00;margin-top:2px">⚠ 低于阈值</div>' : ''}
        </div>`;
      },
    },
    xAxis: {
      type: 'category',
      data: Array.from({ length: CHANNEL_COUNT }, (_, i) => `CH${String(i + 1).padStart(2, '0')}`),
      axisLabel: { color: '#2A4F7A', fontSize: 9, fontFamily: 'monospace', rotate: 45 },
      axisLine: { lineStyle: { color: 'rgba(0, 212, 255, 0.2)' } },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      name: 'SNR (dB)',
      nameTextStyle: { color: '#2A4F7A', fontSize: 10 },
      min: 0,
      max: 40,
      axisLabel: { color: '#2A4F7A', fontSize: 10, fontFamily: 'monospace' },
      splitLine: { lineStyle: { color: 'rgba(0, 212, 255, 0.06)' } },
    },
    series: [
      {
        type: 'bar',
        data: liveData.map((ch, i) => ({
          value: ch.snr,
          itemStyle: {
            color: ch.snr < SNR_THRESHOLD
              ? { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#FF3B5C' }, { offset: 1, color: '#992438' }] }
              : { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#00D4FF' }, { offset: 1, color: '#007C99' }] },
            borderRadius: [3, 3, 0, 0],
          },
        })),
        barWidth: '60%',
        markLine: {
          silent: true,
          symbol: 'none',
          lineStyle: { color: '#FF8A00', type: 'dashed', width: 1.5 },
          label: {
            formatter: `阈值 ${SNR_THRESHOLD} dB`,
            color: '#FF8A00',
            fontSize: 10,
            fontFamily: 'monospace',
            backgroundColor: 'rgba(255, 138, 0, 0.1)',
            padding: [2, 6],
            borderRadius: 2,
          },
          data: [{ yAxis: SNR_THRESHOLD }],
        },
      },
    ],
  }), [liveData]);

  const bloodOxygenChartOption = useMemo(() => {
    const history = bloodOxygenHistory[selectedChannel] || [];
    return {
      backgroundColor: 'transparent',
      grid: { left: 50, right: 20, top: 40, bottom: 30 },
      legend: {
        top: 0,
        right: 0,
        textStyle: { color: '#2A4F7A', fontSize: 10 },
        icon: 'roundRect',
        itemWidth: 12,
        itemHeight: 4,
        itemGap: 16,
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(10, 22, 40, 0.95)',
        borderColor: 'rgba(0, 212, 255, 0.3)',
        textStyle: { color: '#C8E6FF', fontSize: 11, fontFamily: 'monospace' },
      },
      xAxis: {
        type: 'category',
        data: history.map((d) => d.t.toString()),
        axisLabel: { color: '#2A4F7A', fontSize: 9, fontFamily: 'monospace' },
        axisLine: { lineStyle: { color: 'rgba(0, 212, 255, 0.2)' } },
        axisTick: { show: false },
        name: '时间点',
        nameTextStyle: { color: '#2A4F7A', fontSize: 10 },
      },
      yAxis: {
        type: 'value',
        name: '浓度 (μM)',
        nameTextStyle: { color: '#2A4F7A', fontSize: 10 },
        axisLabel: { color: '#2A4F7A', fontSize: 10, fontFamily: 'monospace' },
        splitLine: { lineStyle: { color: 'rgba(0, 212, 255, 0.06)' } },
      },
      series: [
        {
          name: 'HbO 氧合血红蛋白',
          type: 'line',
          data: history.map((d) => d.hbO.toFixed(1)),
          smooth: true,
          showSymbol: false,
          lineStyle: { color: '#FF3B5C', width: 2 },
          areaStyle: {
            color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(255, 59, 92, 0.25)' }, { offset: 1, color: 'rgba(255, 59, 92, 0)' }] },
          },
        },
        {
          name: 'HbR 脱氧血红蛋白',
          type: 'line',
          data: history.map((d) => d.hbR.toFixed(1)),
          smooth: true,
          showSymbol: false,
          lineStyle: { color: '#00D4FF', width: 2 },
          areaStyle: {
            color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(0, 212, 255, 0.2)' }, { offset: 1, color: 'rgba(0, 212, 255, 0)' }] },
          },
        },
        {
          name: 'HbT 总血红蛋白',
          type: 'line',
          data: history.map((d) => d.hbT.toFixed(1)),
          smooth: true,
          showSymbol: false,
          lineStyle: { color: '#B380FF', width: 2, type: 'dashed' },
          areaStyle: {
            color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(179, 128, 255, 0.15)' }, { offset: 1, color: 'rgba(179, 128, 255, 0)' }] },
          },
        },
      ],
    };
  }, [bloodOxygenHistory, selectedChannel]);

  const getPushStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { label: '待推送', icon: Clock, color: '#2A4F7A' };
      case 'sent':
        return { label: '已发送', icon: Send, color: '#FF8A00' };
      case 'delivered':
        return { label: '已送达', icon: CheckCircle, color: '#00D4FF' };
      case 'read':
        return { label: '已阅读', icon: Eye, color: '#00FF9D' };
      default:
        return { label: status, icon: AlertCircle, color: '#888' };
    }
  };

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Activity className="w-7 h-7 text-cyber-400" />
            实时监控中心
          </h1>
          <p className="text-sm text-space-500 mt-1">实时监测所有通道信号质量与血氧浓度变化</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="glass-card px-3 py-1.5 flex items-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-full bg-bio-400 animate-pulse" />
            <span className="text-bio-400 font-medium">实时数据流</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard title="总通道数" value={CHANNEL_COUNT} icon={Wifi} color="cyber" description="当前布局通道总数" />
        <StatCard title="有效通道" value={validChannels} icon={SignalHigh} color="bio" suffix={`/ ${CHANNEL_COUNT}`} description={`SNR ≥ ${SNR_THRESHOLD} dB`} />
        <StatCard title="平均 SNR" value={formatNumber(avgSNR, 1)} icon={Heart} color="cyber" suffix="dB" trend={0.042} description="所有通道平均信噪比" />
        <StatCard title="预警数量" value={pendingAlerts.length} icon={AlertTriangle} color="danger" description="待处理预警" />
      </div>

      <div className="glass-card p-4 flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-3">
          <h2 className="section-title mb-0">
            <SignalHigh className="w-5 h-5" />
            通道 SNR 分布
          </h2>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-gradient-to-b from-cyber-400 to-cyber-700" />
              <span className="text-space-400">正常</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-gradient-to-b from-danger-500 to-danger-700" />
              <span className="text-space-400">低于阈值</span>
            </div>
          </div>
        </div>
        <div className="flex-1 min-h-0">
          <ReactECharts option={snrChartOption} style={{ height: '100%', width: '100%' }} notMerge />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
        <div className="glass-card p-4 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="section-title mb-0">
              <Droplet className="w-5 h-5" />
              血氧浓度实时曲线
            </h2>
            <div className="flex items-center gap-2">
              <span className="data-label">通道</span>
              <select
                value={selectedChannel}
                onChange={(e) => setSelectedChannel(parseInt(e.target.value))}
                className="cyber-input text-xs font-mono py-1 w-24"
              >
                {Array.from({ length: CHANNEL_COUNT }, (_, i) => (
                  <option key={i} value={i}>
                    CH{String(i + 1).padStart(2, '0')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-3">
            <div className="p-2.5 rounded bg-space-900/50 border border-danger-500/20">
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-2 h-2 rounded-full bg-danger-500" />
                <span className="text-[10px] text-space-400">HbO</span>
              </div>
              <p className="font-mono text-base text-danger-400">
                {formatNumber(liveData[selectedChannel]?.hbO || 0, 1)}
                <span className="text-xs text-space-500 ml-1">μM</span>
              </p>
            </div>
            <div className="p-2.5 rounded bg-space-900/50 border border-cyber-500/20">
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-2 h-2 rounded-full bg-cyber-400" />
                <span className="text-[10px] text-space-400">HbR</span>
              </div>
              <p className="font-mono text-base text-cyber-400">
                {formatNumber(liveData[selectedChannel]?.hbR || 0, 1)}
                <span className="text-xs text-space-500 ml-1">μM</span>
              </p>
            </div>
            <div className="p-2.5 rounded bg-space-900/50 border border-purple-500/20">
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-2 h-2 rounded-full bg-purple-400" />
                <span className="text-[10px] text-space-400">HbT</span>
              </div>
              <p className="font-mono text-base text-purple-400">
                {formatNumber(liveData[selectedChannel]?.hbT || 0, 1)}
                <span className="text-xs text-space-500 ml-1">μM</span>
              </p>
            </div>
          </div>

          <div className="flex-1 min-h-0">
            <ReactECharts option={bloodOxygenChartOption} style={{ height: '100%', width: '100%' }} notMerge />
          </div>
        </div>

        <div className="glass-card p-4 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="section-title mb-0">
              <AlertTriangle className="w-5 h-5" />
              预警中心
              {pendingAlerts.length > 0 && (
                <span className="ml-2 px-1.5 py-0.5 rounded bg-danger-500/20 text-danger-400 text-[10px] font-mono">
                  {pendingAlerts.length}
                </span>
              )}
            </h2>
            <div className="flex items-center gap-3 text-[10px]">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: '#FF8A00' }} />
                <span className="text-space-400">一级</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: '#FF3B5C' }} />
                <span className="text-space-400">二级</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: '#992438' }} />
                <span className="text-space-400">三级</span>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {alerts.map((alert) => {
              const pushInfo = getPushStatusInfo(alert.pushStatus);
              const PushIcon = pushInfo.icon;
              return (
                <div
                  key={alert.id}
                  className="p-3 rounded bg-space-900/60 border-l-2 hover:bg-space-800/60 transition-colors cursor-pointer"
                  style={{
                    borderLeftColor:
                      alert.level === AlertLevel.LEVEL_1
                        ? '#FF8A00'
                        : alert.level === AlertLevel.LEVEL_2
                        ? '#FF3B5C'
                        : '#992438',
                    backgroundColor:
                      alert.level === AlertLevel.LEVEL_3
                        ? 'rgba(153, 36, 56, 0.08)'
                        : alert.level === AlertLevel.LEVEL_2
                        ? 'rgba(255, 59, 92, 0.05)'
                        : 'rgba(10, 22, 40, 0.4)',
                  }}
                >
                  <div className="flex items-start justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <StatusBadge type="alert-level" value={alert.level} size="sm" />
                      <StatusBadge type="alert-status" value={alert.status} size="sm" />
                    </div>
                    <div className="flex items-center gap-1" style={{ color: pushInfo.color }}>
                      <PushIcon className="w-3 h-3" />
                      <span className="text-[10px] font-medium">{pushInfo.label}</span>
                    </div>
                  </div>

                  <p className="text-sm font-medium text-white mb-0.5 truncate">{alert.taskName}</p>

                  <div className="flex items-center gap-2 text-[10px] font-mono text-space-400 mb-1.5">
                    {alert.channelIndex !== undefined && (
                      <>
                        <span className="px-1.5 py-0.5 rounded bg-cyber-500/15 text-cyber-400">
                          CH{String(alert.channelIndex).padStart(2, '0')}
                        </span>
                      </>
                    )}
                    <span>{AlertReasonLabels[alert.reason]}</span>
                  </div>

                  <div className="flex items-center gap-3 mb-2 text-[11px]">
                    <div className="flex items-center gap-1">
                      <span className="text-space-500">当前值</span>
                      <span
                        className="font-mono font-semibold"
                        style={{
                          color:
                            alert.level === AlertLevel.LEVEL_1
                              ? '#FF8A00'
                              : alert.level === AlertLevel.LEVEL_2
                              ? '#FF3B5C'
                              : '#FF6B85',
                        }}
                      >
                        {formatNumber(alert.value, 1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-space-500">阈值</span>
                      <span className="font-mono text-space-400">{formatNumber(alert.threshold, 1)}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-space-400 mb-2 line-clamp-2">{alert.description}</p>

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-space-500 font-mono">{formatDateTime(alert.createdAt)}</span>
                    <div className="flex items-center gap-1.5">
                      <button className="px-2 py-1 rounded text-[10px] font-medium border border-bio-500/40 text-bio-400 hover:bg-bio-500/10 transition-colors">
                        查看详情
                      </button>
                      <button className="px-2 py-1 rounded text-[10px] font-medium border border-cyber-500/40 text-cyber-400 hover:bg-cyber-500/10 transition-colors flex items-center gap-1">
                        处理
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
