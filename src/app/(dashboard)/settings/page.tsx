export default function SettingsPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-brand-navy)]">Configuración</h1>
        <p className="text-[var(--color-text-muted)] mt-2">Ajustes del sistema y perfil de la agencia.</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-2xl">
        <h2 className="text-xl font-semibold text-[var(--color-brand-navy)] mb-6">Próximamente</h2>
        <p className="text-gray-600">
          En esta sección podrás configurar:
        </p>
        <ul className="list-disc list-inside mt-4 text-gray-600 space-y-2">
          <li>Cláusulas legales por defecto (Plantillas).</li>
          <li>Logotipo de la agencia para los PDFs.</li>
          <li>Ajustes de notificaciones y recordatorios automáticos (Cron Jobs).</li>
        </ul>
      </div>
    </div>
  );
}
