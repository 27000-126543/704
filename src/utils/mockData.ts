import {
  User,
  UserRole,
  SimulationTask,
  TaskStatus,
  HeadModel,
  OptrodeLayout,
  Optrode,
  Channel,
  ChannelData,
  ChannelDataPoint,
  Alert,
  AlertLevel,
  AlertStatus,
  AlertReason,
  AdjustmentLogEntry,
  Approval,
  ApprovalLevel,
  ApprovalStatus,
  DeviationRecord,
  ChiefNotification,
  DailyStats,
  PerformanceMetrics,
  SimulationReport,
  LayoutRecommendation,
  WavelengthRecommendation,
  ActivationRegion,
  DEFAULT_BRAIN_REGIONS,
  DEFAULT_OPTICAL_PROPERTIES,
  TissueOpticalProperty,
} from '../types';
import { generateId, randomInRange, randomIntInRange, average } from './helpers';

const now = new Date();
const hoursAgo = (h: number) => new Date(now.getTime() - h * 3600 * 1000);
const daysAgo = (d: number) => new Date(now.getTime() - d * 24 * 3600 * 1000);

export const MOCK_USERS: User[] = [
  { id: 'user_001', name: '张研究员', role: UserRole.RESEARCHER, email: 'zhang.research@lab.cn' },
  { id: 'user_002', name: '李成像专家', role: UserRole.IMAGING_EXPERT, email: 'li.expert@lab.cn' },
  { id: 'user_003', name: '王审批', role: UserRole.APPROVER, email: 'wang.approver@lab.cn' },
  { id: 'user_004', name: '陈首席科学家', role: UserRole.CHIEF_SCIENTIST, email: 'chen.chief@lab.cn' },
  { id: 'user_005', name: '系统管理员', role: UserRole.ADMIN, email: 'admin@lab.cn' },
];

export const MOCK_HEAD_MODELS: HeadModel[] = [
  {
    id: 'head_001',
    name: 'ICBM152_标准脑模',
    fileFormat: 'NIfTI',
    filePath: '/models/icbm152.nii',
    voxelCount: 1898124,
    tissueLayers: ['scalp', 'skull', 'csf', 'gray_matter', 'white_matter'],
    createdAt: daysAgo(30),
    size: { width: 181, height: 217, depth: 181 },
  },
  {
    id: 'head_002',
    name: 'Colin27_高精度脑模',
    fileFormat: 'NIfTI',
    filePath: '/models/colin27.nii',
    voxelCount: 2401290,
    tissueLayers: ['scalp', 'skull', 'csf', 'gray_matter', 'white_matter'],
    createdAt: daysAgo(25),
    size: { width: 256, height: 256, depth: 192 },
  },
  {
    id: 'head_003',
    name: '受试者_A001',
    fileFormat: 'STL',
    filePath: '/models/subj_A001.stl',
    voxelCount: 1654200,
    tissueLayers: ['scalp', 'skull', 'csf', 'gray_matter', 'white_matter'],
    createdAt: daysAgo(7),
  },
  {
    id: 'head_004',
    name: '受试者_B003',
    fileFormat: 'OBJ',
    filePath: '/models/subj_B003.obj',
    voxelCount: 1723400,
    tissueLayers: ['scalp', 'skull', 'csf', 'gray_matter', 'white_matter'],
    createdAt: daysAgo(3),
  },
];

function generateOptrodes(layoutId: string, sourceCount: number, detectorCount: number): Optrode[] {
  const optrodes: Optrode[] = [];
  const regions = DEFAULT_BRAIN_REGIONS.slice(0, sourceCount + detectorCount);
  let idx = 0;
  for (let i = 0; i < sourceCount; i++) {
    const region = regions[i % regions.length];
    optrodes.push({
      id: generateId('src'),
      layoutId,
      type: 'source',
      index: i,
      positionX: randomInRange(-80, 80),
      positionY: randomInRange(-60, 60),
      positionZ: randomInRange(60, 95),
      brainRegion: region.abbreviation,
      wavelength: 760,
      power: 10,
    });
    idx++;
  }
  for (let i = 0; i < detectorCount; i++) {
    const region = regions[(i + sourceCount) % regions.length];
    optrodes.push({
      id: generateId('det'),
      layoutId,
      type: 'detector',
      index: i,
      positionX: randomInRange(-80, 80),
      positionY: randomInRange(-60, 60),
      positionZ: randomInRange(60, 95),
      brainRegion: region.abbreviation,
    });
  }
  return optrodes;
}

