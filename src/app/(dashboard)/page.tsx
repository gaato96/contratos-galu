import { FileText, Send, Eye, PenTool, CheckCircle } from "lucide-react";

export default function DashboardPage() {
  const metrics = [
    { name: "Borradores", value: 3, icon: FileText, color: "text-gray-500", bg: "bg-gray-100" },
    { name: "Enviados", value: 12, icon: Send, color: "text-blue-500", bg: "bg-blue-100" },
    { name: "Vistos", value: 5, icon: Eye, color: "text-purple-500", bg: "bg-purple-100" },
    { name: "Firma Parcial", value: 2, icon: PenTool, color: "text-orange-500", bg: "bg-orange-100" },
    { name: "Completados", value: 48, icon: CheckCircle, color: "text-green-500", bg: "bg-green-100" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-brand-navy)]">Dashboard</h1>
        <p className="text-[var(--color-text-muted)] mt-2">Visión general del estado de tus contratos</p>
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
              <tr className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="p-4">
                  <p className="font-medium text-[var(--color-text-main)]">Tech Startup S.A.</p>
                  <p className="text-sm text-[var(--color-text-muted)]">Desarrollo MVP</p>
                </td>
                <td className="p-4 font-medium text-[var(--color-text-main)]">$4,500 USD</td>
                <td className="p-4">
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                    VISTO
                  </span>
                </td>
                <td className="p-4 text-sm text-[var(--color-text-muted)]">hace 5 minutos</td>
                <td className="p-4">
                  <button className="text-[var(--color-brand-navy)] hover:text-[var(--color-brand-gold-dark)] text-sm font-medium">Ver Detalles</button>
                </td>
              </tr>
              <tr className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="p-4">
                  <p className="font-medium text-[var(--color-text-main)]">Agencia Creativa SRL</p>
                  <p className="text-sm text-[var(--color-text-muted)]">Integración API</p>
                </td>
                <td className="p-4 font-medium text-[var(--color-text-main)]">$1,200 USD</td>
                <td className="p-4">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                    ENVIADO
                  </span>
                </td>
                <td className="p-4 text-sm text-[var(--color-text-muted)]">hace 2 horas</td>
                <td className="p-4">
                  <button className="text-[var(--color-brand-navy)] hover:text-[var(--color-brand-gold-dark)] text-sm font-medium">Ver Detalles</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
