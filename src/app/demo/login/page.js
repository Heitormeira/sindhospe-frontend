"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CORES, Card } from "../../components";
import { DemoBadge, VoltarDemo } from "../demo-components";

export default function DemoLoginPage() {
  const router = useRouter();
  const [identificacao, setIdentificacao] = useState("");
  const [senha, setSenha] = useState("");
  const [entrando, setEntrando] = useState(false);

  const podeEntrar = identificacao.trim() !== "" && senha.trim() !== "";

  function entrar(e) {
    e.preventDefault();
    if (!podeEntrar || entrando) return;
    setEntrando(true);
    // Fluxo simulado: na versão real, aqui ocorreria a autenticação.
    // Na demo, levamos direto ao dashboard real com dados do CNES/DATASUS.
    router.push("/dashboard");
  }

  return (
    <div>
      <VoltarDemo />
      <DemoBadge />

      <Card>
        <h1 className="text-lg font-semibold text-gray-900 mb-1">Login do portal</h1>
        <p className="text-xs text-gray-500 mb-5 leading-relaxed">
          Acesso exclusivo para estabelecimentos associados ao SINDHOSPE. Identifique-se pelo{" "}
          <strong>código CNES</strong> ou pelo <strong>CNPJ</strong> do estabelecimento.
        </p>

        <form onSubmit={entrar}>
          <label className="text-xs text-gray-500 block mb-1">CNES ou CNPJ</label>
          <input
            value={identificacao}
            onChange={(e) => setIdentificacao(e.target.value)}
            placeholder="Ex.: 9876543 ou 12.345.678/0001-90"
            className="w-full text-sm rounded-lg px-3 py-2 mb-3 bg-white text-gray-900 border border-gray-200 shadow-sm"
          />

          <label className="text-xs text-gray-500 block mb-1">Senha</label>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="••••••••"
            className="w-full text-sm rounded-lg px-3 py-2 mb-3 bg-white text-gray-900 border border-gray-200 shadow-sm"
          />

          <button
            type="submit"
            disabled={!podeEntrar || entrando}
            className="w-full text-sm font-semibold rounded-lg px-4 py-2.5 text-white transition-opacity"
            style={{
              background: CORES.verde,
              opacity: podeEntrar && !entrando ? 1 : 0.5,
              cursor: podeEntrar && !entrando ? "pointer" : "not-allowed",
            }}
          >
            {entrando ? "Entrando…" : "Entrar"}
          </button>
        </form>

        <div className="flex items-center justify-between mt-4 text-xs">
          <span className="text-gray-400">Esqueceu a senha?</span>
          <Link href="/demo/login" className="font-semibold" style={{ color: CORES.verde }}>
            Recuperar acesso
          </Link>
        </div>
      </Card>

      <Card>
        <p className="text-sm text-gray-700 leading-relaxed">
          Ainda não tem acesso? O <strong>SINDHOSPE</strong> cadastra o estabelecimento associado e envia as
          credenciais para o responsável indicado.
        </p>
        <p className="text-xs text-gray-500 mt-3 leading-relaxed">
          Suporte: suporte@sindhospe.org.br &middot; (81) 3000-0000 &middot; Seg. a sex., 8h às 17h
        </p>
      </Card>

      <Card>
        <p className="text-xs text-gray-500 leading-relaxed">
          Nesta demonstração, preencha os campos com qualquer valor (ou use{" "}
          <strong>9876543</strong> / <strong>demo123</strong>) e o portal levará ao{" "}
          <strong>dashboard real</strong>, com dados oficiais do CNES/DATASUS.
        </p>
      </Card>

      <p className="text-xs text-gray-400 text-center mt-6 leading-relaxed">
        Protótipo — fluxo de autenticação ilustrativo. Nenhum dado informado aqui é enviado a servidores.
      </p>
    </div>
  );
}
