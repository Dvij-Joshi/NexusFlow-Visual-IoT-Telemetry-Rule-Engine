# Graph Report - NexusFlow-Visual-IoT-Telemetry-Rule-Engine  (2026-11-16)

## Corpus Check
- 50 files · ~16,182 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: (none) 2, .example 1, .css 1)

## Summary
- 316 nodes · 488 edges · 15 communities (13 shown, 2 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 35 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a5c24616`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Frontend Dependencies
- React UI Components
- Backend Dependencies
- Workflow & Database Layer
- seed.js
- Stream Compiler & Graph Parser
- server.js
- Telemetry APIs
- NexusFlow Database Schema
- NexusFlow Database Setup Guide
- mockGenerator.js
- socketServer.js
- deviceRoutes.js

## God Nodes (most connected - your core abstractions)
1. `App()` - 15 edges
2. `react` - 13 edges
3. `lucide-react` - 12 edges
4. `NexusFlow Database Setup Guide` - 11 edges
5. `mongoose` - 9 edges
6. `Telemetry APIs` - 9 edges
7. `express` - 8 edges
8. `NexusFlow Database Schema` - 7 edges
9. `FlowCanvas()` - 7 edges
10. `@xyflow/react` - 7 edges

## Surprising Connections (you probably didn't know these)
- `FlowCanvas()` --indirect_call--> `AlertNode()`  [INFERRED]
  frontend/src/components/GraphEditor/FlowCanvas.jsx → frontend/src/components/CustomNodes/AlertNode.jsx
- `FlowCanvas()` --indirect_call--> `SensorNode()`  [INFERRED]
  frontend/src/components/GraphEditor/FlowCanvas.jsx → frontend/src/components/CustomNodes/SensorNode.jsx
- `FlowCanvas()` --indirect_call--> `ThresholdNode()`  [INFERRED]
  frontend/src/components/GraphEditor/FlowCanvas.jsx → frontend/src/components/CustomNodes/ThresholdNode.jsx
- `FlowCanvas()` --indirect_call--> `TransformNode()`  [INFERRED]
  frontend/src/components/GraphEditor/FlowCanvas.jsx → frontend/src/components/CustomNodes/TransformNode.jsx
- `App()` --calls--> `AlertsFeed()`  [EXTRACTED]
  frontend/src/App.jsx → frontend/src/components/Dashboard/AlertsFeed.jsx

## Import Cycles
- None detected.

## Communities (15 total, 2 thin omitted)

### Community 0 - "Frontend Dependencies"
Cohesion: 0.07
Nodes (38): dependencies, axios@^1.7.9, clsx@^2.1.1, lucide-react@^0.475.0, react@^18.3.1, react-dom@^18.3.1, recharts@^2.15.1, socket.io-client@^4.8.1 (+30 more)

### Community 1 - "React UI Components"
Cohesion: 0.07
Nodes (27): @xyflow/react@^12.4.2, App(), AlertNode(), SensorNode(), ThresholdNode(), TransformNode(), AlertsFeed(), DeviceBar() (+19 more)

### Community 2 - "Backend Dependencies"
Cohesion: 0.08
Nodes (29): author, dependencies, cors@^2.8.5, dotenv@^16.4.7, rxjs@^7.8.1, socket.io@^4.8.1, description, devDependencies (+21 more)

### Community 3 - "Workflow & Database Layer"
Cohesion: 0.19
Nodes (12): createWorkflow(), deleteWorkflow(), getAllWorkflows(), getWorkflowById(), updateWorkflow(), edgeSchema, mongoose, nodeSchema (+4 more)

### Community 4 - "seed.js"
Cohesion: 0.07
Nodes (31): express@^4.21.2, mongoose@^8.9.5, getAlertById(), getAlerts(), resolveAlert(), Alert, alertSchema, mongoose (+23 more)

### Community 5 - "Stream Compiler & Graph Parser"
Cohesion: 0.20
Nodes (4): GraphParser, { filter, map }, StreamCompiler, { Subject }

### Community 6 - "server.js"
Cohesion: 0.12
Nodes (18): connectDB(), mongoose, getLatestTelemetry(), getRecentTelemetry(), getTelemetryHistory(), getTelemetryStats(), ingestBatchTelemetry(), ingestTelemetry() (+10 more)

### Community 7 - "Telemetry APIs"
Cohesion: 0.07
Nodes (28): Alert APIs, DELETE /api/devices/:deviceId, DELETE /api/workflows/:id, Device APIs, GET /api/alerts/:alertId, GET /api/alerts — List Alerts (Paginated), GET /api/devices/:deviceId, GET /api/devices — List Devices (+20 more)

### Community 10 - "NexusFlow Database Schema"
Cohesion: 0.11
Nodes (17): 1. Devices Collection, 2. Telemetry Collection (Time-Series), 3. Workflows Collection, 4. Alerts Collection, Collection Relationships, Edge Sub-Schema, Example Document, Example Document (+9 more)

### Community 11 - "NexusFlow Database Setup Guide"
Cohesion: 0.13
Nodes (13): 1. MongoDB Setup, 2. Environment Configuration, 3. Install Dependencies, 4. Seed the Database, 5. Start the Server, 6. Mock Data Generator, 7. Run Tests, 8. Collections Overview (+5 more)

### Community 12 - "mockGenerator.js"
Cohesion: 0.24
Nodes (7): devices, dotenv, generateReading(), http, path, run(), sendReading()

### Community 13 - "socketServer.js"
Cohesion: 0.20
Nodes (5): AlertService, IngestionService, broadcastAlert(), broadcastTelemetry(), { Server }

### Community 14 - "deviceRoutes.js"
Cohesion: 0.36
Nodes (7): createDevice(), deleteDevice(), getAllDevices(), getDeviceById(), updateDevice(), express, router

## Knowledge Gaps
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dotenv` connect `Backend Dependencies` to `mockGenerator.js`, `seed.js`, `server.js`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `App()` (e.g. with `onAlert()` and `onConnect()`) actually correct?**
  _`App()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **Should `Frontend Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.06794871794871794 - nodes in this community are weakly interconnected._
- **Why does `express` connect `seed.js` to `Backend Dependencies`, `Workflow & Database Layer`, `deviceRoutes.js`, `server.js`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **Should `React UI Components` be split into smaller, more focused modules?**
  _Cohesion score 0.07078039927404718 - nodes in this community are weakly interconnected._
- **Why does `mongoose` connect `seed.js` to `Backend Dependencies`, `Workflow & Database Layer`, `server.js`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **Should `Backend Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.08275862068965517 - nodes in this community are weakly interconnected._