"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import BarStealthCamera, { BarStealthCameraRef } from "./BarStealthCamera";
import { generateUniversalPDF } from "../utils/pdfGenerator";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type InfractionEvent = { timestamp: string; staff: string };

export default function BarAuditPage() {
  const [isPanicked, setIsPanicked] = useState(false);
  const [isAddingStaff, setIsAddingStaff] = useState(false);
  const [viewMode, setViewMode] = useState<"negative" | "positive">("negative");
  
  // Clear any old photo captures from a previous audit session when loading the dashboard
  useEffect(() => {
    try {
      localStorage.removeItem('audit_captures');
    } catch (e) {}
  }, []);

  // Auditor Info State
  const [siteName, setSiteName] = useState("");
  const [auditorName, setAuditorName] = useState("");

  // Staff Tracker State
  const [staffList, setStaffList] = useState<string[]>(["General / Unknown"]);
  const [activeStaff, setActiveStaff] = useState<string>("General / Unknown");
  const [newStaffInput, setNewStaffInput] = useState("");

  // Audit Metrics State
  const [metrics, setMetrics] = useState({
    freePours: [] as InfractionEvent[],
    incorrectMeasures: [] as InfractionEvent[],
    noRingIns: [] as InfractionEvent[],
    chargeDiscrepancies: [] as InfractionEvent[],
    tillLeftOpen: [] as InfractionEvent[],
    unrecordedWastage: [] as InfractionEvent[],
    givingAwayDrinks: [] as InfractionEvent[],
    dirtyGlassware: [] as InfractionEvent[],
    usingPhone: [] as InfractionEvent[],
    eatingDrinking: [] as InfractionEvent[],
    underageStaff: [] as InfractionEvent[],
    noIdCheck: [] as InfractionEvent[],
    // Positive
    immediateRingIn: [] as InfractionEvent[],
    consistentTillClosure: [] as InfractionEvent[],
    accurateChangeVerifications: [] as InfractionEvent[],
    immediateGreeting: [] as InfractionEvent[],
    upselling: [] as InfractionEvent[],
    efficiencyUnderPressure: [] as InfractionEvent[],
    exactMeasurePouring: [] as InfractionEvent[],
    activeSpillLogging: [] as InfractionEvent[],
    perfectGlassware: [] as InfractionEvent[],
    proactiveAgeVerification: [] as InfractionEvent[],
    responsibleService: [] as InfractionEvent[],
    cleanlinessMaintenance: [] as InfractionEvent[],
    // Timers
    timeToGreetSecs: [] as { timestamp: string, duration: number, staff: string }[],
    timeToServeSecs: [] as { timestamp: string, duration: number, staff: string }[],
    photosTaken: 0,
  });

  // Timers State
  const [greetTimerStart, setGreetTimerStart] = useState<number | null>(null);
  const [serveTimerStart, setServeTimerStart] = useState<number | null>(null);

  const cameraRef = useRef<BarStealthCameraRef>(null);

  const handleAddStaff = () => {
    if (newStaffInput.trim() && !staffList.includes(newStaffInput.trim())) {
      const name = newStaffInput.trim();
      setStaffList(prev => [...prev, name]);
      setActiveStaff(name);
      setNewStaffInput("");
    }
  };

  const addEvent = (key: keyof typeof metrics, label: string) => {
    if (key === 'photosTaken' || key === 'timeToGreetSecs' || key === 'timeToServeSecs') return;
    setMetrics(prev => ({
      ...prev,
      [key]: [...(prev[key] as InfractionEvent[]), { timestamp: new Date().toISOString(), staff: activeStaff }]
    }));
  };

  const toggleGreetTimer = () => {
    if (greetTimerStart) {
      const elapsed = Math.round((Date.now() - greetTimerStart) / 1000);
      setMetrics(prev => ({ 
        ...prev, 
        timeToGreetSecs: [...prev.timeToGreetSecs, { timestamp: new Date().toISOString(), duration: elapsed, staff: activeStaff }] 
      }));
      setGreetTimerStart(null);
    } else {
      setGreetTimerStart(Date.now());
    }
  };

  const toggleServeTimer = () => {
    if (serveTimerStart) {
      const elapsed = Math.round((Date.now() - serveTimerStart) / 1000);
      setMetrics(prev => ({ 
        ...prev, 
        timeToServeSecs: [...prev.timeToServeSecs, { timestamp: new Date().toISOString(), duration: elapsed, staff: activeStaff }] 
      }));
      setServeTimerStart(null);
    } else {
      setServeTimerStart(Date.now());
    }
  };

  const triggerCamera = () => {
    if (cameraRef.current) {
      cameraRef.current.capturePhoto();
      setMetrics(prev => ({ ...prev, photosTaken: prev.photosTaken + 1 }));
    }
  };

  const startNewAudit = () => {
    if (window.confirm("Are you sure you want to completely wipe all data and start a new audit?")) {
      setSiteName("");
      setAuditorName("");
      setStaffList(["General / Unknown"]);
      setActiveStaff("General / Unknown");
      setNewStaffInput("");
      setMetrics({
        freePours: [],
        incorrectMeasures: [],
        noRingIns: [],
        chargeDiscrepancies: [],
        tillLeftOpen: [],
        unrecordedWastage: [],
        givingAwayDrinks: [],
        dirtyGlassware: [],
        usingPhone: [],
        eatingDrinking: [],
        underageStaff: [],
        noIdCheck: [],
        immediateRingIn: [],
        consistentTillClosure: [],
        accurateChangeVerifications: [],
        immediateGreeting: [],
        upselling: [],
        efficiencyUnderPressure: [],
        exactMeasurePouring: [],
        activeSpillLogging: [],
        perfectGlassware: [],
        proactiveAgeVerification: [],
        responsibleService: [],
        cleanlinessMaintenance: [],
        timeToGreetSecs: [],
        timeToServeSecs: [],
        photosTaken: 0,
      });
      setGreetTimerStart(null);
      setServeTimerStart(null);
      try {
        localStorage.removeItem('audit_captures');
      } catch (e) {}
    }
  };

  // PDF Export Logic
  const exportPDF = async () => {
    let captures = [];
    try {
      captures = JSON.parse(localStorage.getItem('audit_captures') || '[]');
    } catch (e) {}

    await generateUniversalPDF({
      moduleType: "BAR",
      siteName,
      auditorName,
      staffList,
      captures,
      metrics: {
        negative: [
          { label: 'Free Pours', count: metrics.freePours.length, events: metrics.freePours },
          { label: 'Incorrect Measures', count: metrics.incorrectMeasures.length, events: metrics.incorrectMeasures },
          { label: 'No Ring Ins', count: metrics.noRingIns.length, events: metrics.noRingIns },
          { label: 'Charge Discrepancies', count: metrics.chargeDiscrepancies.length, events: metrics.chargeDiscrepancies },
          { label: 'Till Left Open', count: metrics.tillLeftOpen.length, events: metrics.tillLeftOpen },
          { label: 'Unrecorded Wastage', count: metrics.unrecordedWastage.length, events: metrics.unrecordedWastage },
          { label: 'Giving Away Drinks', count: metrics.givingAwayDrinks.length, events: metrics.givingAwayDrinks },
          { label: 'Dirty Glassware', count: metrics.dirtyGlassware.length, events: metrics.dirtyGlassware },
          { label: 'Using Phone', count: metrics.usingPhone.length, events: metrics.usingPhone },
          { label: 'Eating / Drinking', count: metrics.eatingDrinking.length, events: metrics.eatingDrinking },
          { label: 'Underage Staff', count: metrics.underageStaff.length, events: metrics.underageStaff },
          { label: 'No ID Check', count: metrics.noIdCheck.length, events: metrics.noIdCheck },
        ],
        positive: [
          { label: 'Immediate Ring-In', count: metrics.immediateRingIn.length, events: metrics.immediateRingIn },
          { label: 'Consistent Till Closure', count: metrics.consistentTillClosure.length, events: metrics.consistentTillClosure },
          { label: 'Accurate Change Verifications', count: metrics.accurateChangeVerifications.length, events: metrics.accurateChangeVerifications },
          { label: 'Immediate Greeting', count: metrics.immediateGreeting.length, events: metrics.immediateGreeting },
          { label: 'Upselling', count: metrics.upselling.length, events: metrics.upselling },
          { label: 'Efficiency Under Pressure', count: metrics.efficiencyUnderPressure.length, events: metrics.efficiencyUnderPressure },
          { label: 'Exact Measure Pouring', count: metrics.exactMeasurePouring.length, events: metrics.exactMeasurePouring },
          { label: 'Active Spill Logging', count: metrics.activeSpillLogging.length, events: metrics.activeSpillLogging },
          { label: 'Perfect Glassware', count: metrics.perfectGlassware.length, events: metrics.perfectGlassware },
          { label: 'Proactive Age Verification', count: metrics.proactiveAgeVerification.length, events: metrics.proactiveAgeVerification },
          { label: 'Responsible Service', count: metrics.responsibleService.length, events: metrics.responsibleService },
          { label: 'Cleanliness Maintenance', count: metrics.cleanlinessMaintenance.length, events: metrics.cleanlinessMaintenance },
        ],
        timers: [
          { label: 'Time to Greet', events: metrics.timeToGreetSecs },
          { label: 'Time to Serve', events: metrics.timeToServeSecs },
        ]
      }
    });
  };

  if (isPanicked) {
    return (
      <div 
        className="fixed inset-0 z-[99999] bg-white flex flex-col"
        onClick={() => setIsPanicked(false)}
      >
        <div className="flex justify-between items-center p-4">
          <div className="flex gap-4">
            <span className="text-sm hover:underline cursor-pointer">About</span>
            <span className="text-sm hover:underline cursor-pointer">Store</span>
          </div>
          <div className="flex gap-4 items-center">
            <span className="text-sm hover:underline cursor-pointer">Gmail</span>
            <span className="text-sm hover:underline cursor-pointer">Images</span>
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">M</div>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center -mt-20">
          <div className="text-8xl font-sans font-medium mb-8 flex tracking-tighter">
            <span className="text-[#4285F4]">G</span>
            <span className="text-[#EA4335]">o</span>
            <span className="text-[#FBBC05]">o</span>
            <span className="text-[#4285F4]">g</span>
            <span className="text-[#34A853]">l</span>
            <span className="text-[#EA4335]">e</span>
          </div>
          
          <div className="w-full max-w-[584px] px-4">
            <div className="flex items-center w-full h-12 rounded-full border border-gray-200 hover:shadow-md px-4">
              <svg focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4 text-gray-400">
                <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill="currentColor"></path>
              </svg>
              <input type="text" className="flex-1 h-full outline-none px-4" />
            </div>
            
            <div className="flex justify-center gap-3 mt-6">
              <button className="bg-[#f8f9fa] border border-[#f8f9fa] hover:border-[#dadce0] hover:shadow text-sm text-[#3c4043] h-9 px-4 rounded">
                Google Search
              </button>
              <button className="bg-[#f8f9fa] border border-[#f8f9fa] hover:border-[#dadce0] hover:shadow text-sm text-[#3c4043] h-9 px-4 rounded">
                I'm Feeling Lucky
              </button>
            </div>
          </div>
          
          <div className="mt-8 text-sm">
            Google offered in: <span className="text-[#1a0dab] hover:underline cursor-pointer">Français</span>
          </div>
        </div>
      </div>
    );
  }

  if (isAddingStaff) {
    return (
      <div className="fixed inset-0 z-[99999] bg-black text-white font-sans flex flex-col h-screen w-screen overflow-hidden">
        {/* iOS Header */}
        <div className="bg-[#1c1c1e]/90 backdrop-blur border-b border-gray-800 pt-12 pb-3 px-4 flex items-center justify-between">
          <button onClick={() => setIsAddingStaff(false)} className="text-[#0a84ff] text-lg flex items-center">
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
            Back
          </button>
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-sm font-bold mb-1">
              {activeStaff !== 'General / Unknown' ? activeStaff.charAt(0).toUpperCase() : '?'}
            </div>
            <span className="text-xs font-semibold">{activeStaff !== 'General / Unknown' ? activeStaff : 'New Message'}</span>
          </div>
          <div className="w-16"></div> {/* Spacer for centering */}
        </div>

        {/* Message History Area */}
        <div 
          className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 cursor-pointer"
          onClick={() => setIsAddingStaff(false)}
        >
          <div className="text-center text-xs text-gray-500 my-4">Today {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
          {staffList.filter(s => s !== 'General / Unknown').map((s, i) => (
             <div key={s} className="flex justify-end">
               <div 
                 className="bg-[#0a84ff] text-white rounded-2xl rounded-tr-sm px-4 py-2 max-w-[75%] text-[15px] cursor-default"
                 onClick={(e) => e.stopPropagation()}
               >
                 {s}
               </div>
             </div>
          ))}
        </div>

        {/* iMessage Input Area */}
        <div className="bg-[#1c1c1e] border-t border-gray-800 p-4 pb-8">
          <div className="flex gap-2 items-end">
            <button className="text-[#0a84ff] p-2 shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            </button>
            <div className="flex-1 bg-[#2c2c2e] rounded-full border border-gray-700 px-4 py-2 flex items-center">
              <input 
                type="text" 
                placeholder="iMessage" 
                className="w-full bg-transparent text-[15px] text-white placeholder-gray-500 focus:outline-none"
                value={newStaffInput}
                onChange={(e) => setNewStaffInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newStaffInput.trim()) {
                    handleAddStaff();
                    setIsAddingStaff(false);
                  }
                }}
                autoFocus
              />
            </div>
            {newStaffInput.trim() ? (
              <button 
                onClick={() => {
                  handleAddStaff();
                  setIsAddingStaff(false);
                }}
                className="bg-[#0a84ff] hover:bg-blue-400 text-white p-2 rounded-full shadow-md flex items-center justify-center shrink-0 h-[36px] w-[36px]"
              >
                <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path></svg>
              </button>
            ) : (
              <button className="text-gray-500 p-2 shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto bg-slate-900 text-slate-100 font-sans p-4 pb-20">
      <div id="photo-flash" className="fixed inset-0 bg-white z-[999999] opacity-0 pointer-events-none transition-opacity duration-150"></div>
      
      {/* Stealthy Panic Button Header */}
      <div className="sticky top-0 z-50 mb-6 -mx-4 -mt-4 bg-slate-950/90 backdrop-blur border-b border-slate-900">
        <div className="flex items-center justify-between">
          <div className="pl-4 py-3">
            <Link href="/" className="text-slate-600 hover:text-slate-400 transition-colors block p-2 -ml-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
            </Link>
          </div>
          <button 
            onClick={() => setIsPanicked(true)}
            className="flex-1 py-4 text-slate-500 font-mono text-xs font-bold tracking-widest opacity-80 hover:bg-slate-900 transition-colors"
          >
            [ SAFE MODE ]
          </button>
          <div className="w-12"></div> {/* Spacer to keep Safe Mode perfectly centered */}
        </div>
      </div>

      <header className="mb-6 space-y-4">
        <h1 className="text-2xl font-bold text-white">Bar Audit Dashboard</h1>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase text-slate-400 mb-1">Site Name</label>
            <input 
              type="text" 
              value={siteName}
              onChange={e => setSiteName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm"
              placeholder="E.g. The Red Lion"
            />
          </div>
          <div>
            <label className="block text-xs uppercase text-slate-400 mb-1">Auditor Name</label>
            <input 
              type="text" 
              value={auditorName}
              onChange={e => setAuditorName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm"
              placeholder="E.g. John Doe"
            />
          </div>
        </div>
      </header>

      <div className="space-y-6">
        {/* Stealthy Staff Tracker (Looks like texting) */}
        <section className="bg-[#1c1c1e] border border-slate-800 rounded-2xl overflow-hidden shadow-lg mt-4">
          {/* Fake Chat Header */}
          <div className="bg-[#2c2c2e]/90 backdrop-blur px-4 py-3 border-b border-slate-700 flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-500 rounded-full flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
              <svg className="w-8 h-8 text-slate-300 mt-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg>
            </div>
            <div className="flex flex-col flex-1 overflow-hidden">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mb-0.5">Tracking Target</span>
              <span className="text-sm font-bold text-white leading-tight truncate">{activeStaff}</span>
            </div>
          </div>
          
          <div className="p-4 space-y-4">
            {/* Active Staff List (Fake Message bubbles) */}
            <div className="flex flex-wrap gap-2">
              {staffList.map(s => (
                <button
                  key={s}
                  onClick={() => setActiveStaff(s)}
                  className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-colors border ${
                    activeStaff === s 
                      ? "bg-[#0a84ff] text-white border-[#0a84ff]" 
                      : "bg-[#2c2c2e] text-slate-300 border-slate-700 hover:bg-[#3a3a3c]"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <button 
              onClick={() => setIsAddingStaff(true)}
              className="w-full bg-[#2c2c2e] hover:bg-[#3a3a3c] text-[#0a84ff] py-3 mt-2 rounded-xl border border-slate-700 font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
              New Message (Add Target)
            </button>
            <button 
              onClick={triggerCamera}
              className="w-full bg-[#2c2c2e] hover:bg-[#3a3a3c] text-slate-300 py-3 mt-2 rounded-xl border border-slate-700 font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              Take Photo Evidence {metrics.photosTaken > 0 && `(${metrics.photosTaken})`}
            </button>
          </div>
        </section>

        {/* Actions Grid */}
        <section>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Log Observations</h2>
            <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
              <button 
                onClick={() => setViewMode("negative")}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${viewMode === 'negative' ? 'bg-red-500/20 text-red-400' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Negative
              </button>
              <button 
                onClick={() => setViewMode("positive")}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${viewMode === 'positive' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Positive
              </button>
            </div>
          </div>

          {viewMode === "negative" ? (
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => addEvent('freePours', 'Free Pour')} className="bg-slate-800 hover:bg-slate-700 border border-slate-700 p-2 rounded flex flex-col items-center justify-center gap-1 transition-colors">
                <span className="text-xl">🥃</span>
                <span className="text-[10px] font-semibold text-slate-300 text-center leading-tight">Free Pours</span>
                <span className="text-[10px] text-red-400">{metrics.freePours.length}</span>
              </button>
              <button onClick={() => addEvent('incorrectMeasures', 'Incorrect Measure')} className="bg-slate-800 hover:bg-slate-700 border border-slate-700 p-2 rounded flex flex-col items-center justify-center gap-1 transition-colors">
                <span className="text-xl">⚖️</span>
                <span className="text-[10px] font-semibold text-slate-300 text-center leading-tight">Incorrect Measure</span>
                <span className="text-[10px] text-red-400">{metrics.incorrectMeasures.length}</span>
              </button>
              <button onClick={() => addEvent('noRingIns', 'No Ring In')} className="bg-slate-800 hover:bg-slate-700 border border-slate-700 p-2 rounded flex flex-col items-center justify-center gap-1 transition-colors">
                <span className="text-xl">🧾</span>
                <span className="text-[10px] font-semibold text-slate-300 text-center leading-tight">No Ring In</span>
                <span className="text-[10px] text-red-400">{metrics.noRingIns.length}</span>
              </button>
              <button onClick={() => addEvent('chargeDiscrepancies', 'Charge Discrepancy')} className="bg-slate-800 hover:bg-slate-700 border border-slate-700 p-2 rounded flex flex-col items-center justify-center gap-1 transition-colors">
                <span className="text-xl">💷</span>
                <span className="text-[10px] font-semibold text-slate-300 text-center leading-tight">Charge Discrepancy</span>
                <span className="text-[10px] text-red-400">{metrics.chargeDiscrepancies.length}</span>
              </button>
              <button onClick={() => addEvent('tillLeftOpen', 'Till Left Open')} className="bg-slate-800 hover:bg-slate-700 border border-slate-700 p-2 rounded flex flex-col items-center justify-center gap-1 transition-colors">
                <span className="text-xl">🔓</span>
                <span className="text-[10px] font-semibold text-slate-300 text-center leading-tight">Till Left Open</span>
                <span className="text-[10px] text-red-400">{metrics.tillLeftOpen.length}</span>
              </button>
              <button onClick={() => addEvent('unrecordedWastage', 'Unrecorded Wastage')} className="bg-slate-800 hover:bg-slate-700 border border-slate-700 p-2 rounded flex flex-col items-center justify-center gap-1 transition-colors">
                <span className="text-xl">🗑️</span>
                <span className="text-[10px] font-semibold text-slate-300 text-center leading-tight">Unrecorded Wastage</span>
                <span className="text-[10px] text-red-400">{metrics.unrecordedWastage.length}</span>
              </button>
              <button onClick={() => addEvent('givingAwayDrinks', 'Giving Away Drinks')} className="bg-slate-800 hover:bg-slate-700 border border-slate-700 p-2 rounded flex flex-col items-center justify-center gap-1 transition-colors">
                <span className="text-xl">🍻</span>
                <span className="text-[10px] font-semibold text-slate-300 text-center leading-tight">Giving Away Drinks</span>
                <span className="text-[10px] text-red-400">{metrics.givingAwayDrinks.length}</span>
              </button>
              <button onClick={() => addEvent('dirtyGlassware', 'Dirty Glassware')} className="bg-slate-800 hover:bg-slate-700 border border-slate-700 p-2 rounded flex flex-col items-center justify-center gap-1 transition-colors">
                <span className="text-xl">🍷</span>
                <span className="text-[10px] font-semibold text-slate-300 text-center leading-tight">Dirty Glassware</span>
                <span className="text-[10px] text-red-400">{metrics.dirtyGlassware.length}</span>
              </button>
              <button onClick={() => addEvent('usingPhone', 'Using Phone')} className="bg-slate-800 hover:bg-slate-700 border border-slate-700 p-2 rounded flex flex-col items-center justify-center gap-1 transition-colors">
                <span className="text-xl">📱</span>
                <span className="text-[10px] font-semibold text-slate-300 text-center leading-tight">Using Phone</span>
                <span className="text-[10px] text-red-400">{metrics.usingPhone.length}</span>
              </button>
              <button onClick={() => addEvent('eatingDrinking', 'Eating / Drinking')} className="bg-slate-800 hover:bg-slate-700 border border-slate-700 p-2 rounded flex flex-col items-center justify-center gap-1 transition-colors">
                <span className="text-xl">🍔</span>
                <span className="text-[10px] font-semibold text-slate-300 text-center leading-tight">Eating/Drinking</span>
                <span className="text-[10px] text-red-400">{metrics.eatingDrinking.length}</span>
              </button>
              <button onClick={() => addEvent('underageStaff', 'Underage Staff')} className="bg-slate-800 hover:bg-slate-700 border border-slate-700 p-2 rounded flex flex-col items-center justify-center gap-1 transition-colors">
                <span className="text-xl">🔞</span>
                <span className="text-[10px] font-semibold text-slate-300 text-center leading-tight">Underage Staff</span>
                <span className="text-[10px] text-red-400">{metrics.underageStaff.length}</span>
              </button>
              <button onClick={() => addEvent('noIdCheck', 'No ID Check')} className="bg-slate-800 hover:bg-slate-700 border border-slate-700 p-2 rounded flex flex-col items-center justify-center gap-1 transition-colors">
                <span className="text-xl">🆔</span>
                <span className="text-[10px] font-semibold text-slate-300 text-center leading-tight">No ID Check</span>
                <span className="text-[10px] text-red-400">{metrics.noIdCheck.length}</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => addEvent('immediateRingIn', 'Immediate Ring-In')} className="bg-emerald-900/40 hover:bg-emerald-800/60 border border-emerald-800/50 p-2 rounded flex flex-col items-center justify-center gap-1 transition-colors">
                <span className="text-xl">🧾</span>
                <span className="text-[10px] font-semibold text-emerald-100 text-center leading-tight">Instant Ring-In</span>
                <span className="text-[10px] text-emerald-400 font-bold">{metrics.immediateRingIn.length}</span>
              </button>
              <button onClick={() => addEvent('consistentTillClosure', 'Consistent Till Closure')} className="bg-emerald-900/40 hover:bg-emerald-800/60 border border-emerald-800/50 p-2 rounded flex flex-col items-center justify-center gap-1 transition-colors">
                <span className="text-xl">🔒</span>
                <span className="text-[10px] font-semibold text-emerald-100 text-center leading-tight">Till Closure</span>
                <span className="text-[10px] text-emerald-400 font-bold">{metrics.consistentTillClosure.length}</span>
              </button>
              <button onClick={() => addEvent('accurateChangeVerifications', 'Accurate Change Verifications')} className="bg-emerald-900/40 hover:bg-emerald-800/60 border border-emerald-800/50 p-2 rounded flex flex-col items-center justify-center gap-1 transition-colors">
                <span className="text-xl">💷</span>
                <span className="text-[10px] font-semibold text-emerald-100 text-center leading-tight">Accurate Change</span>
                <span className="text-[10px] text-emerald-400 font-bold">{metrics.accurateChangeVerifications.length}</span>
              </button>
              <button onClick={() => addEvent('immediateGreeting', 'Immediate Greeting')} className="bg-emerald-900/40 hover:bg-emerald-800/60 border border-emerald-800/50 p-2 rounded flex flex-col items-center justify-center gap-1 transition-colors">
                <span className="text-xl">👋</span>
                <span className="text-[10px] font-semibold text-emerald-100 text-center leading-tight">Instant Greet</span>
                <span className="text-[10px] text-emerald-400 font-bold">{metrics.immediateGreeting.length}</span>
              </button>
              <button onClick={() => addEvent('upselling', 'Upselling')} className="bg-emerald-900/40 hover:bg-emerald-800/60 border border-emerald-800/50 p-2 rounded flex flex-col items-center justify-center gap-1 transition-colors">
                <span className="text-xl">📈</span>
                <span className="text-[10px] font-semibold text-emerald-100 text-center leading-tight">Upselling</span>
                <span className="text-[10px] text-emerald-400 font-bold">{metrics.upselling.length}</span>
              </button>
              <button onClick={() => addEvent('efficiencyUnderPressure', 'Efficiency Under Pressure')} className="bg-emerald-900/40 hover:bg-emerald-800/60 border border-emerald-800/50 p-2 rounded flex flex-col items-center justify-center gap-1 transition-colors">
                <span className="text-xl">⚡</span>
                <span className="text-[10px] font-semibold text-emerald-100 text-center leading-tight">Pressure Eff.</span>
                <span className="text-[10px] text-emerald-400 font-bold">{metrics.efficiencyUnderPressure.length}</span>
              </button>
              <button onClick={() => addEvent('exactMeasurePouring', 'Exact Measure Pouring')} className="bg-emerald-900/40 hover:bg-emerald-800/60 border border-emerald-800/50 p-2 rounded flex flex-col items-center justify-center gap-1 transition-colors">
                <span className="text-xl">⚖️</span>
                <span className="text-[10px] font-semibold text-emerald-100 text-center leading-tight">Exact Measures</span>
                <span className="text-[10px] text-emerald-400 font-bold">{metrics.exactMeasurePouring.length}</span>
              </button>
              <button onClick={() => addEvent('activeSpillLogging', 'Active Spill Logging')} className="bg-emerald-900/40 hover:bg-emerald-800/60 border border-emerald-800/50 p-2 rounded flex flex-col items-center justify-center gap-1 transition-colors">
                <span className="text-xl">📝</span>
                <span className="text-[10px] font-semibold text-emerald-100 text-center leading-tight">Spill Logging</span>
                <span className="text-[10px] text-emerald-400 font-bold">{metrics.activeSpillLogging.length}</span>
              </button>
              <button onClick={() => addEvent('perfectGlassware', 'Perfect Glassware')} className="bg-emerald-900/40 hover:bg-emerald-800/60 border border-emerald-800/50 p-2 rounded flex flex-col items-center justify-center gap-1 transition-colors">
                <span className="text-xl">🍷</span>
                <span className="text-[10px] font-semibold text-emerald-100 text-center leading-tight">Perfect Glass</span>
                <span className="text-[10px] text-emerald-400 font-bold">{metrics.perfectGlassware.length}</span>
              </button>
              <button onClick={() => addEvent('proactiveAgeVerification', 'Proactive Age Verification')} className="bg-emerald-900/40 hover:bg-emerald-800/60 border border-emerald-800/50 p-2 rounded flex flex-col items-center justify-center gap-1 transition-colors">
                <span className="text-xl">🆔</span>
                <span className="text-[10px] font-semibold text-emerald-100 text-center leading-tight">Age Verify</span>
                <span className="text-[10px] text-emerald-400 font-bold">{metrics.proactiveAgeVerification.length}</span>
              </button>
              <button onClick={() => addEvent('responsibleService', 'Responsible Service')} className="bg-emerald-900/40 hover:bg-emerald-800/60 border border-emerald-800/50 p-2 rounded flex flex-col items-center justify-center gap-1 transition-colors">
                <span className="text-xl">🛑</span>
                <span className="text-[10px] font-semibold text-emerald-100 text-center leading-tight">Resp. Service</span>
                <span className="text-[10px] text-emerald-400 font-bold">{metrics.responsibleService.length}</span>
              </button>
              <button onClick={() => addEvent('cleanlinessMaintenance', 'Cleanliness Maintenance')} className="bg-emerald-900/40 hover:bg-emerald-800/60 border border-emerald-800/50 p-2 rounded flex flex-col items-center justify-center gap-1 transition-colors">
                <span className="text-xl">✨</span>
                <span className="text-[10px] font-semibold text-emerald-100 text-center leading-tight">Cleanliness</span>
                <span className="text-[10px] text-emerald-400 font-bold">{metrics.cleanlinessMaintenance.length}</span>
              </button>
            </div>
          )}
        </section>

        {/* Timers */}
        <section>
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Service Timers</h2>
          <div className="space-y-3">
            <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl flex items-center justify-between">
              <div>
                <span className="font-semibold block">Time to Greet</span>
                <span className="text-xs text-slate-400">{metrics.timeToGreetSecs.length} recorded</span>
              </div>
              <button 
                onClick={toggleGreetTimer}
                className={`px-6 py-2 rounded-lg font-bold shadow-sm active:scale-95 transition-all ${greetTimerStart ? 'bg-amber-500 text-black' : 'bg-blue-600 text-white'}`}
              >
                {greetTimerStart ? 'STOP' : 'START'}
              </button>
            </div>
            
            <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl flex items-center justify-between">
              <div>
                <span className="font-semibold block">Time to Serve</span>
                <span className="text-xs text-slate-400">{metrics.timeToServeSecs.length} recorded</span>
              </div>
              <button 
                onClick={toggleServeTimer}
                className={`px-6 py-2 rounded-lg font-bold shadow-sm active:scale-95 transition-all ${serveTimerStart ? 'bg-amber-500 text-black' : 'bg-blue-600 text-white'}`}
              >
                {serveTimerStart ? 'STOP' : 'START'}
              </button>
            </div>
          </div>
        </section>

        {/* Evidence */}
        <section>
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Evidence</h2>
          <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl flex flex-col items-center gap-4">
            <div className="w-full aspect-video rounded-lg overflow-hidden border border-slate-600 relative bg-black shadow-inner">
              <BarStealthCamera ref={cameraRef} />
            </div>
            <button 
              onClick={triggerCamera}
              className="w-full bg-slate-700 hover:bg-slate-600 border border-slate-600 py-3 rounded-lg font-bold flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              TAKE PHOTO EVIDENCE
            </button>
            <span className="text-xs text-slate-400">{metrics.photosTaken} photos taken this session</span>
          </div>
        </section>

        {/* Export */}
        <section className="pt-4 pb-8 space-y-4">
          <button 
            onClick={exportPDF}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-lg shadow-lg text-lg uppercase tracking-wider transition-colors"
          >
            End Audit & Export PDF
          </button>

          <button 
            onClick={startNewAudit}
            className="w-full bg-slate-800 hover:bg-red-900/50 text-slate-400 hover:text-red-400 border border-slate-700 hover:border-red-800 py-3 rounded-lg font-bold text-sm uppercase tracking-wider transition-colors"
          >
            Start New Audit (Wipe Data)
          </button>
        </section>

        {/* Legal & Compliance Footer */}
        <section className="pt-8 pb-12 text-center text-slate-500 text-xs px-2">
          <p className="mb-2">
            <strong>Disclaimer:</strong> This is an offline-first analytical utility. Whole Hospitality does not provide legal counsel. The venue operator assumes full responsibility for ensuring deployment aligns with UK GDPR and employment laws.
          </p>
          <a 
            href="/legal/compliance-framework" 
            target="_blank" 
            className="text-emerald-500 hover:text-emerald-400 underline font-medium"
          >
            Read the full Legal Standing & Deployment Guide
          </a>
        </section>

      </div>
    </div>
  );
}
