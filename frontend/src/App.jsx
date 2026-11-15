import React, { useState, useEffect, useRef } from 'react';
import { Activity, GitFork, Radio, CheckCircle, Database } from 'lucide-react';
import FlowCanvas from './components/GraphEditor/FlowCanvas';
import LiveTelemetryChart from './components/Dashboard/LiveTelemetryChart';
import AlertsFeed from './components/Dashboard/AlertsFeed';
import SimulatorPanel from './components/Dashboard/SimulatorPanel';
import DeviceBar from './components/Dashboard/DeviceBar';
import { socket, subscribeToDevice, unsubscribeFromDevice } from './services/socket';
import { getRecentTelemetry, getHealth } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('editor'); // 'editor' | 'dashboard'
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [telemetryStream, setTelemetryStream] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [dbStatus, setDbStatus] = useState('Checking...');
  const [activeWorkflowsCount, setActiveWorkflowsCount] = useState(0);
  const [notification, setNotification] = useState(null);

  const flowCanvasHandlersRef = useRef(null);

  const notify = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Check health and DB status
  const checkHealth = () => {
    getHealth()
      .then((res) => {
        if (res.data) {
          setDbStatus('Connected');
          setActiveWorkflowsCount(res.data.activeWorkflows || 0);
        }
      })
      .catch(() => setDbStatus('Offline'));
  };

  useEffect(() => {
    checkHealth();
    const healthInterval = setInterval(checkHealth, 15000);

    // Initial fetch of recent telemetry
    getRecentTelemetry(selectedDeviceId, 50)
      .then((res) => {
        if (res.data && res.data.data) {
          setTelemetryStream(res.data.data.reverse());
        }
      })
      .catch((err) => console.log('Could not fetch initial telemetry:', err.message));

    return () => clearInterval(healthInterval);
  }, [selectedDeviceId]);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onTelemetry(data) {
      setTelemetryStream((prev) => [...prev.slice(-99), data]);
    }

    function onAlert(alert) {
      setAlerts((prev) => [alert, ...prev.slice(0, 49)]);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('telemetry:data', onTelemetry);
    socket.on('telemetry:alert', onAlert);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('telemetry:data', onTelemetry);
      socket.off('telemetry:alert', onAlert);
    };
  }, []);

  // Manage device room subscription
  useEffect(() => {
    if (selectedDeviceId) {
      subscribeToDevice(selectedDeviceId);
      return () => {
        unsubscribeFromDevice(selectedDeviceId);
      };
    }
  }, [selectedDeviceId]);

  // Tab switching with auto-deploy of dirty circuits
  const handleTabSwitch = (targetTab) => {
    if (targetTab === 'dashboard' && activeTab === 'editor') {
      // If user is moving to dashboard and has unsaved changes, auto-save to MongoDB & deploy!
      if (flowCanvasHandlersRef.current?.isDirty) {
        flowCanvasHandlersRef.current.handleSave(true);
        notify('success', 'Circuit auto-saved & deployed to live rule engine!');
      }
    } else if (targetTab === 'editor') {
      // Recalibrate React Flow bounds when returning to building page
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 50);
    }
    setActiveTab(targetTab);
  };

  return (
    <div className="h-screen bg-slate-950 flex flex-col font-sans overflow-hidden">
      {/* Top Navbar */}
      <header className="h-14 flex-shrink-0 border-b border-slate-800 bg-slate-900/90 backdrop-blur px-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-lg shadow-md shadow-cyan-500/30">
            <Radio className="w-4 h-4 text-slate-950 font-bold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-white">NexusFlow</span>
              <span className="text-[10px] bg-cyan-950/80 border border-cyan-800 text-cyan-400 px-1.5 py-0.5 rounded uppercase font-mono font-semibold">
                v1.0
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => handleTabSwitch('editor')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'editor'
                ? 'bg-slate-800 text-cyan-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GitFork className="w-3.5 h-3.5" /> Visual Rule Builder
          </button>
          <button
            onClick={() => handleTabSwitch('dashboard')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'dashboard'
                ? 'bg-slate-800 text-cyan-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" /> Live Monitoring & Simulator
            {alerts.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            )}
          </button>
        </nav>

        {/* Status Indicators */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Database
              className={`w-3.5 h-3.5 ${
                dbStatus === 'Connected' ? 'text-emerald-400' : 'text-amber-400'
              }`}
            />
            <span className="hidden sm:inline">MongoDB Atlas:</span>
            <span
              className={`font-semibold ${
                dbStatus === 'Connected' ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {dbStatus}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
              }`}
            />
            <span className="text-slate-400">
              {isConnected ? 'WebSocket Live' : 'Disconnected'}
            </span>
          </div>
        </div>
      </header>

      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-16 right-6 z-50 px-4 py-2.5 rounded-xl text-xs font-semibold shadow-2xl flex items-center gap-2 transition border ${
            notification.type === 'success'
              ? 'bg-slate-900 border-cyan-500/50 text-cyan-300'
              : 'bg-slate-900 border-rose-500/50 text-rose-300'
          }`}
        >
          <CheckCircle className="w-4 h-4 text-cyan-400" />
          {notification.message}
        </div>
      )}

      {/* Main Content Body: Both tabs remain mounted to preserve visual circuits and state */}
      <main className="flex-1 min-h-0 flex flex-col overflow-hidden relative">
        <div
          className={`flex-1 min-h-0 flex flex-col h-full w-full ${
            activeTab === 'editor' ? 'flex' : 'hidden'
          }`}
        >
          <FlowCanvas
            onNotify={notify}
            onActiveWorkflowsUpdated={checkHealth}
            onRegisterSaveHandler={(handlers) => {
              flowCanvasHandlersRef.current = handlers;
            }}
          />
        </div>

        <div
          className={`flex-1 p-6 overflow-y-auto space-y-6 max-w-7xl mx-auto w-full ${
            activeTab === 'dashboard' ? 'block' : 'hidden'
          }`}
        >
          {/* Device Management & Selector Bar */}
          <DeviceBar
            selectedDeviceId={selectedDeviceId}
            onSelectDevice={setSelectedDeviceId}
            onNotify={notify}
          />

          {/* Mock IoT Telemetry Simulator */}
          <SimulatorPanel selectedDeviceId={selectedDeviceId} onNotify={notify} />

          {/* Live Chart & Alerts Feed */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <LiveTelemetryChart
                telemetryData={telemetryStream}
                selectedDeviceId={selectedDeviceId}
              />
            </div>
            <div className="lg:col-span-1">
              <AlertsFeed alerts={alerts} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
