import React, { useState } from 'react';
import {
  FileCode,
  Save,
  RotateCcw,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
} from 'lucide-react';

export default function WorkflowToolbar({
  name,
  onNameChange,
  nodeCount,
  edgeCount,
  validation,
  hasSelection,
  onDeleteSelected,
  onReset,
  onExportJson,
  onSave,
  isSaving,
}) {
  const [showValidationDetails, setShowValidationDetails] = useState(false);

  const errorCount = validation?.errors?.length || 0;
  const warningCount = validation?.warnings?.length || 0;
  const isValid = validation?.isValid ?? true;

  return (
    <div className="h-14 border-b border-slate-800 bg-slate-900/90 backdrop-blur px-4 flex items-center justify-between z-20 text-slate-200">
      {/* Left: Workflow Name & Graph Stats */}
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          className="bg-slate-950 border border-slate-800 text-white font-medium px-3 py-1.5 rounded-lg text-xs focus:outline-none focus:border-cyan-500 w-56 sm:w-72 transition"
          placeholder="Workflow Name"
        />

        <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 font-mono">
          <span className="bg-slate-950 px-2 py-1 rounded border border-slate-800">
            {nodeCount} nodes
          </span>
          <span className="bg-slate-950 px-2 py-1 rounded border border-slate-800">
            {edgeCount} edges
          </span>
        </div>

        {/* Validation Status Pill */}
        <div className="relative">
          <button
            onClick={() => setShowValidationDetails(!showValidationDetails)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition ${
              !isValid
                ? 'bg-rose-950/60 border-rose-800 text-rose-300 hover:bg-rose-950'
                : warningCount > 0
                ? 'bg-amber-950/60 border-amber-800 text-amber-300 hover:bg-amber-950'
                : 'bg-emerald-950/60 border-emerald-800 text-emerald-300 hover:bg-emerald-950'
            }`}
          >
            {!isValid ? (
              <>
                <XCircle className="w-3.5 h-3.5 text-rose-400" />
                <span>{errorCount} Error{errorCount > 1 ? 's' : ''}</span>
              </>
            ) : warningCount > 0 ? (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>{warningCount} Warning{warningCount > 1 ? 's' : ''}</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Valid Pipeline</span>
              </>
            )}
          </button>

          {/* Validation Details Dropdown */}
          {showValidationDetails && (
            <div className="absolute left-0 mt-2 w-80 p-3 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 text-xs">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 font-semibold">
                <span className="text-white">Workflow Validation</span>
                <button
                  onClick={() => setShowValidationDetails(false)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {errorCount === 0 && warningCount === 0 && (
                <div className="text-emerald-400 flex items-center gap-1.5 py-1">
                  <CheckCircle2 className="w-4 h-4" /> All validation rules satisfied.
                </div>
              )}

              {errorCount > 0 && (
                <div className="space-y-1 mb-2">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-rose-400 font-bold">
                    Errors (Blocks Execution)
                  </span>
                  {validation.errors.map((err, i) => (
                    <div key={i} className="text-rose-300 text-[11px] bg-rose-950/40 p-1.5 rounded border border-rose-900/60">
                      • {err}
                    </div>
                  ))}
                </div>
              )}

              {warningCount > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-amber-400 font-bold">
                    Warnings
                  </span>
                  {validation.warnings.map((warn, i) => (
                    <div key={i} className="text-amber-300 text-[11px] bg-amber-950/40 p-1.5 rounded border border-amber-900/60">
                      • {warn}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {hasSelection && (
          <button
            onClick={onDeleteSelected}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 text-xs font-medium rounded-lg transition"
            title="Delete selected element (Del / Backspace)"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Delete Selected</span>
          </button>
        )}

        <button
          onClick={onReset}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition border border-transparent hover:border-slate-700"
          title="Reset to default template"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={onExportJson}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium rounded-lg transition shadow-sm"
        >
          <FileCode className="w-3.5 h-3.5 text-cyan-400" />
          <span>Export JSON</span>
        </button>

        <button
          onClick={onSave}
          disabled={isSaving}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs rounded-lg transition shadow-sm disabled:opacity-50"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{isSaving ? 'Saving...' : 'Save Pipeline'}</span>
        </button>
      </div>
    </div>
  );
}
