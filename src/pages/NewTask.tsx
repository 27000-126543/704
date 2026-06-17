import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Upload,
  Brain,
  LayoutGrid,
  Settings2,
  FileCheck2,
  Plus,
  X,
  FileText,
  Signal,
  Zap,
  Waves,
} from 'lucide-react';
import { useTaskStore } from '../store/useTaskStore';
import { useSimulationStore } from '../store/useSimulationStore';
import { useUserStore } from '../store/useUserStore';
import { TaskStatus, HeadModel, OptrodeLayout } from '../types';
import { formatNumber } from '../utils/helpers';

const STEPS = [
  { id: 1, title: '头模选择', icon: Brain, description: '选择或上传头模文件' },
  { id: 2, title: '布局配置', icon: LayoutGrid, description: '配置光极布局方案' },
  { id: 3, title: '参数设置', icon: Settings2, description: '设置模拟参数' },
  { id: 4, title: '确认提交', icon: FileCheck2, description: '确认信息并创建任务' },
];

interface FormData {
  taskName: string;
  description: string;
  selectedHeadModelId: string;
  selectedLayoutId: string;
  snrThreshold: number;
  sourcePower: number;
  wavelengths: number[];
}

export default function NewTask() {
  const navigate = useNavigate();
  const { addTask } = useTaskStore();
  const { headModels, layouts } = useSimulationStore();
  const { currentUser } = useUserStore();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    taskName: '',
    description: '',
    selectedHeadModelId: headModels[0]?.id || '',
    selectedLayoutId: layouts[0]?.id || '',
    snrThreshold: 25,
    sourcePower: 5,
    wavelengths: [760, 850],
  });

  const selectedHeadModel = headModels.find((m) => m.id === formData.selectedHeadModelId);
  const selectedLayout = layouts.find((l) => l.id === formData.selectedLayoutId);

  const updateForm = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const toggleWavelength = (wl: number) => {
    setFormData((prev) => ({
      ...prev,
      wavelengths: prev.wavelengths.includes(wl)
        ? prev.wavelengths.filter((w) => w !== wl)
        : [...prev.wavelengths, wl].sort((a, b) => a - b),
    }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.taskName.trim() && formData.selectedHeadModelId;
      case 2:
        return formData.selectedLayoutId;
      case 3:
        return formData.snrThreshold > 0 && formData.sourcePower > 0 && formData.wavelengths.length > 0;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (currentStep < 4 && canProceed()) {
      setCurrentStep((s) => s + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep((s) => s - 1);
    }
  };

  const handleSubmit = async () => {
    if (!selectedHeadModel || !selectedLayout || !currentUser) return;

    setIsSubmitting(true);

    setTimeout(() => {
      addTask({
        name: formData.taskName,
        status: TaskStatus.PENDING_VALIDATION,
        progress: 0,
        headModelId: selectedHeadModel.id,
        headModelName: selectedHeadModel.name,
        layoutId: selectedLayout.id,
        layoutName: selectedLayout.name,
        userId: currentUser.id,
        userName: currentUser.name,
        snrThreshold: formData.snrThreshold,
        channelCount: selectedLayout.channelCount,
        convergenceCount: 0,
        description: formData.description,
      });

      setIsSubmitting(false);
      navigate('/tasks');
    }, 800);
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {STEPS.map((step, index) => {
        const isActive = currentStep === step.id;
        const isCompleted = currentStep > step.id;
        const Icon = step.icon;

        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  isCompleted
                    ? 'bg-bio-500/20 border-bio-500 text-bio-400'
                    : isActive
                    ? 'bg-cyber-500/20 border-cyber-400 text-cyber-300 shadow-glow-cyber'
                    : 'bg-space-800/60 border-space-600 text-space-500'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>
              <div className="mt-2 text-center">
                <p
                  className={`text-xs font-semibold ${
                    isActive ? 'text-cyber-300' : isCompleted ? 'text-space-300' : 'text-space-500'
                  }`}
                >
                  {step.title}
                </p>
                <p className="text-[10px] text-space-600 mt-0.5 max-w-[100px]">{step.description}</p>
              </div>
            </div>
            {index < STEPS.length - 1 && (
              <div className="w-16 h-0.5 mx-2 -mt-6">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    currentStep > step.id ? 'bg-bio-500' : 'bg-space-700'
                  }`}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6 fade-in">
      <div>
        <label className="block text-sm font-medium text-space-300 mb-2">
          任务名称 <span className="text-danger-400">*</span>
        </label>
        <input
          type="text"
          value={formData.taskName}
          onChange={(e) => updateForm('taskName', e.target.value)}
          placeholder="请输入模拟任务名称"
          className="cyber-input"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-space-300 mb-2">任务描述</label>
        <textarea
          value={formData.description}
          onChange={(e) => updateForm('description', e.target.value)}
          placeholder="可选：添加任务备注说明"
          rows={3}
          className="cyber-input resize-none"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-space-300">
            头模选择 <span className="text-danger-400">*</span>
          </label>
          <button className="cyber-button-outline text-xs py-1.5 px-3 flex items-center gap-1.5">
            <Upload className="w-3.5 h-3.5" />
            上传头模
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {headModels.map((model: HeadModel) => (
            <div
              key={model.id}
              onClick={() => updateForm('selectedHeadModelId', model.id)}
              className={`glass-card p-4 cursor-pointer transition-all duration-200 ${
                formData.selectedHeadModelId === model.id
                  ? 'border-cyber-400 shadow-glow-cyber bg-cyber-500/5'
                  : 'hover:border-cyber-500/40'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-space-700/80 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-cyber-400" />
                </div>
                {formData.selectedHeadModelId === model.id && (
                  <div className="w-5 h-5 rounded-full bg-cyber-500 flex items-center justify-center">
                    <Check className="w-3 h-3 text-space-900" />
                  </div>
                )}
              </div>
              <p className="text-sm font-medium text-white mb-1 truncate">{model.name}</p>
              <div className="flex items-center gap-3 text-xs text-space-400">
                <span className="font-mono">{model.fileFormat}</span>
                <span>体素: {model.voxelCount.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1 mt-2 flex-wrap">
                {model.tissueLayers.slice(0, 4).map((layer) => (
                  <span
                    key={layer}
                    className="px-1.5 py-0.5 text-[10px] rounded bg-space-700/60 text-space-300"
                  >
                    {layer}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6 fade-in">
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-space-300">
            光极布局方案 <span className="text-danger-400">*</span>
          </label>
          <button className="cyber-button-outline text-xs py-1.5 px-3 flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            自定义布局
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {layouts.map((layout: OptrodeLayout) => (
            <div
              key={layout.id}
              onClick={() => updateForm('selectedLayoutId', layout.id)}
              className={`glass-card p-4 cursor-pointer transition-all duration-200 ${
                formData.selectedLayoutId === layout.id
                  ? 'border-cyber-400 shadow-glow-cyber bg-cyber-500/5'
                  : 'hover:border-cyber-500/40'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-space-700/80 flex items-center justify-center">
                  <LayoutGrid className="w-5 h-5 text-cyber-400" />
                </div>
                {formData.selectedLayoutId === layout.id && (
                  <div className="w-5 h-5 rounded-full bg-cyber-500 flex items-center justify-center">
                    <Check className="w-3 h-3 text-space-900" />
                  </div>
                )}
              </div>
              <p className="text-sm font-medium text-white mb-1 truncate">{layout.name}</p>
              {layout.description && (
                <p className="text-xs text-space-500 mb-3 line-clamp-2">{layout.description}</p>
              )}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-cyber-500/10">
                <div>
                  <p className="text-[10px] text-space-500">通道</p>
                  <p className="text-sm font-mono text-cyber-400">{layout.channelCount}</p>
                </div>
                <div>
                  <p className="text-[10px] text-space-500">光源</p>
                  <p className="text-sm font-mono text-warn-400">{layout.sourceCount}</p>
                </div>
                <div>
                  <p className="text-[10px] text-space-500">探测器</p>
                  <p className="text-sm font-mono text-bio-400">{layout.detectorCount}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6 fade-in max-w-3xl mx-auto">
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Signal className="w-5 h-5 text-cyber-400" />
          <h3 className="text-sm font-semibold text-cyber-300">SNR 阈值设置</h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-space-300">最低信噪比阈值</span>
            <span className="text-lg font-mono font-bold text-cyber-400">
              {formData.snrThreshold} dB
            </span>
          </div>
          <input
            type="range"
            min={10}
            max={50}
            step={1}
            value={formData.snrThreshold}
            onChange={(e) => updateForm('snrThreshold', Number(e.target.value))}
            className="w-full h-2 bg-space-700 rounded-lg appearance-none cursor-pointer accent-cyber-400"
          />
          <div className="flex justify-between text-[11px] text-space-500 font-mono">
            <span>10 dB</span>
            <span>30 dB</span>
            <span>50 dB</span>
          </div>
        </div>
      </div>

      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-warn-400" />
          <h3 className="text-sm font-semibold text-warn-400">光源功率</h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-space-300">输出功率</span>
            <span className="text-lg font-mono font-bold text-warn-400">
              {formData.sourcePower} mW
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={20}
            step={0.5}
            value={formData.sourcePower}
            onChange={(e) => updateForm('sourcePower', Number(e.target.value))}
            className="w-full h-2 bg-space-700 rounded-lg appearance-none cursor-pointer accent-warn-400"
          />
          <div className="flex justify-between text-[11px] text-space-500 font-mono">
            <span>1 mW</span>
            <span>10 mW</span>
            <span>20 mW</span>
          </div>
        </div>
      </div>

      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Waves className="w-5 h-5 text-bio-400" />
          <h3 className="text-sm font-semibold text-bio-400">波长组合</h3>
        </div>
        <div className="flex flex-wrap gap-3">
          {[690, 730, 760, 808, 830, 850, 940, 980].map((wl) => (
            <button
              key={wl}
              onClick={() => toggleWavelength(wl)}
              className={`px-4 py-2 rounded-lg font-mono text-sm transition-all border ${
                formData.wavelengths.includes(wl)
                  ? 'bg-bio-500/20 border-bio-500/50 text-bio-300'
                  : 'bg-space-800/60 border-cyber-500/10 text-space-400 hover:border-bio-500/30'
              }`}
            >
              {wl} nm
            </button>
          ))}
        </div>
        <p className="text-xs text-space-500 mt-3">
          已选择 {formData.wavelengths.length} 个波长：
          {formData.wavelengths.map((w) => `${w}nm`).join(' / ')}
        </p>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6 fade-in max-w-4xl mx-auto">
      <div className="glass-card overflow-hidden">
        <div className="px-5 py-3 border-b border-cyber-500/10 bg-cyber-500/5">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyber-400" />
            <h3 className="text-sm font-semibold text-cyber-300">任务基本信息</h3>
          </div>
        </div>
        <div className="p-5 grid grid-cols-2 gap-4">
          <div>
            <p className="data-label mb-1">任务名称</p>
            <p className="text-sm text-white">{formData.taskName || '--'}</p>
          </div>
          <div>
            <p className="data-label mb-1">创建者</p>
            <p className="text-sm text-white">{currentUser?.name || '--'}</p>
          </div>
          <div className="col-span-2">
            <p className="data-label mb-1">任务描述</p>
            <p className="text-sm text-space-300">{formData.description || '无描述'}</p>
          </div>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="px-5 py-3 border-b border-cyber-500/10 bg-cyber-500/5">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-cyber-400" />
            <h3 className="text-sm font-semibold text-cyber-300">头模与布局</h3>
          </div>
        </div>
        <div className="p-5 grid grid-cols-2 gap-4">
          <div>
            <p className="data-label mb-1">头模</p>
            <p className="text-sm text-white">{selectedHeadModel?.name || '--'}</p>
            {selectedHeadModel && (
              <p className="text-xs text-space-500 font-mono mt-0.5">
                {selectedHeadModel.fileFormat} · {selectedHeadModel.voxelCount.toLocaleString()} 体素
              </p>
            )}
          </div>
          <div>
            <p className="data-label mb-1">光极布局</p>
            <p className="text-sm text-white">{selectedLayout?.name || '--'}</p>
            {selectedLayout && (
              <p className="text-xs text-space-500 font-mono mt-0.5">
                {selectedLayout.channelCount} 通道 · {selectedLayout.sourceCount} 光源 · {selectedLayout.detectorCount} 探测器
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="px-5 py-3 border-b border-cyber-500/10 bg-cyber-500/5">
          <div className="flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-cyber-400" />
            <h3 className="text-sm font-semibold text-cyber-300">模拟参数</h3>
          </div>
        </div>
        <div className="p-5 grid grid-cols-3 gap-4">
          <div>
            <p className="data-label mb-1">SNR 阈值</p>
            <p className="text-lg font-mono font-bold text-cyber-400">{formData.snrThreshold} dB</p>
          </div>
          <div>
            <p className="data-label mb-1">光源功率</p>
            <p className="text-lg font-mono font-bold text-warn-400">{formData.sourcePower} mW</p>
          </div>
          <div>
            <p className="data-label mb-1">波长</p>
            <p className="text-sm font-mono text-bio-400">
              {formData.wavelengths.map((w) => `${w}nm`).join(' / ')}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-3 p-4 rounded-lg bg-warn-500/10 border border-warn-500/30">
        <X className="w-5 h-5 text-warn-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-warn-300">提交前请注意</p>
          <p className="text-xs text-warn-400/80 mt-1">
            任务创建后将自动进入校验队列，参数提交后无法修改，请确认配置无误。
            预计运行时间取决于通道数量和头模复杂度，约 {formatNumber((selectedLayout?.channelCount || 0) * 1.5, 0)} - {formatNumber((selectedLayout?.channelCount || 0) * 3, 0)} 分钟。
          </p>
        </div>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <span className="w-1 h-7 bg-gradient-to-b from-cyber-400 to-cyber-600 rounded-full" />
            新建模拟任务
          </h1>
          <p className="text-sm text-space-500 mt-1">步骤 {currentStep} / 4</p>
        </div>
      </div>

      <div className="glass-card p-6">
        {renderStepIndicator()}

        <div className="min-h-[400px] py-4">
          {renderCurrentStep()}
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-cyber-500/10">
          <button
            onClick={handlePrev}
            disabled={currentStep === 1 || isSubmitting}
            className="cyber-button-outline flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            上一步
          </button>

          {currentStep < 4 ? (
            <button
              onClick={handleNext}
              disabled={!canProceed() || isSubmitting}
              className="cyber-button flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              下一步
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="cyber-button flex items-center gap-2 disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-space-900/30 border-t-space-900 rounded-full animate-spin" />
                  创建中...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  提交创建
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
