import jsPDF from "jspdf";

export function generatePDF(contract: any, version: any, signatureBase64: string, auditData: any) {
  const doc = new jsPDF();

  const marginLeft = 20;
  let cursorY = 20;
  const pageWidth = doc.internal.pageSize.getWidth();

  // Función de ayuda para texto multilinea
  const printText = (text: string, fontSize = 12, isBold = false, color = "#000000", maxWidth = 170) => {
    doc.setFont("helvetica", isBold ? "bold" : "normal");
    doc.setFontSize(fontSize);
    doc.setTextColor(color);

    const lines = doc.splitTextToSize(text, maxWidth);

    if (cursorY + (lines.length * 7) > 280) {
      doc.addPage();
      cursorY = 20;
    }

    doc.text(lines, marginLeft, cursorY);
    cursorY += (lines.length * 7) + 5;
  };

  // 1. Título General
  printText("CONTRATO DE SERVICIOS", 20, true, "#273E59");
  printText(`Preparado para: ${contract.client_name}`, 14, false, "#64748B");
  printText(`Monto Total: ${version.currency} $${version.total_amount}`, 14, true, "#FBC02D");
  cursorY += 10;

  // 2. Cláusulas
  version.content.sections.forEach((section: any) => {
    printText(section.title, 14, true, "#273E59");
    printText(section.body, 11, false, "#333333");
    cursorY += 5;
  });

  // 3. Sello de Auditoría y Firma (Página Nueva si es necesario)
  doc.addPage();
  cursorY = 20;

  printText("CERTIFICADO DE FIRMA ELECTRÓNICA Y AUDITORÍA", 18, true, "#273E59");
  printText("Documento procesado bajo cumplimiento de trazabilidad.", 10, false, "#64748B");
  cursorY += 10;

  // Firmas
  const rightColumnX = 110;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor("#000000");
  doc.text("Firma del Cliente:", marginLeft, cursorY);
  doc.text("Por la Agencia:", rightColumnX, cursorY);

  cursorY += 5;
  doc.addImage(signatureBase64, 'PNG', marginLeft, cursorY, 80, 40);

  doc.setFont("helvetica", "italic");
  doc.setFontSize(11);
  doc.text("Documento validado y", rightColumnX, cursorY + 15);
  doc.text("aprobado por GALU.", rightColumnX, cursorY + 22);

  cursorY += 50;

  // Metadata
  printText("DATOS DE VALIDACIÓN:", 12, true, "#273E59");
  printText(`Identificador (Email verificado vía OTP): ${auditData.email}`, 10);
  printText(`Fecha y Hora de Firma (UTC): ${new Date(auditData.timestamp).toUTCString()}`, 10);
  printText(`Dirección IP del Firmante: ${auditData.ip}`, 10);
  printText(`Hash de Integridad (SHA-256): ${auditData.hash}`, 10);

  // Download
  doc.save(`Contrato_${contract.client_name.replace(/\s+/g, '_')}.pdf`);
}
