"use server";

import { createClient } from "@/utils/supabase/server";

export async function createContractAction(data: any) {
  const supabase = await createClient();

  // 1. Crear el contrato principal
  const { data: contractData, error: contractError } = await supabase
    .from("contracts")
    .insert([
      {
        client_name: data.clientName,
        client_email: data.clientEmail,
        current_status: "SENT",
      },
    ])
    .select("id")
    .single();

  if (contractError) throw contractError;

  // 2. Crear la versión del contrato
  const { data: versionData, error: versionError } = await supabase
    .from("contract_versions")
    .insert([
      {
        contract_id: contractData.id,
        version_number: 1,
        content: { sections: data.sections },
        total_amount: data.amount,
        currency: data.currency,
        is_active: true,
      },
    ])
    .select("id")
    .single();

  if (versionError) throw versionError;

  // 3. Actualizar el contrato con la active_version_id
  const { error: updateError } = await supabase
    .from("contracts")
    .update({ active_version_id: versionData.id })
    .eq("id", contractData.id);

  if (updateError) throw updateError;

  // 4. Log the audit event
  await supabase.from("audit_logs").insert([
    {
      contract_id: contractData.id,
      version_id: versionData.id,
      action_type: "SENT",
      user_agent: "Sistema Creator",
    },
  ]);

  return { success: true, contractId: contractData.id };
}

export async function getDashboardData() {
  const supabase = await createClient();

  const { data: contracts, error } = await supabase
    .from("contracts")
    .select(`
      id,
      client_name,
      current_status,
      updated_at,
      active_version_id,
      contract_versions!contracts_active_version_id_fkey(total_amount, currency)
    `)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error fetching dashboard:", error);
    return [];
  }

  return contracts;
}

export async function getContractForClient(contractId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("contracts")
    .select(`
      id,
      client_name,
      current_status,
      active_version_id,
      contract_versions!contracts_active_version_id_fkey(id, content, total_amount, currency)
    `)
    .eq("id", contractId)
    .single();

  if (error) return null;
  return data;
}
