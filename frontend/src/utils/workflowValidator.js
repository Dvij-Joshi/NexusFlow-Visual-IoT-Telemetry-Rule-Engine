/**
 * Validation utilities for NexusFlow Visual IoT Workflows
 */

/**
 * Checks if a proposed edge connection is valid.
 * - Prevents self-connections (source === target)
 * - Prevents duplicate edges between the same source and target handles
 * - Prevents connecting to sensor inputs (sensors are ingress-only)
 *
 * @param {Object} connection - { source, target, sourceHandle, targetHandle }
 * @param {Array} nodes - Current list of nodes
 * @param {Array} edges - Current list of edges
 * @returns {boolean}
 */
export function isValidConnection(connection, nodes = [], edges = []) {
  if (!connection.source || !connection.target) return false;

  // 1. Prevent connecting a node to itself
  if (connection.source === connection.target) {
    return false;
  }

  // 2. Prevent duplicate connections
  const isDuplicate = edges.some(
    (edge) =>
      edge.source === connection.source &&
      edge.target === connection.target &&
      (edge.sourceHandle || null) === (connection.sourceHandle || null) &&
      (edge.targetHandle || null) === (connection.targetHandle || null)
  );
  if (isDuplicate) {
    return false;
  }

  // 3. Verify both nodes exist
  const sourceNode = nodes.find((n) => n.id === connection.source);
  const targetNode = nodes.find((n) => n.id === connection.target);
  if (!sourceNode || !targetNode) {
    return false;
  }

  // 4. Ingress sensor nodes cannot have incoming edges
  if (targetNode.type === 'sensor') {
    return false;
  }

  return true;
}

/**
 * Detects if a directed graph contains cycles (loops) using DFS 3-coloring.
 *
 * @param {Array} nodes - List of node objects
 * @param {Array} edges - List of edge objects
 * @returns {{ hasCycle: boolean, cycleNodes: string[] }}
 */
export function detectGraphCycles(nodes = [], edges = []) {
  const adj = new Map();
  nodes.forEach((n) => adj.set(n.id, []));
  edges.forEach((e) => {
    if (adj.has(e.source)) {
      adj.get(e.source).push(e.target);
    }
  });

  const state = new Map(); // 0: unvisited, 1: visiting, 2: visited
  nodes.forEach((n) => state.set(n.id, 0));

  const cycleNodes = [];

  function dfs(nodeId, path = []) {
    state.set(nodeId, 1);
    const neighbors = adj.get(nodeId) || [];

    for (const neighbor of neighbors) {
      const neighborState = state.get(neighbor);
      if (neighborState === 1) {
        cycleNodes.push(...path, nodeId, neighbor);
        return true;
      }
      if (neighborState === 0) {
        if (dfs(neighbor, [...path, nodeId])) {
          return true;
        }
      }
    }

    state.set(nodeId, 2);
    return false;
  }

  for (const node of nodes) {
    if (state.get(node.id) === 0) {
      if (dfs(node.id)) {
        return { hasCycle: true, cycleNodes };
      }
    }
  }

  return { hasCycle: false, cycleNodes: [] };
}

/**
 * Performs full validation of the current workflow graph.
 *
 * Checks:
 * - Unique node IDs
 * - Edge endpoints reference existing nodes
 * - No self-connections
 * - No directed cycles (DAG requirement)
 * - Presence of at least one ingress sensor node
 * - Validation of individual node configurations
 *
 * @param {Object} workflow - { nodes, edges, name, workflowId }
 * @returns {{ isValid: boolean, errors: string[], warnings: string[] }}
 */
