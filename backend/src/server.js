const http = require('http');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const connectDB = require('./config/database');
const { initSocketServer } = require('./sockets/socketServer');
const telemetryRoutes = require('./routes/telemetryRoutes');
const workflowRoutes = require('./routes/workflowRoutes');
const Workflow = require('./models/Workflow');
const streamCompiler = require('./compiler/streamCompiler');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Middleware
app.use(
  cors({
    origin: [CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initialize WebSocket server
initSocketServer(server, CLIENT_URL);

// Base Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'NexusFlow Engine',
    timestamp: new Date().toISOString(),
    activeWorkflows: streamCompiler.activePipelines.size,
  });
});

// API Routes
app.use('/api/telemetry', telemetryRoutes);
app.use('/api/workflows', workflowRoutes);

// Bootstrapping
const startServer = async () => {
  try {
    // 1. Connect Database
    await connectDB();

    // 2. Load active workflows and compile RxJS streams
    const activeWorkflows = await Workflow.find({ isActive: true });
    console.log(`[Bootstrap] Compiling ${activeWorkflows.length} active workflow(s)...`);
    for (const wf of activeWorkflows) {
      if (wf.nodes && wf.nodes.length > 0) {
        streamCompiler.compileWorkflow(wf);
      }
    }

    // 3. Start HTTP + WebSocket Server
    server.listen(PORT, () => {
      console.log(`[NexusFlow] Server running on http://localhost:${PORT}`);
      console.log(`[NexusFlow] Ready for high-velocity IoT telemetry ingestion`);
    });
  } catch (err) {
    console.error(`[NexusFlow] Server failed to start:`, err);
    process.exit(1);
  }
};

startServer();

module.exports = { app, server };
