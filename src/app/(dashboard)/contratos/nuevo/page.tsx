"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Save, Send, Loader2, Link as LinkIcon, CheckCircle2 } from "lucide-react";
import { createContractAction } from "@/app/actions/contracts";
import { getAgencySettingsAction } from "@/app/actions/settings";
import Link from "next/link";

interface Section {
  id: string;
  title: string;
  body: string;
}

export default function NuevoContratoPage() {
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");

  const [sections, setSections] = useState<Section[]>([]);
  const [sectionsLoaded, setSectionsLoaded] = useState(false);

  const defaultFallbackClauses: Section[] = [
    {
      id: "1",
      title: "Jurisdicción y Ley Aplicable",
      body: "Para todos los efectos legales derivados del presente contrato, las partes fijan domicilios especiales en los indicados en el encabezamiento, donde se tendrán por válidas todas las notificaciones. Las partes se someten a la jurisdicción y competencia de los Tribunales Ordinarios en lo Comercial de la Ciudad Autónoma de Buenos Aires, con expresa renuncia a cualquier otro fuero o jurisdicción que pudiera corresponderles, siendo aplicable la legislación de la República Argentina."
    },
    {
      id: "2",
      title: "Propiedad Intelectual del Código",
      body: "El Desarrollador retiene todos los derechos de propiedad intelectual, derechos de autor e invenciones sobre el código fuente base, librerías preexistentes y metodologías utilizadas. El Cliente obtendrá una licencia de uso Exclusiva y Perpetua sobre el producto de software entregable únicamente una vez que se haya acreditado el pago del cien por ciento (100%) de los honorarios estipulados. En ningún caso el Cliente podrá revender o distribuir el código fuente sin autorización."
    },
    {
      id: "3",
      title: "Limitación de Responsabilidad",
      body: "El software se entrega \"tal como está\" (as is). El Desarrollador no será responsable por daños indirectos, lucro cesante, pérdida de datos o interrupciones del negocio derivados del uso del software. La responsabilidad máxima del Desarrollador frente al Cliente estará estrictamente limitada al monto total de los honorarios efectivamente abonados por el Cliente por el desarrollo del software."
    }
  ];

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await getAgencySettingsAction();
        if (settings && settings.default_clauses && settings.default_clauses.length > 0) {
          const mapped = settings.default_clauses.map((c: any, i: number) => ({
            id: `settings-${i}`,
            title: c.title || "",
            body: c.body || ""
          }));
          setSections(mapped);
        } else {
          setSections(defaultFallbackClauses);
        }
      } catch {
        setSections(defaultFallbackClauses);
      }
      setSectionsLoaded(true);
    };
    loadSettings();
  }, []);

  const [isLoading, setIsLoading] = useState(false);
  const [successLink, setSuccessLink] = useState("");
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!clientName || !clientEmail || !amount) {
      setError("Por favor completa el nombre, correo y monto.");
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      const result = await createContractAction({
        clientName,
        clientEmail,
        amount: parseFloat(amount),
        currency,
        sections
      });

      if (result.success) {
        setSuccessLink(`${window.location.origin}/c/${result.contractId}`);
      }
    } catch (err: any) {
      setError("Ocurrió un error al generar el contrato: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const addSection = () => {
    // Insert new section right before the first default section (which have IDs "1", "2", "3")
    const newSection = { id: Date.now().toString(), title: "", body: "" };
    const firstDefaultIndex = sections.findIndex(s => ["1", "2", "3"].includes(s.id));

    if (firstDefaultIndex !== -1) {
      const newSections = [...sections];
      newSections.splice(firstDefaultIndex, 0, newSection);
      setSections(newSections);
    } else {
      setSections([...sections, newSection]);
    }
  };

  const removeSection = (id: string) => {
    setSections(sections.filter(s => s.id !== id));
  };

  const updateSection = (id: string, field: "title" | "body", value: string) => {
    setSections(sections.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-brand-navy)]">Nuevo Contrato</h1>
          <p className="text-[var(--color-text-muted)] mt-1">Crea un contrato modular para enviar a firma electrónica.</p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
            <Save className="w-4 h-4" />
            <span>Guardar Borrador</span>
          </button>
          <button
            onClick={handleGenerate}
            disabled={isLoading || !!successLink}
            className="flex items-center space-x-2 px-4 py-2 bg-[var(--color-brand-navy)] text-white rounded-lg hover:bg-[var(--color-brand-navy-dark)] transition-colors shadow-md font-medium disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>Generar y Enviar</span>
          </button>
        </div>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">{error}</div>}

      {successLink && (
        <div className="p-6 bg-green-50 border border-green-200 rounded-xl flex flex-col items-center justify-center space-y-4 animate-in fade-in zoom-in duration-300">
          <div className="flex items-center space-x-2 text-green-800">
            <CheckCircle2 className="w-6 h-6" />
            <span className="text-xl font-bold">¡Contrato Generado con Éxito!</span>
          </div>
          <p className="text-green-700">Comparte este enlace único y seguro con tu cliente:</p>
          <div className="flex items-center space-x-2 bg-white p-3 rounded-lg border border-green-300 w-full max-w-2xl shadow-sm">
            <LinkIcon className="w-5 h-5 text-gray-400" />
            <input type="text" readOnly value={successLink} className="flex-1 outline-none bg-transparent text-gray-700 font-mono text-sm" />
            <button
              onClick={() => navigator.clipboard.writeText(successLink)}
              className="px-3 py-1 bg-green-100 text-green-700 hover:bg-green-200 rounded text-sm font-medium transition-colors"
            >
              Copiar
            </button>
          </div>
          <Link href="/" className="mt-2 text-[var(--color-brand-navy)] font-medium hover:underline">Volver al Dashboard</Link>
        </div>
      )}

      <div className={`bg-white p-6 rounded-xl shadow-sm border border-gray-100 ${successLink ? 'opacity-50 pointer-events-none' : ''}`}>
        <h2 className="text-xl font-semibold text-[var(--color-brand-navy)] mb-6">Datos del Cliente y Proyecto</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Cliente o Empresa</label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-brand-gold)] focus:border-[var(--color-brand-gold)] outline-none transition-all"
              placeholder="Ej. Tech Startup S.A."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Correo Electrónico (Para Validación OTP)</label>
            <input
              type="email"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-brand-gold)] focus:border-[var(--color-brand-gold)] outline-none transition-all"
              placeholder="cliente@empresa.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Monto Total</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-brand-gold)] focus:border-[var(--color-brand-gold)] outline-none transition-all"
              placeholder="Ej. 4500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Moneda</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-brand-gold)] focus:border-[var(--color-brand-gold)] outline-none transition-all bg-white"
            >
              <option value="USD">Dólares Estadounidenses (USD)</option>
              <option value="ARS">Pesos Argentinos (ARS)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-[var(--color-brand-navy)]">Cláusulas del Contrato</h2>
          <button
            onClick={addSection}
            className="flex items-center space-x-2 text-sm font-medium text-[var(--color-brand-navy)] hover:text-[var(--color-brand-gold-dark)] transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Sección</span>
          </button>
        </div>

        {sections.map((section, index) => (
          <div key={section.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative group">
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => removeSection(section.id)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Eliminar Sección"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4 pr-12">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Título de la Sección {index + 1}</label>
              <input
                type="text"
                value={section.title}
                onChange={(e) => updateSection(section.id, "title", e.target.value)}
                className="w-full px-4 py-2 font-semibold text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-brand-gold)] focus:border-[var(--color-brand-gold)] outline-none transition-all"
                placeholder="Ej. Alcance de los Servicios"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Contenido</label>
              <textarea
                value={section.body}
                onChange={(e) => updateSection(section.id, "body", e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-brand-gold)] focus:border-[var(--color-brand-gold)] outline-none transition-all resize-y"
                placeholder="Detalle de la cláusula..."
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
