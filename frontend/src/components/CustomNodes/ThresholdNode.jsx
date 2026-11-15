import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { GitCompare, Sliders } from 'lucide-react';

const ThresholdNode = ({ data, selected, isConnectable }) => {
  const operator = data?.operator || '>';
  const value = data?.value ?? 80;
  const field = data?.field || 'temperature';
  const label = data?.label || 'Threshold Check';

  return (
    <div
      className={`w-64 rounded-xl bg-slate-900 border text-slate-100 shadow-md transition-all ${
        selected
          ? 'border-amber-400 ring-2 ring-amber-500/40 shadow-amber-950/50'
          : 'border-slate-800 hover:border-slate-700'
      }`}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Top}
        id="in"
        isConnectable={isConnectable}
        className="!bg-amber-400 !w-3 !h-3 !border-2 !border-slate-950 hover:!scale-125 transition-transform"
      />

      {/* Node Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-slate-800 bg-slate-950/40 rounded-t-xl">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-amber-950 text-amber-400 border border-amber-800">
            <GitCompare className="w-3.5 h-3.5" />
          </div>
          <span className="text-[11px] font-semibold tracking-wider uppercase text-amber-400">
            Threshold Check
          </span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-amber-400/90 bg-amber-950/60 px-1.5 py-0.5 rounded font-mono border border-amber-800/60">
          <Sliders className="w-2.5 h-2.5" /> Condition
        </div>
      </div>

      {/* Node Body */}
      <div className="p-3 space-y-2">
        <div className="text-xs font-medium text-slate-200 truncate">{label}</div>

        <div className="bg-slate-950/80 rounded-lg p-2 border border-slate-800 space-y-1.5 font-mono text-[11px]">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-sans text-[11px]">Condition:</span>
            <span className="text-amber-300 font-semibold">
              {field} {operator} {value}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-sans text-[11px]">Target Value:</span>
            <span className="text-slate-300">{value}</span>
          </div>
        </div>
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="out"
        isConnectable={isConnectable}
        className="!bg-amber-400 !w-3 !h-3 !border-2 !border-slate-950 hover:!scale-125 transition-transform"
      />
    </div>
  );
};

export default memo(ThresholdNode);
