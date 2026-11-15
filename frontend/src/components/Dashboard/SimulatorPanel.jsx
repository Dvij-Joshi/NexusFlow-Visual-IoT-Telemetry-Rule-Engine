import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Send, Zap } from 'lucide-react';
import { ingestTelemetry, ingestBatchTelemetry } from '../../services/api';

export default function SimulatorPanel({ onNotify }) {
  const [isRunning, setIsRunning] = useState(false);
  const [deviceId, setDeviceId] = useState('TURBINE_01');
  const [temperature, setTemperature] = useState(78);
  const [pressure, setPressure] = useState(115);
  const intervalRef = useRef(null);

  const sendSingle = async (customTemp) => {
    try {
      const reading = {
        deviceId,
        temperature: customTemp !== undefined ? customTemp : Number(temperature),
        pressure: Number(pressure) + Math.floor(Math.random() * 6 - 3),
        vibration: +(10 + Math.random() * 5).toFixed(1),
        timestamp: new Date().toISOString(),
      };
      await ingestTelemetry(reading);
    } catch (err) {
      console.error('Ingest error:', err);
    }
  };

  const sendBatch = async () => {
    try {
      const batch = Array.from({ length: 50 }, (_, i) => ({
        deviceId,
        temperature: Math.floor(70 + Math.random() * 25), // 70-95°C
        pressure: Math.floor(100 + Math.random() * 30),
        vibration: +(10 + Math.random() * 10).toFixed(1),
        timestamp: new Date(Date.now() - (50 - i) * 1000).toISOString(),
      }));

      await ingestBatchTelemetry(batch);
      if (onNotify) onNotify('success', 'Batch of 50 readings dispatched to MongoDB');
    } catch (err) {
      console.error('Batch ingest error:', err);
      if (onNotify) onNotify('error', `Batch failed: ${err.message}`);
    }
  };

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        // Random fluctuation between 72 and 89 to periodically breach 80°C threshold
        const nextTemp = Math.floor(74 + Math.random() * 14);
        setTemperature(nextTemp);
        sendSingle(nextTemp);
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, deviceId, pressure]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-slate-200">IoT Telemetry Generator</h3>
        </div>
        <span className="text-xs text-slate-400">Mock Hardware Stream</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div>
          <label className="text-xs text-slate-400 block mb-1">Target Device</label>
          <input
            type="text"
            value={deviceId}
            onChange={(e) => setDeviceId(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
          />
        </div>
        <div>
          <label className="text-xs text-slate-400 block mb-1">Temperature (°C)</label>
          <input
            type="number"
            value={temperature}
            onChange={(e) => setTemperature(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
          />
        </div>
        <div>
          <label className="text-xs text-slate-400 block mb-1">Pressure (psi)</label>
          <input
            type="number"
            value={pressure}
            onChange={(e) => setPressure(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => sendSingle()}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition flex items-center gap-1.5"
        >
          <Send className="w-3.5 h-3.5" /> Inject Single
        </button>
        <button
          onClick={sendBatch}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition flex items-center gap-1.5"
        >
          <Zap className="w-3.5 h-3.5 text-cyan-400" /> Ingest Batch (50 docs)
        </button>
        <button
          onClick={() => setIsRunning(!isRunning)}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 ${
            isRunning
              ? 'bg-rose-500 hover:bg-rose-600 text-white'
              : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950'
          }`}
        >
          {isRunning ? (
            <>
              <Square className="w-3.5 h-3.5 fill-current" /> Stop Continuous Stream
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" /> Start Continuous Stream (1 Hz)
            </>
          )}
        </button>
      </div>
    </div>
  );
}
