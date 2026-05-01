import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GALU Legal-Tech",
  description: "Sistema Avanzado de Gestión de Contratos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className={`${inter.className} min-h-full flex flex-col bg-[var(--color-background)] text-[var(--color-text-main)]`}>
        {children}
      </body>
    </html>
  );
}
