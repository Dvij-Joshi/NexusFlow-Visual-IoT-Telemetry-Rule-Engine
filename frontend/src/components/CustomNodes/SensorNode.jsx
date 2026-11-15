import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Cpu } from 'lucide-react';

const SensorNode = ({ data, isConnectable }) => {
  return (
    <div className="bg-slate-900 border-2 border-cyan-500/80 rounded-xl p-3 shadow-lg shadow-cyan-950/40 min-w-[200px] text-white">
      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-800">
        <div className="p-1.5 bg-cyan-950/80 text-cyan-400 rounded-lg">
          <Cpu className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-cyan-400">Telemetry Source</h4>
          <p className="text-sm font-medium">{data.label || 'Sensor Node'}</p>
        </div>
      </div>

      <div className="space-y-1.5 text-xs text-slate-300">
        <div className="flex justify-between">
          <span className="text-slate-400">Device ID:</span>
          <span className="font-mono text-cyan-300">{data.deviceId || 'TURBINE_01'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Channel:</span>
          <span className="text-slate-200 capitalize">{data.channel || 'temperature'}</span>
        </div>
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="out"
        isConnectable={isConnectable}
        className="!bg-cyan-400 !w-3 !h-3"
      />
    </div>
  );
};

export default memo(SensorNode);
