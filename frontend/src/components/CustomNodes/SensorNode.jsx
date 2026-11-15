import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Cpu, Wifi } from 'lucide-react';

const SensorNode = ({ data, selected, isConnectable }) => {
  const deviceId = data?.deviceId || 'TURBINE_01';
  const field = data?.field || data?.channel || 'temperature';
  const label = data?.label || 'Sensor Ingress';

  return (
    <div
      className={`w-64 rounded-xl bg-slate-900 border text-slate-100 shadow-md transition-all ${
        selected
          ? 'border-cyan-400 ring-2 ring-cyan-500/40 shadow-cyan-950/50'
          : 'border-slate-800 hover:border-slate-700'
      }`}
    >
      {/* Node Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-slate-800 bg-slate-950/40 rounded-t-xl">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-cyan-950 text-cyan-400 border border-cyan-800">
            <Cpu className="w-3.5 h-3.5" />
          </div>
          <span className="text-[11px] font-semibold tracking-wider uppercase text-cyan-400">
            Sensor Node
          </span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-cyan-400/90 bg-cyan-950/60 px-1.5 py-0.5 rounded font-mono border border-cyan-800/60">
          <Wifi className="w-2.5 h-2.5" /> Source
        </div>
      </div>

      {/* Node Body */}
      <div className="p-3 space-y-2">
        <div className="text-xs font-medium text-slate-200 truncate">{label}</div>

        <div className="bg-slate-950/80 rounded-lg p-2 border border-slate-800 space-y-1.5 font-mono text-[11px]">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-sans text-[11px]">Device:</span>
            <span className="text-cyan-300 font-semibold truncate max-w-[120px]" title={deviceId}>
              {deviceId}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-sans text-[11px]">Field:</span>
            <span className="text-slate-200 capitalize">{field}</span>
          </div>
        </div>
      </div>

      {/* Output Handle Only (Ingress Source) */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="out"
        isConnectable={isConnectable}
        className="!bg-cyan-400 !w-3 !h-3 !border-2 !border-slate-950 hover:!scale-125 transition-transform"
      />
    </div>
  );
};

export default memo(SensorNode);
