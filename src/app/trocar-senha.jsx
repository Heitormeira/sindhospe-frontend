"use client";

// Troca de senha da conta logada (associado ou sindicato). A senha individual
// inicial é entregue pelo SINDHOSPE; aqui o usuário escolhe a própria.
import { useState } from "react";
import { CORES, Card, CardTitle } from "./components";
import { alterarSenha } from "./sessao";
import { mensagemAmigavel } from "./api-error";
import { validarNovaSenha, MINIMO_SENHA } from "./senha.mjs";

const CAMPO =
  "w-full text-base text-[#0b4a34] border-2 border-[#bfd5cc] rounded-lg px-3 h-12 focus:outline-none focus:border-[#159957] focus:ring-2 focus:ring-[#e6f5ee]";

export default function TrocarSenha() {
  const [aberto, setAberto] = useState(false);
  const [atual, setAtual] = useState("");
  const [nova, setNova] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [feito, setFeito] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    const problema = validarNovaSenha(atual, nova, confirmacao);
    if (problema) {
      setErro(problema);
      return;
    }
    setErro("");
    setEnviando(true);
    try {
      await alterarSenha(atual, nova);
      setFeito(true);
      setAberto(false);
      setAtual("");
      setNova("");
      setConfirmacao("");
    } catch (falha) {
      const codigo = String(falha?.code || "");
      setErro(/invalid-credential|wrong-password/.test(codigo) ? "A senha atual está incorreta." : mensagemAmigavel(falha));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Card>
      <CardTitle>Senha de acesso</CardTitle>
      {feito && (
        <p className="text-sm mb-3" style={{ color: CORES.verdeEscuro }}>
          ✓ Senha alterada. Use a nova senha no próximo acesso.
        </p>
      )}
      {!aberto ? (
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p className="text-sm text-gray-600">
            Recomendamos trocar a senha recebida do SINDHOSPE por uma senha só sua.
          </p>
          <button
            type="button"
            onClick={() => {
              setAberto(true);
              setFeito(false);
            }}
            className="min-h-[44px] px-4 rounded-lg border-2 border-[#159957] text-[#0b4a34] font-bold hover:bg-[#e6f5ee]"
          >
            Trocar senha
          </button>
        </div>
      ) : (
        <form onSubmit={enviar} className="space-y-3">
          <div>
            <label htmlFor="senha-atual" className="block text-sm font-semibold text-[#0b4a34] mb-1">Senha atual</label>
            <input id="senha-atual" type="password" autoComplete="current-password" value={atual} onChange={(e) => setAtual(e.target.value)} className={CAMPO} />
          </div>
          <div>
            <label htmlFor="senha-nova" className="block text-sm font-semibold text-[#0b4a34] mb-1">Nova senha</label>
            <input id="senha-nova" type="password" autoComplete="new-password" value={nova} onChange={(e) => setNova(e.target.value)} className={CAMPO} />
            <p className="text-xs text-gray-500 mt-1">Pelo menos {MINIMO_SENHA} caracteres, com letra e número.</p>
          </div>
          <div>
            <label htmlFor="senha-confirmacao" className="block text-sm font-semibold text-[#0b4a34] mb-1">Confirme a nova senha</label>
            <input id="senha-confirmacao" type="password" autoComplete="new-password" value={confirmacao} onChange={(e) => setConfirmacao(e.target.value)} className={CAMPO} />
          </div>
          {erro && (
            <p role="alert" className="text-sm font-medium rounded-lg px-3 py-2" style={{ background: CORES.vermelhoClaro, color: CORES.vermelho }}>
              {erro}
            </p>
          )}
          <div className="flex gap-2 flex-wrap">
            <button
              type="submit"
              disabled={enviando}
              className="min-h-[44px] px-5 rounded-lg text-white font-bold disabled:opacity-60"
              style={{ background: CORES.verdeEscuro }}
            >
              {enviando ? "Salvando..." : "Salvar nova senha"}
            </button>
            <button
              type="button"
              onClick={() => {
                setAberto(false);
                setErro("");
              }}
              className="min-h-[44px] px-4 rounded-lg text-[#0b4a34] font-semibold hover:bg-[#e6f5ee]"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </Card>
  );
}
