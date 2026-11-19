# NexusFlow
### Visual IoT Telemetry & Rule Engine

**Build. Connect. Automate. Monitor.**

NexusFlow is a visual, node-based IoT telemetry processing and automation platform that enables factory managers and developers to build real-time monitoring workflows without writing complex business logic manually.

Using a drag-and-drop visual editor, users can connect sensor inputs, data transformation operations, conditional rules, and alert triggers to create dynamic automation pipelines. The backend compiles these visual workflows into executable RxJS streams, processes incoming telemetry data, and instantly responds to anomalies.

The goal is to make industrial IoT monitoring more flexible, accessible, and scalable.

---

## Table of Contents

- [Overview](#overview)
- [Problem Statement](#problem-statement)
- [Proposed Solution](#proposed-solution)
- [Key Features](#key-features)
- [How It Works](#how-it-works)
- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [Core Modules](#core-modules)
- [Example Workflow](#example-workflow)
- [Database Design](#database-design)
- [Development Roadmap](#development-roadmap)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Performance Goals](#performance-goals)
- [Future Scope](#future-scope)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

Industrial machines continuously generate telemetry data through IoT sensors.

Monitoring this data and responding to abnormal conditions often requires custom backend development. Even a small change in business logic, such as modifying a temperature threshold or adding a new condition, may require developer intervention.

NexusFlow addresses this limitation through a visual rule-building environment.

Users can:

- Create monitoring workflows using a drag-and-drop interface.
- Connect different IoT sensor inputs.
- Apply data transformations such as moving averages.
- Define conditional rules and thresholds.
- Configure automated alert triggers.
- Monitor incoming telemetry through real-time dashboards.
- Execute dynamically generated processing pipelines.

Instead of manually writing individual conditions for every machine, users can visually define their own monitoring logic.

## Problem Statement

Traditional IoT monitoring systems often rely on hardcoded business logic.

For example:

```javascript
if (temperature > 80) {
    sendAlert();
}
```

While this works for simple scenarios, it becomes difficult to maintain when industrial environments contain hundreds of machines, thousands of sensors, and continuously changing monitoring requirements.

Some major limitations include:

1. **Developer Dependency:** Changing monitoring conditions requires backend code modifications.
2. **Limited Flexibility:** Business users cannot independently create or modify automation rules.
3. **High Data Volume:** Continuous telemetry ingestion requires efficient data handling and processing.
4. **Complex Logic:** Combining multiple conditions and transformations becomes difficult to manage.
5. **Delayed Notifications:** Monitoring systems need real-time communication to identify anomalies quickly.

NexusFlow aims to solve these problems through visual workflow construction and dynamic stream execution.

---

## Proposed Solution

NexusFlow introduces a node-based visual programming interface.

Instead of writing code, users construct workflows by connecting predefined functional nodes.

A typical workflow might look like:

```text
     Temperature Sensor
             |
             v
      Moving Average
             |
             v
       Threshold Check
             |
             v
        Alert Trigger
             |
             v
       Notification
```

The frontend represents this workflow as a JSON graph.

The backend receives the graph, interprets its structure, and converts it into an executable RxJS processing pipeline.

As new telemetry data arrives, the pipeline evaluates the defined rules and triggers the appropriate actions.

This separates business logic from application code and makes monitoring workflows dynamically configurable.

---

## Key Features

### 1. Visual Workflow Builder

A node-based editor built using React Flow.

- Drag-and-drop node creation.
- Visual connections between processing nodes.
- Custom node types.
- Configurable node properties.
- Dynamic workflow construction.
- JSON-based graph serialization.

### 2. Dynamic Stream Compiler

A backend engine responsible for converting visual workflows into executable processing pipelines.

- Parses frontend-generated JSON graphs.
- Identifies node types and connections.
- Resolves node dependencies.
- Converts graph structures into RxJS streams.
- Executes dynamically configured processing logic.

### 3. Time-Series Data Storage

Uses MongoDB Time Series Collections to manage continuous IoT telemetry.

- Timestamp-based data storage.
- Device-specific telemetry records.
- Efficient handling of sensor readings.
- Support for high-volume ingestion workloads.

### 4. Real-Time Telemetry Processing

Processes incoming sensor readings through dynamically generated pipelines.

- Continuous data processing.
- Moving average calculations.
- Threshold evaluation.
- Conditional rule execution.
- Anomaly detection.

### 5. Real-Time Dashboard

Provides live monitoring of telemetry data and system activity.

- Live sensor readings.
- Real-time data visualization.
- Rule execution feedback.
- Anomaly notifications.
- WebSocket-based updates.

### 6. Webhooks & Alerting

Supports automated actions when defined conditions are satisfied.

- Outbound webhook integration.
- External API triggers.
- Mock SMS notification integration.
- Configurable alert conditions.

---

## How It Works

NexusFlow follows a workflow-driven processing architecture.

**Step 1: Workflow Creation**

The user opens the visual editor and creates a workflow by connecting sensor nodes, transformation nodes, condition nodes, and action nodes.

**Step 2: Graph Serialization**

The frontend converts the visual workflow into a structured JSON representation.

**Step 3: Graph Compilation**

The backend receives the JSON graph and interprets its nodes and connections.

The Stream Compiler converts the graph into executable RxJS operators and processing streams.

**Step 4: Telemetry Ingestion**

IoT devices continuously send telemetry data to the backend through ingestion APIs.

**Step 5: Stream Execution**

Incoming telemetry is passed through the compiled processing pipeline.

Each node performs its assigned operation.

**Step 6: Rule Evaluation**

The system evaluates conditions defined by the user.

If a condition is satisfied, the corresponding action is executed.

**Step 7: Real-Time Notification**

WebSockets communicate telemetry updates and generated alerts to connected dashboard clients.

---

## System Architecture

The proposed architecture consists of four major layers.

```text
              ┌──────────────────────────┐
              │       React Frontend     │
              │                          │
              │   Visual Workflow Editor │
              │       (React Flow)       │
              │                          │
              │   Live Monitoring UI     │
              └────────────┬─────────────┘
                           │
                     JSON Graph
                           │
                           v
              ┌──────────────────────────┐
              │      Node.js Backend     │
              │                          │
              │     Express APIs         │
              │                          │
              │     Stream Compiler      │
              │        (RxJS)            │
              │                          │
              │     Rule Execution       │
              └────────────┬─────────────┘
                           │
              ┌────────────┴────────────┐
              │                         │
              v                         v
    ┌───────────────────┐    ┌───────────────────┐
    │  MongoDB          │    │   WebSockets      │
    │                   │    │                   │
    │  Time-Series Data │    │  Live Updates     │
    │  Device Telemetry │    │  Alerts           │
    └───────────────────┘    └───────────────────┘
```

### Data Flow

```text
IoT Devices
     |
     v
Ingestion API
     |
     v
MongoDB Time-Series
     |
     v
Telemetry Processing
     |
     v
Compiled RxJS Pipeline
     |
     v
Rule Evaluation
     |
     v
Alert / Webhook
     |
     v
Real-Time Dashboard
```

The visual workflow configuration is separately transmitted from the frontend to the backend and compiled into the processing pipeline.

---

## Technology Stack

| Technology | Purpose |
|---|---|
| React.js | Frontend development |
| React Flow | Visual node-based workflow editor |
| Node.js | Backend runtime |
| Express.js | REST API development |
| MongoDB 5.0+ | Time-series telemetry storage |
| Mongoose | MongoDB object modeling |
| RxJS | Reactive stream processing |
| WebSockets | Real-time communication |
| JavaScript | Application development |

### Why These Technologies?

**React Flow:** Provides the foundation for building interactive node-based editors.

**Node.js:** Handles asynchronous operations and incoming telemetry requests.

**MongoDB Time Series:** Designed for storing timestamp-based sensor readings.

**RxJS:** Provides operators for transforming, combining, and processing continuous data streams.

**WebSockets:** Enables real-time communication between the backend and frontend without repeatedly polling the server.

---

## Core Modules

### Module 1: Visual Graph Builder (Phase 1 Implemented)

**Technology:** React 19 + @xyflow/react (React Flow) + Tailwind CSS + Lucide Icons

The graph builder provides an interactive visual workflow surface where industrial operators and developers design real-time telemetry processing circuits with drag-and-drop ergonomics.

#### Implemented Custom Nodes:

| Node Type | Category | Handles | Functionality |
|---|---|---|---|
| **Sensor Node** | Ingress Source | 1 Right Output | Selects target device (`TURBINE_01`, `PUMP_01`, etc.) and telemetry channel (`temperature`, `pressure`, `vibration`). Ingress-only. |
| **Moving Average** | Transform | 1 Left In, 1 Right Out | Rolling FIFO buffer window (`windowSize`, default: 5). Computes Simple Moving Average (SMA) to eliminate transient noise. |
| **Threshold Check** | Condition | 1 Left In, 1 Right Out | Conditional evaluator (`>`, `<`, `>=`, `<=`, `==`) with configurable numeric limits. Drops non-matching telemetry. |
| **Alert Node** | Action Sink | 1 Left In | Configurable alert payload message and severity level (`Low`, `Medium`, `High`). Triggers DB persistence and WebSocket broadcast. |

#### Key Workflow Capabilities:
- **Predefined Industrial Templates:** One-click loading of verified industrial circuit topologies:
  - *Turbine Thermal Safety Guard*
  - *Pump Vibration Anomaly Detector (ISO 10816)*
  - *Compressor Pressure Surge Guard*
- **Acyclic Graph (DAG) & Cycle Detection:** Real-time DFS 3-color cycle detection prevents infinite loops or recursion in stream pipelines.
- **Canvas Keyboard Shortcuts:**
  - `Del` / `Backspace` : Delete selected node or edge
  - `Ctrl + D` : Duplicate and clone selected node
  - `Esc` : Clear canvas selection
  - `Shift + Drag` : Multi-node selection marquee
- **Dual-Mode Live Sync:** Visual changes auto-save locally to `localStorage` and deploy live into MongoDB Atlas and the RxJS Stream Engine with one click.
- **Canonical Schema Export:** JSON export modal with one-click clipboard copying and schema validation reporting.

### Module 2: Time-Series Database

**Technology:** MongoDB 5.0+

IoT devices generate continuous streams of timestamped information.

MongoDB Time Series Collections are used to store this information efficiently.

Example telemetry document:

```json
{
  "deviceId": "TURBINE_01",
  "timestamp": "2026-11-15T10:00:00Z",
  "temperature": 85,
  "pressure": 120,
  "vibration": 12.5
}
```

This structure allows the system to organize sensor readings by device and timestamp.

### Module 3: Stream Compiler

**Technology:** Node.js + RxJS

This is the central processing component of NexusFlow.

The Stream Compiler converts the visual workflow into executable reactive streams.

For example, the frontend may generate a graph representing:

```text
Sensor → Moving Average → Threshold → Alert
```

The backend interprets the graph and builds the corresponding processing pipeline.

Conceptually:

```javascript
telemetryStream
    .pipe(
        movingAverage(),
        filter(value => value > 80)
    )
    .subscribe(value => {
        triggerAlert(value);
    });
```

The above illustrates the intended processing logic. The actual compiler will generate its pipeline dynamically based on the submitted graph.

### Module 4: Ingestion API

**Technology:** Express.js + WebSockets

This module manages communication between IoT devices, the backend, and connected clients.

Responsibilities include:

- Receiving telemetry data.
- Validating incoming readings.
- Storing telemetry in MongoDB.
- Passing readings into active processing pipelines.
- Broadcasting real-time updates.
- Delivering generated alerts to connected clients.

---

## Example Workflow

### Scenario: Industrial Turbine Temperature Monitoring

Consider a factory that needs to monitor turbine temperatures.

The manager wants to receive an alert whenever the average temperature exceeds 80°C.

Using NexusFlow, the manager creates the following workflow:

```text
┌─────────────────────┐
│  Temperature Sensor │
└──────────┬──────────┘
           |
           v
┌─────────────────────┐
│   Moving Average    │
└──────────┬──────────┘
           |
           v
┌─────────────────────┐
│  Temperature > 80°C │
└──────────┬──────────┘
           |
           v
┌─────────────────────┐
│    Alert Trigger    │
└─────────────────────┘
```

### Sample Input

| Reading | Temperature |
|---|---:|
| 1 | 75°C |
| 2 | 78°C |
| 3 | 82°C |
| 4 | 85°C |
| 5 | 88°C |

The moving average node calculates the average based on its configured window.

The threshold node evaluates the resulting value.

If the condition is satisfied, the alert node executes.

The manager receives the notification through the live dashboard.

**Important:** The moving-average window and threshold are configurable workflow parameters. The example readings above illustrate the concept rather than a fixed implementation.

---

## Database Design

The primary database is MongoDB.

The initial data model is expected to include the following collections:

### 1. Telemetry Collection

Stores incoming sensor readings.

```json
{
  "deviceId": "TURBINE_01",
  "timestamp": "2026-11-15T10:00:00Z",
  "temperature": 85,
  "pressure": 120,
  "vibration": 12.5
}
```

### 2. Workflows Collection

Stores user-created visual workflows.

```json
{
  "name": "Turbine Temperature Monitor",
  "nodes": [
    {
      "id": "sensor-1",
      "type": "sensor",
      "data": {
        "label": "Temperature Sensor"
      }
    },
    {
      "id": "threshold-1",
      "type": "threshold",
      "data": {
        "operator": ">",
        "value": 80
      }
    },
    {
      "id": "alert-1",
      "type": "alert",
      "data": {
        "label": "Temperature Alert"
      }
    }
  ],
  "edges": [
    {
      "source": "sensor-1",
      "target": "threshold-1"
    },
    {
      "source": "threshold-1",
      "target": "alert-1"
    }
  ]
}
```

These examples illustrate the proposed data structures. Final schemas may change during implementation.

---

## Development Roadmap

The project follows a four-week development plan.

| Timeline | Backend Development | Frontend Development |
|---|---|---|
| Week 1 | MongoDB Time-Series setup and high-speed Express ingestion endpoints. | React setup, React Flow integration and drag-and-drop canvas. |
| Week 2 | Develop JSON graph parser and RxJS Stream Compiler. | Create custom nodes for data sources, transformations and actions. |
| Mid-Project Review | Demonstrate telemetry storage and ingestion performance. | Demonstrate graph serialization into valid JSON. |
| Week 3 | Connect incoming telemetry to compiled RxJS pipelines. | Implement real-time dashboards using WebSockets. |
| Week 4 | Implement outbound webhooks and alerting capabilities. | Add visual feedback, connection animations and UI refinements. |
| Final Review | Demonstrate dynamic rule execution against high-velocity telemetry. | Deliver a complete browser-based visual programming interface. |

---

## Getting Started

The following instructions describe the intended local development setup.

### Prerequisites

Install the following before starting:

- Node.js (v18+)
- npm
- MongoDB Atlas or local MongoDB 5.0+ instance
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/Dvij-Joshi/NexusFlow-Visual-IoT-Telemetry-Rule-Engine.git
cd NexusFlow-Visual-IoT-Telemetry-Rule-Engine
```

### 2. Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file from the example template:

```bash
cp .env.example .env
```

Set your MongoDB Atlas URI in `.env`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@nexusflow.jicb9df.mongodb.net/nexusflow?retryWrites=true&w=majority
CLIENT_URL=http://localhost:5173
```

Start the backend in development mode:

```bash
npm run dev
```

### 3. Frontend Setup

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the frontend development server:

```bash
npm run dev
```

### 4. Open the Application

Visit:

```text
http://localhost:5173
```

### Running the Visual Builder Test Suite

NexusFlow includes an automated unit testing suite covering graph connections, cycle detection, edge validation, and JSON serialization:

```bash
cd frontend
npm test
```

---

## Project Structure

Repository organization:

```text
NexusFlow/
│
├── backend/
│   │
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js
│   │   │
│   │   ├── controllers/
│   │   │   ├── telemetryController.js
│   │   │   └── workflowController.js
│   │   │
│   │   ├── models/
│   │   │   ├── Telemetry.js
│   │   │   └── Workflow.js
│   │   │
│   │   ├── routes/
│   │   │   ├── telemetryRoutes.js
│   │   │   └── workflowRoutes.js
│   │   │
│   │   ├── services/
│   │   │   ├── ingestionService.js
│   │   │   └── alertService.js
│   │   │
│   │   ├── compiler/
│   │   │   ├── graphParser.js
│   │   │   └── streamCompiler.js
│   │   │
│   │   ├── sockets/
│   │   │   └── socketServer.js
│   │   │
│   │   └── server.js
│   │
│   ├── package.json
│   ├── .env
│   └── .env.example
│
├── frontend/
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── GraphEditor/
│   │   │   ├── CustomNodes/
│   │   │   └── Dashboard/
│   │   │
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── context/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
│
├── README.md
└── .gitignore
```

---

## Performance Goals

NexusFlow is designed with high-throughput telemetry processing in mind.

The development specification includes the following performance targets:

| Metric | Target |
|---|---|
| Telemetry ingestion | 5,000 writes/second |
| Database | MongoDB Time-Series Collections |
| Processing | Reactive RxJS streams |
| Communication | WebSocket-based real-time updates |
| Rule execution | Dynamic user-defined pipelines |

These are development targets. Actual performance depends on hardware, database configuration, network conditions, and stream-processing optimization.

---

## Future Scope

NexusFlow can be extended with additional capabilities:

- **Multi-Device Management:** Manage hundreds of industrial devices from a centralized interface.
- **Advanced Rule Conditions:** Support AND/OR conditions and more complex logical expressions.
- **Historical Analytics:** Analyze historical telemetry and identify recurring patterns.
- **Machine Learning Integration:** Introduce predictive maintenance and anomaly prediction.
- **Role-Based Access Control:** Provide different permissions for administrators, engineers, and factory managers.
- **Advanced Notifications:** Integrate email, SMS, and third-party notification services.
- **Workflow Versioning:** Maintain previous workflow configurations and support rollback.
- **Scalable Processing:** Distribute telemetry processing across multiple backend workers.

---

## Contributing

Contributions, suggestions, and bug reports are welcome.

If you want to contribute:

1. Fork the repository.
2. Create a new feature branch (`git checkout -b feature/your-feature`).
3. Make your changes and test thoroughly.
4. Commit your changes (`git commit -m "feat: add your feature"`).
5. Push to the branch (`git push origin feature/your-feature`).
6. Open a Pull Request.

---

## License

MIT License. See [LICENSE](LICENSE) for details.

---

<p align="center">
  <b>NexusFlow — Turning IoT Data Into Intelligent Workflows.</b>
</p>
