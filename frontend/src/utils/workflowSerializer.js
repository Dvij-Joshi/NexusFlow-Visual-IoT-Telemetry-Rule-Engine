/**
 * Serialization utilities for NexusFlow IoT workflows.
 * Formats the React Flow graph into the agreed JSON specification.
 */

/**
 * Serializes the current React Flow state into the canonical NexusFlow JSON schema.
 *
 * @param {Object} params
 * @param {string} params.workflowId - Unique identifier for the workflow
 * @param {string} params.name - Workflow name
 * @param {string} [params.description] - Optional workflow description
 * @param {Array} params.nodes - React Flow nodes
 * @param {Array} params.edges - React Flow edges
 * @param {boolean} [params.isActive=true] - Workflow active status
 * @returns {Object} Canonical workflow JSON representation
 */
export function serializeWorkflow({
  workflowId = 'workflow_001',
  name = 'Untitled Workflow',
  description = '',
  nodes = [],
  edges = [],
  isActive = true,
}) {
  const cleanNodes = nodes.map((node) => {
    // Extract domain data without internal React Flow metadata
    const rawData = node.data || {};
    const cleanData = {};

    if (node.type === 'sensor') {
      cleanData.deviceId = rawData.deviceId || 'TURBINE_01';
      cleanData.field = rawData.field || rawData.channel || 'temperature';
      if (rawData.label) cleanData.label = rawData.label;
    } else if (node.type === 'movingAverage' || node.type === 'transform') {
      cleanData.windowSize = Number(rawData.windowSize ?? 5);
      cleanData.operation = rawData.operation || 'SMA';
      if (rawData.label) cleanData.label = rawData.label;
    } else if (node.type === 'threshold') {
      cleanData.operator = rawData.operator || '>';
      cleanData.value = Number(rawData.value ?? 80);
      cleanData.field = rawData.field || 'temperature';
      if (rawData.label) cleanData.label = rawData.label;
    } else if (node.type === 'alert') {
      cleanData.message = rawData.message || rawData.label || 'Alert condition met';
      cleanData.severity = rawData.severity || 'High';
      if (rawData.channel) cleanData.channel = rawData.channel;
      if (rawData.label) cleanData.label = rawData.label;
    } else {
      // Fallback for any other node type
      Object.assign(cleanData, rawData);
    }

    return {
      id: node.id,
      type: node.type,
      position: {
        x: Math.round(node.position?.x ?? 0),
        y: Math.round(node.position?.y ?? 0),
      },
      data: cleanData,
    };
  });

  const cleanEdges = edges.map((edge, index) => {
    const formattedEdge = {
      id: edge.id || `e-${edge.source}-${edge.target}-${index}`,
      source: edge.source,
      target: edge.target,
    };

    if (edge.sourceHandle) formattedEdge.sourceHandle = edge.sourceHandle;
    if (edge.targetHandle) formattedEdge.targetHandle = edge.targetHandle;
    if (edge.animated !== undefined) formattedEdge.animated = Boolean(edge.animated);

    return formattedEdge;
  });

  return {
    workflowId,
    name,
    description,
    isActive,
    nodes: cleanNodes,
    edges: cleanEdges,
  };
}

/**
 * Returns formatted JSON string of the workflow.
 *
 * @param {Object} workflow
 * @param {number} [indent=2]
 * @returns {string}
 */
export function exportWorkflowToJsonString(workflow, indent = 2) {
  return JSON.stringify(serializeWorkflow(workflow), null, indent);
}

/**
 * Triggers a browser download of the serialized workflow JSON.
 *
 * @param {Object} workflow
 * @param {string} [filename]
 */
export function downloadWorkflowJson(workflow, filename) {
  const jsonString = exportWorkflowToJsonString(workflow, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  const safeName = (workflow.name || 'nexusflow-workflow')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_');

  link.href = url;
  link.download = filename || `${safeName}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
