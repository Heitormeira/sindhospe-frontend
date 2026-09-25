"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CORES, getSessao, limparSessao } from "./components";

const ABAS_PRINCIPAIS = [
  { href: "/visao-geral", label: "Visão Geral" },
  { href: "/dashboard", label: "Meu estabelecimento" },
  { href: "/perfil", label: "Perfil" },
  { href: "/mercado", label: "Mercado" },
  { href: "/evolucao", label: "Evolução" },
  { href: "/relatorio", label: "Relatório" },
];

const ABAS_PROJETO = [
  { href: "/status", label: "Status do projeto" },
  { href: "/demo", label: "Demonstração" },
];

export default function NavClient() {
  const pathname = usePathname();
  const router = useRouter();
  const [sessao, setSessao] = useState(null);
  const [verificado, setVerificado] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const s = getSessao();
    setSessao(s);
    setVerificado(true);
    if (!s && pathname !== "/login") {
      router.replace("/login");
    }
  }, [pathname, router]);

  useEffect(() => {
    function fechar(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuAberto(false);
    }
    document.addEventListener("mousedown", fechar);
    return () => document.removeEventListener("mousedown", fechar);
  }, []);

  function sair() {
    limparSessao();
    router.push("/login");
  }

  if (pathname === "/login" || !verificado) {
    return (
      <div className="flex justify-center mb-4">
        <div className="bg-white rounded-xl px-6 py-3 shadow-sm">
          <img src="/logo-sindhospe.png" alt="SINDHOSPE" className="h-16 w-auto" />
        </div>
      </div>
    );
  }

  if (!sessao) return null;

  const emPaginaDeProjeto = ABAS_PROJETO.some((a) => a.href === pathname);

  return (
    <header
      className="rounded-xl px-4 py-5 mb-4 shadow-sm"
      style={{ background: `linear-gradient(135deg, ${CORES.verdeEscuro}, ${CORES.verde})` }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1" />
        <div className="bg-white rounded-xl px-6 py-3 shadow-sm">
          <img src="/logo-sindhospe.png" alt="SINDHOSPE" className="h-20 w-auto" />
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

      {/* Nav principal: rolagem horizontal em vez de quebrar linha */}
      <nav className="flex items-center gap-1 bg-white/10 rounded-lg p-1 overflow-x-auto">
        {ABAS_PRINCIPAIS.map((aba) => {
          const ativa = pathname === aba.href;
          return (
            <Link
              key={aba.href}
              href={aba.href}
              className="flex-shrink-0 text-center text-sm py-2 px-3 rounded-md transition-colors whitespace-nowrap"
              style={{
                background: ativa ? "white" : "transparent",
                color: ativa ? CORES.verdeEscuro : "white",
                fontWeight: ativa ? 600 : 400,
              }}
            >
              {aba.label}
            </Link>
          );
        })}
      </nav>

      {/* Menu "Mais" separado, discreto, pras páginas de bastidor do projeto */}
      <div className="flex justify-end mt-2 relative" ref={menuRef}>
        <button
          onClick={() => setMenuAberto((v) => !v)}
          className="text-xs px-2 py-1 rounded-md transition-colors flex items-center gap-1"
          style={{
            color: emPaginaDeProjeto ? "white" : "rgba(255,255,255,0.65)",
            fontWeight: emPaginaDeProjeto ? 600 : 400,
          }}
        >
          Sobre o projeto {menuAberto ? "▲" : "▼"}
        </button>
        {menuAberto && (
          <div className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-lg py-1 z-10 min-w-[180px]">
            {ABAS_PROJETO.map((aba) => (
              <Link
                key={aba.href}
                href={aba.href}
                onClick={() => setMenuAberto(false)}
                className="block text-sm px-4 py-2 hover:bg-gray-50"
                style={{ color: pathname === aba.href ? CORES.verdeEscuro : "#374151", fontWeight: pathname === aba.href ? 600 : 400 }}
              >
                {aba.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
