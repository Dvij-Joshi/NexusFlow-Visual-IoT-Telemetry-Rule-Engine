# NexusFlow Database Schema

## Overview

NexusFlow uses **MongoDB 5.0+** with **Mongoose 8.x**. Four primary collections store all platform data.

---

## 1. Devices Collection

Stores registered IoT devices.

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `deviceId` | String | ✅ | — | Unique device identifier (indexed, unique) |
| `deviceName` | String | ✅ | — | Human-readable name |
| `deviceType` | String (enum) | ✅ | `temperature` | `temperature`, `pressure`, `vibration`, `humidity`, `multi` |
| `location` | String | — | `''` | Physical or logical location |
| `unit` | String | — | `°C` | Measurement unit |
| `status` | String (enum) | — | `offline` | `online`, `offline`, `maintenance` |
| `lastSeen` | Date | — | `null` | Updated on each telemetry ingest |
| `createdAt` | Date | auto | — | Mongoose timestamps |
| `updatedAt` | Date | auto | — | Mongoose timestamps |

### Indexes

- `deviceId`: unique index
- `createdAt`: ascending (via timestamps)

### Example Document

```json
{
  "deviceId": "TURBINE_01",
  "deviceName": "Main Turbine Temperature Sensor",
  "deviceType": "temperature",
  "location": "Factory Floor A - Section 1",
  "unit": "°C",
  "status": "online",
  "lastSeen": "2026-11-15T10:30:00Z",
  "createdAt": "2026-11-15T08:00:00Z",
  "updatedAt": "2026-11-15T10:30:00Z"
}
```

---

## 2. Telemetry Collection (Time-Series)

Stores continuous timestamp-based sensor readings using **MongoDB Time-Series Collections**.

### Time-Series Configuration

```javascript
{
  timeseries: {
    timeField: 'timestamp',
    metaField: 'metadata',
    granularity: 'seconds'
  }
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `timestamp` | Date | ✅ | Reading timestamp (timeField) |
| `metadata.deviceId` | String | ✅ | Device identifier (metaField) |
| `metadata.sensorType` | String | — | Sensor type classification |
| `deviceId` | String | ✅ | Top-level device ID for queries (indexed) |
| `temperature` | Number | — | Temperature reading |
| `pressure` | Number | — | Pressure reading |
| `vibration` | Number | — | Vibration reading |
| `humidity` | Number | — | Humidity reading |
| `additionalData` | Mixed | — | Arbitrary extra sensor fields |

### Indexes

- `deviceId`: ascending
- Time-series internal indexes on `timestamp` and `metadata`

### Example Document

```json
{
  "timestamp": "2026-11-15T10:00:00Z",
  "metadata": {
    "deviceId": "TURBINE_01",
    "sensorType": "sensor"
  },
  "deviceId": "TURBINE_01",
  "temperature": 85,
  "pressure": 120,
  "vibration": 12.5
}
```

---

## 3. Workflows Collection

Stores user-created visual workflows from the React Flow editor.

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `name` | String | ✅ | — | Workflow name |
| `description` | String | — | `''` | Description |
| `isActive` | Boolean | — | `true` | Whether the RxJS pipeline is compiled |
| `nodes` | Array<Node> | — | `[]` | React Flow node definitions |
| `edges` | Array<Edge> | — | `[]` | React Flow edge connections |
| `createdAt` | Date | auto | — | Mongoose timestamps |
| `updatedAt` | Date | auto | — | Mongoose timestamps |

### Node Sub-Schema

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | String | ✅ | Unique node ID within the workflow |
| `type` | String | ✅ | `sensor`, `transform`, `threshold`, `alert` |
| `position` | `{x, y}` | — | Canvas coordinates |
| `data` | Mixed | — | Node-specific configuration |

### Edge Sub-Schema

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | String | — | Edge ID |
| `source` | String | ✅ | Source node ID |
| `target` | String | ✅ | Target node ID |
| `sourceHandle` | String | — | Source handle |
| `targetHandle` | String | — | Target handle |
| `animated` | Boolean | — | Edge animation flag |

### Example Document

```json
{
  "name": "Turbine Temperature Monitor",
  "description": "Alert when average temperature exceeds 80°C",
  "isActive": true,
  "nodes": [
    { "id": "sensor-1", "type": "sensor", "position": { "x": 250, "y": 0 }, "data": { "deviceId": "TURBINE_01" } },
    { "id": "threshold-1", "type": "threshold", "position": { "x": 250, "y": 150 }, "data": { "operator": ">", "value": 80 } },
    { "id": "alert-1", "type": "alert", "position": { "x": 250, "y": 300 }, "data": { "severity": "CRITICAL" } }
  ],
  "edges": [
    { "source": "sensor-1", "target": "threshold-1", "animated": true },
    { "source": "threshold-1", "target": "alert-1", "animated": true }
  ]
}
```

---

## 4. Alerts Collection

Stores alerts generated when workflow conditions are triggered.

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `alertId` | String | ✅ | — | Unique alert identifier (indexed, unique) |
| `workflowId` | String | — | `null` | Associated workflow (indexed) |
| `deviceId` | String | ✅ | — | Source device (indexed) |
| `alertType` | String | — | `threshold` | Alert classification |
| `message` | String | ✅ | — | Human-readable alert message |
| `triggerValue` | Number | — | `null` | Actual sensor value that triggered |
| `thresholdValue` | Number | — | `null` | Configured threshold |
| `severity` | String (enum) | — | `medium` | `low`, `medium`, `high`, `critical` (indexed) |
| `status` | String (enum) | — | `unresolved` | `unresolved`, `resolved` (indexed) |
| `resolvedAt` | Date | — | `null` | Resolution timestamp |
| `createdAt` | Date | auto | — | Mongoose timestamps |

### Indexes

- `alertId`: unique
- `deviceId`: ascending
- `workflowId`: ascending
- `severity`: ascending
- `status`: ascending
- Compound: `{ deviceId: 1, status: 1, createdAt: -1 }`

### Example Document

```json
{
  "alertId": "alert_1731667800000_abc1234",
  "workflowId": "WF001",
  "deviceId": "TURBINE_01",
  "alertType": "temperature_threshold",
  "message": "Turbine temperature exceeded 80°C",
  "triggerValue": 85,
  "thresholdValue": 80,
  "severity": "high",
  "status": "unresolved",
  "createdAt": "2026-11-15T10:30:00Z"
}
```

---

## Collection Relationships

```
Devices ─── 1:N ──→ Telemetry  (via deviceId)
Devices ─── 1:N ──→ Alerts     (via deviceId)
Workflows ─ 1:N ──→ Alerts     (via workflowId)
Workflows reference Devices in node.data.deviceId
```

These are logical relationships — MongoDB does not enforce foreign keys. The application layer validates device existence where needed.
