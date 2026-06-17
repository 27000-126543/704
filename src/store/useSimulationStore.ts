import { create } from 'zustand';
import {
  HeadModel,
  OptrodeLayout,
  ChannelData,
  TissueOpticalProperty,
  MeshQuality,
  DEFAULT_OPTICAL_PROPERTIES,
} from '../types';
import {
  MOCK_HEAD_MODELS,
  MOCK_LAYOUTS,
  MOCK_OPTICAL_PROPERTIES,
  generateMockChannelData,
} from '../utils/mockData';

interface SimulationState {
  headModels: HeadModel[];
  layouts: OptrodeLayout[];
  opticalProperties: TissueOpticalProperty[];
  selectedHeadModelId: string | null;
  selectedLayoutId: string | null;
  channelDataMap: Record<string, ChannelData[]>;
  meshQuality: Record<string, MeshQuality>;
  isRunning: boolean;
  selectHeadModel: (id: string) => void;
  selectLayout: (id: string) => void;
  updateOpticalProperty: (layer: string, field: keyof TissueOpticalProperty, value: number) => void;
  loadChannelData: (taskId: string, channelCount: number) => void;
  getChannelData: (taskId: string) => ChannelData[];
  setRunning: (running: boolean) => void;
}

export const useSimulationStore = create<SimulationState>((set, get) => ({
  headModels: MOCK_HEAD_MODELS,
  layouts: MOCK_LAYOUTS,
  opticalProperties: MOCK_OPTICAL_PROPERTIES,
  selectedHeadModelId: MOCK_HEAD_MODELS[0]?.id || null,
  selectedLayoutId: MOCK_LAYOUTS[0]?.id || null,
  channelDataMap: {},
  meshQuality: {},
  isRunning: false,

  selectHeadModel: (id) => set({ selectedHeadModelId: id }),

  selectLayout: (id) => set({ selectedLayoutId: id }),

  updateOpticalProperty: (layer, field, value) => {
    set((state) => ({
      opticalProperties: state.opticalProperties.map((p) =>
        p.layer === layer ? { ...p, [field]: value } : p
      ),
    }));
  },

  loadChannelData: (taskId, channelCount) => {
    if (!get().channelDataMap[taskId]) {
      const data = generateMockChannelData(taskId, channelCount);
      set((state) => ({
        channelDataMap: { ...state.channelDataMap, [taskId]: data },
      }));
    }
  },

  getChannelData: (taskId) => get().channelDataMap[taskId] || [],

  setRunning: (running) => set({ isRunning: running }),
}));
