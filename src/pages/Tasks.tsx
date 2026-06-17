import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  Filter,
  Eye,
  MoreHorizontal,
  LayoutGrid,
  List,
} from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';
import { useTaskStore } from '../store/useTaskStore';
import { useSimulationStore } from '../store/useSimulationStore';
import { TaskStatus, TaskStatusLabels } from '../types';
import { formatDateTime, formatNumber } from '../utils/helpers';

const PAGE_SIZE = 10;

const FILTER_STATUSES: TaskStatus[] = [
  TaskStatus.PENDING_VALIDATION,
  TaskStatus.MESH_GENERATION,
  TaskStatus.LIGHT_TRANSPORT,
  TaskStatus.BLOOD_INVERSION,
  TaskStatus.COMPLETED,
  TaskStatus.ERROR_ROLLBACK,
];

export default function Tasks() {
  const navigate = useNavigate();
  const { tasks, searchTasks } = useTaskStore();
  const { headModels } = useSimulationStore();

  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<TaskStatus[]>([]);
  const [selectedHeadModel, setSelectedHeadModel] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');

  const filteredTasks = useMemo(() => {
    let result = tasks;

    if (searchKeyword.trim()) {
      result = searchTasks(searchKeyword);
    }

    if (selectedStatuses.length > 0) {
      result = result.filter((t) => selectedStatuses.includes(t.status));
    }

    if (selectedHeadModel) {
      result = result.filter((t) => t.headModelId === selectedHeadModel);
    }

    return result;
  }, [tasks, searchKeyword, selectedStatuses, selectedHeadModel, searchTasks]);

  const totalPages = Math.max(1, Math.ceil(filteredTasks.length / PAGE_SIZE));
  const paginatedTasks = filteredTasks.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const toggleStatus = (status: TaskStatus) => {
    setSelectedStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

  const handleResetFilters = () => {
    setSelectedStatuses([]);
    setSelectedHeadModel('');
    setSearchKeyword('');
    setCurrentPage(1);
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return '#00FF9D';
    if (progress >= 70) return '#00D4FF';
    if (progress >= 40) return '#FFA64D';
    return '#FF3B5C';
  };

  return (
    <div className="space-y-5 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <span className="w-1 h-7 bg-gradient-to-b from-cyber-400 to-cyber-600 rounded-full" />
            任务管理
          </h1>
          <p className="text-sm text-space-500 mt-1">共 {filteredTasks.length} 个模拟任务</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-space-800/60 rounded-md p-1 border border-cyber-500/20">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded transition-all ${
                viewMode === 'list'
                  ? 'bg-cyber-500/20 text-cyber-400'
                  : 'text-space-500 hover:text-cyber-300'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/tasks/board')}
              className={`p-1.5 rounded transition-all ${
                viewMode === 'board'
                  ? 'bg-cyber-500/20 text-cyber-400'
                  : 'text-space-500 hover:text-cyber-300'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
          <button onClick={() => navigate('/tasks/new')} className="cyber-button flex items-center gap-2">
            <Plus className="w-4 h-4" />
            新建任务
          </button>
        </div>
      </div>

      <div className="glass-card p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-space-500" />
            <input
              type="text"
              placeholder="搜索任务ID、名称、头模、创建者..."
              value={searchKeyword}
              onChange={(e) => {
                setSearchKeyword(e.target.value);
                setCurrentPage(1);
              }}
              className="cyber-input pl-9"
            />
          </div>
          <button
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className={`cyber-button-outline flex items-center gap-2 ${
              showFilterPanel || selectedStatuses.length > 0 || selectedHeadModel
                ? 'border-cyber-400 bg-cyber-500/10'
                : ''
            }`}
          >
            <Filter className="w-4 h-4" />
            筛选
            {(selectedStatuses.length > 0 || selectedHeadModel) && (
              <span className="w-5 h-5 rounded-full bg-cyber-500 text-space-900 text-xs font-bold flex items-center justify-center">
                {selectedStatuses.length + (selectedHeadModel ? 1 : 0)}
              </span>
            )}
          </button>
          {(selectedStatuses.length > 0 || selectedHeadModel || searchKeyword) && (
            <button
              onClick={handleResetFilters}
              className="text-sm text-space-400 hover:text-cyber-300 transition-colors"
            >
              重置
            </button>
          )}
        </div>

        {showFilterPanel && (
          <div className="mt-4 pt-4 border-t border-cyber-500/10 space-y-4">
            <div>
              <p className="text-xs text-space-400 mb-2 uppercase tracking-wider">任务状态</p>
              <div className="flex flex-wrap gap-2">
                {FILTER_STATUSES.map((status) => (
                  <button
                    key={status}
                    onClick={() => toggleStatus(status)}
                    className={`px-3 py-1.5 rounded text-xs font-medium transition-all border ${
                      selectedStatuses.includes(status)
                        ? 'bg-cyber-500/20 border-cyber-500/50 text-cyber-300'
                        : 'bg-space-900/50 border-cyber-500/10 text-space-400 hover:border-cyber-500/30'
                    }`}
                  >
                    {TaskStatusLabels[status]}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-space-400 mb-2 uppercase tracking-wider">头模</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedHeadModel('')}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-all border ${
                    !selectedHeadModel
                      ? 'bg-cyber-500/20 border-cyber-500/50 text-cyber-300'
                      : 'bg-space-900/50 border-cyber-500/10 text-space-400 hover:border-cyber-500/30'
                  }`}
                >
                  全部
                </button>
                {headModels.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => setSelectedHeadModel(model.id)}
                    className={`px-3 py-1.5 rounded text-xs font-medium transition-all border ${
                      selectedHeadModel === model.id
                        ? 'bg-cyber-500/20 border-cyber-500/50 text-cyber-300'
                        : 'bg-space-900/50 border-cyber-500/10 text-space-400 hover:border-cyber-500/30'
                    }`}
                  >
                    {model.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-cyber-500/10">
                <th className="text-left px-4 py-3 text-xs font-medium text-space-400 uppercase tracking-wider">ID</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-space-400 uppercase tracking-wider">任务名称</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-space-400 uppercase tracking-wider">头模</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-space-400 uppercase tracking-wider">布局</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-space-400 uppercase tracking-wider">创建者</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-space-400 uppercase tracking-wider">状态</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-space-400 uppercase tracking-wider">进度</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-space-400 uppercase tracking-wider">平均SNR</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-space-400 uppercase tracking-wider">创建时间</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-space-400 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTasks.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-16 text-space-500">
                    暂无任务数据
                  </td>
                </tr>
              ) : (
                paginatedTasks.map((task) => (
                  <tr
                    key={task.id}
                    className="border-b border-cyber-500/5 hover:bg-cyber-500/5 transition-colors cursor-pointer"
                    onClick={() => navigate(`/tasks/${task.id}`)}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-cyber-400">{task.id}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-white truncate max-w-[180px]">{task.name}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-space-300">{task.headModelName}</td>
                    <td className="px-4 py-3 text-sm text-space-300">{task.layoutName}</td>
                    <td className="px-4 py-3 text-sm text-space-300">{task.userName}</td>
                    <td className="px-4 py-3">
                      <StatusBadge type="task" value={task.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 min-w-[120px]">
                        <div className="flex-1 h-1.5 bg-space-700 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${task.progress}%`,
                              backgroundColor: getProgressColor(task.progress),
                              boxShadow: `0 0 8px ${getProgressColor(task.progress)}80`,
                            }}
                          />
                        </div>
                        <span
                          className="text-xs font-mono min-w-[36px] text-right"
                          style={{ color: getProgressColor(task.progress) }}
                        >
                          {task.progress}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {task.avgSNR !== undefined ? (
                        <span className="font-mono text-sm text-bio-400">{formatNumber(task.avgSNR, 1)} dB</span>
                      ) : (
                        <span className="text-sm text-space-500">--</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-space-400 font-mono text-xs">
                      {formatDateTime(task.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/tasks/${task.id}`);
                          }}
                          className="p-1.5 rounded text-space-400 hover:text-cyber-300 hover:bg-cyber-500/10 transition-all"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 rounded text-space-400 hover:text-cyber-300 hover:bg-cyber-500/10 transition-all"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filteredTasks.length > PAGE_SIZE && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-cyber-500/10">
            <p className="text-xs text-space-400">
              显示 {(currentPage - 1) * PAGE_SIZE + 1} -{' '}
              {Math.min(currentPage * PAGE_SIZE, filteredTasks.length)} 条，共 {filteredTasks.length} 条
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded text-space-400 hover:text-cyber-300 hover:bg-cyber-500/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`min-w-[32px] h-8 rounded text-xs font-medium transition-all ${
                    page === currentPage
                      ? 'bg-cyber-500 text-space-900'
                      : 'text-space-400 hover:text-cyber-300 hover:bg-cyber-500/10'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded text-space-400 hover:text-cyber-300 hover:bg-cyber-500/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
