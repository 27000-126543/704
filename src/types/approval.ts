export enum ApprovalLevel {
  LEVEL_1 = 1,
  LEVEL_2 = 2,
}

export const ApprovalLevelLabels: Record<ApprovalLevel, string> = {
  [ApprovalLevel.LEVEL_1]: '一级审批',
  [ApprovalLevel.LEVEL_2]: '二级审批',
};

export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export const ApprovalStatusLabels: Record<ApprovalStatus, string> = {
  [ApprovalStatus.PENDING]: '待审批',
  [ApprovalStatus.APPROVED]: '已通过',
  [ApprovalStatus.REJECTED]: '已驳回',
};

export interface Approval {
  id: string;
  taskId: string;
  taskName: string;
  level: ApprovalLevel;
  status: ApprovalStatus;
  approverId?: string;
  approverName?: string;
  comment?: string;
  createdAt: Date;
  decidedAt?: Date;
}

export interface DeviationRecord {
  id: string;
  headModelId: string;
  headModelName: string;
  taskId: string;
  taskName: string;
  deviationMm: number;
  activationRegion: string;
  referenceTaskId?: string;
  createdAt: Date;
}

export interface ChiefNotification {
  id: string;
  type: 'deviation' | 'system' | 'urgent';
  title: string;
  content: string;
  headModelId?: string;
  taskId?: string;
  status: 'unread' | 'read' | 'acknowledged';
  createdAt: Date;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
}

export interface DailyStats {
  date: string;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  avgSNR: number;
  convergenceCount: number;
  alertCount: number;
  avgDuration: number;
}

export interface PerformanceMetrics {
  accuracy: number;
  efficiency: number;
  stability: number;
  convergence: number;
  snr: number;
  coverage: number;
}
