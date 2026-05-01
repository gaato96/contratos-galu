import { getContractForClient } from "@/app/actions/contracts";
import { notFound } from "next/navigation";
import ClientPortalView from "@/components/ClientPortalView";

export default async function ClientPortalPage({ params }: { params: Promise<{ contractId: string }> }) {
  const contractId = (await params).contractId;
  const contract = await getContractForClient(contractId);

  if (!contract || !contract.active_version_id || !contract.contract_versions) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-100 max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Enlace Inválido o Expirado</h1>
          <p className="text-gray-600">Este contrato no existe o ha sido modificado, por lo que el enlace actual ha quedado obsoleto por seguridad.</p>
        </div>
      </div>
    );
  }

  // Marcar como visto (Opcional: crear server action para esto)

  return <ClientPortalView contract={contract} />;
}
