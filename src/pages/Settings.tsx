import { useState } from 'react';
import {
  Settings,
  Gauge,
  Bell,
  User,
  ShieldAlert,
  Shield,
  ShieldCheck,
  Mail,
  MessageSquare,
  Smartphone,
  Save,
  RotateCcw,
  AtSign,
  UserCircle,
  Building2,
  Activity,
  Target,
} from 'lucide-react';
import { useUserStore } from '../store/useUserStore';
import { UserRoleLabels } from '../types';
import { formatNumber } from '../utils/helpers';

interface ThresholdConfig {
  snrLevel1: number;
  snrLevel2: number;
  snrLevel3: number;
  hbOAbnormal: number;
  hbRAbnormal: number;
  deviationMm: number;
}

interface NotificationConfig {
  channels: {
    inApp: boolean;
    email: boolean;
    sms: boolean;
  };
  responseDeadline: number;
}

export default function SettingsPage() {
  const { currentUser } = useUserStore();

  const [thresholds, setThresholds] = useState<ThresholdConfig>({
    snrLevel1: 25,
    snrLevel2: 20,
    snrLevel3: 15,
    hbOAbnormal: 45,
    hbRAbnormal: 50,
    deviationMm: 5,
  });

  const [notifications, setNotifications] = useState<NotificationConfig>({
    channels: {
      inApp: true,
      email: true,
      sms: false,
    },
    responseDeadline: 30,
  });

  const updateThreshold = (key: keyof ThresholdConfig, value: number) => {
    setThresholds((prev) => ({ ...prev, [key]: value }));
  };

  const toggleChannel = (channel: keyof NotificationConfig['channels']) => {
    setNotifications((prev) => ({
      ...prev,
      channels: { ...prev.channels, [channel]: !prev.channels[channel] },
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-cyber-300 flex items-center gap-3">
            <Settings className="w-7 h-7" />
            系统设置
          </h1>
          <p className="text-sm text-space-500 mt-1">配置预警阈值、通知方式与账户信息</p>
        </div>
      </div>

      <div className="glass-card p-5">
        <h2 className="section-title">
          <Gauge className="w-5 h-5" />
          阈值配置
        </h2>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-semibold text-cyber-200 mb-4 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-warn-400" />
                SNR 预警阈值 (dB)
              </h3>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded bg-danger-500/20 flex items-center justify-center">
                        <ShieldAlert className="w-3.5 h-3.5 text-danger-400" />
                      </div>
                      <div>
                        <span className="text-sm text-space-300">三级预警</span>
                        <span className="text-[10px] text-space-500 ml-2">严重</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="5"
                        max="30"
                        value={thresholds.snrLevel3}
                        onChange={(e) => updateThreshold('snrLevel3', Number(e.target.value))}
                        className="w-32 accent-danger-500"
                      />
                      <span className="font-mono text-danger-400 text-sm w-14 text-right">
                        {formatNumber(thresholds.snrLevel3, 0)} dB
                      </span>
                    </div>
                  </div>
                  <div className="h-1 rounded-full bg-space-700">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-danger-500 to-danger-400"
                      style={{ width: `${(thresholds.snrLevel3 / 30) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded bg-warn-500/20 flex items-center justify-center">
                        <Shield className="w-3.5 h-3.5 text-warn-400" />
                      </div>
                      <div>
                        <span className="text-sm text-space-300">二级预警</span>
                        <span className="text-[10px] text-space-500 ml-2">警告</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="10"
                        max="35"
                        value={thresholds.snrLevel2}
                        onChange={(e) => updateThreshold('snrLevel2', Number(e.target.value))}
                        className="w-32 accent-warn-500"
                      />
                      <span className="font-mono text-warn-400 text-sm w-14 text-right">
                        {formatNumber(thresholds.snrLevel2, 0)} dB
                      </span>
                    </div>
                  </div>
                  <div className="h-1 rounded-full bg-space-700">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-warn-500 to-warn-400"
                      style={{ width: `${(thresholds.snrLevel2 / 35) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded bg-cyber-500/20 flex items-center justify-center">
                        <ShieldCheck className="w-3.5 h-3.5 text-cyber-400" />
                      </div>
                      <div>
                        <span className="text-sm text-space-300">一级预警</span>
                        <span className="text-[10px] text-space-500 ml-2">提示</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="15"
                        max="40"
                        value={thresholds.snrLevel1}
                        onChange={(e) => updateThreshold('snrLevel1', Number(e.target.value))}
                        className="w-32 accent-cyber-500"
                      />
                      <span className="font-mono text-cyber-400 text-sm w-14 text-right">
                        {formatNumber(thresholds.snrLevel1, 0)} dB
                      </span>
                    </div>
                  </div>
                  <div className="h-1 rounded-full bg-space-700">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyber-500 to-cyber-400"
                      style={{ width: `${(thresholds.snrLevel1 / 40) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-semibold text-cyber-200 mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-bio-400" />
                血氧浓度异常阈值 (μmol/L)
              </h3>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-space-300">HbO 浓度下限</span>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        value={thresholds.hbOAbnormal}
                        onChange={(e) => updateThreshold('hbOAbnormal', Number(e.target.value))}
                        className="w-24 cyber-input text-sm font-mono text-bio-400 text-right"
                      />
                      <span className="text-xs text-space-500">μmol/L</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-space-500">低于此值视为氧合血红蛋白浓度异常下降</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-space-300">HbR 浓度上限</span>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        value={thresholds.hbRAbnormal}
                        onChange={(e) => updateThreshold('hbRAbnormal', Number(e.target.value))}
                        className="w-24 cyber-input text-sm font-mono text-danger-400 text-right"
                      />
                      <span className="text-xs text-space-500">μmol/L</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-space-500">高于此值视为脱氧血红蛋白浓度异常升高</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-cyber-500/10">
              <h3 className="text-sm font-semibold text-cyber-200 mb-4 flex items-center gap-2">
                <Target className="w-4 h-4 text-warn-400" />
                偏差阈值
              </h3>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-space-300">定位偏差阈值</span>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="1"
                      max="15"
                      value={thresholds.deviationMm}
                      onChange={(e) => updateThreshold('deviationMm', Number(e.target.value))}
                      className="w-32 accent-warn-500"
                    />
                    <span className="font-mono text-warn-400 text-sm w-14 text-right">
                      {formatNumber(thresholds.deviationMm, 0)} mm
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-space-500">连续3次超过此阈值将自动暂停该头模的新任务提交</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-cyber-500/10">
          <button className="cyber-button-outline text-sm px-5 flex items-center gap-2">
            <RotateCcw className="w-4 h-4" />
            恢复默认
          </button>
          <button className="cyber-button text-sm px-6 flex items-center gap-2">
            <Save className="w-4 h-4" />
            保存阈值配置
          </button>
        </div>
      </div>

      <div className="glass-card p-5">
        <h2 className="section-title">
          <Bell className="w-5 h-5" />
          通知设置
        </h2>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-semibold text-cyber-200 mb-4">推送渠道</h3>
            <div className="space-y-3">
              {[
                { key: 'inApp' as const, label: '站内消息', desc: '系统内消息中心推送', icon: MessageSquare },
                { key: 'email' as const, label: '邮件通知', desc: '发送至注册邮箱', icon: Mail },
                { key: 'sms' as const, label: '短信通知', desc: '发送至绑定手机（仅紧急）', icon: Smartphone },
              ].map(({ key, label, desc, icon: Icon }) => (
                <div
                  key={key}
                  className={`p-3.5 rounded border flex items-center justify-between transition-all cursor-pointer ${
                    notifications.channels[key]
                      ? 'bg-cyber-500/10 border-cyber-500/40'
                      : 'bg-space-900/50 border-cyber-500/10 hover:border-cyber-500/20'
                  }`}
                  onClick={() => toggleChannel(key)}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                        notifications.channels[key]
                          ? 'bg-cyber-500/20 text-cyber-400'
                          : 'bg-space-800 text-space-500'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm text-space-200">{label}</p>
                      <p className="text-[11px] text-space-500">{desc}</p>
                    </div>
                  </div>
                  <div
                    className={`w-11 h-6 rounded-full p-0.5 transition-all relative ${
                      notifications.channels[key] ? 'bg-cyber-500' : 'bg-space-600'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        notifications.channels[key] ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-cyber-200 mb-4">预警响应时限</h3>
            <div className="glass-card p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-space-300">要求响应时间</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="5"
                    max="120"
                    value={notifications.responseDeadline}
                    onChange={(e) =>
                      setNotifications((prev) => ({
                        ...prev,
                        responseDeadline: Number(e.target.value),
                      }))
                    }
                    className="w-20 cyber-input text-sm font-mono text-cyber-400 text-right"
                  />
                  <span className="text-xs text-space-500">分钟</span>
                </div>
              </div>
              <p className="text-[11px] text-space-500 mb-4">
                超过此时限未处理的预警将自动升级，并通知上级管理人员
              </p>

              <div className="grid grid-cols-4 gap-2">
                {[5, 15, 30, 60].map((m) => (
                  <button
                    key={m}
                    onClick={() => setNotifications((prev) => ({ ...prev, responseDeadline: m }))}
                    className={`py-1.5 rounded text-xs font-mono border transition-all ${
                      notifications.responseDeadline === m
                        ? 'bg-cyber-500/20 border-cyber-400 text-cyber-300'
                        : 'bg-space-900/50 border-cyber-500/20 text-space-400 hover:border-cyber-500/40'
                    }`}
                  >
                    {m}min
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 glass-card p-4">
              <h4 className="text-xs font-semibold text-cyber-300 mb-3">通知级别示例</h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyber-400" />
                  <span className="text-space-400">一级预警：</span>
                  <span className="text-space-300">站内消息</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-warn-400" />
                  <span className="text-space-400">二级预警：</span>
                  <span className="text-space-300">站内 + 邮件</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-danger-400" />
                  <span className="text-space-400">三级预警：</span>
                  <span className="text-space-300">站内 + 邮件 + 短信</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-cyber-500/10">
          <button className="cyber-button text-sm px-6 flex items-center gap-2">
            <Save className="w-4 h-4" />
            保存通知设置
          </button>
        </div>
      </div>

      <div className="glass-card p-5">
        <h2 className="section-title">
          <User className="w-5 h-5" />
          账户管理
        </h2>

        <div className="grid grid-cols-3 gap-6">
          <div className="glass-card p-5 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyber-500/30 to-cyber-500/5 border-2 border-cyber-500/40 flex items-center justify-center mb-4">
              <UserCircle className="w-12 h-12 text-cyber-400" />
            </div>
            <h3 className="text-lg font-semibold text-cyber-200 mb-1">{currentUser.name}</h3>
            <span className="px-2.5 py-0.5 bg-cyber-500/15 text-cyber-300 border border-cyber-500/30 rounded text-xs font-medium mb-3">
              {UserRoleLabels[currentUser.role]}
            </span>
            <p className="text-xs text-space-500">{currentUser.email}</p>
            <p className="text-[11px] text-space-500 mt-1">ID: {currentUser.id}</p>
          </div>

          <div className="col-span-2 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="data-label block mb-1.5">
                  <User className="w-3 h-3 inline mr-1" />
                  用户名
                </label>
                <input
                  type="text"
                  defaultValue={currentUser.name}
                  className="cyber-input text-sm"
                  readOnly
                />
              </div>
              <div>
                <label className="data-label block mb-1.5">
                  <Building2 className="w-3 h-3 inline mr-1" />
                  角色
                </label>
                <input
                  type="text"
                  defaultValue={UserRoleLabels[currentUser.role]}
                  className="cyber-input text-sm"
                  readOnly
                />
              </div>
              <div>
                <label className="data-label block mb-1.5">
                  <AtSign className="w-3 h-3 inline mr-1" />
                  邮箱
                </label>
                <input
                  type="email"
                  defaultValue={currentUser.email}
                  className="cyber-input text-sm"
                />
              </div>
              <div>
                <label className="data-label block mb-1.5">
                  <Smartphone className="w-3 h-3 inline mr-1" />
                  手机号
                </label>
                <input
                  type="tel"
                  placeholder="未绑定"
                  className="cyber-input text-sm text-space-500"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-cyber-500/10 flex justify-end gap-3">
              <button className="cyber-button-outline text-sm px-5">修改密码</button>
              <button className="cyber-button text-sm px-6 flex items-center gap-2">
                <Save className="w-4 h-4" />
                保存账户信息
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
