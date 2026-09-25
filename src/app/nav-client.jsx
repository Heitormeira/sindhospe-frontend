"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CORES, getSessao, limparSessao } from "./components";

const ABAS = [
  { href: "/visao-geral", label: "Visão Geral" },
  { href: "/dashboard", label: "Meu estabelecimento" },
  { href: "/perfil", label: "Perfil" },
  { href: "/mercado", label: "Mercado" },
  { href: "/evolucao", label: "Evolução" },
  { href: "/relatorio", label: "Relatório" },
  { href: "/status", label: "Status do projeto" },
  { href: "/demo", label: "Demonstração" },
];

export default function NavClient() {
  const pathname = usePathname();
  const router = useRouter();
  const [sessao, setSessao] = useState(null);
  const [verificado, setVerificado] = useState(false);

  useEffect(() => {
    const s = getSessao();
    setSessao(s);
    setVerificado(true);
    if (!s && pathname !== "/login") {
      router.replace("/login");
    }
  }, [pathname, router]);

  function sair() {
    limparSessao();
    router.push("/login");
  }

  // Na tela de login, ou enquanto ainda não verificou a sessão, não mostra o menu
  if (pathname === "/login" || !verificado) {
    return (
      <div className="flex justify-center mb-4">
        <div className="bg-white rounded-xl px-6 py-3 shadow-sm">
          <img src="/logo-sindhospe.png" alt="SINDHOSPE" className="h-16 w-auto" />
        </div>
      </div>
    );
  }

  // Sem sessão e não é a página de login: está redirecionando, não renderiza nada
  if (!sessao) return null;

  return (
    <header
      className="rounded-xl px-4 py-5 mb-4 shadow-sm"
      style={{ background: `linear-gradient(135deg, ${CORES.verdeEscuro}, ${CORES.verde})` }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1" />
        <div className="bg-white rounded-xl px-6 py-3 shadow-sm">
          <img src="/logo-sindhospe.png" alt="SINDHOSPE" className="h-24 w-auto" />
        </div>
        <div className="flex-1 flex justify-end">
          <button
            onClick={sair}
            className="text-xs font-semibold px-3 py-1.5 rounded-md bg-white/15 text-white hover:bg-white/25 transition-colors"
          >
            Sair
          </button>
        </div>
      </div>
      <nav className="flex items-center justify-center gap-1 bg-white/10 rounded-lg p-1 flex-wrap">
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
