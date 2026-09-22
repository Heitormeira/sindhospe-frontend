"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CORES } from "./components";

const ABAS = [
  { href: "/dashboard", label: "Meu estabelecimento" },
  { href: "/mercado", label: "Mercado" },
  { href: "/evolucao", label: "Evolução" },
  { href: "/relatorio", label: "Relatório" },
  { href: "/demo", label: "Demonstração" },
];

export default function NavClient() {
  const pathname = usePathname();

  return (
    <header
      className="rounded-xl px-4 py-4 mb-4 shadow-sm"
      style={{ background: `linear-gradient(135deg, ${CORES.verdeEscuro}, ${CORES.verde})` }}
    >
      <div className="flex items-center justify-center mb-3">
        <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
          <img src="/logo-sindhospe.png" alt="SINDHOSPE" className="h-16 w-auto" />
        </div>
      </div>
      <nav className="flex items-center justify-center gap-1 bg-black/10 rounded-lg p-1 flex-wrap">
        {ABAS.map((aba) => {
          const ativa = pathname === aba.href;
          return (
            <Link
              key={aba.href}
              href={aba.href}
              className="flex-1 text-center text-sm py-2 rounded-md transition-colors"
              style={{
                background: ativa ? "white" : "transparent",
                color: ativa ? CORES.verdeEscuro : "white",
                fontWeight: ativa ? 600 : 400,
                minWidth: "90px",
              }}
            >
              {aba.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
