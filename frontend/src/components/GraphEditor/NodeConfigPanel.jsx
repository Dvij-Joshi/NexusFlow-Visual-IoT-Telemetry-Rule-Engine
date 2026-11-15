import React, { useEffect, useState } from 'react';
import {
  X,
  Trash2,
  Cpu,
  Activity,
  GitCompare,
  BellRing,
  HelpCircle,
  Sliders,
} from 'lucide-react';
import { getDevices } from '../../services/api';

const DEFAULT_DEVICES = [
  { deviceId: 'TURBINE_01', deviceName: 'Main Turbine Temp Sensor', deviceType: 'temperature' },
  { deviceId: 'TURBINE_02', deviceName: 'Main Turbine Pressure Sensor', deviceType: 'pressure' },
  { deviceId: 'MOTOR_01', deviceName: 'Assembly Motor Vibration', deviceType: 'vibration' },
  { deviceId: 'MOTOR_02', deviceName: 'Conveyor Motor Temperature', deviceType: 'temperature' },
  { deviceId: 'PUMP_01', deviceName: 'Cooling Pump Pressure', deviceType: 'pressure' },
];

const STANDARD_FIELDS = ['temperature', 'pressure', 'vibration', 'humidity', 'voltage', 'current'];

export default function NodeConfigPanel({ node, onUpdate, onDelete, onClose }) {
  const [availableDevices, setAvailableDevices] = useState(DEFAULT_DEVICES);

  useEffect(() => {
    let mounted = true;
    getDevices()
      .then((res) => {
        if (mounted && res.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
          setAvailableDevices(res.data.data);
        }
      })
      .catch(() => {
        // Fall back gracefully to DEFAULT_DEVICES
      });
    return () => {
      mounted = false;
    };
  }, []);

  if (!node) return null;

  const data = node.data || {};
  const isSensor = node.type === 'sensor';
  const isMovingAverage = node.type === 'movingAverage' || node.type === 'transform';
  const isThreshold = node.type === 'threshold';
  const isAlert = node.type === 'alert';

  const handleChange = (key, value) => {
    onUpdate(node.id, { [key]: value });
  };

  const getHeaderIcon = () => {
    if (isSensor) return <Cpu className="w-4 h-4 text-cyan-400" />;
    if (isMovingAverage) return <Activity className="w-4 h-4 text-indigo-400" />;
    if (isThreshold) return <GitCompare className="w-4 h-4 text-amber-400" />;
    if (isAlert) return <BellRing className="w-4 h-4 text-rose-400" />;
    return <Sliders className="w-4 h-4 text-slate-400" />;
  };

  const getNodeTypeName = () => {
    if (isSensor) return 'Sensor Node';
    if (isMovingAverage) return 'Moving Average Node';
    if (isThreshold) return 'Threshold Check Node';
    if (isAlert) return 'Alert Action Node';
    return `${node.type} Node`;
  };

  return (
    <div className="w-80 border-l border-slate-800 bg-slate-900/95 flex flex-col z-10 text-slate-200">
      {/* Header */}
      <div className="flex h-12 items-center justify-between border-b border-slate-800 px-4">
        <div className="flex items-center gap-2">
          {getHeaderIcon()}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white">
              {getNodeTypeName()}
            </h3>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
          title="Close panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {/* Node ID indicator */}
        <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 flex items-center justify-between font-mono text-[11px]">
          <span className="text-slate-400">Node ID:</span>
          <span className="text-slate-200 font-semibold">{node.id}</span>
        </div>

        {/* Display Label */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-slate-400">Label / Name</label>
          <input
            type="text"
            value={data.label || ''}
            onChange={(e) => handleChange('label', e.target.value)}
            placeholder="e.g. Turbine Temp Monitor"
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* SENSOR CONFIGURATION */}
        {isSensor && (
          <div className="space-y-3.5 pt-2 border-t border-slate-800/80">
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-400 flex items-center justify-between">
                <span>Device ID</span>
                <span className="text-[10px] text-cyan-400 font-mono">Required</span>
              </label>
              <select
                value={data.deviceId || 'TURBINE_01'}
                onChange={(e) => handleChange('deviceId', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                {availableDevices.map((d) => (
                  <option key={d.deviceId} value={d.deviceId}>
                    {d.deviceId} {d.deviceName ? `(${d.deviceName})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-400">Telemetry Field</label>
              <select
                value={data.field || data.channel || 'temperature'}
                onChange={(e) => {
                  handleChange('field', e.target.value);
                  handleChange('channel', e.target.value);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                {STANDARD_FIELDS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* MOVING AVERAGE CONFIGURATION */}
        {isMovingAverage && (
          <div className="space-y-3.5 pt-2 border-t border-slate-800/80">
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-400 flex items-center justify-between">
                <span>Window Size (samples)</span>
                <span className="text-[10px] text-indigo-400 font-mono">Default: 5</span>
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={data.windowSize ?? 5}
                onChange={(e) => handleChange('windowSize', Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
              <p className="text-[10px] text-slate-500">
                Number of historical readings used to compute the rolling average.
              </p>
            </div>
          </div>
        )}

        {/* THRESHOLD CONFIGURATION */}
        {isThreshold && (
          <div className="space-y-3.5 pt-2 border-t border-slate-800/80">
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-400">Telemetry Field</label>
              <input
                type="text"
                value={data.field || 'temperature'}
                onChange={(e) => handleChange('field', e.target.value)}
                placeholder="e.g. temperature"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-400">Comparison Operator</label>
              <select
                value={data.operator || '>'}
                onChange={(e) => handleChange('operator', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
              >
                <option value=">">&gt; (Greater than)</option>
                <option value="<">&lt; (Less than)</option>
                <option value=">=">&gt;= (Greater than or equal)</option>
                <option value="<=">&lt;= (Less than or equal)</option>
                <option value="==">== (Equal to)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-400">Threshold Value</label>
              <input
                type="number"
                step="any"
                value={data.value ?? 80}
                onChange={(e) => handleChange('value', parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        )}

        {/* ALERT CONFIGURATION */}
        {isAlert && (
          <div className="space-y-3.5 pt-2 border-t border-slate-800/80">
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-400">Alert Message</label>
              <textarea
                rows={3}
                value={data.message || ''}
                onChange={(e) => handleChange('message', e.target.value)}
                placeholder="Describe the alert trigger..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500 resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-400">Severity Level</label>
              <select
                value={data.severity || 'High'}
                onChange={(e) => handleChange('severity', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Footer / Actions */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60">
        <button
          onClick={() => onDelete(node.id)}
          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-rose-900/60 bg-rose-950/40 text-rose-300 hover:bg-rose-950 hover:border-rose-700 text-xs font-medium transition"
        >
          <Trash2 className="w-3.5 h-3.5" /> Delete Node
        </button>
      </div>
    </div>
  );
}
