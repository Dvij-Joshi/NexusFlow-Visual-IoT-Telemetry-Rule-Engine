# NexusFlow Database Setup Guide

## Prerequisites

- **Node.js** v18+ and npm
- **MongoDB** 5.0+ (local) or **MongoDB Atlas** (cloud)
- **Git**

---

## 1. MongoDB Setup

### Option A: MongoDB Atlas (Recommended)

1. Create a free account at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a cluster (free M0 tier works fine)
3. Create a database user with read/write permissions
4. Whitelist your IP address (or use 0.0.0.0/0 for development)
5. Get the connection string from **Connect → Drivers**:
   ```
   mongodb+srv://<username>:<password>@<cluster>.mongodb.net/nexusflow?retryWrites=true&w=majority
   ```

### Option B: Local MongoDB

1. Install MongoDB Community Server 5.0+
2. Start the mongod service:
   ```bash
   mongod --dbpath /data/db
   ```
3. Connection string:
   ```
   mongodb://localhost:27017/nexusflow
   ```

> **Note:** Time-Series Collections require MongoDB 5.0+. Verify with `mongosh --eval "db.version()"`.

---

## 2. Environment Configuration

```bash
cd backend
cp .env.example .env
```

Edit `.env` and set your MongoDB connection string:

```env
PORT=5000
MONGODB_URI=mongodb+srv://your-user:your-password@cluster.mongodb.net/nexusflow?retryWrites=true&w=majority
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

> **Never commit `.env` to Git.** The `.gitignore` already excludes it.

---

## 3. Install Dependencies

```bash
cd backend
npm install
```

---

## 4. Seed the Database

Populates 5 sample devices, a sample workflow, and 2 sample alerts:

```bash
npm run seed
```

This is **safe to run multiple times** — it skips devices/alerts that already exist.

Expected output:
```
[Seed] Connected to MongoDB
[Seed] Devices: 5 created, 0 already existed
[Seed] Workflow: created "Turbine Temperature Monitor"
[Seed] Alerts: 2 created, 0 already existed
[Seed] Database seeding complete
```

---

## 5. Start the Server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

The server starts on `http://localhost:5000`. Verify with:
```bash
curl http://localhost:5000/api/health
```

---

## 6. Mock Data Generator

Generate realistic IoT telemetry readings to test the system:

```bash
# Default: 2-second interval, 15% abnormal rate
npm run generate

# Custom interval and abnormal rate
node src/scripts/mockGenerator.js --interval 1000 --abnormal-rate 0.2
```

The generator sends readings through the actual `/api/telemetry` endpoint. The backend server must be running first.

Press `Ctrl+C` to stop.

---

## 7. Run Tests

Tests require a running MongoDB instance (uses `MONGODB_URI` from `.env`):

```bash
npm test
```

Tests cover:
- Device CRUD operations
- Telemetry ingestion and queries (single, batch, latest, history, stats)
- Workflow CRUD and validation
- Alert retrieval, filtering, and resolution

---

## 8. Collections Overview

After seeding, the `nexusflow` database contains:

| Collection | Type | Purpose |
|---|---|---|
| `devices` | Standard | IoT device registry |
| `telemetries` | Time-Series | Sensor readings |
| `workflows` | Standard | Visual rule pipelines |
| `alerts` | Standard | Generated alerts |

Verify in MongoDB Shell:
```javascript
use nexusflow
show collections
db.devices.countDocuments()
db.workflows.countDocuments()
```

---

## 9. API Quick Reference

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| POST | `/api/devices` | Register device |
| GET | `/api/devices` | List devices |
| GET | `/api/devices/:deviceId` | Get device |
| PUT | `/api/devices/:deviceId` | Update device |
| DELETE | `/api/devices/:deviceId` | Delete device |
| POST | `/api/telemetry` | Ingest reading |
| POST | `/api/telemetry/ingest` | Ingest (alternate) |
| POST | `/api/telemetry/batch` | Batch ingest |
| GET | `/api/telemetry/:deviceId` | Recent readings |
| GET | `/api/telemetry/:deviceId/latest` | Latest reading |
| GET | `/api/telemetry/:deviceId/history` | Historical data |
| GET | `/api/telemetry/:deviceId/stats` | Statistics |
| POST | `/api/workflows` | Create workflow |
| GET | `/api/workflows` | List workflows |
| GET | `/api/workflows/:id` | Get workflow |
| PUT | `/api/workflows/:id` | Update workflow |
| DELETE | `/api/workflows/:id` | Delete workflow |
| GET | `/api/alerts` | List alerts |
| GET | `/api/alerts/:alertId` | Get alert |
| PATCH | `/api/alerts/:alertId/resolve` | Resolve alert |

See [API Contract](api-contract.md) for full request/response examples.
