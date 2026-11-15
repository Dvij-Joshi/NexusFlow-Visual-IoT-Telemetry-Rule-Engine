# Project Roadmap

### Week 1: Time-Series Setup & Canvas Scaffolding
- [x] Backend: Design MongoDB Time-Series collections schema for hardware telemetry
- [x] Backend: Build high-speed Express ingestion endpoints (`/api/telemetry`, `/api/telemetry/batch`)
- [x] Frontend: Initialize React app with Vite and Tailwind
- [x] Frontend: Integrate React Flow and scaffolding for drag-and-drop node canvas
- [x] Integration: Configure MongoDB Atlas environment and credentials

### Week 2: Logic Compiler & Node Library
- [x] Backend: Build Node.js graph parser that converts React Flow JSON graph into AST
- [x] Backend: RxJS Stream Compiler translating graph into active reactive streams
- [x] Frontend: Custom UI nodes for "Data Sources" (SensorNode), "Math Operations" (TransformNode), "Condition Checks" (ThresholdNode), and "Action Triggers" (AlertNode)

### Mid-Project Review Deliverables
- [ ] Ingestion Audit: Demonstrate MongoDB Time-Series collections handling high write volume with minimal footprint
- [x] Graph Serialization: Frontend serializes visual graphs into valid JSON for backend compilation

### Week 3: Live Rule Execution & Real-Time Dashboards
- [x] Backend: Connect incoming WebSocket telemetry to dynamically compiled RxJS pipelines
- [x] Backend: Evaluate threshold rules in memory and dispatch alert events
- [x] Frontend: Real-time Recharts visual components subscribed to WebSocket stream
- [x] Frontend: Mock telemetry generator panel for interactive testing

### Week 4: Webhooks, Alerting & Polish
- [x] Backend: Add outbound webhook integration and mock SMS dispatch in AlertService
- [ ] Frontend: Visual feedback on canvas (connection wires glowing when telemetry passes through)
- [ ] Production benchmarks and stress tests
