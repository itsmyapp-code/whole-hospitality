"use client";

import React, { useState, useRef, useEffect } from "react";
import BarStealthCamera, { BarStealthCameraRef } from "./BarStealthCamera";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function CovertAuditPage() {
  const [isPanicked, setIsPanicked] = useState(false);
  
  // Auditor Info State
  const [siteName, setSiteName] = useState("");
  const [auditorName, setAuditorName] = useState("");

  // Audit Metrics State
  const [metrics, setMetrics] = useState({
    freePours: [] as string[],
    incorrectMeasures: [] as string[],
    noRingIns: [] as string[],
    chargeDiscrepancies: [] as string[],
    timeToGreetSecs: [] as { timestamp: string, duration: number }[],
    timeToServeSecs: [] as { timestamp: string, duration: number }[],
    photosTaken: 0,
  });

  // Timers State
  const [greetTimerStart, setGreetTimerStart] = useState<number | null>(null);
  const [serveTimerStart, setServeTimerStart] = useState<number | null>(null);

  const cameraRef = useRef<BarStealthCameraRef>(null);

  // Triggers
  const logFreePour = () => {
    setMetrics(prev => ({ ...prev, freePours: [...prev.freePours, new Date().toISOString()] }));
  };

  const logIncorrectMeasure = () => {
    setMetrics(prev => ({ ...prev, incorrectMeasures: [...prev.incorrectMeasures, new Date().toISOString()] }));
  };

  const logNoRingIn = () => {
    setMetrics(prev => ({ ...prev, noRingIns: [...prev.noRingIns, new Date().toISOString()] }));
  };

  const logChargeDiscrepancy = () => {
    setMetrics(prev => ({ ...prev, chargeDiscrepancies: [...prev.chargeDiscrepancies, new Date().toISOString()] }));
  };

  const toggleGreetTimer = () => {
    if (greetTimerStart) {
      const elapsed = Math.round((Date.now() - greetTimerStart) / 1000);
      setMetrics(prev => ({ 
        ...prev, 
        timeToGreetSecs: [...prev.timeToGreetSecs, { timestamp: new Date().toISOString(), duration: elapsed }] 
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
        timeToServeSecs: [...prev.timeToServeSecs, { timestamp: new Date().toISOString(), duration: elapsed }] 
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

  // PDF Export Logic
  const exportPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // 1. Header
    doc.setFontSize(18);
    doc.text("Covert Bar Premises Audit Report", 14, 20);
    
    doc.setFontSize(11);
    doc.text(`Site Name: ${siteName || "Not Specified"}`, 14, 30);
    doc.text(`Auditor: ${auditorName || "Not Specified"}`, 14, 36);
    doc.text(`Date of Export: ${new Date().toLocaleString()}`, 14, 42);

    // 2. Summary Table
    doc.setFontSize(14);
    doc.text("Executive Summary", 14, 55);

    autoTable(doc, {
      startY: 60,
      head: [['Infraction Type', 'Total Incidents']],
      body: [
        ['Free Pouring', metrics.freePours.length],
        ['Incorrect Measure Size', metrics.incorrectMeasures.length],
        ['No Ring-In', metrics.noRingIns.length],
        ['Over/Under-charge Discrepancy', metrics.chargeDiscrepancies.length],
      ],
      theme: 'grid',
    });

    // 3. Chronological Event Log
    const events: { type: string; time: Date, detail?: string }[] = [];
    metrics.freePours.forEach(ts => events.push({ type: 'Free Pour', time: new Date(ts) }));
    metrics.incorrectMeasures.forEach(ts => events.push({ type: 'Incorrect Measure', time: new Date(ts) }));
    metrics.noRingIns.forEach(ts => events.push({ type: 'No Ring-In', time: new Date(ts) }));
    metrics.chargeDiscrepancies.forEach(ts => events.push({ type: 'Charge Discrepancy', time: new Date(ts) }));
    metrics.timeToGreetSecs.forEach(t => events.push({ type: 'Time to Greet', time: new Date(t.timestamp), detail: `${t.duration} seconds` }));
    metrics.timeToServeSecs.forEach(t => events.push({ type: 'Time to Serve', time: new Date(t.timestamp), detail: `${t.duration} seconds` }));

    // Sort chronologically
    events.sort((a, b) => a.time.getTime() - b.time.getTime());

    let finalY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.text("Chronological Event Log", 14, finalY);

    const logBody = events.map(e => [
      e.time.toLocaleTimeString([], { hour12: false }),
      e.type,
      e.detail || "-"
    ]);

    if (events.length > 0) {
      autoTable(doc, {
        startY: finalY + 5,
        head: [['Time', 'Event', 'Details']],
        body: logBody,
        theme: 'striped',
      });
      finalY = (doc as any).lastAutoTable.finalY + 15;
    } else {
      doc.setFontSize(10);
      doc.text("No events logged.", 14, finalY + 8);
      finalY += 15;
    }

    // 4. Photographic Evidence
    try {
      const captures = JSON.parse(localStorage.getItem('audit_captures') || '[]');
      if (captures.length > 0) {
        doc.addPage();
        doc.setFontSize(14);
        doc.text("Photographic Evidence", 14, 20);
        
        let yPos = 30;
        captures.forEach((cap: any, index: number) => {
          if (yPos > 240) {
            doc.addPage();
            yPos = 20;
          }
          doc.setFontSize(10);
          doc.text(`Evidence #${index + 1} - Captured: ${cap.timestamp}`, 14, yPos);
          
          doc.addImage(cap.dataUrl, 'JPEG', 14, yPos + 5, 120, 90);
          yPos += 105;
        });
      }
    } catch (e) {
      console.warn("Could not attach photos to PDF", e);
    }

    // Download
    const filename = `Audit_${siteName.replace(/\s+/g, '_') || 'Report'}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
  };

  if (isPanicked) {
    return (
      <div className="min-h-screen bg-white text-black p-4 font-sans" onClick={() => setIsPanicked(false)}>
        <header className="border-b pb-2 mb-4">
          <h1 className="text-xl font-bold">Local Weather & Transit</h1>
          <p className="text-sm text-gray-500">Updated: Just now</p>
        </header>
        <main className="space-y-4">
          <section>
            <h2 className="font-semibold mb-2">Today's Forecast</h2>
            <p>Cloudy with a chance of scattered showers in the afternoon. Highs of 14°C.</p>
          </section>
          <section>
            <h2 className="font-semibold mb-2">Bus Schedule Update</h2>
            <p>The 42A service is running approximately 5 minutes late due to roadworks on Main Street.</p>
          </section>
        </main>
        <div className="mt-12 text-xs text-center text-gray-200">
          (Tap anywhere to un-hide)
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans p-4 pb-20">
      
      {/* Panic Button */}
      <div className="sticky top-0 z-50 mb-6 -mx-4 -mt-4 p-4 bg-slate-900/90 backdrop-blur border-b border-slate-800">
        <button 
          onClick={() => setIsPanicked(true)}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-lg shadow-lg text-lg uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
          PANIC / HIDE SCREEN
        </button>
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
              className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white"
              placeholder="E.g. The Red Lion"
            />
          </div>
          <div>
            <label className="block text-xs uppercase text-slate-400 mb-1">Auditor Name</label>
            <input 
              type="text" 
              value={auditorName}
              onChange={e => setAuditorName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white"
              placeholder="E.g. John Doe"
            />
          </div>
        </div>
      </header>

      <div className="space-y-6">
        
        {/* Actions Grid */}
        <section>
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Log Infractions</h2>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={logFreePour} className="bg-slate-800 hover:bg-slate-700 border border-slate-700 p-4 rounded-xl flex flex-col items-center justify-center gap-2 active:scale-95 transition-all text-center">
              <span className="text-2xl">🥃</span>
              <span className="font-semibold text-sm">Free Pour</span>
              <span className="text-xs text-slate-400">{metrics.freePours.length} logged</span>
            </button>
            <button onClick={logIncorrectMeasure} className="bg-slate-800 hover:bg-slate-700 border border-slate-700 p-4 rounded-xl flex flex-col items-center justify-center gap-2 active:scale-95 transition-all text-center">
              <span className="text-2xl">⚖️</span>
              <span className="font-semibold text-sm">Wrong Measure</span>
              <span className="text-xs text-slate-400">{metrics.incorrectMeasures.length} logged</span>
            </button>
            <button onClick={logNoRingIn} className="bg-slate-800 hover:bg-slate-700 border border-slate-700 p-4 rounded-xl flex flex-col items-center justify-center gap-2 active:scale-95 transition-all text-center">
              <span className="text-2xl">💷</span>
              <span className="font-semibold text-sm">No Ring-In</span>
              <span className="text-xs text-slate-400">{metrics.noRingIns.length} logged</span>
            </button>
            <button onClick={logChargeDiscrepancy} className="bg-slate-800 hover:bg-slate-700 border border-slate-700 p-4 rounded-xl flex flex-col items-center justify-center gap-2 active:scale-95 transition-all text-center">
              <span className="text-2xl">📉</span>
              <span className="font-semibold text-sm">Over/Under Charge</span>
              <span className="text-xs text-slate-400">{metrics.chargeDiscrepancies.length} logged</span>
            </button>
          </div>
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
            {/* Hidden camera preview */}
            <div className="hidden">
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
        <section className="pt-4">
          <button 
            onClick={exportPDF}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-lg shadow-lg text-lg uppercase tracking-wider transition-colors"
          >
            End Audit & Export PDF
          </button>
        </section>

      </div>
    </div>
  );
}
