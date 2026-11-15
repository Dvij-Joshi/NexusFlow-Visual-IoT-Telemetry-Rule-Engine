import React, { useState, useEffect } from 'react';
import { Activity, GitFork, Radio, CheckCircle, Database } from 'lucide-react';
import FlowCanvas from './components/GraphEditor/FlowCanvas';
import LiveTelemetryChart from './components/Dashboard/LiveTelemetryChart';
import AlertsFeed from './components/Dashboard/AlertsFeed';
import SimulatorPanel from './components/Dashboard/SimulatorPanel';
import { socket } from './services/socket';
import { getRecentTelemetry } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('editor'); // 'editor' | 'dashboard'
  const [telemetryStream, setTelemetryStream] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [notification, setNotification] = useState(null);

  const notify = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  useEffect(() => {
    // Initial fetch of recent telemetry
    getRecentTelemetry(null, 30)
      .then((res) => {
        if (res.data && res.data.data) {
          setTelemetryStream(res.data.data.reverse());
        }
      })
      .catch((err) => console.log('Could not fetch initial telemetry:', err.message));

    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onTelemetry(data) {
      setTelemetryStream((prev) => [...prev.slice(-49), data]);
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
            onClick={() => setActiveTab('editor')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'editor'
                ? 'bg-slate-800 text-cyan-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GitFork className="w-3.5 h-3.5" /> Visual Rule Builder
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
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
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">MongoDB Atlas:</span>
            <span className="text-emerald-400 font-semibold">Ready</span>
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

      {/* Main Content Body */}
      <main className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {activeTab === 'editor' ? (
          <FlowCanvas onNotify={notify} />
        ) : (
          <div className="flex-1 p-6 overflow-y-auto space-y-6 max-w-7xl mx-auto w-full">
            <SimulatorPanel onNotify={notify} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <LiveTelemetryChart telemetryData={telemetryStream} />
              </div>
              <div className="lg:col-span-1">
                <AlertsFeed alerts={alerts} />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
