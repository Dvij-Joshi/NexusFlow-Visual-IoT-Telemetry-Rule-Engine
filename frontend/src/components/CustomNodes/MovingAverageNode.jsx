import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Activity, Gauge } from 'lucide-react';

const MovingAverageNode = ({ data, selected, isConnectable }) => {
  const windowSize = data?.windowSize ?? 5;
  const label = data?.label || 'Moving Average';

  return (
    <div
      className={`w-72 rounded-xl bg-slate-900/95 backdrop-blur-md border border-t-2 text-slate-100 shadow-xl transition-all ${
        selected
          ? 'border-indigo-400 border-t-indigo-400 ring-2 ring-indigo-500/40 shadow-indigo-950/80'
          : 'border-slate-800/90 border-t-indigo-500 hover:border-slate-700'
      }`}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Top}
        id="in"
        isConnectable={isConnectable}
        className="!bg-indigo-400 !w-3.5 !h-3.5 !border-2 !border-slate-950 hover:!scale-125 transition-transform shadow-md shadow-indigo-500/50"
      />

      {/* Node Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-slate-800/80 bg-slate-950/60 rounded-t-xl">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-950/90 text-indigo-400 border border-indigo-800/80 shadow-sm shadow-indigo-950">
            <Activity className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-[10px] font-bold tracking-wider uppercase text-indigo-400 font-mono">
              Moving Average
            </div>
            <div className="text-xs font-semibold text-white truncate max-w-[150px]">
              {label}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-indigo-400/90 bg-indigo-950/80 px-2 py-0.5 rounded-full font-mono border border-indigo-800/80">
          <Gauge className="w-2.5 h-2.5" /> Transform
        </div>
      </div>

      {/* Node Body */}
      <div className="p-3">
        <div className="bg-slate-950/90 rounded-lg p-2.5 border border-slate-800/80 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-[11px]">Window Size</span>
            <span className="px-2 py-0.5 rounded bg-indigo-950/70 border border-indigo-800 text-indigo-300 font-mono font-semibold text-[11px]">
              {windowSize} samples
            </span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-slate-900">
            <span className="text-slate-400 text-[11px]">Algorithm</span>
            <span className="font-mono text-slate-300 text-[11px]">Simple Rolling (SMA)</span>
          </div>
        </div>
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="out"
        isConnectable={isConnectable}
        className="!bg-indigo-400 !w-3.5 !h-3.5 !border-2 !border-slate-950 hover:!scale-125 transition-transform shadow-md shadow-indigo-500/50"
      />
    </div>
  );
};

export default memo(MovingAverageNode);

