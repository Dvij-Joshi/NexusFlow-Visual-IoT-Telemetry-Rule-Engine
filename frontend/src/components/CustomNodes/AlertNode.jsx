import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { BellRing, AlertTriangle } from 'lucide-react';

const AlertNode = ({ data, selected, isConnectable }) => {
  const message = data?.message || data?.label || 'Alert condition triggered';
  const severity = (data?.severity || 'High').toUpperCase();
  const label = data?.label || 'Alert Action';

  const getSeverityBadgeClass = (sev) => {
    switch (sev) {
      case 'HIGH':
      case 'CRITICAL':
        return 'bg-rose-950/80 text-rose-300 border-rose-800';
      case 'MEDIUM':
      case 'WARNING':
        return 'bg-amber-950/80 text-amber-300 border-amber-800';
      case 'LOW':
      case 'INFO':
      default:
        return 'bg-blue-950/80 text-blue-300 border-blue-800';
    }
  };

  return (
    <div
      className={`w-72 rounded-xl bg-slate-900/95 backdrop-blur-md border border-t-2 text-slate-100 shadow-xl transition-all ${
        selected
          ? 'border-rose-400 border-t-rose-400 ring-2 ring-rose-500/40 shadow-rose-950/80'
          : 'border-slate-800/90 border-t-rose-500 hover:border-slate-700'
      }`}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Top}
        id="in"
        isConnectable={isConnectable}
        className="!bg-rose-400 !w-3.5 !h-3.5 !border-2 !border-slate-950 hover:!scale-125 transition-transform shadow-md shadow-rose-500/50"
      />

      {/* Node Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-slate-800/80 bg-slate-950/60 rounded-t-xl">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-rose-950/90 text-rose-400 border border-rose-800/80 shadow-sm shadow-rose-950">
            <BellRing className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-[10px] font-bold tracking-wider uppercase text-rose-400 font-mono">
              Alert Action
            </div>
            <div className="text-xs font-semibold text-white truncate max-w-[150px]">
              {label}
            </div>
          </div>
        </div>
        <span
          className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border font-bold shadow-sm ${getSeverityBadgeClass(
            severity
          )}`}
        >
          {severity}
        </span>
      </div>

      {/* Node Body */}
      <div className="p-3">
        <div className="bg-slate-950/90 rounded-lg p-2.5 border border-slate-800/80 space-y-1.5 text-xs">
          <span className="text-slate-400 text-[11px]">Notification Payload</span>
          <p className="text-slate-200 line-clamp-2 text-xs font-medium leading-relaxed italic bg-slate-900/60 p-2 rounded border border-slate-800/60">
            "{message}"
          </p>
        </div>
      </div>
    </div>
  );
};

export default memo(AlertNode);
