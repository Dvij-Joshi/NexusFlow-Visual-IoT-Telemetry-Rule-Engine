import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { GitCompare } from 'lucide-react';

const ThresholdNode = ({ data, isConnectable }) => {
  return (
    <div className="bg-slate-900 border-2 border-amber-500/80 rounded-xl p-3 shadow-lg shadow-amber-950/40 min-w-[200px] text-white">
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Top}
        id="in"
        isConnectable={isConnectable}
        className="!bg-amber-400 !w-3 !h-3"
      />

      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-800">
        <div className="p-1.5 bg-amber-950/80 text-amber-400 rounded-lg">
          <GitCompare className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-400">Condition Check</h4>
          <p className="text-sm font-medium">{data.label || 'Threshold'}</p>
        </div>
      </div>

      <div className="space-y-1.5 text-xs text-slate-300">
        <div className="flex justify-between">
          <span className="text-slate-400">Rule:</span>
          <span className="font-mono text-amber-300">
            {data.field || 'temperature'} {data.operator || '>'} {data.value ?? 80}
          </span>
        </div>
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="out"
        isConnectable={isConnectable}
        className="!bg-amber-400 !w-3 !h-3"
      />
    </div>
  );
};

export default memo(ThresholdNode);
