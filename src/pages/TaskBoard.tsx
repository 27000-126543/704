import { useMemo, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  List,
  Plus,
  Signal,
  Clock,
  GripVertical,
  Check,
  AlertCircle,
} from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';
import { useTaskStore } from '../store/useTaskStore';
import {
  TaskStatus,
  TaskStatusLabels,
  TaskStatusColors,
  SimulationTask,
} from '../types';
import { formatNumber, getRelativeTime } from '../utils/helpers';

const BOARD_COLUMNS: TaskStatus[] = [
  TaskStatus.PENDING_VALIDATION,
  TaskStatus.MESH_GENERATION,
  TaskStatus.LIGHT_TRANSPORT,
  TaskStatus.BLOOD_INVERSION,
  TaskStatus.COMPLETED,
  TaskStatus.ERROR_ROLLBACK,
];

interface TaskCardProps {
  task: SimulationTask;
  onClick: () => void;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
}

function TaskCard({ task, onClick, onDragStart }: TaskCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const color = TaskStatusColors[task.status];

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return '#00FF9D';
    if (progress >= 70) return '#00D4FF';
    if (progress >= 40) return '#FFA64D';
    return '#FF3B5C';
  };

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    onDragStart(e, task.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <div
      draggable
      onClick={onClick}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`glass-card p-3 cursor-pointer group transition-all duration-200 hover:shadow-glow-cyber ${
        isDragging ? 'opacity-40 scale-95' : ''
      }`}
      style={{
        borderLeft: `3px solid ${color}`,
      }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-start gap-1.5 flex-1 min-w-0">
          <GripVertical className="w-3.5 h-3.5 text-space-600 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          <p className="text-sm font-medium text-white truncate flex-1">{task.name}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-2.5">
        <StatusBadge type="task" value={task.status} size="sm" />
        <span className="text-[10px] text-space-500 font-mono">{task.id}</span>
      </div>

      <div className="mb-2.5">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-space-500 uppercase tracking-wider">进度</span>
          <span
            className="text-xs font-mono font-semibold"
            style={{ color: getProgressColor(task.progress) }}
          >
            {task.progress}%
          </span>
        </div>
        <div className="h-1 bg-space-700 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${task.progress}%`,
              backgroundColor: getProgressColor(task.progress),
              boxShadow: `0 0 6px ${getProgressColor(task.progress)}80`,
            }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        {task.avgSNR !== undefined ? (
          <div className="flex items-center gap-1">
            <Signal className="w-3 h-3 text-bio-400" />
            <span className="text-xs font-mono text-bio-400">{formatNumber(task.avgSNR, 1)} dB</span>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <Signal className="w-3 h-3 text-space-500" />
            <span className="text-xs text-space-500">-- dB</span>
          </div>
        )}
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-space-500" />
          <span className="text-[11px] text-space-500">{getRelativeTime(task.createdAt)}</span>
        </div>
      </div>
    </div>
  );
}

