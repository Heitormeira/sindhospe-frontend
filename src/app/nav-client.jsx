"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getSessao, limparSessao } from "./components";

const ABAS_PRINCIPAIS = [
  { href: "/dashboard", rotulo: "Meu estabelecimento" },
  { href: "/visao-geral", rotulo: "Visão geral" },
  { href: "/mercado", rotulo: "Mercado" },
  { href: "/evolucao", rotulo: "Evolução" },
  { href: "/relatorio", rotulo: "Relatório" },
  { href: "/perfil", rotulo: "Perfil" },
];

const ABAS_PROJETO = [
  { href: "/status", rotulo: "Status do projeto" },
  { href: "/demonstracao", rotulo: "Demonstração" },
];

// Páginas que podem ser vistas sem estar logado (ex: para apresentar o
// projeto a alguém antes de ter uma senha). Os dados dos associados
// continuam só para quem faz login.
const PAGINAS_PUBLICAS = ["/login", "/status", "/demonstracao"];

const ESCALAS_FONTE = [
  { rotulo: "A-", valor: "94%" },
  { rotulo: "A", valor: "100%" },
  { rotulo: "A+", valor: "125%" },
];

export default function NavClient({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  const [sessao, setSessao] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [menuProjetoAberto, setMenuProjetoAberto] = useState(false);
  const [fonteAtual, setFonteAtual] = useState("100%");
  const [contrasteAlto, setContrasteAlto] = useState(false);

  // Guarda de acesso: sem sessão, só as páginas públicas podem ser vistas.
  useEffect(() => {
    const atual = getSessao();
    setSessao(atual);
    setCarregando(false);

    if (!atual && !PAGINAS_PUBLICAS.includes(pathname)) {
      router.replace("/login");
    }
  }, [pathname, router]);

  const aplicarFonte = useCallback((valor) => {
    document.documentElement.style.setProperty("--sindhospe-escala-fonte", valor);
  }, []);

  const aplicarContraste = useCallback((ativo) => {
    document.documentElement.setAttribute("data-contraste", ativo ? "alto" : "normal");
  }, []);

  // Recupera as preferências de acessibilidade salvas no navegador.
  useEffect(() => {
    try {
      const fonteSalva = localStorage.getItem("sindhospe_fonte") || "100%";
      const contrasteSalvo = localStorage.getItem("sindhospe_contraste") === "alto";
      aplicarFonte(fonteSalva);
      aplicarContraste(contrasteSalvo);
      setFonteAtual(fonteSalva);
      setContrasteAlto(contrasteSalvo);
    } catch {
      // localStorage pode não estar disponível (ex: navegação privada).
    }
  }, [aplicarFonte, aplicarContraste]);

  function mudarFonte(valor) {
    setFonteAtual(valor);
    aplicarFonte(valor);
    try {
      localStorage.setItem("sindhospe_fonte", valor);
    } catch {
      // ignora
    }
  }

  function alternarContraste() {
    const novo = !contrasteAlto;
    setContrasteAlto(novo);
    aplicarContraste(novo);
    try {
      localStorage.setItem("sindhospe_contraste", novo ? "alto" : "normal");
    } catch {
      // ignora
    }
  }

  function sair() {
    limparSessao();
    router.push("/login");
  }

  const podeVerConteudo = Boolean(sessao) || PAGINAS_PUBLICAS.includes(pathname);
  const inicial = sessao?.nome ? sessao.nome.trim().charAt(0).toUpperCase() : "?";

  return (
    <>
      <a
        href="#conteudo-principal"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-white focus:text-[#0b4a34] focus:px-4 focus:py-2 focus:rounded-md focus:shadow-lg focus:font-bold"
      >
        Pular para o conteúdo
      </a>

      {/* Barra de acessibilidade */}
      <div className="bg-[#0b4a34] text-white">
        <div className="w-full px-4 sm:px-10 py-2 flex flex-wrap items-center justify-between gap-3 text-sm">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <span className="hidden sm:inline font-medium">Acessibilidade:</span>

            <div className="flex items-center gap-2">
              <div className="flex rounded-md overflow-hidden border border-white/40">
                {ESCALAS_FONTE.map((opcao) => (
                  <button
                    key={opcao.valor}
                    type="button"
                    onClick={() => mudarFonte(opcao.valor)}
                    aria-pressed={fonteAtual === opcao.valor}
                    className={`min-w-[40px] min-h-[36px] px-3 py-1.5 font-bold transition-colors ${
                      fonteAtual === opcao.valor
                        ? "bg-white text-[#0b4a34]"
                        : "bg-transparent text-white hover:bg-white/10"
                    }`}
                  >
                    {opcao.rotulo}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span>Alto contraste</span>
              <button
                type="button"
                onClick={alternarContraste}
                aria-pressed={contrasteAlto}
                aria-label="Alternar alto contraste"
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors border border-white/40 ${
                  contrasteAlto ? "bg-[#f2b705]" : "bg-white/10"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                    contrasteAlto ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          {sessao && (
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 font-semibold hover:underline shrink-0"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M3 11.5 12 4l9 7.5" />
                <path d="M5.5 10v9a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-9" />
                <path d="M9.5 20v-6h5v6" />
              </svg>
              Voltar ao início
            </Link>
          )}
        </div>
      </div>

      {/* Cabeçalho principal */}
      <header className="bg-white border-b border-[#e6f5ee] shadow-sm">
        <div className="w-full px-4 sm:px-10 py-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img src="/logo-sindhospe.png" alt="Logotipo do SINDHOSPE" className="h-16 sm:h-20 w-auto" />
            <div className="hidden sm:block border-l-2 border-[#e6f5ee] pl-4">
              <p className="text-[1.75rem] leading-[2.25rem] font-bold text-[#0b4a34]">Portal SINDHOSPE</p>
              <p className="text-base text-[#4b5f57]">Inteligência de dados para sua instituição</p>
            </div>
          </div>

          {sessao && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2.5 bg-[#e6f5ee] rounded-full pl-1.5 pr-4 py-1.5">
                <span className="flex items-center justify-center w-9 h-9 rounded-full bg-[#159957] text-white font-bold">
                  {inicial}
                </span>
                <div className="hidden sm:block leading-tight">
                  <p className="text-xs text-[#4b5f57]">Bem-vindo(a),</p>
                  <p className="font-bold text-[#0b4a34] text-sm">{sessao.nome}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={sair}
                className="min-h-[48px] px-4 rounded-md border-2 border-[#159957] text-[#0b4a34] font-bold hover:bg-[#e6f5ee] transition-colors"
              >
                Sair
              </button>
            </div>
          )}
        </div>

        {/* Navegação entre as páginas do portal */}
        {sessao && (
          <nav aria-label="Navegação principal" className="border-t border-[#e6f5ee]">
            <div className="w-full px-4 sm:px-10 flex flex-wrap items-center gap-1 py-2">
              {ABAS_PRINCIPAIS.map((aba) => {
                const ativa = pathname === aba.href;
                return (
                  <Link
                    key={aba.href}
                    href={aba.href}
                    className={`min-h-[48px] flex items-center px-4 rounded-md text-base font-bold whitespace-nowrap transition-colors ${
                      ativa ? "bg-[#0b4a34] text-white" : "text-[#0b4a34] hover:bg-[#e6f5ee]"
                    }`}
                  >
                    {aba.rotulo}
                  </Link>
                );
              })}

              <div className="relative ml-auto">
                <button
                  type="button"
                  onClick={() => setMenuProjetoAberto((v) => !v)}
                  className="min-h-[48px] flex items-center px-4 rounded-md text-sm font-semibold text-[#4b5f57] hover:bg-[#e6f5ee] hover:text-[#0b4a34] whitespace-nowrap"
                >
                  Sobre o projeto {menuProjetoAberto ? "▲" : "▾"}
                </button>
                {menuProjetoAberto && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-[#e6f5ee] rounded-md shadow-lg z-20 min-w-[200px]">
                    {ABAS_PROJETO.map((aba) => (
                      <Link
                        key={aba.href}
                        href={aba.href}
                        onClick={() => setMenuProjetoAberto(false)}
                        className="block px-4 py-3 text-sm font-medium text-[#0b4a34] hover:bg-[#e6f5ee]"
                      >
                        {aba.rotulo}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </nav>
        )}
      </header>

      <main
        id="conteudo-principal"
        className="w-full px-4 sm:px-10 py-8"
      >
        {carregando ? (
          <div className="text-center text-[#4b5f57] py-20">Carregando...</div>
        ) : podeVerConteudo ? (
          children
        ) : (
          <div className="text-center text-[#4b5f57] py-20">Redirecionando para o login...</div>
        )}
      </main>

      <footer className="mt-12 border-t border-[#e6f5ee] bg-white">
        <div className="w-full px-4 sm:px-10 py-6 text-sm text-[#4b5f57] flex flex-wrap items-center justify-between gap-2">
          <span>SINDHOSPE — Sindicato dos Hospitais e Estabelecimentos de Serviços de Saúde de Pernambuco</span>
          <span>Projeto Integrador · UNICAP</span>
        </div>
      </footer>
    </>
  );
}
