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

    // Iterate through topologically sorted nodes and pipe RxJS operators
    // Supports sensor -> movingAverage/transform -> threshold -> alert
    for (const node of parsed.nodes) {
      const type = node.type.toLowerCase();
      const config = node.data || {};

      if (type.includes('sensor')) {
        // Filter by deviceId or sensor type if configured
        if (config.deviceId) {
          currentStream$ = currentStream$.pipe(
            filter((data) => {
              const devId = data.deviceId || (data.metadata && data.metadata.deviceId);
              return !config.deviceId || devId === config.deviceId;
            })
          );
        }
      } else if (
        type.includes('movingaverage') ||
        type.includes('moving_avg') ||
        type.includes('transform')
      ) {
        const windowSize = Math.max(1, Number(config.windowSize || 5));
        const field = config.field || 'temperature';
        // Maintain sliding window per device so multi-device telemetry does not cross-pollute
        const deviceWindows = new Map();

        currentStream$ = currentStream$.pipe(
          map((data) => {
            const plain = data && typeof data.toObject === 'function' ? data.toObject() : { ...data };
            const devId = plain.deviceId || (plain.metadata && plain.metadata.deviceId) || 'default';
            plain.deviceId = devId;

            if (typeof plain[field] === 'number') {
              if (!deviceWindows.has(devId)) {
                deviceWindows.set(devId, []);
              }
              const history = deviceWindows.get(devId);
              history.push(plain[field]);
              if (history.length > windowSize) {
                history.shift();
              }
              const sum = history.reduce((acc, val) => acc + val, 0);
              const avg = Math.round((sum / history.length) * 100) / 100;

              return {
                ...plain,
                deviceId: devId,
                [field]: avg,
                [`${field}_raw`]: plain[field],
                _windowSize: windowSize,
                _evaluatedField: field,
              };
            }
            return plain;
          })
        );
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
          }),
          map((data) => {
            const plain = data && typeof data.toObject === 'function' ? data.toObject() : { ...data };
            const devId = plain.deviceId || (plain.metadata && plain.metadata.deviceId) || 'UNKNOWN';
            return {
              ...plain,
              deviceId: devId,
              _thresholdBreached: thresholdVal,
              _thresholdField: field,
            };
          })
        );
      } else if (type.includes('alert') || type.includes('action')) {
        // Output action when condition matches
        currentStream$ = currentStream$.pipe(
          map((data) => {
            const devId = data.deviceId || (data.metadata && data.metadata.deviceId) || 'UNKNOWN';
            const field = data._thresholdField || data._evaluatedField || config.field || 'temperature';
            const triggerValue =
              typeof data[field] === 'number'
                ? data[field]
                : typeof data.temperature === 'number'
                ? data.temperature
                : null;
            const thresholdValue = data._thresholdBreached ?? Number(config.value || config.threshold || 80);

            alertService.triggerAlert({
              workflowId,
              deviceId: devId,
              message: config.message || config.label || `Threshold exceeded for ${devId}`,
              reading: data,
              triggerValue,
              thresholdValue,
              severity: config.severity || 'HIGH',
            });
            return data;
          })
        );
      }
    }

    // Subscribe to execute the stream
    const subscription = currentStream$.subscribe({
      next: (_val) => {
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
    const plain =
      telemetryData && typeof telemetryData.toObject === 'function'
        ? telemetryData.toObject()
        : { ...telemetryData };

    if (!plain.deviceId && plain.metadata && plain.metadata.deviceId) {
      plain.deviceId = plain.metadata.deviceId;
    }

    for (const [id, pipeline] of this.activePipelines.entries()) {
      try {
        pipeline.ingress$.next(plain);
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
