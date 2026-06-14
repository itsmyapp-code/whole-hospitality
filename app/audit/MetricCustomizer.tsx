"use client";

import React, { useState, useEffect } from "react";
import { getActiveConfiguration, setActiveConfiguration, AuditConfigurationPayload, MetricDef } from "./utils/configMigration";

export default function MetricCustomizer() {
  const [config, setConfig] = useState<AuditConfigurationPayload | null>(null);
  const [activeModule, setActiveModule] = useState<"BAR" | "RESTAURANT" | "HOTEL">("BAR");
  const [activeType, setActiveType] = useState<"negative" | "positive">("negative");

  const [newLabel, setNewLabel] = useState("");
  const [newDesc, setNewDesc] = useState("");

  useEffect(() => {
    setConfig(getActiveConfiguration());
  }, []);

  const saveConfig = (newConfig: AuditConfigurationPayload) => {
    setConfig(newConfig);
    setActiveConfiguration(newConfig);
  };

  const handleAdd = () => {
    if (!newLabel.trim()) return;
    if (!config) return;

    // Create a fallback ID from label if none exists
    const id = newLabel.trim().toLowerCase().replace(/[^a-z0-9]/g, '') + Date.now();
    
    const newMetric: MetricDef = {
      id,
      label: newLabel.trim(),
      description: newDesc.trim() || undefined
    };

    const updated = { ...config };
    updated.modules[activeModule][activeType] = [
      ...updated.modules[activeModule][activeType],
      newMetric
    ];

    saveConfig(updated);
    setNewLabel("");
    setNewDesc("");
  };

  const handleDelete = (id: string) => {
    if (!config) return;
    const updated = { ...config };
    updated.modules[activeModule][activeType] = updated.modules[activeModule][activeType].filter(m => m.id !== id);
    saveConfig(updated);
  };

  if (!config) return null;

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 mt-4">
      <h3 className="text-sm font-bold text-white mb-4">Customize Audit Metrics</h3>
      
      <div className="flex gap-2 mb-4">
        {["BAR", "RESTAURANT", "HOTEL"].map(mod => (
          <button 
            key={mod}
            onClick={() => setActiveModule(mod as any)}
            className={`px-3 py-1.5 text-xs font-bold rounded ${activeModule === mod ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
          >
            {mod}
          </button>
        ))}
      </div>

      <div className="flex gap-2 mb-4 bg-slate-900 p-1 rounded-lg">
        <button 
          onClick={() => setActiveType("negative")}
          className={`flex-1 py-1.5 text-xs font-bold rounded ${activeType === "negative" ? 'bg-red-500/20 text-red-400' : 'text-slate-500 hover:text-slate-300'}`}
        >
          Negative
        </button>
        <button 
          onClick={() => setActiveType("positive")}
          className={`flex-1 py-1.5 text-xs font-bold rounded ${activeType === "positive" ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}
        >
          Positive
        </button>
      </div>

      <div className="space-y-2 mb-6 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
        {config.modules[activeModule][activeType].map(m => (
          <div key={m.id} className="bg-slate-800 border border-slate-700 p-3 rounded-lg flex justify-between items-center group">
            <div>
              <div className="text-sm font-bold text-slate-200">{activeType === 'negative' ? '🔴' : '🟢'} {m.label}</div>
              {m.description && <div className="text-xs text-slate-400 mt-0.5">{m.description}</div>}
            </div>
            <button 
              onClick={() => handleDelete(m.id)}
              className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-400/10 rounded"
              title="Delete"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
          </div>
        ))}
        {config.modules[activeModule][activeType].length === 0 && (
          <div className="text-xs text-slate-500 italic text-center py-4">No metrics defined.</div>
        )}
      </div>

      <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg space-y-3">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Add New Metric</h4>
        <input 
          type="text" 
          value={newLabel}
          onChange={e => setNewLabel(e.target.value)}
          placeholder="Label (e.g. Broken Glass)"
          className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm focus:outline-none focus:border-blue-500"
        />
        <input 
          type="text" 
          value={newDesc}
          onChange={e => setNewDesc(e.target.value)}
          placeholder="Description (Optional)"
          className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm focus:outline-none focus:border-blue-500"
        />
        <button 
          onClick={handleAdd}
          disabled={!newLabel.trim()}
          className="w-full bg-blue-600 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold py-2 rounded transition-colors text-sm"
        >
          Add to {activeType === 'negative' ? 'Negative' : 'Positive'}
        </button>
      </div>
    </div>
  );
}
