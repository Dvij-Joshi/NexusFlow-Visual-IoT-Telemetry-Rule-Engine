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
      className={`w-64 rounded-xl bg-slate-900 border text-slate-100 shadow-md transition-all ${
        selected
          ? 'border-rose-400 ring-2 ring-rose-500/40 shadow-rose-950/50'
          : 'border-slate-800 hover:border-slate-700'
      }`}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Top}
        id="in"
        isConnectable={isConnectable}
        className="!bg-rose-400 !w-3 !h-3 !border-2 !border-slate-950 hover:!scale-125 transition-transform"
      />

      {/* Node Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-slate-800 bg-slate-950/40 rounded-t-xl">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-rose-950 text-rose-400 border border-rose-800">
            <BellRing className="w-3.5 h-3.5" />
          </div>
          <span className="text-[11px] font-semibold tracking-wider uppercase text-rose-400">
            Alert Action
          </span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-rose-400/90 bg-rose-950/60 px-1.5 py-0.5 rounded font-mono border border-rose-800/60">
          <AlertTriangle className="w-2.5 h-2.5" /> Output
        </div>
      </div>

      {/* Node Body */}
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-200 truncate">{label}</span>
          <span
            className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border font-semibold ${getSeverityBadgeClass(
              severity
            )}`}
          >
            {severity}
          </span>
        </div>

        <div className="bg-slate-950/80 rounded-lg p-2 border border-slate-800 space-y-1 font-mono text-[11px]">
          <div className="text-slate-400 font-sans text-[11px]">Message:</div>
          <p className="text-slate-200 line-clamp-2 italic font-sans text-xs">"{message}"</p>
        </div>
      </div>
    </div>
  );
};

export default memo(AlertNode);
