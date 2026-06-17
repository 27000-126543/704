import { create } from 'zustand';
import { SimulationTask, TaskStatus, StatusLogEntry, AdjustmentLogEntry } from '../types';
import { MOCK_TASKS, MOCK_ADJUSTMENT_LOGS } from '../utils/mockData';
import { generateId } from '../utils/helpers';

interface TaskState {
  tasks: SimulationTask[];
  adjustmentLogs: AdjustmentLogEntry[];
  selectedTaskId: string | null;
  getTaskById: (id: string) => SimulationTask | undefined;
  getTasksByStatus: (status: TaskStatus) => SimulationTask[];
  getTasksByHeadModel: (headModelId: string) => SimulationTask[];
  setSelectedTask: (id: string | null) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus, message?: string) => void;
  updateTaskProgress: (taskId: string, progress: number) => void;
  addTask: (task: Omit<SimulationTask, 'id' | 'createdAt' | 'updatedAt' | 'statusHistory'>) => void;
  addAdjustmentLog: (log: Omit<AdjustmentLogEntry, 'id' | 'createdAt'>) => void;
  searchTasks: (keyword: string) => SimulationTask[];
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: MOCK_TASKS,
  adjustmentLogs: MOCK_ADJUSTMENT_LOGS,
  selectedTaskId: null,

  getTaskById: (id) => get().tasks.find((t) => t.id === id),

  getTasksByStatus: (status) => get().tasks.filter((t) => t.status === status),

  getTasksByHeadModel: (headModelId) => get().tasks.filter((t) => t.headModelId === headModelId),

  setSelectedTask: (id) => set({ selectedTaskId: id }),

  updateTaskStatus: (taskId, status, message) => {
    const logEntry: StatusLogEntry = {
      id: generateId('log'),
      status,
      message: message || `状态更新为${status}`,
      timestamp: new Date(),
    };
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status,
              updatedAt: new Date(),
              completedAt: status === TaskStatus.COMPLETED ? new Date() : t.completedAt,
              statusHistory: [...t.statusHistory, logEntry],
            }
          : t
      ),
    }));
  },

  updateTaskProgress: (taskId, progress) => {
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, progress } : t)),
    }));
  },

  addTask: (taskData) => {
    const newTask: SimulationTask = {
      ...taskData,
      id: `task_${String(get().tasks.length + 1).padStart(3, '0')}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      statusHistory: [
        {
          id: generateId('log'),
          status: TaskStatus.PENDING_VALIDATION,
          message: '任务创建完成，等待校验',
          timestamp: new Date(),
        },
      ],
    };
    set((state) => ({ tasks: [newTask, ...state.tasks] }));
  },

  addAdjustmentLog: (log) => {
    const newLog: AdjustmentLogEntry = {
      ...log,
      id: generateId('adj'),
      createdAt: new Date(),
    };
    set((state) => ({ adjustmentLogs: [newLog, ...state.adjustmentLogs] }));
  },

  searchTasks: (keyword) => {
    const kw = keyword.toLowerCase();
    return get().tasks.filter(
      (t) =>
        t.name.toLowerCase().includes(kw) ||
        t.id.toLowerCase().includes(kw) ||
        t.headModelName.toLowerCase().includes(kw) ||
        t.userName.toLowerCase().includes(kw)
    );
  },
}));