export default function TaskBoard() {
  const navigate = useNavigate();
  const { tasks, getTasksByStatus, updateTaskStatus, getTaskById } = useTaskStore();
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<TaskStatus | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showNotification = (type: 'success' | 'error', text: string) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 4000);
  };

  const columnsData = useMemo(() => {
    return BOARD_COLUMNS.map((status) => ({
      status,
      tasks: getTasksByStatus(status),
    }));
  }, [getTasksByStatus]);

  const totalTasks = tasks.length;

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDragOver = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverStatus(status);
  };

  const handleDragLeave = () => {
    setDragOverStatus(null);
  };

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    setDragOverStatus(null);
    setDraggedTaskId(null);

    const taskId = e.dataTransfer.getData('text/plain');
    if (!taskId) return;

    const task = getTaskById(taskId);
    if (!task) {
      showNotification('error', '任务不存在');
      return;
    }

    if (task.status === targetStatus) {
      return;
    }

    updateTaskStatus(
      taskId,
      targetStatus,
      `状态看板拖拽：${TaskStatusLabels[task.status]} → ${TaskStatusLabels[targetStatus]}`
    );

    showNotification(
      'success',
      `任务#${task.id}状态已更新：${TaskStatusLabels[task.status]} → ${TaskStatusLabels[targetStatus]}`
    );
  };

  const getStatusProgress = (status: TaskStatus): number => {
    const map: Record<TaskStatus, number> = {
      [TaskStatus.PENDING_VALIDATION]: 0,
      [TaskStatus.MESH_GENERATION]: 35,
      [TaskStatus.LIGHT_TRANSPORT]: 60,
      [TaskStatus.BLOOD_INVERSION]: 85,
      [TaskStatus.COMPLETED]: 100,
      [TaskStatus.ERROR_ROLLBACK]: 50,
    };
    return map[status];
  };

  return (
    <div className="space-y-5 fade-in h-full flex flex-col">
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 glass-card px-5 py-3 flex items-center gap-3 animate-fade-in ${
            notification.type === 'success'
              ? 'border-bio-500/50 shadow-[0_0_20px_rgba(0,255,157,0.2)]'
              : 'border-danger-500/50 shadow-[0_0_20px_rgba(255,59,92,0.2)]'
          }`}
        >
          {notification.type === 'success' ? (
            <Check className="w-5 h-5 text-bio-400" />
          ) : (
            <AlertCircle className="w-5 h-5 text-danger-400" />
          )}
          <span className={`text-sm ${notification.type === 'success' ? 'text-bio-300' : 'text-danger-300'}`}>
            {notification.text}
          </span>
        </div>
      )}

      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <span className="w-1 h-7 bg-gradient-to-b from-cyber-400 to-cyber-600 rounded-full" />
            状态看板
          </h1>
          <p className="text-sm text-space-500 mt-1">
            共 {totalTasks} 个任务 · 拖拽卡片可切换状态
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/tasks')} className="cyber-button-outline flex items-center gap-2">
            <List className="w-4 h-4" />
            列表视图
          </button>
          <button onClick={() => navigate('/tasks/new')} className="cyber-button flex items-center gap-2">
            <Plus className="w-4 h-4" />
            新建任务
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4 -mx-6 px-6">
        <div className="flex gap-4 min-w-max h-full">
          {columnsData.map(({ status, tasks: columnTasks }) => {
            const color = TaskStatusColors[status];
            return (
              <div
                key={status}
                className="w-[280px] flex flex-col shrink-0"
              >
                <div
                  className="flex items-center justify-between px-3 py-2.5 rounded-t-lg border-x border-t shrink-0"
                  style={{
                    backgroundColor: `${color}0D`,
                    borderColor: `${color}30`,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: color,
                        boxShadow: `0 0 8px ${color}80`,
                      }}
                    />
                    <span
                      className="text-sm font-semibold"
                      style={{ color }}
                    >
                      {TaskStatusLabels[status]}
                    </span>
                  </div>
                  <span
                    className="px-2 py-0.5 rounded text-xs font-mono font-bold"
                    style={{
                      backgroundColor: `${color}1A`,
                      color,
                    }}
                  >
                    {columnTasks.length}
                  </span>
                </div>

                <div
                  onDragOver={(e) => handleDragOver(e, status)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, status)}
                  className={`flex-1 rounded-b-lg border-x border-b p-3 space-y-3 overflow-y-auto transition-all duration-200 ${
                    dragOverStatus === status ? 'ring-2 ring-cyber-400/60 ring-offset-2 ring-offset-space-900' : ''
                  }`}
                  style={{
                    backgroundColor: dragOverStatus === status ? `${color}15` : `${color}05`,
                    borderColor: `${color}20`,
                  }}
                >
                  {columnTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-space-500">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center mb-2"
                        style={{ backgroundColor: `${color}10` }}
                      >
                        <Plus className="w-5 h-5" style={{ color }} />
                      </div>
                      <p className="text-xs">暂无任务</p>
                    </div>
                  ) : (
                    columnTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onClick={() => navigate(`/tasks/${task.id}`)}
                        onDragStart={handleDragStart}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
