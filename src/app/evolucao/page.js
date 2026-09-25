"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL, CORES, LinhaEvolucao, Card, CardTitle, formatCompetencia, getSessao } from "../components";

export default function EvolucaoPage() {
  const router = useRouter();
  const [sessao, setSessao] = useState(null);
  const [serie, setSerie] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    const s = getSessao();
    if (!s) {
      router.replace("/login");
      return;
    }
    setSessao(s);
  }, [router]);

  useEffect(() => {
    if (!sessao) return;
    setCarregando(true);
    setErro("");
    fetch(`${API_URL}/api/evolucao/${sessao.cnes}`)
      .then((r) => r.json())
      .then((json) => {
        if (!Array.isArray(json)) throw new Error(json?.mensagem || "Resposta inesperada.");
        setSerie(json);
      })
      .catch((e) => setErro(e.message))
      .finally(() => setCarregando(false));
  }, [sessao]);

  const primeiraCompetencia = serie && serie.length > 0 ? serie[0] : null;
  const ultimaCompetencia = serie && serie.length > 0 ? serie[serie.length - 1] : null;
  const variacaoLeitos =
    primeiraCompetencia && ultimaCompetencia
      ? ultimaCompetencia.leitos_totais - primeiraCompetencia.leitos_totais
      : 0;

  if (!sessao) return null;

  return (
    <div>
      <div className="mb-4">
        <p className="text-xs text-gray-500">Evolução de</p>
        <p className="text-sm font-semibold text-gray-900">{sessao.nome}</p>
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
            Nenhum dado histórico encontrado (pode ser um associado sem código CNES próprio).
          </p>
        </Card>
      )}

      {serie && serie.length > 0 && !carregando && (
        <Card>
          <CardTitle>Evolução — {sessao.nome}</CardTitle>
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
      )}

      <p className="text-xs text-gray-400 text-center mt-6 leading-relaxed">
        Dados reais do CNES/DATASUS, snapshots trimestrais de jun/2024 a jun/2026.
      </p>
    </div>
  );
}
