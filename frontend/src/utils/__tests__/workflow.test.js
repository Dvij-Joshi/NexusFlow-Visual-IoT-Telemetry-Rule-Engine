import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  isValidConnection,
  validateWorkflow,
  detectGraphCycles,
} from '../workflowValidator.js';
import {
  serializeWorkflow,
  exportWorkflowToJsonString,
} from '../workflowSerializer.js';
import {
  WORKFLOW_TEMPLATES,
  getWorkflowTemplateById,
} from '../workflowTemplates.js';

describe('Workflow Connection & Validation Engine', () => {
  test('isValidConnection: rejects self-connection', () => {
    const nodes = [{ id: 'threshold_1', type: 'threshold' }];
    const edges = [];
    const connection = { source: 'threshold_1', target: 'threshold_1' };

    assert.equal(isValidConnection(connection, nodes, edges), false);
  });

  test('isValidConnection: rejects duplicate connection between same nodes and handles', () => {
    const nodes = [
      { id: 'sensor_1', type: 'sensor' },
      { id: 'avg_1', type: 'movingAverage' },
    ];
    const edges = [{ id: 'e1', source: 'sensor_1', target: 'avg_1', sourceHandle: 'out', targetHandle: 'in' }];
    const connection = { source: 'sensor_1', target: 'avg_1', sourceHandle: 'out', targetHandle: 'in' };

    assert.equal(isValidConnection(connection, nodes, edges), false);
  });

  test('isValidConnection: rejects connection targeting a sensor node (ingress only)', () => {
    const nodes = [
      { id: 'avg_1', type: 'movingAverage' },
      { id: 'sensor_1', type: 'sensor' },
    ];
    const edges = [];
    const connection = { source: 'avg_1', target: 'sensor_1' };

    assert.equal(isValidConnection(connection, nodes, edges), false);
  });

  test('isValidConnection: accepts valid forward edge', () => {
    const nodes = [
      { id: 'sensor_1', type: 'sensor' },
      { id: 'avg_1', type: 'movingAverage' },
    ];
    const edges = [];
    const connection = { source: 'sensor_1', target: 'avg_1', sourceHandle: 'out', targetHandle: 'in' };

    assert.equal(isValidConnection(connection, nodes, edges), true);
  });

  test('validateWorkflow: detects duplicate IDs and non-existent edge endpoints', () => {
    const invalidWorkflow = {
      workflowId: 'wf_test_1',
      name: 'Broken Graph',
      nodes: [
        { id: 'sensor_1', type: 'sensor', data: { deviceId: 'TURBINE_01', field: 'temperature' } },
        { id: 'sensor_1', type: 'sensor', data: { deviceId: 'TURBINE_02', field: 'pressure' } },
      ],
      edges: [
        { id: 'e_bad', source: 'sensor_1', target: 'unknown_target' },
      ],
    };

    const result = validateWorkflow(invalidWorkflow);
    assert.equal(result.isValid, false);
    assert.ok(result.errors.some((err) => err.includes('Duplicate node ID')));
    assert.ok(result.errors.some((err) => err.includes('non-existent target node')));
  });

  test('validateWorkflow: validates moving average windowSize requirement (>= 1)', () => {
    const wfInvalidWindow = {
      workflowId: 'wf_test_2',
      name: 'Window Test',
      nodes: [
        { id: 'sensor_1', type: 'sensor', data: { deviceId: 'TURBINE_01', field: 'temperature' } },
        { id: 'avg_1', type: 'movingAverage', data: { windowSize: 0 } },
      ],
      edges: [{ id: 'e1', source: 'sensor_1', target: 'avg_1' }],
    };

    const result = validateWorkflow(wfInvalidWindow);
    assert.equal(result.isValid, false);
    assert.ok(result.errors.some((err) => err.includes('windowSize >= 1')));
  });

  test('validateWorkflow: produces warning when sensor or alert nodes are missing', () => {
    const headlessWorkflow = {
      workflowId: 'wf_test_3',
      name: 'No Sensor or Alert',
      nodes: [
        { id: 'avg_1', type: 'movingAverage', data: { windowSize: 5 } },
        { id: 'thresh_1', type: 'threshold', data: { field: 'temperature', operator: '>', value: 70 } },
      ],
      edges: [{ id: 'e1', source: 'avg_1', target: 'thresh_1' }],
    };

    const result = validateWorkflow(headlessWorkflow);
    assert.ok(result.warnings.some((w) => w.includes('No Sensor node present')));
    assert.ok(result.warnings.some((w) => w.includes('No Alert node present')));
  });

  test('validateWorkflow: produces warning for disconnected nodes', () => {
    const wfWithOrphan = {
      workflowId: 'wf_test_4',
      name: 'Orphan Node Test',
      nodes: [
        { id: 'sensor_1', type: 'sensor', data: { deviceId: 'TURBINE_01', field: 'temperature' } },
        { id: 'alert_1', type: 'alert', data: { message: 'Alert', severity: 'High' } },
        { id: 'orphan_1', type: 'threshold', data: { field: 'pressure', operator: '<', value: 10 } },
      ],
      edges: [{ id: 'e1', source: 'sensor_1', target: 'alert_1' }],
    };

    const result = validateWorkflow(wfWithOrphan);
    assert.ok(result.warnings.some((w) => w.includes('orphan_1')));
  });
});

