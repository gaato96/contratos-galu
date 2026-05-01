"use server";

import { createClient } from "@/utils/supabase/server";
import { Resend } from "resend";
import { sha256 } from "js-sha256";
import { headers } from "next/headers";

const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy_key");

export async function requestOTPAction(contractId: string) {
  const supabase = await createClient();

  // 1. Obtener email del cliente
  const { data: contract, error: contractError } = await supabase
    .from("contracts")
    .select("client_email, client_name")
    .eq("id", contractId)
    .single();

  if (contractError || !contract) return { success: false, error: "Contrato no encontrado" };

  // 2. Generar código 6 dígitos
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOtp = sha256(code);
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 15); // Válido por 15 mins

  // 3. Guardar en DB
  const { error: otpError } = await supabase
    .from("otp_sessions")
    .insert([
      {
        contract_id: contractId,
        email: contract.client_email,
        hashed_otp: hashedOtp,
        expires_at: expiresAt.toISOString(),
      }
    ]);

  if (otpError) return { success: false, error: "Error al generar sesión" };

  // 4. Enviar email con Resend
  if (process.env.RESEND_API_KEY) {
    try {
      const { data, error } = await resend.emails.send({
        from: "GALU Legal-Tech <onboarding@resend.dev>",
        to: contract.client_email,
        subject: "Código de Firma Electrónica - GALU",
        html: `
          <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #273E59;">Verificación de Firma Electrónica</h2>
            <p>Hola ${contract.client_name},</p>
            <p>Has solicitado firmar un contrato. Utiliza el siguiente código de 6 dígitos para validar tu identidad y completar el proceso:</p>
            <div style="background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #273E59; border-radius: 8px; margin: 20px 0;">
              ${code}
            </div>
            <p>Este código expira en 15 minutos.</p>
            <p>Si no has sido tú, puedes ignorar este correo de forma segura.</p>
          </div>
        `
      });

      if (error) {
        console.error("Resend Error (API Rechazó el envío):", error);
        console.log(`\n\n=== OTP PARA CONTRATO (EMAIL FALLÓ) ${contractId} ===\nCÓDIGO: ${code}\n======================================\n\n`);
      } else {
        console.log(`\n\n=== OTP PARA CONTRATO (ENVIADO A ${contract.client_email}) ===\nCÓDIGO: ${code}\n======================================\n\n`);
      }
    } catch (e) {
      console.error("Resend Exception", e);
      console.log(`\n\n=== OTP PARA CONTRATO (EXCEPCIÓN EMAIL) ${contractId} ===\nCÓDIGO: ${code}\n======================================\n\n`);
    }
  } else {
    // Modo desarrollo: imprimir en consola
    console.log(`\n\n=== OTP PARA CONTRATO (MODO DEV - SIN KEY) ${contractId} ===\nCÓDIGO: ${code}\n======================================\n\n`);
  }

  // Log
  await supabase.from("audit_logs").insert([{ contract_id: contractId, action_type: "OTP_SENT" }]);

  return { success: true };
}

export async function verifyOTPAction(contractId: string, code: string, signatureBase64: string) {
  const supabase = await createClient();
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for") || "127.0.0.1";
  const userAgent = headersList.get("user-agent") || "Unknown";

  const hashedOtp = sha256(code);

  // 1. Buscar OTP válido
  const { data: session, error: sessionError } = await supabase
    .from("otp_sessions")
    .select("*")
    .eq("contract_id", contractId)
    .eq("hashed_otp", hashedOtp)
    .eq("is_used", false)
    .gt("expires_at", new Date().toISOString())
    .single();

  if (sessionError || !session) return { success: false, error: "Código inválido o expirado" };

  // 2. Marcar como usado
  await supabase.from("otp_sessions").update({ is_used: true }).eq("id", session.id);

  // 3. Obtener contrato para versión y hash
  const { data: contract } = await supabase
    .from("contracts")
    .select("active_version_id")
    .eq("id", contractId)
    .single();

  if (!contract) return { success: false, error: "Contrato no encontrado" };

  // 4. Calcular Hash SHA-256 del documento final (versión + firma)
  const documentHash = sha256(contract.active_version_id + signatureBase64 + new Date().getTime().toString());

  // 5. Guardar firma
  await supabase.from("signatures").insert([
    {
      contract_id: contractId,
      version_id: contract.active_version_id,
      base64_image: signatureBase64,
      document_hash: documentHash,
      user_identifier: session.email,
      ip_address: ip,
      user_agent: userAgent
    }
  ]);

  // 6. Actualizar contrato a COMPLETED
  await supabase.from("contracts").update({ current_status: "COMPLETED" }).eq("id", contractId);

  // 7. Log Auditoría Final
  const { data: auditLog } = await supabase.from("audit_logs").insert([
    {
      contract_id: contractId,
      version_id: contract.active_version_id,
      action_type: "COMPLETED",
      ip_address: ip,
      user_agent: userAgent,
      metadata: { document_hash: documentHash }
    }
  ]).select().single();

  return {
    success: true,
    auditData: {
      timestamp: new Date().toISOString(),
      ip,
      hash: documentHash,
      email: session.email
    }
  };
}
