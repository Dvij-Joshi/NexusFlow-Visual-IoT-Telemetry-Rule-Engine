import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { BellRing } from 'lucide-react';

const AlertNode = ({ data, isConnectable }) => {
  return (
    <div className="bg-slate-900 border-2 border-rose-500/80 rounded-xl p-3 shadow-lg shadow-rose-950/40 min-w-[200px] text-white">
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Top}
        id="in"
        isConnectable={isConnectable}
        className="!bg-rose-400 !w-3 !h-3"
      />

      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-800">
        <div className="p-1.5 bg-rose-950/80 text-rose-400 rounded-lg">
          <BellRing className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-rose-400">Action Trigger</h4>
          <p className="text-sm font-medium">{data.label || 'Send Alert'}</p>
        </div>
      </div>

      <div className="space-y-1.5 text-xs text-slate-300">
        <div className="flex justify-between">
          <span className="text-slate-400">Target:</span>
          <span className="text-rose-300">{data.channel || 'WebSocket + Dashboard'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Severity:</span>
          <span className="text-rose-400 font-semibold">{data.severity || 'CRITICAL'}</span>
        </div>
      </div>
    </div>
  );
};

export default memo(AlertNode);
