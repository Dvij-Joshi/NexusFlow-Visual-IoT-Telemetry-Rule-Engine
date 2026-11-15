const { Subject } = require('rxjs');
const { filter, map } = require('rxjs/operators');
const graphParser = require('./graphParser');
const alertService = require('../services/alertService');

class StreamCompiler {
  constructor() {
    // Stores active RxJS subjects and subscriptions per workflow ID
    this.activePipelines = new Map();
  }

  /**
   * Compiles and activates a visual workflow
   * @param {Object} workflow - Workflow document containing _id, name, nodes, edges
   */
  compileWorkflow(workflow) {
    const workflowId = workflow._id ? workflow._id.toString() : workflow.id || 'default';

    // Teardown existing pipeline if active
    this.stopWorkflow(workflowId);

    const parsed = graphParser.parse({
      nodes: workflow.nodes,
      edges: workflow.edges,
    });

    const ingress$ = new Subject();
    let currentStream$ = ingress$.asObservable();

    // Iterate through connected nodes and pipe RxJS operators
    // For demonstration and Week 2/3 roadmap: supports sensor -> movingAverage/transform -> threshold -> alert
    for (const node of parsed.nodes) {
      const type = node.type.toLowerCase();
      const config = node.data || {};

      if (type.includes('sensor')) {
        // Filter by deviceId or sensor type if configured
        if (config.deviceId) {
          currentStream$ = currentStream$.pipe(
            filter((data) => !config.deviceId || data.deviceId === config.deviceId)
          );
        }
      } else if (type.includes('threshold') || type.includes('condition')) {
        const field = config.field || 'temperature';
        const operator = config.operator || '>';
        const thresholdVal = Number(config.value ?? 80);

        currentStream$ = currentStream$.pipe(
          filter((data) => {
            const val = data[field];
            if (val === undefined || val === null) return false;
            switch (operator) {
              case '>':
                return val > thresholdVal;
              case '>=':
                return val >= thresholdVal;
              case '<':
                return val < thresholdVal;
              case '<=':
                return val <= thresholdVal;
              case '===':
              case '==':
                return val === thresholdVal;
              default:
                return val > thresholdVal;
            }
          })
        );
      } else if (type.includes('alert') || type.includes('action')) {
        // Output action when condition matches
        currentStream$ = currentStream$.pipe(
          map((data) => {
            alertService.triggerAlert({
              workflowId,
              deviceId: data.deviceId,
              message: config.label || `Threshold exceeded for ${data.deviceId}`,
              reading: data,
              threshold: config.value,
              severity: config.severity || 'WARNING',
            });
            return data;
          })
        );
      }
    }

    // Subscribe to execute the stream
    const subscription = currentStream$.subscribe({
      next: (val) => {
        // Pipeline processed item successfully
      },
      error: (err) => {
        console.error(`[StreamCompiler] Error in pipeline for workflow ${workflowId}:`, err);
      },
    });

    this.activePipelines.set(workflowId, {
      ingress$,
      subscription,
      workflow,
    });

    console.log(`[StreamCompiler] Workflow compiled and active: ${workflow.name || workflowId}`);
    return this.activePipelines.get(workflowId);
  }

  /**
   * Push incoming telemetry into all active compiled workflows
   * @param {Object} telemetryData
   */
  processTelemetry(telemetryData) {
    for (const [id, pipeline] of this.activePipelines.entries()) {
      try {
        pipeline.ingress$.next(telemetryData);
      } catch (err) {
        console.error(`[StreamCompiler] Failed to process telemetry for pipeline ${id}:`, err);
      }
    }
  }

  /**
   * Stop and cleanup an active workflow pipeline
   */
  stopWorkflow(workflowId) {
    if (this.activePipelines.has(workflowId)) {
      const pipeline = this.activePipelines.get(workflowId);
      pipeline.subscription.unsubscribe();
      pipeline.ingress$.complete();
      this.activePipelines.delete(workflowId);
      console.log(`[StreamCompiler] Workflow stopped: ${workflowId}`);
    }
  }
}

module.exports = new StreamCompiler();