function generateChannels(optrodes: Optrode[], layoutId: string): Channel[] {
  const sources = optrodes.filter((o) => o.type === 'source');
  const detectors = optrodes.filter((o) => o.type === 'detector');
  const channels: Channel[] = [];
  let idx = 0;
  for (const src of sources) {
    for (const det of detectors) {
      const dist = Math.sqrt(
        Math.pow(src.positionX - det.positionX, 2) +
          Math.pow(src.positionY - det.positionY, 2) +
          Math.pow(src.positionZ - det.positionZ, 2)
      );
      if (dist > 15 && dist < 45) {
        channels.push({
          id: generateId('ch'),
          index: idx++,
          sourceId: src.id,
          detectorId: det.id,
          distance: dist,
          brainRegion: src.brainRegion,
        });
      }
    }
  }
  return channels;
}

function createLayout(name: string, srcCount: number, detCount: number, wavelengths: number[]): OptrodeLayout {
  const id = generateId('layout');
  const optrodes = generateOptrodes(id, srcCount, detCount);
  const channels = generateChannels(optrodes, id);
  return {
    id,
    name,
    channelCount: channels.length,
    sourceCount: srcCount,
    detectorCount: detCount,
    optrodes,
    channels,
    sourcePower: 10,
    wavelengths,
    createdAt: daysAgo(10),
  };
}

export const MOCK_LAYOUTS: OptrodeLayout[] = [
  createLayout('标准8x8布局', 8, 8, [760, 850]),
  createLayout('前额聚焦布局', 6, 6, [735, 805, 850]),
  createLayout('全脑覆盖48通道', 12, 10, [760, 850]),
  createLayout('颞叶专用布局', 4, 6, [690, 780, 830]),
];

function generateChannelDataPoints(count: number, baseSNR: number, hasAnomaly = false): ChannelDataPoint[] {
  const data: ChannelDataPoint[] = [];
  for (let i = 0; i < count; i++) {
    const t = i * 0.5;
    const anomaly = hasAnomaly && i > count * 0.6 ? 1 : 0;
    const snrNoise = randomInRange(-3, 3);
    const snr = Math.max(5, baseSNR + snrNoise - anomaly * 8);
    const hbOBase = 60 + Math.sin(t * 0.1) * 8 + randomInRange(-3, 3);
    const hbRBase = 35 + Math.cos(t * 0.08) * 5 + randomInRange(-2, 2);
    data.push({
      timestamp: t,
      snr,
      hbO: hbOBase + anomaly * -15,
      hbR: hbRBase + anomaly * 8,
      hbT: hbOBase + hbRBase,
      opticalDensity: randomInRange(0.2, 0.8),
    });
  }
  return data;
}

export function generateMockChannelData(taskId: string, channelCount: number): ChannelData[] {
  const result: ChannelData[] = [];
  for (let i = 0; i < channelCount; i++) {
    const baseSNR = randomInRange(18, 32);
    const hasAnomaly = i === 5 || i === 17;
    const points = generateChannelDataPoints(120, baseSNR, hasAnomaly);
    const snrs = points.map((p) => p.snr);
    result.push({
      channelIndex: i,
      taskId,
      data: points,
      currentSNR: snrs[snrs.length - 1],
      avgSNR: average(snrs),
      minSNR: Math.min(...snrs),
      maxSNR: Math.max(...snrs),
    });
  }
  return result;
}

const TASK_NAMES = [
  '工作记忆任务-左侧前额叶',
  '运动皮层激活-右手运动',
  '视觉刺激-棋盘格反转',
  '语言任务-语音生成',
  '情绪处理-负性面孔',
  '听觉皮层-音调辨别',
  '静息态-默认网络',
  '疼痛刺激-热痛觉',
];

