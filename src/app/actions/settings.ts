"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function getAgencySettingsAction() {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from("agency_settings")
            .select("default_clauses, logo_base64, agency_signature_base64, notifications_enabled")
            .eq("id", 1)
            .single();

        if (error && error.code !== "PGRST116") {
            console.error("Error fetching agency settings:", error);
            return null;
        }

        return data || {
            default_clauses: [],
            logo_base64: null,
            agency_signature_base64: null,
            notifications_enabled: true
        };
    } catch (e) {
        console.error("Unexpected error in getAgencySettingsAction:", e);
        return null;
    }
}

// Lightweight version that only returns assets for PDF generation (no clauses)
export async function getAgencyAssetsAction() {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from("agency_settings")
            .select("logo_base64, agency_signature_base64")
            .eq("id", 1)
            .single();

        if (error && error.code !== "PGRST116") {
            return null;
        }

        return {
            logo_base64: data?.logo_base64 || null,
            agency_signature_base64: data?.agency_signature_base64 || null,
        };
    } catch {
        return null;
    }
}

export async function saveAgencySettingsAction(settings: any) {
    try {
        const supabase = await createClient();

        // UPSERT record with id = 1
        const { error } = await supabase
            .from("agency_settings")
            .upsert({
                id: 1,
                default_clauses: settings.default_clauses,
                logo_base64: settings.logo_base64,
                agency_signature_base64: settings.agency_signature_base64,
                notifications_enabled: settings.notifications_enabled
            });

        if (error) {
            console.error("Error saving agency settings:", error);
            throw new Error("No se pudo guardar la configuración: " + error.message);
        }

        revalidatePath("/(dashboard)/settings", "page");

        return { success: true };
    } catch (e: any) {
        console.error("Unexpected error in saveAgencySettingsAction:", e);
        throw new Error(e.message || "Error inesperado al guardar");
    }
}
