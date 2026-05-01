"use server";
import { revalidatePath } from "next/cache";

import { createClient } from "@/utils/supabase/server";

export async function createContractAction(data: any) {
  const supabase = await createClient();
  const isDraft = data.isDraft === true;

  // 1. Crear el contrato principal
  const { data: contractData, error: contractError } = await supabase
    .from("contracts")
    .insert([
      {
        client_name: data.clientName,
        client_email: data.clientEmail || "",
        current_status: isDraft ? "DRAFT" : "SENT",
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
        total_amount: data.amount || 0,
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

  // 4. Log the audit event (solo si no es borrador)
  if (!isDraft) {
    await supabase.from("audit_logs").insert([
      {
        contract_id: contractData.id,
        version_id: versionData.id,
        action_type: "SENT",
        user_agent: "Sistema Creator",
      },
    ]);
  }

  revalidatePath("/");

  return { success: true, contractId: contractData.id, isDraft };
}

export async function updateContractAction(data: any) {
  const supabase = await createClient();
  const isDraft = data.isDraft === true;

  if (!data.contractId) throw new Error("contractId is required for update");

  // 1. Obtener la versión actual para determinar el número de versión
  const { data: currentContract, error: fetchError } = await supabase
    .from("contracts")
    .select("*, contract_versions!fk_active_version(*)")
    .eq("id", data.contractId)
    .single();

  if (fetchError) throw fetchError;

  const currentVersions = Array.isArray(currentContract.contract_versions)
    ? currentContract.contract_versions
    : [currentContract.contract_versions];
  const activeVersion = currentVersions.find((v: any) => v && v.id === currentContract.active_version_id) || currentVersions[0];
  const currentVersionNumber = activeVersion ? activeVersion.version_number : 0;

  // 2. Actualizar el contrato principal
  const { error: updateContractError } = await supabase
    .from("contracts")
    .update({
      client_name: data.clientName,
      client_email: data.clientEmail || "",
      current_status: isDraft ? "DRAFT" : "SENT",
    })
    .eq("id", data.contractId);

  if (updateContractError) throw updateContractError;

  // 3. Desactivar la versión anterior (opcional pero buena práctica)
  if (activeVersion) {
    await supabase.from("contract_versions")
      .update({ is_active: false })
      .eq("id", activeVersion.id);
  }

  // 4. Crear la nueva versión del contrato
  const { data: newVersionData, error: newVersionError } = await supabase
    .from("contract_versions")
    .insert([
      {
        contract_id: data.contractId,
        version_number: currentVersionNumber + 1,
        content: { sections: data.sections },
        total_amount: data.amount || 0,
        currency: data.currency,
        is_active: true,
      },
    ])
    .select("id")
    .single();

  if (newVersionError) throw newVersionError;

  // 5. Actualizar el contrato con la nueva active_version_id
  const { error: updateVersionRefError } = await supabase
    .from("contracts")
    .update({ active_version_id: newVersionData.id })
    .eq("id", data.contractId);

  if (updateVersionRefError) throw updateVersionRefError;

  // 6. Log the audit event (solo si no es borrador)
  if (!isDraft) {
    await supabase.from("audit_logs").insert([
      {
        contract_id: data.contractId,
        version_id: newVersionData.id,
        action_type: "SENT", // Re-sent or updated
        user_agent: "Sistema Creator",
      },
    ]);
  }

  revalidatePath("/");

  return { success: true, contractId: data.contractId, isDraft };
}

export async function getDashboardData() {
  const supabase = await createClient();

  const { data: contracts, error } = await supabase
    .from("contracts")
    .select(`
      id,
      client_name,
      client_email,
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

export async function getContractForEdit(contractId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("contracts")
    .select(`
      id,
      client_name,
      client_email,
      current_status,
      active_version_id,
      contract_versions!fk_active_version(id, content, total_amount, currency)
    `)
    .eq("id", contractId)
    .single();

  if (error) return null;
  return data;
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
    throw new Error(error.message);
  }

  revalidatePath("/");
}
