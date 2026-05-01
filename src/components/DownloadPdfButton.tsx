"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { getSignedContractData } from "@/app/actions/contracts";
import { getAgencySettingsAction } from "@/app/actions/settings";
import { generatePDF } from "@/utils/pdfGenerator";

export default function DownloadPdfButton({ contractId }: { contractId: string }) {
    const [isLoading, setIsLoading] = useState(false);

    const handleDownload = async () => {
        setIsLoading(true);
        try {
            const [data, settings] = await Promise.all([
                getSignedContractData(contractId),
                getAgencySettingsAction()
            ]);
            if (data) {
                generatePDF(data.contract, data.version, data.signature.base64_image, data.auditLog.metadata, {
                    logo_base64: settings?.logo_base64,
                    agency_signature_base64: settings?.agency_signature_base64
                });
            } else {
                alert("No se pudo obtener la información completa del contrato firmado.");
            }
        } catch (e: any) {
            console.error(e);
            alert("Error al descargar el contrato.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleDownload}
            disabled={isLoading}
            className="text-green-600 hover:text-green-800 text-sm font-medium flex items-center space-x-1 ml-4"
        >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span>PDF</span>
        </button>
    );
}
