/**
 * GraphParser: Converts React Flow visual graphs into an ordered AST / pipeline structure
 */
class GraphParser {
  /**
   * Validate and parse a visual graph with topological ordering (Kahn's algorithm)
   * @param {Object} graph - Object containing nodes and edges
   */
  parse(graph) {
    const { nodes = [], edges = [] } = graph;

    if (!Array.isArray(nodes) || nodes.length === 0) {
      throw new Error('Invalid graph: At least one node is required');
    }

    const nodeMap = new Map();
    nodes.forEach((node) => {
      nodeMap.set(node.id, {
        id: node.id,
        type: node.type,
        data: node.data || {},
        incoming: [],
        outgoing: [],
      });
    });

    edges.forEach((edge) => {
      const sourceNode = nodeMap.get(edge.source);
      const targetNode = nodeMap.get(edge.target);

      if (sourceNode && targetNode) {
        sourceNode.outgoing.push({
          targetId: edge.target,
          sourceHandle: edge.sourceHandle,
          targetHandle: edge.targetHandle,
        });
        targetNode.incoming.push({
          sourceId: edge.source,
          sourceHandle: edge.sourceHandle,
          targetHandle: edge.targetHandle,
        });
      }
    });

    // Find entry nodes (typically sensor nodes or nodes with 0 incoming connections)
    const entryNodes = [];
    nodeMap.forEach((node) => {
      if (node.incoming.length === 0 || node.type === 'sensor' || node.type === 'sensorNode') {
        entryNodes.push(node);
      }
    });

    // Topological Sort (Kahn's Algorithm) to ensure pipeline execution follows edge flow
    const inDegree = new Map();
    nodeMap.forEach((node, id) => {
      inDegree.set(id, node.incoming.length);
    });

    const queue = [];
    // Prioritize sensor nodes at the front of the queue
    nodeMap.forEach((node, id) => {
      if (inDegree.get(id) === 0) {
        if (node.type === 'sensor' || node.type === 'sensorNode') {
          queue.unshift(node);
        } else {
          queue.push(node);
        }
      }
    });

    const sortedNodes = [];
    const visited = new Set();

    while (queue.length > 0) {
      const curr = queue.shift();
      if (visited.has(curr.id)) continue;
      visited.add(curr.id);
      sortedNodes.push(curr);

      for (const edge of curr.outgoing) {
        const nextId = edge.targetId;
        const currentDeg = inDegree.get(nextId) - 1;
        inDegree.set(nextId, currentDeg);
        if (currentDeg <= 0 && !visited.has(nextId)) {
          const nextNode = nodeMap.get(nextId);
          if (nextNode) queue.push(nextNode);
        }
      }
    }

    // Append any remaining nodes (e.g. disconnected nodes or cycle fallbacks)
    nodeMap.forEach((node) => {
      if (!visited.has(node.id)) {
        sortedNodes.push(node);
      }
    });

    return {
      nodeMap,
      nodes: sortedNodes,
      entryNodes,
      rawEdges: edges,
    };
  }
}

module.exports = new GraphParser();
