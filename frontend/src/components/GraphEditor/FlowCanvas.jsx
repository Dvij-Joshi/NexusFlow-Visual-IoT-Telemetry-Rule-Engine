import React, { useState, useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from '@xyflow/react';
import { Play, Plus, Save, RotateCcw } from 'lucide-react';
import SensorNode from '../CustomNodes/SensorNode';
import TransformNode from '../CustomNodes/TransformNode';
import ThresholdNode from '../CustomNodes/ThresholdNode';
import AlertNode from '../CustomNodes/AlertNode';
import { createWorkflow } from '../../services/api';

const initialNodes = [
  {
    id: 'sensor-1',
    type: 'sensor',
    position: { x: 250, y: 50 },
    data: { label: 'Turbine Temperature Sensor', deviceId: 'TURBINE_01', channel: 'temperature' },
  },
  {
    id: 'transform-1',
    type: 'transform',
    position: { x: 250, y: 190 },
    data: { label: 'Rolling Moving Average', operation: 'SMA', windowSize: 5 },
  },
  {
    id: 'threshold-1',
    type: 'threshold',
    position: { x: 250, y: 330 },
    data: { label: 'Temperature Check', field: 'temperature', operator: '>', value: 80 },
  },
  {
    id: 'alert-1',
    type: 'alert',
    position: { x: 250, y: 470 },
    data: { label: 'Turbine Overheat Alert', channel: 'Dashboard + SMS', severity: 'CRITICAL' },
  },
];

const initialEdges = [
  { id: 'e1-2', source: 'sensor-1', target: 'transform-1', animated: true },
  { id: 'e2-3', source: 'transform-1', target: 'threshold-1', animated: true },
  { id: 'e3-4', source: 'threshold-1', target: 'alert-1', animated: true },
];

export default function FlowCanvas({ onNotify }) {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [workflowName, setWorkflowName] = useState('Turbine Anomaly Detector');
  const [isSaving, setIsSaving] = useState(false);

  const nodeTypes = useMemo(
    () => ({
      sensor: SensorNode,
      transform: TransformNode,
      threshold: ThresholdNode,
      alert: AlertNode,
    }),
    []
  );

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    []
  );

  const addNode = (type) => {
    const id = `${type}-${Date.now()}`;
    const position = {
      x: 150 + Math.random() * 200,
      y: 100 + Math.random() * 200,
    };

    let data = {};
    if (type === 'sensor') {
      data = { label: 'New Sensor', deviceId: 'TURBINE_02', channel: 'pressure' };
    } else if (type === 'transform') {
      data = { label: 'Moving Avg', operation: 'SMA', windowSize: 3 };
    } else if (type === 'threshold') {
      data = { label: 'Threshold Rule', field: 'pressure', operator: '>', value: 120 };
    } else if (type === 'alert') {
      data = { label: 'Trigger Alert', channel: 'WebSocket', severity: 'WARNING' };
    }

    setNodes((nds) => nds.concat({ id, type, position, data }));
  };

  const handleSaveAndCompile = async () => {
    setIsSaving(true);
    try {
      const payload = {
        name: workflowName,
        nodes,
        edges,
        isActive: true,
      };

      const res = await createWorkflow(payload);
      if (onNotify) {
        onNotify('success', `Pipeline compiled and activated! (ID: ${res.data.data._id})`);
      }
    } catch (err) {
      console.error('Error saving workflow:', err);
      if (onNotify) {
        onNotify('error', `Failed to compile: ${err.message}`);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  };

  return (
    <div className="h-full flex flex-col relative bg-slate-950">
      {/* Top Controls Bar */}
      <div className="h-14 border-b border-slate-800 bg-slate-900/80 backdrop-blur px-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white font-medium px-3 py-1.5 rounded-lg text-sm focus:outline-none focus:border-cyan-500"
            placeholder="Workflow Name"
          />
          <span className="text-xs text-slate-400">
            {nodes.length} nodes · {edges.length} connections
          </span>
        </div>

        {/* Node Library Quick Add Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => addNode('sensor')}
            className="px-2.5 py-1.5 bg-cyan-950 border border-cyan-800 text-cyan-300 text-xs font-medium rounded-lg hover:bg-cyan-900 transition flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Sensor
          </button>
          <button
            onClick={() => addNode('transform')}
            className="px-2.5 py-1.5 bg-indigo-950 border border-indigo-800 text-indigo-300 text-xs font-medium rounded-lg hover:bg-indigo-900 transition flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Transform
          </button>
          <button
            onClick={() => addNode('threshold')}
            className="px-2.5 py-1.5 bg-amber-950 border border-amber-800 text-amber-300 text-xs font-medium rounded-lg hover:bg-amber-900 transition flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Condition
          </button>
          <button
            onClick={() => addNode('alert')}
            className="px-2.5 py-1.5 bg-rose-950 border border-rose-800 text-rose-300 text-xs font-medium rounded-lg hover:bg-rose-900 transition flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Alert
          </button>

          <div className="h-5 w-px bg-slate-800 mx-1" />

          <button
            onClick={handleReset}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            title="Reset to Template"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={handleSaveAndCompile}
            disabled={isSaving}
            className="px-3.5 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs rounded-lg transition flex items-center gap-1.5 shadow-md shadow-cyan-500/20 disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            {isSaving ? 'Compiling...' : 'Save & Compile'}
          </button>
        </div>
      </div>

      {/* React Flow Canvas */}
      <div className="flex-1 w-full h-[calc(100vh-3.5rem-4rem)]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          className="bg-slate-950"
        >
          <Background color="#334155" gap={18} size={1} />
          <Controls className="!bg-slate-900 !border-slate-800 !text-white fill-white" />
          <MiniMap
            nodeColor={(n) => {
              if (n.type === 'sensor') return '#06b6d4';
              if (n.type === 'transform') return '#6366f1';
              if (n.type === 'threshold') return '#f59e0b';
              if (n.type === 'alert') return '#f43f5e';
              return '#64748b';
            }}
            className="!bg-slate-900/90 !border-slate-800 rounded-lg overflow-hidden"
          />
        </ReactFlow>
      </div>
    </div>
  );
}
