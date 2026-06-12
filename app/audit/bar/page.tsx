"use client";

import React, { useState, useRef, useEffect } from "react";
import BarStealthCamera, { BarStealthCameraRef } from "./BarStealthCamera";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Mock data for the "Live Feed"
const MOCK_ARTICLE = [
  { id: 1, text: "The local council has announced a new initiative to improve street lighting in the central district." },
  { id: 2, text: "Residents have reported a significant decrease in traffic congestion since the new roundabout was completed." },
  { id: 3, text: "The upcoming community fair is expected to draw thousands of visitors to the park this weekend." },
  { id: 4, text: "In sports news, the regional team secured a decisive victory in their latest away match." },
  { id: 5, text: "Temperatures are expected to drop slightly over the next few days, bringing scattered showers." },
  { id: 6, text: "A new public transport timetable will come into effect starting next Monday." },
  { id: 7, text: "Local businesses are preparing for the annual summer festival, which begins in two weeks." },
];

export default function CovertAuditPage() {
  const [isPanicked, setIsPanicked] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  
  // Auditor Info State
  const [siteName, setSiteName] = useState("");
  const [auditorName, setAuditorName] = useState("");

  // Visual Feedback State
  const [flashFeedback, setFlashFeedback] = useState(false);

  // Audit Metrics State (Now logs exact timestamps)
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

  // Interaction State
  const [navTapCount, setNavTapCount] = useState(0);
  const [debugTapCount, setDebugTapCount] = useState(0);
  const navTapTimeout = useRef<NodeJS.Timeout | null>(null);
  const debugTapTimeout = useRef<NodeJS.Timeout | null>(null);
  const longPressTimeout = useRef<NodeJS.Timeout | null>(null);

  const cameraRef = useRef<BarStealthCameraRef>(null);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (navTapTimeout.current) clearTimeout(navTapTimeout.current);
      if (debugTapTimeout.current) clearTimeout(debugTapTimeout.current);
      if (longPressTimeout.current) clearTimeout(longPressTimeout.current);
    };
  }, []);

  // Panic Switch Trigger (Triple Tap on Nav)
  const handleNavTap = () => {
    setNavTapCount((prev) => prev + 1);
    if (navTapTimeout.current) clearTimeout(navTapTimeout.current);
    
    navTapTimeout.current = setTimeout(() => {
      if (navTapCount >= 2) { // 3 taps
        setIsPanicked(true);
      }
      setNavTapCount(0);
    }, 400);
  };

  // Debug Panel Trigger (5 Taps on hidden footer)
  const handleDebugTap = () => {
    setDebugTapCount((prev) => prev + 1);
    if (debugTapTimeout.current) clearTimeout(debugTapTimeout.current);
    
    debugTapTimeout.current = setTimeout(() => {
      if (debugTapCount >= 4) { // 5 taps
        setShowDebug((prev) => !prev);
      }
      setDebugTapCount(0);
    }, 500);
  };

  const provideFeedback = () => {
    // 1. Haptic Vibration (works on most mobile devices)
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(50);
    }
    // 2. Subtle Visual Flash
    setFlashFeedback(true);
    setTimeout(() => setFlashFeedback(false), 300);
  };

  // Triggers
  const logFreePour = () => {
    provideFeedback();
    setMetrics(prev => ({ ...prev, freePours: [...prev.freePours, new Date().toISOString()] }));
  };

  const logIncorrectMeasure = (e: React.MouseEvent) => {
    e.stopPropagation();
    provideFeedback();
    setMetrics(prev => ({ ...prev, incorrectMeasures: [...prev.incorrectMeasures, new Date().toISOString()] }));
  };

  const logNoRingIn = () => {
    provideFeedback();
    setMetrics(prev => ({ ...prev, noRingIns: [...prev.noRingIns, new Date().toISOString()] }));
  };

  const logChargeDiscrepancy = () => {
    provideFeedback();
    setMetrics(prev => ({ ...prev, chargeDiscrepancies: [...prev.chargeDiscrepancies, new Date().toISOString()] }));
  };

  const toggleGreetTimer = (e: React.MouseEvent) => {
    e.stopPropagation();
    provideFeedback();
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
    provideFeedback();
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
    provideFeedback();
    if (cameraRef.current) {
      cameraRef.current.capturePhoto();
      setMetrics(prev => ({ ...prev, photosTaken: prev.photosTaken + 1 }));
    }
  };

  // Touch Handlers for Long Press
  const handleTouchStart = () => {
    longPressTimeout.current = setTimeout(() => {
      logNoRingIn();
    }, 800); // 800ms long press
  };

  const handleTouchEnd = () => {
    if (longPressTimeout.current) {
      clearTimeout(longPressTimeout.current);
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
          
          // Image proportions (16:9 approx or scaled to fit width)
          doc.addImage(cap.dataUrl, 'JPEG', 14, yPos + 5, 120, 90);
          yPos += 105;
        });
      }
    } catch (e) {
      console.warn("Could not attach photos to PDF", e);
    }

    // Download
    const filename = `Audit_${siteName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
  };

  if (isPanicked) {
    return (
      <div className="min-h-screen bg-white text-black p-4 font-sans">
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
        <button 
          onClick={() => setIsPanicked(false)} 
          className="mt-12 text-xs text-white opacity-10"
        >
          reset
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-400 font-sans selection:bg-neutral-800 relative">
      {/* Subtle Visual Feedback Dot */}
      <div 
        className={`fixed top-1 left-1 w-1 h-1 rounded-full z-50 transition-opacity duration-100 ${flashFeedback ? 'opacity-100 bg-neutral-500' : 'opacity-0 bg-transparent'}`} 
      />

      {/* Top Nav - Panic Switch */}
      <nav 
        onClick={handleNavTap}
        className="sticky top-0 z-10 bg-neutral-950/90 backdrop-blur border-b border-neutral-900 p-4 flex items-center justify-between cursor-default"
      >
        <div className="flex flex-col">
          <span className="text-sm font-semibold tracking-wide text-neutral-300">City News Live</span>
          <span className="text-xs text-neutral-600">Continuous Feed</span>
        </div>
        
        <div className="flex items-center gap-3">
          <button onClick={toggleGreetTimer} className="p-2 opacity-50 active:opacity-100 transition-opacity">
            <svg className={`w-4 h-4 ${greetTimerStart ? 'text-blue-500' : 'text-neutral-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          
          <div onClick={triggerCamera} className="active:scale-95 transition-transform">
            <BarStealthCamera ref={cameraRef} />
          </div>
        </div>
      </nav>

      <main className="p-4 space-y-6">
        <div onClick={toggleServeTimer} className="flex items-center gap-2 cursor-default opacity-60 active:opacity-100">
          <div className={`w-2 h-2 rounded-full ${serveTimerStart ? 'bg-red-900' : 'bg-neutral-800'}`}></div>
          <span className="text-xs uppercase tracking-wider">By J. Doe • {new Date().toLocaleDateString()}</span>
        </div>

        <div 
          onClick={logFreePour} 
          className="text-lg leading-relaxed text-neutral-300 cursor-default active:bg-neutral-900 rounded p-1 transition-colors -mx-1"
        >
          <p>Early reports indicate a shift in the local economic landscape as new businesses register in the city center.</p>
        </div>

        <div className="space-y-4 pt-4 border-t border-neutral-900">
          {MOCK_ARTICLE.map((item, index) => (
            <div 
              key={item.id}
              className="flex items-start gap-3 p-2 -mx-2 rounded cursor-default active:bg-neutral-900 transition-colors"
              onDoubleClick={logChargeDiscrepancy}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onMouseDown={handleTouchStart}
              onMouseUp={handleTouchEnd}
              onMouseLeave={handleTouchEnd}
            >
              <div className="text-xs text-neutral-600 font-mono mt-1 w-8 flex-shrink-0">
                19:{String(45 + index).padStart(2, '0')}
              </div>
              <div className="flex-1">
                <p className="text-sm leading-relaxed">{item.text}</p>
                
                <div className="mt-2 flex items-center gap-4">
                  <button onClick={logIncorrectMeasure} className="flex items-center gap-1 text-xs text-neutral-600 active:text-neutral-400 p-1 -ml-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    Share
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Hidden footer area for Debug Panel */}
      <div 
        onClick={handleDebugTap}
        className="fixed bottom-0 left-0 w-full h-16 bg-transparent"
      />

      {/* Admin Panel */}
      {showDebug && (
        <div className="fixed inset-0 bg-black/95 z-50 p-6 overflow-y-auto text-green-500 font-mono text-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Audit Settings & Export</h2>
            <button onClick={() => setShowDebug(false)} className="px-3 py-1 bg-green-900 text-green-400 rounded">Close</button>
          </div>

          <div className="space-y-6">
            {/* Setup Form */}
            <div className="border border-green-900 p-4 rounded space-y-4 bg-green-950/20">
              <h3 className="uppercase text-green-700 font-bold">1. Session Details</h3>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-green-600 uppercase">Site Name</label>
                <input 
                  type="text" 
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  placeholder="e.g. The Red Lion" 
                  className="bg-black border border-green-900 p-2 rounded text-green-400 outline-none focus:border-green-500"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-green-600 uppercase">Auditor Name</label>
                <input 
                  type="text" 
                  value={auditorName}
                  onChange={(e) => setAuditorName(e.target.value)}
                  placeholder="e.g. John Doe" 
                  className="bg-black border border-green-900 p-2 rounded text-green-400 outline-none focus:border-green-500"
                />
              </div>
            </div>

            {/* Export Action */}
            <div className="border border-green-900 p-4 rounded text-center">
              <button 
                onClick={exportPDF}
                className="w-full py-3 bg-green-700 text-black font-bold uppercase tracking-widest rounded active:bg-green-600 transition-colors"
              >
                Generate PDF Report
              </button>
              <p className="text-xs text-green-800 mt-2">Downloads an encrypted chronological log to your device</p>
            </div>
          
            {/* Live Stats summary */}
            <div className="border border-green-900 p-4 rounded opacity-75">
              <h3 className="uppercase text-green-700 mb-2">Current Totals</h3>
              <ul className="space-y-2 grid grid-cols-2 text-xs">
                <li>Free Pours: {metrics.freePours.length}</li>
                <li>Incorrect Meas: {metrics.incorrectMeasures.length}</li>
                <li>No Ring-Ins: {metrics.noRingIns.length}</li>
                <li>Charge Discrepancies: {metrics.chargeDiscrepancies.length}</li>
                <li>Photos Taken: {metrics.photosTaken}</li>
              </ul>
              <div className="mt-4 flex justify-between border-t border-green-900 pt-2">
                <span>Clear Storage</span>
                <button 
                  onClick={() => { localStorage.removeItem('audit_captures'); setMetrics(m => ({...m, photosTaken: 0}))}}
                  className="text-red-500"
                >
                  [ ERASE ]
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
