import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactECharts from 'echarts-for-react';
import {
  ArrowLeft,
  Brain,
  Cpu,
  Layers,
  User,
  Clock,
  Zap,
  Activity,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Pause,
  RotateCcw,
  FileText,
  RefreshCw,
} from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';
import { ProgressRing } from '../components/common/ProgressRing';
import { StatCard } from '../components/common/StatCard';
import { useTaskStore } from '../store/useTaskStore';
import { TaskStatus, SIMULATION_FLOW, TaskStatusLabels } from '../types';
import { formatDateTime, formatDuration } from '../utils/helpers';

export default function SimulationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getTaskById } = useTaskStore();

  const task = useMemo(() => (id ? getTaskById(id) : undefined), [id, getTaskById]);

  if (!task) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertTriangle className="w-16 h-16 text-warn-400 mb-4" />
        <h2 className="text-xl font-semibold text-cyber-200 mb-2">任务不存在</h2>
        <p className="text-sm text-space-500 mb-6">未找到 ID 为 {id} 的模拟任务</p>
        <button onClick={() => navigate('/')} className="cyber-button text-sm">
          返回任务列表
        </button>
      </div>
    );
  }

  const currentStepIndex = SIMULATION_FLOW.indexOf(task.status as TaskStatus);
  const isCompleted = task.status === TaskStatus.COMPLETED || task.status === TaskStatus.APPROVED;
  const isError = task.status === TaskStatus.ERROR_ROLLBACK;
  const isRunning = currentStepIndex >= 0 && currentStepIndex < SIMULATION_FLOW.indexOf(TaskStatus.COMPLETED);

  const snrTrendOption = {
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
      data: Array.from({ length: 30 }, (_, i) => `${i * 2}s`),
      axisLine: { lineStyle: { color: '#00D4FF30' } },
      axisLabel: { color: '#2A4F7A', fontSize: 10, interval: 5 },
    },
    yAxis: {
      type: 'value',
      name: 'SNR(dB)',
      nameTextStyle: { color: '#2A4F7A', fontSize: 10 },
      axisLine: { lineStyle: { color: '#00D4FF30' } },
      axisLabel: { color: '#2A4F7A', fontFamily: 'JetBrains Mono', fontSize: 10 },
      splitLine: { lineStyle: { color: '#00D4FF10' } },
    },
    series: [
      {
        type: 'line',
        smooth: true,
        showSymbol: false,
        data: Array.from({ length: 30 }, (_, i) => {
          const base = 22 + Math.sin(i * 0.3) * 4;
          return parseFloat((base + (Math.random() - 0.5) * 2).toFixed(1));
        }),
        lineStyle: { color: '#00D4FF', width: 2 },
        areaStyle: { color: 'rgba(0, 212, 255, 0.1)' },
        markLine: {
          silent: true,
          lineStyle: { color: '#FF8A00', type: 'dashed' },
          data: [{ yAxis: task.snrThreshold, label: { formatter: `阈值${task.snrThreshold}dB`, color: '#FF8A00', fontSize: 10 } }],
        },
      },
    ],
  };

  const channelSnrOption = {
    backgroundColor: 'transparent',
    grid: { left: 40, right: 20, top: 20, bottom: 40 },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(15, 31, 56, 0.95)',
      borderColor: '#00D4FF40',
      textStyle: { color: '#C8E6FF', fontFamily: 'JetBrains Mono' },
    },
    xAxis: {
      type: 'category',
      data: Array.from({ length: Math.min(task.channelCount, 24) }, (_, i) => `CH${i + 1}`),
      axisLine: { lineStyle: { color: '#00D4FF30' } },
      axisLabel: { color: '#2A4F7A', fontSize: 9, rotate: 45 },
    },
    yAxis: {
      type: 'value',
      min: 0,
      axisLine: { lineStyle: { color: '#00D4FF30' } },
      axisLabel: { color: '#2A4F7A', fontFamily: 'JetBrains Mono', fontSize: 10 },
      splitLine: { lineStyle: { color: '#00D4FF10' } },
    },
    series: [{
      type: 'bar',
      data: Array.from({ length: Math.min(task.channelCount, 24) }, () =>
        parseFloat((18 + Math.random() * 16).toFixed(1))
      ),
      itemStyle: {
        color: (params: any) => {
          return params.value >= task.snrThreshold
            ? { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#00FF9D' }, { offset: 1, color: '#00FF9D40' }] }
            : { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#FF3B5C' }, { offset: 1, color: '#FF3B5C40' }] };
        },
        borderRadius: [2, 2, 0, 0],
      },
      barWidth: '50%',
    }],
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="w-9 h-9 rounded-lg glass-card flex items-center justify-center text-space-400 hover:text-cyber-300 hover:border-cyber-500/40 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-cyber-300">{task.name}</h1>
              <StatusBadge type="task" value={task.status} size="md" />
            </div>
            <div className="flex items-center gap-4 mt-1 text-sm text-space-500">
              <span className="font-mono">{task.id}</span>
              <span className="flex items-center gap-1"><User className="w-3 h-3" />{task.userName}</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDateTime(task.createdAt)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isRunning && (
            <button className="cyber-button-outline text-sm px-4 flex items-center gap-2">
              <Pause className="w-4 h-4" />
              暂停
            </button>
          )}
          {isError && (
            <button className="cyber-button-outline text-sm px-4 flex items-center gap-2">
              <RotateCcw className="w-4 h-4" />
              重试
            </button>
          )}
          {isCompleted && (
            <button className="cyber-button text-sm px-4 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              查看报告
            </button>
          )}
          {!isCompleted && !isError && (
            <button className="cyber-button text-sm px-4 flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              刷新状态
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="glass-card p-5">
            <h2 className="section-title">
              <Brain className="w-5 h-5" />
              3D 视图预览
            </h2>
            <div className="relative aspect-[16/9] rounded-lg overflow-hidden bg-space-900/80 border border-cyber-500/20">
              <div className="absolute inset-0 bg-gradient-to-br from-space-900 via-space-800 to-space-900 flex items-center justify-center">
                <div className="relative">
                  <div className="w-48 h-48 rounded-full bg-gradient-to-br from-cyber-500/20 to-cyber-500/5 border border-cyber-500/30 breathing-glow flex items-center justify-center">
                    <Brain className="w-24 h-24 text-cyber-400/60" />
                  </div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full border border-cyber-500/10 animate-pulse" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full border border-cyber-500/5" />
                </div>
              </div>
              <div className="absolute top-3 left-3 glass-card px-3 py-1.5 text-xs font-mono text-cyber-300">
                {task.headModelName}
              </div>
              <div className="absolute top-3 right-3 glass-card px-3 py-1.5 text-xs font-mono text-bio-400">
                {task.layoutName}
              </div>
              <div className="absolute bottom-3 left-3 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-cyber-400 animate-pulse" />
                <span className="text-xs text-space-400">
                  {task.channelCount} 通道 · {task.layoutName}
                </span>
              </div>
              <div className="absolute bottom-3 right-3 text-[10px] text-space-500 font-mono">
                3D 渲染预览
              </div>
            </div>
          </div>

          <div className="glass-card p-5">
            <h2 className="section-title">
              <Cpu className="w-5 h-5" />
              计算进度
            </h2>

            <div className="flex items-center justify-center mb-6">
              <ProgressRing
                progress={task.progress}
                size={120}
                strokeWidth={10}
                color={isError ? '#FF3B5C' : isCompleted ? '#00FF9D' : '#00D4FF'}
                label={`${task.progress}%`}
              />
            </div>

            <div className="relative">
              <div className="flex items-center justify-between">
                {SIMULATION_FLOW.map((step, idx) => {
                  const isCurrent = step === task.status;
                  const isDone = SIMULATION_FLOW.indexOf(task.status as TaskStatus) > idx || isCompleted;
                  const stepActive = isCurrent || isDone;
                  return (
                    <div key={step} className="flex flex-col items-center relative flex-1">
                      {idx < SIMULATION_FLOW.length - 1 && (
                        <div className={`absolute top-4 left-1/2 w-full h-0.5 ${stepActive && idx < SIMULATION_FLOW.indexOf(task.status as TaskStatus) ? 'bg-cyber-400' : 'bg-space-600'}`} />
                      )}
                      <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                        isCurrent
                          ? 'bg-cyber-500/20 border-cyber-400 shadow-glow-cyber'
                          : isDone
                            ? 'bg-bio-500/20 border-bio-400'
                            : 'bg-space-800 border-space-600'
                      }`}>
                        {isDone ? (
                          <CheckCircle2 className={`w-4 h-4 ${isCompleted ? 'text-bio-400' : 'text-cyber-400'}`} />
                        ) : isError && step === TaskStatus.ERROR_ROLLBACK ? (
                          <AlertTriangle className="w-4 h-4 text-danger-400" />
                        ) : isCurrent ? (
                          <Circle className="w-3 h-3 text-cyber-400 fill-cyber-400 animate-pulse" />
                        ) : (
                          <Circle className="w-2 h-2 text-space-600 fill-space-600" />
                        )}
                      </div>
                      <p className={`mt-2 text-[10px] text-center max-w-[72px] ${
                        isCurrent ? 'text-cyber-300 font-semibold' : isDone ? 'text-space-300' : 'text-space-500'
                      }`}>
                        {TaskStatusLabels[step as TaskStatus]}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-4 gap-3">
              <div className="text-center">
                <p className="data-label">开始时间</p>
                <p className="font-mono text-cyber-300 text-xs">{formatDateTime(task.createdAt)}</p>
              </div>
              <div className="text-center">
                <p className="data-label">更新时间</p>
                <p className="font-mono text-cyber-300 text-xs">{formatDateTime(task.updatedAt)}</p>
              </div>
              <div className="text-center">
                <p className="data-label">预计耗时</p>
                <p className="font-mono text-warn-400 text-xs">{formatDuration(1850)}</p>
              </div>
              <div className="text-center">
                <p className="data-label">收敛次数</p>
                <p className="font-mono text-bio-400 text-xs">{task.convergenceCount}</p>
              </div>
            </div>
          </div>

          {isCompleted && (
            <>
              <div className="glass-card p-5">
                <h3 className="text-sm font-semibold text-cyber-300 mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  SNR 实时趋势
                </h3>
                <ReactECharts option={snrTrendOption} style={{ height: 200 }} />
              </div>
              <div className="glass-card p-5">
                <h3 className="text-sm font-semibold text-cyber-300 mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  通道 SNR 分布
                </h3>
                <ReactECharts option={channelSnrOption} style={{ height: 220 }} />
              </div>
            </>
          )}
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <StatCard
              title="通道数"
              value={task.channelCount}
              icon={Layers}
              color="cyber"
            />
            <StatCard
              title="SNR 阈值"
              value={task.snrThreshold}
              icon={Zap}
              color="warn"
              suffix="dB"
            />
            {task.avgSNR !== undefined && (
              <StatCard
                title="平均 SNR"
                value={task.avgSNR}
                icon={Activity}
                color="bio"
                suffix="dB"
                decimals={1}
              />
            )}
            <StatCard
              title="进度"
              value={`${task.progress}%`}
              icon={Cpu}
              color={isError ? 'danger' : 'cyber'}
            />
          </div>

          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-cyber-300 mb-4 flex items-center gap-2">
              <Layers className="w-4 h-4" />
              参数配置
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-cyber-500/10">
                <span className="text-xs text-space-500">头模</span>
                <span className="font-mono text-cyber-300 text-xs truncate max-w-[160px]" title={task.headModelName}>
                  {task.headModelName}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-cyber-500/10">
                <span className="text-xs text-space-500">光极布局</span>
                <span className="font-mono text-cyber-300 text-xs truncate max-w-[160px]" title={task.layoutName}>
                  {task.layoutName}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-cyber-500/10">
                <span className="text-xs text-space-500">通道数</span>
                <span className="font-mono text-cyber-300 text-xs">{task.channelCount}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-cyber-500/10">
                <span className="text-xs text-space-500">SNR 阈值</span>
                <span className="font-mono text-warn-400 text-xs">{task.snrThreshold} dB</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-cyber-500/10">
                <span className="text-xs text-space-500">波长组合</span>
                <span className="font-mono text-bio-400 text-xs">760 / 850 nm</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-xs text-space-500">光源功率</span>
                <span className="font-mono text-cyber-300 text-xs">10 mW</span>
              </div>
            </div>
          </div>

          {task.description && (
            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold text-cyber-300 mb-3">任务描述</h3>
              <p className="text-xs text-space-400 leading-relaxed">{task.description}</p>
            </div>
          )}

          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-cyber-300 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              状态历史
            </h3>
            <div className="space-y-0">
              {task.statusHistory.slice().reverse().map((log, idx, arr) => (
                <div key={log.id} className="relative pl-6 pb-4 last:pb-0">
                  {idx < arr.length - 1 && (
                    <div className="absolute left-[7px] top-4 w-px h-full bg-cyber-500/20" />
                  )}
                  <div className={`absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full border-2 ${
                    idx === 0
                      ? 'bg-cyber-500/20 border-cyber-400'
                      : 'bg-space-800 border-space-600'
                  }`}>
                    {idx === 0 && <div className="absolute inset-0.5 rounded-full bg-cyber-400 animate-pulse" />}
                  </div>
                  <div>
                    <StatusBadge type="task" value={log.status} size="sm" />
                    <p className="text-[11px] text-space-500 mt-1">{formatDateTime(log.timestamp)}</p>
                    <p className="text-xs text-space-400 mt-0.5">{log.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
