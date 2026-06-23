"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ShieldCheck, X } from "lucide-react";

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("whole_hosp_cookie_consent");
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("whole_hosp_cookie_consent", "accepted");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 animate-in slide-in-from-bottom-10 duration-500">
      <div className="max-w-4xl mx-auto bg-slate-950/95 backdrop-blur-md border border-slate-800 text-white p-6 rounded-3xl shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        {/* Consent Message */}
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-slate-100 uppercase tracking-wider">
              Privacy-First Architecture Notice
            </h4>
            <p className="text-xs md:text-sm text-slate-400 leading-relaxed">
              Whole Hospitality utilizes zero persistent cookies, zero third-party tracking networks, and zero remote databases. All session data is stored 100% locally in your client-side browser cache. Review our{" "}
              <Link href="/legal/privacy-policy" className="text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors font-medium">
                Privacy Policy
              </Link>{" "}
              to learn more.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-4 shrink-0">
          <button
            onClick={handleAccept}
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-6 rounded-xl text-sm transition-colors shadow-lg cursor-pointer"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}
