/**
 * Industrial IoT Predefined Workflow Templates
 * Standard pre-configured rule topologies for common industrial telemetry monitoring scenarios.
 */

export const WORKFLOW_TEMPLATES = [
  {
    id: 'turbine-thermal-guard',
    name: 'Turbine Thermal Safety Guard',
    description: 'Ingests turbine temperature, applies a 5-sample smoothing moving average, evaluates against an 80°C threshold, and triggers a high-severity alert.',
    nodes: [
      {
        id: 'sensor_turbine',
        type: 'sensor',
        position: { x: 100, y: 140 },
        data: {
          label: 'Turbine Temp Sensor',
          deviceId: 'TURBINE_01',
          field: 'temperature',
        },
      },
      {
        id: 'avg_turbine',
        type: 'movingAverage',
        position: { x: 420, y: 140 },
        data: {
          label: 'Thermal Moving Average',
          windowSize: 5,
          operation: 'SMA',
        },
      },
      {
        id: 'thresh_turbine',
        type: 'threshold',
        position: { x: 740, y: 140 },
        data: {
          label: 'Critical Temp Threshold',
          field: 'temperature',
          operator: '>',
          value: 80,
        },
      },
      {
        id: 'alert_turbine',
        type: 'alert',
        position: { x: 1060, y: 140 },
        data: {
          label: 'Thermal Emergency Alert',
          severity: 'High',
          message: 'EMERGENCY: Turbine 01 smoothed temperature exceeded critical safety limit (80°C)',
        },
      },
    ],
    edges: [
      {
        id: 'e_sensor_to_avg',
        source: 'sensor_turbine',
        target: 'avg_turbine',
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#38bdf8', strokeWidth: 2 },
      },
      {
        id: 'e_avg_to_thresh',
        source: 'avg_turbine',
        target: 'thresh_turbine',
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#818cf8', strokeWidth: 2 },
      },
      {
        id: 'e_thresh_to_alert',
        source: 'thresh_turbine',
        target: 'alert_turbine',
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#fbbf24', strokeWidth: 2 },
      },
    ],
  },
  {
    id: 'pump-vibration-monitor',
    name: 'Pump Vibration Anomaly Detector',
    description: 'Monitors pump velocity vibration with a 10-sample rolling average to filter mechanical transients and detect bearing wear above 4.5 mm/s.',
    nodes: [
      {
        id: 'sensor_pump',
        type: 'sensor',
        position: { x: 100, y: 140 },
        data: {
          label: 'Pump Vibration Ingress',
          deviceId: 'PUMP_01',
          field: 'vibration',
        },
      },
      {
        id: 'avg_pump',
        type: 'movingAverage',
        position: { x: 420, y: 140 },
        data: {
          label: 'Shock Filter Window',
          windowSize: 10,
          operation: 'SMA',
        },
      },
      {
        id: 'thresh_pump',
        type: 'threshold',
        position: { x: 740, y: 140 },
        data: {
          label: 'ISO 10816 Limit',
          field: 'vibration',
          operator: '>=',
          value: 4.5,
        },
      },
      {
        id: 'alert_pump',
        type: 'alert',
        position: { x: 1060, y: 140 },
        data: {
          label: 'Pump Bearing Alert',
          severity: 'Medium',
          message: 'WARNING: Pump 01 sustained vibration indicates potential bearing degradation (>= 4.5 mm/s)',
        },
      },
    ],
    edges: [
      {
        id: 'e_pump_sensor_to_avg',
        source: 'sensor_pump',
        target: 'avg_pump',
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#38bdf8', strokeWidth: 2 },
      },
      {
        id: 'e_pump_avg_to_thresh',
        source: 'avg_pump',
        target: 'thresh_pump',
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#818cf8', strokeWidth: 2 },
      },
      {
        id: 'e_pump_thresh_to_alert',
        source: 'thresh_pump',
        target: 'alert_pump',
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#fbbf24', strokeWidth: 2 },
      },
    ],
  },
  {
    id: 'compressor-pressure-guard',
    name: 'Compressor Pressure Surge Guard',
    description: 'Fast direct threshold evaluation for immediate pressure vessel surge protection without smoothing delay.',
    nodes: [
      {
        id: 'sensor_press',
        type: 'sensor',
        position: { x: 120, y: 160 },
        data: {
          label: 'Compressor Pressure Sensor',
          deviceId: 'COMPRESSOR_01',
          field: 'pressure',
        },
      },
      {
        id: 'thresh_press',
        type: 'threshold',
        position: { x: 500, y: 160 },
        data: {
          label: 'Pressure Overlimit Check',
          field: 'pressure',
          operator: '>',
          value: 95,
        },
      },
      {
        id: 'alert_press',
        type: 'alert',
        position: { x: 880, y: 160 },
        data: {
          label: 'Pressure Relief Emergency',
          severity: 'High',
          message: 'CRITICAL: Compressor pressure vessel exceeded 95 PSI maximum rating',
        },
      },
    ],
    edges: [
      {
        id: 'e_press_s_to_t',
        source: 'sensor_press',
        target: 'thresh_press',
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#38bdf8', strokeWidth: 2 },
      },
      {
        id: 'e_press_t_to_a',
        source: 'thresh_press',
        target: 'alert_press',
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#fbbf24', strokeWidth: 2 },
      },
    ],
  },
];

export function getWorkflowTemplateById(templateId) {
  return WORKFLOW_TEMPLATES.find((tpl) => tpl.id === templateId) || null;
}
