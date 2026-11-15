# NexusFlow: Visual IoT Telemetry & Rule Engine

## Project Overview
NexusFlow is a visual, node-based IoT telemetry processing and automation platform that enables factory managers and developers to build real-time monitoring workflows without writing complex business logic manually.

## Core Problem
Industrial IoT monitoring typically relies on hardcoded backend business logic (`if (temp > 80) sendAlert()`). Any change in monitoring thresholds requires backend redeployment. Standard MERN stacks struggle to handle high-velocity time-series sensor ingestion while simultaneously evaluating dynamic user-defined logic against incoming data streams.

## Solution Architecture
1. **Frontend Visual Builder (React + React Flow):** Non-technical users drag-and-drop sensor nodes, transform nodes (SMA/moving averages), condition/threshold nodes, and alert triggers. Graph serializes into JSON.
2. **Dynamic Stream Compiler (Node.js + RxJS):** Backend compiles JSON graph into executable reactive RxJS streams with zero backend downtime or code changes.
3. **Time-Series Telemetry Store (MongoDB 5.0+):** Native Time-Series Collections optimized for append-only, high-throughput IoT sensor readings.
4. **Ingestion & Real-Time Engine (Express + WebSockets):** Ingestion endpoints handling up to 5,000 writes/sec, broadcasting live data and instant anomaly alerts to client dashboards.

## Technology Stack
- **Frontend:** React 18, React Flow (@xyflow/react), Vite, Tailwind CSS, Recharts, Lucide React, Socket.io-client
- **Backend:** Node.js, Express, RxJS, Socket.io, Mongoose, Dotenv, CORS
- **Database:** MongoDB Atlas 5.0+ (Time-Series Collections)
