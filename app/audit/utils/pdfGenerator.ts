import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface PdfExportData {
  moduleType: "BAR" | "RESTAURANT" | "HOTEL";
  siteName: string;
  auditorName: string;
  staffList: string[];
  metrics: {
    negative: { label: string; count: number; events: any[] }[];
    positive: { label: string; count: number; events: any[] }[];
    timers: { label: string; events: any[] }[];
  };
  captures: { dataUrl: string; timestamp: number }[];
}

const getBase64ImageFromUrl = async (imageUrl: string) => {
  try {
    const res = await fetch(imageUrl);
    const blob = await res.blob();
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    return null;
  }
};

const getImageDimensions = (base64: string): Promise<{w: number, h: number}> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ w: img.width, h: img.height });
    img.onerror = () => resolve({ w: 40, h: 20 });
    img.src = base64;
  });
};

export const generateUniversalPDF = async (data: PdfExportData) => {
  const doc = new jsPDF();
  
  // Try loading logos
  const logoBase64 = await getBase64ImageFromUrl('/logo.png');

  let ratio = 2; // default fallback ratio
  if (logoBase64) {
    const dims = await getImageDimensions(logoBase64);
    if (dims.h > 0) ratio = dims.w / dims.h;
  }

  let title = "Covert Premises Audit Report";
  if (data.moduleType === "BAR") title = "Covert Bar Premises Audit Report";
  if (data.moduleType === "RESTAURANT") title = "Covert Restaurant Audit Report";
  if (data.moduleType === "HOTEL") title = "Covert Hotel & Guest Services Audit Report";

  // 1. Header
  if (logoBase64) {
    const logoH = 15;
    const logoW = logoH * ratio;
    doc.addImage(logoBase64, 'PNG', 14, 10, logoW, logoH);
  }

  doc.setFontSize(18);
  doc.text(title, 14, 40);
  
  doc.setFontSize(11);
  doc.text(`Site Name: ${data.siteName || "Not Specified"}`, 14, 50);
  doc.text(`Auditor: ${data.auditorName || "Not Specified"}`, 14, 56);
  doc.text(`Date of Export: ${new Date().toLocaleString('en-GB')}`, 14, 62);

  // 2. Executive Summary
  doc.setFontSize(14);
  doc.text("Executive Summary", 14, 75);

  const activeNegative = data.metrics.negative.filter(m => m.count > 0).map(m => [m.label, m.count]);
  let finalY = 80;

  if (activeNegative.length > 0) {
    autoTable(doc, {
      startY: finalY,
      head: [['Negative Infractions', 'Total Incidents']],
      body: activeNegative,
      theme: 'grid',
      headStyles: { fillColor: [220, 38, 38] },
      margin: { bottom: 30 }
    });
    finalY = (doc as any).lastAutoTable.finalY + 15;
  } else {
    doc.setFontSize(10);
    doc.text("No negative infractions recorded.", 14, finalY);
    finalY += 10;
  }

  const activePositive = data.metrics.positive.filter(m => m.count > 0).map(m => [m.label, m.count]);
  if (activePositive.length > 0) {
    autoTable(doc, {
      startY: finalY,
      head: [['Positive Observations', 'Total Commendations']],
      body: activePositive,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129] },
      margin: { bottom: 30 }
    });
    finalY = (doc as any).lastAutoTable.finalY + 15;
  } else {
    doc.setFontSize(10);
    doc.text("No positive commendations recorded.", 14, finalY);
    finalY += 10;
  }

  // 3. Staff Breakdown
  if (data.staffList.length > 1) {
    doc.setFontSize(14);
    doc.text("Staff Breakdown", 14, finalY);

    const staffBreakdownData: any[] = [];
    data.staffList.forEach(staffMem => {
      let staffTotal = 0;
      data.metrics.negative.forEach(m => {
        staffTotal += m.events.filter(e => e.staff === staffMem).length;
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
  const events: any[] = [];
  
  data.metrics.negative.forEach(m => {
    m.events.forEach(e => events.push({ type: m.label, time: new Date(e.timestamp), staff: e.staff || "Unknown", detail: e.detail }));
  });
  data.metrics.positive.forEach(m => {
    m.events.forEach(e => events.push({ type: `[+] ${m.label}`, time: new Date(e.timestamp), staff: e.staff || "Unknown", detail: e.detail }));
  });
  data.metrics.timers.forEach(m => {
    m.events.forEach(e => events.push({ type: `[Timer] ${m.label}`, time: new Date(e.timestamp), staff: e.staff || "Unknown", detail: `${e.duration} secs` }));
  });

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
  if (data.captures.length > 0) {
    doc.addPage();
    doc.setFontSize(14);
    doc.text("Photographic Evidence", 14, 20);
    
    let yPos = 30;
    data.captures.forEach((cap: any, index: number) => {
      if (yPos > 240) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFontSize(10);
      doc.text(`Evidence #${index + 1} - Captured: ${new Date(cap.timestamp).toLocaleString('en-GB')}`, 14, yPos);
      doc.addImage(cap.dataUrl, 'JPEG', 14, yPos + 5, 120, 90);
      yPos += 105;
    });
  }

  // 6. Add Metric Glossary Appendix
  doc.addPage();
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text(`Appendix: ${data.moduleType} Metric Glossary`, 14, 20);

  let glossaryData: any[] = [];
  
  if (data.moduleType === "BAR") {
    glossaryData = [
      [{ content: "[NEGATIVE INFRACTIONS]", styles: { fontStyle: 'bold', textColor: [220, 38, 38], fontSize: 12 } }],
      ["Free Pours: Serving drinks without a jigger/optic."],
      ["Incorrect Measure: Using wrong measure size (e.g., 50ml instead of 25ml)."],
      ["No Ring In: Taking cash but never entering the sale into the till."],
      ["Charge Discrepancy: Undercharging friends or overcharging tourists."],
      ["Till Left Open: Walking away while the cash drawer is wide open."],
      ["Unrecorded Wastage: Dropping a drink without logging it in the wastage book."],
      ["Giving Away Drinks: Unauthorized free drinks or heavy 'comps'."],
      ["Dirty Glassware: Serving in a glass with lipstick or chips."],
      ["Using Phone: Staff texting/browsing while customers wait."],
      ["Eating/Drinking: Consuming food/drink behind the bar."],
      ["Underage Staff Serving: Under 18 serving alcohol without supervision."],
      ["No ID Check: Failing to Challenge 25 young patrons."],
      [{ content: "[POSITIVE OBSERVATIONS]", styles: { fontStyle: 'bold', textColor: [16, 185, 129], fontSize: 12, cellPadding: { top: 10 } } }],
      ["Immediate Ring-In: Entering transactions the exact moment cash is taken."],
      ["Consistent Till Closure: Keeping the drawer shut between transactions."],
      ["Accurate Change: Visually counting back change to customers."],
      ["Immediate Greeting: Acknowledging a guest within 30 seconds."],
      ["Upselling / Upgrades: Suggesting premium brands or larger pours."],
      ["Efficiency Under Pressure: Clean, methodical workflow during rush hour."],
      ["Exact Measure Pouring: Perfect use of jiggers/optics."],
      ["Active Spill Logging: Immediately recording dropped drinks."],
      ["Perfect Glassware: Flawlessly clean, polished glasses used."],
      ["Proactive Age Verification: Smoothly initiating Challenge 25 protocols."],
      ["Responsible Service: Politely cutting off over-served guests."],
      ["Cleanliness Maintenance: Wiping down the bar top instantly after service."]
    ];
  } else if (data.moduleType === "RESTAURANT") {
    glossaryData = [
      [{ content: "[NEGATIVE INFRACTIONS]", styles: { fontStyle: 'bold', textColor: [220, 38, 38], fontSize: 12 } }],
      ["Off-Pocket Cash: Settling a bill with cash that goes into an apron, not the till."],
      ["Unrecorded Item Upgrade: e.g., Adding truffle fries without charging the supplement."],
      ["Table Squatting Delay: Ignoring a table that clearly wants to pay and leave."],
      ["Unauthorized Comps: Giving away desserts or drinks without manager approval."],
      ["Till Left Open: Leaving the POS cash drawer unlocked."],
      ["Menu Price Discrepancy: Charging a different price than listed on the menu."],
      [{ content: "[POSITIVE OBSERVATIONS]", styles: { fontStyle: 'bold', textColor: [16, 185, 129], fontSize: 12, cellPadding: { top: 10 } } }],
      ["Allergen Verification: Explicitly asking guests about allergies before taking the order."],
      ["High-Margin Upselling: Suggesting sides, bottled water, or premium pairings."],
      ["Bill Accuracy: Delivering the bill with 100% correct items."]
    ];
  } else if (data.moduleType === "HOTEL") {
    glossaryData = [
      [{ content: "[NEGATIVE INFRACTIONS]", styles: { fontStyle: 'bold', textColor: [220, 38, 38], fontSize: 12 } }],
      ["Cash Upgrade Leak: Taking cash for a room upgrade and pocketing it."],
      ["ID/Immigration Fail: Failing to scan or record required passports for foreign guests."],
      ["Guest Data Exposure: Leaving guest registration cards or screens visible to the public."],
      ["Deep-Clean Oversight: Missing obvious cleanliness issues in common areas or rooms."],
      ["Amenities Malfunction: Broken keycards, missing towels, or empty soap dispensers not actioned."],
      ["Unattended Desk: Leaving the front desk entirely empty without a 'back in 5 mins' sign."],
      [{ content: "[POSITIVE OBSERVATIONS]", styles: { fontStyle: 'bold', textColor: [16, 185, 129], fontSize: 12, cellPadding: { top: 10 } } }],
      ["Loyalty Program Push: Actively encouraging sign-ups for the hotel rewards program."],
      ["Preemptive Concierge: Offering maps, dining tips, or umbrella assistance before being asked."],
      ["Express Departure: Executing a flawless, rapid check-out process."]
    ];
  }

  autoTable(doc, {
    startY: 30,
    body: glossaryData,
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 3, textColor: [50, 50, 50] },
    columnStyles: { 0: { cellWidth: 'auto' } },
    margin: { bottom: 30 }
  });

  // 7. Add Compliance Framework Appendix
  doc.addPage();
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text("Appendix: Legal Standing & Deployment Guide", 14, 20);

  const complianceData = [
    [{ content: "1. Core Compliance Facts: Where Whole Hospitality Stands", styles: { fontStyle: 'bold', fontSize: 12 } }],
    ["Zero-Server Architecture Immunity: The application operates strictly as a local processing engine. Because zero personal profiles, timestamp logs, or captured images are ever transmitted to or stored on an external network, Whole Hospitality does not possess, harvest, or process user session data."],
    ["Neutral Utility Designation: Whole Hospitality is legally classified as a neutral software utility provider. The software stands in the exact same regulatory category as an offline spreadsheet or a local text editor."],
    ["Regulatory Exemption: Because Whole Hospitality never handles or determines the destination of the audit data, Whole Hospitality is not a Data Controller nor a Data Processor under the UK GDPR and Data Protection Act 2018. The platform is entirely insulated from data processing liabilities, data breach regimes, and Subject Access Requests (SARs)."],
    ["Immediate Client-Side Data Erasure: To enforce strict operational confidentiality, tapping \"Start New Audit\" completely purges all local session variables, nested state configurations, and temporary browser local storage. No recovery infrastructure exists on the network to retrieve purged logs."],
    [{ content: "2. Mandatory Instructions for Venue Operators (The Data Controllers)", styles: { fontStyle: 'bold', fontSize: 12, cellPadding: { top: 10 } } }],
    ["Under UK law, the venue operator utilizing this app assumes 100% of the legal status of the Data Controller. To ensure that any exported PDF report stands up as admissible evidence in an employment disciplinary hearing or tribunal, operators must adhere strictly to the following parameters:"],
    ["The Proportionality Window (1–2 Weeks Max): Covert monitoring must be strictly time-limited. To comply with Information Commissioner's Office (ICO) guidelines, a targeted audit should run no longer than 1 to 2 weeks, or be confined to a handful of high-risk shifts to catch a specific pattern of financial leakage. Indefinite or continuous routine tracking is unlawful."],
    ["Establish Legitimate Interest: The audit must only be deployed where senior management has a reasonable, documented suspicion of financial leakage, internal theft, fraud, or gross operational malpractice. Using the tool for casual or continuous employee performance trailing is prohibited."],
    ["Public Floor Boundary Safety: This tool is designed exclusively for use on the public trading floor of the venue. In accordance with UK employment case law, employees serving the public have a reduced expectation of privacy in these spaces. It must never be used in private staff zones, changing rooms, or break areas."],
    ["Immediate Cessation of Tracking: The moment \"the smoking gun\" evidence is gathered and verified to initiate formal disciplinary action, covert monitoring must stop immediately."],
    ["Mandatory Pre-Audit DPIA: Before launching an audit, operators are legally required to have a completed Data Protection Impact Assessment (DPIA) on file that explicitly details why a time-limited, covert cash-loss investigation is necessary and proportionate for their business."],
    [{ content: "3. Website Legal Disclaimer Notice", styles: { fontStyle: 'bold', fontSize: 12, cellPadding: { top: 10 } } }],
    ["Disclaimer for Users: Whole Hospitality provides this Covert Audit Tool as an offline-first analytical utility. Whole Hospitality does not provide legal counsel or employment law representation. The venue operator assumes full responsibility for ensuring their deployment of this software aligns with the UK GDPR, the Data Protection Act 2018, and local employment laws. Exported PDF files are standalone evidentiary objects; custody, protection, and legal admissibility of the generated reports rest solely with the Data Controller."]
  ];

  autoTable(doc, {
    startY: 30,
    body: complianceData as any,
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 2, textColor: [50, 50, 50] },
    columnStyles: { 0: { cellWidth: 'auto' } },
    margin: { bottom: 30 }
  });

  // 8. Draw Legal Footer on Every Page
  const pageCount = (doc as any).internal.getNumberOfPages();
  const pageWidth = (doc as any).internal.pageSize.getWidth();
  const pageHeight = (doc as any).internal.pageSize.getHeight();
  const exportTimestamp = new Date().toLocaleString('en-GB');

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    // Separator Line
    doc.setDrawColor(100, 116, 139);
    doc.setLineWidth(0.5);
    doc.line(14, pageHeight - 25, pageWidth - 14, pageHeight - 25);
    
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

    if (logoBase64) {
      // Scale watermark at bottom center
      const wmH = 8;
      const wmW = wmH * ratio;
      doc.addImage(logoBase64, 'PNG', (pageWidth - wmW) / 2, pageHeight - 15, wmW, wmH);
    }
    
    // Column Right
    doc.text("Data Controller Local Device Export:", pageWidth - 14, pageHeight - 19, { align: "right" });
    doc.text(`[${exportTimestamp}]`, pageWidth - 14, pageHeight - 15, { align: "right" });
    doc.text("© 2026 Whole Hospitality. All Rights Reserved.", pageWidth - 14, pageHeight - 7, { align: "right" });
  }

  // 8. Download
  const filename = `Audit_${data.siteName.replace(/\s+/g, '_') || 'Report'}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);

  // 9. Email Trigger
  const subject = encodeURIComponent(`[CONFIDENTIAL] Covert Audit Report: ${data.siteName || 'Venue'} - ${new Date().toLocaleDateString('en-GB')}`);
  const totalObservations = data.metrics.negative.reduce((sum, m) => sum + m.count, 0) + 
                            data.metrics.positive.reduce((sum, m) => sum + m.count, 0);

  const body = encodeURIComponent(`CONFIDENTIAL TARGETED AUDIT REPORT
  
Site Name: ${data.siteName || 'Not Specified'}
Auditor: ${data.auditorName || 'Not Specified'}
Date: ${new Date().toLocaleString('en-GB')}
Total Observations Logged: ${totalObservations}

Please find the detailed PDF Executive Summary, Staff Breakdown, and Photographic Evidence attached to this email.

*** IMPORTANT ***
DUE TO BROWSER SECURITY, YOU MUST MANUALLY ATTACH THE DOWNLOADED PDF FILE TO THIS EMAIL BEFORE SENDING!
`);

  setTimeout(() => {
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }, 500);
};
