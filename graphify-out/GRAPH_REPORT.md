# Graph Report - NexusFlow-Visual-IoT-Telemetry-Rule-Engine  (2026-11-16)

## Corpus Check
- 59 files · ~22,059 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: (none) 2, .example 1, .css 1)

## Summary
- 343 nodes · 553 edges · 14 communities (12 shown, 2 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 35 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f659956c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Frontend Dependencies
- React UI Components
- Backend Dependencies
- Workflow & Database Layer
- seed.js
- Stream Compiler & Graph Parser
- telemetryRoutes.js
- Telemetry APIs
- NexusFlow Database Schema
- NexusFlow Database Setup Guide
- useWorkflowState.js
- socketServer.js

## God Nodes (most connected - your core abstractions)
1. `react` - 18 edges
2. `lucide-react` - 15 edges
3. `App()` - 15 edges
4. `FlowCanvasInner()` - 12 edges
5. `NexusFlow Database Setup Guide` - 11 edges
6. `@xyflow/react` - 9 edges
7. `mongoose` - 9 edges
8. `Telemetry APIs` - 9 edges
9. `express` - 8 edges
10. `getDevices()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `FlowCanvasInner()` --indirect_call--> `AlertNode()`  [INFERRED]
  frontend/src/components/GraphEditor/FlowCanvas.jsx → frontend/src/components/CustomNodes/AlertNode.jsx
- `FlowCanvasInner()` --indirect_call--> `MovingAverageNode()`  [INFERRED]
  frontend/src/components/GraphEditor/FlowCanvas.jsx → frontend/src/components/CustomNodes/MovingAverageNode.jsx
- `FlowCanvasInner()` --indirect_call--> `SensorNode()`  [INFERRED]
  frontend/src/components/GraphEditor/FlowCanvas.jsx → frontend/src/components/CustomNodes/SensorNode.jsx
- `FlowCanvasInner()` --indirect_call--> `ThresholdNode()`  [INFERRED]
  frontend/src/components/GraphEditor/FlowCanvas.jsx → frontend/src/components/CustomNodes/ThresholdNode.jsx
- `App()` --calls--> `AlertsFeed()`  [EXTRACTED]
  frontend/src/App.jsx → frontend/src/components/Dashboard/AlertsFeed.jsx

## Import Cycles
- None detected.

## Communities (14 total, 2 thin omitted)

### Community 0 - "Frontend Dependencies"
Cohesion: 0.06
Nodes (40): dependencies, axios@^1.7.9, clsx@^2.1.1, lucide-react@^0.475.0, react@^18.3.1, react-dom@^18.3.1, recharts@^2.15.1, socket.io-client@^4.8.1 (+32 more)

### Community 1 - "React UI Components"
Cohesion: 0.06
Nodes (31): App(), AlertNode(), MovingAverageNode(), SensorNode(), ThresholdNode(), AlertsFeed(), DeviceBar(), LiveTelemetryChart() (+23 more)

### Community 2 - "Backend Dependencies"
Cohesion: 0.06
Nodes (35): author, dependencies, cors@^2.8.5, dotenv@^16.4.7, mongoose@^8.9.5, rxjs@^7.8.1, description, devDependencies (+27 more)

### Community 3 - "Workflow & Database Layer"
Cohesion: 0.19
Nodes (12): createWorkflow(), deleteWorkflow(), getAllWorkflows(), getWorkflowById(), updateWorkflow(), edgeSchema, mongoose, nodeSchema (+4 more)

### Community 4 - "seed.js"
Cohesion: 0.05
Nodes (45): express@^4.21.2, connectDB(), mongoose, getAlertById(), getAlerts(), resolveAlert(), createDevice(), deleteDevice() (+37 more)

### Community 5 - "Stream Compiler & Graph Parser"
Cohesion: 0.20
Nodes (4): GraphParser, { filter, map }, StreamCompiler, { Subject }

### Community 6 - "telemetryRoutes.js"
Cohesion: 0.23
Nodes (10): getLatestTelemetry(), getRecentTelemetry(), getTelemetryHistory(), getTelemetryStats(), ingestBatchTelemetry(), ingestTelemetry(), mongoose, Telemetry (+2 more)

### Community 7 - "Telemetry APIs"
Cohesion: 0.07
Nodes (28): Alert APIs, DELETE /api/devices/:deviceId, DELETE /api/workflows/:id, Device APIs, GET /api/alerts/:alertId, GET /api/alerts — List Alerts (Paginated), GET /api/devices/:deviceId, GET /api/devices — List Devices (+20 more)

### Community 10 - "NexusFlow Database Schema"
Cohesion: 0.11
Nodes (17): 1. Devices Collection, 2. Telemetry Collection (Time-Series), 3. Workflows Collection, 4. Alerts Collection, Collection Relationships, Edge Sub-Schema, Example Document, Example Document (+9 more)

### Community 11 - "NexusFlow Database Setup Guide"
Cohesion: 0.13
Nodes (13): 1. MongoDB Setup, 2. Environment Configuration, 3. Install Dependencies, 4. Seed the Database, 5. Start the Server, 6. Mock Data Generator, 7. Run Tests, 8. Collections Overview (+5 more)

### Community 12 - "useWorkflowState.js"
Cohesion: 0.23
Nodes (10): JsonExportModal(), generateNodeId(), INITIAL_EDGES, INITIAL_NODES, useWorkflowState(), downloadWorkflowJson(), exportWorkflowToJsonString(), serializeWorkflow() (+2 more)

### Community 13 - "socketServer.js"
Cohesion: 0.16
Nodes (7): socket.io@^4.8.1, AlertService, IngestionService, broadcastAlert(), broadcastTelemetry(), { Server }, socket.io

## Knowledge Gaps
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `React UI Components` to `Frontend Dependencies`, `useWorkflowState.js`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `App()` (e.g. with `onAlert()` and `onConnect()`) actually correct?**
  _`App()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **Should `Frontend Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.06387921022067364 - nodes in this community are weakly interconnected._
- **Why does `dotenv` connect `Backend Dependencies` to `seed.js`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `FlowCanvasInner()` (e.g. with `AlertNode()` and `MovingAverageNode()`) actually correct?**
  _`FlowCanvasInner()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **Should `React UI Components` be split into smaller, more focused modules?**
  _Cohesion score 0.0648018648018648 - nodes in this community are weakly interconnected._
- **Why does `express` connect `seed.js` to `Backend Dependencies`, `Workflow & Database Layer`, `telemetryRoutes.js`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._