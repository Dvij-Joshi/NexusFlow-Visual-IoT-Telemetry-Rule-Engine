# Onboarding Summary: NexusFlow

## Project Setup Overview
NexusFlow has been scaffolded according to the architectural specification:
- **Backend:** Express API, MongoDB Atlas Time-Series integration, RxJS stream compiler, Socket.io server.
- **Frontend:** React 18, React Flow, Recharts live dashboard, and IoT telemetry generator panel.
- **Security:** Root `.gitignore` configured to ensure all credentials (`.env`, `atlas-credentials.env`) remain excluded from version control while `.env.example` provides an accessible setup guide.

## Getting Started for Teammates
1. Clone the repository:
   ```bash
   git clone https://github.com/Dvij-Joshi/NexusFlow-Visual-IoT-Telemetry-Rule-Engine.git
   ```
2. In `backend/`:
   ```bash
   npm install
   cp .env.example .env
   # Add your MongoDB Atlas credentials into .env
   npm run dev
   ```
3. In `frontend/`:
   ```bash
   npm install
   npm run dev
   ```
4. Access web UI at `http://localhost:5173`.
