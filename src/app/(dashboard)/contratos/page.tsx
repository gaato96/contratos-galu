import Link from "next/link";
import { FileText } from "lucide-react";
import DashboardPage from "../page";

// Para no reinventar la rueda por ahora, la sección de contratos
// simplemente mostrará la misma vista que el Dashboard principal o un wrapper.
export default function ContratosPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8 animate-in fade-in">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-brand-navy)]">Gestión de Contratos</h1>
          <p className="text-[var(--color-text-muted)] mt-2">Administra y envía todos tus contratos desde aquí.</p>
        </div>
        <Link 
          href="/contratos/nuevo"
          className="flex items-center space-x-2 px-4 py-2 bg-[var(--color-brand-gold)] text-[var(--color-brand-navy-dark)] rounded-lg hover:bg-[var(--color-brand-gold-dark)] transition-colors shadow-md font-bold"
        >
          <FileText className="w-5 h-5" />
          <span>Nuevo Contrato</span>
        </Link>
      </div>
      
      {/* Reutilizamos la tabla del dashboard */}
      <DashboardPage />
    </div>
  );
}
