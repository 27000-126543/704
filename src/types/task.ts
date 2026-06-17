export enum TaskStatus {
  PENDING_VALIDATION = 'pending_validation',
  MESH_GENERATION = 'mesh_generation',
  LIGHT_TRANSPORT = 'light_transport',
  BLOOD_INVERSION = 'blood_inversion',
  COMPLETED = 'completed',
  ERROR_ROLLBACK = 'error_rollback',
  PENDING_APPROVAL_1 = 'pending_approval_1',
  PENDING_APPROVAL_2 = 'pending_approval_2',
  APPROVED = 'approved',
}

export const TaskStatusLabels: Record<TaskStatus, string> = {
  [TaskStatus.PENDING_VALIDATION]: '待校验',
  [TaskStatus.MESH_GENERATION]: '网格生成',
  [TaskStatus.LIGHT_TRANSPORT]: '光传输计算',
  [TaskStatus.BLOOD_INVERSION]: '血氧反演',
  [TaskStatus.COMPLETED]: '完成',
  [TaskStatus.ERROR_ROLLBACK]: '异常回退',
  [TaskStatus.PENDING_APPROVAL_1]: '一级审批中',
  [TaskStatus.PENDING_APPROVAL_2]: '二级审批中',
  [TaskStatus.APPROVED]: '已审批',
};

export const TaskStatusColors: Record<TaskStatus, string> = {
  [TaskStatus.PENDING_VALIDATION]: '#FFA64D',
  [TaskStatus.MESH_GENERATION]: '#4DE3FF',
  [TaskStatus.LIGHT_TRANSPORT]: '#00D4FF',
  [TaskStatus.BLOOD_INVERSION]: '#B380FF',
  [TaskStatus.COMPLETED]: '#00FF9D',
  [TaskStatus.ERROR_ROLLBACK]: '#FF3B5C',
  [TaskStatus.PENDING_APPROVAL_1]: '#FFD24D',
  [TaskStatus.PENDING_APPROVAL_2]: '#FFB84D',
  [TaskStatus.APPROVED]: '#33FFB8',
};

export const SIMULATION_FLOW: TaskStatus[] = [
  TaskStatus.PENDING_VALIDATION,
  TaskStatus.MESH_GENERATION,
  TaskStatus.LIGHT_TRANSPORT,
  TaskStatus.BLOOD_INVERSION,
  TaskStatus.COMPLETED,
  TaskStatus.ERROR_ROLLBACK,
];

export interface StatusLogEntry {
  id: string;
  status: TaskStatus;
  message: string;
  timestamp: Date;
}

export interface SimulationTask {
  id: string;
  name: string;
  status: TaskStatus;
  progress: number;
  headModelId: string;
  headModelName: string;
  layoutId: string;
  layoutName: string;
  userId: string;
  userName: string;
  snrThreshold: number;
  channelCount: number;
  avgSNR?: number;
  convergenceCount: number;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  statusHistory: StatusLogEntry[];
  description?: string;
}

export interface AdjustmentLogEntry {
  id: string;
  taskId: string;
  adjustmentType: 'optrode_spacing' | 'source_power' | 'wavelength' | 'other';
  beforeValue: string;
  afterValue: string;
  reason: string;
  adjustedBy: string;
  createdAt: Date;
}

export const AdjustmentTypeLabels: Record<string, string> = {
  optrode_spacing: '光极间距',
  source_power: '光源功率',
  wavelength: '波长组合',
  other: '其他参数',
};
