import jsPDF from "jspdf";

interface AgencyAssets {
  logo_base64?: string | null;
  agency_signature_base64?: string | null;
}

export function generatePDF(contract: any, version: any, signatureBase64: string, auditData: any, agencyAssets?: AgencyAssets) {
  const doc = new jsPDF();

  const marginLeft = 20;
  let cursorY = 25;
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - (marginLeft * 2);

  // Helper for multi-line text with basic justification or left align
  const printText = (text: string, fontSize = 11, isBold = false, align: "left" | "center" = "left", customYOffset = 0) => {
    doc.setFont("helvetica", isBold ? "bold" : "normal");
    doc.setFontSize(fontSize);
    doc.setTextColor("#000000"); // Strict black for legal documents

    const lines = doc.splitTextToSize(text, contentWidth);

    if (cursorY + (lines.length * 6) > 280) {
      doc.addPage();
      cursorY = 20;
    }

    if (align === "center") {
      lines.forEach((line: string) => {
        const x = (pageWidth - doc.getTextWidth(line)) / 2;
        doc.text(line, x, cursorY);
        cursorY += 6;
      });
    } else {
      doc.text(lines, marginLeft, cursorY);
      cursorY += (lines.length * 6);
    }

    cursorY += customYOffset;
  };

  // 0. Logo de la Agencia (si existe)
  if (agencyAssets?.logo_base64) {
    try {
      doc.addImage(agencyAssets.logo_base64, 'PNG', marginLeft, cursorY - 10, 35, 15);
      cursorY += 12;
    } catch (e) {
      console.warn("No se pudo inyectar el logo:", e);
    }
  }

  // 1. Título General
  cursorY += 10;
  printText("CONTRATO DE PRESTACION DE SERVICIOS PROFESIONALES", 14, true, "center", 8);

  // 2. Declaración Inicial
  const introText = `Conste por el presente documento, el Contrato de Prestación de Servicios que celebran, de una parte Gastón Gutierrez en representación de GALU (en adelante, "LA AGENCIA"), y de la otra parte ${contract.client_name} (en adelante, "EL CLIENTE"); el cual se rige bajo las siguientes declaraciones y cláusulas:`;
  printText(introText, 11, false, "left", 5);

  // 3. Cláusulas
  version.content.sections.forEach((section: any, index: number) => {
    cursorY += 3;
    const clauseHeader = `CLÁUSULA ${index + 1} - ${section.title.toUpperCase()}`;
    printText(clauseHeader, 11, true, "left", 1);

    // Body text
    printText(section.body, 11, false, "left", 4);
  });

  // 4. Sello de Auditoría y Firma (Página Nueva siempre para asegurar espacio de firmas)
  doc.addPage();
  cursorY = 25;

  printText("CERTIFICADO DE FIRMA ELECTRÓNICA Y AUDITORÍA", 14, true, "center", 6);
  printText("El presente documento ha sido rubricado y procesado exitosamente bajo cumplimiento de trazabilidad electrónica estricta. Las partes reconocen la validez jurídica de este instrumento.", 10, false, "left", 10);

  cursorY += 10;

  // Firmas layout
  const rightColumnX = 110;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Firma de EL CLIENTE:", marginLeft, cursorY);
  doc.text("Firma de LA AGENCIA:", rightColumnX, cursorY);

  cursorY += 5;
  // Cliente Signature Image
  doc.addImage(signatureBase64, 'PNG', marginLeft, cursorY, 50, 25);

  // Agencia Signature Image (si existe) o texto de placeholder
  if (agencyAssets?.agency_signature_base64) {
    try {
      doc.addImage(agencyAssets.agency_signature_base64, 'PNG', rightColumnX, cursorY, 50, 25);
    } catch (e) {
      console.warn("No se pudo inyectar la firma de agencia:", e);
      doc.setFont("helvetica", "italic");
      doc.text("Documento validado y", rightColumnX, cursorY + 10);
      doc.text("aprobado electrónicamente.", rightColumnX, cursorY + 16);
    }
  } else {
    doc.setFont("helvetica", "italic");
    doc.text("Documento validado y", rightColumnX, cursorY + 10);
    doc.text("aprobado electrónicamente.", rightColumnX, cursorY + 16);
  }

  cursorY += 35;

  // Aclaraciones
  doc.setFont("helvetica", "bold");
  doc.text(`Aclaración: ${auditData.signerName || contract.client_name}`, marginLeft, cursorY);
  doc.text("Aclaración: Gastón Gutierrez", rightColumnX, cursorY);

  doc.setFont("helvetica", "normal");
  doc.text(`Email: ${auditData.email}`, marginLeft, cursorY + 6);
  doc.text("Dueño de Galu Diseño Web", rightColumnX, cursorY + 6);

  cursorY += 30;

  // Metadata de Auditoría técnica
  doc.setDrawColor(200);
  doc.line(marginLeft, cursorY - 5, pageWidth - marginLeft, cursorY - 5);

  printText("DATOS TÉCNICOS DE VALIDACIÓN OTP:", 9, true, "left", 2);
  printText(`Fecha y Hora de Firma (UTC): ${new Date(auditData.timestamp).toUTCString()}`, 9);
  printText(`Dirección IP del Firmante: ${auditData.ip}`, 9);
  printText(`Hash de Integridad (SHA-256): ${auditData.hash}`, 9);
  printText(`Identificador Verificado: ${auditData.email}`, 9);

  // Download
  doc.save(`Contrato_${contract.client_name.replace(/\s+/g, '_')}.pdf`);
}
