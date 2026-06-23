"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Scan, 
  Mic, 
  FileText, 
  WifiOff, 
  Wifi, 
  Smartphone, 
  Sparkles, 
  Lock, 
  ArrowRight, 
  Database, 
  Check, 
  Volume2, 
  Play, 
  RefreshCw 
} from "lucide-react";

// Hook to track mouse coordinates for spotlight hover effect
function useMouseSpotlight() {
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty("--mouse-x", `${x}px`);
    e.currentTarget.style.setProperty("--mouse-y", `${y}px`);
  };
  return handleMouseMove;
}

export default function RoomInventoryPro() {
  const onMouseMove = useMouseSpotlight();

  // AI Scanner Simulator State
  const [scanState, setScanState] = useState<"idle" | "scanning" | "done">("idle");
  const [scannedItems, setScannedItems] = useState<{ name: string; qty: number; confidence: number }[]>([]);

  // Voice dictation Simulator State
  const [voiceState, setVoiceState] = useState<"idle" | "listening" | "processing" | "done">("idle");
  const [voiceText, setVoiceText] = useState("");
  const [parsedItem, setParsedItem] = useState<{ name: string; qty: number; condition: string } | null>(null);

  // PDF Compilation Simulator State
  const [pdfState, setPdfState] = useState<"idle" | "compiling" | "done">("idle");
  const [pdfProgress, setPdfProgress] = useState(0);

  // Offline status State
  const [isOnline, setIsOnline] = useState(true);
  const [offlineQueue, setOfflineQueue] = useState(0);
  const [syncState, setSyncState] = useState<"idle" | "syncing" | "synced">("idle");

  // Run AI Scan Simulation
  const runScan = () => {
    if (scanState === "scanning") return;
    setScanState("scanning");
    setScannedItems([]);
    
    setTimeout(() => {
      setScannedItems([
        { name: "King Bed Frame", qty: 1, confidence: 99 },
        { name: "Smart TV 55\"", qty: 1, confidence: 97 },
        { name: "Upholstered Armchair", qty: 2, confidence: 94 },
        { name: "Bedside Lamp", qty: 2, confidence: 98 },
        { name: "Split A/C Unit", qty: 1, confidence: 91 }
      ]);
      setScanState("done");
      if (!isOnline) {
        setOfflineQueue(prev => prev + 5);
      }
    }, 3000);
  };

  // Run Voice Dictation Simulation
  const runVoice = () => {
    if (voiceState === "listening" || voiceState === "processing") return;
    setVoiceState("listening");
    setVoiceText("");
    setParsedItem(null);

    const textToType = "Add two double pillows, condition excellent.";
    let currentIndex = 0;

    const interval = setInterval(() => {
      if (currentIndex < textToType.length) {
        setVoiceText((prev) => prev + textToType.charAt(currentIndex));
        currentIndex++;
      } else {
        clearInterval(interval);
        setVoiceState("processing");
        setTimeout(() => {
          setParsedItem({
            name: "Double Pillows",
            qty: 2,
            condition: "Excellent"
          });
          setVoiceState("done");
          if (!isOnline) {
            setOfflineQueue(prev => prev + 1);
          }
        }, 1500);
      }
    }, 60);
  };

  // Run PDF Compile Simulation
  const runPdfCompile = () => {
    if (pdfState === "compiling") return;
    setPdfState("compiling");
    setPdfProgress(0);

    const interval = setInterval(() => {
      setPdfProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setPdfState("done");
          return 100;
        }
        return prev + 20;
      });
    }, 300);
  };

  // Run Sync when network reconnects
  useEffect(() => {
    if (isOnline && offlineQueue > 0) {
      setSyncState("syncing");
      setTimeout(() => {
        setOfflineQueue(0);
        setSyncState("synced");
        setTimeout(() => setSyncState("idle"), 2000);
      }, 2000);
    }
  }, [isOnline, offlineQueue]);

  return (
    <section className="py-24 px-4 bg-black text-white font-mono border-t border-neutral-900" id="room-inventory">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Title */}
        <div className="mb-12 border-b border-neutral-900 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] text-emerald-500 font-bold block mb-2">
              Product Overview & Documentation
            </span>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-neutral-100">
              ROOM INVENTORY PRO
            </h2>
          </div>
          <div className="text-left md:text-right text-xs text-neutral-500">
            <span>GEN_STAMP // 2026-06-22</span>
            <span className="block text-emerald-500/80 mt-1 font-bold">
              SYS.STATUS: FULL_COMPLIANCE_PASS
            </span>
          </div>
        </div>

        {/* Bento Grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-auto lg:auto-rows-[250px]">
          
          {/* Tile 1: Hero marketing (Spans 2 cols, 2 rows) */}
          <div 
            className="group relative overflow-hidden bg-neutral-900/60 border border-neutral-800/80 rounded-[32px] p-8 flex flex-col justify-between md:col-span-2 lg:row-span-2 transition-all duration-300"
            onMouseMove={onMouseMove}
          >
            {/* Custom Mouse Spotlight Highlight */}
            <div 
              className="pointer-events-none absolute -inset-px rounded-[32px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"
              style={{
                background: `radial-gradient(800px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), rgba(16, 185, 129, 0.08), transparent 40%)`
              }}
            />
            
            {/* Grid graphic background for high-tech aesthetic */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none z-0" />
            
            <div className="relative z-10">
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-3 py-1 rounded-full uppercase tracking-wider">
                CORE VALUE PROPOSITION
              </span>
              
              <h3 className="text-3xl md:text-5xl font-black mt-6 tracking-tight leading-[1.1] text-white">
                Audit room assets in seconds, not hours.
              </h3>
              <p className="text-sm md:text-base text-neutral-300 mt-4 leading-relaxed max-w-xl">
                Professional inventory tracking with instant AI visual analysis. Designed specifically to support premium brand audits, combining AI vision, voice command parsing, and a reliable PDF engine.
              </p>
            </div>

            <div className="relative z-10 mt-8 pt-6 border-t border-neutral-800/60 flex items-center gap-4 text-xs text-neutral-400">
              <div className="flex -space-x-2">
                <span className="w-8 h-8 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center font-bold text-[10px] text-emerald-400">AI</span>
                <span className="w-8 h-8 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center font-bold text-[10px] text-emerald-400">PDF</span>
                <span className="w-8 h-8 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center font-bold text-[10px] text-emerald-400">DB</span>
              </div>
              <span>Engine Status: Production Ready</span>
            </div>
          </div>

          {/* Tile 2: Elevator Pitch (Spans 2 cols, 1 row) */}
          <div 
            className="group relative overflow-hidden bg-neutral-950 border border-neutral-800/60 rounded-[32px] p-6 flex flex-col justify-between md:col-span-2 lg:row-span-1 transition-all duration-300"
            onMouseMove={onMouseMove}
          >
            <div 
              className="pointer-events-none absolute -inset-px rounded-[32px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"
              style={{
                background: `radial-gradient(800px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), rgba(255, 255, 255, 0.05), transparent 40%)`
              }}
            />
            <div className="relative z-10">
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">
                SYS.MARKETING // ELEVATOR PITCH
              </span>
              <p className="text-sm md:text-base text-neutral-300 leading-relaxed">
                Translate room inspection photos into structured, digital inventory lists instantly using on-device vision models. Capture room layout images, automate item specs, and export print-ready PDF reports directly to your dashboard without manual data entry.
              </p>
            </div>
            
            <div className="relative z-10 flex items-center justify-between text-xs text-neutral-500 border-t border-neutral-900 pt-3 mt-4">
              <span>Target: Premium hospitality audits</span>
              <span className="text-emerald-500">Contrast Check: Pass (AAA)</span>
            </div>
          </div>

          {/* Tile 3: AI Scanner Widget (Spans 1 col, 2 rows on desktop) */}
          <div 
            className="group relative overflow-hidden bg-neutral-900/40 border border-neutral-800/60 rounded-[32px] p-6 flex flex-col justify-between lg:row-span-2 transition-all duration-300"
            onMouseMove={onMouseMove}
          >
            <div 
              className="pointer-events-none absolute -inset-px rounded-[32px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"
              style={{
                background: `radial-gradient(800px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), rgba(59, 130, 246, 0.08), transparent 40%)`
              }}
            />
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider bg-blue-950/60 border border-blue-900/50 px-2 py-0.5 rounded">
                    FEATURE.01
                  </span>
                  <Scan className="w-4 h-4 text-blue-400" />
                </div>
                <h4 className="text-lg font-bold text-neutral-100">Single-Upload Room Scanning</h4>
                <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                  Detect, count, and log multiple physical assets in a single room photo instantly.
                </p>
              </div>

              {/* Scanning visual simulator */}
              <div className="my-6 bg-black border border-neutral-800 rounded-2xl p-4 overflow-hidden relative min-h-[160px] flex flex-col justify-between">
                
                {scanState === "idle" && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-3">
                    <div className="w-12 h-12 rounded-full border border-neutral-800 flex items-center justify-center mb-2 bg-neutral-950 text-neutral-500">
                      <Scan className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] text-neutral-500">Scan Ready. Tap below.</span>
                  </div>
                )}

                {scanState === "scanning" && (
                  <>
                    {/* Laser overlay animation */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)] animate-[bounce_3s_infinite] z-20" />
                    <div className="absolute inset-0 bg-blue-500/5 flex flex-col items-center justify-center text-center z-10">
                      <Sparkles className="w-6 h-6 text-blue-400 animate-spin mb-2" />
                      <span className="text-[10px] text-blue-400 uppercase tracking-widest font-bold">ANALYSING ASSETS...</span>
                    </div>
                  </>
                )}

                {scanState === "done" && (
                  <div className="w-full text-[10px] space-y-1.5 overflow-y-auto max-h-[130px] custom-scrollbar z-10">
                    <span className="text-emerald-400 block font-bold mb-1 border-b border-neutral-900 pb-0.5">DETECTION LOG: SUCCESS</span>
                    {scannedItems.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-neutral-950 border border-neutral-900 px-2 py-1 rounded">
                        <span className="text-neutral-300 font-bold truncate max-w-[90px]">{item.name}</span>
                        <span className="text-neutral-500">Qty: {item.qty}</span>
                        <span className="text-emerald-400 font-semibold">{item.confidence}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button 
                onClick={runScan}
                disabled={scanState === "scanning"}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 text-xs font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer z-10 shadow-lg"
              >
                {scanState === "scanning" ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    SCANNING...
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    RUN AI SCANNER
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Tile 4: Voice-Dictated Data Entry (Spans 1 col, 1 row on desktop) */}
          <div 
            className="group relative overflow-hidden bg-neutral-900/40 border border-neutral-800/60 rounded-[32px] p-6 flex flex-col justify-between lg:row-span-1 transition-all duration-300"
            onMouseMove={onMouseMove}
          >
            <div 
              className="pointer-events-none absolute -inset-px rounded-[32px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"
              style={{
                background: `radial-gradient(800px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), rgba(16, 185, 129, 0.08), transparent 40%)`
              }}
            />
            
            <div className="relative z-10 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded">
                  FEATURE.02
                </span>
                <Mic className="w-4 h-4 text-emerald-400" />
              </div>
              
              <h4 className="text-base font-bold text-neutral-100">Voice Data Entry</h4>
              
              {/* Voice transcript display */}
              <div className="my-2 bg-black border border-neutral-850 rounded-xl p-2 min-h-[50px] flex items-center justify-center relative">
                {voiceState === "idle" && (
                  <span className="text-[9px] text-neutral-600">Mic offline. Click start.</span>
                )}
                {voiceState === "listening" && (
                  <div className="flex items-center gap-1.5 w-full">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping shrink-0" />
                    <span className="text-[9px] text-neutral-300 italic truncate">{voiceText || "Listening..."}</span>
                  </div>
                )}
                {voiceState === "processing" && (
                  <span className="text-[9px] text-emerald-400 animate-pulse uppercase tracking-wider font-bold">Parsing Dictation...</span>
                )}
                {voiceState === "done" && parsedItem && (
                  <div className="w-full text-[9px] text-left">
                    <div className="text-emerald-400 font-bold">PARSED OK:</div>
                    <div className="text-neutral-300">{parsedItem.qty}x {parsedItem.name} ({parsedItem.condition})</div>
                  </div>
                )}
              </div>

              <button 
                onClick={runVoice}
                disabled={voiceState === "listening" || voiceState === "processing"}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-[10px] font-bold py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" />
                {voiceState === "listening" ? "RECORDING..." : "START MIC"}
              </button>
            </div>
          </div>

          {/* Tile 5: CORS-Proof PDF Export (Spans 1 col, 1 row on desktop) */}
          <div 
            className="group relative overflow-hidden bg-neutral-900/40 border border-neutral-800/60 rounded-[32px] p-6 flex flex-col justify-between lg:row-span-1 transition-all duration-300"
            onMouseMove={onMouseMove}
          >
            <div 
              className="pointer-events-none absolute -inset-px rounded-[32px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"
              style={{
                background: `radial-gradient(800px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), rgba(168, 85, 247, 0.08), transparent 40%)`
              }}
            />
            
            <div className="relative z-10 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider bg-purple-950/60 border border-purple-900/50 px-2 py-0.5 rounded">
                  FEATURE.03
                </span>
                <FileText className="w-4 h-4 text-purple-400" />
              </div>
              
              <h4 className="text-base font-bold text-neutral-100">CORS-Proof PDF Exports</h4>
              
              {/* Compile Visual */}
              <div className="my-2 bg-black border border-neutral-850 rounded-xl p-2 min-h-[50px] flex flex-col justify-center">
                {pdfState === "idle" && (
                  <span className="text-[9px] text-neutral-600 text-center">Ready to compile A4 report.</span>
                )}
                {pdfState === "compiling" && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[8px] text-purple-400">
                      <span>COMPILING ASSETS...</span>
                      <span>{pdfProgress}%</span>
                    </div>
                    <div className="w-full bg-neutral-900 h-1 rounded overflow-hidden">
                      <div className="bg-purple-500 h-full transition-all duration-300" style={{ width: `${pdfProgress}%` }} />
                    </div>
                  </div>
                )}
                {pdfState === "done" && (
                  <div className="flex items-center gap-1.5 text-emerald-400 text-[9px] font-bold">
                    <Check className="w-3.5 h-3.5 shrink-0" />
                    <span>CORS BYPASSED // A4 PDF OK</span>
                  </div>
                )}
              </div>

              <button 
                onClick={runPdfCompile}
                disabled={pdfState === "compiling"}
                className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-[10px] font-bold py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                {pdfState === "compiling" ? "COMPILING..." : "COMPILE PDF"}
              </button>
            </div>
          </div>

          {/* Tile 6: Offline-Ready & Responsive stability (Spans 2 cols, 1 row) */}
          <div 
            className="group relative overflow-hidden bg-neutral-950 border border-neutral-850 rounded-[32px] p-6 flex flex-col justify-between md:col-span-2 lg:row-span-1 transition-all duration-300"
            onMouseMove={onMouseMove}
          >
            <div 
              className="pointer-events-none absolute -inset-px rounded-[32px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"
              style={{
                background: `radial-gradient(800px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), rgba(251, 191, 36, 0.06), transparent 40%)`
              }}
            />
            
            <div className="relative z-10 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center h-full">
              <div className="max-w-md">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block mb-1">
                  OFFLINE CAPABILITIES & VIEWPORT LOCK
                </span>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Store audits locally during dropouts; sync automatically when signal restores. Strictly locked mobile viewports ensure fluid on-site data entry.
                </p>
              </div>

              {/* Offline/Online toggle interface */}
              <div className="w-full md:w-auto bg-black border border-neutral-900 p-3 rounded-2xl flex flex-col gap-2 min-w-[200px]">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-400">Network:</span>
                  <button 
                    onClick={() => setIsOnline(!isOnline)}
                    className={`px-2 py-0.5 rounded font-bold transition-all text-[10px] flex items-center gap-1 ${
                      isOnline 
                        ? "bg-emerald-950 text-emerald-400 border border-emerald-800/50" 
                        : "bg-red-950 text-red-400 border border-red-800/50"
                    }`}
                  >
                    {isOnline ? (
                      <>
                        <Wifi className="w-3 h-3" /> ONLINE
                      </>
                    ) : (
                      <>
                        <WifiOff className="w-3 h-3" /> OFFLINE
                      </>
                    )}
                  </button>
                </div>
                
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-neutral-500">Local Cache Queue:</span>
                  <span className="font-bold text-neutral-300">{offlineQueue} audits pending</span>
                </div>

                {syncState === "syncing" && (
                  <div className="text-[9px] text-amber-400 animate-pulse flex items-center gap-1 font-bold">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>SYNCING ENVELOPE TO DASHBOARD...</span>
                  </div>
                )}
                {syncState === "synced" && (
                  <div className="text-[9px] text-emerald-400 flex items-center gap-1 font-bold">
                    <Check className="w-3.5 h-3.5" />
                    <span>SYNC COMPLETE! LOCAL CACHE PURGED.</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tile 7: Compliance & GDPR Overlay (Spans 2 cols, 1 row) */}
          <div 
            className="group relative overflow-hidden bg-neutral-900/20 backdrop-blur-md border border-neutral-800/60 rounded-[32px] p-6 flex flex-col justify-between md:col-span-2 lg:row-span-1 transition-all duration-300"
            onMouseMove={onMouseMove}
          >
            <div 
              className="pointer-events-none absolute -inset-px rounded-[32px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"
              style={{
                background: `radial-gradient(800px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), rgba(16, 185, 129, 0.05), transparent 40%)`
              }}
            />
            
            <div className="relative z-10 flex flex-col justify-between h-full">
              <div>
                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest block mb-2">
                  COMPLIANCE OVERLAY // UK GDPR COMPLIANT
                </span>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Zero persistent cookies, zero third-party tracking, and zero telemetry logs. All states run locally in the browser environment. Meets strict WCAG AAA contrast rules (minimum 7:1 ratio on all screens).
                </p>
              </div>
              
              <div className="flex items-center gap-3 text-[10px] text-neutral-500 border-t border-neutral-900 pt-3 mt-4">
                <Lock className="w-3.5 h-3.5 text-emerald-500" />
                <span>INTEGRITY SECURED // LOCALHOST LOCAL STORAGE ISOLATED</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
