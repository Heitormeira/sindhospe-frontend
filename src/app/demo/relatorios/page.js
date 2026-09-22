"use client";

import { useMemo, useState } from "react";
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CORES, formatCompetencia } from "../../components";
import { DemoBadge, VoltarDemo } from "../demo-components";
import {
  HOSPITAL_DEMO,
  LEITOS_POR_PERIODO_DEMO,
  BENCHMARK_MUNICIPIO_DEMO,
  BENCHMARK_ESTADO_DEMO,
} from "../mock-data";

const JANELAS = [
  { label: "6 meses", periodos: 2 },
  { label: "12 meses", periodos: 5 },
  { label: "24 meses", periodos: 9 },
];

function KpiCard({ titulo, valor, cor, variacao, nomeJanela, contexto }) {
  const { abs, pct, cresceu, caiu } = variacao;
  return (
    <div className="border rounded-xl px-4 py-3.5" style={{ borderColor: `${CORES.verde}22`, background: "white" }}>
      <p className="text-xs text-gray-500">{titulo}</p>
      <p className="text-2xl font-bold mt-1" style={{ color: cor }}>
        {valor}
      </p>
      <p className="text-xs mt-0.5" style={{ color: cresceu ? CORES.verdeEscuro : caiu ? CORES.vermelho : "#6b7280" }}>
        {abs === 0 ? "• estável" : `${cresceu ? "▲" : "▼"} ${Math.abs(pct)}% na janela de ${nomeJanela}`}
      </p>
      <p className="text-xs text-gray-500 mt-2 leading-relaxed">{contexto}</p>
    </div>
  );
}

