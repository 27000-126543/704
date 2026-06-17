export type TissueLayer = 'scalp' | 'skull' | 'csf' | 'gray_matter' | 'white_matter';

export const TissueLayerLabels: Record<TissueLayer, string> = {
  scalp: '头皮',
  skull: '颅骨',
  csf: '脑脊液',
  gray_matter: '灰质',
  white_matter: '白质',
};

export const TissueLayerColors: Record<TissueLayer, string> = {
  scalp: '#E8B89D',
  skull: '#F5E6D3',
  csf: '#87CEEB',
  gray_matter: '#C4A484',
  white_matter: '#F0E6D3',
};

export interface TissueOpticalProperty {
  layer: TissueLayer;
  absorptionCoefficient: number;
  scatteringCoefficient: number;
  anisotropy: number;
  refractiveIndex: number;
  thickness: number;
}

export type OptrodeType = 'source' | 'detector';

export const OptrodeTypeLabels: Record<OptrodeType, string> = {
  source: '光源',
  detector: '探测器',
};

export interface Optrode {
  id: string;
  layoutId: string;
  type: OptrodeType;
  index: number;
  positionX: number;
  positionY: number;
  positionZ: number;
  brainRegion: string;
  wavelength?: number;
  power?: number;
}

export interface Channel {
  id: string;
  index: number;
  sourceId: string;
  detectorId: string;
  distance: number;
  brainRegion: string;
}

export interface OptrodeLayout {
  id: string;
  name: string;
  description?: string;
  channelCount: number;
  sourceCount: number;
  detectorCount: number;
  optrodes: Optrode[];
  channels: Channel[];
  sourcePower: number;
  wavelengths: number[];
  createdAt: Date;
}

export interface HeadModel {
  id: string;
  name: string;
  fileFormat: 'NIfTI' | 'STL' | 'OBJ';
  filePath: string;
  voxelCount: number;
  tissueLayers: TissueLayer[];
  createdAt: Date;
  size?: { width: number; height: number; depth: number };
}

export interface ChannelDataPoint {
  timestamp: number;
  snr: number;
  hbO: number;
  hbR: number;
  hbT: number;
  opticalDensity: number;
}

export interface ChannelData {
  channelIndex: number;
  taskId: string;
  data: ChannelDataPoint[];
  currentSNR: number;
  avgSNR: number;
  minSNR: number;
  maxSNR: number;
}

export interface MeshQuality {
  totalElements: number;
  qualityScore: number;
  minQuality: number;
  avgQuality: number;
  maxAspectRatio: number;
  generationTime: number;
}

export interface BrainRegion {
  id: string;
  name: string;
  abbreviation: string;
  lobe: string;
  color: string;
}

export const DEFAULT_BRAIN_REGIONS: BrainRegion[] = [
  { id: 'fp1', name: '左额极', abbreviation: 'Fp1', lobe: '额叶', color: '#FF6B6B' },
  { id: 'fp2', name: '右额极', abbreviation: 'Fp2', lobe: '额叶', color: '#FF8787' },
  { id: 'f3', name: '左额区', abbreviation: 'F3', lobe: '额叶', color: '#FFA94D' },
  { id: 'f4', name: '右额区', abbreviation: 'F4', lobe: '额叶', color: '#FFC078' },
  { id: 'f7', name: '左额下回', abbreviation: 'F7', lobe: '额叶', color: '#FFD43B' },
  { id: 'f8', name: '右额下回', abbreviation: 'F8', lobe: '额叶', color: '#FFE066' },
  { id: 'fz', name: '额中线', abbreviation: 'Fz', lobe: '额叶', color: '#F08C00' },
  { id: 'c3', name: '左中央区', abbreviation: 'C3', lobe: '顶叶', color: '#69DB7C' },
  { id: 'c4', name: '右中央区', abbreviation: 'C4', lobe: '顶叶', color: '#8CE99A' },
  { id: 'cz', name: '中央中线', abbreviation: 'Cz', lobe: '顶叶', color: '#40C057' },
  { id: 'p3', name: '左顶区', abbreviation: 'P3', lobe: '顶叶', color: '#74C0FC' },
  { id: 'p4', name: '右顶区', abbreviation: 'P4', lobe: '顶叶', color: '#A5D8FF' },
  { id: 'pz', name: '顶中线', abbreviation: 'Pz', lobe: '顶叶', color: '#4DABF7' },
  { id: 't3', name: '左颞叶', abbreviation: 'T3', lobe: '颞叶', color: '#DA77F2' },
  { id: 't4', name: '右颞叶', abbreviation: 'T4', lobe: '颞叶', color: '#E599F7' },
  { id: 't5', name: '左后颞叶', abbreviation: 'T5', lobe: '颞叶', color: '#BE4BDB' },
  { id: 't6', name: '右后颞叶', abbreviation: 'T6', lobe: '颞叶', color: '#CC5DE8' },
  { id: 'o1', name: '左枕区', abbreviation: 'O1', lobe: '枕叶', color: '#FF8787' },
  { id: 'o2', name: '右枕区', abbreviation: 'O2', lobe: '枕叶', color: '#FFA8A8' },
  { id: 'oz', name: '枕中线', abbreviation: 'Oz', lobe: '枕叶', color: '#FA5252' },
];

export const DEFAULT_OPTICAL_PROPERTIES: TissueOpticalProperty[] = [
  { layer: 'scalp', absorptionCoefficient: 0.18, scatteringCoefficient: 7.8, anisotropy: 0.9, refractiveIndex: 1.37, thickness: 6 },
  { layer: 'skull', absorptionCoefficient: 0.12, scatteringCoefficient: 12.5, anisotropy: 0.91, refractiveIndex: 1.43, thickness: 7 },
  { layer: 'csf', absorptionCoefficient: 0.004, scatteringCoefficient: 0.05, anisotropy: 0.89, refractiveIndex: 1.33, thickness: 2 },
  { layer: 'gray_matter', absorptionCoefficient: 0.22, scatteringCoefficient: 9.5, anisotropy: 0.9, refractiveIndex: 1.4, thickness: 4 },
  { layer: 'white_matter', absorptionCoefficient: 0.14, scatteringCoefficient: 7.2, anisotropy: 0.87, refractiveIndex: 1.4, thickness: 20 },
];
