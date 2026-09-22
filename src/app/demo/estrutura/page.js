"use client";

import { useState } from "react";
import { CORES, Card, CardTitle } from "../../components";
import { DemoBadge, VoltarDemo } from "../demo-components";
import { ESTRUTURA_ATUAL_DEMO } from "../mock-data";

const MESES = ["", "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function labelCompetencia(comp) {
  if (!comp) return "";
  return `${MESES[parseInt(comp.slice(4, 6), 10)]}/${comp.slice(2, 4)}`;
}

/** Linha com valor atual, anterior e variação colorida */
function LinhaEstrutura({ nome, atual, anterior }) {
  const delta = atual - anterior;
  const cresceu = delta > 0;
  const caiu = delta < 0;
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0 gap-3">
      <span className="text-sm text-gray-700 min-w-0 truncate">{nome}</span>
      <span className="flex items-center gap-3 shrink-0">
        <span className="text-xs text-gray-400">{anterior} →</span>
        <span className="text-sm font-bold text-gray-900 w-7 text-right">{atual}</span>
        <span
          className="text-xs font-semibold w-10 text-right"
          style={{ color: cresceu ? CORES.verdeEscuro : caiu ? CORES.vermelho : "#9ca3af" }}
        >
          {cresceu ? `+${delta}` : caiu ? delta : "—"}
        </span>
      </span>
    </div>
  );
}

export default function DemoEstruturaPage() {
  const e = ESTRUTURA_ATUAL_DEMO;

  const totalAtual = e.leitos_por_especialidade.reduce((s, l) => s + l.atual, 0);
  const totalAnterior = e.leitos_por_especialidade.reduce((s, l) => s + l.anterior, 0);
  const deltaTotal = totalAtual - totalAnterior;

  return (
    <div>
      <VoltarDemo />
      <DemoBadge />

      <Card>
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <p className="text-xs mb-0.5" style={{ color: CORES.verde }}>Estrutura física e capacidade</p>
            <p className="text-lg font-semibold text-gray-900">
              {labelCompetencia(e.competencia)} vs. período anterior
            </p>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Comparação entre períodos do que o CNES registra: leitos por especialidade, salas funcionais e equipamentos.
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold" style={{ color: CORES.verdeEscuro }}>{totalAtual}</p>
            <p className="text-xs" style={{ color: deltaTotal > 0 ? CORES.verdeEscuro : deltaTotal < 0 ? CORES.vermelho : "#9ca3af" }}>
              {deltaTotal > 0 ? `▲ +${deltaTotal}` : deltaTotal < 0 ? `▼ ${deltaTotal}` : "estável"} vs. período anterior
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <CardTitle>Leitos por especialidade</CardTitle>
        {e.leitos_por_especialidade.map((l) => (
          <LinhaEstrutura key={l.especialidade} nome={l.especialidade} atual={l.atual} anterior={l.anterior} />
        ))}
        <p className="text-xs text-gray-400 mt-3 leading-relaxed">
          Na versão real, cada especialidade vem do arquivo DC (Dados Complementares) do CNES, histórico
          por competência — é o mesmo dado que alimenta a Evolução trimestral.
        </p>
      </Card>

      <Card>
        <CardTitle>Salas funcionais</CardTitle>
        {e.salas_funcionais.map((s) => (
          <LinhaEstrutura key={s.nome} nome={s.nome} atual={s.atual} anterior={s.anterior} />
        ))}
      </Card>

      <Card>
        <CardTitle>Equipamentos em destaque</CardTitle>
        {e.equipamentos_destaque.map((q) => (
          <LinhaEstrutura key={q.nome} nome={q.nome} atual={q.atual} anterior={q.anterior} />
        ))}
        <p className="text-xs text-gray-400 mt-3 leading-relaxed">
          Equipamentos relevantes para contratos com planos e para a gravidade da assistência.
        </p>
      </Card>

      <p className="text-xs text-gray-400 text-center mt-6 leading-relaxed">
        Protótipo — dados fictícios apenas para ilustrar a comparação entre períodos.
      </p>
    </div>
  );
}
