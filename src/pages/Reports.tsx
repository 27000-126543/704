import { useState, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import {
  FileText,
  Download,
  ChevronDown,
  Check,
  BarChart3,
  Brain,
  Activity,
  Zap,
  FileSpreadsheet,
  FileJson,
  ListChecks,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { StatCard } from '../components/common/StatCard';
import { useTaskStore } from '../store/useTaskStore';
import { useReportStore } from '../store/useReportStore';
import { TaskStatus, DEFAULT_BRAIN_REGIONS } from '../types';
import { formatDateTime } from '../utils/helpers';
import { exportData, generateReportPDF, type ExportDataOptions, getPreviewData, type PreviewResult } from '../utils/exportUtils';

type ExportFormat = 'csv' | 'excel' | 'json';
type ExportScope = 'all' | 'by_brain_region' | 'by_optrode';

export default function Reports() {
  const { tasks } = useTaskStore();
  const { generateReport, getReportByTaskId } = useReportStore();
  const completedTasks = useMemo(() => tasks.filter((t) => t.status === TaskStatus.COMPLETED || t.status === TaskStatus.APPROVED), [tasks]);

  const [selectedTaskId, setSelectedTaskId] = useState<string>(completedTasks[0]?.id || '');
  const [taskDropdownOpen, setTaskDropdownOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('csv');
  const [exportScope, setExportScope] = useState<ExportScope>('all');
  const [selectedBrainRegions, setSelectedBrainRegions] = useState<string[]>([]);
  const [selectedOptrodes, setSelectedOptrodes] = useState<string[]>([]);
  const [exportMessage, setExportMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [previewResult, setPreviewResult] = useState<PreviewResult | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setExportMessage({ type, text });
    setTimeout(() => setExportMessage(null), 4000);
  };

  const handleExportPDF = async () => {
    if (!report) {
      showMessage('error', '请先选择一个任务');
      return;
    }
    setIsGeneratingPDF(true);
    try {
      const result = await generateReportPDF(report);
      if (result.success) {
        showMessage('success', `PDF报告已生成：${report.taskId}_fNIRS报告.pdf`);
      } else {
        showMessage('error', result.message || 'PDF生成失败');
      }
    } catch (e) {
      showMessage('error', 'PDF生成失败');
    }
    setIsGeneratingPDF(false);
  };

  const handleExportData = () => {
    if (!report) {
      showMessage('error', '请先选择一个任务');
      return;
    }

    const options: ExportDataOptions = {
      format: exportFormat,
      scope: exportScope,
      brainRegions: exportScope === 'by_brain_region' ? selectedBrainRegions : undefined,
      optrodeIds: exportScope === 'by_optrode' ? selectedOptrodes : undefined,
    };

    setIsExporting(true);
    setTimeout(() => {
      const result = exportData(options, report, selectedTask?.channelCount || 32);
      if (result.success) {
        showMessage('success', `数据已导出：${exportFormat.toUpperCase()} 格式`);
      } else {
        showMessage('error', result.message || '导出失败');
      }
      setIsExporting(false);
    }, 500);
  };

  const handlePreviewData = () => {
    if (!report) {
      setPreviewError('请先选择一个任务');
      setPreviewResult(null);
      return;
    }

    const options: ExportDataOptions = {
      format: exportFormat,
      scope: exportScope,
      brainRegions: exportScope === 'by_brain_region' ? selectedBrainRegions : undefined,
      optrodeIds: exportScope === 'by_optrode' ? selectedOptrodes : undefined,
    };

    const result = getPreviewData(options, report, selectedTask?.channelCount || 32, 20);
    if ('error' in result) {
      setPreviewError(result.error);
      setPreviewResult(null);
    } else {
      setPreviewError(null);
      setPreviewResult(result);
    }
  };

  // 当格式/范围/筛选条件变化时，自动刷新预览
  useMemo(() => {
    if (previewResult || previewError) {
      handlePreviewData();
    }
  }, [exportFormat, exportScope, selectedBrainRegions, selectedOptrodes, selectedTaskId]);

  const report = useMemo(() => {
    if (!selectedTaskId) return null;
    const existing = getReportByTaskId(selectedTaskId);
    if (existing) return existing;
    const task = tasks.find((t) => t.id === selectedTaskId);
    if (task) return generateReport(task);
    return null;
  }, [selectedTaskId, tasks, getReportByTaskId, generateReport]);

  const selectedTask = tasks.find((t) => t.id === selectedTaskId);

  const snrHistogramOption = useMemo(() => {
    if (!report) return {};
    return {
      backgroundColor: 'transparent',
      grid: { left: 40, right: 20, top: 30, bottom: 30 },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(15, 31, 56, 0.95)',
        borderColor: '#00D4FF40',
        textStyle: { color: '#C8E6FF', fontFamily: 'JetBrains Mono' },
      },
      xAxis: {
        type: 'category',
        data: ['0-10', '10-15', '15-20', '20-25', '25-30', '30-35', '35+'],
        axisLine: { lineStyle: { color: '#00D4FF30' } },
        axisLabel: { color: '#2A4F7A', fontFamily: 'JetBrains Mono', fontSize: 10 },
      },
      yAxis: {
        type: 'value',
        name: '通道数',
        nameTextStyle: { color: '#2A4F7A', fontSize: 10 },
        axisLine: { lineStyle: { color: '#00D4FF30' } },
        axisLabel: { color: '#2A4F7A', fontFamily: 'JetBrains Mono', fontSize: 10 },
        splitLine: { lineStyle: { color: '#00D4FF10' } },
      },
      series: [{
        type: 'bar',
        data: [2, 5, 8, 14, 10, 6, 2],
        itemStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#00D4FF' },
              { offset: 1, color: '#00D4FF30' },
            ],
          },
          borderRadius: [4, 4, 0, 0],
        },
        barWidth: '50%',
      }],
    };
  }, [report]);

  const heatmapOption = useMemo(() => {
    const data: (number | string)[][] = [];
    for (let x = 0; x < 10; x++) {
      for (let y = 0; y < 8; y++) {
        const v = Math.random() * 10;
        if (v > 3) data.push([x, y, parseFloat(v.toFixed(1))]);
      }
    }
    return {
      backgroundColor: 'transparent',
      grid: { left: 40, right: 20, top: 20, bottom: 30 },
      tooltip: {
        position: 'top',
        backgroundColor: 'rgba(15, 31, 56, 0.95)',
        borderColor: '#00D4FF40',
        textStyle: { color: '#C8E6FF', fontFamily: 'JetBrains Mono' },
      },
      xAxis: {
        type: 'category',
        data: ['Fp1', 'Fp2', 'F3', 'F4', 'C3', 'C4', 'P3', 'P4', 'O1', 'O2'],
        axisLine: { lineStyle: { color: '#00D4FF30' } },
        axisLabel: { color: '#2A4F7A', fontSize: 10 },
      },
      yAxis: {
        type: 'category',
        data: ['HbO↑', 'HbR↓', 'SNR', 't值', 'p值'],
        axisLine: { lineStyle: { color: '#00D4FF30' } },
        axisLabel: { color: '#2A4F7A', fontSize: 10 },
      },
      visualMap: {
        min: 0, max: 10,
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: 0,
        inRange: { color: ['#0A1628', '#00D4FF40', '#00D4FF', '#00FF9D'] },
        textStyle: { color: '#2A4F7A', fontSize: 10 },
      },
      series: [{
        name: '激活强度',
        type: 'heatmap',
        data: data,
        label: { show: true, color: '#C8E6FF', fontSize: 9, fontFamily: 'JetBrains Mono' },
        emphasis: { itemStyle: { shadowBlur: 10, shadowColor: '#00D4FF80' } },
      }],
    };
  }, []);

  const odCurveOption = useMemo(() => {
    const times = Array.from({ length: 60 }, (_, i) => (i * 0.5).toFixed(1));
    return {
      backgroundColor: 'transparent',
      grid: { left: 40, right: 20, top: 30, bottom: 30 },
      legend: {
        data: ['760nm', '850nm'],
        textStyle: { color: '#2A4F7A', fontSize: 10 },
        top: 0, right: 10,
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(15, 31, 56, 0.95)',
        borderColor: '#00D4FF40',
        textStyle: { color: '#C8E6FF', fontFamily: 'JetBrains Mono' },
      },
      xAxis: {
        type: 'category',
        data: times,
        name: '时间(s)',
        nameTextStyle: { color: '#2A4F7A', fontSize: 10 },
        axisLine: { lineStyle: { color: '#00D4FF30' } },
        axisLabel: { color: '#2A4F7A', fontFamily: 'JetBrains Mono', fontSize: 10, interval: 10 },
      },
      yAxis: {
        type: 'value',
        name: 'OD',
        nameTextStyle: { color: '#2A4F7A', fontSize: 10 },
        axisLine: { lineStyle: { color: '#00D4FF30' } },
        axisLabel: { color: '#2A4F7A', fontFamily: 'JetBrains Mono', fontSize: 10 },
        splitLine: { lineStyle: { color: '#00D4FF10' } },
      },
      series: [
        {
          name: '760nm',
          type: 'line',
          smooth: true,
          showSymbol: false,
          data: times.map((_, i) => (0.45 + Math.sin(i * 0.2) * 0.08 + (Math.random() - 0.5) * 0.04).toFixed(3)),
          lineStyle: { color: '#00D4FF', width: 2 },
          areaStyle: { color: 'rgba(0, 212, 255, 0.1)' },
        },
        {
          name: '850nm',
          type: 'line',
          smooth: true,
          showSymbol: false,
          data: times.map((_, i) => (0.38 + Math.cos(i * 0.18) * 0.06 + (Math.random() - 0.5) * 0.03).toFixed(3)),
          lineStyle: { color: '#00FF9D', width: 2 },
          areaStyle: { color: 'rgba(0, 255, 157, 0.1)' },
        },
      ],
    };
  }, []);

  const hbDistributionOption = useMemo(() => {
    return {
      backgroundColor: 'transparent',
      grid: { left: 50, right: 30, top: 30, bottom: 30 },
      legend: {
        data: ['HbO', 'HbR', 'HbT'],
        textStyle: { color: '#2A4F7A', fontSize: 10 },
        top: 0, right: 10,
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: 'rgba(15, 31, 56, 0.95)',
        borderColor: '#00D4FF40',
        textStyle: { color: '#C8E6FF', fontFamily: 'JetBrains Mono' },
      },
      xAxis: {
        type: 'category',
        data: ['Fp1', 'Fp2', 'F3', 'F4', 'C3', 'C4', 'P3', 'P4'],
        axisLine: { lineStyle: { color: '#00D4FF30' } },
        axisLabel: { color: '#2A4F7A', fontSize: 10 },
      },
      yAxis: {
        type: 'value',
        name: 'μmol/L',
        nameTextStyle: { color: '#2A4F7A', fontSize: 10 },
        axisLine: { lineStyle: { color: '#00D4FF30' } },
        axisLabel: { color: '#2A4F7A', fontFamily: 'JetBrains Mono', fontSize: 10 },
        splitLine: { lineStyle: { color: '#00D4FF10' } },
      },
      series: [
        {
          name: 'HbO', type: 'bar', barWidth: '20%',
          data: [72.5, 68.3, 82.1, 75.8, 65.2, 68.9, 58.4, 60.1],
          itemStyle: { color: '#00FF9D', borderRadius: [3, 3, 0, 0] },
        },
        {
          name: 'HbR', type: 'bar', barWidth: '20%',
          data: [32.1, 35.6, 28.4, 30.2, 38.5, 36.1, 40.2, 38.8],
          itemStyle: { color: '#FF3B5C', borderRadius: [3, 3, 0, 0] },
        },
        {
          name: 'HbT', type: 'bar', barWidth: '20%',
          data: [104.6, 103.9, 110.5, 106.0, 103.7, 105.0, 98.6, 98.9],
          itemStyle: { color: '#00D4FF', borderRadius: [3, 3, 0, 0] },
        },
      ],
    };
  }, []);

  const toggleBrainRegion = (abbr: string) => {
    setSelectedBrainRegions((prev) =>
      prev.includes(abbr) ? prev.filter((r) => r !== abbr) : [...prev, abbr]
    );
  };

  const toggleOptrode = (id: string) => {
    setSelectedOptrodes((prev) =>
      prev.includes(id) ? prev.filter((o) => o !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      {exportMessage && (
        <div
          className={`fixed top-4 right-4 z-50 glass-card px-5 py-3 flex items-center gap-3 animate-fade-in ${
            exportMessage.type === 'success'
              ? 'border-bio-500/50 shadow-[0_0_20px_rgba(0,255,157,0.2)]'
              : 'border-danger-500/50 shadow-[0_0_20px_rgba(255,59,92,0.2)]'
          }`}
        >
          {exportMessage.type === 'success' ? (
            <Check className="w-5 h-5 text-bio-400" />
          ) : (
            <AlertCircle className="w-5 h-5 text-danger-400" />
          )}
          <span className={`text-sm ${exportMessage.type === 'success' ? 'text-bio-300' : 'text-danger-300'}`}>
            {exportMessage.text}
          </span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-cyber-300 flex items-center gap-3">
            <FileText className="w-7 h-7" />
            报告与数据导出中心
          </h1>
          <p className="text-sm text-space-500 mt-1">生成模拟任务报告，支持多格式数据导出</p>
        </div>
      </div>

      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="section-title !mb-0">
            <BarChart3 className="w-5 h-5" />
            报告预览
          </h2>
          <button
            onClick={handleExportPDF}
            disabled={isGeneratingPDF || !report}
            className="cyber-button flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGeneratingPDF ? (
              <>
                <div className="w-4 h-4 border-2 border-space-900/30 border-t-space-900 rounded-full animate-spin" />
                生成中...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                导出 PDF
              </>
            )}
          </button>
        </div>

        <div className="mb-5 relative max-w-md">
          <label className="data-label block mb-2">选择模拟任务</label>
          <button
            onClick={() => setTaskDropdownOpen(!taskDropdownOpen)}
            className="cyber-input flex items-center justify-between text-left"
          >
            <span className="font-mono text-cyber-300">
              {selectedTask ? `${selectedTask.id} - ${selectedTask.name}` : '请选择任务'}
            </span>
            <ChevronDown className={`w-4 h-4 text-space-500 transition-transform ${taskDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          {taskDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 glass-card z-10 max-h-60 overflow-y-auto">
              {completedTasks.map((task) => (
                <button
                  key={task.id}
                  onClick={() => {
                    setSelectedTaskId(task.id);
                    setTaskDropdownOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-cyber-500/10 flex items-center justify-between transition-colors"
                >
                  <span className="font-mono text-cyan-50">{task.id}</span>
                  <span className="text-space-400 text-xs">{task.name}</span>
                  {selectedTaskId === task.id && <Check className="w-4 h-4 text-cyber-400" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {report && (
          <div className="space-y-5">
            <div className="glass-card p-4 border-cyber-500/30">
              <h3 className="text-sm font-semibold text-cyber-300 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                报告摘要
              </h3>
              <div className="grid grid-cols-4 gap-3 mb-3">
                <div>
                  <p className="data-label">任务ID</p>
                  <p className="data-value text-sm">{report.taskId}</p>
                </div>
                <div>
                  <p className="data-label">生成时间</p>
                  <p className="data-value text-sm">{formatDateTime(report.generatedAt)}</p>
                </div>
                <div>
                  <p className="data-label">生成者</p>
                  <p className="data-value text-sm">{report.generatedBy}</p>
                </div>
                <div>
                  <p className="data-label">持续时间</p>
                  <p className="data-value text-sm">{report.totalDuration}s</p>
                </div>
              </div>
              <p className="text-sm text-space-400 leading-relaxed">{report.summary}</p>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <StatCard title="平均 SNR" value={report.avgSNR} icon={Zap} color="cyber" suffix="dB" decimals={1} />
              <StatCard title="最小 SNR" value={report.minSNR} icon={Activity} color="warn" suffix="dB" decimals={1} />
              <StatCard title="最大 SNR" value={report.maxSNR} icon={Zap} color="bio" suffix="dB" decimals={1} />
              <StatCard title="有效通道" value={`${report.validChannels}/${report.channelCount}`} icon={Brain} color="cyber" />
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div className="glass-card p-4">
                <h3 className="text-sm font-semibold text-cyber-300 mb-3 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  SNR 分布统计
                </h3>
                <ReactECharts option={snrHistogramOption} style={{ height: 200 }} />
              </div>
              <div className="glass-card p-4">
                <h3 className="text-sm font-semibold text-cyber-300 mb-3 flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  激活脑区热力图
                </h3>
                <ReactECharts option={heatmapOption} style={{ height: 220 }} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div className="glass-card p-4">
                <h3 className="text-sm font-semibold text-cyber-300 mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  光密度变化曲线
                </h3>
                <ReactECharts option={odCurveOption} style={{ height: 200 }} />
              </div>
              <div className="glass-card p-4">
                <h3 className="text-sm font-semibold text-cyber-300 mb-3 flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  血氧浓度分布
                </h3>
                <ReactECharts option={hbDistributionOption} style={{ height: 200 }} />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="glass-card p-5">
        <h2 className="section-title">
          <ListChecks className="w-5 h-5" />
          数据导出面板
        </h2>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-5">
            <div>
              <label className="data-label block mb-2">导出格式</label>
              <div className="flex gap-3">
                {[
                  { key: 'csv' as ExportFormat, label: 'CSV', icon: FileSpreadsheet },
                  { key: 'excel' as ExportFormat, label: 'Excel', icon: FileSpreadsheet },
                  { key: 'json' as ExportFormat, label: 'JSON', icon: FileJson },
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setExportFormat(key)}
                    className={`flex-1 px-4 py-3 rounded border font-medium text-sm flex items-center justify-center gap-2 transition-all ${
                      exportFormat === key
                        ? 'bg-cyber-500/20 border-cyber-400 text-cyber-300 shadow-glow-cyber'
                        : 'bg-space-900/50 border-cyber-500/20 text-space-400 hover:border-cyber-500/40'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="data-label block mb-2">导出范围</label>
              <div className="flex gap-3">
                {[
                  { key: 'all' as ExportScope, label: '全部数据' },
                  { key: 'by_brain_region' as ExportScope, label: '按脑区' },
                  { key: 'by_optrode' as ExportScope, label: '按光极编号' },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setExportScope(key)}
                    className={`flex-1 px-4 py-2.5 rounded border font-medium text-sm transition-all ${
                      exportScope === key
                        ? 'bg-cyber-500/20 border-cyber-400 text-cyber-300'
                        : 'bg-space-900/50 border-cyber-500/20 text-space-400 hover:border-cyber-500/40'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-5">
            {exportScope === 'by_brain_region' && (
              <div>
                <label className="data-label block mb-2">选择脑区（{selectedBrainRegions.length} 已选）</label>
                <div className="glass-card p-3 max-h-40 overflow-y-auto">
                  <div className="grid grid-cols-4 gap-2">
                    {DEFAULT_BRAIN_REGIONS.map((region) => (
                      <button
                        key={region.id}
                        onClick={() => toggleBrainRegion(region.abbreviation)}
                        className={`px-2 py-1.5 rounded text-xs font-mono border transition-all ${
                          selectedBrainRegions.includes(region.abbreviation)
                            ? 'bg-cyber-500/20 border-cyber-400 text-cyber-300'
                            : 'bg-space-900/50 border-cyber-500/20 text-space-400 hover:border-cyber-500/40'
                        }`}
                      >
                        {region.abbreviation}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {exportScope === 'by_optrode' && (
              <div>
                <label className="data-label block mb-2">选择光极（{selectedOptrodes.length} 已选）</label>
                <div className="glass-card p-3 max-h-40 overflow-y-auto">
                  <div className="grid grid-cols-6 gap-2">
                    {Array.from({ length: 24 }, (_, i) => `OPT_${String(i + 1).padStart(2, '0')}`).map((opt) => (
                      <button
                        key={opt}
                        onClick={() => toggleOptrode(opt)}
                        className={`px-2 py-1.5 rounded text-xs font-mono border transition-all ${
                          selectedOptrodes.includes(opt)
                            ? 'bg-cyber-500/20 border-cyber-400 text-cyber-300'
                            : 'bg-space-900/50 border-cyber-500/20 text-space-400 hover:border-cyber-500/40'
                        }`}
                      >
                        {opt.slice(-2)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {exportScope === 'all' && (
              <div className="glass-card p-4 text-sm text-space-400">
                <p className="mb-2">将导出以下内容：</p>
                <ul className="space-y-1 text-xs">
                  <li>• 全部 {selectedTask?.channelCount || 0} 个通道的原始信号数据</li>
                  <li>• SNR 统计与通道质量评估</li>
                  <li>• 激活脑区定位结果（含 t 值、p 值）</li>
                  <li>• 血氧浓度（HbO/HbR/HbT）时间序列</li>
                  <li>• 任务参数配置记录</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-cyber-500/10">
          <button
            onClick={handlePreviewData}
            className="cyber-button-outline text-sm px-6 flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            预览数据
          </button>
          <button
            onClick={handleExportData}
            disabled={isExporting || !report}
            className="cyber-button text-sm px-6 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-space-900/30 border-t-space-900 rounded-full animate-spin" />
                导出中...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                导出数据
              </>
            )}
          </button>
        </div>

        {(previewResult || previewError) && (
          <div className="mt-6">
            <div className="glass-card overflow-hidden">
              <div className="px-5 py-3 border-b border-space-700/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-cyber-400" />
                  <h3 className="text-sm font-semibold text-white">数据预览</h3>
                  {previewResult && (
                    <span className="text-xs text-space-400">
                      · {previewResult.scopeLabel} · 显示前 {previewResult.shownRows} / {previewResult.totalRows} 行 · 格式 {exportFormat.toUpperCase()}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => { setPreviewResult(null); setPreviewError(null); }}
                  className="text-xs text-space-500 hover:text-space-300 transition-colors"
                >
                  关闭
                </button>
              </div>

              {previewError ? (
                <div className="p-6 text-center">
                  <AlertCircle className="w-8 h-8 text-warn-400 mx-auto mb-2" />
                  <p className="text-sm text-warn-300">{previewError}</p>
                </div>
              ) : previewResult ? (
                <div className="overflow-x-auto max-h-96 overflow-y-auto">
                  {previewResult.rows.length === 0 ? (
                    <div className="p-6 text-center">
                      <p className="text-sm text-space-400">没有符合条件的数据行</p>
                    </div>
                  ) : (
                    <table className="w-full text-xs">
                      <thead className="bg-space-900/80 sticky top-0 z-10">
                        <tr>
                          {previewResult.columns.map((col, ci) => (
                            <th
                              key={ci}
                              className="px-3 py-2 text-left text-space-300 font-medium border-b border-space-700/50 whitespace-nowrap"
                            >
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {previewResult.rows.map((row, ri) => (
                          <tr key={ri} className="hover:bg-cyber-500/5 border-b border-space-800/30">
                            {row.map((cell, ci) => {
                              const cellStr =
                                typeof cell === 'number'
                                  ? cell < 1 && cell > 0
                                    ? cell.toFixed(4)
                                    : cell.toFixed(2)
                                  : String(cell);
                              const isNum = typeof cell === 'number';
                              const isValid = previewResult.columns[ci] === '有效' && cell === '是';
                              return (
                                <td
                                  key={ci}
                                  className={`px-3 py-2 whitespace-nowrap ${
                                    isNum
                                      ? 'font-mono text-cyber-300'
                                      : isValid
                                      ? 'text-bio-400'
                                      : cell === '否'
                                      ? 'text-danger-400'
                                      : 'text-space-200'
                                  }`}
                                >
                                  {cellStr}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
