"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function getAgencySettingsAction() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("agency_settings")
        .select("*")
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
}

export async function saveAgencySettingsAction(settings: any) {
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
        throw new Error("No se pudo guardar la configuración");
    }

    revalidatePath("/settings");
    revalidatePath("/contratos/nuevo");

    // For when modifying a contract triggers a PDF redraw
    // revalidatePath("/");

    return { success: true };
}
