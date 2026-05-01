import { FileText, Send, Eye, PenTool, CheckCircle, Trash2, PlusCircle, Clock } from "lucide-react";
import { getDashboardData } from "@/app/actions/contracts";
import Link from "next/link";
import DownloadPdfButton from "@/components/DownloadPdfButton";
import DeleteContractButton from "@/components/DeleteContractButton";

export default async function DashboardPage() {
  const contracts = await getDashboardData();

  // Calcular métricas
  const counts = {
    DRAFT: 0,
    SENT: 0,
    VIEWED: 0,
    PARTIALLY_SIGNED: 0,
    COMPLETED: 0
  };

  contracts.forEach((c: any) => {
    if (counts[c.current_status as keyof typeof counts] !== undefined) {
      counts[c.current_status as keyof typeof counts]++;
    }
  });

  const metrics = [
    { name: "Borradores", value: counts.DRAFT, icon: FileText, color: "text-gray-500", bg: "bg-gray-100" },
    { name: "Enviados", value: counts.SENT, icon: Send, color: "text-blue-500", bg: "bg-blue-100" },
    { name: "Vistos", value: counts.VIEWED, icon: Eye, color: "text-purple-500", bg: "bg-purple-100" },
    { name: "Firma Parcial", value: counts.PARTIALLY_SIGNED, icon: PenTool, color: "text-orange-500", bg: "bg-orange-100" },
    { name: "Completados", value: counts.COMPLETED, icon: CheckCircle, color: "text-green-500", bg: "bg-green-100" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-brand-navy)]">Dashboard</h1>
          <p className="text-[var(--color-text-muted)] mt-2">Visión general del estado de tus contratos</p>
        </div>
        <Link
          href="/contratos/nuevo"
          className="flex items-center space-x-2 px-4 py-2 bg-[var(--color-brand-gold)] text-[var(--color-brand-navy-dark)] rounded-lg hover:bg-[var(--color-brand-gold-dark)] transition-colors shadow-md font-bold"
        >
          <FileText className="w-5 h-5" />
          <span>Nuevo Contrato</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {metrics.map((metric) => (
          <div key={metric.name} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4 hover:shadow-md transition-shadow">
            <div className={`p-3 rounded-lg ${metric.bg}`}>
              <metric.icon className={`w-6 h-6 ${metric.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--color-text-muted)]">{metric.name}</p>
              <p className="text-2xl font-bold text-[var(--color-text-main)]">{metric.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-[var(--color-brand-navy)]">Actividad Reciente</h2>
          <button className="text-sm font-medium text-[var(--color-brand-navy)] hover:text-[var(--color-brand-gold-dark)] transition-colors">
            Ver todos
          </button>
        </div>
        <div className="p-0">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 text-sm font-medium text-[var(--color-text-muted)]">Cliente</th>
                <th className="p-4 text-sm font-medium text-[var(--color-text-muted)]">Monto</th>
                <th className="p-4 text-sm font-medium text-[var(--color-text-muted)]">Estado</th>
                <th className="p-4 text-sm font-medium text-[var(--color-text-muted)]">Última Actividad</th>
                <th className="p-4 text-sm font-medium text-[var(--color-text-muted)]">Acción</th>
              </tr>
            </thead>
            <tbody>
              {contracts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[var(--color-text-muted)]">No hay contratos registrados aún.</td>
                </tr>
              ) : contracts.map((contract: any) => {
                const version = Array.isArray(contract.contract_versions) ? contract.contract_versions[0] : contract.contract_versions;
                return (
                  <tr key={contract.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <p className="font-medium text-[var(--color-text-main)]">{contract.client_name}</p>
                    </td>
                    <td className="p-4 font-medium text-[var(--color-text-main)]">
                      {version ? `${version.currency} $${version.total_amount}` : '-'}
                    </td>
                    <td className="p-4">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                        {contract.current_status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-[var(--color-text-muted)]">
                      {new Date(contract.updated_at).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {contract.current_status === "DRAFT" ? (
                          <Link href={`/contratos/editar/${contract.id}`} className="text-[var(--color-brand-gold)] hover:text-yellow-600 text-sm font-medium">Editar</Link>
                        ) : (
                          <Link href={`/c/${contract.id}`} target="_blank" className="text-[var(--color-brand-navy)] hover:text-[var(--color-brand-gold-dark)] text-sm font-medium">Ver Link</Link>
                        )}
                        {contract.current_status === "COMPLETED" && (
                          <DownloadPdfButton contractId={contract.id} />
                        )}
                        <DeleteContractButton contractId={contract.id} />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
