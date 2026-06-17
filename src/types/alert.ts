export enum AlertLevel {
  LEVEL_1 = 'level_1',
  LEVEL_2 = 'level_2',
  LEVEL_3 = 'level_3',
}

export const AlertLevelLabels: Record<AlertLevel, string> = {
  [AlertLevel.LEVEL_1]: '一级预警',
  [AlertLevel.LEVEL_2]: '二级预警',
  [AlertLevel.LEVEL_3]: '三级预警',
};

export const AlertLevelColors: Record<AlertLevel, string> = {
  [AlertLevel.LEVEL_1]: '#FF8A00',
  [AlertLevel.LEVEL_2]: '#FF3B5C',
  [AlertLevel.LEVEL_3]: '#992438',
};

export enum AlertStatus {
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
  RESOLVED = 'resolved',
  REJECTED = 'rejected',
}

export const AlertStatusLabels: Record<AlertStatus, string> = {
  [AlertStatus.PENDING]: '待复核',
  [AlertStatus.UNDER_REVIEW]: '复核中',
  [AlertStatus.RESOLVED]: '已解决',
  [AlertStatus.REJECTED]: '已驳回',
};

export enum AlertReason {
  SNR_LOW = 'snr_low',
  HBO_ABNORMAL = 'hbo_abnormal',
  HBR_ABNORMAL = 'hbr_abnormal',
  HBT_ABNORMAL = 'hbt_abnormal',
  CONVERGENCE_FAIL = 'convergence_fail',
  CHANNEL_NOISE = 'channel_noise',
  OTHER = 'other',
}

export const AlertReasonLabels: Record<AlertReason, string> = {
  [AlertReason.SNR_LOW]: '信噪比过低',
  [AlertReason.HBO_ABNORMAL]: '氧合血红蛋白异常',
  [AlertReason.HBR_ABNORMAL]: '脱氧血红蛋白异常',
  [AlertReason.HBT_ABNORMAL]: '总血红蛋白异常',
  [AlertReason.CONVERGENCE_FAIL]: '优化收敛失败',
  [AlertReason.CHANNEL_NOISE]: '通道噪声超标',
  [AlertReason.OTHER]: '其他异常',
};

export interface Alert {
  id: string;
  taskId: string;
  taskName: string;
  level: AlertLevel;
  status: AlertStatus;
  reason: AlertReason;
  channelIndex?: number;
  value: number;
  threshold: number;
  description: string;
  reviewerId?: string;
  reviewerName?: string;
  reviewComment?: string;
  pushStatus: 'pending' | 'sent' | 'delivered' | 'read';
  createdAt: Date;
  reviewedAt?: Date;
  resolvedAt?: Date;
}
