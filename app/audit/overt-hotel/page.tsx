"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { generateOvertHotelPDF } from "../utils/generateOvertPDF";
import BarStealthCamera, { BarStealthCameraRef } from "../bar/BarStealthCamera";
import { OVERT_HOTEL_CHECKLIST } from "./checklist";

export default function OvertHotelAuditPage() {
  const [siteName, setSiteName] = useState("");
  const [auditorName, setAuditorName] = useState("");
  const [auditDate, setAuditDate] = useState(() => new Date().toISOString().split('T')[0]);
  
  const [newRoom, setNewRoom] = useState("");
  const [roomsChecked, setRoomsChecked] = useState<string[]>([]);
  
  const [checklistState, setChecklistState] = useState<Record<string, "Pass" | "Fail" | "NA">>({});
  
  const cameraRef = useRef<BarStealthCameraRef>(null);
  const [photosTaken, setPhotosTaken] = useState(0);

  // Clear previous captures on load
  useEffect(() => {
    try {
      localStorage.removeItem('audit_captures');
    } catch (e) {}
  }, []);

  const handleAddRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRoom.trim() && !roomsChecked.includes(newRoom.trim())) {
      setRoomsChecked([...roomsChecked, newRoom.trim()]);
      setNewRoom("");
    }
  };

  const removeRoom = (room: string) => {
    setRoomsChecked(roomsChecked.filter(r => r !== room));
  };

  const handleRadioChange = (itemId: string, value: "Pass" | "Fail" | "NA") => {
    setChecklistState(prev => ({ ...prev, [itemId]: value }));
  };

  const triggerPhotoCapture = () => {
    if (cameraRef.current) {
      cameraRef.current.capturePhoto();
      setPhotosTaken(prev => prev + 1);
    }
  };

  const checkCompliance = () => {
    // Look at all section 5 items. If any are "Fail" or left empty (if we consider empty a fail for mandatory? Let's say explicit "Fail" triggers it, or not explicit "Pass").
    // The instructions: "A failure in any checkbox within this section instantly triggers..."
    // So if any Section 5 item is "Fail" OR not "Pass", we might flag it. Let's flag if ANY are "Fail" or not checked.
    const section5 = OVERT_HOTEL_CHECKLIST.find(s => s.id === "section5");
    if (!section5) return true;
    
    let isCompliant = true;
    for (const sub of section5.subsections) {
      for (const item of sub.items) {
        if (checklistState[item.id] !== "Pass") {
          isCompliant = false;
        }
      }
    }
    return isCompliant;
  };

  const exportPDF = async () => {
    let captures = [];
    try {
      captures = JSON.parse(localStorage.getItem('audit_captures') || '[]');
    } catch (e) {}

    const isCompliant = checkCompliance();

    await generateOvertHotelPDF({
      siteName,
      auditorName,
      date: auditDate,
      roomsChecked,
      checklistState,
      captures,
      isCompliant
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans pb-20">
      
      {/* Header Bar */}
      <div className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/audit" className="text-slate-500 hover:text-slate-800 transition-colors block p-2 -ml-2 rounded-full hover:bg-slate-100">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
          </Link>
          <h1 className="text-xl font-bold text-slate-800">Announced Hotel Audit</h1>
        </div>
        <div>
          <button onClick={exportPDF} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold text-sm shadow transition-colors">
            Export Report
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6 mt-4">
        
        {/* Meta Info Section */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 border-b border-slate-100 pb-2">Audit Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Premises Name</label>
              <input 
                type="text" 
                value={siteName}
                onChange={e => setSiteName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="E.g. The Grand Hotel"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Auditor Name</label>
              <input 
                type="text" 
                value={auditorName}
                onChange={e => setAuditorName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Audit Date</label>
              <input 
                type="date" 
                value={auditDate}
                onChange={e => setAuditDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-xs font-semibold text-slate-600 mb-1">Rooms Checked</label>
            <form onSubmit={handleAddRoom} className="flex gap-2 mb-3">
              <input 
                type="text" 
                value={newRoom}
                onChange={e => setNewRoom(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-xs"
                placeholder="E.g. 204"
              />
              <button type="submit" className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-4 py-2 rounded-lg font-semibold text-sm transition-colors">
                Add Room
              </button>
            </form>
            <div className="flex flex-wrap gap-2">
              {roomsChecked.map(room => (
                <span key={room} className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {room}
                  <button onClick={() => removeRoom(room)} className="text-blue-500 hover:text-blue-900">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                  </button>
                </span>
              ))}
              {roomsChecked.length === 0 && <span className="text-sm text-slate-400 italic">No rooms added yet.</span>}
            </div>
          </div>
        </section>

        {/* Checklist Sections */}
        {OVERT_HOTEL_CHECKLIST.map((section) => (
          <section key={section.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className={`p-4 border-b ${section.id === 'section5' ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'}`}>
              <h2 className={`font-bold ${section.id === 'section5' ? 'text-red-700' : 'text-slate-800'}`}>
                {section.title}
              </h2>
            </div>
            
            <div className="p-0">
              {section.subsections.map((sub, sIdx) => (
                <div key={sub.title} className={`${sIdx !== 0 ? 'border-t border-slate-200' : ''}`}>
                  <div className="bg-slate-100/50 px-4 py-2 border-b border-slate-200">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide">{sub.title}</h3>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {sub.items.map(item => {
                      const value = checklistState[item.id] || "NA";
                      return (
                        <div key={item.id} className="p-4 hover:bg-slate-50 transition-colors grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                          <div className="md:col-span-8">
                            <h4 className="text-sm font-bold text-slate-800 mb-1">{item.label}</h4>
                            <p className="text-xs text-slate-500 leading-relaxed">{item.description}</p>
                          </div>
                          <div className="md:col-span-4 flex justify-start md:justify-end gap-2">
                            <label className={`flex-1 md:flex-none cursor-pointer border rounded-lg px-3 py-2 text-xs font-bold text-center transition-colors ${value === 'Pass' ? 'bg-green-100 border-green-300 text-green-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                              <input type="radio" className="hidden" name={item.id} value="Pass" checked={value === 'Pass'} onChange={() => handleRadioChange(item.id, 'Pass')} />
                              Pass
                            </label>
                            <label className={`flex-1 md:flex-none cursor-pointer border rounded-lg px-3 py-2 text-xs font-bold text-center transition-colors ${value === 'Fail' ? 'bg-red-100 border-red-300 text-red-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                              <input type="radio" className="hidden" name={item.id} value="Fail" checked={value === 'Fail'} onChange={() => handleRadioChange(item.id, 'Fail')} />
                              Fail
                            </label>
                            <label className={`flex-1 md:flex-none cursor-pointer border rounded-lg px-3 py-2 text-xs font-bold text-center transition-colors ${value === 'NA' ? 'bg-slate-200 border-slate-400 text-slate-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                              <input type="radio" className="hidden" name={item.id} value="NA" checked={value === 'NA'} onChange={() => handleRadioChange(item.id, 'NA')} />
                              N/A
                            </label>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* Evidence Section */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Photographic Evidence</h2>
            <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{photosTaken} Captured</span>
          </div>
          
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/2 aspect-video rounded-xl overflow-hidden border-2 border-slate-800 bg-black shadow-inner relative">
              <BarStealthCamera ref={cameraRef} />
            </div>
            <div className="w-full md:w-1/2 flex flex-col justify-center">
              <p className="text-sm text-slate-500 mb-4">
                Use the camera to capture evidence of non-compliance, untidy areas, or excellent presentation. These will be appended to the final PDF report.
              </p>
              <button 
                onClick={triggerPhotoCapture}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                CAPTURE EVIDENCE
              </button>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
