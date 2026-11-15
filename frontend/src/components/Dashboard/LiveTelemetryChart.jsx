import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Activity } from 'lucide-react';

export default function LiveTelemetryChart({ telemetryData = [], selectedDeviceId = null }) {
  const [showTemp, setShowTemp] = useState(true);
  const [showPressure, setShowPressure] = useState(true);
  const [showVibration, setShowVibration] = useState(true);

  // Filter data by selectedDeviceId if given
  const filteredData = selectedDeviceId
    ? telemetryData.filter((item) => item.deviceId === selectedDeviceId)
    : telemetryData;

  const chartData = filteredData.slice(-30).map((item) => ({
    time: new Date(item.timestamp).toLocaleTimeString(),
    deviceId: item.deviceId,
    temperature: item.temperature,
    pressure: item.pressure,
    vibration: item.vibration,
  }));

  const latest = chartData[chartData.length - 1] || null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-slate-200">
              Live Telemetry Stream {selectedDeviceId ? `(${selectedDeviceId})` : '(All Devices)'}
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Real-time sensor readings over WebSocket channel • {filteredData.length} total readings
          </p>
        </div>

        {/* Metric Toggles & Legend */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <label className="flex items-center gap-1.5 cursor-pointer text-cyan-400">
            <input
              type="checkbox"
              checked={showTemp}
              onChange={(e) => setShowTemp(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0"
            />
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span> Temp (°C)
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer text-indigo-400">
            <input
              type="checkbox"
              checked={showPressure}
              onChange={(e) => setShowPressure(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-indigo-500 focus:ring-0"
            />
            <span className="w-2 h-2 rounded-full bg-indigo-400"></span> Press (psi)
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer text-emerald-400">
            <input
              type="checkbox"
              checked={showVibration}
              onChange={(e) => setShowVibration(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-0"
            />
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Vib (mm/s)
          </label>
        </div>
      </div>

      {/* Latest Stats Strip */}
      {latest && (
        <div className="grid grid-cols-3 gap-2 py-1 px-3 bg-slate-950/70 border border-slate-800/80 rounded-lg text-xs font-mono">
          <div>
            <span className="text-slate-500 block text-[10px]">TEMP</span>
            <span className="text-cyan-400 font-semibold text-sm">
              {latest.temperature !== undefined ? `${latest.temperature} °C` : '--'}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">PRESSURE</span>
            <span className="text-indigo-400 font-semibold text-sm">
              {latest.pressure !== undefined ? `${latest.pressure} psi` : '--'}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">VIBRATION</span>
            <span className="text-emerald-400 font-semibold text-sm">
              {latest.vibration !== undefined ? `${latest.vibration} mm/s` : '--'}
            </span>
          </div>
        </div>
      )}

      {/* Chart Canvas */}
      <div className="h-64 w-full">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-500">
            Awaiting incoming IoT telemetry data...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.5rem',
                  fontSize: '12px',
                }}
              />
              {showTemp && (
                <Line
                  type="monotone"
                  dataKey="temperature"
                  name="Temperature (°C)"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              )}
              {showPressure && (
                <Line
                  type="monotone"
                  dataKey="pressure"
                  name="Pressure (psi)"
                  stroke="#818cf8"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              )}
              {showVibration && (
                <Line
                  type="monotone"
                  dataKey="vibration"
                  name="Vibration (mm/s)"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
