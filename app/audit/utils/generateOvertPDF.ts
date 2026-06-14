import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { OVERT_HOTEL_CHECKLIST } from "../overt-hotel/checklist";

export const generateOvertHotelPDF = async (data: {
  siteName: string;
  auditorName: string;
  date: string;
  roomsChecked: string[];
  checklistState: Record<string, "Pass" | "Fail" | "NA">;
  captures: { timestamp: string; dataUrl: string }[];
  isCompliant: boolean;
}) => {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // 1. Title & Header
  doc.setFillColor(30, 41, 59); // slate-800
  doc.rect(0, 0, pageWidth, 40, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.text("Announced Hotel Audit Report", 14, 25);
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  
  let yPos = 50;
  
  doc.setFont("helvetica", "bold");
  doc.text("Premises:", 14, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(data.siteName || "Not Specified", 40, yPos);
  
  yPos += 8;
  doc.setFont("helvetica", "bold");
  doc.text("Auditor:", 14, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(data.auditorName || "Not Specified", 40, yPos);
  
  yPos += 8;
  doc.setFont("helvetica", "bold");
  doc.text("Date:", 14, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(data.date, 40, yPos);
  
  yPos += 8;
  doc.setFont("helvetica", "bold");
  doc.text("Rooms:", 14, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(data.roomsChecked.length > 0 ? data.roomsChecked.join(", ") : "None specified", 40, yPos);
  
  yPos += 15;
  
  // Non-Compliance Alert
  if (!data.isCompliant) {
    doc.setFillColor(220, 38, 38); // red-600
    doc.rect(14, yPos, pageWidth - 28, 15, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("NON-COMPLIANCE ALERT: STATUTORY FAILURE DETECTED", 20, yPos + 10);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    yPos += 25;
  }
  
  // 2. Checklist Sections
  OVERT_HOTEL_CHECKLIST.forEach((section) => {
    // Check if page break needed
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(section.title, 14, yPos);
    yPos += 8;
    
    section.subsections.forEach((sub) => {
      const tableData = sub.items.map(item => {
        const state = data.checklistState[item.id] || "NA";
        return [item.label, item.description, state];
      });
      
      autoTable(doc, {
        startY: yPos,
        head: [[sub.title, "Description", "Result"]],
        body: tableData,
        theme: "grid",
        headStyles: { fillColor: [51, 65, 85] }, // slate-700
        columnStyles: {
          0: { cellWidth: 40, fontStyle: 'bold' },
          1: { cellWidth: 'auto' },
          2: { cellWidth: 20, halign: 'center', fontStyle: 'bold' }
        },
        didParseCell: function(data: any) {
          if (data.section === 'body' && data.column.index === 2) {
            if (data.cell.raw === "Pass") {
              data.cell.styles.textColor = [22, 163, 74]; // green-600
            } else if (data.cell.raw === "Fail") {
              data.cell.styles.textColor = [220, 38, 38]; // red-600
            } else {
              data.cell.styles.textColor = [100, 116, 139]; // slate-500
            }
          }
        }
      });
      
      yPos = (doc as any).lastAutoTable.finalY + 10;
    });
  });
  
  // 3. Photographic Evidence
  if (data.captures.length > 0) {
    doc.addPage();
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Photographic Evidence", 14, 20);
    
    yPos = 30;
    const pageHeight = doc.internal.pageSize.getHeight();
    
    data.captures.forEach((cap: any, index: number) => {
      if (yPos + 100 > pageHeight - 20) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Image ${index + 1} - Captured: ${cap.timestamp}`, 14, yPos);
      
      try {
        const imgProps = doc.getImageProperties(cap.dataUrl);
        const maxWidth = 180;
        const maxHeight = 90;
        let imgWidth = imgProps.width;
        let imgHeight = imgProps.height;
        const ratio = Math.min(maxWidth / imgWidth, maxHeight / imgHeight);
        imgWidth = imgWidth * ratio;
        imgHeight = imgHeight * ratio;
        
        doc.addImage(cap.dataUrl, 'JPEG', 14, yPos + 5, imgWidth, imgHeight);
        yPos += imgHeight + 20;
      } catch (e) {
        doc.text("[Image processing failed]", 14, yPos + 10);
        yPos += 20;
      }
    });
  }
  
  // 4. Footer on all pages
  const pageCount = (doc as any).internal.getNumberOfPages();
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
    doc.text("Targeted Announced Audit", 14, pageHeight - 15);
    doc.text(`Page ${i} of ${pageCount}`, 14, pageHeight - 11);
    doc.text("wholehospitality.co.uk", 14, pageHeight - 7);
    
    // Column Center
    const centerText = "Local Device Export - Zero-Server Architecture";
    const textWidth = doc.getTextWidth(centerText);
    doc.text(centerText, (pageWidth - textWidth) / 2, pageHeight - 19);
    
    // Column Right
    doc.text("Data Controller Local Device Export:", pageWidth - 14, pageHeight - 19, { align: "right" });
    doc.text(`[${exportTimestamp}]`, pageWidth - 14, pageHeight - 15, { align: "right" });
    doc.text("© 2026 Whole Hospitality. All Rights Reserved.", pageWidth - 14, pageHeight - 7, { align: "right" });
  }
  
  // Output
  const filename = `Overt_Hotel_Audit_${data.siteName.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.pdf`;
  doc.save(filename);
};
