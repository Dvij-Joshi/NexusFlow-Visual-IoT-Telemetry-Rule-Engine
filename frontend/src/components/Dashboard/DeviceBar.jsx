import React, { useState, useEffect } from 'react';
import { Cpu, Plus, RefreshCw, CheckCircle2, AlertCircle, Clock, X } from 'lucide-react';
import { getDevices, createDevice } from '../../services/api';

export default function DeviceBar({ selectedDeviceId, onSelectDevice, onNotify }) {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDevice, setNewDevice] = useState({
    deviceId: '',
    deviceName: '',
    deviceType: 'temperature',
    location: '',
    unit: '°C',
    status: 'online',
  });

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const res = await getDevices();
      if (res.data && res.data.data) {
        setDevices(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch devices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!newDevice.deviceId || !newDevice.deviceName) {
      if (onNotify) onNotify('error', 'Device ID and Name are required');
      return;
    }

    try {
      await createDevice(newDevice);
      if (onNotify) onNotify('success', `Device ${newDevice.deviceId} registered successfully`);
      setIsModalOpen(false);
      setNewDevice({
        deviceId: '',
        deviceName: '',
        deviceType: 'temperature',
        location: '',
        unit: '°C',
        status: 'online',
      });
      fetchDevices();
    } catch (err) {
      const msg = err.response?.data?.error || err.message;
      if (onNotify) onNotify('error', `Registration failed: ${msg}`);
    }
  };

  const formatLastSeen = (timestamp) => {
    if (!timestamp) return 'Never';
    const diff = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-slate-200">Registered IoT Devices</h3>
          <span className="text-xs font-mono bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
            {devices.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchDevices}
            disabled={loading}
            title="Refresh device list"
            className="p-1.5 text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold text-xs rounded-lg transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" /> Register Device
          </button>
        </div>
      </div>

      {/* Device Badges / Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        <button
          onClick={() => onSelectDevice(null)}
          className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-medium border transition ${
            selectedDeviceId === null
              ? 'bg-cyan-950/70 border-cyan-500/80 text-cyan-300 shadow-sm'
              : 'bg-slate-800/80 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          All Devices (Aggregate)
        </button>

        {devices.map((device) => {
          const isSelected = selectedDeviceId === device.deviceId;
          const isOnline = device.status === 'online';
          const isMaint = device.status === 'maintenance';

          return (
            <button
              key={device.deviceId}
              onClick={() => onSelectDevice(device.deviceId)}
              className={`flex-shrink-0 flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-xs border transition ${
                isSelected
                  ? 'bg-slate-800 border-cyan-500 text-white shadow-sm ring-1 ring-cyan-500/30'
                  : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/60 hover:border-slate-700'
              }`}
            >
              {/* Status Dot */}
              <span className="relative flex h-2 w-2">
                {isOnline && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                )}
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    isOnline
                      ? 'bg-emerald-400'
                      : isMaint
                      ? 'bg-amber-400'
                      : 'bg-slate-500'
                  }`}
                ></span>
              </span>

              <div className="text-left font-mono">
                <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                  {device.deviceId}
                  <span className="text-[10px] text-slate-400 font-sans font-normal">
                    ({device.unit || 'unit'})
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                  <span>{device.deviceType}</span>
                  <span>•</span>
                  <span className="flex items-center gap-0.5">
                    <Clock className="w-2.5 h-2.5" />
                    {formatLastSeen(device.lastSeen)}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Register Device Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                Register New IoT Device
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRegister} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Device ID (Unique Code)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. COMPRESSOR_01"
                  value={newDevice.deviceId}
                  onChange={(e) =>
                    setNewDevice({ ...newDevice, deviceId: e.target.value.toUpperCase() })
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Device Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Main Air Compressor"
                  value={newDevice.deviceName}
                  onChange={(e) => setNewDevice({ ...newDevice, deviceName: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Device Type</label>
                  <select
                    value={newDevice.deviceType}
                    onChange={(e) => setNewDevice({ ...newDevice, deviceType: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="temperature">Temperature</option>
                    <option value="pressure">Pressure</option>
                    <option value="vibration">Vibration</option>
                    <option value="humidity">Humidity</option>
                    <option value="multi">Multi-Sensor</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Measurement Unit</label>
                  <input
                    type="text"
                    placeholder="e.g. °C, psi, bar, mm/s"
                    value={newDevice.unit}
                    onChange={(e) => setNewDevice({ ...newDevice, unit: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Physical Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Building B, Room 102"
                    value={newDevice.location}
                    onChange={(e) => setNewDevice({ ...newDevice, location: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Initial Status</label>
                  <select
                    value={newDevice.status}
                    onChange={(e) => setNewDevice({ ...newDevice, status: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold transition shadow-md"
                >
                  Save Device
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
