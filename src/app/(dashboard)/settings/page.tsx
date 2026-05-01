import { getAgencySettingsAction } from "@/app/actions/settings";
import SettingsForm from "@/components/SettingsForm";

export default async function SettingsPage() {
  const initialData = await getAgencySettingsAction() || {
    default_clauses: [],
    logo_base64: null,
    agency_signature_base64: null,
    notifications_enabled: true
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-brand-navy)]">Configuración</h1>
        <p className="text-[var(--color-text-muted)] mt-2">Ajustes del sistema y perfil de la agencia.</p>
      </div>

      <SettingsForm initialData={initialData} />
    </div>
  );
}
