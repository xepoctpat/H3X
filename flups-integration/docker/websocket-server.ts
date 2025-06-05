// H3X WebSocket Server for Docker
// Standalone WebSocket server for real-time H3X communication

import WebSocket = require('ws');
import http = require('http');
import express = require('express');

class H3XWebSocketServer {
  constructor(port = 3009) {
    this.port = port;
    this.app = express();
    this.server = http.createServer(this.app);
    this.wss = new WebSocket.Server({ server: this.server });
    this.clients = new Set();
    this.rooms = new Map();

    this.setupMiddleware();
    this.setupWebSocket();
    this.setupHealthCheck();
  }

  setupMiddleware() {
    this.app.use(express.json());

    // CORS
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      if (req.method === 'OPTIONS') {
        res.sendStatus(200);
      } else {
        next();
      }
    });
  }

  setupHealthCheck() {
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        service: 'H3X WebSocket Server',
        port: this.port,
        connections: this.clients.size,
        rooms: this.rooms.size,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      });
    });

    this.app.get('/stats', (req, res) => {
      res.json({
        connections: this.clients.size,
        rooms: Array.from(this.rooms.entries()).map(([name, clients]) => ({
          name,
          clientCount: clients.size,
        })),
        memory: process.memoryUsage(),
        uptime: process.uptime(),
      });
    });
  }

  setupWebSocket() {
    this.wss.on('connection', (ws, req) => {
      console.log(`[H3X-WS] Client connected from ${req.socket.remoteAddress}`);
      this.clients.add(ws);

      // Send welcome message
      this.sendToClient(ws, {
        type: 'connected',
        data: {
          message: 'Connected to H3X WebSocket Server',
          serverTime: new Date().toISOString(),
          clientId: this.generateClientId(),
        },
      });

      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message);
          this.handleMessage(ws, data);
        } catch (error) {
          this.sendToClient(ws, {
            type: 'error',
            data: { message: 'Invalid JSON message' },
          });
        }
      });

      ws.on('close', () => {
        this.clients.delete(ws);
        this.removeFromAllRooms(ws);
        console.log('[H3X-WS] Client disconnected');
      });

      ws.on('error', (error) => {
        console.error('[H3X-WS] WebSocket error:', error);
        this.clients.delete(ws);
        this.removeFromAllRooms(ws);
      });
    });
  }

  handleMessage(ws, data) {
    switch (data.type) {
      case 'ping':
        this.sendToClient(ws, {
          type: 'pong',
          data: { timestamp: Date.now() },
        });
        break;

      case 'join_room':
        this.joinRoom(ws, data.room);
        break;

      case 'leave_room':
        this.leaveRoom(ws, data.room);
        break;

      case 'broadcast':
        this.broadcastToRoom(data.room, data.data, ws);
        break;

      case 'subscribe':
        this.handleSubscription(ws, data);
        break;

      default:
        // Broadcast unknown messages to all clients
        this.broadcast(data, ws);
    }
  }

  joinRoom(ws, roomName) {
    if (!this.rooms.has(roomName)) {
      this.rooms.set(roomName, new Set());
    }
    this.rooms.get(roomName).add(ws);

    this.sendToClient(ws, {
      type: 'room_joined',
      data: { room: roomName },
    });
  }

  leaveRoom(ws, roomName) {
    if (this.rooms.has(roomName)) {
      this.rooms.get(roomName).delete(ws);
      if (this.rooms.get(roomName).size === 0) {
        this.rooms.delete(roomName);
      }
    }

    this.sendToClient(ws, {
      type: 'room_left',
      data: { room: roomName },
    });
  }

  removeFromAllRooms(ws) {
    for (const [roomName, clients] of this.rooms.entries()) {
      clients.delete(ws);
      if (clients.size === 0) {
        this.rooms.delete(roomName);
      }
    }
  }

  broadcastToRoom(roomName, data, sender = null) {
    if (this.rooms.has(roomName)) {
      for (const client of this.rooms.get(roomName)) {
        if (client !== sender && client.readyState === WebSocket.OPEN) {
          this.sendToClient(client, {
            type: 'room_message',
            data: { room: roomName, ...data },
          });
        }
      }
    }
  }

  handleSubscription(ws, data) {
    // Handle channel subscriptions for H3X events
    const channels = data.channels || [];
    ws.h3xChannels = new Set(channels);

    this.sendToClient(ws, {
      type: 'subscribed',
      data: { channels },
    });
  }

  broadcast(message, sender = null) {
    for (const client of this.clients) {
      if (client !== sender && client.readyState === WebSocket.OPEN) {
        this.sendToClient(client, message);
      }
    }
  }

  sendToClient(ws, message) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  generateClientId() {
    return 'h3x_' + Math.random().toString(36).substr(2, 9);
  }

  start() {
    this.server.listen(this.port, () => {
      console.log(`[H3X-WS] WebSocket server running on port ${this.port}`);
      console.log(`[H3X-WS] Health check available at http://localhost:${this.port}/health`);
    });
  }

  stop() {
    this.wss.close();
    this.server.close();
  }
}

// Start server if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new H3XWebSocketServer();
  server.start();

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n[H3X-WS] Shutting down gracefully...');
    server.stop();
    process.exit(0);
  });
}

export = H3XWebSocketServer;
