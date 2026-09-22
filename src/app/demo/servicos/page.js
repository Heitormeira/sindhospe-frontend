"use client";

import { useMemo, useState } from "react";
import { CORES, Card, CardTitle } from "../../components";
import { DemoBadge, VoltarDemo } from "../demo-components";
import { CATALOGO_SERVICOS_DEMO, LACUNAS_SERVICOS_DEMO } from "../mock-data";

const FILTROS_COMPLEXIDADE = ["Todas", "Baixa", "Média", "Alta"];
const FILTROS_HOMOLOGADO = ["Todos", "Sim", "Não"];

const GRUPO_ICONE = {
  "Ambulatorial e urgência": "🚑",
  "Internação": "🛏️",
  "Apoio diagnóstico": "🔬",
  "Apoio diagnóstico/terapêutico": "🫀",
  "Atenção especializada": "⭐",
};

const CHIP_COMPLEXIDADE = {
  Baixa: { bg: CORES.verdeClaro, cor: CORES.verdeEscuro },
  Média: { bg: `${CORES.dourado}22`, cor: "#8a6a00" },
  Alta: { bg: CORES.vermelhoClaro, cor: CORES.vermelho },
};

export default function DemoServicosPage() {
  const [complexidade, setComplexidade] = useState("Todas");
  const [homologado, setHomologado] = useState("Todos");

  const servicos = useMemo(
    () =>
      CATALOGO_SERVICOS_DEMO.filter(
        (s) =>
          (complexidade === "Todas" || s.complexidade === complexidade) &&
          (homologado === "Todos" || s.homologado === homologado)
      ),
    [complexidade, homologado]
  );

  const totalHomologados = CATALOGO_SERVICOS_DEMO.filter((s) => s.homologado === "Sim").length;

  return (
    <div>
      <VoltarDemo />
      <DemoBadge />

      <Card>
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <p className="text-xs mb-0.5" style={{ color: CORES.verde }}>Serviços oferecidos</p>
            <p className="text-lg font-semibold text-gray-900">Catálogo e habilitações</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold" style={{ color: CORES.verdeEscuro }}>
              {totalHomologados}
              <span className="text-sm font-semibold text-gray-400">/{CATALOGO_SERVICOS_DEMO.length}</span>
            </p>
            <p className="text-xs text-gray-500">homologados no CNES</p>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex flex-wrap gap-4 mb-3">
          <div>
            <label className="text-xs text-gray-500 block mb-1.5">Complexidade</label>
            <div className="flex gap-1 bg-black/5 rounded-lg p-1">
              {FILTROS_COMPLEXIDADE.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setComplexidade(f)}
                  className="text-xs font-semibold px-2.5 py-1 rounded-md transition-colors"
                  style={{
                    background: complexidade === f ? "white" : "transparent",
                    color: complexidade === f ? CORES.verdeEscuro : "#6b7280",
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1.5">Homologação</label>
            <div className="flex gap-1 bg-black/5 rounded-lg p-1">
              {FILTROS_HOMOLOGADO.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setHomologado(f)}
                  className="text-xs font-semibold px-2.5 py-1 rounded-md transition-colors"
                  style={{
                    background: homologado === f ? "white" : "transparent",
                    color: homologado === f ? CORES.verdeEscuro : "#6b7280",
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        <ul className="divide-y divide-gray-100">
          {servicos.map((s) => (
            <li key={s.codigo} className="py-3 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm text-gray-900 font-medium">
                  <span className="mr-1.5" aria-hidden>{GRUPO_ICONE[s.grupo] || "🏥"}</span>
                  {s.nome}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {s.grupo} &middot; {s.codigo}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-md"
                  style={CHIP_COMPLEXIDADE[s.complexidade]}
                >
                  {s.complexidade}
                </span>
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-md"
                  style={
                    s.homologado === "Sim"
                      ? { background: CORES.verdeClaro, color: CORES.verdeEscuro }
                      : { background: "#f3f4f6", color: "#6b7280" }
                  }
                >
                  {s.homologado === "Sim" ? "Homologado" : "Sem habilitação"}
                </span>
              </div>
            </li>
          ))}
          {servicos.length === 0 && (
            <li className="py-4 text-sm text-gray-500 text-center">Nenhum serviço com esses filtros.</li>
          )}
        </ul>
      </Card>

      <Card>
        <CardTitle>O que o grupo semelhante oferece e você ainda não</CardTitle>
        <p className="text-xs text-gray-500 mb-3 leading-relaxed">
          Análise de lacunas: serviços presentes em uma parte dos hospitais gerais do grupo —
          possíveis linhas de expansão (agregado, sem identificar concorrentes).
        </p>
        <ul className="divide-y divide-gray-100">
          {LACUNAS_SERVICOS_DEMO.map((l) => (
            <li key={l.servico} className="py-2.5 flex items-start justify-between gap-3">
              <span className="text-sm text-gray-700 min-w-0">{l.servico}</span>
              <span className="text-xs shrink-0" style={{ color: "#8a6a00" }}>
                ⚠ {l.noGrupo}
              </span>
            </li>
          ))}
        </ul>
        <p className="text-xs text-gray-400 mt-3 leading-relaxed">
          Base para a conversa de expansão: cada lacuna é uma linha de receita potencial — e um argumento
          para planejar habilitação junto à SES-PE.
        </p>
      </Card>

      <p className="text-xs text-gray-400 text-center mt-6 leading-relaxed">
        Protótipo — catálogo fictício; o real virá dos grupos SR/HB do CNES.
      </p>
    </div>
  );
}
