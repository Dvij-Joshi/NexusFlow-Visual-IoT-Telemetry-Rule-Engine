# Graph Report - NexusFlow-Visual-IoT-Telemetry-Rule-Engine  (2026-11-15)

## Corpus Check
- Corpus is ~8,712 words - fits in a single context window. You may not need a graph.

## Summary
- 178 nodes · 287 edges · 10 communities (8 shown, 2 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 24 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Frontend Dependencies
- React UI Components
- Backend Dependencies
- Workflow & Database Layer
- Telemetry Ingestion Pipeline
- Stream Compiler & Graph Parser
- Alert Service & WebSockets
- Socket.IO Client

## God Nodes (most connected - your core abstractions)
1. `react` - 12 edges
2. `App()` - 11 edges
3. `lucide-react` - 10 edges
4. `FlowCanvas()` - 8 edges
5. `@xyflow/react` - 7 edges
6. `express` - 5 edges
7. `mongoose` - 5 edges
8. `StreamCompiler` - 5 edges
9. `SimulatorPanel()` - 5 edges
10. `scripts` - 4 edges

## Surprising Connections (you probably didn't know these)
- `FlowCanvas()` --indirect_call--> `AlertNode()`  [INFERRED]
  frontend/src/components/GraphEditor/FlowCanvas.jsx → frontend/src/components/CustomNodes/AlertNode.jsx
- `FlowCanvas()` --indirect_call--> `SensorNode()`  [INFERRED]
  frontend/src/components/GraphEditor/FlowCanvas.jsx → frontend/src/components/CustomNodes/SensorNode.jsx
- `FlowCanvas()` --indirect_call--> `ThresholdNode()`  [INFERRED]
  frontend/src/components/GraphEditor/FlowCanvas.jsx → frontend/src/components/CustomNodes/ThresholdNode.jsx
- `FlowCanvas()` --indirect_call--> `TransformNode()`  [INFERRED]
  frontend/src/components/GraphEditor/FlowCanvas.jsx → frontend/src/components/CustomNodes/TransformNode.jsx
- `startServer()` --calls--> `connectDB()`  [EXTRACTED]
  backend/src/server.js → backend/src/config/database.js

## Import Cycles
- None detected.

## Communities (10 total, 2 thin omitted)

### Community 0 - "Frontend Dependencies"
Cohesion: 0.07
Nodes (37): dependencies, axios@^1.7.9, clsx@^2.1.1, lucide-react@^0.475.0, react@^18.3.1, react-dom@^18.3.1, recharts@^2.15.1, tailwind-merge@^3.0.1 (+29 more)

### Community 1 - "React UI Components"
Cohesion: 0.11
Nodes (19): App(), AlertNode(), SensorNode(), ThresholdNode(), TransformNode(), AlertsFeed(), LiveTelemetryChart(), SimulatorPanel() (+11 more)

### Community 2 - "Backend Dependencies"
Cohesion: 0.09
Nodes (27): author, dependencies, cors@^2.8.5, dotenv@^16.4.7, express@^4.21.2, mongoose@^8.9.5, rxjs@^7.8.1, socket.io@^4.8.1 (+19 more)

### Community 3 - "Workflow & Database Layer"
Cohesion: 0.11
Nodes (21): connectDB(), mongoose, createWorkflow(), deleteWorkflow(), getAllWorkflows(), getWorkflowById(), updateWorkflow(), edgeSchema (+13 more)

### Community 4 - "Telemetry Ingestion Pipeline"
Cohesion: 0.19
Nodes (10): getRecentTelemetry(), ingestBatchTelemetry(), ingestTelemetry(), mongoose, Telemetry, telemetrySchema, express, router (+2 more)

### Community 5 - "Stream Compiler & Graph Parser"
Cohesion: 0.20
Nodes (4): GraphParser, { filter, map }, StreamCompiler, { Subject }

### Community 6 - "Alert Service & WebSockets"
Cohesion: 0.31
Nodes (4): AlertService, broadcastAlert(), initSocketServer(), { Server }

### Community 7 - "Socket.IO Client"
Cohesion: 0.33
Nodes (3): socket.io-client@^4.8.1, socket, socket.io-client

## Knowledge Gaps
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `React UI Components` to `Frontend Dependencies`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `App()` (e.g. with `onAlert()` and `onConnect()`) actually correct?**
  _`App()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **Should `Frontend Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.06882591093117409 - nodes in this community are weakly interconnected._
- **Why does `lucide-react` connect `React UI Components` to `Frontend Dependencies`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **Should `React UI Components` be split into smaller, more focused modules?**
  _Cohesion score 0.10931174089068826 - nodes in this community are weakly interconnected._
- **Why does `express` connect `Backend Dependencies` to `Workflow & Database Layer`, `Telemetry Ingestion Pipeline`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **Should `Backend Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.08994708994708994 - nodes in this community are weakly interconnected._