export default function DemoRelatoriosPage() {
  const [janela, setJanela] = useState(9);
  const serie = useMemo(() => LEITOS_POR_PERIODO_DEMO.slice(-janela), [janela]);
  const nomeJanela = JANELAS.find((j) => j.periodos === janela)?.label || "24 meses";

  const primeira = serie[0];
  const ultima = serie[serie.length - 1];

  function variacao(chave) {
    const abs = ultima[chave] - primeira[chave];
    const pct = primeira[chave] > 0 ? Math.round((abs / primeira[chave]) * 100) : 0;
    return { abs, pct, cresceu: abs > 0, caiu: abs < 0 };
  }

  const vTotais = variacao("leitos_totais");
  const vSus = variacao("leitos_sus");
  const vComp = variacao("leitos_complementares");

  // Série com benchmarks agregados (fictícios) — sem identificação individual de concorrentes
  const serieComBenchmark = serie.map((p) => ({
    competencia: p.competencia,
    voce: p.leitos_totais,
    mediaMunicipio: BENCHMARK_MUNICIPIO_DEMO.media_leitos,
    mediaEstado: BENCHMARK_ESTADO_DEMO.media_leitos,
  }));

  // Composição dos leitos: você vs. médias do grupo
  const dadosComposicao = [
    {
      nome: "Você",
      sus: ultima.leitos_sus,
      naoSus: ultima.leitos_nao_sus,
      comp: ultima.leitos_complementares,
    },
    {
      nome: `Média ${BENCHMARK_MUNICIPIO_DEMO.nome}`,
      sus: Math.round(BENCHMARK_MUNICIPIO_DEMO.media_leitos * BENCHMARK_MUNICIPIO_DEMO.pct_leitos_sus),
      naoSus: Math.round(BENCHMARK_MUNICIPIO_DEMO.media_leitos * (1 - BENCHMARK_MUNICIPIO_DEMO.pct_leitos_sus)),
      comp: Math.round(BENCHMARK_MUNICIPIO_DEMO.media_leitos_complementares),
    },
    {
      nome: `Média ${BENCHMARK_ESTADO_DEMO.nome}`,
      sus: Math.round(BENCHMARK_ESTADO_DEMO.media_leitos * BENCHMARK_ESTADO_DEMO.pct_leitos_sus),
      naoSus: Math.round(BENCHMARK_ESTADO_DEMO.media_leitos * (1 - BENCHMARK_ESTADO_DEMO.pct_leitos_sus)),
      comp: Math.round(BENCHMARK_ESTADO_DEMO.media_leitos_complementares),
    },
  ];

  const acimaMunicipio = ultima.leitos_totais > BENCHMARK_MUNICIPIO_DEMO.media_leitos;

  return (
    <div>
      <VoltarDemo />
      <DemoBadge />

      <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Relatório dinâmico</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {HOSPITAL_DEMO.nome_fantasia} &middot; atualizado em {HOSPITAL_DEMO.updatedAt}
          </p>
        </div>
        <div className="flex gap-1 bg-black/5 rounded-lg p-1">
          {JANELAS.map((j) => (
            <button
              key={j.label}
              type="button"
              onClick={() => setJanela(j.periodos)}
              className="text-xs font-semibold px-3 py-1.5 rounded-md transition-colors"
              style={{
                background: janela === j.periodos ? "white" : "transparent",
                color: janela === j.periodos ? CORES.verdeEscuro : "#6b7280",
                boxShadow: janela === j.periodos ? "0 1px 2px rgba(0,0,0,0.08)" : "none",
              }}
            >
              {j.label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-400 mb-4">
        Período analisado: {formatCompetencia(primeira.competencia)} a {formatCompetencia(ultima.competencia)}.
        Tudo calculado a partir dos dados da plataforma — sem exportar nada para fora do portal.
      </p>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <KpiCard
          titulo="Leitos totais"
          valor={ultima.leitos_totais}
          cor={CORES.verdeEscuro}
          variacao={vTotais}
          nomeJanela={nomeJanela}
          contexto={
            vTotais.abs > 0
              ? "Crescimento consistente — argumento de capacidade em credenciamentos e contratos."
              : vTotais.abs < 0
                ? "Queda de capacidade — vale checar se houve desativação formal no CNES."
                : "Capacidade estável no período analisado."
          }
        />
        <KpiCard
          titulo="Leitos SUS"
          valor={ultima.leitos_sus}
          cor={CORES.verde}
          variacao={vSus}
          nomeJanela={nomeJanela}
          contexto="Parte do faturamento SUS acompanha leitos habilitados e contratualizados."
        />
        <KpiCard
          titulo="Leitos complementares (UTI etc.)"
          valor={ultima.leitos_complementares}
          cor={CORES.vermelho}
          variacao={vComp}
          nomeJanela={nomeJanela}
          contexto={
            vComp.abs > 0
              ? "Mais estrutura crítica — diferencial forte frente ao mercado."
              : vComp.abs < 0
                ? "Redução de estrutura crítica — pode impactar credenciamentos que exigem UTI."
                : "Estrutura crítica estável."
          }
        />
      </div>

      {/* Evolução vs. mercado */}
      <div className="bg-white rounded-xl px-5 py-4 mb-4 shadow-sm border" style={{ borderColor: `${CORES.verde}22` }}>
        <h2 className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: CORES.verde }}>
          Evolução da capacidade vs. mercado
        </h2>
        <p className="text-xs text-gray-500 mb-3 leading-relaxed">
          Sua capacidade instalada contra as médias dos {BENCHMARK_ESTADO_DEMO.total_estabelecimentos_mesmo_tipo}{" "}
          hospitais gerais de PE e os {BENCHMARK_MUNICIPIO_DEMO.total_estabelecimentos_mesmo_tipo} de{" "}
          {BENCHMARK_MUNICIPIO_DEMO.nome} (agregados, sem identificação individual).
        </p>
        <ResponsiveContainer width="100%" height={240}>
          <ComposedChart data={serieComBenchmark} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="gradVoce" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CORES.verdeEscuro} stopOpacity={0.25} />
                <stop offset="95%" stopColor={CORES.verdeEscuro} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#eef1f4" />
            <XAxis
              dataKey="competencia"
              tickFormatter={formatCompetencia}
              tick={{ fontSize: 11, fill: "#6b7280" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip labelFormatter={formatCompetencia} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Area
              type="monotone"
              dataKey="voce"
              name="Você"
              stroke={CORES.verdeEscuro}
              strokeWidth={2.5}
              fill="url(#gradVoce)"
              dot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="mediaMunicipio"
              name={`Média ${BENCHMARK_MUNICIPIO_DEMO.nome}`}
              stroke={CORES.verde}
              strokeWidth={2}
              strokeDasharray="5 4"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="mediaEstado"
              name="Média Pernambuco"
              stroke={CORES.vermelho}
              strokeWidth={2}
              strokeDasharray="5 4"
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Composição dos leitos */}
      <div className="bg-white rounded-xl px-5 py-4 mb-4 shadow-sm border" style={{ borderColor: `${CORES.verde}22` }}>
        <h2 className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: CORES.verde }}>
          Composição atual dos leitos
        </h2>
        <p className="text-xs text-gray-500 mb-3 leading-relaxed">
          Como seus {ultima.leitos_totais} leitos se dividem — e como essa divisão se compara com a média dos
          grupos. Uma proporção SUS muito acima do grupo pode indicar dependência de faturamento público.
        </p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={dadosComposicao} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eef1f4" vertical={false} />
            <XAxis dataKey="nome" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="sus" name="Leitos SUS" stackId="a" fill={CORES.verde} radius={[0, 0, 0, 0]} maxBarSize={64} />
            <Bar dataKey="naoSus" name="Leitos não SUS" stackId="a" fill={CORES.dourado} maxBarSize={64} />
            <Bar dataKey="comp" name="Complementares" stackId="a" fill={CORES.vermelho} radius={[6, 6, 0, 0]} maxBarSize={64} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Insights */}
      <div className="bg-white rounded-xl px-5 py-4 mb-4 shadow-sm border" style={{ borderColor: `${CORES.verde}22` }}>
        <h2 className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: CORES.verde }}>
          O que os números dizem
        </h2>
        <ul className="space-y-2.5">
          <li className="flex gap-2 text-sm text-gray-700 leading-relaxed">
            <span aria-hidden>📈</span>
            <span>
              Na janela de {nomeJanela}, seus leitos <strong>{vTotais.abs > 0 ? "cresceram" : vTotais.abs < 0 ? "caíram" : "ficaram estáveis"}</strong>{" "}
              {vTotais.abs !== 0 && (
                <>
                  ({vTotais.abs > 0 ? "+" : ""}
                  {vTotais.abs}), enquanto a média estadual do grupo permaneceu em {BENCHMARK_ESTADO_DEMO.media_leitos}
                </>
              )}
              {vTotais.abs === 0 && <> no período</>}.
            </span>
          </li>
          <li className="flex gap-2 text-sm text-gray-700 leading-relaxed">
            <span aria-hidden>{acimaMunicipio ? "💪" : "⚠️"}</span>
            <span>
              Você está <strong>{acimaMunicipio ? "acima" : "abaixo"}</strong> da média de{" "}
              {BENCHMARK_MUNICIPIO_DEMO.nome} ({BENCHMARK_MUNICIPIO_DEMO.media_leitos} leitos entre hospitais
              gerais) — {acimaMunicipio ? "posição favorável em negociações de credenciamento." : "possível limite para contratos que exigem capacidade mínima."}
            </span>
          </li>
          <li className="flex gap-2 text-sm text-gray-700 leading-relaxed">
            <span aria-hidden>🏥</span>
            <span>
              <strong>
                {Math.round((ultima.leitos_sus / ultima.leitos_totais) * 100)}% dos seus leitos são SUS
              </strong>{" "}
              (média do grupo municipal: {Math.round(BENCHMARK_MUNICIPIO_DEMO.pct_leitos_sus * 100)}%) — indicador
              de mix de faturamento público vs. privado.
            </span>
          </li>
        </ul>
      </div>

      <p className="text-xs text-gray-400 text-center mt-6 leading-relaxed">
        Protótipo — dados fictícios apenas para ilustrar o relatório dinâmico. Na versão real, tudo é calculado
        pelo backend a partir do CNES/DATASUS.
      </p>
    </div>
  );
}
