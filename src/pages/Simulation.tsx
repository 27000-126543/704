import { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import {
  Upload,
  Brain,
  Grid3X3,
  Layers,
  Play,
  Pause,
  RefreshCw,
  FileSpreadsheet,
  Box,
  Check,
  ChevronRight,
  Sun,
  Target,
  Ruler,
  Sparkles,
  Loader2,
  Wand2,
} from 'lucide-react';
import { useSimulationStore } from '../store/useSimulationStore';
import { TissueLayer, TissueLayerLabels } from '../types';
import { formatNumber, formatDateTime } from '../utils/helpers';
import { cn } from '../utils/helpers';

const FILE_FORMATS = [
  { value: 'NIfTI', icon: FileSpreadsheet, desc: '神经影像格式' },
  { value: 'STL', icon: Box, desc: '3D打印格式' },
  { value: 'OBJ', icon: Layers, desc: '三维模型格式' },
];

export default function Simulation() {
  const {
    headModels,
    layouts,
    opticalProperties,
    selectedHeadModelId,
    selectedLayoutId,
    selectHeadModel,
    selectLayout,
    updateOpticalProperty,
    isRunning,
    setRunning,
  } = useSimulationStore();

  const [selectedFormat, setSelectedFormat] = useState<string>('NIfTI');
  const [isDragging, setIsDragging] = useState(false);
  const [meshParams, setMeshParams] = useState({
    maxElementSize: 2.0,
    smoothingIterations: 5,
    qualityThreshold: 0.3,
  });
  const [meshGenerated, setMeshGenerated] = useState(false);
  const [meshQuality, setMeshQuality] = useState({
    totalElements: 0,
    qualityScore: 0,
    minQuality: 0,
    avgQuality: 0,
    maxAspectRatio: 0,
    generationTime: 0,
  });

  const selectedHead = headModels.find((h) => h.id === selectedHeadModelId);
  const selectedLayout = layouts.find((l) => l.id === selectedLayoutId);

  const handleGenerateMesh = () => {
    setMeshGenerated(true);
    setMeshQuality({
      totalElements: 2847652,
      qualityScore: 0.87,
      minQuality: 0.42,
      avgQuality: 0.78,
      maxAspectRatio: 4.8,
      generationTime: 12.4,
    });
  };

  const handleToggleRun = () => {
    setRunning(!isRunning);
  };

  const brainSVGOption = {
    animation: true,
  };

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Brain className="w-7 h-7 text-cyber-400" />
            三维光传输模拟
          </h1>
          <p className="text-sm text-space-500 mt-1">配置头模、光极布局与光学参数，运行蒙特卡洛光传输模拟</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="cyber-button-outline flex items-center gap-2" onClick={() => setRunning(false)}>
            <RefreshCw className={cn('w-4 h-4', isRunning && 'animate-spin')} />
            重置参数
          </button>
          <button
            className={cn(
              'cyber-button flex items-center gap-2',
              isRunning && 'bg-warn-500 hover:bg-warn-400 text-space-900 shadow-none'
            )}
            onClick={handleToggleRun}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4" />
                暂停模拟
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                开始模拟
              </>
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
        {/* 左栏 */}
        <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pr-1">
          {/* 头模上传区 */}
          <div className="glass-card p-4">
            <h2 className="section-title">
              <Upload className="w-5 h-5" />
              头模文件
            </h2>

            <div className="flex gap-2 mb-4">
              {FILE_FORMATS.map((f) => {
                const Icon = f.icon;
                const active = selectedFormat === f.value;
                return (
                  <button
                    key={f.value}
                    className={cn(
                      'flex-1 py-2 px-3 rounded border text-xs transition-all duration-200',
                      active
                        ? 'bg-cyber-500/20 border-cyber-400/60 text-cyber-300'
                        : 'bg-space-900/50 border-cyber-500/20 text-space-400 hover:border-cyber-500/40'
                    )}
                    onClick={() => setSelectedFormat(f.value)}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <Icon className="w-4 h-4" />
                      <span className="font-medium">{f.value}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div
              className={cn(
                'border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 cursor-pointer',
                isDragging
                  ? 'border-cyber-400 bg-cyber-500/10'
                  : 'border-cyber-500/30 bg-space-900/30 hover:border-cyber-500/50'
              )}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
              }}
            >
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-8 h-8 text-cyber-400 animate-float" />
                <p className="text-sm text-cyber-300 font-medium">拖拽文件到此处</p>
                <p className="text-xs text-space-500">或点击选择 {selectedFormat} 文件</p>
                <p className="text-[10px] text-space-600 mt-1">最大 500MB</p>
              </div>
            </div>

            <div className="mt-4">
              <p className="data-label mb-2">已选头模</p>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {headModels.map((h) => (
                  <div
                    key={h.id}
                    className={cn(
                      'p-3 rounded cursor-pointer transition-all duration-200 border',
                      selectedHeadModelId === h.id
                        ? 'bg-cyber-500/15 border-cyber-400/50'
                        : 'bg-space-900/40 border-cyber-500/10 hover:border-cyber-500/30'
                    )}
                    onClick={() => selectHeadModel(h.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {selectedHeadModelId === h.id && <Check className="w-3.5 h-3.5 text-cyber-400" />}
                        <span className="text-sm font-medium text-white truncate max-w-[140px]">{h.name}</span>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyber-500/20 text-cyber-400 font-mono">
                        {h.fileFormat}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-[10px] text-space-500 font-mono">
                      <span>{formatNumber(h.voxelCount, 0)} vox</span>
                      <span>·</span>
                      <span>{formatDateTime(h.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 光极布局 */}
          <div className="glass-card p-4 flex-1">
            <h2 className="section-title">
              <Grid3X3 className="w-5 h-5" />
              光极布局
            </h2>

            <div className="space-y-2">
              {layouts.map((l) => (
                <div
                  key={l.id}
                  className={cn(
                    'p-3 rounded cursor-pointer transition-all duration-200 border',
                    selectedLayoutId === l.id
                      ? 'bg-cyber-500/15 border-cyber-400/50'
                      : 'bg-space-900/40 border-cyber-500/10 hover:border-cyber-500/30'
                  )}
                  onClick={() => selectLayout(l.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">{l.name}</span>
                    {selectedLayoutId === l.id && <Check className="w-3.5 h-3.5 text-cyber-400" />}
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[11px]">
                    <div className="flex flex-col items-center p-1.5 rounded bg-space-900/50">
                      <span className="font-mono text-cyber-400 font-semibold">{l.channelCount}</span>
                      <span className="text-space-500">通道</span>
                    </div>
                    <div className="flex flex-col items-center p-1.5 rounded bg-space-900/50">
                      <span className="font-mono text-warn-400 font-semibold">{l.sourceCount}</span>
                      <span className="text-space-500">光源</span>
                    </div>
                    <div className="flex flex-col items-center p-1.5 rounded bg-space-900/50">
                      <span className="font-mono text-bio-400 font-semibold">{l.detectorCount}</span>
                      <span className="text-space-500">探测器</span>
                    </div>
                  </div>
                  <div className="mt-2 text-[10px] text-space-500 font-mono flex items-center gap-1">
                    <span>波长:</span>
                    {l.wavelengths.map((w, i) => (
                      <span key={i}>
                        {w}nm
                        {i < l.wavelengths.length - 1 && ','}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 中栏 - 3D视图 */}
        <div className="col-span-6 flex flex-col gap-4">
          <div className="glass-card flex-1 relative overflow-hidden scan-line-overlay">
            <div className="absolute inset-0 pointer-events-none opacity-30 bg-grid-pattern" />

            <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
              <div className="glass-card px-3 py-1.5 flex items-center gap-2">
                <Brain className="w-3.5 h-3.5 text-cyber-400" />
                <span className="text-xs text-cyber-300 font-medium">3D 视图</span>
              </div>
              {isRunning && (
                <div className="glass-card px-3 py-1.5 flex items-center gap-1.5 border-bio-500/50">
                  <div className="w-2 h-2 rounded-full bg-bio-400 animate-pulse" />
                  <span className="text-xs text-bio-400 font-medium">模拟运行中</span>
                </div>
              )}
            </div>

            <div className="absolute top-4 right-4 z-10 glass-card px-3 py-1.5 flex flex-col gap-1 text-[10px] font-mono">
              <div className="flex justify-between gap-4">
                <span className="text-space-500">头模</span>
                <span className="text-cyber-400">{selectedHead?.name || '-'}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-space-500">布局</span>
                <span className="text-cyber-400">{selectedLayout?.name || '-'}</span>
              </div>
            </div>

            <div className="h-full flex items-center justify-center">
              <div className="relative">
                <svg
                  width="420"
                  height="420"
                  viewBox="0 0 420 420"
                  className="animate-float"
                >
                  <defs>
                    <radialGradient id="brainGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#00D4FF" stopOpacity="0.3" />
                      <stop offset="70%" stopColor="#00D4FF" stopOpacity="0.05" />
                      <stop offset="100%" stopColor="#00D4FF" stopOpacity="0" />
                    </radialGradient>
                    <radialGradient id="brainInner" cx="50%" cy="40%" r="50%">
                      <stop offset="0%" stopColor="#0F1F38" />
                      <stop offset="100%" stopColor="#050B18" />
                    </radialGradient>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  <circle cx="210" cy="210" r="200" fill="url(#brainGlow)" />

                  <g filter="url(#glow)">
                    <ellipse
                      cx="210"
                      cy="210"
                      rx="140"
                      ry="155"
                      fill="url(#brainInner)"
                      stroke="#00D4FF"
                      strokeWidth="1.5"
                      strokeOpacity="0.6"
                    />

                    <path
                      d="M100 180 Q130 130 180 120 Q220 115 260 130 Q300 150 310 190 Q320 230 300 260 Q270 290 230 295 Q190 290 160 275 Q120 255 105 220 Q95 200 100 180 Z"
                      fill="none"
                      stroke="#1ADBFF"
                      strokeWidth="1"
                      strokeOpacity="0.4"
                    />
                    <path
                      d="M130 160 Q160 150 190 155 Q220 150 250 160 Q275 175 280 200 Q275 220 260 235 Q235 245 210 240 Q185 245 165 235 Q145 220 140 200 Q135 180 130 160 Z"
                      fill="none"
                      stroke="#4DE3FF"
                      strokeWidth="0.8"
                      strokeOpacity="0.3"
                    />

                    <path
                      d="M150 140 Q170 130 200 140 Q230 130 260 145"
                      fill="none"
                      stroke="#00D4FF"
                      strokeWidth="1"
                      strokeOpacity="0.5"
                    />
                    <path
                      d="M155 190 Q180 185 210 190 Q240 185 265 195"
                      fill="none"
                      stroke="#00D4FF"
                      strokeWidth="0.8"
                      strokeOpacity="0.4"
                    />
                    <path
                      d="M160 230 Q190 225 220 230 Q250 225 270 240"
                      fill="none"
                      stroke="#00D4FF"
                      strokeWidth="0.6"
                      strokeOpacity="0.35"
                    />
                  </g>

                  {selectedLayout?.optrodes.slice(0, 16).map((o, i) => {
                    const angle = (i / 16) * Math.PI * 2;
                    const radius = o.type === 'source' ? 110 : 95;
                    const cx = 210 + Math.cos(angle) * radius;
                    const cy = 210 + Math.sin(angle) * 10;
                    const color = o.type === 'source' ? '#FF8A00' : '#00FF9D';
                    return (
                      <g key={o.id}>
                        <circle cx={cx} cy={cy} r="8" fill={color} fillOpacity="0.25" className="animate-breath" />
                        <circle cx={cx} cy={cy} r="4" fill={color} filter="url(#glow)" />
                      </g>
                    );
                  })}

                  {Array.from({ length: 24 }).map((_, i) => {
                    const angle1 = (i / 24) * Math.PI * 2 + Math.PI / 24;
                    const r1 = 100;
                    const r2 = 120;
                    const x1 = 210 + Math.cos(angle1) * r1;
                    const y1 = 210 + Math.sin(angle1) * 10;
                    const angle2 = ((i + 3) % 24) / 24 * Math.PI * 2 + Math.PI / 24;
                    const x2 = 210 + Math.cos(angle2) * r2;
                    const y2 = 210 + Math.sin(angle2) * 10;
                    return (
                      <line
                        key={`line-${i}`}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="#00D4FF"
                        strokeWidth="0.5"
                        strokeOpacity="0.3"
                        strokeDasharray="3 3"
                      />
                    );
                  })}
                </svg>

                {isRunning && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-4 h-4 rounded-full bg-cyber-400 animate-ping opacity-60" />
                  </div>
                )}
              </div>
            </div>

            {!meshGenerated && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 glass-card px-4 py-2 flex items-center gap-2 text-xs text-space-400">
                <Loader2 className="w-3.5 h-3.5 text-cyber-400 animate-spin" />
                等待网格生成...
              </div>
            )}

            <div className="absolute bottom-4 right-4 glass-card p-3 text-[10px] font-mono">
              <div className="flex items-center gap-1.5 mb-1">
                <Sun className="w-3 h-3 text-warn-400" />
                <span className="text-space-400">光源</span>
                <span className="text-space-600">|</span>
                <Target className="w-3 h-3 text-bio-400" />
                <span className="text-space-400">探测器</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-space-500">XYZ:</span>
                <span className="text-cyber-400">
                  {selectedLayout?.sourceCount || 0}S / {selectedLayout?.detectorCount || 0}D
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 右栏 */}
        <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pl-1">
          {/* 光学属性编辑器 */}
          <div className="glass-card p-4">
            <h2 className="section-title">
              <Layers className="w-5 h-5" />
              光学属性
            </h2>

            <div className="space-y-3">
              {opticalProperties.map((prop) => (
              <div
                key={prop.layer}
                className="p-3 rounded bg-space-900/60 border border-cyber-500/10"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-cyber-300">
                  {TissueLayerLabels[prop.layer as TissueLayer]}
                  </span>
                  <span className="text-[10px] text-space-500 font-mono">
                  厚度 {prop.thickness}mm
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="data-label block mb-1">吸收系数</label>
                    <input
                      type="number"
                      step="0.01"
                      value={prop.absorptionCoefficient}
                      onChange={(e) =>
                        updateOpticalProperty(
                          prop.layer,
                          'absorptionCoefficient',
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="cyber-input text-xs font-mono py-1.5"
                    />
                    <span className="text-[9px] text-space-600">cm⁻¹</span>
                  </div>
                  <div>
                    <label className="data-label block mb-1">散射系数</label>
                    <input
                      type="number"
                      step="0.1"
                      value={prop.scatteringCoefficient}
                      onChange={(e) =>
                        updateOpticalProperty(
                          prop.layer,
                          'scatteringCoefficient',
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="cyber-input text-xs font-mono py-1.5"
                    />
                    <span className="text-[9px] text-space-600">cm⁻¹</span>
                  </div>
                  <div>
                    <label className="data-label block mb-1">各向异性</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      value={prop.anisotropy}
                      onChange={(e) =>
                        updateOpticalProperty(
                          prop.layer,
                          'anisotropy',
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="cyber-input text-xs font-mono py-1.5"
                    />
                    <span className="text-[9px] text-space-600">g</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          </div>

          {/* 网格生成控制 */}
          <div className="glass-card p-4 flex-1">
            <h2 className="section-title">
              <Wand2 className="w-5 h-5" />
              网格生成
            </h2>

            <div className="space-y-3">
              <div>
                <label className="data-label block mb-1.5 flex justify-between">
                  <span>最大单元尺寸</span>
                  <span className="text-cyber-400 font-mono">{meshParams.maxElementSize} mm</span>
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="5"
                  step="0.1"
                  value={meshParams.maxElementSize}
                  onChange={(e) =>
                    setMeshParams({ ...meshParams, maxElementSize: parseFloat(e.target.value) })
                  }
                  className="w-full accent-cyber-400"
                />
              </div>

              <div>
                <label className="data-label block mb-1.5 flex justify-between">
                  <span>平滑迭代次数</span>
                  <span className="text-cyber-400 font-mono">{meshParams.smoothingIterations}</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="15"
                  step="1"
                  value={meshParams.smoothingIterations}
                  onChange={(e) =>
                    setMeshParams({ ...meshParams, smoothingIterations: parseInt(e.target.value) })
                  }
                  className="w-full accent-cyber-400"
                />
              </div>

              <div>
                <label className="data-label block mb-1.5 flex justify-between">
                  <span>质量阈值</span>
                  <span className="text-cyber-400 font-mono">{meshParams.qualityThreshold}</span>
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="0.8"
                  step="0.05"
                  value={meshParams.qualityThreshold}
                  onChange={(e) =>
                    setMeshParams({ ...meshParams, qualityThreshold: parseFloat(e.target.value) })
                  }
                  className="w-full accent-cyber-400"
                />
              </div>

              <button
                className="cyber-button w-full flex items-center justify-center gap-2 mt-2"
                onClick={handleGenerateMesh}
              >
                <Sparkles className="w-4 h-4" />
                生成网格
              </button>
            </div>

            {meshGenerated && (
              <div className="mt-4 pt-4 border-t border-cyber-500/20">
              <p className="data-label mb-3 flex items-center gap-1.5">
                <Ruler className="w-3 h-3" />
                网格质量指标
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded bg-space-900/50">
                  <p className="text-[10px] text-space-500">单元总数</p>
                  <p className="font-mono text-sm text-cyber-400">
                    {formatNumber(meshQuality.totalElements, 0)}
                  </p>
                </div>
                <div className="p-2 rounded bg-space-900/50">
                  <p className="text-[10px] text-space-500">质量评分</p>
                  <p className="font-mono text-sm text-bio-400">
                    {formatNumber(meshQuality.qualityScore * 100, 1)}%
                  </p>
                </div>
                <div className="p-2 rounded bg-space-900/50">
                  <p className="text-[10px text-space-500">平均质量</p>
                  <p className="font-mono text-sm text-cyber-400">
                    {formatNumber(meshQuality.avgQuality, 2)}
                  </p>
                </div>
                <div className="p-2 rounded bg-space-900/50">
                  <p className="text-[10px] text-space-500">最大纵横比</p>
                  <p className="font-mono text-sm text-warn-400">
                    {formatNumber(meshQuality.maxAspectRatio, 1)}
                  </p>
                </div>
                <div className="p-2 rounded bg-space-900/50">
                  <p className="text-[10px text-space-500">最小质量</p>
                  <p className="font-mono text-sm text-cyber-400">
                    {formatNumber(meshQuality.minQuality, 2)}
                  </p>
                </div>
                <div className="p-2 rounded bg-space-900/50">
                  <p className="text-[10px] text-space-500">生成耗时</p>
                  <p className="font-mono text-sm text-bio-400">
                    {formatNumber(meshQuality.generationTime, 1)}s
                  </p>
                </div>
              </div>
            </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
