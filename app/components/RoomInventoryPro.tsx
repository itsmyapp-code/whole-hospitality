"use client";

import React, { useState, useEffect } from "react";
import { 
  Scan, 
  Mic, 
  FileText, 
  WifiOff, 
  Wifi, 
  Sparkles, 
  Lock, 
  Check, 
  Volume2, 
  Play, 
  RefreshCw,
  FileDown,
  Info
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
        { name: "King Size Bed", qty: 1, confidence: 99 },
        { name: "55\" Flat Screen TV", qty: 1, confidence: 98 },
        { name: "Upholstered Armchairs", qty: 2, confidence: 95 },
        { name: "Bedside Lamps", qty: 2, confidence: 99 },
        { name: "Wall AC Unit", qty: 1, confidence: 92 }
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
        return prev + 25;
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
    <section className="py-24 px-6 md:px-12 bg-slate-900 text-white font-sans border-t border-slate-800" id="room-inventory">
      <div className="max-w-7xl mx-auto">
        
        {/* Modern Header Section */}
        <div className="mb-16 border-b border-slate-800 pb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3 h-3" /> New Expansion Module
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white">
              Room Inventory Pro
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl">
              Technical & Marketing Documentation • Generated: 2026-06-22
            </p>
          </div>
          <div className="text-left md:text-right shrink-0">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wide">
              Compliance Checked
            </span>
          </div>
        </div>

        {/* Bento Grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Tile 1: Hero marketing (Spans 2 cols, 2 rows) */}
          <div 
            className="group relative overflow-hidden bg-slate-800/40 border border-slate-800/80 rounded-[32px] p-8 md:p-10 flex flex-col justify-between md:col-span-2 lg:row-span-2 transition-all duration-300 shadow-xl"
            onMouseMove={onMouseMove}
          >
            {/* Spotlight Glow Effect */}
            <div 
              className="pointer-events-none absolute -inset-px rounded-[32px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"
              style={{
                background: `radial-gradient(600px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), rgba(59, 130, 246, 0.15), transparent 45%)`
              }}
            />
            
            <div className="relative z-10 space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-blue-400">
                Core Value Proposition
              </span>
              
              <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
                Audit room assets in seconds, not hours.
              </h3>
              <p className="text-base md:text-lg text-slate-300 leading-relaxed">
                An advanced, mobile-first room inventory and asset audit platform designed for hospitality professionals. Built specifically to support on-site audits for premium brands like Whole Hospitality, the application combines AI-assisted vision analysis, voice command parsing, and a reliable PDF reporting engine.
              </p>
            </div>

            <div className="relative z-10 mt-8 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm text-slate-400">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>AI Vision & Voice Engines Online</span>
              </div>
              <span className="font-semibold text-white">UK English (Standard)</span>
            </div>
          </div>

          {/* Tile 2: Elevator Pitch (Spans 2 cols, 1 row) */}
          <div 
            className="group relative overflow-hidden bg-slate-950/40 border border-slate-850 rounded-[32px] p-8 flex flex-col justify-between md:col-span-2 lg:row-span-1 transition-all duration-300 shadow-lg"
            onMouseMove={onMouseMove}
          >
            <div 
              className="pointer-events-none absolute -inset-px rounded-[32px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"
              style={{
                background: `radial-gradient(600px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), rgba(99, 102, 241, 0.12), transparent 45%)`
              }}
            />
            <div className="relative z-10 space-y-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block">
                Elevator Pitch
              </span>
              <p className="text-base md:text-lg text-slate-300 leading-relaxed">
                Translate room inspection photos into structured, digital inventory lists instantly using on-device vision models. Capture room layout images, automate item specs, and export print-ready PDF reports directly to your hospitality dashboard without manual data entry.
              </p>
            </div>
          </div>

          {/* Tile 3: AI Scanner Simulator Widget (Spans 1 col, 2 rows) */}
          <div 
            className="group relative overflow-hidden bg-slate-800/20 border border-slate-800/60 rounded-[32px] p-8 flex flex-col justify-between lg:row-span-2 transition-all duration-300 shadow-md"
            onMouseMove={onMouseMove}
          >
            <div 
              className="pointer-events-none absolute -inset-px rounded-[32px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"
              style={{
                background: `radial-gradient(600px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), rgba(59, 130, 246, 0.15), transparent 45%)`
              }}
            />
            
            <div className="relative z-10 h-full flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded">
                    AI Room Scanning
                  </span>
                  <Scan className="w-5 h-5 text-blue-400" />
                </div>
                <h4 className="text-lg md:text-xl font-bold text-white">Single-Upload Scanning</h4>
                <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                  Process an entire room photo to detect, count, and log multiple physical assets in a single operation.
                </p>
              </div>

              {/* Scanning visual simulator */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 overflow-hidden relative min-h-[180px] flex flex-col justify-between">
                {scanState === "idle" && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                    <div className="w-14 h-14 rounded-2xl border border-slate-800 flex items-center justify-center mb-3 bg-slate-900 text-slate-400 shadow-inner">
                      <Scan className="w-6 h-6" />
                    </div>
                    <span className="text-xs text-slate-500 font-medium">Ready to analyze room</span>
                  </div>
                )}

                {scanState === "scanning" && (
                  <>
                    {/* Laser line scanner animation */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.9)] animate-[bounce_3s_infinite] z-20" />
                    <div className="absolute inset-0 bg-blue-500/5 flex flex-col items-center justify-center text-center z-10">
                      <Sparkles className="w-8 h-8 text-blue-400 animate-spin mb-3" />
                      <span className="text-xs text-blue-400 uppercase tracking-widest font-bold">Processing Vision Model...</span>
                    </div>
                  </>
                )}

                {scanState === "done" && (
                  <div className="w-full text-xs space-y-2 overflow-y-auto max-h-[140px] custom-scrollbar z-10">
                    <span className="text-emerald-400 font-bold block border-b border-slate-900 pb-1 mb-2">Detected Assets:</span>
                    {scannedItems.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-slate-900/80 border border-slate-850 px-3 py-1.5 rounded-lg text-slate-200">
                        <span className="font-semibold truncate max-w-[110px]">{item.name}</span>
                        <span className="text-slate-400 font-medium">Qty: {item.qty}</span>
                        <span className="text-emerald-400 font-bold">{item.confidence}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button 
                onClick={runScan}
                disabled={scanState === "scanning"}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-bold py-3.5 px-4 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-900/30"
              >
                {scanState === "scanning" ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Scanning Assets...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    Simulate Vision Scan
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Tile 4: Voice-Dictated Data Entry (Spans 1 col, 1 row) */}
          <div 
            className="group relative overflow-hidden bg-slate-800/20 border border-slate-800/60 rounded-[32px] p-8 flex flex-col justify-between lg:row-span-1 transition-all duration-300 shadow-md"
            onMouseMove={onMouseMove}
          >
            <div 
              className="pointer-events-none absolute -inset-px rounded-[32px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"
              style={{
                background: `radial-gradient(600px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), rgba(16, 185, 129, 0.15), transparent 45%)`
              }}
            />
            
            <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded">
                  Voice Dictation
                </span>
                <Mic className="w-5 h-5 text-emerald-400" />
              </div>
              
              <div>
                <h4 className="text-lg font-bold text-white">Hands-Free Entry</h4>
                <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                  Speak items, quantities, and condition statements directly into your browser.
                </p>
              </div>
              
              {/* Voice transcript display */}
              <div className="bg-slate-950/60 border border-slate-850 rounded-xl p-3 min-h-[60px] flex items-center justify-center relative">
                {voiceState === "idle" && (
                  <span className="text-xs text-slate-500">Microphone ready</span>
                )}
                {voiceState === "listening" && (
                  <div className="flex items-center gap-2.5 w-full">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping shrink-0" />
                    <span className="text-xs text-slate-200 italic truncate">"{voiceText || "Listening..."}"</span>
                  </div>
                )}
                {voiceState === "processing" && (
                  <span className="text-xs text-emerald-400 animate-pulse font-bold">Parsing Commands...</span>
                )}
                {voiceState === "done" && parsedItem && (
                  <div className="w-full text-xs text-left">
                    <div className="text-emerald-400 font-bold mb-0.5">Parsed Item:</div>
                    <div className="text-slate-200 font-medium">{parsedItem.qty}x {parsedItem.name} ({parsedItem.condition} Condition)</div>
                  </div>
                )}
              </div>

              <button 
                onClick={runVoice}
                disabled={voiceState === "listening" || voiceState === "processing"}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-900/20"
              >
                <Volume2 className="w-4 h-4" />
                {voiceState === "listening" ? "Listening..." : "Dictate Command"}
              </button>
            </div>
          </div>

          {/* Tile 5: CORS-Proof PDF Export (Spans 1 col, 1 row) */}
          <div 
            className="group relative overflow-hidden bg-slate-800/20 border border-slate-800/60 rounded-[32px] p-8 flex flex-col justify-between lg:row-span-1 transition-all duration-300 shadow-md"
            onMouseMove={onMouseMove}
          >
            <div 
              className="pointer-events-none absolute -inset-px rounded-[32px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"
              style={{
                background: `radial-gradient(600px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), rgba(168, 85, 247, 0.15), transparent 45%)`
              }}
            />
            
            <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded">
                  PDF Engine
                </span>
                <FileText className="w-5 h-5 text-purple-400" />
              </div>
              
              <div>
                <h4 className="text-lg font-bold text-white">CORS-Proof Exports</h4>
                <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                  Generate formatted, print-optimized A4 audit reports with embedded photos.
                </p>
              </div>
              
              {/* Compile Visual */}
              <div className="bg-slate-950/60 border border-slate-850 rounded-xl p-3 min-h-[60px] flex flex-col justify-center">
                {pdfState === "idle" && (
                  <span className="text-xs text-slate-500 text-center font-medium">Ready to compile</span>
                )}
                {pdfState === "compiling" && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-purple-400 font-semibold">
                      <span>Building Document...</span>
                      <span>{pdfProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-purple-500 h-full transition-all duration-300" style={{ width: `${pdfProgress}%` }} />
                    </div>
                  </div>
                )}
                {pdfState === "done" && (
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold justify-center">
                    <Check className="w-4 h-4 shrink-0" />
                    <span>A4 Audit PDF Created</span>
                  </div>
                )}
              </div>

              <button 
                onClick={runPdfCompile}
                disabled={pdfState === "compiling"}
                className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-60 text-white font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-purple-900/20"
              >
                <FileDown className="w-4 h-4" />
                {pdfState === "compiling" ? "Compiling..." : "Generate PDF"}
              </button>
            </div>
          </div>

          {/* Tile 6: Offline-Ready & Responsive stability (Spans 2 cols, 1 row) */}
          <div 
            className="group relative overflow-hidden bg-slate-950/40 border border-slate-850 rounded-[32px] p-8 flex flex-col justify-between md:col-span-2 lg:row-span-1 transition-all duration-300 shadow-md"
            onMouseMove={onMouseMove}
          >
            <div 
              className="pointer-events-none absolute -inset-px rounded-[32px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"
              style={{
                background: `radial-gradient(600px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), rgba(245, 158, 11, 0.1), transparent 45%)`
              }}
            />
            
            <div className="relative z-10 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center h-full">
              <div className="space-y-2 max-w-md">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block">
                  Offline Sync & Viewport Stability
                </span>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Store audit data locally during network dropouts and sync automatically once your connection is restored. Audits remain fluid on mobile screens with strict viewport locked scales.
                </p>
              </div>

              {/* Offline/Online toggle interface */}
              <div className="w-full md:w-auto bg-slate-900/60 border border-slate-800 p-4 rounded-2xl flex flex-col gap-3 min-w-[220px]">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400 font-medium">Network Link:</span>
                  <button 
                    onClick={() => setIsOnline(!isOnline)}
                    className={`px-3 py-1 rounded-full font-bold transition-all text-xs flex items-center gap-1.5 cursor-pointer ${
                      isOnline 
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                        : "bg-red-500/10 text-red-400 border border-red-500/20"
                    }`}
                  >
                    {isOnline ? (
                      <>
                        <Wifi className="w-3.5 h-3.5" /> ONLINE
                      </>
                    ) : (
                      <>
                        <WifiOff className="w-3.5 h-3.5" /> OFFLINE
                      </>
                    )}
                  </button>
                </div>
                
                <div className="flex items-center justify-between text-xs border-t border-slate-850 pt-2 text-slate-400">
                  <span>Pending Sync:</span>
                  <span className="font-bold text-white">{offlineQueue} items queued</span>
                </div>

                {syncState === "syncing" && (
                  <div className="text-xs text-amber-400 animate-pulse flex items-center gap-1.5 font-semibold">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Syncing audit queue...</span>
                  </div>
                )}
                {syncState === "synced" && (
                  <div className="text-xs text-emerald-400 flex items-center gap-1.5 font-bold">
                    <Check className="w-3.5 h-3.5" />
                    <span>Synced successfully!</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tile 7: Compliance & GDPR Overlay (Spans 2 cols, 1 row) */}
          <div 
            className="group relative overflow-hidden bg-slate-800/10 border border-slate-800/60 rounded-[32px] p-8 flex flex-col justify-between md:col-span-2 lg:row-span-1 transition-all duration-300 shadow-md"
            onMouseMove={onMouseMove}
          >
            <div 
              className="pointer-events-none absolute -inset-px rounded-[32px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"
              style={{
                background: `radial-gradient(600px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), rgba(16, 185, 129, 0.08), transparent 45%)`
              }}
            />
            
            <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
              <div className="space-y-2">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block">
                  GDPR & Privacy Compliance
                </span>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Enforces UK GDPR standard rules: zero persistent cookies, zero third-party telemetry, and zero tracking scripts. All data processing remains 100% local to the client's browser runtime.
                </p>
              </div>
              
              <div className="flex items-center gap-2.5 text-xs text-slate-400 border-t border-slate-850 pt-4">
                <Lock className="w-4 h-4 text-emerald-500" />
                <span>Protected LocalStorage Sandboxed State</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
