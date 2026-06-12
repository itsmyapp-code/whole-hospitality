"use client";

import React, { useState, useRef, useEffect } from "react";
import BarStealthCamera, { BarStealthCameraRef } from "./BarStealthCamera";

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
  
  // Audit Metrics State
  const [metrics, setMetrics] = useState({
    freePours: 0,
    incorrectMeasures: 0,
    noRingIns: 0,
    chargeDiscrepancies: 0,
    timeToGreetSecs: [] as number[],
    timeToServeSecs: [] as number[],
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
      if (navTapCount >= 2) { // 3 taps (0, 1, 2)
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

  // Triggers
  const logFreePour = () => {
    setMetrics(prev => ({ ...prev, freePours: prev.freePours + 1 }));
  };

  const logIncorrectMeasure = (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent bubbling to other elements
    setMetrics(prev => ({ ...prev, incorrectMeasures: prev.incorrectMeasures + 1 }));
  };

  const logNoRingIn = () => {
    setMetrics(prev => ({ ...prev, noRingIns: prev.noRingIns + 1 }));
  };

  const logChargeDiscrepancy = () => {
    setMetrics(prev => ({ ...prev, chargeDiscrepancies: prev.chargeDiscrepancies + 1 }));
  };

  const toggleGreetTimer = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (greetTimerStart) {
      const elapsed = Math.round((Date.now() - greetTimerStart) / 1000);
      setMetrics(prev => ({ ...prev, timeToGreetSecs: [...prev.timeToGreetSecs, elapsed] }));
      setGreetTimerStart(null);
    } else {
      setGreetTimerStart(Date.now());
    }
  };

  const toggleServeTimer = () => {
    if (serveTimerStart) {
      const elapsed = Math.round((Date.now() - serveTimerStart) / 1000);
      setMetrics(prev => ({ ...prev, timeToServeSecs: [...prev.timeToServeSecs, elapsed] }));
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
          className="mt-12 text-xs text-white opacity-10" // highly hidden un-panic button
        >
          reset
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-400 font-sans selection:bg-neutral-800">
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
          {/* Mock Refresh Icon -> Toggles Greet Timer */}
          <button onClick={toggleGreetTimer} className="p-2 opacity-50 active:opacity-100 transition-opacity">
            <svg className={`w-4 h-4 ${greetTimerStart ? 'text-blue-500' : 'text-neutral-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          
          {/* Stealth Camera wrapped to look like a profile/avatar */}
          <div onClick={triggerCamera} className="active:scale-95 transition-transform">
            <BarStealthCamera ref={cameraRef} />
          </div>
        </div>
      </nav>

      <main className="p-4 space-y-6">
        {/* Author/Date Header -> Toggles Serve Timer */}
        <div onClick={toggleServeTimer} className="flex items-center gap-2 cursor-default opacity-60 active:opacity-100">
          <div className={`w-2 h-2 rounded-full ${serveTimerStart ? 'bg-red-900' : 'bg-neutral-800'}`}></div>
          <span className="text-xs uppercase tracking-wider">By J. Doe • {new Date().toLocaleDateString()}</span>
        </div>

        {/* First Section -> Free Pouring */}
        <div 
          onClick={logFreePour} 
          className="text-lg leading-relaxed text-neutral-300 cursor-default active:bg-neutral-900 rounded p-1 transition-colors -mx-1"
        >
          <p>Early reports indicate a shift in the local economic landscape as new businesses register in the city center.</p>
        </div>

        {/* Article Rows */}
        <div className="space-y-4 pt-4 border-t border-neutral-900">
          {MOCK_ARTICLE.map((item, index) => (
            <div 
              key={item.id}
              className="flex items-start gap-3 p-2 -mx-2 rounded cursor-default active:bg-neutral-900 transition-colors"
              onDoubleClick={logChargeDiscrepancy} // Double tap -> Charge Discrepancy
              onTouchStart={handleTouchStart} // Long press -> No Ring-In
              onTouchEnd={handleTouchEnd}
              onMouseDown={handleTouchStart} // For desktop testing
              onMouseUp={handleTouchEnd}
              onMouseLeave={handleTouchEnd}
            >
              <div className="text-xs text-neutral-600 font-mono mt-1 w-8 flex-shrink-0">
                19:{String(45 + index).padStart(2, '0')}
              </div>
              <div className="flex-1">
                <p className="text-sm leading-relaxed">{item.text}</p>
                
                {/* Share/Like Icon -> Incorrect Measure Size */}
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
        className="fixed bottom-0 left-0 w-full h-12 bg-transparent"
      />

      {/* Debug Panel */}
      {showDebug && (
        <div className="fixed inset-0 bg-black/90 z-50 p-6 overflow-y-auto text-green-500 font-mono text-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Audit Session Data</h2>
            <button onClick={() => setShowDebug(false)} className="px-3 py-1 bg-green-900 text-green-400 rounded">Close</button>
          </div>
          
          <div className="space-y-4">
            <div className="border border-green-900 p-4 rounded">
              <h3 className="uppercase text-green-700 mb-2">Metrics</h3>
              <ul className="space-y-2">
                <li>Free Pours (First Sec Tap): {metrics.freePours}</li>
                <li>Incorrect Measures (Share Tap): {metrics.incorrectMeasures}</li>
                <li>No Ring-Ins (Long Press): {metrics.noRingIns}</li>
                <li>Charge Discrepancies (Double Tap): {metrics.chargeDiscrepancies}</li>
                <li>Photos Taken (Avatar Tap): {metrics.photosTaken}</li>
              </ul>
            </div>

            <div className="border border-green-900 p-4 rounded">
              <h3 className="uppercase text-green-700 mb-2">Timers</h3>
              <div>
                <p>Greet Times (s): {metrics.timeToGreetSecs.length > 0 ? metrics.timeToGreetSecs.join(", ") : "None"}</p>
                <p>Serve Times (s): {metrics.timeToServeSecs.length > 0 ? metrics.timeToServeSecs.join(", ") : "None"}</p>
              </div>
            </div>

            <div className="border border-green-900 p-4 rounded">
              <h3 className="uppercase text-green-700 mb-2 flex justify-between">
                <span>Local Storage Images</span>
                <button 
                  onClick={() => { localStorage.removeItem('audit_captures'); setMetrics(m => ({...m, photosTaken: 0}))}}
                  className="text-xs bg-red-900/30 text-red-500 px-2 rounded"
                >
                  Clear
                </button>
              </h3>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {(() => {
                  try {
                    const saved = JSON.parse(localStorage.getItem('audit_captures') || '[]');
                    if (saved.length === 0) return <p className="text-green-800 text-xs col-span-2">No captures saved.</p>;
                    return saved.map((item: any, i: number) => (
                      <div key={i} className="relative">
                        <img src={item.dataUrl} alt={`Capture ${i}`} className="w-full rounded border border-green-900" />
                        <span className="absolute bottom-1 left-1 text-[8px] bg-black/50 px-1">{item.timestamp}</span>
                      </div>
                    ));
                  } catch (e) {
                    return <p className="text-red-500 text-xs">Error reading captures.</p>;
                  }
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
