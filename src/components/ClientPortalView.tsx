"use client";

import { useState } from "react";
import { SignaturePad } from "@/components/SignaturePad";
import { ShieldCheck, Mail, CheckCircle2, Loader2 } from "lucide-react";
import { requestOTPAction, verifyOTPAction } from "@/app/actions/signing";
import { getAgencySettingsAction } from "@/app/actions/settings";
import { generatePDF } from "@/utils/pdfGenerator";

export default function ClientPortalView({ contract }: { contract: any }) {
  const version = Array.isArray(contract.contract_versions) ? contract.contract_versions[0] : contract.contract_versions;
  const sections = version.content.sections || [];

  const [acceptedSections, setAcceptedSections] = useState<Set<string>>(new Set());
  const [step, setStep] = useState<"READING" | "SIGNING" | "OTP" | "SUCCESS">("READING");
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [signerName, setSignerName] = useState("");

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAccept = (sectionId: string) => {
    setAcceptedSections((prev) => {
      const next = new Set(prev);
      next.add(sectionId);
      if (next.size === sections.length) {
        setTimeout(() => setStep("SIGNING"), 500);
      }
      return next;
    });
  };

  const handleSign = async (base64: string) => {
    setIsLoading(true);
    try {
      setSignatureData(base64);
      // Solicitar OTP al backend
      const result = await requestOTPAction(contract.id);
      if (result.success) {
        setStep("OTP");
      } else {
        setError(result.error || "Error al enviar OTP");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length !== 6) return;

    setIsLoading(true);
    setError("");

    try {
      const result = await verifyOTPAction(contract.id, code, signatureData!, signerName);
      if (result.success) {
        setStep("SUCCESS");
        // Generar PDF con assets de agencia
        const settings = await getAgencySettingsAction();
        generatePDF(contract, version, signatureData!, result.auditData, {
          logo_base64: settings?.logo_base64,
          agency_signature_base64: settings?.agency_signature_base64
        });
      } else {
        setError(result.error || "Código incorrecto");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-4 sm:px-6 font-serif text-slate-900">
      <div className="w-full max-w-3xl text-center mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-3">Contrato de Servicios</h1>
        <p className="text-slate-600 mt-2 text-lg">Preparado para: <span className="font-semibold text-slate-800">{contract.client_name}</span></p>
        <p className="text-slate-600 mt-1">Monto Total: <span className="font-semibold text-slate-800">{version.currency} ${version.total_amount}</span></p>
      </div>

      <div className="w-full max-w-3xl bg-white shadow-xl border border-slate-200 overflow-hidden">

        {step === "READING" && (
          <div className="p-8 md:p-12">
            <div className="bg-slate-50 text-slate-800 p-5 rounded border border-slate-200 mb-8 text-sm flex items-start space-x-3 text-justify leading-relaxed">
              <ShieldCheck className="w-6 h-6 flex-shrink-0 mt-0.5 text-slate-600" />
              <p>El presente documento establece los términos y condiciones de los servicios a proveer. Por favor, lea detenidamente cada una de las siguientes cláusulas y preste su conformidad haciendo clic en el botón correspondiente. Una vez aceptados todos los términos, se habilitará la opción para proceder con la firma electrónica y legal del documento.</p>
            </div>

            <div className="space-y-6">
              {sections.map((section: any) => {
                const isAccepted = acceptedSections.has(section.id);
                return (
                  <div key={section.id} className={`p-6 md:px-8 border-b-2 transition-all duration-300 ${isAccepted ? 'bg-slate-50 border-slate-200' : 'border-slate-100 hover:bg-slate-50/50'}`}>
                    <h3 className="text-xl font-bold text-slate-900 mb-4">{section.title}</h3>
                    <p className="text-slate-700 leading-relaxed mb-6 text-justify">{section.body}</p>

                    <button
                      onClick={() => handleAccept(section.id)}
                      disabled={isAccepted}
                      className={`flex items-center space-x-2 px-6 py-2.5 rounded shadow-sm font-medium transition-all ${isAccepted
                        ? 'bg-slate-200 text-slate-600'
                        : 'bg-slate-900 text-white hover:bg-slate-800'
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
          <div className="p-4 md:p-8 text-center animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Firma del Documento</h2>
            <p className="text-slate-600 mb-6">Por favor, dibuje su firma en el recuadro a continuación y complete su aclaración.</p>

            {error && <p className="text-red-500 mb-4">{error}</p>}

            {isLoading ? (
              <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-slate-900" /></div>
            ) : (
              <div className="flex flex-col items-center max-w-full">
                <div className="w-full max-w-md overflow-hidden bg-slate-50 border border-slate-200 rounded-lg shadow-inner mb-4">
                  <SignaturePad onSign={handleSign} />
                </div>
                <div className="w-full max-w-md text-left mt-2 mb-4">
                  <label htmlFor="signerName" className="block text-sm font-medium text-slate-700 mb-1">Aclaración (Nombre y Apellido)</label>
                  <input
                    type="text"
                    id="signerName"
                    value={signerName}
                    onChange={(e) => setSignerName(e.target.value)}
                    required
                    placeholder="Ej. Juan Pérez"
                    className="w-full px-4 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-slate-500 outline-none transition-all"
                  />
                  <p className="text-xs text-slate-500 mt-1">Este nombre se imprimirá debajo de su firma en el documento final.</p>
                </div>
              </div>
            )}
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
              {otp.map((digit, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-[var(--color-brand-navy)] focus:ring-0"
                />
              ))}
            </div>

            {error && <p className="text-red-500 font-medium mb-4">{error}</p>}

            <button
              onClick={handleVerify}
              disabled={isLoading || otp.join("").length !== 6}
              className="px-8 py-3 bg-slate-900 text-white font-bold rounded hover:bg-slate-800 transition-colors shadow-sm w-full max-w-xs disabled:opacity-50 flex items-center justify-center mx-auto"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Proceder a la Firma"}
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
              La firma electrónica ha sido validada. Su copia en formato PDF con el sello legal de auditoría se generará automáticamente en un momento.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
