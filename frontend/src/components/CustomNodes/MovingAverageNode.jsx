import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Activity, Gauge } from 'lucide-react';

const MovingAverageNode = ({ data, selected, isConnectable }) => {
  const windowSize = data?.windowSize ?? 5;
  const label = data?.label || 'Moving Average';

  return (
    <div
      className={`w-64 rounded-xl bg-slate-900 border text-slate-100 shadow-md transition-all ${selected
        ? 'border-indigo-400 ring-2 ring-indigo-500/40 shadow-indigo-950/50'
        : 'border-slate-800 hover:border-slate-700'
        }`}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Top}
        id="in"
        isConnectable={isConnectable}
        className="!bg-indigo-400 !w-3 !h-3 !border-2 !border-slate-950 hover:!scale-125 transition-transform"
      />

      {/* Node Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-slate-800 bg-slate-950/40 rounded-t-xl">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-indigo-950 text-indigo-400 border border-indigo-800">
            <Activity className="w-3.5 h-3.5" />
          </div>
          <span className="text-[11px] font-semibold tracking-wider uppercase text-indigo-400">
            Moving Average
          </span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-indigo-400/90 bg-indigo-950/60 px-1.5 py-0.5 rounded font-mono border border-indigo-800/60">
          <Gauge className="w-2.5 h-2.5" /> Transform
        </div>
      </div>

      {/* Node Body */}
      <div className="p-3 space-y-2">
        <div className="text-xs font-medium text-slate-200 truncate">{label}</div>

        <div className="bg-slate-950/80 rounded-lg p-2 border border-slate-800 space-y-1.5 font-mono text-[11px]">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-sans text-[11px]">Window Size:</span>
            <span className="text-indigo-300 font-semibold">{windowSize} samples</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-sans text-[11px]">Algorithm:</span>
            <span className="text-slate-300">Simple Moving Avg</span>
          </div>
        </div>
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="out"
        isConnectable={isConnectable}
        className="!bg-indigo-400 !w-3 !h-3 !border-2 !border-slate-950 hover:!scale-125 transition-transform"
      />
    </div>
  );
};

export default memo(MovingAverageNode);

