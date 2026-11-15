import React, { useMemo, useState, useCallback, useRef } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Controls,
  Background,
  MiniMap,
  useReactFlow,
} from '@xyflow/react';
import SensorNode from '../CustomNodes/SensorNode';
import MovingAverageNode from '../CustomNodes/MovingAverageNode';
import ThresholdNode from '../CustomNodes/ThresholdNode';
import AlertNode from '../CustomNodes/AlertNode';
import NodeSidebar from './NodeSidebar';
import NodeConfigPanel from './NodeConfigPanel';
import WorkflowToolbar from './WorkflowToolbar';
import JsonExportModal from './JsonExportModal';
import { useWorkflowState } from '../../hooks/useWorkflowState';
import { createWorkflow } from '../../services/api';

function FlowCanvasInner({ onNotify }) {
  const reactFlowWrapper = useRef(null);
  const { screenToFlowPosition } = useReactFlow();

  const {
    workflowId,
    setWorkflowId,
    name,
    setName,
    description,
    setDescription,
    isActive,
    nodes,
    edges,
    selectedNodeId,
    setSelectedNodeId,
    selectedEdgeId,
    setSelectedEdgeId,
    selectedNode,
    validation,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    updateNodeData,
    deleteNode,
    deleteEdge,
    deleteSelected,
    resetWorkflow,
  } = useWorkflowState();

  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Register custom node types with React Flow
  const nodeTypes = useMemo(
    () => ({
      sensor: SensorNode,
      movingAverage: MovingAverageNode,
      transform: MovingAverageNode, // backward compatibility with seeded workflows
      threshold: ThresholdNode,
      alert: AlertNode,
    }),
    []
  );

  // Drag and drop handlers
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      addNode(type, position);
    },
    [screenToFlowPosition, addNode]
  );

  // Selection handlers
  const onNodeClick = useCallback(
    (event, node) => {
      setSelectedNodeId(node.id);
      setSelectedEdgeId(null);
    },
    [setSelectedNodeId, setSelectedEdgeId]
  );

  const onEdgeClick = useCallback(
    (event, edge) => {
      setSelectedEdgeId(edge.id);
      setSelectedNodeId(null);
    },
    [setSelectedEdgeId, setSelectedNodeId]
  );

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
  }, [setSelectedNodeId, setSelectedEdgeId]);

  // Save workflow to backend
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        name,
        description,
        isActive,
        nodes,
        edges,
      };

      const res = await createWorkflow(payload);
      const createdId = res.data?.data?._id || res.data?.data?.workflowId || workflowId;
      setWorkflowId(createdId);

      if (onNotify) {
        onNotify('success', `Workflow saved successfully! ID: ${createdId}`);
      }
    } catch (err) {
      console.error('Failed to save workflow:', err);
      if (onNotify) {
        onNotify('error', `Save failed: ${err.response?.data?.message || err.message}`);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const hasSelection = Boolean(selectedNodeId || selectedEdgeId);

  return (
    <div className="flex-1 min-h-0 flex flex-col relative bg-slate-950 select-none">
      {/* Top Toolbar */}
      <WorkflowToolbar
        name={name}
        onNameChange={setName}
        nodeCount={nodes.length}
        edgeCount={edges.length}
        validation={validation}
        hasSelection={hasSelection}
        onDeleteSelected={deleteSelected}
        onReset={resetWorkflow}
        onExportJson={() => setIsExportOpen(true)}
        onSave={handleSave}
        isSaving={isSaving}
      />

      {/* Main Workspace Area (Sidebar + Canvas + Config Panel) */}
      <div className="flex-1 min-h-0 flex relative overflow-hidden">
        {/* Left Node Selection Panel */}
        <NodeSidebar onAddNode={(type) => addNode(type)} />

        {/* Center React Flow Canvas */}
        <div
          ref={reactFlowWrapper}
          className="flex-1 min-h-0 h-full w-full relative"
          style={{ height: 'calc(100vh - 7rem)' }}
          onDragOver={onDragOver}
          onDrop={onDrop}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            deleteKeyCode={['Backspace', 'Delete']}
            defaultViewport={{ x: 120, y: 40, zoom: 0.95 }}
            minZoom={0.25}
            maxZoom={2}
            fitView
            fitViewOptions={{ padding: 0.25, includeHiddenNodes: false }}
            defaultEdgeOptions={{
              type: 'smoothstep',
              animated: true,
              style: { strokeWidth: 2, stroke: '#38bdf8' },
            }}
            proOptions={{ hideAttribution: true }}
            style={{ width: '100%', height: '100%' }}
            className="bg-[#080c15]"
          >
            <Background color="#334155" gap={24} size={1.2} />
            <Controls className="!bg-slate-900 !border-slate-800 !text-slate-300 fill-slate-300" />
            <MiniMap
              nodeColor={(n) => {
                if (n.type === 'sensor') return '#06b6d4';
                if (n.type === 'movingAverage' || n.type === 'transform') return '#6366f1';
                if (n.type === 'threshold') return '#f59e0b';
                if (n.type === 'alert') return '#f43f5e';
                return '#475569';
              }}
              nodeStrokeColor="#0f172a"
              className="!bg-slate-900/90 !border-slate-800 rounded-lg overflow-hidden"
            />
          </ReactFlow>
        </div>

        {/* Right Node Configuration Panel */}
        {selectedNode && (
          <NodeConfigPanel
            node={selectedNode}
            onUpdate={updateNodeData}
            onDelete={deleteNode}
            onClose={() => setSelectedNodeId(null)}
          />
        )}
      </div>

      {/* JSON Export Modal */}
      <JsonExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        workflow={{
          workflowId,
          name,
          description,
          isActive,
          nodes,
          edges,
        }}
      />
    </div>
  );
}

export default function FlowCanvas(props) {
  return (
    <ReactFlowProvider>
      <FlowCanvasInner {...props} />
    </ReactFlowProvider>
  );
}