export const MOCK_TASKS: SimulationTask[] = (() => {
  const tasks: SimulationTask[] = [];
  const statuses: TaskStatus[] = [
    TaskStatus.PENDING_VALIDATION,
    TaskStatus.MESH_GENERATION,
    TaskStatus.LIGHT_TRANSPORT,
    TaskStatus.BLOOD_INVERSION,
    TaskStatus.COMPLETED,
    TaskStatus.ERROR_ROLLBACK,
    TaskStatus.PENDING_APPROVAL_1,
    TaskStatus.PENDING_APPROVAL_2,
    TaskStatus.APPROVED,
  ];
  for (let i = 0; i < 16; i++) {
    const status = statuses[i % statuses.length];
    const progress =
      status === TaskStatus.PENDING_VALIDATION
        ? 5
        : status === TaskStatus.MESH_GENERATION
          ? randomIntInRange(20, 40)
          : status === TaskStatus.LIGHT_TRANSPORT
            ? randomIntInRange(40, 65)
            : status === TaskStatus.BLOOD_INVERSION
              ? randomIntInRange(65, 90)
              : status === TaskStatus.COMPLETED ||
                  status === TaskStatus.PENDING_APPROVAL_1 ||
                  status === TaskStatus.PENDING_APPROVAL_2 ||
                  status === TaskStatus.APPROVED
                ? 100
                : 0;
    const layout = MOCK_LAYOUTS[i % MOCK_LAYOUTS.length];
    const head = MOCK_HEAD_MODELS[i % MOCK_HEAD_MODELS.length];
    tasks.push({
      id: `task_${String(i + 1).padStart(3, '0')}`,
      name: TASK_NAMES[i % TASK_NAMES.length] + ` #${i + 1}`,
      status,
      progress,
      headModelId: head.id,
      headModelName: head.name,
      layoutId: layout.id,
      layoutName: layout.name,
      userId: MOCK_USERS[i % MOCK_USERS.length].id,
      userName: MOCK_USERS[i % MOCK_USERS.length].name,
      snrThreshold: 20,
      channelCount: layout.channelCount,
      avgSNR: status === TaskStatus.COMPLETED ? randomInRange(20, 30) : undefined,
      convergenceCount: randomIntInRange(0, 3),
      createdAt: hoursAgo(i * 2),
      updatedAt: hoursAgo(i * 2 - 1),
      completedAt: status === TaskStatus.COMPLETED ? hoursAgo(i * 2 - 2) : undefined,
      statusHistory: [
        { id: generateId('log'), status: TaskStatus.PENDING_VALIDATION, message: '任务创建完成，等待校验', timestamp: hoursAgo(i * 2) },
        { id: generateId('log'), status: TaskStatus.MESH_GENERATION, message: '开始生成有限元网格', timestamp: hoursAgo(i * 2 - 0.5) },
      ],
      description: '探究该脑区在特定认知任务下的血氧动力学响应特征',
    });
  }
  return tasks;
})();

