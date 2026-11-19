"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getSessao } from "../components";
import { buscarEstabelecimentos } from "../dados";
import { entrar as entrarNoFirebase, entrarComoSindicato, inicioDe } from "../sessao";
import { mensagemAmigavel } from "../api-error";

// Cada associado tem senha individual (entregue pelo SINDHOSPE); não há mais
// senha de demonstração exibida na tela.

export default function LoginPage() {
  const router = useRouter();

  const [termo, setTermo] = useState("");
  // Resultado da última busca, guardado com o termo que o gerou: "buscando" = o termo atual ainda não respondeu.
  const [resultado, setResultado] = useState({ termo: "", itens: [] });
  const [escolhido, setEscolhido] = useState(null); // { cnes, nome_fantasia }
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [modoSindicato, setModoSindicato] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    const sessao = getSessao();
    if (sessao) {
      router.replace(inicioDe(sessao));
    }
  }, [router]);

  const termoValido = termo.trim().length >= 2;
  const buscando = termoValido && !escolhido && resultado.termo !== termo;
  const sugestoes = termoValido && !escolhido && !buscando ? resultado.itens : [];

  useEffect(() => {
    if (escolhido || !termoValido) return undefined;
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      try {
        setResultado({ termo, itens: await buscarEstabelecimentos(termo) });
      } catch (e) {
        console.error("Busca de estabelecimento falhou:", e);
        setResultado({ termo, itens: [] });
      }
    }, 350);

    return () => clearTimeout(debounceRef.current);
  }, [termo, escolhido, termoValido]);

  function escolherEstabelecimento(item) {
    setEscolhido(item);
    setTermo(item.nome_fantasia);
    setErro("");
  }

  function trocarEstabelecimento() {
    setEscolhido(null);
    setTermo("");
    setSenha("");
    setErro("");
  }

  async function entrar(e) {
    e.preventDefault();
    setErro("");

    if (modoSindicato) {
      if (!senha) {
        setErro("Digite a senha do SINDHOSPE.");
        return;
      }
      setEnviando(true);
      try {
        await entrarComoSindicato(senha);
        router.push("/sindicato");
      } catch (falha) {
        setErro(mensagemAmigavel(falha));
        setEnviando(false);
      }
      return;
    }

    if (!escolhido) {
      setErro("Selecione o seu estabelecimento na lista antes de continuar.");
      return;
    }
    if (!senha) {
      setErro("Digite a sua senha.");
      return;
    }

    setEnviando(true);
    try {
      await entrarNoFirebase(escolhido.cnes, senha);
      router.push("/dashboard");
    } catch (falha) {
      setErro(mensagemAmigavel(falha));
      setEnviando(false);
    }
  }

  function alternarModo() {
    setModoSindicato((v) => !v);
    setEscolhido(null);
    setTermo("");
    setSenha("");
    setErro("");
  }

  if (modoSindicato) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-[2rem] sm:text-[2.5rem] leading-tight font-bold text-[#0b4a34] mb-2">Acesso do SINDHOSPE</h1>
          <p className="text-lg text-[#4b5f57]">Painel consolidado de todos os associados, só para a equipe do sindicato.</p>
        </div>
        <form onSubmit={entrar} className="bg-white border border-[#e6f5ee] rounded-xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div>
            <label htmlFor="campo-senha-sindicato" className="block text-lg font-bold text-[#0b4a34] mb-3">
              Senha do SINDHOSPE
            </label>
            <input
              id="campo-senha-sindicato"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Senha"
              autoComplete="current-password"
              className="w-full text-lg text-[#0b4a34] placeholder:text-[#9db3aa] border-2 border-[#bfd5cc] rounded-lg px-4 h-14 focus:outline-none focus:border-[#159957] focus:ring-2 focus:ring-[#e6f5ee]"
            />
          </div>
          {erro && (
            <div className="bg-[#fbe9ea] border-2 border-[#8f1d24] text-[#8f1d24] font-medium rounded-lg px-4 py-3 flex items-start gap-2">
              <span aria-hidden="true">⚠</span>
              <span>{erro}</span>
            </div>
          )}
          <button
            type="submit"
            disabled={enviando}
            className="w-full min-h-[52px] text-lg font-bold text-white bg-[#0b4a34] hover:bg-[#159957] transition-colors rounded-lg px-4 disabled:opacity-60"
          >
            {enviando ? "Entrando..." : "Entrar no painel →"}
          </button>
        </form>
        <p className="text-center mt-5">
          <button type="button" onClick={alternarModo} className="text-base font-semibold text-[#0b4a34] underline min-h-[44px] px-2">
            ← Sou associado
          </button>
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-[2rem] sm:text-[2.5rem] leading-tight font-bold text-[#0b4a34] mb-2">
          Acesso dos associados
        </h1>
        <p className="text-lg text-[#4b5f57]">
          Entre para ver os dados e indicadores do seu estabelecimento.
        </p>
      </div>

      {/* Indicador de passos */}
      <div className="flex items-center justify-center gap-3 mb-6" aria-hidden="true">
        <div
          className={`flex items-center gap-2 font-bold ${
            escolhido ? "text-[#159957]" : "text-[#0b4a34]"
          }`}
        >
          <span
            className={`flex items-center justify-center w-8 h-8 rounded-full text-white ${
              escolhido ? "bg-[#159957]" : "bg-[#0b4a34]"
            }`}
          >
            {escolhido ? "✓" : "1"}
          </span>
          Buscar estabelecimento
        </div>
        <div className="w-10 h-0.5 bg-[#e6f5ee]" />
        <div className={`flex items-center gap-2 font-bold ${escolhido ? "text-[#0b4a34]" : "text-[#4b5f57]/50"}`}>
          <span
            className={`flex items-center justify-center w-8 h-8 rounded-full text-white ${
              escolhido ? "bg-[#0b4a34]" : "bg-[#4b5f57]/30"
            }`}
          >
            2
          </span>
          Senha
        </div>
      </div>

      <form
        onSubmit={entrar}
        className="bg-white border border-[#e6f5ee] rounded-xl p-6 sm:p-8 space-y-8 shadow-sm"
      >
        {/* Passo 1: encontrar o estabelecimento */}
        <div>
          <label htmlFor="campo-estabelecimento" className="block text-lg font-bold text-[#0b4a34] mb-3">
            Qual é o seu estabelecimento?
          </label>

          {escolhido ? (
            <div className="flex items-center justify-between gap-3 bg-[#e6f5ee] border-2 border-[#159957] rounded-lg px-4 py-3.5">
              <span className="flex items-center gap-2 font-bold text-[#0b4a34]">
                <span className="text-[#159957]" aria-hidden="true">✓</span>
                {escolhido.nome_fantasia}
              </span>
              <button
                type="button"
                onClick={trocarEstabelecimento}
                className="text-sm font-semibold text-[#8f1d24] hover:underline shrink-0 min-h-[44px] px-2"
              >
                Trocar
              </button>
            </div>
          ) : (
            <div className="relative">
              <span
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4b5f57]"
                aria-hidden="true"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="2" />
                  <path d="M18 18L13.5 13.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </span>
              <input
                id="campo-estabelecimento"
                type="text"
                value={termo}
                onChange={(e) => setTermo(e.target.value)}
                placeholder="Ex.: Hospital Esperança, Clínica..."
                autoComplete="off"
                className="w-full text-lg text-[#0b4a34] placeholder:text-[#9db3aa] border-2 border-[#bfd5cc] rounded-lg pl-12 pr-4 h-14 focus:outline-none focus:border-[#159957] focus:ring-2 focus:ring-[#e6f5ee]"
              />

              {termo.trim().length >= 2 && (
                <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white border border-[#e6f5ee] rounded-lg shadow-lg overflow-hidden max-h-72 overflow-y-auto">
                  {buscando && <p className="px-4 py-3 text-[#4b5f57]">Buscando...</p>}
                  {!buscando && sugestoes.length === 0 && (
                    <p className="px-4 py-3 text-[#4b5f57]">
                      Nenhum estabelecimento encontrado com esse nome.
                    </p>
                  )}
                  {!buscando &&
                    sugestoes.map((item) => (
                      <button
                        type="button"
                        key={item.cnes}
                        onClick={() => escolherEstabelecimento(item)}
                        className="w-full text-left px-4 py-3 min-h-[48px] font-medium text-[#0b4a34] hover:bg-[#e6f5ee] border-t border-[#e6f5ee] first:border-t-0"
                      >
                        {item.nome_fantasia}
                      </button>
                    ))}
                </div>
              )}
            </div>
          )}
          <p className="text-sm text-[#4b5f57] mt-2 flex items-start gap-1.5">
            <span aria-hidden="true">🔒</span>
            Por segurança, não exibimos a lista completa de estabelecimentos — só os que combinam com
            o que você digitar.
          </p>
        </div>

        {/* Passo 2: senha */}
        <div className={!escolhido ? "opacity-40" : ""}>
          <label htmlFor="campo-senha" className="block text-lg font-bold text-[#0b4a34] mb-3">
            Digite sua senha de acesso
          </label>
          <div className="relative">
            <input
              id="campo-senha"
              type={mostrarSenha ? "text" : "password"}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              disabled={!escolhido}
              placeholder="Senha"
              className="w-full text-lg text-[#0b4a34] placeholder:text-[#9db3aa] border-2 border-[#bfd5cc] rounded-lg px-4 h-14 pr-24 focus:outline-none focus:border-[#159957] focus:ring-2 focus:ring-[#e6f5ee] disabled:bg-[#f5f5f5]"
            />
            <button
              type="button"
              disabled={!escolhido}
              onClick={() => setMostrarSenha((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#0b4a34] px-3 min-h-[44px] hover:underline disabled:opacity-40"
            >
              {mostrarSenha ? "Ocultar" : "Mostrar"}
            </button>
          </div>
          <details className="mt-2 text-sm text-[#4b5f57]">
            <summary className="cursor-pointer font-semibold text-[#0b4a34] min-h-[32px] inline-flex items-center">
              Esqueci minha senha / não tenho senha
            </summary>
            <p className="mt-1 leading-relaxed">
              Cada estabelecimento tem uma senha individual, entregue pelo SINDHOSPE. Se você não recebeu ou esqueceu
              a sua, peça uma nova ao SINDHOSPE (contato@sindhospe.org.br). Depois de entrar, você pode trocá-la na aba
              Perfil.
            </p>
          </details>
        </div>

        {erro && (
          <div className="bg-[#fbe9ea] border-2 border-[#8f1d24] text-[#8f1d24] font-medium rounded-lg px-4 py-3 flex items-start gap-2">
            <span aria-hidden="true">⚠</span>
            <span>{erro}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={enviando}
          className="w-full min-h-[52px] text-lg font-bold text-white bg-[#0b4a34] hover:bg-[#159957] transition-colors rounded-lg px-4 disabled:opacity-60"
        >
          {enviando ? "Entrando..." : "Entrar →"}
        </button>
      </form>
      <p className="text-center mt-5">
        <button type="button" onClick={alternarModo} className="text-base font-semibold text-[#0b4a34] underline min-h-[44px] px-2">
          Acesso do SINDHOSPE (equipe do sindicato)
        </button>
      </p>
    </div>
  );
}
