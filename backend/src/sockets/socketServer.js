const { Server } = require('socket.io');

let io = null;

const initSocketServer = (httpServer, clientUrl = 'http://localhost:5173') => {
  io = new Server(httpServer, {
    cors: {
      origin: [clientUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'],
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`[WebSocket] Client connected: ${socket.id}`);

    // Allow clients to subscribe to specific device telemetry
    socket.on('subscribe_device', (deviceId) => {
      socket.join(`device:${deviceId}`);
      console.log(`[WebSocket] Client ${socket.id} joined room device:${deviceId}`);
    });

    socket.on('unsubscribe_device', (deviceId) => {
      socket.leave(`device:${deviceId}`);
      console.log(`[WebSocket] Client ${socket.id} left room device:${deviceId}`);
    });

    socket.on('disconnect', () => {
      console.log(`[WebSocket] Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  return io;
};

const broadcastTelemetry = (telemetryData) => {
  if (!io) return;
  // Broadcast to global telemetry channel
  io.emit('telemetry:data', telemetryData);

  // Broadcast to device-specific room if deviceId exists
  if (telemetryData && telemetryData.deviceId) {
    io.to(`device:${telemetryData.deviceId}`).emit('telemetry:device', telemetryData);
  }
};

const broadcastAlert = (alertData) => {
  if (!io) return;
  io.emit('telemetry:alert', alertData);
};

module.exports = {
  initSocketServer,
  getIO,
  broadcastTelemetry,
  broadcastAlert,
};