export function validateWorkflow(workflow) {
  const nodes = workflow?.nodes || [];
  const edges = workflow?.edges || [];
  const errors = [];
  const warnings = [];

  if (nodes.length === 0) {
    errors.push('Workflow must contain at least one node.');
    return { isValid: false, errors, warnings };
  }

  // 1. Check for unique node IDs
  const idCounts = new Map();
  nodes.forEach((node) => {
    if (!node.id) {
      errors.push('Found a node without a valid ID.');
    } else {
      idCounts.set(node.id, (idCounts.get(node.id) || 0) + 1);
    }
  });

  idCounts.forEach((count, id) => {
    if (count > 1) {
      errors.push(`Duplicate node ID detected: "${id}". Each node must have a unique ID.`);
    }
  });

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  // 2. Check edges: endpoints must exist, cannot self-connect, cannot target sensors, and no duplicates
  const seenEdgeTuples = new Set();
  edges.forEach((edge, index) => {
    const edgeId = edge.id || `edge-${index}`;
    if (!edge.source || !edge.target) {
      errors.push(`Edge "${edgeId}" is missing source or target.`);
      return;
    }

    if (edge.source === edge.target) {
      errors.push(`Self-connection detected on node "${edge.source}".`);
    }

    const sourceHandle = edge.sourceHandle || null;
    const targetHandle = edge.targetHandle || null;
    const tupleKey = `${edge.source}__${sourceHandle}__${edge.target}__${targetHandle}`;
    if (seenEdgeTuples.has(tupleKey)) {
      errors.push(`Duplicate connection detected between "${edge.source}" and "${edge.target}".`);
    } else {
      seenEdgeTuples.add(tupleKey);
    }

    const sourceNode = nodeMap.get(edge.source);
    const targetNode = nodeMap.get(edge.target);

    if (!sourceNode) {
      errors.push(`Edge references non-existent source node "${edge.source}".`);
    }

    if (!targetNode) {
      errors.push(`Edge references non-existent target node "${edge.target}".`);
    } else if (targetNode.type === 'sensor') {
      errors.push(`Edge targets sensor node "${edge.target}". Sensor nodes are ingress-only sources and cannot have incoming connections.`);
    }
  });

  // 3. Check for directed cycles
  const cycleCheck = detectGraphCycles(nodes, edges);
  if (cycleCheck.hasCycle) {
    errors.push('Directed cycle detected in pipeline. Visual workflows must be an acyclic graph (DAG).');
  }

  // 4. Check for at least one sensor node
  const sensorNodes = nodes.filter((n) => n.type === 'sensor');
  if (sensorNodes.length === 0) {
    warnings.push('No Sensor node present. Pipeline requires a telemetry source to ingest data.');
  }

  // 5. Check for alerts
  const alertNodes = nodes.filter((n) => n.type === 'alert');
  if (alertNodes.length === 0) {
    warnings.push('No Alert node present. Pipeline will not trigger notifications.');
  }

  // 6. Check for disconnected nodes
  const connectedNodeIds = new Set();
  edges.forEach((e) => {
    connectedNodeIds.add(e.source);
    connectedNodeIds.add(e.target);
  });

  nodes.forEach((node) => {
    if (!connectedNodeIds.has(node.id) && nodes.length > 1) {
      warnings.push(`Node "${node.data?.label || node.id}" is not connected to any other node.`);
    }
  });

  // 7. Node-specific configuration checks
  nodes.forEach((node) => {
    const data = node.data || {};
    const label = data.label || node.id;

    if (node.type === 'sensor') {
      if (!data.deviceId) {
        warnings.push(`Sensor node "${label}" does not have a Device ID selected.`);
      }
      if (!data.field && !data.channel) {
        warnings.push(`Sensor node "${label}" does not have a telemetry field specified.`);
      }
    } else if (node.type === 'movingAverage' || node.type === 'transform') {
      const win = Number(data.windowSize);
      if (!Number.isFinite(win) || win < 1) {
        errors.push(`Moving Average node "${label}" must have a windowSize >= 1.`);
      }
    } else if (node.type === 'threshold') {
      if (data.value === undefined || data.value === null || data.value === '') {
        warnings.push(`Threshold node "${label}" threshold value is not set.`);
      }
    } else if (node.type === 'alert') {
      if (!data.message && !data.label) {
        warnings.push(`Alert node "${label}" has an empty alert message.`);
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
