import React from 'react';
import { AlertTriangle, Bell, CheckCircle2, ShieldAlert, Info, AlertOctagon } from 'lucide-react';

/** Returns Tailwind color classes for a given severity level */
function getSeverityStyle(severity) {
  switch ((severity || '').toLowerCase()) {
    case 'critical':
      return {
        border: 'border-red-700/60 hover:border-red-500/80',
        icon: <AlertOctagon className="w-3.5 h-3.5 text-red-400" />,
        label: 'bg-red-950 text-red-400',
        dot: 'bg-red-400',
      };
    case 'high':
      return {
        border: 'border-orange-700/50 hover:border-orange-500/70',
        icon: <ShieldAlert className="w-3.5 h-3.5 text-orange-400" />,
        label: 'bg-orange-950 text-orange-400',
        dot: 'bg-orange-400',
      };
    case 'warning':
    case 'medium':
      return {
        border: 'border-amber-700/40 hover:border-amber-500/60',
        icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />,
        label: 'bg-amber-950 text-amber-400',
        dot: 'bg-amber-400',
      };
    case 'info':
    case 'low':
      return {
        border: 'border-blue-800/40 hover:border-blue-600/60',
        icon: <Info className="w-3.5 h-3.5 text-blue-400" />,
        label: 'bg-blue-950 text-blue-400',
        dot: 'bg-blue-400',
      };
    default:
      return {
        border: 'border-rose-900/40 hover:border-rose-700/60',
        icon: <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />,
        label: 'bg-rose-950 text-rose-400',
        dot: 'bg-rose-400',
      };
  }
}

export default function AlertsFeed({ alerts = [] }) {
  const unresolved = alerts.filter((a) => a.status !== 'resolved');

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col h-full">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-rose-400" />
          <h3 className="text-sm font-semibold text-slate-200">Rule Engine Alerts</h3>
        </div>
        <span className="text-xs bg-rose-950 text-rose-400 px-2 py-0.5 rounded-full font-mono">
          {unresolved.length} Active
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
          alerts.slice(0, 20).map((alert) => {
            const style = getSeverityStyle(alert.severity);
            return (
              <div
                key={alert.id || alert.alertId}
                className={`p-2.5 rounded-lg bg-slate-950/80 border transition ${style.border}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-1.5 font-semibold text-xs text-slate-200">
                    {style.icon}
                    <span>{alert.deviceId}</span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${style.label}`}
                    >
                      {(alert.severity || 'medium').toUpperCase()}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(alert.timestamp || alert.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">{alert.message}</p>
                {alert.reading && (
                  <div className="mt-1.5 text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded">
                    Temp: {alert.reading.temperature}°C · Pressure: {alert.reading.pressure} psi
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