describe('Workflow JSON Serialization & Schema Compliance', () => {
  test('serializeWorkflow: correctly serializes all four node types', () => {
    const inputGraph = {
      workflowId: 'workflow_001',
      name: 'Temperature Monitoring',
      description: 'Production pipeline for turbine monitoring',
      nodes: [
        {
          id: 'sensor_1',
          type: 'sensor',
          position: { x: 250, y: 50 },
          data: {
            deviceId: 'TURBINE_01',
            field: 'temperature',
            label: 'Turbine Temp Sensor',
          },
        },
        {
          id: 'average_1',
          type: 'movingAverage',
          position: { x: 250, y: 200 },
          data: {
            windowSize: 5,
            operation: 'SMA',
            label: 'Window Smoother',
          },
        },
        {
          id: 'threshold_1',
          type: 'threshold',
          position: { x: 250, y: 350 },
          data: {
            field: 'temperature',
            operator: '>=',
            value: 80,
            label: 'Overheat Guard',
          },
        },
        {
          id: 'alert_1',
          type: 'alert',
          position: { x: 250, y: 500 },
          data: {
            message: 'Turbine temperature critical!',
            severity: 'High',
            label: 'Overheat Alarm',
          },
        },
      ],
      edges: [
        { id: 'e1', source: 'sensor_1', target: 'average_1', animated: true },
        { id: 'e2', source: 'average_1', target: 'threshold_1', animated: true },
        { id: 'e3', source: 'threshold_1', target: 'alert_1', animated: true },
      ],
    };

    const serialized = serializeWorkflow(inputGraph);

    // Top-level schema verification
    assert.equal(serialized.workflowId, 'workflow_001');
    assert.equal(serialized.name, 'Temperature Monitoring');
    assert.equal(serialized.nodes.length, 4);
    assert.equal(serialized.edges.length, 3);

    // Sensor node verification
    const sensor = serialized.nodes.find((n) => n.id === 'sensor_1');
    assert.deepEqual(sensor.data, {
      deviceId: 'TURBINE_01',
      field: 'temperature',
      label: 'Turbine Temp Sensor',
    });

    // Moving average node verification (default windowSize: 5)
    const avg = serialized.nodes.find((n) => n.id === 'average_1');
    assert.equal(avg.data.windowSize, 5);
    assert.equal(avg.data.operation, 'SMA');

    // Threshold check node verification
    const threshold = serialized.nodes.find((n) => n.id === 'threshold_1');
    assert.equal(threshold.data.operator, '>=');
    assert.equal(threshold.data.value, 80);
    assert.equal(threshold.data.field, 'temperature');

    // Alert node verification
    const alert = serialized.nodes.find((n) => n.id === 'alert_1');
    assert.equal(alert.data.message, 'Turbine temperature critical!');
    assert.equal(alert.data.severity, 'High');

    // Edges verification
    assert.equal(serialized.edges[0].source, 'sensor_1');
    assert.equal(serialized.edges[0].target, 'average_1');
    assert.equal(serialized.edges[1].source, 'average_1');
    assert.equal(serialized.edges[1].target, 'threshold_1');
    assert.equal(serialized.edges[2].source, 'threshold_1');
    assert.equal(serialized.edges[2].target, 'alert_1');

    // JSON String Export
    const jsonStr = exportWorkflowToJsonString(inputGraph, 2);
    const parsed = JSON.parse(jsonStr);
    assert.equal(parsed.workflowId, 'workflow_001');
    assert.equal(parsed.nodes[0].data.deviceId, 'TURBINE_01');
  });

  test('serializeWorkflow: normalizes legacy transform type to movingAverage data', () => {
    const legacyGraph = {
      workflowId: 'legacy_wf',
      name: 'Legacy Pipeline',
      nodes: [
        {
          id: 'trans_1',
          type: 'transform',
          position: { x: 0, y: 0 },
          data: { windowSize: '7', operation: 'SMA' },
        },
      ],
      edges: [],
    };

    const serialized = serializeWorkflow(legacyGraph);
    assert.equal(serialized.nodes[0].data.windowSize, 7);
  });

  test('validateWorkflow: rejects edges targeting sensor nodes', () => {
    const invalidTarget = {
      workflowId: 'wf_sensor_target',
      name: 'Invalid Sensor Target',
      nodes: [
        { id: 'thresh_1', type: 'threshold', data: { value: 50 } },
        { id: 'sensor_1', type: 'sensor', data: { deviceId: 'TURBINE_01' } },
      ],
      edges: [{ id: 'e_bad', source: 'thresh_1', target: 'sensor_1' }],
    };

    const result = validateWorkflow(invalidTarget);
    assert.equal(result.isValid, false);
    assert.ok(result.errors.some((err) => err.includes('cannot have incoming connections')));
  });

  test('validateWorkflow: rejects duplicate edge tuples even with different edge IDs', () => {
    const duplicateEdges = {
      workflowId: 'wf_dup_edges',
      name: 'Duplicate Edges',
      nodes: [
        { id: 'sensor_1', type: 'sensor', data: { deviceId: 'TURBINE_01' } },
        { id: 'avg_1', type: 'movingAverage', data: { windowSize: 5 } },
      ],
      edges: [
        { id: 'edge_id_1', source: 'sensor_1', target: 'avg_1' },
        { id: 'edge_id_2', source: 'sensor_1', target: 'avg_1' },
      ],
    };

    const result = validateWorkflow(duplicateEdges);
    assert.equal(result.isValid, false);
    assert.ok(result.errors.some((err) => err.includes('Duplicate connection detected')));
  });

  test('validateWorkflow: rejects non-finite window sizes (Infinity, NaN)', () => {
    const nonFinite = {
      workflowId: 'wf_inf',
      name: 'Infinity Window',
      nodes: [
        { id: 'sensor_1', type: 'sensor', data: { deviceId: 'TURBINE_01' } },
        { id: 'avg_1', type: 'movingAverage', data: { windowSize: Infinity } },
      ],
      edges: [{ id: 'e1', source: 'sensor_1', target: 'avg_1' }],
    };

    const result = validateWorkflow(nonFinite);
    assert.equal(result.isValid, false);
    assert.ok(result.errors.some((err) => err.includes('windowSize >= 1')));
  });
});

