"use client";

import { Trash2, Loader2 } from "lucide-react";
import { deleteContractAction } from "@/app/actions/contracts";
import { useState } from "react";

export default function DeleteContractButton({ contractId }: { contractId: string }) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (confirm("¿Estás seguro de eliminar este contrato? Esta acción es irreversible.")) {
            setIsDeleting(true);
            try {
                await deleteContractAction(contractId);
            } catch (err) {
                console.error("Failed to delete", err);
                alert("Ocurrió un error al eliminar el contrato.");
            } finally {
                setIsDeleting(false);
            }
        }
    };

    return (
        <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            title="Eliminar contrato"
            className="p-1 rounded bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 transition-colors ml-2 disabled:opacity-50"
        >
            {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
        </button>
    );
}
