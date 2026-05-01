"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const password = formData.get("password") as string;
  const masterPassword = process.env.MASTER_PASSWORD;

  if (password === masterPassword) {
    const cookieStore = await cookies();
    // Set a simple cookie to authenticate the session (valid for 7 days)
    cookieStore.set("galu_auth", "authenticated", { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/"
    });
    return { success: true };
  }

  return { success: false, error: "Contraseña incorrecta" };
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("galu_auth");
  redirect("/login");
}
