import { create } from 'zustand';
import { Alert, AlertStatus, AlertLevel } from '../types';
import { MOCK_ALERTS } from '../utils/mockData';
import { generateId } from '../utils/helpers';

interface AlertState {
  alerts: Alert[];
  selectedAlertId: string | null;
  getAlertsByStatus: (status: AlertStatus) => Alert[];
  getAlertsByLevel: (level: AlertLevel) => Alert[];
  getPendingCount: () => number;
  setSelectedAlert: (id: string | null) => void;
  updateAlertStatus: (alertId: string, status: AlertStatus, comment?: string, reviewerId?: string, reviewerName?: string) => void;
  addAlert: (alert: Omit<Alert, 'id' | 'createdAt' | 'pushStatus'>) => void;
}

export const useAlertStore = create<AlertState>((set, get) => ({
  alerts: MOCK_ALERTS,
  selectedAlertId: null,

  getAlertsByStatus: (status) => get().alerts.filter((a) => a.status === status),

  getAlertsByLevel: (level) => get().alerts.filter((a) => a.level === level),

  getPendingCount: () => get().alerts.filter((a) => a.status === AlertStatus.PENDING).length,

  setSelectedAlert: (id) => set({ selectedAlertId: id }),

  updateAlertStatus: (alertId, status, comment, reviewerId, reviewerName) => {
    const now = new Date();
    set((state) => ({
      alerts: state.alerts.map((a) =>
        a.id === alertId
          ? {
              ...a,
              status,
              reviewComment: comment || a.reviewComment,
              reviewerId: reviewerId || a.reviewerId,
              reviewerName: reviewerName || a.reviewerName,
              reviewedAt: status !== AlertStatus.PENDING ? now : a.reviewedAt,
              resolvedAt: status === AlertStatus.RESOLVED ? now : a.resolvedAt,
            }
          : a
      ),
    }));
  },

  addAlert: (alertData) => {
    const newAlert: Alert = {
      ...alertData,
      id: generateId('alert'),
      createdAt: new Date(),
      pushStatus: 'sent',
    };
    set((state) => ({ alerts: [newAlert, ...state.alerts] }));
  },
}));
