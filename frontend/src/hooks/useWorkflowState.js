import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { applyNodeChanges, applyEdgeChanges, addEdge } from '@xyflow/react';
import { isValidConnection, validateWorkflow } from '../utils/workflowValidator';

const STORAGE_KEY = 'nexusflow_active_workflow_state';

const INITIAL_NODES = [
  {
    id: 'sensor_1',
    type: 'sensor',
    position: { x: 260, y: 60 },
    data: {
      label: 'Main Turbine Sensor',
      deviceId: 'TURBINE_01',
      field: 'temperature',
    },
  },
  {
    id: 'moving_avg_1',
    type: 'movingAverage',
    position: { x: 260, y: 220 },
    data: {
      label: 'Window Smoother',
      windowSize: 5,
      operation: 'SMA',
    },
  },
  {
    id: 'threshold_1',
    type: 'threshold',
    position: { x: 260, y: 380 },
    data: {
      label: 'Overheat Guard',
      field: 'temperature',
      operator: '>',
      value: 80,
    },
  },
  {
    id: 'alert_1',
    type: 'alert',
    position: { x: 260, y: 540 },
    data: {
      label: 'Dispatch High Temp Alert',
      message: 'Turbine temperature exceeded critical limit (80°C)',
      severity: 'High',
    },
  },
];

const INITIAL_EDGES = [
  {
    id: 'e_sensor_to_avg',
    source: 'sensor_1',
    target: 'moving_avg_1',
    type: 'smoothstep',
    animated: true,
    style: { stroke: '#38bdf8', strokeWidth: 2 },
  },
  {
    id: 'e_avg_to_thresh',
    source: 'moving_avg_1',
    target: 'threshold_1',
    type: 'smoothstep',
    animated: true,
    style: { stroke: '#818cf8', strokeWidth: 2 },
  },
  {
    id: 'e_thresh_to_alert',
    source: 'threshold_1',
    target: 'alert_1',
    type: 'smoothstep',
    animated: true,
    style: { stroke: '#fbbf24', strokeWidth: 2 },
  },
];

let idCounter = 1;
function generateNodeId(type) {
  const prefixMap = {
    sensor: 'sensor',
    movingAverage: 'moving_avg',
    transform: 'moving_avg',
    threshold: 'threshold',
    alert: 'alert',
  };
  const prefix = prefixMap[type] || type;
  idCounter += 1;
  return `${prefix}_${Date.now().toString(36).slice(-4)}_${idCounter}`;
}

function getSavedLocalDraft() {
  try {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.nodes) && parsed.nodes.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('[WorkflowState] Failed to read from localStorage:', err);
  }
  return null;
}

