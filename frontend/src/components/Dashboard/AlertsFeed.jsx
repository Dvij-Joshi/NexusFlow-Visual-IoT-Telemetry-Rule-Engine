import React from 'react';
import { AlertTriangle, Bell, CheckCircle2 } from 'lucide-react';

export default function AlertsFeed({ alerts = [] }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col h-full">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-rose-400" />
          <h3 className="text-sm font-semibold text-slate-200">Rule Engine Alerts</h3>
        </div>
        <span className="text-xs bg-rose-950 text-rose-400 px-2 py-0.5 rounded-full font-mono">
          {alerts.length} Triggered
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-72">
        {alerts.length === 0 ? (
          <div className="h-40 flex flex-col items-center justify-center text-center text-xs text-slate-500">
            <CheckCircle2 className="w-6 h-6 text-emerald-500/50 mb-1" />
            <p>All monitored systems normal</p>
            <p className="text-[10px] text-slate-600">No rule violations detected</p>
          </div>
        ) : (
          alerts.slice(0, 20).map((alert) => (
            <div
              key={alert.id}
              className="p-2.5 rounded-lg bg-slate-950/80 border border-rose-900/40 hover:border-rose-700/60 transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-1.5 text-rose-400 font-semibold text-xs">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{alert.deviceId}</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  {new Date(alert.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">{alert.message}</p>
              {alert.reading && (
                <div className="mt-1.5 text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded">
                  Temp: {alert.reading.temperature}°C · Pressure: {alert.reading.pressure} psi
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