describe('Industrial Workflow Topologies & Cycle Detection', () => {
  test('detectGraphCycles: identifies circular loop (node_a -> node_b -> node_c -> node_a)', () => {
    const nodes = [
      { id: 'node_a', type: 'sensor' },
      { id: 'node_b', type: 'movingAverage' },
      { id: 'node_c', type: 'threshold' },
    ];
    const cyclicEdges = [
      { id: 'e1', source: 'node_a', target: 'node_b' },
      { id: 'e2', source: 'node_b', target: 'node_c' },
      { id: 'e3', source: 'node_c', target: 'node_a' },
    ];

    const result = detectGraphCycles(nodes, cyclicEdges);
    assert.equal(result.hasCycle, true);
    assert.ok(result.cycleNodes.length > 0);
  });

  test('validateWorkflow: rejects graph containing directed cycles', () => {
    const cyclicWorkflow = {
      workflowId: 'wf_cycle',
      name: 'Cyclic Workflow',
      nodes: [
        { id: 's1', type: 'sensor', data: { deviceId: 'TURBINE_01', field: 'temperature' } },
        { id: 'avg1', type: 'movingAverage', data: { windowSize: 5 } },
        { id: 't1', type: 'threshold', data: { value: 80 } },
      ],
      edges: [
        { id: 'e1', source: 's1', target: 'avg1' },
        { id: 'e2', source: 'avg1', target: 't1' },
        { id: 'e3', source: 't1', target: 'avg1' },
      ],
    };

    const res = validateWorkflow(cyclicWorkflow);
    assert.equal(res.isValid, false);
    assert.ok(res.errors.some((err) => err.includes('Directed cycle detected')));
  });

  test('WORKFLOW_TEMPLATES: all predefined templates are structurally valid and error-free', () => {
    assert.ok(WORKFLOW_TEMPLATES.length >= 3);
    for (const tpl of WORKFLOW_TEMPLATES) {
      const res = validateWorkflow(tpl);
      assert.equal(res.isValid, true, `Template "${tpl.name}" should be valid`);
      assert.equal(res.errors.length, 0, `Template "${tpl.name}" should have 0 errors`);
    }
  });

  test('validateWorkflow: supports multi-branch topologies (1 sensor branching to 2 parallel thresholds)', () => {
    const multiBranchWf = {
      workflowId: 'wf_branch',
      name: 'Multi Branch Pipeline',
      nodes: [
        { id: 'sensor_1', type: 'sensor', data: { deviceId: 'TURBINE_01', field: 'temperature' } },
        { id: 'thresh_hi', type: 'threshold', data: { field: 'temperature', operator: '>', value: 85 } },
        { id: 'thresh_lo', type: 'threshold', data: { field: 'temperature', operator: '<', value: 10 } },
        { id: 'alert_hi', type: 'alert', data: { message: 'High heat', severity: 'High' } },
        { id: 'alert_lo', type: 'alert', data: { message: 'Freezing hazard', severity: 'Medium' } },
      ],
      edges: [
        { id: 'e_split_1', source: 'sensor_1', target: 'thresh_hi' },
        { id: 'e_split_2', source: 'sensor_1', target: 'thresh_lo' },
        { id: 'e_out_1', source: 'thresh_hi', target: 'alert_hi' },
        { id: 'e_out_2', source: 'thresh_lo', target: 'alert_lo' },
      ],
    };

    const res = validateWorkflow(multiBranchWf);
    assert.equal(res.isValid, true);
    assert.equal(res.errors.length, 0);
  });
});
