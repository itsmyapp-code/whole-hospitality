"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { exportConfigToken, importConfigToken, getActiveConfiguration, setActiveConfiguration } from "./utils/configMigration";
import MetricCustomizer from "./MetricCustomizer";

export default function AuditHub() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  
  const [importTokenText, setImportTokenText] = useState("");
  const [configMessage, setConfigMessage] = useState("");
  const [isError, setIsError] = useState(false);
  
  const [pendingRoute, setPendingRoute] = useState<string | null>(null);

  const showMessage = (msg: string, error = false) => {
    setConfigMessage(msg);
    setIsError(error);
    setTimeout(() => setConfigMessage(""), 4000);
  };

  const handleExportConfig = async () => {
    const config = getActiveConfiguration();
    const token = exportConfigToken(config);
    if (!token) {
      showMessage("Failed to generate token.", true);
      return;
    }
    try {
      await navigator.clipboard.writeText(token);
      showMessage("Token copied to clipboard!");
    } catch (err) {
      // Fallback for devices where clipboard might fail
      showMessage("Token generated. Please copy manually.", false);
      setImportTokenText(token);
    }
  };

  const handleImportConfig = () => {
    if (!importTokenText.trim()) {
      showMessage("Please paste a token first.", true);
      return;
    }
    const payload = importConfigToken(importTokenText);
    if (!payload) {
      showMessage("Invalid or corrupted token.", true);
      return;
    }
    setActiveConfiguration(payload);
    showMessage("Configuration imported successfully!");
    setImportTokenText("");
  };

  const CORRECT_PIN = "1234";

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === CORRECT_PIN) {
      setIsAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
      setPinInput("");
    }
  };

  const handleModuleSelect = (route: string) => {
    setPendingRoute(route);
  };

  const acceptCompliance = () => {
    if (pendingRoute) {
      router.push(pendingRoute);
    }
  };

  const downloadDPIA = () => {
    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>DPIA Template</title></head>
      <body style="font-family: Arial, sans-serif; font-size: 11pt;">
        <h1 style="color: #333;">Data Protection Impact Assessment (DPIA)</h1>
        <h2 style="color: #555;">Template for Covert Workplace Monitoring (Hospitality Sector)</h2>
        <p><strong>Disclaimer:</strong> This is a draft template provided by Whole Hospitality for venue operators. It is not legal advice. Under the UK Data Protection Act 2018, UK GDPR, and the Data (Use and Access) Act 2025 (DUAA), the venue operator is the Data Controller. You must adapt this document to your specific circumstances and keep it securely on file <strong>before</strong> commencing any covert monitoring.</p>
        <hr>
        <h3>1. Project Overview</h3>
        <p><strong>Venue Name:</strong> [Insert Venue Name]<br>
        <strong>Date of Assessment:</strong> [Insert Date]<br>
        <strong>Assessor Name & Position:</strong> [Insert Name, e.g., General Manager / Owner]<br>
        <strong>Target of Monitoring:</strong> [e.g., Main Bar Area / Front Desk]</p>
        
        <h3>2. Identify the Need for a DPIA</h3>
        <p><strong>Why is a DPIA required?</strong><br>
        We intend to conduct short-term, targeted, and covert visual/behavioral monitoring of employees operating in the public trading areas of the venue. Under ICO guidelines, covert monitoring is highly intrusive and inherently high-risk, making a DPIA a strict legal requirement prior to deployment.</p>

        <h3>3. Describe the Processing</h3>
        <p><strong>Nature of the Processing:</strong><br>
        We will use an offline, local-device tool (Whole Hospitality Covert Audit) to log positive and negative staff behaviors, and optionally capture covert still photographs of policy infractions.</p>
        <p><strong>Scope of the Processing:</strong></p>
        <ul>
          <li><strong>Duration:</strong> The monitoring is strictly time-limited to a "Proportionality Window" of [Insert duration, e.g., 7 Days / 4 specific shifts]. It is not continuous.</li>
          <li><strong>Data Captured:</strong> Staff names/roles, timestamped logs of specific actions (e.g., cash handling, drink pouring), and potentially still images of the public trading floor.</li>
          <li><strong>Exclusions:</strong> Monitoring will <strong>never</strong> occur in private zones (bathrooms, break rooms, changing areas). Audio recording is <strong>not</strong> utilized.</li>
        </ul>
        <p><strong>Context of the Processing:</strong><br>
        The monitoring occurs exclusively on the public trading floor where employees have a naturally reduced expectation of privacy compared to private back-of-house areas.</p>
        <p><strong>Purpose of the Processing:</strong><br>
        To secure "smoking gun" evidence of suspected financial leakage, gross operational malpractice, or internal theft that threatens the viability of the business.</p>

        <h3>4. Necessity and Proportionality</h3>
        <p><strong>Lawful Basis:</strong> Legitimate Interests, specifically relying on the DUAA 2025 framework for crime detection and business safeguarding.</p>
        <p><strong>Why is covert monitoring necessary?</strong><br>
        We have a documented, reasonable suspicion of [Describe suspicion, e.g., cash theft from the main till / unauthorized free drinks being distributed].</p>
        <p><strong>Why have alternative, less intrusive methods failed?</strong><br>
        We have already attempted [e.g., standard inventory checks, overt CCTV review, management floor presence], but these methods have failed to identify the specific individuals responsible or capture usable disciplinary evidence. If staff are aware they are being audited (overt monitoring), the illicit behavior ceases temporarily, only to resume later. Therefore, covert monitoring is the only viable method to establish the facts.</p>

        <h3>5. Consultation Process</h3>
        <p><strong>Will you consult staff?</strong><br>
        No. Informing the staff of the monitoring would entirely defeat the purpose of the investigation and prevent the capture of evidence related to the suspected gross misconduct.</p>

        <h3>6. Identifying & Mitigating Risks</h3>
        <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">
          <tr style="background-color: #f2f2f2;"><th>Privacy Risk</th><th>Mitigation Measure</th><th>Residual Risk</th></tr>
          <tr><td><strong>Intrusion of Privacy</strong></td><td>Monitoring is strictly confined to public areas and strictly time-limited (e.g., 1-2 weeks). No private zones are monitored.</td><td>Low</td></tr>
          <tr><td><strong>Data Leak / Hacking</strong></td><td>The Whole Hospitality tool utilizes a Zero-Server Architecture. Data never touches the cloud. All logs and images are stored locally on the auditor's device and immediately purged upon starting a new session.</td><td>Low</td></tr>
          <tr><td><strong>Unauthorized Access</strong></td><td>The resulting PDF report will be treated as highly confidential HR evidence. It will be stored securely on an encrypted local drive accessible only by senior management.</td><td>Low</td></tr>
          <tr><td><strong>Scope Creep</strong></td><td>Management commits to immediately ceasing the covert audit the moment sufficient evidence is gathered to initiate formal disciplinary hearings.</td><td>Low</td></tr>
          <tr><td><strong>Automated Decision-Making (ADM)</strong></td><td><strong>Misinterpretation of software outputs leading to automated unfair discipline:</strong> The Whole Hospitality tool serves strictly as a logging utility. Senior management will manually review all findings, conduct formal interviews, and provide full human intervention before any disciplinary action is taken. No automated decisions are made.</td><td>Low</td></tr>
          <tr><td><strong>Complaints Processing</strong></td><td><strong>Failure to process employee data protection complaints under the new DUAA internal complaints regime:</strong> The Data Controller confirms that a compliant internal data protection complaints log and submission process is active, as required by the DUAA, should an affected data subject file a formal complaint regarding this processing.</td><td>Low</td></tr>
        </table>

        <h3>7. Sign-Off and Record of Outcomes</h3>
        <p><strong>Is the covert monitoring justified, proportionate, and lawful?</strong><br>
        [ ] <strong>Yes.</strong> The risk to the business survival outweighs the temporary intrusion into employee privacy in a public trading space, provided the mitigations above are strictly enforced.</p>
        <p>[ ] Management commits to reviewing this DPIA template annually against updated ICO Employment Monitoring codes published post-DUAA implementation.</p>
        <p><br><strong>Signed (Data Controller / Management):</strong> ___________________________<br><br>
        <strong>Date:</strong> ___________________________</p>
        <hr>
        <p><em>Keep this document securely on file. Do not share with general staff. It serves as your legal justification should the ICO or an Employment Tribunal question the lawfulness of your evidence.</em></p>
      </body>
      </html>
    `;
    const blob = new Blob([htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'DPIA_Template_Covert_Monitoring.doc';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl max-w-sm w-full">
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mb-4 shadow-inner">
              <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
            </div>
            <h1 className="text-xl font-bold text-white tracking-widest uppercase">System Access</h1>
            <p className="text-xs text-slate-500 mt-2">Enter authorization code</p>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className={`w-full bg-slate-950 border ${pinError ? 'border-red-500/50' : 'border-slate-800'} text-center text-3xl tracking-[1em] text-white p-4 rounded-xl focus:outline-none focus:border-emerald-500/50 transition-colors`}
                placeholder="••••"
                autoFocus
              />
              {pinError && <p className="text-red-400 text-xs text-center mt-2">Invalid code</p>}
            </div>
            <button
              type="submit"
              className="w-full bg-slate-100 hover:bg-white text-slate-900 font-bold py-3 px-4 rounded-xl transition-colors"
            >
              Verify
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 relative">
      <div className="max-w-2xl mx-auto space-y-8 mt-12">
        <header className="flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd"></path></svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white uppercase tracking-widest">Diagnostic Hub</h1>
            <p className="text-sm text-slate-400">Select active target environment</p>
          </div>
        </header>

        <div className="space-y-6">
          <section>
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 border-b border-slate-800 pb-2">Covert Audits (Stealth Mode)</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button 
                onClick={() => handleModuleSelect('/audit/bar')}
                className="group bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 p-6 rounded-2xl flex flex-col items-center justify-center gap-4 transition-all"
              >
                <span className="text-4xl group-hover:scale-110 transition-transform">🥃</span>
                <span className="font-semibold text-slate-300">Bar Premises</span>
              </button>
              
              <button 
                onClick={() => handleModuleSelect('/audit/restaurant')}
                className="group bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 p-6 rounded-2xl flex flex-col items-center justify-center gap-4 transition-all"
              >
                <span className="text-4xl group-hover:scale-110 transition-transform">🍽️</span>
                <span className="font-semibold text-slate-300 text-center">Restaurant &<br/>Floor</span>
              </button>

              <button 
                onClick={() => handleModuleSelect('/audit/hotel')}
                className="group bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 p-6 rounded-2xl flex flex-col items-center justify-center gap-4 transition-all"
              >
                <span className="text-4xl group-hover:scale-110 transition-transform">🏨</span>
                <span className="font-semibold text-slate-300 text-center">Hotel & Guest<br/>Services</span>
              </button>
            </div>
          </section>

          <section>
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 border-b border-slate-800 pb-2">Overt Audits (Announced)</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button 
                onClick={() => handleModuleSelect('/audit/overt-hotel')}
                className="group bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 p-6 rounded-2xl flex flex-col items-center justify-center gap-4 transition-all"
              >
                <span className="text-4xl group-hover:scale-110 transition-transform">📋</span>
                <span className="font-semibold text-slate-300 text-center">Overt Hotel<br/>Checklist</span>
              </button>
              {/* Placeholders for future overt audits */}
              <div className="border border-dashed border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center opacity-50">
                <span className="text-2xl mb-2">🔜</span>
                <span className="text-xs text-slate-500 font-semibold text-center">Pub Checklist<br/>(Coming Soon)</span>
              </div>
              <div className="border border-dashed border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center opacity-50">
                <span className="text-2xl mb-2">🔜</span>
                <span className="text-xs text-slate-500 font-semibold text-center">Restaurant Checklist<br/>(Coming Soon)</span>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 border-b border-slate-800 pb-2">Legal & Compliance Resources</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button 
                onClick={downloadDPIA}
                className="group bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 p-6 rounded-2xl flex flex-col items-center justify-center gap-4 transition-all"
              >
                <span className="text-4xl group-hover:scale-110 transition-transform">⚖️</span>
                <span className="font-semibold text-slate-300 text-center">DPIA Template<br/><span className="text-xs text-slate-500 font-normal">(Download Word Document)</span></span>
              </button>

              <a 
                href="https://www.itsmyapp.co.uk/admin/contracts"
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 p-6 rounded-2xl flex flex-col items-center justify-center gap-4 transition-all"
              >
                <span className="text-4xl group-hover:scale-110 transition-transform">✍️</span>
                <span className="font-semibold text-slate-300 text-center">Contract Management<br/><span className="text-xs text-slate-500 font-normal">(Sign & Manage Agreements)</span></span>
              </a>

              <a 
                href="https://www.itsmyapp.co.uk/room-inventory-pro"
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 p-6 rounded-2xl flex flex-col items-center justify-center gap-4 transition-all"
              >
                <span className="text-4xl group-hover:scale-110 transition-transform">📦</span>
                <span className="font-semibold text-slate-300 text-center">Room Inventory Pro<br/><span className="text-xs text-slate-500 font-normal">(Manage Room & Asset Inventories)</span></span>
              </a>
            </div>
          </section>
        </div>

        <div className="flex justify-center mt-8">
          <button 
            onClick={() => setShowHelpModal(true)}
            className="text-slate-500 hover:text-slate-300 text-sm font-medium flex items-center gap-2 transition-colors border border-slate-800 hover:border-slate-600 px-4 py-2 rounded-full"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            Help & Metric Glossary
          </button>
          <button 
            onClick={() => setShowConfigModal(true)}
            className="text-slate-500 hover:text-slate-300 text-sm font-medium flex items-center gap-2 transition-colors border border-slate-800 hover:border-slate-600 px-4 py-2 rounded-full ml-4"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            Configuration Manager
          </button>
        </div>
      </div>

      {/* Compliance Modal */}
      {pendingRoute && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 rounded-t-2xl">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                Legal Compliance Framework
              </h2>
              <button onClick={() => setPendingRoute(null)} className="text-slate-500 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300 leading-relaxed">
              <div>
                <h3 className="text-white font-bold mb-2">1. Core Compliance Facts</h3>
                <p className="mb-2"><strong>Zero-Server Architecture Immunity:</strong> The application operates strictly as a local processing engine. Because zero personal profiles or captured images are ever transmitted to an external network, Whole Hospitality does not possess, harvest, or process user session data.</p>
                <p className="mb-2"><strong>Neutral Utility Designation:</strong> Whole Hospitality is legally classified as a neutral software utility provider. The platform is entirely insulated from data processing liabilities.</p>
              </div>
              
              <div>
                <h3 className="text-white font-bold mb-2">2. Mandatory Instructions for Venue Operators</h3>
                <p className="mb-2"><strong>Data Controller Liability:</strong> Under UK law, the venue operator assumes 100% of the legal status of the Data Controller.</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Proportionality Window:</strong> Covert monitoring must be strictly time-limited (1-2 weeks max).</li>
                  <li><strong>Legitimate Interest:</strong> The audit must only be deployed where senior management has a reasonable suspicion of financial leakage or gross operational malpractice.</li>
                  <li><strong>Public Floor Boundary Safety:</strong> This tool is designed exclusively for use on the public trading floor. Never in private staff zones.</li>
                  <li><strong>Pre-Audit DPIA:</strong> Operators are legally required to have a completed Data Protection Impact Assessment (DPIA) on file.</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-white font-bold mb-2">3. Website Legal Disclaimer Notice</h3>
                <p>Whole Hospitality does not provide legal counsel. The venue operator assumes full responsibility for ensuring their deployment of this software aligns with the UK GDPR and local employment laws. Exported PDF files are standalone evidentiary objects; custody rests solely with the Data Controller.</p>
              </div>
            </div>
            
            <div className="p-6 border-t border-slate-800 bg-slate-900/50 rounded-b-2xl">
              <button 
                onClick={acceptCompliance}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl transition-colors tracking-wide"
              >
                I AGREE & UNDERSTAND
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 rounded-t-2xl shrink-0">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Metric Glossary & System Help
              </h2>
              <button onClick={() => setShowHelpModal(false)} className="text-slate-500 hover:text-white transition-colors p-2 bg-slate-800 rounded-full">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto text-sm text-slate-300 leading-relaxed custom-scrollbar">
              
              <div className="mb-8 bg-blue-900/10 border border-blue-900/30 p-4 rounded-xl text-blue-200">
                <h3 className="font-bold text-blue-400 mb-2 text-base">How to use the Audit Tool covertly:</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Adding Targets:</strong> When you tap "New Message (Add Target)", the screen mimics the iOS iMessage app. You can type the staff name or description (e.g. "Table 4") and hit Send. It acts as a perfect cover if someone looks over your shoulder.</li>
                  <li><strong>SAFE MODE:</strong> At the top of every audit screen is a faint <code>[ SAFE MODE ]</code> button. Tapping this instantly transforms the screen into a fake Google Search interface.</li>
                  <li><strong>Photo Evidence:</strong> In the Hotel module, tapping the circular camera icon at the top right covertly snaps a photo using the front or rear camera and saves it invisibly to your device until the final PDF is generated.</li>
                </ul>
              </div>

              <div className="space-y-8">
                {/* BAR METRICS */}
                <section>
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2 border-b border-slate-800 pb-2">
                    <span className="text-2xl">🥃</span> Bar Premises
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-red-400 font-bold mb-3 uppercase tracking-wider text-xs">🔴 Negative Infractions</h4>
                      <ul className="space-y-3">
                        <li><strong>Free Pours:</strong> Serving drinks without a jigger/optic.</li>
                        <li><strong>Incorrect Measure:</strong> Using wrong measure size (e.g., 50ml instead of 25ml).</li>
                        <li><strong>No Ring In:</strong> Taking cash but never entering the sale into the till.</li>
                        <li><strong>Charge Discrepancy:</strong> Undercharging friends or overcharging tourists.</li>
                        <li><strong>Till Left Open:</strong> Walking away while the cash drawer is wide open.</li>
                        <li><strong>Unrecorded Wastage:</strong> Dropping a drink without logging it in the wastage book.</li>
                        <li><strong>Giving Away Drinks:</strong> Unauthorized free drinks or heavy "comps".</li>
                        <li><strong>Dirty Glassware:</strong> Serving in a glass with lipstick or chips.</li>
                        <li><strong>Using Phone:</strong> Staff texting/browsing while customers wait.</li>
                        <li><strong>Eating/Drinking:</strong> Consuming food/drink behind the bar.</li>
                        <li><strong>Underage Staff Serving:</strong> Under 18 serving alcohol without supervision.</li>
                        <li><strong>No ID Check:</strong> Failing to Challenge 25 young patrons.</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-emerald-400 font-bold mb-3 uppercase tracking-wider text-xs">🟢 Positive Observations</h4>
                      <ul className="space-y-3">
                        <li><strong>Immediate Ring-In:</strong> Entering transactions the exact moment cash is taken.</li>
                        <li><strong>Consistent Till Closure:</strong> Keeping the drawer shut between transactions.</li>
                        <li><strong>Accurate Change:</strong> Visually counting back change to customers.</li>
                        <li><strong>Immediate Greeting:</strong> Acknowledging a guest within 30 seconds.</li>
                        <li><strong>Upselling / Upgrades:</strong> Suggesting premium brands or larger pours.</li>
                        <li><strong>Efficiency Under Pressure:</strong> Clean, methodical workflow during rush hour.</li>
                        <li><strong>Exact Measure Pouring:</strong> Perfect use of jiggers/optics.</li>
                        <li><strong>Active Spill Logging:</strong> Immediately recording dropped drinks.</li>
                        <li><strong>Perfect Glassware:</strong> Flawlessly clean, polished glasses used.</li>
                        <li><strong>Proactive Age Verification:</strong> Smoothly initiating Challenge 25 protocols.</li>
                        <li><strong>Responsible Service:</strong> Politely cutting off over-served guests.</li>
                        <li><strong>Cleanliness Maintenance:</strong> Wiping down the bar top instantly after service.</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* RESTAURANT METRICS */}
                <section>
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2 border-b border-slate-800 pb-2">
                    <span className="text-2xl">🍽️</span> Restaurant & Floor
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-red-400 font-bold mb-3 uppercase tracking-wider text-xs">🔴 Negative Infractions</h4>
                      <ul className="space-y-3">
                        <li><strong>Off-Pocket Cash:</strong> Settling a bill with cash that goes into an apron, not the till.</li>
                        <li><strong>Unrecorded Item Upgrade:</strong> e.g., Adding truffle fries without charging the supplement.</li>
                        <li><strong>Table Squatting Delay:</strong> Ignoring a table that clearly wants to pay and leave.</li>
                        <li><strong>Unauthorized Comps:</strong> Giving away desserts or drinks without manager approval.</li>
                        <li><strong>Till Left Open:</strong> Leaving the POS cash drawer unlocked.</li>
                        <li><strong>Menu Price Discrepancy:</strong> Charging a different price than listed on the menu.</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-emerald-400 font-bold mb-3 uppercase tracking-wider text-xs">🟢 Positive Observations</h4>
                      <ul className="space-y-3">
                        <li><strong>Allergen Verification:</strong> Explicitly asking guests about allergies before taking the order.</li>
                        <li><strong>High-Margin Upselling:</strong> Suggesting sides, bottled water, or premium pairings.</li>
                        <li><strong>Bill Accuracy:</strong> Delivering the bill with 100% correct items.</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* HOTEL METRICS */}
                <section>
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2 border-b border-slate-800 pb-2">
                    <span className="text-2xl">🏨</span> Hotel & Guest Services
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-red-400 font-bold mb-3 uppercase tracking-wider text-xs">🔴 Negative Infractions</h4>
                      <ul className="space-y-3">
                        <li><strong>Cash Upgrade Leak:</strong> Taking cash for a room upgrade and pocketing it.</li>
                        <li><strong>ID/Immigration Fail:</strong> Failing to scan or record required passports for foreign guests.</li>
                        <li><strong>Guest Data Exposure:</strong> Leaving guest registration cards or screens visible to the public.</li>
                        <li><strong>Deep-Clean Oversight:</strong> Missing obvious cleanliness issues in common areas or rooms.</li>
                        <li><strong>Amenities Malfunction:</strong> Broken keycards, missing towels, or empty soap dispensers not actioned.</li>
                        <li><strong>Unattended Desk:</strong> Leaving the front desk entirely empty without a "back in 5 mins" sign.</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-emerald-400 font-bold mb-3 uppercase tracking-wider text-xs">🟢 Positive Observations</h4>
                      <ul className="space-y-3">
                        <li><strong>Loyalty Program Push:</strong> Actively encouraging sign-ups for the hotel rewards program.</li>
                        <li><strong>Preemptive Concierge:</strong> Offering maps, dining tips, or umbrella assistance before being asked.</li>
                        <li><strong>Express Departure:</strong> Executing a flawless, rapid check-out process.</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* OVERT HOTEL METRICS */}
                <section>
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2 border-b border-slate-800 pb-2">
                    <span className="text-2xl">📋</span> Overt Hotel Checklist
                  </h3>
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <p className="text-slate-300 mb-3">
                        Unlike the covert modules, this is an announced, structured audit designed for a comprehensive walkthrough of the premises.
                      </p>
                      <ul className="list-disc pl-5 space-y-2 text-slate-300">
                        <li><strong>Pass / Fail / N/A System:</strong> Every metric must be explicitly graded. Marking an item as Fail highlights it in red on the final PDF.</li>
                        <li><strong>Mandatory Statutory Compliance:</strong> Section 5 contains critical safety and legal checks (Fire Safety, Food Hygiene, etc.). If any item in Section 5 is marked as Fail or left blank, the final PDF report will automatically generate a severe non-compliance alert on the cover page.</li>
                        <li><strong>Photographic Evidence:</strong> You can use the camera feed at the bottom of the page to snap pictures. Because this is an overt audit, the camera viewfinder is fully visible.</li>
                      </ul>
                    </div>
                  </div>
                </section>

              </div>
            </div>
          </div>
        </div>
      )}

      {/* Configuration Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 rounded-t-2xl shrink-0">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                Configuration Manager
              </h2>
              <button onClick={() => setShowConfigModal(false)} className="text-slate-500 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
              {configMessage && (
                <div className={`p-3 rounded-lg text-sm border ${isError ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
                  {configMessage}
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-white mb-2">Export Configuration</h3>
                  <p className="text-xs text-slate-400 mb-3">
                    Copy your local metrics, default venue, and staff profiles to migrate them to another device. No photos or timestamps are exported.
                  </p>
                  <button 
                    onClick={handleExportConfig}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 rounded-xl transition-colors text-sm border border-slate-700"
                  >
                    Export Configuration Token
                  </button>
                </div>
                
                <hr className="border-slate-800" />
                
                <div>
                  <h3 className="text-sm font-bold text-white mb-2">Import Configuration</h3>
                  <p className="text-xs text-slate-400 mb-3">
                    Paste a Base64 Configuration Token below to overwrite your local templates.
                  </p>
                  <div className="space-y-2">
                    <textarea 
                      value={importTokenText}
                      onChange={e => setImportTokenText(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-300 text-xs font-mono focus:outline-none focus:border-slate-600 h-24 resize-none"
                      placeholder="Paste Token Here..."
                    />
                    <button 
                      onClick={handleImportConfig}
                      className="w-full bg-[#0a84ff] hover:bg-blue-500 text-white font-medium py-3 rounded-xl transition-colors text-sm"
                    >
                      Import Configuration
                    </button>
                  </div>
                </div>
              </div>
              
              <MetricCustomizer />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
