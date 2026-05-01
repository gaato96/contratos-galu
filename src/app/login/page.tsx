"use client";

import { useState } from "react";
import { loginAction } from "@/app/actions/auth";
import { useRouter } from "next/navigation";
import { ShieldCheck, Lock } from "lucide-react";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("password", password);

    const result = await loginAction(formData);

    if (result.success) {
      router.push("/");
    } else {
      setError(result.error || "Error al iniciar sesión");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-[var(--color-brand-navy)] rounded-2xl flex items-center justify-center shadow-lg">
            <ShieldCheck className="w-10 h-10 text-[var(--color-brand-gold)]" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-[var(--color-brand-navy)] tracking-tight">
          GALU Legal-Tech
        </h2>
        <p className="mt-2 text-center text-sm text-[var(--color-text-muted)]">
          Acceso exclusivo para administradores
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl border border-gray-100 sm:rounded-2xl sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Clave Maestra
              </label>
              <div className="mt-2 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full pl-10 px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[var(--color-brand-navy)] focus:border-[var(--color-brand-navy)] sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-sm font-medium text-center">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-[var(--color-brand-navy-dark)] bg-[var(--color-brand-gold)] hover:bg-[var(--color-brand-gold-dark)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-brand-gold)] transition-colors disabled:opacity-50"
              >
                {isLoading ? "Iniciando..." : "Ingresar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
