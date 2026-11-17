# NexusFlow Visual Workflow Builder Specification (Developer 2)

## 1. Overview
The **Visual Workflow Builder** is the interactive graph orchestration surface of **NexusFlow**, enabling industrial operators and plant engineers to construct real-time stream processing pipelines visually. It bridges visual Directed Acyclic Graphs (DAGs) on the client with the backend RxJS Reactive Stream Rule Engine.

---

## 2. Supported Node Types & Data Contracts

### 2.1 Sensor Node (`type: 'sensor'`)
- **Category**: Ingress / Source
- **Input Handles**: None (Data Source)
- **Output Handles**: Single right output (`id: 'out'`)
- **Data Payload**:
  ```json
  {
    "label": "Turbine Temperature Sensor",
    "deviceId": "TURBINE_01",
    "field": "temperature"
  }
  ```
- **Semantics**: Binds to inbound telemetry emitted by the specified IoT device. Filters streams down to the target telemetry metric key.

### 2.2 Moving Average Node (`type: 'movingAverage'`)
- **Category**: Transform / Smoothing Filter
- **Input Handles**: Single left input (`id: 'in'`)
- **Output Handles**: Single right output (`id: 'out'`)
- **Data Payload**:
  ```json
  {
    "label": "Window Smoother",
    "windowSize": 5,
    "operation": "SMA"
  }
  ```
- **Semantics**: Maintains a rolling FIFO buffer of size `windowSize`. Computes the Simple Moving Average (SMA) over the incoming telemetry readings to eliminate transient spikes and signal jitter before rule evaluation.

### 2.3 Threshold Check Node (`type: 'thresholdCheck'` / `'threshold'`)
- **Category**: Condition / Filter
- **Input Handles**: Single left input (`id: 'in'`)
- **Output Handles**: Single right output (`id: 'out'`)
- **Data Payload**:
  ```json
  {
    "label": "Overheat Guard",
    "field": "temperature",
    "operator": ">",
    "thresholdValue": 80
  }
  ```
- **Semantics**: Compares the incoming numeric value against `thresholdValue` using the configured comparison operator (`>`, `<`, `>=`, `<=`, `==`). If true, passes the telemetry packet downstream; if false, drops it.

### 2.4 Alert Node (`type: 'alert'`)
- **Category**: Action / Sink
- **Input Handles**: Single left input (`id: 'in'`)
- **Output Handles**: None (Terminal Sink)
- **Data Payload**:
  ```json
  {
    "label": "Dispatch High Temp Alert",
    "message": "Turbine temperature exceeded critical limit (80°C)",
    "severity": "High"
  }
  ```
- **Semantics**: Persists an incident record to MongoDB (`Alert` collection) and broadcasts an instant alert payload across WebSocket subscribers.

---

## 3. Graph Validation Rules
The client validation engine (`workflowValidator.js`) enforces real-time topology constraints:

1. **Acyclic / Connection Safety**:
   - Self-connections (`source === target`) are forbidden.
   - Duplicate edges between the same source and target handles are rejected.
   - Sensor nodes cannot accept inbound connections (`target !== sensor`).
2. **Schema & Integrity**:
   - Every node must possess a unique non-empty `id`.
   - All edge endpoints (`source` and `target`) must reference existing graph nodes.
   - Moving average nodes must declare a positive integer `windowSize >= 1`.
   - Threshold nodes must declare valid numeric thresholds and supported comparison operators.
3. **Pipeline Completeness**:
   - Warns if the pipeline lacks an ingress `sensor` or terminal `alert` node.
   - Warns when isolated or disconnected nodes exist on the canvas.

---

## 4. JSON Serialization Format
Exported pipelines conform strictly to the backend schema:
```json
{
  "workflowId": "workflow_001",
  "name": "Turbine Thermal Safety Guard",
  "description": "Ingests turbine temperature, applies moving average smoothing, and triggers high severity alert.",
  "nodes": [
    {
      "id": "sensor_1",
      "type": "sensor",
      "position": { "x": 100, "y": 140 },
      "data": {
        "label": "Turbine Temp",
        "deviceId": "TURBINE_01",
        "field": "temperature"
      }
    },
    {
      "id": "moving_avg_1",
      "type": "movingAverage",
      "position": { "x": 420, "y": 140 },
      "data": {
        "label": "SMA Window",
        "windowSize": 5
      }
    },
    {
      "id": "threshold_1",
      "type": "thresholdCheck",
      "position": { "x": 740, "y": 140 },
      "data": {
        "label": "Overheat Check",
        "operator": ">",
        "thresholdValue": 80
      }
    },
    {
      "id": "alert_1",
      "type": "alert",
      "position": { "x": 1060, "y": 140 },
      "data": {
        "label": "Safety Alert",
        "message": "Turbine exceeded 80°C",
        "severity": "High"
      }
    }
  ],
  "edges": [
    { "id": "e1-2", "source": "sensor_1", "target": "moving_avg_1" },
    { "id": "e2-3", "source": "moving_avg_1", "target": "threshold_1" },
    { "id": "e3-4", "source": "threshold_1", "target": "alert_1" }
  ]
}
```