export const MOCK_ALERTS: Alert[] = [
  {
    id: generateId('alert'),
    taskId: 'task_004',
    taskName: '视觉刺激-棋盘格反转 #4',
    level: AlertLevel.LEVEL_3,
    status: AlertStatus.PENDING,
    reason: AlertReason.SNR_LOW,
    channelIndex: 17,
    value: 11.2,
    threshold: 20,
    description: '通道17信噪比持续低于阈值，已持续60秒，可能存在光极接触不良',
    pushStatus: 'read',
    createdAt: hoursAgo(0.5),
  },
  {
    id: generateId('alert'),
    taskId: 'task_005',
    taskName: '语言任务-语音生成 #5',
    level: AlertLevel.LEVEL_2,
    status: AlertStatus.UNDER_REVIEW,
    reason: AlertReason.HBO_ABNORMAL,
    channelIndex: 5,
    value: 38.5,
    threshold: 45,
    description: '通道5氧合血红蛋白浓度异常下降，超出正常生理波动范围',
    pushStatus: 'delivered',
    reviewerId: MOCK_USERS[1].id,
    reviewerName: MOCK_USERS[1].name,
    createdAt: hoursAgo(1.2),
    reviewedAt: hoursAgo(0.8),
  },
  {
    id: generateId('alert'),
    taskId: 'task_003',
    taskName: '运动皮层激活-右手运动 #3',
    level: AlertLevel.LEVEL_1,
    status: AlertStatus.RESOLVED,
    reason: AlertReason.CHANNEL_NOISE,
    channelIndex: 8,
    value: 0.08,
    threshold: 0.05,
    description: '通道8检测到高频噪声，建议检查屏蔽环境',
    pushStatus: 'delivered',
    reviewerId: MOCK_USERS[1].id,
    reviewerName: MOCK_USERS[1].name,
    reviewComment: '已调整光极间距从30mm增加至35mm，重新模拟后信噪比恢复正常',
    createdAt: hoursAgo(3.5),
    reviewedAt: hoursAgo(3),
    resolvedAt: hoursAgo(2),
  },
  {
    id: generateId('alert'),
    taskId: 'task_007',
    taskName: '静息态-默认网络 #7',
    level: AlertLevel.LEVEL_1,
    status: AlertStatus.PENDING,
    reason: AlertReason.CONVERGENCE_FAIL,
    value: 0,
    threshold: 3,
    description: '优化算法连续3次未收敛，可能存在局部极值',
    pushStatus: 'sent',
    createdAt: hoursAgo(0.15),
  },
];

export const MOCK_ADJUSTMENT_LOGS: AdjustmentLogEntry[] = [
  {
    id: generateId('adj'),
    taskId: 'task_003',
    taskName: '运动想象-手指敲击 #3',
    adjustmentType: 'optrode_spacing',
    beforeValue: '30mm',
    afterValue: '35mm',
    reason: '通道8信噪比低于阈值，增大间距提升穿透深度',
    adjustedBy: MOCK_USERS[1].name,
    createdAt: hoursAgo(2.5),
  },
  {
    id: generateId('adj'),
    taskId: 'task_005',
    taskName: '语言任务-语音生成 #5',
    adjustmentType: 'source_power',
    beforeValue: '8mW',
    afterValue: '12mW',
    reason: 'HbO信号微弱，提高光源功率增强信号强度',
    adjustedBy: MOCK_USERS[1].name,
    createdAt: hoursAgo(1.8),
  },
  {
    id: generateId('adj'),
    taskId: 'task_002',
    taskName: '视觉刺激-棋盘格反转 #2',
    adjustmentType: 'wavelength',
    beforeValue: '760, 850nm',
    afterValue: '735, 805, 850nm',
    reason: '增加波长数量提高血氧浓度反演精度',
    adjustedBy: MOCK_USERS[1].name,
    createdAt: hoursAgo(5),
  },
];

export const MOCK_APPROVALS: Approval[] = [
  {
    id: generateId('appr'),
    taskId: 'task_008',
    taskName: '疼痛刺激-热痛觉 #8',
    level: ApprovalLevel.LEVEL_1,
    status: ApprovalStatus.PENDING,
    createdAt: hoursAgo(0.3),
  },
  {
    id: generateId('appr'),
    taskId: 'task_009',
    taskName: '工作记忆任务-左侧前额叶 #9',
    level: ApprovalLevel.LEVEL_2,
    status: ApprovalStatus.PENDING,
    createdAt: hoursAgo(1.5),
  },
  {
    id: generateId('appr'),
    taskId: 'task_001',
    taskName: '工作记忆任务-左侧前额叶 #1',
    level: ApprovalLevel.LEVEL_1,
    status: ApprovalStatus.APPROVED,
    approverId: MOCK_USERS[2].id,
    approverName: MOCK_USERS[2].name,
    comment: '模拟结果可靠，信噪比达标，激活区域定位准确',
    createdAt: daysAgo(1),
    decidedAt: hoursAgo(20),
  },
];

