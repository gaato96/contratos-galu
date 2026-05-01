"use server";
import { revalidatePath } from "next/cache";

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
      contract_versions!fk_active_version(total_amount, currency)
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
      contract_versions!fk_active_version(id, content, total_amount, currency)
    `)
    .eq("id", contractId)
    .single();

  if (error) return null;
  return data;
}

export async function getSignedContractData(contractId: string) {
  const supabase = await createClient();

  // 1. Obtener contrato y su versión activa
  const { data: contract, error: contractErr } = await supabase
    .from("contracts")
    .select("*, contract_versions!fk_active_version(*)")
    .eq("id", contractId)
    .single();

  if (!contract || contractErr) {
    console.error("Error fetching contract:", contractErr);
    return null;
  }

  const { data: signature } = await supabase.from("signatures").select("*").eq("contract_id", contractId).single();
  const { data: auditLog } = await supabase.from("audit_logs").select("*").eq("contract_id", contractId).eq("action_type", "COMPLETED").order("created_at", { ascending: false }).limit(1).single();

  if (!contract || !signature || !auditLog) return null;

  const versionArray = Array.isArray(contract.contract_versions) ? contract.contract_versions : [contract.contract_versions];
  const version = versionArray.find((v: any) => v.id === contract.active_version_id) || versionArray[0];

  return {
    contract,
    version,
    signature,
    auditLog: {
      metadata: {
        timestamp: auditLog.created_at,
        ip: auditLog.ip_address,
        hash: signature.document_hash,
        email: signature.user_identifier || contract.client_email,
        signerName: auditLog.metadata?.signer_name
      }
    }
  };
}

export async function deleteContractAction(contractId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("contracts").delete().eq("id", contractId);

  if (error) {
    console.error("Error deleting contract:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/");
  return { success: true };
}
