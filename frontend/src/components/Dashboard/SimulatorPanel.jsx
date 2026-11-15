import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Send, Zap, Sliders, ChevronDown } from 'lucide-react';
import { ingestTelemetry, ingestBatchTelemetry, getDevices } from '../../services/api';

export default function SimulatorPanel({ selectedDeviceId, onNotify }) {
  const [isRunning, setIsRunning] = useState(false);
  const [deviceId, setDeviceId] = useState(selectedDeviceId || 'TURBINE_01');
  const [deviceList, setDeviceList] = useState([]);
  const [temperature, setTemperature] = useState(78);
  const [pressure, setPressure] = useState(115);
  const [vibration, setVibration] = useState(12.5);
  const [isAbnormal, setIsAbnormal] = useState(false);
  const intervalRef = useRef(null);

  // Sync with parent selectedDeviceId if changed
  useEffect(() => {
    if (selectedDeviceId) {
      setDeviceId(selectedDeviceId);
    }
  }, [selectedDeviceId]);

  // Load registered devices for dropdown
  useEffect(() => {
    getDevices()
      .then((res) => {
        if (res.data?.data) {
          setDeviceList(res.data.data);
        }
      })
      .catch(() => {});
  }, []);

  const sendSingle = async (customTemp, customPressure, customVib) => {
    try {
      const reading = {
        deviceId,
        temperature: customTemp !== undefined ? customTemp : Number(temperature),
        pressure: customPressure !== undefined ? customPressure : Number(pressure),
        vibration: customVib !== undefined ? customVib : Number(vibration),
        timestamp: new Date().toISOString(),
      };
      await ingestTelemetry(reading);
      if (onNotify && !isRunning) {
        onNotify('success', `Telemetry injected for ${deviceId}`);
      }
    } catch (err) {
      console.error('Ingest error:', err);
      if (onNotify && !isRunning) {
        onNotify('error', `Ingest error: ${err.message}`);
      }
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
      if (onNotify) onNotify('success', `Batch of 50 readings dispatched to MongoDB for ${deviceId}`);
    } catch (err) {
      console.error('Batch ingest error:', err);
      if (onNotify) onNotify('error', `Batch failed: ${err.message}`);
    }
  };

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        // Random fluctuation; periodically breach 80°C threshold if abnormal or random spike
        const shouldSpike = Math.random() < 0.25;
        const nextTemp = shouldSpike
          ? Math.floor(82 + Math.random() * 12)
          : Math.floor(72 + Math.random() * 7);
        const nextPressure = Math.floor(110 + Math.random() * 15);
        const nextVib = +(10 + Math.random() * 5).toFixed(1);

        setTemperature(nextTemp);
        setPressure(nextPressure);
        setVibration(nextVib);

        sendSingle(nextTemp, nextPressure, nextVib);
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, deviceId]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-slate-200">IoT Telemetry Generator</h3>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          Mock Hardware Stream {isRunning && <span className="text-emerald-400 animate-pulse font-bold">• Active</span>}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div>
          <label className="text-xs text-slate-400 block mb-1">Target IoT Device</label>
          {deviceList.length > 0 ? (
            <select
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
            >
              {deviceList.map((d) => (
                <option key={d.deviceId} value={d.deviceId}>
                  {d.deviceId} ({d.deviceType})
                </option>
              ))}
              <option value="CUSTOM">Custom Device...</option>
            </select>
          ) : (
            <input
              type="text"
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
            />
          )}
        </div>

        <div>
          <label className="text-xs text-slate-400 block mb-1">Temperature (°C)</label>
          <input
            type="number"
            value={temperature}
            onChange={(e) => setTemperature(Number(e.target.value))}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
          />
        </div>

        <div>
          <label className="text-xs text-slate-400 block mb-1">Pressure (psi)</label>
          <input
            type="number"
            value={pressure}
            onChange={(e) => setPressure(Number(e.target.value))}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
          />
        </div>

        <div>
          <label className="text-xs text-slate-400 block mb-1">Vibration (mm/s)</label>
          <input
            type="number"
            step="0.1"
            value={vibration}
            onChange={(e) => setVibration(Number(e.target.value))}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => sendSingle()}
          disabled={isRunning}
          className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-medium rounded-lg transition flex items-center gap-1.5"
        >
          <Send className="w-3.5 h-3.5" /> Inject Single
        </button>

        <button
          onClick={sendBatch}
          disabled={isRunning}
          className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-medium rounded-lg transition flex items-center gap-1.5"
        >
          <Zap className="w-3.5 h-3.5 text-cyan-400" /> Ingest Batch (50 docs)
        </button>

        <button
          onClick={() => setIsRunning(!isRunning)}
          className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 ${
            isRunning
              ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-md'
              : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-md'
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