export const MOCK_DEVIATION_RECORDS: DeviationRecord[] = [
  {
    id: generateId('dev'),
    headModelId: 'head_001',
    headModelName: 'ICBM152_标准脑模',
    taskId: 'task_010',
    taskName: '听觉皮层-音调辨别 #10',
    deviationMm: 6.2,
    activationRegion: '颞横回',
    referenceTaskId: 'task_005',
    createdAt: hoursAgo(8),
  },
  {
    id: generateId('dev'),
    headModelId: 'head_001',
    headModelName: 'ICBM152_标准脑模',
    taskId: 'task_012',
    taskName: '视觉刺激-棋盘格反转 #12',
    deviationMm: 5.8,
    activationRegion: '距状裂',
    referenceTaskId: 'task_004',
    createdAt: hoursAgo(5),
  },
];

export const MOCK_CHIEF_NOTIFICATIONS: ChiefNotification[] = [
  {
    id: generateId('notif'),
    type: 'deviation',
    title: '头模ICBM152连续3次偏差超阈值',
    content: '头模ICBM152_标准脑模最近3次模拟激活区域定位偏差分别为5.2mm、6.2mm、5.8mm，均超过5mm阈值，系统已自动暂停该头模的新任务提交，请及时介入处理。',
    headModelId: 'head_001',
    status: 'unread',
    createdAt: hoursAgo(4),
  },
  {
    id: generateId('notif'),
    type: 'system',
    title: '系统月度性能报告已生成',
    content: '本月系统平均完成率94.2%，平均信噪比25.8dB，较上月提升3.2%。详细数据请查看综合看板。',
    status: 'read',
    createdAt: daysAgo(1),
  },
];

export const MOCK_DAILY_STATS: DailyStats[] = (() => {
  const stats: DailyStats[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = daysAgo(i);
    const total = randomIntInRange(8, 18);
    const completed = Math.floor(total * randomInRange(0.8, 0.98));
    stats.push({
      date: `${d.getMonth() + 1}/${d.getDate()}`,
      totalTasks: total,
      completedTasks: completed,
      completionRate: completed / total,
      avgSNR: randomInRange(22, 28),
      convergenceCount: randomIntInRange(2, 8),
      alertCount: randomIntInRange(0, 4),
      avgDuration: randomInRange(1200, 2400),
    });
  }
  return stats;
})();

export const MOCK_PERFORMANCE: PerformanceMetrics = {
  accuracy: 0.92,
  efficiency: 0.85,
  stability: 0.94,
  convergence: 0.78,
  snr: 0.86,
  coverage: 0.88,
};

export const MOCK_LAYOUT_RECOMMENDATIONS: LayoutRecommendation[] = [
  {
    id: generateId('rec'),
    name: '前额叶高密度布局',
    description: '针对工作记忆和执行控制任务优化，重点覆盖背外侧前额叶和腹内侧前额叶',
    channelCount: 36,
    sourceCount: 10,
    detectorCount: 12,
    confidence: 0.94,
    basedOnTaskCount: 128,
    avgSNR: 27.5,
    avgCoverage: 0.92,
    targetRegions: ['Fp1', 'Fp2', 'F3', 'F4', 'F7', 'F8', 'Fz'],
    wavelengthCombo: [735, 805, 850],
  },
  {
    id: generateId('rec'),
    name: '运动感觉标准布局',
    description: '经典国际10-20系统中央区布局，适用于运动皮层和体感皮层研究',
    channelCount: 24,
    sourceCount: 8,
    detectorCount: 8,
    confidence: 0.91,
    basedOnTaskCount: 96,
    avgSNR: 26.2,
    avgCoverage: 0.88,
    targetRegions: ['C3', 'C4', 'Cz', 'P3', 'P4'],
    wavelengthCombo: [760, 850],
  },
  {
    id: generateId('rec'),
    name: '颞叶语言区布局',
    description: '覆盖布洛卡区和威尔尼克区，适合语言生成和理解任务',
    channelCount: 20,
    sourceCount: 6,
    detectorCount: 8,
    confidence: 0.88,
    basedOnTaskCount: 72,
    avgSNR: 24.8,
    avgCoverage: 0.85,
    targetRegions: ['T3', 'T4', 'T5', 'T6', 'F7', 'F8'],
    wavelengthCombo: [690, 780, 830],
  },
  {
    id: generateId('rec'),
    name: '全脑均衡覆盖布局',
    description: '48通道均衡覆盖四大脑叶，适用于静息态和探索性研究',
    channelCount: 48,
    sourceCount: 12,
    detectorCount: 12,
    confidence: 0.86,
    basedOnTaskCount: 214,
    avgSNR: 25.1,
    avgCoverage: 0.95,
    targetRegions: ['额叶', '顶叶', '颞叶', '枕叶'],
    wavelengthCombo: [760, 850],
  },
  {
    id: generateId('rec'),
    name: '视觉皮层专用布局',
    description: '高密度覆盖枕叶视觉皮层，适合视觉刺激和注意任务',
    channelCount: 18,
    sourceCount: 6,
    detectorCount: 6,
    confidence: 0.90,
    basedOnTaskCount: 58,
    avgSNR: 28.3,
    avgCoverage: 0.82,
    targetRegions: ['O1', 'O2', 'Oz', 'Pz'],
    wavelengthCombo: [760, 830, 850],
  },
];

