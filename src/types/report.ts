export interface ActivationRegion {
  id: string;
  brainRegionId: string;
  brainRegionName: string;
  centerX: number;
  centerY: number;
  centerZ: number;
  volumeMm3: number;
  peakHbO: number;
  peakHbR: number;
  tScore: number;
  pValue: number;
  significance: boolean;
}

export interface SimulationReport {
  id: string;
  taskId: string;
  taskName: string;
  generatedAt: Date;
  generatedBy: string;
  summary: string;
  avgSNR: number;
  minSNR: number;
  maxSNR: number;
  channelCount: number;
  validChannels: number;
  totalDuration: number;
  convergenceCount: number;
  activationRegions: ActivationRegion[];
  headModelName: string;
  layoutName: string;
  parameters: {
    sourcePower: number;
    wavelengths: number[];
    optrodeSpacing: number;
    snrThreshold: number;
  };
}

export interface DataExportOptions {
  format: 'csv' | 'excel' | 'json';
  scope: 'all' | 'by_brain_region' | 'by_channel' | 'by_optrode';
  brainRegions?: string[];
  channelIndexes?: number[];
  optrodeIds?: string[];
  includeRaw: boolean;
  includeStats: boolean;
}

export interface LayoutRecommendation {
  id: string;
  name: string;
  description: string;
  channelCount: number;
  sourceCount: number;
  detectorCount: number;
  confidence: number;
  basedOnTaskCount: number;
  avgSNR: number;
  avgCoverage: number;
  targetRegions: string[];
  wavelengthCombo: number[];
}

export interface WavelengthRecommendation {
  wavelengths: number[];
  confidence: number;
  expectedSNR: number;
  expectedPenetration: number;
  pros: string[];
  cons: string[];
}
