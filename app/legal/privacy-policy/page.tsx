import React from "react";
import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | Whole Hospitality",
  description: "Privacy Policy outlining our zero-surveillance, 100% client-side data architecture.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-24 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-slate-900 px-8 py-10 border-b-4 border-blue-500">
          <h1 className="text-3xl font-bold text-white mb-2">Privacy Policy</h1>
          <h2 className="text-xl text-blue-400 font-medium">Whole Hospitality Zero-Surveillance Data Architecture Statement</h2>
        </div>

        {/* Content Body */}
        <div className="p-8 sm:p-12 space-y-8 text-slate-700 leading-relaxed text-sm md:text-base">
          
          <section className="space-y-3">
            <h3 className="text-xl font-bold text-slate-900">1. Client-Side Data Isolation</h3>
            <p>
              Whole Hospitality is committed to absolute user privacy. Our software runs entirely inside your local web browser sandbox. Zero personal profiles, zero transaction history logs, and zero audit images are transmitted to external servers. Your operational data never leaves your device.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-xl font-bold text-slate-900">2. No Persistent Tracking</h3>
            <p>
              We do not employ persistent cookies, tracking pixels, or third-party marketing analytics networks. There is no remote logging or profile tracking built into our platform. 
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-xl font-bold text-slate-900">3. Local Browser Storage</h3>
            <p>
              To maintain system diagnostics and persistent offline audit caches, the software utilizes your browser's local Web Storage API (LocalStorage). This data is kept sandboxed within your local machine and can be cleared instantly at any time by clearing your browser cache.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-xl font-bold text-slate-900">4. Compliance with UK GDPR</h3>
            <p>
              Under the UK GDPR and the Data Protection Act 2018, the venue operator is designated as the sole Data Controller of any data compiled or exported. Whole Hospitality does not store, harvest, or process data subjects' records on any external server infrastructure.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-xl font-bold text-slate-900">5. Contact Info</h3>
            <p>
              For queries related to our local software architecture and compliance frameworks, please contact your organization's designated Data Protection Officer.
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
