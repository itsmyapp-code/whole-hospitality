"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function AuditHub() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);
  
  const [pendingRoute, setPendingRoute] = useState<string | null>(null);

  const CORRECT_PIN = "1234";

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === CORRECT_PIN) {
      setIsAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
      setPinInput("");
    }
  };

  const handleModuleSelect = (route: string) => {
    setPendingRoute(route);
  };

  const acceptCompliance = () => {
    if (pendingRoute) {
      router.push(pendingRoute);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl max-w-sm w-full">
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mb-4 shadow-inner">
              <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
            </div>
            <h1 className="text-xl font-bold text-white tracking-widest uppercase">System Access</h1>
            <p className="text-xs text-slate-500 mt-2">Enter authorization code</p>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className={`w-full bg-slate-950 border ${pinError ? 'border-red-500/50' : 'border-slate-800'} text-center text-3xl tracking-[1em] text-white p-4 rounded-xl focus:outline-none focus:border-emerald-500/50 transition-colors`}
                placeholder="••••"
                autoFocus
              />
              {pinError && <p className="text-red-400 text-xs text-center mt-2">Invalid code</p>}
            </div>
            <button
              type="submit"
              className="w-full bg-slate-100 hover:bg-white text-slate-900 font-bold py-3 px-4 rounded-xl transition-colors"
            >
              Verify
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 relative">
      <div className="max-w-2xl mx-auto space-y-8 mt-12">
        <header className="flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd"></path></svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white uppercase tracking-widest">Diagnostic Hub</h1>
            <p className="text-sm text-slate-400">Select active target environment</p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => handleModuleSelect('/audit/bar')}
            className="group bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 p-6 rounded-2xl flex flex-col items-center justify-center gap-4 transition-all"
          >
            <span className="text-4xl group-hover:scale-110 transition-transform">🥃</span>
            <span className="font-semibold text-slate-300">Bar Premises</span>
          </button>
          
          <button 
            onClick={() => handleModuleSelect('/audit/restaurant')}
            className="group bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 p-6 rounded-2xl flex flex-col items-center justify-center gap-4 transition-all"
          >
            <span className="text-4xl group-hover:scale-110 transition-transform">🍽️</span>
            <span className="font-semibold text-slate-300 text-center">Restaurant &<br/>Floor</span>
          </button>

          <button 
            onClick={() => handleModuleSelect('/audit/hotel')}
            className="group bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 p-6 rounded-2xl flex flex-col items-center justify-center gap-4 transition-all"
          >
            <span className="text-4xl group-hover:scale-110 transition-transform">🏨</span>
            <span className="font-semibold text-slate-300 text-center">Hotel & Guest<br/>Services</span>
          </button>
        </div>
      </div>

      {/* Compliance Modal */}
      {pendingRoute && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 rounded-t-2xl">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                Legal Compliance Framework
              </h2>
              <button onClick={() => setPendingRoute(null)} className="text-slate-500 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300 leading-relaxed">
              <div>
                <h3 className="text-white font-bold mb-2">1. Core Compliance Facts</h3>
                <p className="mb-2"><strong>Zero-Server Architecture Immunity:</strong> The application operates strictly as a local processing engine. Because zero personal profiles or captured images are ever transmitted to an external network, Whole Hospitality does not possess, harvest, or process user session data.</p>
                <p className="mb-2"><strong>Neutral Utility Designation:</strong> Whole Hospitality is legally classified as a neutral software utility provider. The platform is entirely insulated from data processing liabilities.</p>
              </div>
              
              <div>
                <h3 className="text-white font-bold mb-2">2. Mandatory Instructions for Venue Operators</h3>
                <p className="mb-2"><strong>Data Controller Liability:</strong> Under UK law, the venue operator assumes 100% of the legal status of the Data Controller.</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Proportionality Window:</strong> Covert monitoring must be strictly time-limited (1-2 weeks max).</li>
                  <li><strong>Legitimate Interest:</strong> The audit must only be deployed where senior management has a reasonable suspicion of financial leakage or gross operational malpractice.</li>
                  <li><strong>Public Floor Boundary Safety:</strong> This tool is designed exclusively for use on the public trading floor. Never in private staff zones.</li>
                  <li><strong>Pre-Audit DPIA:</strong> Operators are legally required to have a completed Data Protection Impact Assessment (DPIA) on file.</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-white font-bold mb-2">3. Website Legal Disclaimer Notice</h3>
                <p>Whole Hospitality does not provide legal counsel. The venue operator assumes full responsibility for ensuring their deployment of this software aligns with the UK GDPR and local employment laws. Exported PDF files are standalone evidentiary objects; custody rests solely with the Data Controller.</p>
              </div>
            </div>
            
            <div className="p-6 border-t border-slate-800 bg-slate-900/50 rounded-b-2xl">
              <button 
                onClick={acceptCompliance}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl transition-colors tracking-wide"
              >
                I AGREE & UNDERSTAND
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
