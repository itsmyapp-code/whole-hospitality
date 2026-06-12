"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { generateUniversalPDF } from "../utils/pdfGenerator";
import BarStealthCamera, { BarStealthCameraRef } from "../bar/BarStealthCamera";

interface InfractionEvent {
  timestamp: number;
  staff: string;
  detail?: string;
}

export default function HotelAuditPage() {
  const [isPanicked, setIsPanicked] = useState(false);
  const [isAddingStaff, setIsAddingStaff] = useState(false);
  const [viewMode, setViewMode] = useState<"negative" | "positive">("negative");
  
  const [siteName, setSiteName] = useState("");
  const [auditorName, setAuditorName] = useState("");

  const [activeStaff, setActiveStaff] = useState<string>("General / Unknown");
  const [staffList, setStaffList] = useState<string[]>(["General / Unknown"]);
  const [newStaffInput, setNewStaffInput] = useState("");

  const cameraRef = useRef<BarStealthCameraRef>(null);

  const [metrics, setMetrics] = useState({
    // Negative
    cashUpgradeLeak: [] as InfractionEvent[],
    idComplianceFail: [] as InfractionEvent[],
    guestDataExposure: [] as InfractionEvent[],
    deepCleanOversight: [] as InfractionEvent[],
    amenitiesMalfunction: [] as InfractionEvent[],
    unattendedDesk: [] as InfractionEvent[],
    
    // Positive
    loyaltyPush: [] as InfractionEvent[],
    preemptiveConcierge: [] as InfractionEvent[],
    expressDeparture: [] as InfractionEvent[],
    
    // Timers
    checkInDuration: [] as { timestamp: string, duration: number, staff: string }[],
    roomLatency: [] as { timestamp: string, duration: number, staff: string }[],
    photosTaken: 0,
  });

  const [checkInTimerStart, setCheckInTimerStart] = useState<number | null>(null);
  const [roomTimerStart, setRoomTimerStart] = useState<number | null>(null);

  // Clear previous captures
  useEffect(() => {
    try {
      localStorage.removeItem('audit_captures');
    } catch (e) {}
  }, []);

  const addEvent = (key: keyof typeof metrics, label: string) => {
    if (key === 'checkInDuration' || key === 'roomLatency' || key === 'photosTaken') return;
    setMetrics(prev => ({
      ...prev,
      [key]: [...(prev[key] as any[]), { timestamp: Date.now(), staff: activeStaff }]
    }));
  };

  const handleAddStaff = () => {
    if (newStaffInput.trim() && !staffList.includes(newStaffInput.trim())) {
      setStaffList([...staffList, newStaffInput.trim()]);
      setActiveStaff(newStaffInput.trim());
      setNewStaffInput("");
    }
  };

  const triggerPhotoCapture = () => {
    if (cameraRef.current) {
      cameraRef.current.capturePhoto();
      setMetrics(prev => ({ ...prev, photosTaken: prev.photosTaken + 1 }));
      
      const el = document.getElementById("photo-flash");
      if (el) {
        el.style.opacity = "1";
        setTimeout(() => el.style.opacity = "0", 150);
      }
    }
  };

  const exportPDF = async () => {
    let captures = [];
    try {
      captures = JSON.parse(localStorage.getItem('audit_captures') || '[]');
    } catch (e) {}

    await generateUniversalPDF({
      moduleType: "HOTEL",
      siteName,
      auditorName,
      staffList,
      captures,
      metrics: {
        negative: [
          { label: 'Cash Upgrade Leak', count: metrics.cashUpgradeLeak.length, events: metrics.cashUpgradeLeak },
          { label: 'ID/Immigration Fail', count: metrics.idComplianceFail.length, events: metrics.idComplianceFail },
          { label: 'Guest Data Exposure', count: metrics.guestDataExposure.length, events: metrics.guestDataExposure },
          { label: 'Deep-Clean Oversight', count: metrics.deepCleanOversight.length, events: metrics.deepCleanOversight },
          { label: 'Amenities Malfunction', count: metrics.amenitiesMalfunction.length, events: metrics.amenitiesMalfunction },
          { label: 'Unattended Desk', count: metrics.unattendedDesk.length, events: metrics.unattendedDesk },
        ],
        positive: [
          { label: 'Loyalty Program Push', count: metrics.loyaltyPush.length, events: metrics.loyaltyPush },
          { label: 'Preemptive Concierge', count: metrics.preemptiveConcierge.length, events: metrics.preemptiveConcierge },
          { label: 'Express Departure', count: metrics.expressDeparture.length, events: metrics.expressDeparture },
        ],
        timers: [
          { label: 'Check-In Duration', events: metrics.checkInDuration },
          { label: 'Room Latency', events: metrics.roomLatency },
        ]
      }
    });
  };

  if (isPanicked) {
    return (
      <div 
        className="fixed inset-0 z-[99999] bg-white text-black font-sans flex flex-col h-screen w-screen overflow-hidden cursor-default"
        onClick={() => setIsPanicked(false)}
      >
        <div className="bg-[#f8f9fa] border-b border-gray-200" onClick={(e) => e.stopPropagation()}>
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
            <div className="flex items-center w-full h-12 rounded-full border border-gray-200 px-4">
              <svg focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4 text-gray-400">
                <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill="currentColor"></path>
              </svg>
              <input type="text" className="flex-1 h-full outline-none px-4" />
            </div>
            <div className="flex justify-center gap-3 mt-6">
              <button className="bg-[#f8f9fa] border border-[#f8f9fa] text-sm text-[#3c4043] h-9 px-4 rounded">Google Search</button>
              <button className="bg-[#f8f9fa] border border-[#f8f9fa] text-sm text-[#3c4043] h-9 px-4 rounded">I'm Feeling Lucky</button>
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
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          <div className="text-center text-xs text-gray-500 my-4">Today {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
          {staffList.filter(s => s !== 'General / Unknown').map((s, i) => (
             <div key={s} className="flex justify-end">
               <div className="bg-[#0a84ff] text-white rounded-2xl rounded-tr-sm px-4 py-2 max-w-[75%] text-[15px]">
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
      
      <div className="sticky top-0 z-50 mb-6 -mx-4 -mt-4 bg-slate-950/90 backdrop-blur border-b border-slate-900">
        <div className="flex items-center justify-between">
          <div className="pl-4 py-3">
            <Link href="/audit" className="text-slate-600 hover:text-slate-400 transition-colors block p-2 -ml-2">
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
          
          <div className="pr-4 flex items-center">
            <button 
              onClick={triggerPhotoCapture}
              className="w-10 h-10 rounded-full border-2 border-slate-700 bg-slate-800 flex items-center justify-center overflow-hidden hover:border-slate-500 transition-colors shadow-[0_0_15px_rgba(0,0,0,0.5)]"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden opacity-50">
                <BarStealthCamera ref={cameraRef} />
              </div>
            </button>
          </div>
        </div>
      </div>

      <header className="mb-6 space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Hotel Audit</h1>
          <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">📸 {metrics.photosTaken}</span>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase text-slate-400 mb-1">Site Name</label>
            <input 
              type="text" 
              value={siteName}
              onChange={e => setSiteName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm"
              placeholder="E.g. The Grand Hotel"
            />
          </div>
          <div>
            <label className="block text-xs uppercase text-slate-400 mb-1">Auditor Name</label>
            <input 
              type="text" 
              value={auditorName}
              onChange={e => setAuditorName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm"
            />
          </div>
        </div>
      </header>

      <div className="space-y-6">
        <section className="bg-[#1c1c1e] border border-slate-800 rounded-2xl overflow-hidden shadow-lg mt-4">
          <div className="bg-[#2c2c2e]/90 backdrop-blur px-4 py-3 border-b border-slate-700 flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-500 rounded-full flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
              <svg className="w-8 h-8 text-slate-300 mt-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg>
            </div>
            <div className="flex flex-col flex-1 overflow-hidden">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mb-0.5">Tracking Target (Staff / Area)</span>
              <span className="text-sm font-bold text-white leading-tight truncate">{activeStaff}</span>
            </div>
          </div>
          
          <div className="p-4 space-y-4">
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
          </div>
        </section>

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
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => addEvent('cashUpgradeLeak', 'Cash Upgrade Leak')} className="bg-slate-800 hover:bg-slate-700 border border-slate-700 p-4 rounded flex flex-col items-center justify-center gap-2 transition-colors">
                <span className="text-2xl">💷</span>
                <span className="text-[11px] font-semibold text-slate-300 text-center leading-tight">Cash Upgrade Leak</span>
                <span className="text-[10px] text-red-400 font-bold">{metrics.cashUpgradeLeak.length}</span>
              </button>
              <button onClick={() => addEvent('idComplianceFail', 'ID/Immigration Fail')} className="bg-slate-800 hover:bg-slate-700 border border-slate-700 p-4 rounded flex flex-col items-center justify-center gap-2 transition-colors">
                <span className="text-2xl">🛂</span>
                <span className="text-[11px] font-semibold text-slate-300 text-center leading-tight">ID Compliance Fail</span>
                <span className="text-[10px] text-red-400 font-bold">{metrics.idComplianceFail.length}</span>
              </button>
              <button onClick={() => addEvent('guestDataExposure', 'Guest Data Exposure')} className="bg-slate-800 hover:bg-slate-700 border border-slate-700 p-4 rounded flex flex-col items-center justify-center gap-2 transition-colors">
                <span className="text-2xl">📑</span>
                <span className="text-[11px] font-semibold text-slate-300 text-center leading-tight">Guest Data Exposure</span>
                <span className="text-[10px] text-red-400 font-bold">{metrics.guestDataExposure.length}</span>
              </button>
              <button onClick={() => addEvent('deepCleanOversight', 'Deep-Clean Oversight')} className="bg-slate-800 hover:bg-slate-700 border border-slate-700 p-4 rounded flex flex-col items-center justify-center gap-2 transition-colors">
                <span className="text-2xl">🧹</span>
                <span className="text-[11px] font-semibold text-slate-300 text-center leading-tight">Deep-Clean Oversight</span>
                <span className="text-[10px] text-red-400 font-bold">{metrics.deepCleanOversight.length}</span>
              </button>
              <button onClick={() => addEvent('amenitiesMalfunction', 'Amenities Malfunction')} className="bg-slate-800 hover:bg-slate-700 border border-slate-700 p-4 rounded flex flex-col items-center justify-center gap-2 transition-colors">
                <span className="text-2xl">🛏️</span>
                <span className="text-[11px] font-semibold text-slate-300 text-center leading-tight">Amenities Malfunction</span>
                <span className="text-[10px] text-red-400 font-bold">{metrics.amenitiesMalfunction.length}</span>
              </button>
              <button onClick={() => addEvent('unattendedDesk', 'Unattended Desk')} className="bg-slate-800 hover:bg-slate-700 border border-slate-700 p-4 rounded flex flex-col items-center justify-center gap-2 transition-colors">
                <span className="text-2xl">🛎️</span>
                <span className="text-[11px] font-semibold text-slate-300 text-center leading-tight">Unattended Desk</span>
                <span className="text-[10px] text-red-400 font-bold">{metrics.unattendedDesk.length}</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button onClick={() => addEvent('loyaltyPush', 'Loyalty Push')} className="bg-emerald-900/20 hover:bg-emerald-800/40 border border-emerald-700/50 p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-colors">
                <span className="text-2xl">🌟</span>
                <span className="text-xs font-semibold text-emerald-100 text-center">Loyalty Program Push</span>
                <span className="text-[10px] font-bold text-emerald-400 px-2 py-0.5 bg-emerald-950 rounded-full">{metrics.loyaltyPush.length}</span>
              </button>
              <button onClick={() => addEvent('preemptiveConcierge', 'Preemptive Concierge')} className="bg-emerald-900/20 hover:bg-emerald-800/40 border border-emerald-700/50 p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-colors">
                <span className="text-2xl">🤵</span>
                <span className="text-xs font-semibold text-emerald-100 text-center">Preemptive Concierge</span>
                <span className="text-[10px] font-bold text-emerald-400 px-2 py-0.5 bg-emerald-950 rounded-full">{metrics.preemptiveConcierge.length}</span>
              </button>
              <button onClick={() => addEvent('expressDeparture', 'Express Departure')} className="bg-emerald-900/20 hover:bg-emerald-800/40 border border-emerald-700/50 p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-colors">
                <span className="text-2xl">🏃</span>
                <span className="text-xs font-semibold text-emerald-100 text-center">Express Departure</span>
                <span className="text-[10px] font-bold text-emerald-400 px-2 py-0.5 bg-emerald-950 rounded-full">{metrics.expressDeparture.length}</span>
              </button>
            </div>
          )}
        </section>

        <section>
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Service Timers</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-800 border border-slate-700 p-3 rounded-xl flex flex-col items-center gap-2">
              <span className="text-xs font-semibold text-slate-300">Check-In Velocity</span>
              {checkInTimerStart ? (
                <button 
                  onClick={() => {
                    const dur = Math.round((Date.now() - checkInTimerStart) / 1000);
                    setMetrics(p => ({ ...p, checkInDuration: [...p.checkInDuration, { timestamp: new Date().toISOString(), duration: dur, staff: activeStaff }] }));
                    setCheckInTimerStart(null);
                  }}
                  className="w-full bg-red-600/20 text-red-400 border border-red-500/30 py-2 rounded font-bold text-xs animate-pulse"
                >
                  STOP
                </button>
              ) : (
                <button 
                  onClick={() => setCheckInTimerStart(Date.now())}
                  className="w-full bg-slate-700 hover:bg-slate-600 text-white py-2 rounded font-bold text-xs"
                >
                  START
                </button>
              )}
              <span className="text-[10px] text-slate-500">{metrics.checkInDuration.length} logged</span>
            </div>
            
            <div className="bg-slate-800 border border-slate-700 p-3 rounded-xl flex flex-col items-center gap-2">
              <span className="text-xs font-semibold text-slate-300">Room Latency</span>
              {roomTimerStart ? (
                <button 
                  onClick={() => {
                    const dur = Math.round((Date.now() - roomTimerStart) / 1000);
                    setMetrics(p => ({ ...p, roomLatency: [...p.roomLatency, { timestamp: new Date().toISOString(), duration: dur, staff: activeStaff }] }));
                    setRoomTimerStart(null);
                  }}
                  className="w-full bg-red-600/20 text-red-400 border border-red-500/30 py-2 rounded font-bold text-xs animate-pulse"
                >
                  STOP
                </button>
              ) : (
                <button 
                  onClick={() => setRoomTimerStart(Date.now())}
                  className="w-full bg-slate-700 hover:bg-slate-600 text-white py-2 rounded font-bold text-xs"
                >
                  START
                </button>
              )}
              <span className="text-[10px] text-slate-500">{metrics.roomLatency.length} logged</span>
            </div>
          </div>
        </section>

        <section className="pt-4">
          <button 
            onClick={exportPDF}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-900/20 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            End Audit & Export PDF
          </button>
        </section>
      </div>
    </div>
  );
}
