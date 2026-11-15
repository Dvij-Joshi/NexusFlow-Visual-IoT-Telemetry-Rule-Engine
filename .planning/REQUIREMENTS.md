# Project Requirements

## Functional Requirements
1. **Visual Workflow Builder:**
   - React Flow drag-and-drop workspace with support for adding, connecting, and deleting nodes.
   - Node categories: Sensor Source, Moving Average (SMA), Threshold Check, Action Trigger (Alert/Webhook).
   - Serialization to standard JSON format.
2. **Dynamic Stream Compiler:**
   - Interprets React Flow JSON graph without backend restarts.
   - Converts topological graph into RxJS Observable stream pipelines.
   - Applies reactive operators (`filter`, `map`, `scan`, `bufferTime`).
3. **High-Velocity Telemetry Ingestion:**
   - Express REST API supporting single and batch ingestion payloads.
   - Storage in MongoDB 5.0+ Time-Series collections (`timeField: 'timestamp'`, `metaField: 'metadata'`).
4. **Live Dashboard & Alert Feed:**
   - Real-time WebSocket subscriptions for incoming sensor data.
   - Instant visual alerts when threshold conditions evaluate to true.
   - Built-in telemetry simulator to test rules interactively.

## Non-Functional Requirements
- **High Concurrency:** Reactive stream processing with RxJS.
- **Low Latency:** Sub-second alert dispatch upon threshold violation.
- **Modularity:** Clear separation of concerns between compiler, ingestion, storage, and socket services.
