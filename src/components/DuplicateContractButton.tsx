"use client";

import { useState } from "react";
import { Copy, Loader2 } from "lucide-react";
import { duplicateContractAction } from "@/app/actions/contracts";

export default function DuplicateContractButton({ contractId }: { contractId: string }) {
    const [isDuplicating, setIsDuplicating] = useState(false);

    const handleDuplicate = async () => {
        if (!confirm("¿Estás seguro de que quieres duplicar este contrato? Se creará una copia como Borrador.")) return;

        setIsDuplicating(true);
        try {
            const result = await duplicateContractAction(contractId);
            if (!result.success) {
                alert("Ocurrió un error al duplicar el contrato.");
            }
        } catch (error: any) {
            alert("Error al duplicar: " + error.message);
        } finally {
            setIsDuplicating(false);
        }
    };

    return (
        <button
            onClick={handleDuplicate}
            disabled={isDuplicating}
            className={`p-2 text-[var(--color-brand-navy)] hover:bg-blue-50 rounded-lg transition-colors ${isDuplicating ? "opacity-50 cursor-not-allowed" : ""
                }`}
            title="Duplicar Contrato"
        >
            {isDuplicating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Copy className="w-5 h-5" />}
        </button>
    );
}
