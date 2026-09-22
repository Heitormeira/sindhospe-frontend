"use client";

import { useEffect, useState } from "react";
import { API_URL, CORES, LinhaEvolucao, Card, CardTitle, formatCompetencia } from "../components";
import { mensagemAmigavel } from "../api-error";

export default function EvolucaoPage() {
  const [estabelecimentos, setEstabelecimentos] = useState([]);
  const [cnesSelecionado, setCnesSelecionado] = useState("");
  const [nomeSelecionado, setNomeSelecionado] = useState("");
  const [serie, setSerie] = useState(null);
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
          setNomeSelecionado(lista[0].nome_fantasia);
        }
      })
      .catch((e) => setErro(mensagemAmigavel(e)));
  }, []);

  useEffect(() => {
    if (!cnesSelecionado) return;
    setCarregando(true);
    setErro("");
    fetch(`${API_URL}/api/evolucao/${cnesSelecionado}`)
      .then((r) => r.json())
      .then((json) => {
        if (!Array.isArray(json)) throw new Error(json?.mensagem || "Resposta inesperada.");
        setSerie(json);
      })
      .catch((e) => setErro(mensagemAmigavel(e)))
      .finally(() => setCarregando(false));
  }, [cnesSelecionado]);

  const primeiraCompetencia = serie && serie.length > 0 ? serie[0] : null;
  const ultimaCompetencia = serie && serie.length > 0 ? serie[serie.length - 1] : null;
  const variacaoLeitos =
    primeiraCompetencia && ultimaCompetencia
      ? ultimaCompetencia.leitos_totais - primeiraCompetencia.leitos_totais
      : 0;

  return (
    <div>
      <div className="mb-4">
        <label className="text-xs text-gray-500 block mb-1">Ver evolução de</label>
        <select
          className="w-full text-sm rounded-lg px-3 py-2 bg-white text-gray-900 border border-gray-200 shadow-sm"
          value={cnesSelecionado}
          onChange={(e) => {
            setCnesSelecionado(e.target.value);
            const est = estabelecimentos.find((x) => x.cnes === e.target.value);
            setNomeSelecionado(est?.nome_fantasia || "");
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

      {serie && !carregando && serie.length === 0 && (
        <Card>
          <p className="text-sm text-gray-500">
            Nenhum dado histórico encontrado pra esse estabelecimento (pode não ter aparecido em todos os
            trimestres baixados).
          </p>
        </Card>
      )}

      {serie && serie.length > 0 && !carregando && (
        <>
          <Card>
            <CardTitle>Evolução — {nomeSelecionado}</CardTitle>
            <p className="text-xs text-gray-500 mb-2">
              Leitos totais, de {formatCompetencia(primeiraCompetencia.competencia)} até{" "}
              {formatCompetencia(ultimaCompetencia.competencia)}
            </p>
            <LinhaEvolucao
              dados={serie}
              linhas={[{ dataKey: "leitos_totais", nome: "Leitos totais", cor: CORES.verdeEscuro }]}
            />
            <div
              className="mt-3 rounded-lg px-3 py-2.5 text-sm"
              style={{
                background: variacaoLeitos >= 0 ? CORES.verdeClaro : CORES.vermelhoClaro,
                color: variacaoLeitos >= 0 ? CORES.verdeEscuro : CORES.vermelho,
              }}
            >
              {variacaoLeitos > 0 && <>📈 Crescimento de <strong>{variacaoLeitos} leitos</strong> no período.</>}
              {variacaoLeitos < 0 && <>📉 Redução de <strong>{Math.abs(variacaoLeitos)} leitos</strong> no período.</>}
              {variacaoLeitos === 0 && <>Sem variação no número de leitos no período.</>}
            </div>
          </Card>
        </>
      )}

      <p className="text-xs text-gray-400 text-center mt-6 leading-relaxed">
        Dados reais do CNES/DATASUS, snapshots trimestrais de jun/2024 a jun/2026.
      </p>
    </div>
  );
}
