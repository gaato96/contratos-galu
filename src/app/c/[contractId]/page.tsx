"use client";

import { useState } from "react";
import { SignaturePad } from "@/components/SignaturePad";
import { ShieldCheck, Mail, CheckCircle2 } from "lucide-react";

// Datos de prueba (se reemplazarán con DB)
const mockContract = {
  id: "123",
  clientName: "Tech Startup S.A.",
  sections: [
    { id: "s1", title: "1. Alcance de los Servicios", body: "El Desarrollador se compromete a diseñar y programar una PWA según los requerimientos adjuntos en el Anexo A." },
    { id: "s2", title: "2. Presupuesto y Pagos", body: "El costo total es de $4,500 USD, pagaderos en tres cuotas: 30% inicial, 40% al primer hito, 30% a la entrega." },
    { id: "s3", title: "3. Propiedad Intelectual", body: "El Cliente obtendrá una licencia de uso exclusiva sobre el producto entregable una vez acreditado el pago total." },
    { id: "s4", title: "4. Limitación de Responsabilidad", body: "El Desarrollador no será responsable por lucro cesante derivado del uso del software." },
  ]
};

export default function ClientPortalPage() {
  const [acceptedSections, setAcceptedSections] = useState<Set<string>>(new Set());
  const [step, setStep] = useState<"READING" | "SIGNING" | "OTP" | "SUCCESS">("READING");
  const [signatureData, setSignatureData] = useState<string | null>(null);

  const handleAccept = (sectionId: string) => {
    setAcceptedSections((prev) => {
      const next = new Set(prev);
      next.add(sectionId);
      if (next.size === mockContract.sections.length) {
        setTimeout(() => setStep("SIGNING"), 500);
      }
      return next;
    });
  };

  const handleSign = (base64: string) => {
    setSignatureData(base64);
    setStep("OTP");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6">
      
      <div className="w-full max-w-3xl text-center mb-8">
        <h1 className="text-3xl font-bold text-[var(--color-brand-navy)]">Contrato de Servicios</h1>
        <p className="text-gray-600 mt-2">Preparado para {mockContract.clientName}</p>
      </div>

      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        
        {step === "READING" && (
          <div className="p-8">
            <div className="bg-blue-50 text-blue-800 p-4 rounded-lg mb-8 text-sm flex items-start space-x-3">
              <ShieldCheck className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p>Por favor, lea cada sección detenidamente y marque su conformidad. Una vez aceptadas todas las secciones, podrá proceder a la firma electrónica del documento.</p>
            </div>

            <div className="space-y-6">
              {mockContract.sections.map((section) => {
                const isAccepted = acceptedSections.has(section.id);
                return (
                  <div key={section.id} className={`p-6 rounded-xl border-2 transition-all duration-300 ${isAccepted ? 'border-[var(--color-brand-gold)] bg-yellow-50/30' : 'border-gray-200 hover:border-gray-300'}`}>
                    <h3 className="text-xl font-bold text-[var(--color-brand-navy)] mb-3">{section.title}</h3>
                    <p className="text-gray-700 leading-relaxed mb-6">{section.body}</p>
                    
                    <button
                      onClick={() => handleAccept(section.id)}
                      disabled={isAccepted}
                      className={`flex items-center space-x-2 px-6 py-2.5 rounded-lg font-medium transition-all ${
                        isAccepted 
                        ? 'bg-[var(--color-brand-gold)] text-[var(--color-brand-navy-dark)]'
                        : 'bg-[var(--color-brand-navy)] text-white hover:bg-[var(--color-brand-navy-dark)] shadow-md'
                      }`}
                    >
                      {isAccepted ? (
                        <>
                          <CheckCircle2 className="w-5 h-5" />
                          <span>Sección Aceptada</span>
                        </>
                      ) : (
                        <span>Acepto esta sección</span>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {step === "SIGNING" && (
          <div className="p-8 text-center animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-2xl font-bold text-[var(--color-brand-navy)] mb-2">Firma del Documento</h2>
            <p className="text-gray-600 mb-8">Por favor, dibuje su firma en el recuadro a continuación.</p>
            
            <SignaturePad onSign={handleSign} />
          </div>
        )}

        {step === "OTP" && (
          <div className="p-8 text-center animate-in fade-in slide-in-from-bottom-4">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-[var(--color-brand-navy)] mb-2">Verificación de Identidad</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">Hemos enviado un código de 6 dígitos a su correo electrónico. Ingréselo a continuación para confirmar su identidad y finalizar la firma electrónica.</p>
            
            <div className="flex justify-center space-x-3 mb-8">
              {[...Array(6)].map((_, i) => (
                <input 
                  key={i} 
                  type="text" 
                  maxLength={1} 
                  className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-[var(--color-brand-navy)] focus:ring-0" 
                />
              ))}
            </div>

            <button
              onClick={() => setStep("SUCCESS")}
              className="px-8 py-3 bg-[var(--color-brand-gold)] text-[var(--color-brand-navy-dark)] font-bold rounded-lg hover:bg-[var(--color-brand-gold-dark)] transition-colors shadow-md w-full max-w-xs"
            >
              Verificar y Firmar
            </button>
          </div>
        )}

        {step === "SUCCESS" && (
          <div className="p-12 text-center animate-in zoom-in duration-500">
            <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-[var(--color-brand-navy)] mb-4">Contrato Firmado Exitosamente</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              La firma electrónica ha sido validada. Hemos enviado una copia en formato PDF con el sello de auditoría a su correo electrónico.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
