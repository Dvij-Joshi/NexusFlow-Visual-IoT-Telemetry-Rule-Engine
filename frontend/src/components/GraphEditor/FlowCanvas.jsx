import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
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
import { createWorkflow, updateWorkflow, getWorkflows } from '../../services/api';

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
    loadWorkflow,
  } = useWorkflowState();

  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedWorkflows, setSavedWorkflows] = useState([]);

  // Fetch saved workflows from MongoDB
  const fetchSavedWorkflows = useCallback(() => {
    getWorkflows()
      .then((res) => {
        if (res.data && Array.isArray(res.data.data)) {
          setSavedWorkflows(res.data.data);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchSavedWorkflows();
  }, [fetchSavedWorkflows]);

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

  // Save workflow to backend (Create new or Update existing)
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

      let res;
      if (workflowId && workflowId !== 'workflow_001') {
        res = await updateWorkflow(workflowId, payload);
      } else {
        res = await createWorkflow(payload);
      }

      const savedId = res.data?.data?._id || workflowId;
      setWorkflowId(savedId);
      fetchSavedWorkflows();

      if (onNotify) {
        onNotify('success', `Workflow saved successfully! ID: ${savedId}`);
      }
    } catch (err) {
      console.error('Failed to save workflow:', err);
      const msg = err.response?.data?.message || err.response?.data?.error || err.message;
      if (onNotify) {
        onNotify('error', `Save failed: ${msg}`);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectSavedWorkflow = (selectedId) => {
    const targetWf = savedWorkflows.find((w) => w._id === selectedId);
    if (targetWf) {
      loadWorkflow(targetWf);
      if (onNotify) {
        onNotify('success', `Loaded workflow: "${targetWf.name}"`);
      }
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
        savedWorkflows={savedWorkflows}
        currentWorkflowId={workflowId}
        onSelectWorkflow={handleSelectSavedWorkflow}
      />

      {/* Main Workspace Area (Sidebar + Canvas + Config Panel) */}
      <div className="flex-1 min-h-0 flex relative overflow-hidden">
        {/* Left Node Selection Panel */}
        <NodeSidebar onAddNode={(type) => addNode(type)} />

        {/* Center React Flow Canvas */}
        <div ref={reactFlowWrapper} className="flex-1 min-h-0 relative h-full">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
            proOptions={{ hideAttribution: true }}
            className="bg-slate-950 h-full w-full"
            defaultEdgeOptions={{
              type: 'smoothstep',
              animated: true,
              style: { stroke: '#38bdf8', strokeWidth: 2 },
            }}
          >
            <Background gap={20} size={1} color="#1e293b" />
            <Controls
              className="!bg-slate-900 !border-slate-800 !shadow-xl !rounded-lg [&>button]:!bg-slate-900 [&>button]:!border-slate-800 [&>button]:!text-slate-300 [&>button:hover]:!bg-slate-800 [&>button:hover]:!text-white"
            />
            <MiniMap
              nodeColor={(node) => {
                switch (node.type) {
                  case 'sensor':
                    return '#06b6d4';
                  case 'movingAverage':
                  case 'transform':
                    return '#818cf8';
                  case 'threshold':
                    return '#f59e0b';
                  case 'alert':
                    return '#f43f5e';
                  default:
                    return '#64748b';
                }
              }}
              className="!bg-slate-900/90 !border-slate-800 !rounded-xl !shadow-2xl overflow-hidden"
              maskColor="rgba(2, 6, 23, 0.75)"
            />
          </ReactFlow>
        </div>

        {/* Right Properties Configuration Panel */}
        {selectedNode && (
          <NodeConfigPanel
            node={selectedNode}
            onUpdate={updateNodeData}
            onDelete={deleteNode}
            onClose={() => setSelectedNodeId(null)}
          />
        )}
      </div>

      {/* JSON Schema Export Modal */}
      <JsonExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        name={name}
        description={description}
        isActive={isActive}
        nodes={nodes}
        edges={edges}
        validation={validation}
      />
    </div>
  );
}

export default function FlowCanvas({ onNotify }) {
  return (
    <ReactFlowProvider>
      <FlowCanvasInner onNotify={onNotify} />
    </ReactFlowProvider>
  );
}