export const MOCK_WAVELENGTH_RECOMMENDATIONS: WavelengthRecommendation[] = [
  {
    wavelengths: [760, 850],
    confidence: 0.95,
    expectedSNR: 26.5,
    expectedPenetration: 15,
    pros: ['经典双波长组合，设备兼容性好', 'HbO/HbR区分度高', '数据处理算法成熟'],
    cons: ['对黑色素校正能力有限', '穿透深度受限'],
  },
  {
    wavelengths: [735, 805, 850],
    confidence: 0.92,
    expectedSNR: 28.2,
    expectedPenetration: 18,
    pros: ['三波长提高反演精度', '805nm作为等吸收点利于校准', '穿透深度增加'],
    cons: ['设备成本更高', '数据采集时间延长20%'],
  },
  {
    wavelengths: [690, 780, 830],
    confidence: 0.88,
    expectedSNR: 27.8,
    expectedPenetration: 16,
    pros: ['短波长对表层灰质灵敏度高', '适合儿童和薄颅骨受试者', '颞叶信号质量好'],
    cons: ['对肤色更敏感', '深层信号信噪比略低'],
  },
];

export const MOCK_OPTICAL_PROPERTIES: TissueOpticalProperty[] = [...DEFAULT_OPTICAL_PROPERTIES];

export function generateActivationRegions(taskId: string): ActivationRegion[] {
  const regions: ActivationRegion[] = [];
  const selected = DEFAULT_BRAIN_REGIONS.slice(0, randomIntInRange(2, 5));
  for (let i = 0; i < selected.length; i++) {
    regions.push({
      id: generateId('act'),
      brainRegionId: selected[i].id,
      brainRegionName: selected[i].name,
      centerX: randomInRange(-50, 50),
      centerY: randomInRange(-40, 40),
      centerZ: randomInRange(55, 85),
      volumeMm3: randomInRange(200, 800),
      peakHbO: randomInRange(65, 90),
      peakHbR: randomInRange(25, 42),
      tScore: randomInRange(2.5, 6.8),
      pValue: randomInRange(0.001, 0.04),
      significance: true,
    });
  }
  return regions;
}

export function generateMockReport(task: SimulationTask): SimulationReport {
  return {
    id: generateId('rpt'),
    taskId: task.id,
    taskName: task.name,
    generatedAt: new Date(),
    generatedBy: task.userName,
    summary: `本模拟任务使用${task.headModelName}头模，配合${task.layoutName}布局，成功完成三维光传输计算与血氧浓度反演。共获得有效通道${task.channelCount}个，平均信噪比${(task.avgSNR || 25).toFixed(1)}dB，识别出显著激活脑区若干。`,
    avgSNR: task.avgSNR || 25.4,
    minSNR: 17.8,
    maxSNR: 33.6,
    channelCount: task.channelCount,
    validChannels: Math.floor(task.channelCount * 0.94),
    totalDuration: 1850,
    convergenceCount: task.convergenceCount,
    activationRegions: generateActivationRegions(task.id),
    headModelName: task.headModelName,
    layoutName: task.layoutName,
    parameters: {
      sourcePower: 10,
      wavelengths: [760, 850],
      optrodeSpacing: 30,
      snrThreshold: task.snrThreshold,
    },
  };
}
