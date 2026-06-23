import React from "react";
import Link from "next/link";

export const metadata = {
  title: "Terms of Service | Whole Hospitality",
  description: "Terms of Service and software licensing agreement for Whole Hospitality applications.",
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-slate-50 py-24 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-slate-900 px-8 py-10 border-b-4 border-blue-500">
          <h1 className="text-3xl font-bold text-white mb-2">Terms of Service</h1>
          <h2 className="text-xl text-blue-400 font-medium">Whole Hospitality Software Licensing Agreement</h2>
        </div>

        {/* Content Body */}
        <div className="p-8 sm:p-12 space-y-8 text-slate-700 leading-relaxed text-sm md:text-base">
          
          <section className="space-y-3">
            <h3 className="text-xl font-bold text-slate-900">1. Acceptance of Terms</h3>
            <p>
              By accessing or using the Whole Hospitality local diagnostics, GP Calculator, and Room Inventory Pro applications, you agree to comply with and be bound by these Terms of Service. If you do not agree, please cease use immediately.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-xl font-bold text-slate-900">2. Licensing & Designation</h3>
            <p>
              Whole Hospitality provides local browser-based analytical utilities. All calculations, state management, and asset compilations are processed entirely on your client machine. You are granted a non-exclusive, non-transferable, revocable license to run these local tools.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-xl font-bold text-slate-900">3. Operational Responsibilities</h3>
            <p>
              Under standard UK and EU regulations, the operator is designated as the sole <strong>Data Controller</strong> of any data logged, compiled, or exported through our tools. You assume 100% of the legal status and responsibilities for ensuring that deployments of the software align with local laws and regulatory compliance.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-xl font-bold text-slate-900">4. Limitation of Liability</h3>
            <p>
              WHOLE HOSPITALITY UTILITIES ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND. Whole Hospitality does not provide legal, financial, or regulatory counsel. We assume zero responsibility for data custody, data breaches, or compliance violations occurring in connection with the use of this software.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-xl font-bold text-slate-900">5. Modifications</h3>
            <p>
              Whole Hospitality reserves the right to modify these terms at any time. Your continued use of the applications following updates constitutes acceptance of the revised Terms.
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
