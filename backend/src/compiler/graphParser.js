/**
 * GraphParser: Converts React Flow visual graphs into an ordered AST / pipeline structure
 */
class GraphParser {
  /**
   * Validate and parse a visual graph
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

    return {
      nodeMap,
      nodes: Array.from(nodeMap.values()),
      entryNodes,
      rawEdges: edges,
    };
  }
}

module.exports = new GraphParser();
