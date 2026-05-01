"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, LayoutDashboard, Settings, LogOut } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const links = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Contratos", href: "/contratos", icon: FileText },
    { name: "Configuración", href: "/settings", icon: Settings },
  ];

  return (
    <div className="w-64 bg-[var(--color-brand-navy)] text-white flex flex-col min-h-screen shadow-xl">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-[var(--color-brand-gold)] tracking-wider">GALU</h1>
        <p className="text-xs text-blue-200 mt-1 uppercase tracking-widest">Legal-Tech</p>
      </div>

      <nav className="flex-1 px-4 mt-8 space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || (pathname.startsWith(link.href) && link.href !== "/");
          
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive 
                  ? "bg-[var(--color-brand-navy-dark)] border-l-4 border-[var(--color-brand-gold)]" 
                  : "hover:bg-[var(--color-brand-navy-dark)] border-l-4 border-transparent text-gray-300 hover:text-white"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "text-[var(--color-brand-gold)]" : ""}`} />
              <span className="font-medium">{link.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[var(--color-brand-navy-dark)]">
        <button className="flex items-center space-x-3 px-4 py-3 w-full rounded-lg hover:bg-[var(--color-brand-navy-dark)] text-gray-300 hover:text-white transition-colors">
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
}
