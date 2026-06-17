import { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import {
  Sparkles,
  Layers,
  Sun,
  Zap,
  Target,
  CheckCircle2,
  XCircle,
  Check,
  TrendingUp,
  Signal,
  Gauge,
} from 'lucide-react';
import { ProgressRing } from '../components/common/ProgressRing';
import { StatCard } from '../components/common/StatCard';
import { useReportStore } from '../store/useReportStore';
import { formatNumber, formatPercent } from '../utils/helpers';

export default function Recommend() {
  const { layoutRecommendations, wavelengthRecommendations } = useReportStore();
  const [selectedLayout, setSelectedLayout] = useState<string>(layoutRecommendations[0]?.id || '');
  const [selectedWavelength, setSelectedWavelength] = useState<number>(0);

  const confidenceChartOption = {
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
      data: layoutRecommendations.map((r) => r.name.slice(0, 6)),
      axisLine: { lineStyle: { color: '#00D4FF30' } },
      axisLabel: { color: '#2A4F7A', fontSize: 10 },
    },
    yAxis: {
      type: 'value',
      min: 0.7, max: 1,
      axisLine: { lineStyle: { color: '#00D4FF30' } },
      axisLabel: { color: '#2A4F7A', fontFamily: 'JetBrains Mono', fontSize: 10, formatter: (v: number) => (v * 100).toFixed(0) + '%' },
      splitLine: { lineStyle: { color: '#00D4FF10' } },
    },
    series: [{
      type: 'bar',
      data: layoutRecommendations.map((r) => r.confidence),
      itemStyle: {
        color: {
          type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: '#00FF9D' },
            { offset: 1, color: '#00D4FF' },
          ],
        },
        borderRadius: [4, 4, 0, 0],
      },
      barWidth: '45%',
      label: {
        show: true,
        position: 'top',
        color: '#00D4FF',
        fontFamily: 'JetBrains Mono',
        fontSize: 10,
        formatter: (p: { value: number }) => (p.value * 100).toFixed(0) + '%',
      },
    }],
  };

  const wavelengthCompareOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(15, 31, 56, 0.95)',
      borderColor: '#00D4FF40',
      textStyle: { color: '#C8E6FF', fontFamily: 'JetBrains Mono' },
      axisPointer: { type: 'shadow' },
    },
    legend: {
      data: ['预期SNR(dB)', '穿透深度(mm)'],
      textStyle: { color: '#2A4F7A', fontSize: 10 },
      top: 0,
    },
    grid: { left: 50, right: 30, top: 40, bottom: 30 },
    xAxis: {
      type: 'category',
      data: wavelengthRecommendations.map((w) => w.wavelengths.join('/') + 'nm'),
      axisLine: { lineStyle: { color: '#00D4FF30' } },
      axisLabel: { color: '#2A4F7A', fontSize: 10 },
    },
    yAxis: [
      {
        type: 'value', name: 'SNR',
        nameTextStyle: { color: '#2A4F7A', fontSize: 10 },
        axisLine: { lineStyle: { color: '#00D4FF30' } },
        axisLabel: { color: '#2A4F7A', fontFamily: 'JetBrains Mono', fontSize: 10 },
        splitLine: { lineStyle: { color: '#00D4FF10' } },
      },
      {
        type: 'value', name: '深度',
        nameTextStyle: { color: '#2A4F7A', fontSize: 10 },
        axisLine: { lineStyle: { color: '#00D4FF30' } },
        axisLabel: { color: '#2A4F7A', fontFamily: 'JetBrains Mono', fontSize: 10 },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: '预期SNR(dB)', type: 'bar', barWidth: '30%',
        data: wavelengthRecommendations.map((w) => w.expectedSNR),
        itemStyle: { color: '#00D4FF', borderRadius: [3, 3, 0, 0] },
      },
      {
        name: '穿透深度(mm)', type: 'bar', barWidth: '30%', yAxisIndex: 1,
        data: wavelengthRecommendations.map((w) => w.expectedPenetration),
        itemStyle: { color: '#00FF9D', borderRadius: [3, 3, 0, 0] },
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-cyber-300 flex items-center gap-3">
            <Sparkles className="w-7 h-7" />
            智能推荐引擎
          </h1>
          <p className="text-sm text-space-500 mt-1">基于历史数据的光极布局与波长组合智能推荐</p>
        </div>
      </div>

      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="section-title !mb-0">
            <Layers className="w-5 h-5" />
            光极布局推荐
          </h2>
          <div className="flex items-center gap-2 text-xs text-space-500">
            <Signal className="w-4 h-4" />
            基于 {layoutRecommendations.reduce((s, r) => s + r.basedOnTaskCount, 0)} 次历史任务训练
          </div>
        </div>

        <div className="grid grid-cols-5 gap-4 mb-5">
          {layoutRecommendations.map((rec) => (
            <div
              key={rec.id}
              onClick={() => setSelectedLayout(rec.id)}
              className={`glass-card p-4 cursor-pointer transition-all relative ${
                selectedLayout === rec.id
                  ? 'border-cyber-400 shadow-glow-cyber bg-cyber-500/5'
                  : 'hover:border-cyber-500/40'
              }`}
            >
              {selectedLayout === rec.id && (
                <div className="absolute top-2 right-2">
                  <Check className="w-4 h-4 text-cyber-400" />
                </div>
              )}
              <div className="flex justify-center mb-3">
                <ProgressRing
                  progress={rec.confidence * 100}
                  size={64}
                  strokeWidth={5}
                  color={rec.confidence >= 0.9 ? '#00FF9D' : rec.confidence >= 0.85 ? '#00D4FF' : '#FFA64D'}
                />
              </div>
              <h3 className="text-sm font-semibold text-cyber-200 text-center mb-1">{rec.name}</h3>
              <p className="text-[11px] text-space-500 text-center mb-3 line-clamp-2">{rec.description}</p>

              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-space-500">基于任务</span>
                  <span className="font-mono text-cyber-300">{rec.basedOnTaskCount}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-space-500">平均SNR</span>
                  <span className="font-mono text-bio-400">{formatNumber(rec.avgSNR, 1)} dB</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-space-500">覆盖率</span>
                  <span className="font-mono text-cyber-300">{formatPercent(rec.avgCoverage, 0)}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-space-500">通道数</span>
                  <span className="font-mono text-cyber-300">{rec.channelCount}</span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-cyber-500/10">
                <p className="text-[10px] text-space-500 mb-1.5">目标脑区</p>
                <div className="flex flex-wrap gap-1">
                  {rec.targetRegions.slice(0, 4).map((r) => (
                    <span key={r} className="px-1.5 py-0.5 bg-cyber-500/10 text-cyber-300 rounded text-[10px] font-mono">
                      {r}
                    </span>
                  ))}
                  {rec.targetRegions.length > 4 && (
                    <span className="px-1.5 py-0.5 text-space-500 text-[10px]">+{rec.targetRegions.length - 4}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="glass-card p-4">
          <h3 className="text-sm font-semibold text-cyber-300 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            置信度对比
          </h3>
          <ReactECharts option={confidenceChartOption} style={{ height: 220 }} />
        </div>
      </div>

      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="section-title !mb-0">
            <Sun className="w-5 h-5" />
            波长组合推荐
          </h2>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-5">
          {wavelengthRecommendations.map((rec, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedWavelength(idx)}
              className={`glass-card p-5 cursor-pointer transition-all relative ${
                selectedWavelength === idx
                  ? 'border-cyber-400 shadow-glow-cyber bg-cyber-500/5'
                  : 'hover:border-cyber-500/40'
              }`}
            >
              {selectedWavelength === idx && (
                <div className="absolute top-3 right-3">
                  <Check className="w-4 h-4 text-cyber-400" />
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div className="flex -space-x-2">
                  {rec.wavelengths.map((w) => (
                    <div
                      key={w}
                      className="w-10 h-10 rounded-full flex items-center justify-center font-mono text-[10px] border-2 border-space-900"
                      style={{
                        background: `linear-gradient(135deg, ${w < 750 ? '#FF6B85' : w < 820 ? '#00D4FF' : '#00FF9D'}40, ${w < 750 ? '#FF6B85' : w < 820 ? '#00D4FF' : '#00FF9D'}10)`,
                        color: w < 750 ? '#FF6B85' : w < 820 ? '#00D4FF' : '#00FF9D',
                      }}
                    >
                      {w}
                    </div>
                  ))}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-cyber-200">
                    {rec.wavelengths.join(' / ')} nm
                  </h3>
                  <p className="text-[11px] text-space-500">{rec.wavelengths.length}波长方案</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Zap className="w-3 h-3 text-cyber-400" />
                    <span className="text-[10px] text-space-500">预期SNR</span>
                  </div>
                  <p className="font-mono text-lg text-cyber-300">{formatNumber(rec.expectedSNR, 1)}</p>
                  <p className="text-[10px] text-space-500">dB</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Gauge className="w-3 h-3 text-bio-400" />
                    <span className="text-[10px] text-space-500">穿透深度</span>
                  </div>
                  <p className="font-mono text-lg text-bio-400">{rec.expectedPenetration}</p>
                  <p className="text-[10px] text-space-500">mm</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Target className="w-3 h-3 text-warn-400" />
                    <span className="text-[10px] text-space-500">置信度</span>
                  </div>
                  <p className="font-mono text-lg text-warn-400">{formatPercent(rec.confidence, 0)}</p>
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t border-cyber-500/10">
                <div>
                  <p className="text-[11px] text-space-500 mb-1.5 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-bio-400" />
                    优势
                  </p>
                  <ul className="space-y-0.5">
                    {rec.pros.map((p, i) => (
                      <li key={i} className="text-[11px] text-space-300 flex items-start gap-1.5">
                        <span className="text-bio-400 mt-0.5">•</span>
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-[11px] text-space-500 mb-1.5 flex items-center gap-1">
                    <XCircle className="w-3 h-3 text-danger-400" />
                    劣势
                  </p>
                  <ul className="space-y-0.5">
                    {rec.cons.map((c, i) => (
                      <li key={i} className="text-[11px] text-space-300 flex items-start gap-1.5">
                        <span className="text-danger-400 mt-0.5">•</span>
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="glass-card p-4">
          <h3 className="text-sm font-semibold text-cyber-300 mb-3 flex items-center gap-2">
            <Signal className="w-4 h-4" />
            波长方案对比
          </h3>
          <ReactECharts option={wavelengthCompareOption} style={{ height: 220 }} />
        </div>
      </div>

      <div className="glass-card p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="section-title !mb-0">
              <CheckCircle2 className="w-5 h-5" />
              应用推荐配置
            </h2>
            <p className="text-sm text-space-500 mt-1">将所选配置应用于新建模拟任务</p>
          </div>
          <div className="flex gap-3">
            <button className="cyber-button-outline px-6 text-sm">重置选择</button>
            <button className="cyber-button px-8 text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              应用推荐方案
            </button>
          </div>
        </div>

        {selectedLayout && (
          <div className="mt-4 grid grid-cols-2 gap-4">
            <StatCard
              title="已选布局"
              value={layoutRecommendations.find((r) => r.id === selectedLayout)?.name || ''}
              icon={Layers}
              color="cyber"
              description={`置信度 ${formatPercent((layoutRecommendations.find((r) => r.id === selectedLayout)?.confidence || 0), 0)}`}
            />
            <StatCard
              title="已选波长"
              value={`${wavelengthRecommendations[selectedWavelength]?.wavelengths.join('/')} nm`}
              icon={Sun}
              color="bio"
              description={`预期SNR ${formatNumber(wavelengthRecommendations[selectedWavelength]?.expectedSNR || 0, 1)} dB`}
            />
          </div>
        )}
      </div>
    </div>
  );
}
