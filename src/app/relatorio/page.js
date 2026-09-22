"use client";

import { useEffect, useState, useMemo } from "react";
import {
  API_URL,
  CORES,
  LinhaEvolucao,
  ComposicaoEmpilhada,
  Card,
  CardTitle,
  formatCompetencia,
} from "../components";

const PONTOS_POR_JANELA = { 6: 3, 12: 5, 24: 9 };

function variacao(serieJanela, campo) {
  if (!serieJanela || serieJanela.length < 2) return { atual: 0, variacaoPct: 0, variacaoAbs: 0 };
  const inicio = Number(serieJanela[0][campo]) || 0;
  const atual = Number(serieJanela[serieJanela.length - 1][campo]) || 0;
  const variacaoAbs = atual - inicio;
  const variacaoPct = inicio > 0 ? Math.round((variacaoAbs / inicio) * 100) : (atual > 0 ? 100 : 0);
  return { atual, variacaoPct, variacaoAbs };
}

export default function RelatorioPage() {
  const [estabelecimentos, setEstabelecimentos] = useState([]);
  const [cnesSelecionado, setCnesSelecionado] = useState("");
  const [nome, setNome] = useState("");
  const [dadosBase, setDadosBase] = useState(null);
  const [serieVoce, setSerieVoce] = useState(null);
  const [serieMunicipio, setSerieMunicipio] = useState(null);
  const [serieEstado, setSerieEstado] = useState(null);
  const [janela, setJanela] = useState(24);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/api/estabelecimentos`)
      .then((r) => r.json())
      .then((lista) => {
        if (!Array.isArray(lista)) throw new Error(lista?.mensagem || "Resposta inesperada.");
        setEstabelecimentos(lista);
        if (lista.length > 0) {
          setCnesSelecionado(lista[0].cnes);
          setNome(lista[0].nome_fantasia);
        }
      })
      .catch((e) => setErro(`Não foi possível carregar a lista: ${e.message}`));
  }, []);

  useEffect(() => {
    if (!cnesSelecionado) return;
    setCarregando(true);
    setErro("");

    fetch(`${API_URL}/api/estabelecimento/${cnesSelecionado}`)
      .then((r) => r.json())
      .then(async (base) => {
        if (base?.mensagem) throw new Error(base.mensagem);
        setDadosBase(base);

        const [evo, merc, est] = await Promise.all([
          fetch(`${API_URL}/api/evolucao/${cnesSelecionado}`).then((r) => r.json()),
          fetch(`${API_URL}/api/mercado?tipo=${base.estrutura.tp_unid}&municipio=${base.estrutura.codufmun}`).then((r) => r.json()),
          fetch(`${API_URL}/api/mercado?tipo=${base.estrutura.tp_unid}`).then((r) => r.json()),
        ]);
        setSerieVoce(evo);
        setSerieMunicipio(merc);
        setSerieEstado(est);
      })
      .catch((e) => setErro(e.message))
      .finally(() => setCarregando(false));
  }, [cnesSelecionado]);

  const janelaVoce = useMemo(() => {
    if (!serieVoce) return null;
    const n = PONTOS_POR_JANELA[janela];
    return serieVoce.slice(-n);
  }, [serieVoce, janela]);

  const janelaMunicipio = useMemo(() => {
    if (!serieMunicipio) return null;
    const n = PONTOS_POR_JANELA[janela];
    return serieMunicipio.slice(-n);
  }, [serieMunicipio, janela]);

  const janelaEstado = useMemo(() => {
    if (!serieEstado) return null;
    const n = PONTOS_POR_JANELA[janela];
    return serieEstado.slice(-n);
  }, [serieEstado, janela]);

  const kpiTotais = janelaVoce ? variacao(janelaVoce, "leitos_totais") : null;
  const kpiSus = janelaVoce ? variacao(janelaVoce, "leitos_sus") : null;
  const kpiComplementares = janelaVoce ? variacao(janelaVoce, "leitos_complementares") : null;

  const graficoEvolucao = useMemo(() => {
    if (!janelaVoce || !janelaMunicipio || !janelaEstado) return [];
    return janelaVoce.map((v, i) => ({
      competencia: v.competencia,
      voce: v.leitos_totais,
      municipio: parseFloat(janelaMunicipio[i]?.media_leitos || 0),
      estado: parseFloat(janelaEstado[i]?.media_leitos || 0),
    }));
  }, [janelaVoce, janelaMunicipio, janelaEstado]);

  const composicaoAtual = useMemo(() => {
    if (!janelaVoce || !janelaMunicipio || !janelaEstado) return [];
    const v = janelaVoce[janelaVoce.length - 1];
    const m = janelaMunicipio[janelaMunicipio.length - 1];
    const e = janelaEstado[janelaEstado.length - 1];
    return [
      { nome: "Você", complementares: v.leitos_complementares, sus: v.leitos_sus, naoSus: v.leitos_nao_sus },
      {
        nome: "Média município",
        complementares: parseFloat(m?.media_complementares || 0),
        sus: parseFloat(m?.media_leitos_sus || 0),
        naoSus: Math.max(parseFloat(m?.media_leitos || 0) - parseFloat(m?.media_leitos_sus || 0), 0),
      },
      {
        nome: "Média Pernambuco",
        complementares: parseFloat(e?.media_complementares || 0),
        sus: parseFloat(e?.media_leitos_sus || 0),
        naoSus: Math.max(parseFloat(e?.media_leitos || 0) - parseFloat(e?.media_leitos_sus || 0), 0),
      },
    ];
  }, [janelaVoce, janelaMunicipio, janelaEstado]);

  const percentualSusVoce = kpiTotais && kpiTotais.atual > 0 ? Math.round((kpiSus.atual / kpiTotais.atual) * 100) : 0;
  const mediaMunicipioAtual = janelaMunicipio ? janelaMunicipio[janelaMunicipio.length - 1] : null;
  const percentualSusMunicipio =
    mediaMunicipioAtual && parseFloat(mediaMunicipioAtual.media_leitos) > 0
      ? Math.round((parseFloat(mediaMunicipioAtual.media_leitos_sus) / parseFloat(mediaMunicipioAtual.media_leitos)) * 100)
      : 0;

  return (
    <div>
      <div className="mb-4">
        <label className="text-xs text-gray-500 block mb-1">Relatório de</label>
        <select
          className="w-full text-sm rounded-lg px-3 py-2 bg-white text-gray-900 border border-gray-200 shadow-sm"
          value={cnesSelecionado}
          onChange={(e) => {
            setCnesSelecionado(e.target.value);
            const est = estabelecimentos.find((x) => x.cnes === e.target.value);
            setNome(est?.nome_fantasia || "");
          }}
        >
          {estabelecimentos.map((e) => (
            <option key={e.cnes} value={e.cnes}>{e.nome_fantasia}</option>
          ))}
        </select>
      </div>

      {erro && (
        <div className="text-sm rounded-lg px-4 py-3 mb-4" style={{ background: CORES.vermelhoClaro, color: CORES.vermelho }}>
          {erro}
        </div>
      )}
      {carregando && <p className="text-sm text-gray-500 px-1">Carregando...</p>}

      {dadosBase && janelaVoce && !carregando && (
        <>
          <Card>
            <div className="flex items-start justify-between flex-wrap gap-3 mb-3">
              <div>
                <p className="text-lg font-semibold text-gray-900">{nome}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Município: {dadosBase.estrutura.municipio_nome} &middot; Tipo: {dadosBase.estrutura.tp_unid_label}
                </p>
              </div>
              <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                {[6, 12, 24].map((j) => (
                  <button
                    key={j}
                    onClick={() => setJanela(j)}
                    className="text-xs px-3 py-1.5 rounded-md transition-colors"
                    style={{
                      background: janela === j ? "white" : "transparent",
                      fontWeight: janela === j ? 600 : 400,
                      color: janela === j ? CORES.verdeEscuro : "#6b7280",
                      boxShadow: janela === j ? "0 1px 2px rgba(0,0,0,0.08)" : "none",
                    }}
                  >
                    {j} meses
                  </button>
                ))}
              </div>
            </div>
            <p className="text-xs text-gray-400">
              Período analisado: {formatCompetencia(janelaVoce[0]?.competencia)} a {formatCompetencia(janelaVoce[janelaVoce.length - 1]?.competencia)}.
              Tudo calculado a partir de dados reais do CNES/DATASUS.
            </p>
          </Card>

          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-white rounded-xl px-3 py-3 shadow-sm border" style={{ borderColor: `${CORES.verde}22` }}>
              <p className="text-xs text-gray-500 mb-1">Leitos totais</p>
              <p className="text-2xl font-bold text-gray-900">{kpiTotais.atual}</p>
              <p className="text-xs mt-1" style={{ color: kpiTotais.variacaoPct >= 0 ? CORES.verde : CORES.vermelho }}>
                {kpiTotais.variacaoPct >= 0 ? "▲" : "▼"} {Math.abs(kpiTotais.variacaoPct)}% na janela
              </p>
            </div>
            <div className="bg-white rounded-xl px-3 py-3 shadow-sm border" style={{ borderColor: `${CORES.verde}22` }}>
              <p className="text-xs text-gray-500 mb-1">Leitos SUS</p>
              <p className="text-2xl font-bold text-gray-900">{kpiSus.atual}</p>
              <p className="text-xs mt-1" style={{ color: kpiSus.variacaoPct >= 0 ? CORES.verde : CORES.vermelho }}>
                {kpiSus.variacaoPct >= 0 ? "▲" : "▼"} {Math.abs(kpiSus.variacaoPct)}% na janela
              </p>
            </div>
            <div className="bg-white rounded-xl px-3 py-3 shadow-sm border" style={{ borderColor: `${CORES.verde}22` }}>
              <p className="text-xs text-gray-500 mb-1">Complementares (UTI etc.)</p>
              <p className="text-2xl font-bold text-gray-900">{kpiComplementares.atual}</p>
              <p className="text-xs mt-1" style={{ color: kpiComplementares.variacaoPct >= 0 ? CORES.verde : CORES.vermelho }}>
                {kpiComplementares.variacaoPct >= 0 ? "▲" : "▼"} {Math.abs(kpiComplementares.variacaoPct)}% na janela
              </p>
            </div>
          </div>

          <Card>
            <CardTitle>Evolução da capacidade vs. mercado</CardTitle>
            <LinhaEvolucao
              dados={graficoEvolucao}
              linhas={[
                { dataKey: "voce", nome: "Você", cor: CORES.verdeEscuro },
                { dataKey: "municipio", nome: "Média município", cor: CORES.verde },
                { dataKey: "estado", nome: "Média Pernambuco", cor: CORES.vermelho },
              ]}
            />
          </Card>

          <Card>
            <CardTitle>Composição atual dos leitos</CardTitle>
            <ComposicaoEmpilhada dados={composicaoAtual} />
          </Card>

          <Card>
            <CardTitle>O que os números dizem</CardTitle>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>
                💡 Na janela de {janela} meses, seus leitos {kpiTotais.variacaoAbs >= 0 ? "cresceram" : "caíram"}{" "}
                <strong>{kpiTotais.variacaoAbs >= 0 ? "+" : ""}{kpiTotais.variacaoAbs}</strong>, enquanto a média do
                mesmo tipo em Pernambuco {janelaEstado && (parseFloat(janelaEstado[janelaEstado.length - 1]?.media_leitos) - parseFloat(janelaEstado[0]?.media_leitos)) >= 0 ? "também cresceu" : "ficou estável ou caiu"}.
              </li>
              <li>
                {kpiTotais.atual > parseFloat(mediaMunicipioAtual?.media_leitos || 0) ? "💡" : "⚠️"} Você está{" "}
                {kpiTotais.atual >= parseFloat(mediaMunicipioAtual?.media_leitos || 0) ? "acima" : "abaixo"} da média do
                seu município ({mediaMunicipioAtual?.media_leitos} leitos entre estabelecimentos do mesmo tipo) —
                {kpiTotais.atual >= parseFloat(mediaMunicipioAtual?.media_leitos || 0)
                  ? " posição favorável em negociações de credenciamento."
                  : " pode ser um ponto de atenção em negociações de credenciamento."}
              </li>
              <li>
                📊 <strong>{percentualSusVoce}%</strong> dos seus leitos são SUS (média do grupo municipal:{" "}
                {percentualSusMunicipio}%) — indicador de mix de faturamento público vs. privado.
              </li>
            </ul>
          </Card>
        </>
      )}
    </div>
  );
}
