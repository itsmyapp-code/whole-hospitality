"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import BarStealthCamera, { BarStealthCameraRef } from "./BarStealthCamera";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type InfractionEvent = { timestamp: string; staff: string };

export default function CovertAuditPage() {
  const [isPanicked, setIsPanicked] = useState(false);
  
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

  const logInfraction = (key: keyof typeof metrics) => {
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
  const exportPDF = () => {
    const doc = new jsPDF();

    // 1. Header
    doc.setFontSize(18);
    doc.text("Covert Bar Premises Audit Report", 14, 20);
    
    doc.setFontSize(11);
    doc.text(`Site Name: ${siteName || "Not Specified"}`, 14, 30);
    doc.text(`Auditor: ${auditorName || "Not Specified"}`, 14, 36);
    doc.text(`Date of Export: ${new Date().toLocaleString('en-GB')}`, 14, 42);

    // 2. Executive Summary
    doc.setFontSize(14);
    doc.text("Executive Summary", 14, 55);

    const summaryData = [
      ['Free Pouring', metrics.freePours.length],
      ['Incorrect Measure Size', metrics.incorrectMeasures.length],
      ['No Ring-In', metrics.noRingIns.length],
      ['Over/Under-charge Discrepancy', metrics.chargeDiscrepancies.length],
      ['Till Left Open', metrics.tillLeftOpen.length],
      ['Unrecorded Wastage', metrics.unrecordedWastage.length],
      ['Giving Away Drinks', metrics.givingAwayDrinks.length],
      ['Dirty Glassware / Poor Hygiene', metrics.dirtyGlassware.length],
      ['Using Phone on Shift', metrics.usingPhone.length],
      ['Eating/Drinking Behind Bar', metrics.eatingDrinking.length],
      ['Underaged Staff Serving', metrics.underageStaff.length],
      ['No ID Check', metrics.noIdCheck.length],
    ];

    autoTable(doc, {
      startY: 60,
      head: [['Infraction Type', 'Total Incidents']],
      body: summaryData.filter(row => (row[1] as number) > 0),
      theme: 'grid',
      margin: { bottom: 30 }
    });

    let finalY = (doc as any).lastAutoTable.finalY + 15;

    // 3. Staff Breakdown
    if (staffList.length > 1) {
      doc.setFontSize(14);
      doc.text("Staff Breakdown", 14, finalY);

      const staffBreakdownData: any[] = [];
      staffList.forEach(staffMem => {
        let staffTotal = 0;
        const allKeys = Object.keys(metrics).filter(k => k !== 'photosTaken' && k !== 'timeToGreetSecs' && k !== 'timeToServeSecs') as (keyof typeof metrics)[];
        allKeys.forEach(k => {
          staffTotal += (metrics[k] as InfractionEvent[]).filter(e => e.staff === staffMem).length;
        });
        if (staffTotal > 0 || staffMem !== "General / Unknown") {
           staffBreakdownData.push([staffMem, staffTotal]);
        }
      });

      if (staffBreakdownData.length > 0) {
        autoTable(doc, {
          startY: finalY + 5,
          head: [['Staff Member / Description', 'Total Infractions Logged']],
          body: staffBreakdownData,
          theme: 'grid',
          margin: { bottom: 30 }
        });
        finalY = (doc as any).lastAutoTable.finalY + 15;
      }
    }

    // 4. Chronological Event Log
    const events: { type: string; time: Date, staff: string, detail?: string }[] = [];
    
    const addEvents = (arr: InfractionEvent[], label: string) => {
      arr.forEach(ev => events.push({ type: label, time: new Date(ev.timestamp), staff: ev.staff }));
    };

    addEvents(metrics.freePours, 'Free Pour');
    addEvents(metrics.incorrectMeasures, 'Incorrect Measure');
    addEvents(metrics.noRingIns, 'No Ring-In');
    addEvents(metrics.chargeDiscrepancies, 'Charge Discrepancy');
    addEvents(metrics.tillLeftOpen, 'Till Left Open');
    addEvents(metrics.unrecordedWastage, 'Unrecorded Wastage');
    addEvents(metrics.givingAwayDrinks, 'Giving Away Drinks');
    addEvents(metrics.dirtyGlassware, 'Dirty Glassware');
    addEvents(metrics.usingPhone, 'Using Phone on Shift');
    addEvents(metrics.eatingDrinking, 'Eating/Drinking Behind Bar');
    addEvents(metrics.underageStaff, 'Underage Staff Serving');
    addEvents(metrics.noIdCheck, 'No ID Check');

    metrics.timeToGreetSecs.forEach(t => events.push({ type: 'Time to Greet', time: new Date(t.timestamp), staff: t.staff, detail: `${t.duration} seconds` }));
    metrics.timeToServeSecs.forEach(t => events.push({ type: 'Time to Serve', time: new Date(t.timestamp), staff: t.staff, detail: `${t.duration} seconds` }));

    // Sort chronologically
    events.sort((a, b) => a.time.getTime() - b.time.getTime());

    doc.setFontSize(14);
    doc.text("Chronological Event Log", 14, finalY);

    const logBody = events.map(e => [
      e.time.toLocaleTimeString('en-GB', { hour12: false }),
      e.staff,
      e.type,
      e.detail || "-"
    ]);

    if (events.length > 0) {
      autoTable(doc, {
        startY: finalY + 5,
        head: [['Time', 'Staff', 'Event', 'Details']],
        body: logBody,
        theme: 'striped',
        margin: { bottom: 30 }
      });
      finalY = (doc as any).lastAutoTable.finalY + 15;
    } else {
      doc.setFontSize(10);
      doc.text("No events logged.", 14, finalY + 8);
      finalY += 15;
    }

    // 5. Photographic Evidence
    try {
      const captures = JSON.parse(localStorage.getItem('audit_captures') || '[]');
      if (captures.length > 0) {
        doc.addPage();
        doc.setFontSize(14);
        doc.text("Photographic Evidence", 14, 20);
        
        let yPos = 30;
        captures.forEach((cap: any, index: number) => {
          if (yPos > 240) { // Keep away from bottom margin (approx 297 height)
            doc.addPage();
            yPos = 20;
          }
          doc.setFontSize(10);
          doc.text(`Evidence #${index + 1} - Captured: ${new Date(cap.timestamp).toLocaleString('en-GB')}`, 14, yPos);
          
          doc.addImage(cap.dataUrl, 'JPEG', 14, yPos + 5, 120, 90);
          yPos += 105;
        });
      }
    } catch (e) {
      console.warn("Could not attach photos to PDF", e);
    }

    // 6. Add Compliance Framework Appendix
    doc.addPage();
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text("Appendix: Legal Standing & Deployment Guide", 14, 20);

    const complianceData = [
      [{ content: "1. Core Compliance Facts: Where Whole Hospitality Stands", styles: { fontStyle: 'bold', fontSize: 12 } }],
      ["Zero-Server Architecture Immunity: The application operates strictly as a local processing engine using client-side React logic. Because zero personal profiles, timestamp logs, or captured images are ever transmitted to or stored on an external network, Whole Hospitality does not possess, harvest, or process user session data."],
      ["Neutral Utility Designation: Whole Hospitality is legally classified as a neutral software utility provider. The software stands in the exact same regulatory category as an offline spreadsheet or a local text editor."],
      ["Regulatory Exemption: Because Whole Hospitality never handles or determines the destination of the audit data, Whole Hospitality is not a Data Controller nor a Data Processor under the UK GDPR and Data Protection Act 2018. The platform is entirely insulated from data processing liabilities, data breach regimes, and Subject Access Requests (SARs)."],
      ["Immediate Client-Side Data Erasure: To enforce strict operational confidentiality, tapping \"Start New Audit\" completely purges all local session variables, nested state configurations, and temporary browser local storage. No recovery infrastructure exists on the network to retrieve purged logs."],
      [{ content: "2. Mandatory Instructions for Venue Operators (The Data Controllers)", styles: { fontStyle: 'bold', fontSize: 12, cellPadding: { top: 10 } } }],
      ["Under UK law, the venue operator utilizing this app assumes 100% of the legal status of the Data Controller. To ensure that any exported PDF report stands up as admissible evidence in an employment disciplinary hearing or tribunal, operators must adhere strictly to the following parameters:"],
      ["The Proportionality Window (1–2 Weeks Max): Covert monitoring must be strictly time-limited. To comply with Information Commissioner's Office (ICO) guidelines, a targeted audit should run no longer than 1 to 2 weeks, or be confined to a handful of high-risk shifts to catch a specific pattern of financial leakage. Indefinite or continuous routine tracking is unlawful."],
      ["Establish Legitimate Interest: The audit must only be deployed where senior management has a reasonable, documented suspicion of financial leakage, internal theft, fraud, or gross operational malpractice. Using the tool for casual or continuous employee performance trailing is prohibited."],
      ["Public Floor Boundary Safety: This tool is designed exclusively for use on the public trading floor of the venue (the main bar counter, till areas, and floor service areas). In accordance with UK employment case law, employees serving the public have a reduced expectation of privacy in these spaces. It must never be used in private staff zones, changing rooms, or break areas."],
      ["Immediate Cessation of Tracking: The moment \"the smoking gun\" evidence is gathered and verified to initiate formal disciplinary action, covert monitoring must stop immediately."],
      ["Mandatory Pre-Audit DPIA: Before launching an audit, operators are legally required to have a completed Data Protection Impact Assessment (DPIA) on file that explicitly details why a time-limited, covert cash-loss investigation is necessary and proportionate for their business."],
      [{ content: "3. Website Legal Disclaimer Notice", styles: { fontStyle: 'bold', fontSize: 12, cellPadding: { top: 10 } } }],
      ["Disclaimer for Users: Whole Hospitality provides the Covert Bar Premises Audit Tool as an offline-first analytical utility. Whole Hospitality does not provide legal counsel or employment law representation. The venue operator assumes full responsibility for ensuring their deployment of this software aligns with the UK GDPR, the Data Protection Act 2018, and local employment laws. Exported PDF files are standalone evidentiary objects; custody, protection, and legal admissibility of the generated reports rest solely with the Data Controller."]
    ];

    autoTable(doc, {
      startY: 30,
      body: complianceData as any,
      theme: 'plain',
      styles: { fontSize: 10, cellPadding: 2, textColor: [50, 50, 50] },
      columnStyles: { 0: { cellWidth: 'auto' } },
      margin: { bottom: 30 }
    });

    // 7. Draw Legal Footer on Every Page
    const pageCount = (doc as any).internal.getNumberOfPages();
    const pageWidth = (doc as any).internal.pageSize.getWidth();
    const pageHeight = (doc as any).internal.pageSize.getHeight();
    const exportTimestamp = new Date().toLocaleString('en-GB');

    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      // Separator Line
      doc.setDrawColor(100, 116, 139); // slate-500
      doc.setLineWidth(0.5);
      doc.line(14, pageHeight - 25, pageWidth - 14, pageHeight - 25);
      
      // Footer Text Style
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139); 
      
      // Column Left
      doc.text("CONFIDENTIAL", 14, pageHeight - 19);
      doc.text("Targeted Covert Investigation Audit", 14, pageHeight - 15);
      doc.text(`Page ${i} of ${pageCount}`, 14, pageHeight - 11);
      doc.text("wholehospitality.co.uk", 14, pageHeight - 7);
      
      // Column Center
      const centerText = "Adheres to UK GDPR & ICO Workplace Monitoring Guidelines";
      const textWidth = doc.getTextWidth(centerText);
      doc.text(centerText, (pageWidth - textWidth) / 2, pageHeight - 19);
      
      // Column Right
      doc.text("Data Controller Local Device Export:", pageWidth - 14, pageHeight - 19, { align: "right" });
      doc.text(`[${exportTimestamp}]`, pageWidth - 14, pageHeight - 15, { align: "right" });
    }

    // Download
    const filename = `Audit_${siteName.replace(/\s+/g, '_') || 'Report'}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);

    // 8. Open Email Client
    const subject = encodeURIComponent(`[CONFIDENTIAL] Covert Audit Report: ${siteName || 'Venue'} - ${new Date().toLocaleDateString('en-GB')}`);
    
    // Calculate total infractions for the email body
    const allMetrics = [
      metrics.freePours, metrics.incorrectMeasures, metrics.noRingIns, 
      metrics.chargeDiscrepancies, metrics.tillLeftOpen, metrics.unrecordedWastage, 
      metrics.givingAwayDrinks, metrics.dirtyGlassware, metrics.usingPhone, 
      metrics.eatingDrinking, metrics.underageStaff, metrics.noIdCheck
    ];
    const totalInfractions = allMetrics.reduce((sum, arr) => sum + arr.length, 0);

    const body = encodeURIComponent(`CONFIDENTIAL TARGETED AUDIT REPORT
    
Site Name: ${siteName || 'Not Specified'}
Auditor: ${auditorName || 'Not Specified'}
Date: ${new Date().toLocaleString('en-GB')}
Total Infractions Logged: ${totalInfractions}

Please find the detailed PDF Executive Summary, Staff Breakdown, and Photographic Evidence attached to this email.

*** IMPORTANT: Please remember to manually attach the '${filename}' file that was just saved to your device! ***

--
Generated via Whole Hospitality Covert Audit Utility`);

    // Add a slight delay so the PDF has time to save before the browser redirects to the mailto link
    setTimeout(() => {
      window.location.href = `mailto:?subject=${subject}&body=${body}`;
    }, 500);

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

  const InfractionBtn = ({ id, label, icon }: { id: keyof typeof metrics, label: string, icon: string }) => (
    <button onClick={() => logInfraction(id)} className="bg-slate-800 hover:bg-slate-700 border border-slate-700 p-3 rounded-xl flex flex-col items-center justify-center gap-1 active:scale-95 transition-all text-center">
      <span className="text-2xl">{icon}</span>
      <span className="font-semibold text-xs leading-tight">{label}</span>
      <span className="text-[10px] text-slate-400">{(metrics[id] as any[]).length} logged</span>
    </button>
  );

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto bg-slate-900 text-slate-100 font-sans p-4 pb-20">
      
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
            className="flex-1 py-5 text-slate-600 font-mono text-[10px] tracking-widest opacity-80 hover:bg-slate-900 transition-colors"
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

            {/* iMessage Style Input */}
            <div className="flex gap-2 items-end pt-2">
              <div className="flex-1 bg-[#2c2c2e] rounded-full border border-slate-700 px-4 py-2 flex items-center shadow-inner">
                <input 
                  type="text" 
                  placeholder="iMessage" 
                  className="w-full bg-transparent text-[15px] text-slate-200 placeholder-slate-500 focus:outline-none"
                  value={newStaffInput}
                  onChange={(e) => setNewStaffInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddStaff()}
                />
              </div>
              <button 
                onClick={handleAddStaff}
                className="bg-[#0a84ff] hover:bg-blue-400 text-white p-2 rounded-full shadow-md transition-colors flex items-center justify-center shrink-0 h-[40px] w-[40px]"
              >
                <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path></svg>
              </button>
            </div>
          </div>
        </section>

        {/* Actions Grid */}
        <section>
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Log Infractions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <InfractionBtn id="freePours" label="Free Pour" icon="🥃" />
            <InfractionBtn id="incorrectMeasures" label="Wrong Measure" icon="⚖️" />
            <InfractionBtn id="noRingIns" label="No Ring-In" icon="💷" />
            <InfractionBtn id="chargeDiscrepancies" label="Charge Discrep" icon="📉" />
            <InfractionBtn id="tillLeftOpen" label="Till Left Open" icon="🔓" />
            <InfractionBtn id="unrecordedWastage" label="Unrecorded Waste" icon="🗑️" />
            <InfractionBtn id="givingAwayDrinks" label="Gave Drink Away" icon="🎁" />
            <InfractionBtn id="dirtyGlassware" label="Dirty Glassware" icon="🧼" />
            <InfractionBtn id="usingPhone" label="Using Phone" icon="📱" />
            <InfractionBtn id="eatingDrinking" label="Eating/Drinking" icon="🍔" />
            <InfractionBtn id="underageStaff" label="Underage Staff" icon="👶" />
            <InfractionBtn id="noIdCheck" label="No ID Check" icon="🆔" />
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
