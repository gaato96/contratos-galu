import SettingsForm from "@/components/SettingsForm";

export default function SettingsPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-brand-navy)]">Configuración</h1>
        <p className="text-[var(--color-text-muted)] mt-2">Ajustes del sistema y perfil de la agencia.</p>
      </div>

      <SettingsForm />
    </div>
  );
}
