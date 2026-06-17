import { create } from 'zustand';
import {
  SimulationReport,
  LayoutRecommendation,
  WavelengthRecommendation,
  Approval,
  ApprovalStatus,
  ApprovalLevel,
  DeviationRecord,
  ChiefNotification,
  DailyStats,
  PerformanceMetrics,
} from '../types';
import {
  MOCK_LAYOUT_RECOMMENDATIONS,
  MOCK_WAVELENGTH_RECOMMENDATIONS,
  MOCK_APPROVALS,
  MOCK_DEVIATION_RECORDS,
  MOCK_CHIEF_NOTIFICATIONS,
  MOCK_DAILY_STATS,
  MOCK_PERFORMANCE,
  generateMockReport,
} from '../utils/mockData';
import { SimulationTask } from '../types';
import { generateId } from '../utils/helpers';

interface ReportState {
  reports: Record<string, SimulationReport>;
  layoutRecommendations: LayoutRecommendation[];
  wavelengthRecommendations: WavelengthRecommendation[];
  approvals: Approval[];
  deviationRecords: DeviationRecord[];
  chiefNotifications: ChiefNotification[];
  dailyStats: DailyStats[];
  performance: PerformanceMetrics;
  getReportByTaskId: (taskId: string) => SimulationReport | undefined;
  generateReport: (task: SimulationTask) => SimulationReport;
  getApprovalsByStatus: (status: ApprovalStatus) => Approval[];
  getApprovalsByLevel: (level: ApprovalLevel) => Approval[];
  updateApprovalStatus: (approvalId: string, status: ApprovalStatus, approverId?: string, approverName?: string, comment?: string) => void;
  getDeviationsByHeadModel: (headModelId: string) => DeviationRecord[];
  checkDeviationThreshold: (headModelId: string) => boolean;
  getUnreadNotificationCount: () => number;
  markNotificationRead: (id: string) => void;
}

export const useReportStore = create<ReportState>((set, get) => ({
  reports: {},
  layoutRecommendations: MOCK_LAYOUT_RECOMMENDATIONS,
  wavelengthRecommendations: MOCK_WAVELENGTH_RECOMMENDATIONS,
  approvals: MOCK_APPROVALS,
  deviationRecords: MOCK_DEVIATION_RECORDS,
  chiefNotifications: MOCK_CHIEF_NOTIFICATIONS,
  dailyStats: MOCK_DAILY_STATS,
  performance: MOCK_PERFORMANCE,

  getReportByTaskId: (taskId) => get().reports[taskId],

  generateReport: (task) => {
    const existing = get().reports[task.id];
    if (existing) return existing;
    const report = generateMockReport(task);
    set((state) => ({ reports: { ...state.reports, [task.id]: report } }));
    return report;
  },

  getApprovalsByStatus: (status) => get().approvals.filter((a) => a.status === status),

  getApprovalsByLevel: (level) => get().approvals.filter((a) => a.level === level),

  updateApprovalStatus: (approvalId, status, approverId, approverName, comment) => {
    set((state) => ({
      approvals: state.approvals.map((a) =>
        a.id === approvalId
          ? {
              ...a,
              status,
              approverId: approverId || a.approverId,
              approverName: approverName || a.approverName,
              comment: comment || a.comment,
              decidedAt: new Date(),
            }
          : a
      ),
    }));
  },

  getDeviationsByHeadModel: (headModelId) =>
    get().deviationRecords.filter((d) => d.headModelId === headModelId),

  checkDeviationThreshold: (headModelId) => {
    const deviations = get()
      .getDeviationsByHeadModel(headModelId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3);
    return deviations.length >= 3 && deviations.every((d) => d.deviationMm > 5);
  },

  getUnreadNotificationCount: () =>
    get().chiefNotifications.filter((n) => n.status === 'unread').length,

  markNotificationRead: (id) => {
    set((state) => ({
      chiefNotifications: state.chiefNotifications.map((n) =>
        n.id === id ? { ...n, status: 'read' } : n
      ),
    }));
  },
}));
