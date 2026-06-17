import { cn } from '../../utils/helpers';
import {
  TaskStatus,
  TaskStatusLabels,
  TaskStatusColors,
  AlertLevel,
  AlertLevelLabels,
  AlertLevelColors,
  AlertStatus,
  AlertStatusLabels,
  ApprovalStatus,
  ApprovalStatusLabels,
} from '../../types';

type StatusType = 'task' | 'alert-level' | 'alert-status' | 'approval';

interface StatusBadgeProps {
  type: StatusType;
  value: string;
  size?: 'sm' | 'md';
  showDot?: boolean;
}

function getConfig(type: StatusType, value: string) {
  switch (type) {
    case 'task': {
      const status = value as TaskStatus;
      return {
        label: TaskStatusLabels[status] || value,
        color: TaskStatusColors[status] || '#888',
      };
    }
    case 'alert-level': {
      const level = value as AlertLevel;
      return {
        label: AlertLevelLabels[level] || value,
        color: AlertLevelColors[level] || '#888',
      };
    }
    case 'alert-status': {
      const status = value as AlertStatus;
      const colorMap: Record<string, string> = {
        pending: '#FF8A00',
        under_review: '#00D4FF',
        resolved: '#00FF9D',
        rejected: '#FF3B5C',
      };
      return {
        label: AlertStatusLabels[status] || value,
        color: colorMap[status] || '#888',
      };
    }
    case 'approval': {
      const status = value as ApprovalStatus;
      const colorMap: Record<string, string> = {
        pending: '#FFD24D',
        approved: '#00FF9D',
        rejected: '#FF3B5C',
      };
      return {
        label: ApprovalStatusLabels[status] || value,
        color: colorMap[status] || '#888',
      };
    }
  }
}

export function StatusBadge({ type, value, size = 'sm', showDot = true }: StatusBadgeProps) {
  const config = getConfig(type, value);
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
      )}
      style={{
        backgroundColor: `${config.color}1A`,
        color: config.color,
        border: `1px solid ${config.color}40`,
        borderRadius: '4px',
      }}
    >
      {showDot && (
        <span
          className={cn('rounded-full', size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2')}
          style={{ backgroundColor: config.color }}
        />
      )}
      {config.label}
    </span>
  );
}
