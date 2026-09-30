"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL, getSessao, salvarSessao } from "../components";

// Senha de demonstração da fase atual do projeto — a mesma para todos os
// associados. Quando o SINDHOSPE aprovar o modelo final, isso entra no
// lugar de um login real (uma senha por associado).
const SENHA_DEMO = "12345";

export default function LoginPage() {
  const router = useRouter();

  const [termo, setTermo] = useState("");
  const [sugestoes, setSugestoes] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [escolhido, setEscolhido] = useState(null); // { cnes, nome_fantasia }
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (getSessao()) {
      router.replace("/dashboard");
    }
  }, [router]);

  useEffect(() => {
    if (escolhido) return;

    if (termo.trim().length < 2) {
      setSugestoes([]);
      setBuscando(false);
      return;
    }

    setBuscando(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      try {
        const resp = await fetch(
          `${API_URL}/api/estabelecimentos/buscar?q=${encodeURIComponent(termo.trim())}`
        );
        const dados = await resp.json();
        setSugestoes(Array.isArray(dados) ? dados : []);
      } catch {
        setSugestoes([]);
      } finally {
        setBuscando(false);
      }
    }, 350);

    return () => clearTimeout(debounceRef.current);
  }, [termo, escolhido]);

  function escolherEstabelecimento(item) {
    setEscolhido(item);
    setTermo(item.nome_fantasia);
    setSugestoes([]);
    setErro("");
  }

  function trocarEstabelecimento() {
    setEscolhido(null);
    setTermo("");
    setSenha("");
    setErro("");
  }

  function entrar(e) {
    e.preventDefault();
    setErro("");

    if (!escolhido) {
      setErro("Selecione o seu estabelecimento na lista antes de continuar.");
      return;
    }
    if (senha !== SENHA_DEMO) {
      setErro("Senha incorreta. Confira a senha de demonstração logo abaixo do campo e tente de novo.");
      return;
    }

    setEnviando(true);
    salvarSessao(escolhido.cnes, escolhido.nome_fantasia);
    router.push("/dashboard");
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
                className="w-full text-lg border-2 border-[#bfd5cc] rounded-lg pl-12 pr-4 h-14 focus:outline-none focus:border-[#159957] focus:ring-2 focus:ring-[#e6f5ee]"
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
              className="w-full text-lg border-2 border-[#bfd5cc] rounded-lg px-4 h-14 pr-24 focus:outline-none focus:border-[#159957] focus:ring-2 focus:ring-[#e6f5ee] disabled:bg-[#f5f5f5]"
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
          <p className="text-sm text-[#4b5f57] mt-2">
            Fase de demonstração — senha de acesso: <strong>12345</strong>
          </p>
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
    </div>
  );
}
