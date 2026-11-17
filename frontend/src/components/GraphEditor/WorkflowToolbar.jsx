import React, { useState } from 'react';
import {
  FileCode,
  Save,
  RotateCcw,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FolderOpen,
  LayoutTemplate,
} from 'lucide-react';
import { WORKFLOW_TEMPLATES } from '../../utils/workflowTemplates';

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
  savedWorkflows = [],
  currentWorkflowId = null,
  onSelectWorkflow,
  onSelectTemplate,
  isDirty = false,
}) {
  const [showValidationDetails, setShowValidationDetails] = useState(false);

  const errorCount = validation?.errors?.length || 0;
  const warningCount = validation?.warnings?.length || 0;
  const isValid = validation?.isValid ?? true;

  return (
    <div className="h-14 flex-shrink-0 border-b border-slate-800/90 bg-slate-900/95 backdrop-blur-md px-4 flex items-center justify-between z-20 text-slate-200">
      {/* Left: Workflow Name & Graph Stats */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center">
          <input
            type="text"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            className="bg-slate-950/90 border border-slate-800 text-white font-semibold px-3 py-1.5 rounded-lg text-xs focus:outline-none focus:border-cyan-500 w-48 sm:w-60 transition tracking-tight"
            placeholder="Workflow Name"
          />
        </div>

        {/* Saved Workflows Selector */}
        {savedWorkflows.length > 0 && onSelectWorkflow && (
          <div className="hidden lg:flex items-center gap-1.5 text-xs">
            <FolderOpen className="w-3.5 h-3.5 text-cyan-400" />
            <select
              value={currentWorkflowId || ''}
              onChange={(e) => {
                if (e.target.value) onSelectWorkflow(e.target.value);
              }}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-[11px] text-slate-300 font-mono focus:outline-none focus:border-cyan-500 max-w-[170px] truncate"
            >
              <option value="">Load Saved Circuit...</option>
              {savedWorkflows.map((wf) => (
                <option key={wf._id} value={wf._id}>
                  {wf.name} ({wf.nodes?.length || 0} nodes)
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Workflow Template Selector */}
        {onSelectTemplate && (
          <div className="hidden xl:flex items-center gap-1.5 text-xs">
            <LayoutTemplate className="w-3.5 h-3.5 text-purple-400" />
            <select
              value=""
              onChange={(e) => {
                if (e.target.value) onSelectTemplate(e.target.value);
              }}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-[11px] text-slate-300 font-mono focus:outline-none focus:border-cyan-500 max-w-[170px] truncate"
            >
              <option value="">Load Template...</option>
              {WORKFLOW_TEMPLATES.map((tpl) => (
                <option key={tpl.id} value={tpl.id}>
                  {tpl.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400 font-mono">
          <span className="bg-slate-950/80 px-2 py-0.5 rounded-md border border-slate-800 text-[11px]">
            {nodeCount} nodes
          </span>
          <span className="bg-slate-950/80 px-2 py-0.5 rounded-md border border-slate-800 text-[11px]">
            {edgeCount} edges
          </span>
        </div>

        {/* Database Live Sync State Pill */}
        <div className="hidden sm:flex items-center">
          {isDirty ? (
            <span className="flex items-center gap-1 text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-amber-950/60 border border-amber-800 text-amber-300">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
              Unsaved Changes
            </span>
          ) : currentWorkflowId ? (
            <span className="flex items-center gap-1 text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800 text-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Live in DB
            </span>
          ) : null}
        </div>

        {/* Validation Status Pill */}
        <div className="relative">
          <button
            onClick={() => setShowValidationDetails(!showValidationDetails)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border transition shadow-sm ${
              !isValid
                ? 'bg-rose-950/80 border-rose-800 text-rose-300 hover:bg-rose-900'
                : warningCount > 0
                ? 'bg-amber-950/80 border-amber-800 text-amber-300 hover:bg-amber-900'
                : 'bg-emerald-950/80 border-emerald-800 text-emerald-300 hover:bg-emerald-900'
            }`}
          >
            {!isValid ? (
              <>
                <XCircle className="w-3.5 h-3.5 text-rose-400" />
                <span className="font-mono">{errorCount} Error{errorCount > 1 ? 's' : ''}</span>
              </>
            ) : warningCount > 0 ? (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-mono">{warningCount} Warning{warningCount > 1 ? 's' : ''}</span>
              </>
            ) : (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="font-semibold hidden sm:inline">Valid Circuit</span>
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
          className={`flex items-center gap-1.5 px-3.5 py-1.5 text-white font-semibold text-xs rounded-lg transition shadow-md disabled:opacity-50 ${
            isDirty
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 ring-2 ring-cyan-500/50 shadow-cyan-500/20'
              : 'bg-cyan-700 hover:bg-cyan-600'
          }`}
        >
          <Save className="w-3.5 h-3.5" />
          <span>{isSaving ? 'Deploying...' : isDirty ? 'Save & Deploy Live' : 'Saved Live'}</span>
        </button>
      </div>
    </div>
  );
}
