import React from "react";
import Link from "next/link";

export const metadata = {
  title: "Legal & Compliance Framework | Whole Hospitality",
  description: "Legal standing and deployment guide for the Covert Bar Premises Audit Tool. Information regarding UK GDPR, Data Controllers, and lawful monitoring.",
};

export default function ComplianceFrameworkPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-slate-900 px-8 py-10 border-b-4 border-emerald-500">
          <h1 className="text-3xl font-bold text-white mb-2">Whole Hospitality Legal Framework</h1>
          <h2 className="text-xl text-emerald-400 font-medium">Covert Bar Premises Audit Tool: Legal Standing & Deployment Guide</h2>
        </div>

        {/* Content Body */}
        <div className="p-8 sm:p-12 space-y-12 text-slate-700">
          
          {/* Section 1 */}
          <section>
            <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-600 text-sm">1</span>
              Core Compliance Facts: Where Whole Hospitality Stands
            </h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-bold text-slate-900 text-lg">Zero-Server Architecture Immunity</h4>
                <p className="mt-1 leading-relaxed">The application operates strictly as a local processing engine using client-side React logic. Because zero personal profiles, timestamp logs, or captured images are ever transmitted to or stored on an external network, Whole Hospitality does not possess, harvest, or process user session data.</p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-lg">Neutral Utility Designation</h4>
                <p className="mt-1 leading-relaxed">Whole Hospitality is legally classified as a neutral software utility provider. The software stands in the exact same regulatory category as an offline spreadsheet or a local text editor.</p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-lg">Regulatory Exemption</h4>
                <p className="mt-1 leading-relaxed">Because Whole Hospitality never handles or determines the destination of the audit data, Whole Hospitality is not a Data Controller nor a Data Processor under the UK GDPR and Data Protection Act 2018. The platform is entirely insulated from data processing liabilities, data breach regimes, and Subject Access Requests (SARs).</p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-lg">Immediate Client-Side Data Erasure</h4>
                <p className="mt-1 leading-relaxed">To enforce strict operational confidentiality, tapping "Start New Audit" completely purges all local session variables, nested state configurations, and temporary browser local storage. No recovery infrastructure exists on the network to retrieve purged logs.</p>
              </div>
            </div>
          </section>

          <hr className="border-slate-200" />

          {/* Section 2 */}
          <section>
            <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-600 text-sm">2</span>
              Mandatory Instructions for Venue Operators (The Data Controllers)
            </h3>
            <p className="mb-6 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm">
              Under UK law, the venue operator utilizing this app assumes 100% of the legal status of the <strong>Data Controller</strong>. To ensure that any exported PDF report stands up as admissible evidence in an employment disciplinary hearing or tribunal, operators must adhere strictly to the following parameters:
            </p>

            <ul className="space-y-6">
              <li className="flex gap-4">
                <div className="flex-shrink-0 mt-1 text-emerald-500">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                </div>
                <div>
                  <strong className="block text-slate-900 text-lg">The Proportionality Window (1–2 Weeks Max)</strong>
                  <p className="mt-1 leading-relaxed">Covert monitoring must be strictly time-limited. To comply with Information Commissioner's Office (ICO) guidelines, a targeted audit should run no longer than 1 to 2 weeks, or be confined to a handful of high-risk shifts to catch a specific pattern of financial leakage. Indefinite or continuous routine tracking is unlawful.</p>
                </div>
              </li>

              <li className="flex gap-4">
                <div className="flex-shrink-0 mt-1 text-emerald-500">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                </div>
                <div>
                  <strong className="block text-slate-900 text-lg">Establish Legitimate Interest</strong>
                  <p className="mt-1 leading-relaxed">The audit must only be deployed where senior management has a reasonable, documented suspicion of financial leakage, internal theft, fraud, or gross operational malpractice. Using the tool for casual or continuous employee performance trailing is prohibited.</p>
                </div>
              </li>

              <li className="flex gap-4">
                <div className="flex-shrink-0 mt-1 text-emerald-500">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                </div>
                <div>
                  <strong className="block text-slate-900 text-lg">Public Floor Boundary Safety</strong>
                  <p className="mt-1 leading-relaxed">This tool is designed exclusively for use on the public trading floor of the venue (the main bar counter, till areas, and floor service areas). In accordance with UK employment case law, employees serving the public have a reduced expectation of privacy in these spaces. It must never be used in private staff zones, changing rooms, or break areas.</p>
                </div>
              </li>

              <li className="flex gap-4">
                <div className="flex-shrink-0 mt-1 text-emerald-500">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                </div>
                <div>
                  <strong className="block text-slate-900 text-lg">Immediate Cessation of Tracking</strong>
                  <p className="mt-1 leading-relaxed">The moment "the smoking gun" evidence is gathered and verified to initiate formal disciplinary action, covert monitoring must stop immediately.</p>
                </div>
              </li>

              <li className="flex gap-4">
                <div className="flex-shrink-0 mt-1 text-emerald-500">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                </div>
                <div>
                  <strong className="block text-slate-900 text-lg">Mandatory Pre-Audit DPIA</strong>
                  <p className="mt-1 leading-relaxed">Before launching an audit, operators are legally required to have a completed Data Protection Impact Assessment (DPIA) on file that explicitly details why a time-limited, covert cash-loss investigation is necessary and proportionate for their business.</p>
                </div>
              </li>
            </ul>
          </section>

          <hr className="border-slate-200" />

          {/* Section 3 */}
          <section className="bg-slate-900 text-slate-300 p-8 rounded-xl border border-slate-800 shadow-inner">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              Website Legal Disclaimer Notice
            </h3>
            <p className="leading-relaxed text-sm">
              <strong className="text-white">Disclaimer for Users:</strong> Whole Hospitality provides the Covert Bar Premises Audit Tool as an offline-first analytical utility. Whole Hospitality does not provide legal counsel or employment law representation. The venue operator assumes full responsibility for ensuring their deployment of this software aligns with the UK GDPR, the Data Protection Act 2018, and local employment laws. Exported PDF files are standalone evidentiary objects; custody, protection, and legal admissibility of the generated reports rest solely with the Data Controller.
            </p>
          </section>

        </div>
        
        {/* Footer actions */}
        <div className="bg-slate-100 px-8 py-6 border-t border-slate-200 flex justify-center">
          <Link href="/" className="text-emerald-600 hover:text-emerald-700 font-medium text-sm flex items-center gap-2 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Return to Whole Hospitality Home
          </Link>
        </div>
        
      </div>
    </div>
  );
}
