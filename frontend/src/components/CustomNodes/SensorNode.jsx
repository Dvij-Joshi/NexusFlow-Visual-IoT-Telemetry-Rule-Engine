import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Cpu, Wifi } from 'lucide-react';

const SensorNode = ({ data, selected, isConnectable }) => {
  const deviceId = data?.deviceId || 'TURBINE_01';
  const field = data?.field || data?.channel || 'temperature';
  const label = data?.label || 'Sensor Ingress';

  return (
    <div
      className={`w-72 rounded-xl bg-slate-900/95 backdrop-blur-md border border-t-2 text-slate-100 shadow-xl transition-all ${
        selected
          ? 'border-cyan-400 border-t-cyan-400 ring-2 ring-cyan-500/40 shadow-cyan-950/80'
          : 'border-slate-800/90 border-t-cyan-500 hover:border-slate-700'
      }`}
    >
      {/* Node Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-slate-800/80 bg-slate-950/60 rounded-t-xl">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-950/90 text-cyan-400 border border-cyan-800/80 shadow-sm shadow-cyan-950">
            <Cpu className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold tracking-wider uppercase text-cyan-400 font-mono">
                Sensor Ingress
              </span>
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-500"></span>
              </span>
            </div>
            <div className="text-xs font-semibold text-white truncate max-w-[150px]">
              {label}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-cyan-400/90 bg-cyan-950/80 px-2 py-0.5 rounded-full font-mono border border-cyan-800/80">
          <Wifi className="w-2.5 h-2.5" /> Source
        </div>
      </div>

      {/* Node Body */}
      <div className="p-3">
        <div className="bg-slate-950/90 rounded-lg p-2.5 border border-slate-800/80 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-[11px]">Device ID</span>
            <span className="font-mono text-white font-semibold tracking-tight truncate max-w-[140px]" title={deviceId}>
              {deviceId}
            </span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-slate-900">
            <span className="text-slate-400 text-[11px]">Telemetry Field</span>
            <span className="px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-800 text-cyan-300 font-mono font-medium text-[11px] capitalize">
              {field}
            </span>
          </div>
        </div>
      </div>

      {/* Output Handle Only (Ingress Source) */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="out"
        isConnectable={isConnectable}
        className="!bg-cyan-400 !w-3.5 !h-3.5 !border-2 !border-slate-950 hover:!scale-125 transition-transform shadow-md shadow-cyan-500/50"
      />
    </div>
  );
};

export default memo(SensorNode);
