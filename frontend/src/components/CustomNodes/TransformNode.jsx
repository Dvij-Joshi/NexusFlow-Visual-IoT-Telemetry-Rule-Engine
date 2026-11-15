import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Activity } from 'lucide-react';

const TransformNode = ({ data, isConnectable }) => {
  return (
    <div className="bg-slate-900 border-2 border-indigo-500/80 rounded-xl p-3 shadow-lg shadow-indigo-950/40 min-w-[200px] text-white">
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Top}
        id="in"
        isConnectable={isConnectable}
        className="!bg-indigo-400 !w-3 !h-3"
      />

      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-800">
        <div className="p-1.5 bg-indigo-950/80 text-indigo-400 rounded-lg">
          <Activity className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-indigo-400">Transform</h4>
          <p className="text-sm font-medium">{data.label || 'Moving Average'}</p>
        </div>
      </div>

      <div className="space-y-1.5 text-xs text-slate-300">
        <div className="flex justify-between">
          <span className="text-slate-400">Operation:</span>
          <span className="text-indigo-300">{data.operation || 'SMA'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Window Size:</span>
          <span className="font-mono text-slate-200">{data.windowSize || 5} samples</span>
        </div>
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="out"
        isConnectable={isConnectable}
        className="!bg-indigo-400 !w-3 !h-3"
      />
    </div>
  );
};

export default memo(TransformNode);