export function useWorkflowState() {
  const localDraft = useMemo(() => getSavedLocalDraft(), []);

  const [workflowId, setWorkflowId] = useState(localDraft?.workflowId || null);
  const [name, setName] = useState(localDraft?.name || 'Turbine Temperature Monitoring');
  const [description, setDescription] = useState(
    localDraft?.description || 'Monitors turbine temperature with moving average and triggers alerts.'
  );
  const [isActive, setIsActive] = useState(
    typeof localDraft?.isActive === 'boolean' ? localDraft.isActive : true
  );
  const [nodes, setNodes] = useState(localDraft?.nodes || INITIAL_NODES);
  const [edges, setEdges] = useState(localDraft?.edges || INITIAL_EDGES);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState(null);
  const [isDirty, setIsDirty] = useState(false);

  // Sync to localStorage so tab switches or reloads never lose circuit progress
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const payload = {
          workflowId,
          name,
          description,
          isActive,
          nodes,
          edges,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      }
    } catch (err) {
      // Ignore quota errors
    }
  }, [workflowId, name, description, isActive, nodes, edges]);

  // Apply node changes (drag, select, dimension updates)
  const onNodesChange = useCallback((changes) => {
    setNodes((nds) => {
      const updated = applyNodeChanges(changes, nds);
      return updated;
    });

    const isContentChange = changes.some((c) => c.type === 'position' || c.type === 'remove' || c.type === 'add');
    if (isContentChange) {
      setIsDirty(true);
    }

    // Handle selection changes across full batch
    const selectChanges = changes.filter((c) => c.type === 'select');
    if (selectChanges.length > 0) {
      const selectedItem = [...selectChanges].reverse().find((c) => c.selected);
      if (selectedItem) {
        setSelectedNodeId(selectedItem.id);
        setSelectedEdgeId(null);
      } else {
        setSelectedNodeId((curr) => {
          const wasCurrentDeselected = selectChanges.some((c) => !c.selected && c.id === curr);
          return wasCurrentDeselected ? null : curr;
        });
      }
    }
  }, []);

  // Apply edge changes (selection, removal)
  const onEdgesChange = useCallback((changes) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));

    const isContentChange = changes.some((c) => c.type === 'remove' || c.type === 'add');
    if (isContentChange) {
      setIsDirty(true);
    }

    const selectChanges = changes.filter((c) => c.type === 'select');
    if (selectChanges.length > 0) {
      const selectedItem = [...selectChanges].reverse().find((c) => c.selected);
      if (selectedItem) {
        setSelectedEdgeId(selectedItem.id);
        setSelectedNodeId(null);
      } else {
        setSelectedEdgeId((curr) => {
          const wasCurrentDeselected = selectChanges.some((c) => !c.selected && c.id === curr);
          return wasCurrentDeselected ? null : curr;
        });
      }
    }
  }, []);

  // Connection handler with custom validator
  const onConnect = useCallback(
    (params) => {
      if (isValidConnection(params, nodes, edges)) {
        setEdges((eds) =>
          addEdge(
            {
              ...params,
              type: 'smoothstep',
              animated: true,
              style: { stroke: '#38bdf8', strokeWidth: 2 },
            },
            eds
          )
        );
        setIsDirty(true);
      }
    },
    [nodes, edges]
  );

  // Add a new node to the canvas
  const addNode = useCallback((type, customPosition = null) => {
    const id = generateNodeId(type);
    const position = customPosition || {
      x: 180 + Math.floor(Math.random() * 160),
      y: 120 + Math.floor(Math.random() * 160),
    };

    let defaultData = {};
    switch (type) {
      case 'sensor':
        defaultData = {
          label: 'New Sensor Ingress',
          deviceId: 'TURBINE_01',
          field: 'temperature',
        };
        break;
      case 'movingAverage':
      case 'transform':
        defaultData = {
          label: 'Rolling Moving Avg',
          windowSize: 5,
          operation: 'SMA',
        };
        break;
      case 'threshold':
        defaultData = {
          label: 'Threshold Check',
          field: 'temperature',
          operator: '>',
          value: 80,
        };
        break;
      case 'alert':
        defaultData = {
          label: 'Alert Trigger',
          message: 'Warning: telemetry value threshold exceeded',
          severity: 'High',
        };
        break;
      default:
        defaultData = { label: `${type} node` };
    }

    const newNode = {
      id,
      type: type === 'transform' ? 'movingAverage' : type,
      position,
      data: defaultData,
    };

    setNodes((nds) => [...nds, newNode]);
    setSelectedNodeId(id);
    setSelectedEdgeId(null);
    setIsDirty(true);
    return newNode;
  }, []);

  // Update data payload for a specific node
  const updateNodeData = useCallback((nodeId, partialData) => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === nodeId) {
          return {
            ...n,
            data: {
              ...n.data,
              ...partialData,
            },
          };
        }
        return n;
      })
    );
    setIsDirty(true);
  }, []);

  // Delete a specific node and its associated edges
  const deleteNode = useCallback((nodeId) => {
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    setSelectedNodeId((curr) => (curr === nodeId ? null : curr));
    setIsDirty(true);
  }, []);

  // Delete a specific edge
  const deleteEdge = useCallback((edgeId) => {
    setEdges((eds) => eds.filter((e) => e.id !== edgeId));
    setSelectedEdgeId((curr) => (curr === edgeId ? null : curr));
    setIsDirty(true);
  }, []);

  // Delete whatever element is currently selected
  const deleteSelected = useCallback(() => {
    if (selectedNodeId) {
      deleteNode(selectedNodeId);
    } else if (selectedEdgeId) {
      deleteEdge(selectedEdgeId);
    }
  }, [selectedNodeId, selectedEdgeId, deleteNode, deleteEdge]);

  // Reset to initial template
  const resetWorkflow = useCallback(() => {
    setWorkflowId(null);
    setName('Turbine Temperature Monitoring');
    setDescription('Monitors turbine temperature with moving average and triggers alerts.');
    setIsActive(true);
    setNodes(INITIAL_NODES);
    setEdges(INITIAL_EDGES);
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
    setIsDirty(true);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
  }, []);

  // Load a workflow structure
  const loadWorkflow = useCallback((workflowData) => {
    const id = workflowData._id || workflowData.workflowId;
    if (id) setWorkflowId(id);
    if (workflowData.name) setName(workflowData.name);
    if ('description' in workflowData && workflowData.description !== undefined) {
      setDescription(workflowData.description);
    }
    if (typeof workflowData.isActive === 'boolean') {
      setIsActive(workflowData.isActive);
    }
    if (Array.isArray(workflowData.nodes)) {
      setNodes(
        workflowData.nodes.map((n) => ({
          ...n,
          type: n.type === 'transform' ? 'movingAverage' : n.type,
        }))
      );
    }
    if (Array.isArray(workflowData.edges)) setEdges(workflowData.edges);
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
    setIsDirty(false);
  }, []);

  const markSaved = useCallback((savedId) => {
    if (savedId) setWorkflowId(savedId);
    setIsDirty(false);
  }, []);

  // Selected node object
  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedNodeId) || null,
    [nodes, selectedNodeId]
  );

  // Validation report
  const validation = useMemo(
    () => validateWorkflow({ workflowId, name, nodes, edges }),
    [workflowId, name, nodes, edges]
  );

  return {
    workflowId,
    setWorkflowId,
    name,
    setName,
    description,
    setDescription,
    isActive,
    setIsActive,
    nodes,
    edges,
    selectedNodeId,
    setSelectedNodeId,
    selectedEdgeId,
    setSelectedEdgeId,
    selectedNode,
    validation,
    isDirty,
    markSaved,
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
  };
}
