import React from "react";
import Link from "next/link";

export const metadata = {
  title: "Cookie Policy | Whole Hospitality",
  description: "Cookie Policy detailing our cookie-less client-side Web Storage usage.",
};

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-24 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-slate-900 px-8 py-10 border-b-4 border-blue-500">
          <h1 className="text-3xl font-bold text-white mb-2">Cookie Policy</h1>
          <h2 className="text-xl text-blue-400 font-medium">Whole Hospitality Cookie-Less & Storage Disclosures</h2>
        </div>

        {/* Content Body */}
        <div className="p-8 sm:p-12 space-y-8 text-slate-700 leading-relaxed text-sm md:text-base">
          
          <section className="space-y-3">
            <h3 className="text-xl font-bold text-slate-900">1. Zero Cookie Architecture</h3>
            <p>
              Whole Hospitality is a cookie-less website. We do not store, send, or use HTTP cookies (whether session or persistent) to identify your browser, track your online actions, or serve marketing advertisements.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-xl font-bold text-slate-900">2. Local Web Storage Usage</h3>
            <p>
              Instead of traditional tracking cookies, our local browser diagnostics use the built-in browser Web Storage API (specifically `LocalStorage`) for purely functional operations:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>
                <strong>Configuration Data</strong>: Stores user-defined diagnostic metrics (such as custom till checks or staff names) locally on your machine.
              </li>
              <li>
                <strong>Offline Audit Queue</strong>: Temporarily stores audit checklists on your local device during network dropouts to ensure zero data loss.
              </li>
              <li>
                <strong>Privacy Consent</strong>: Saves your acknowledgment of our privacy-first notification to prevent the banner from showing up on subsequent pages.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="text-xl font-bold text-slate-900">3. Managing Local Storage</h3>
            <p>
              LocalStorage does not expire automatically. It remains on your device until you choose to delete it. You can review, clear, or block LocalStorage data at any time via your browser's Privacy or Site Settings menu (often under "Clear Site Data" or "Manage Storage").
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-xl font-bold text-slate-900">4. Third-Party Exceptions</h3>
            <p>
              We do not include third-party tracking libraries, Google Analytics, Facebook Pixels, or external web beacons. No third-party scripts place cookies on your device when you browse our website.
            </p>
          </section>

        </div>
        
        {/* Return Button */}
        <div className="bg-slate-100 px-8 py-6 border-t border-slate-200 flex justify-center">
          <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-2 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Return to Whole Hospitality Home
          </Link>
        </div>
        
      </div>
    </div>
  );
}
