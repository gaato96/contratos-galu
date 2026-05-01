"use client";

import { useState, useRef } from "react";
import { PlusCircle, Trash2, Save, Loader2, Image as ImageIcon } from "lucide-react";
import { saveAgencySettingsAction } from "@/app/actions/settings";

type Clause = { title: string, body: string, isRequired: boolean };

export default function SettingsForm({ initialData }: { initialData: any }) {
    const [clauses, setClauses] = useState<Clause[]>(initialData.default_clauses || []);
    const [logoBase64, setLogoBase64] = useState<string | null>(initialData.logo_base64 || null);
    const [signatureBase64, setSignatureBase64] = useState<string | null>(initialData.agency_signature_base64 || null);
    const [notifications, setNotifications] = useState(initialData.notifications_enabled ?? true);

    const [isSaving, setIsSaving] = useState(false);
    const logoInputRef = useRef<HTMLInputElement>(null);
    const signatureInputRef = useRef<HTMLInputElement>(null);

    const handleAddClause = () => {
        setClauses([...clauses, { title: "", body: "", isRequired: true }]);
    };

    const handleUpdateClause = (index: number, field: keyof Clause, value: any) => {
        const newClauses = [...clauses];
        newClauses[index] = { ...newClauses[index], [field]: value };
        setClauses(newClauses);
    };

    const handleRemoveClause = (index: number) => {
        setClauses(clauses.filter((_, i) => i !== index));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                alert("La imagen es demasiado grande. Máximo 2MB.");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setter(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await saveAgencySettingsAction({
                default_clauses: clauses,
                logo_base64: logoBase64,
                agency_signature_base64: signatureBase64,
                notifications_enabled: notifications
            });
            alert("Configuración guardada correctamente");
        } catch (e: any) {
            alert(e.message || "Error al guardar");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-8 pb-12">
            {/* Logos and Signature */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* LOGO */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-semibold text-[var(--color-brand-navy)] mb-4">Logo de la Agencia</h2>
                    <p className="text-sm text-gray-500 mb-4">Se mostrará en la cabecera de los PDF generados.</p>
                    <div className="flex flex-col items-start gap-4">
                        {logoBase64 ? (
                            <img src={logoBase64} alt="Logo" className="h-16 object-contain" />
                        ) : (
                            <div className="h-16 w-32 bg-gray-50 border-2 border-dashed border-gray-200 rounded flex items-center justify-center text-gray-400">
                                <ImageIcon className="w-6 h-6" />
                            </div>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            ref={logoInputRef}
                            onChange={(e) => handleFileChange(e, setLogoBase64)}
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={() => logoInputRef.current?.click()}
                                className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
                            >
                                Subir Imagen
                            </button>
                            {logoBase64 && (
                                <button
                                    onClick={() => setLogoBase64(null)}
                                    className="px-4 py-2 text-sm bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors font-medium"
                                >
                                    Quitar
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* SIGNATURE */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-semibold text-[var(--color-brand-navy)] mb-4">Firma de la Agencia</h2>
                    <p className="text-sm text-gray-500 mb-4">Se ubicará al final del contrato en representación de la agencia.</p>
                    <div className="flex flex-col items-start gap-4">
                        {signatureBase64 ? (
                            <img src={signatureBase64} alt="Signature" className="h-16 object-contain" />
                        ) : (
                            <div className="h-16 w-32 bg-gray-50 border-2 border-dashed border-gray-200 rounded flex items-center justify-center text-gray-400">
                                <ImageIcon className="w-6 h-6" />
                            </div>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            ref={signatureInputRef}
                            onChange={(e) => handleFileChange(e, setSignatureBase64)}
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={() => signatureInputRef.current?.click()}
                                className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
                            >
                                Subir Firma
                            </button>
                            {signatureBase64 && (
                                <button
                                    onClick={() => setSignatureBase64(null)}
                                    className="px-4 py-2 text-sm bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors font-medium"
                                >
                                    Quitar
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Notifications */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-semibold text-[var(--color-brand-navy)]">Notificaciones</h2>
                    <p className="text-sm text-gray-500">Enviar alertas automáticas sobre eventos de contratos.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={notifications}
                        onChange={(e) => setNotifications(e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-brand-gold)]"></div>
                </label>
            </div>

            {/* DEFAULT CLAUSES */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-semibold text-[var(--color-brand-navy)]">Cláusulas por Defecto (Plantilla)</h2>
                        <p className="text-sm text-gray-500">Estas serán las cláusulas precargadas a la hora de crear un nuevo contrato.</p>
                    </div>
                    <button
                        onClick={handleAddClause}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-[var(--color-brand-navy)] rounded-lg font-medium transition-colors border border-gray-200"
                    >
                        <PlusCircle className="w-4 h-4" /> Añadir
                    </button>
                </div>

                <div className="space-y-4">
                    {clauses.length === 0 ? (
                        <p className="text-gray-500 italic text-center py-4 bg-gray-50 rounded-lg">No hay cláusulas por defecto configuradas.</p>
                    ) : (
                        clauses.map((clause, index) => (
                            <div key={index} className="flex gap-4 items-start p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="flex-1 space-y-4">
                                    <input
                                        type="text"
                                        value={clause.title}
                                        onChange={(e) => handleUpdateClause(index, "title", e.target.value)}
                                        placeholder="Título de la cláusula"
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-gold)]"
                                    />
                                    <textarea
                                        value={clause.body}
                                        onChange={(e) => handleUpdateClause(index, "body", e.target.value)}
                                        placeholder="Contenido descriptivo de la cláusula..."
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-gold)] min-h-[100px]"
                                    />
                                </div>
                                <button
                                    onClick={() => handleRemoveClause(index)}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-1"
                                    title="Eliminar cláusula"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center space-x-2 px-6 py-3 bg-[var(--color-brand-navy)] text-white rounded-lg hover:bg-[var(--color-brand-navy-dark)] transition-colors shadow-lg font-medium disabled:opacity-50"
                >
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    <span>Guardar Configuración</span>
                </button>
            </div>
        </div>
    );
}
