# NexusFlow API Contract

Base URL: `http://localhost:5000/api`

All responses use the format:
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

Error responses:
```json
{
  "success": false,
  "error": "Error description"
}
```

---

## Health Check

### GET /api/health

```json
{
  "status": "online",
  "service": "NexusFlow Engine",
  "timestamp": "2026-11-15T10:00:00Z",
  "activeWorkflows": 1
}
```

---

## Device APIs

### POST /api/devices — Register Device

**Request:**
```json
{
  "deviceId": "TURBINE_01",
  "deviceName": "Main Turbine Temperature Sensor",
  "deviceType": "temperature",
  "location": "Factory Floor A",
  "unit": "°C"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Device registered successfully",
  "data": { "deviceId": "TURBINE_01", "status": "offline", ... }
}
```

**Errors:** 400 (missing fields), 409 (duplicate deviceId)

### GET /api/devices — List Devices

**Query params:** `?status=online&deviceType=temperature`

**Response (200):**
```json
{
  "success": true,
  "count": 5,
  "data": [{ "deviceId": "TURBINE_01", ... }]
}
```

### GET /api/devices/:deviceId

**Response (200):** `{ "success": true, "data": { ... } }`
**Errors:** 404

### PUT /api/devices/:deviceId — Update Device

**Request:** `{ "location": "New Location", "status": "maintenance" }`
**Response (200):** Updated device object
**Errors:** 404

### DELETE /api/devices/:deviceId

**Response (200):** `{ "success": true, "message": "Device deleted" }`
**Errors:** 404

---

## Telemetry APIs

### POST /api/telemetry — Ingest Single Reading
### POST /api/telemetry/ingest — (Alternate endpoint)

**Request:**
```json
{
  "deviceId": "TURBINE_01",
  "temperature": 85,
  "pressure": 120,
  "vibration": 12.5,
  "timestamp": "2026-11-15T10:00:00Z"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Telemetry ingested successfully",
  "data": { ... }
}
```

**Errors:** 400 (missing deviceId)

### POST /api/telemetry/batch — Batch Ingest

**Request:**
```json
{
  "batch": [
    { "deviceId": "TURBINE_01", "temperature": 78 },
    { "deviceId": "TURBINE_01", "temperature": 82 }
  ]
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Batch of 2 readings ingested successfully",
  "data": { "count": 2, "status": "success" }
}
```

### GET /api/telemetry — Recent Readings (All Devices)
### GET /api/telemetry/:deviceId — Recent Readings (Specific Device)

**Query params:** `?limit=50`

**Response (200):**
```json
{
  "success": true,
  "count": 50,
  "data": [{ "deviceId": "TURBINE_01", "temperature": 85, "timestamp": "..." }]
}
```

### GET /api/telemetry/:deviceId/latest — Latest Reading

**Response (200):** `{ "success": true, "data": { ... } }`
**Errors:** 404 (no data for device)

### GET /api/telemetry/:deviceId/history — Historical Data

**Query params:** `?start=2026-11-01&end=2026-11-15&limit=200&page=1`

**Response (200):**
```json
{
  "success": true,
  "count": 50,
  "total": 1234,
  "page": 1,
  "pages": 7,
  "data": [...]
}
```

### GET /api/telemetry/:deviceId/stats — Aggregation Statistics

**Query params:** `?start=2026-11-01&end=2026-11-15`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "TURBINE_01",
    "count": 500,
    "avgTemperature": 78.5,
    "minTemperature": 65,
    "maxTemperature": 92,
    "avgPressure": 118.2,
    "minPressure": 105,
    "maxPressure": 132,
    "firstReading": "2026-11-01T00:00:00Z",
    "lastReading": "2026-11-15T10:00:00Z"
  }
}
```

---

## Workflow APIs

### POST /api/workflows — Create Workflow

**Request:**
```json
{
  "name": "Turbine Monitor",
  "description": "Monitor turbine temperature",
  "isActive": true,
  "nodes": [
    { "id": "sensor-1", "type": "sensor", "position": { "x": 0, "y": 0 }, "data": { "deviceId": "TURBINE_01" } }
  ],
  "edges": []
}
```

**Response (201):** Created workflow with `_id`
**Errors:** 400 (missing name)

### GET /api/workflows — List All Workflows

**Response (200):** `{ "success": true, "count": N, "data": [...] }`

### GET /api/workflows/:id

**Response (200):** Single workflow
**Errors:** 404

### PUT /api/workflows/:id — Update Workflow

Automatically recompiles the RxJS pipeline if `isActive: true`.

**Request:** Same fields as create (partial update)
**Response (200):** Updated workflow
**Errors:** 404

### DELETE /api/workflows/:id

Stops the associated RxJS pipeline.

**Response (200):** `{ "success": true, "message": "Workflow deleted" }`
**Errors:** 404

---

## Alert APIs

### GET /api/alerts — List Alerts (Paginated)

**Query params:** `?deviceId=TURBINE_01&severity=high&status=unresolved&limit=50&page=1`

**Response (200):**
```json
{
  "success": true,
  "count": 10,
  "total": 42,
  "page": 1,
  "pages": 5,
  "data": [{ "alertId": "alert_...", "severity": "high", ... }]
}
```

### GET /api/alerts/:alertId

**Response (200):** Single alert
**Errors:** 404

### PATCH /api/alerts/:alertId/resolve — Mark Alert Resolved

**Response (200):**
```json
{
  "success": true,
  "message": "Alert resolved",
  "data": { "status": "resolved", "resolvedAt": "2026-11-15T12:00:00Z", ... }
}
```
**Errors:** 404
