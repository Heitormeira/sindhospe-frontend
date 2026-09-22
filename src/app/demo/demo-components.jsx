"use client";

import Link from "next/link";
import { CORES } from "../components";

/**
 * Badge exibido em todas as telas de demonstração para deixar claro
 * que o conteúdo é ilustrativo (dados fictícios), não dado real.
 */
export function DemoBadge({ compact = false }) {
  return (
    <div
      className="rounded-lg px-3 py-2 text-xs flex items-start gap-2 mb-4"
      style={{ background: CORES.vermelhoClaro, color: CORES.vermelho, border: `0.5px solid ${CORES.vermelho}33` }}
    >
      <span aria-hidden>🧪</span>
      <span>
        {compact ? (
          <>Protótipo — dados fictícios.</>
        ) : (
          <>
            <strong>Protótipo de demonstração</strong> — os dados desta tela são fictícios e servem apenas para
            ilustrar o fluxo. As telas de <Link href="/dashboard" className="underline font-semibold">Meu estabelecimento</Link>,{" "}
            <Link href="/mercado" className="underline font-semibold">Mercado</Link> e{" "}
            <Link href="/evolucao" className="underline font-semibold">Evolução</Link> usam dados reais do CNES/DATASUS.
          </>
        )}
      </span>
    </div>
  );
}

/** Voltar para o hub da demonstração */
export function VoltarDemo() {
  return (
    <Link
      href="/demo"
      className="inline-flex items-center gap-1 text-xs font-semibold mb-3"
      style={{ color: CORES.verdeEscuro }}
    >
      ← Voltar para a demonstração
    </Link>
  );
}

/** Linha de dados cadastrais em duas colunas (rótulo → valor) */
export function DadoCadastral({ label, valor }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-2 border-b border-gray-100 last:border-0">
      <span className="text-xs text-gray-500 shrink-0">{label}</span>
      <span className="text-sm text-gray-900 text-right font-medium">{valor}</span>
    </div>
  );
}

/** Chip de status com cor por situação (Ativo / Pendente / Inativo) */
export function ChipSituacao({ situacao }) {
  const mapa = {
    Ativo: { bg: CORES.verdeClaro, cor: CORES.verdeEscuro },
    Pendente: { bg: `${CORES.dourado}22`, cor: "#8a6a00" },
    Inativo: { bg: CORES.vermelhoClaro, cor: CORES.vermelho },
  };
  const estilo = mapa[situacao] || { bg: "#f3f4f6", cor: "#6b7280" };
  return (
    <span className="text-xs font-semibold px-2.5 py-1 rounded-md" style={{ background: estilo.bg, color: estilo.cor }}>
      {situacao}
    </span>
  );
}

/** Colunas responsivas para as tabelas da demo (rolagem horizontal em telas estreitas) */
export function TabelaDemo({ headers, children }) {
  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full text-sm min-w-[480px]">
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-2 py-2 border-b border-gray-200">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
