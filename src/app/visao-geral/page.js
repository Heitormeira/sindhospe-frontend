"use client";

import { useEffect, useState } from "react";
import {
  API_URL,
  CORES,
  LinhaEvolucao,
  Card,
  CardTitle,
  formatCompetencia,
} from "../components";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from "recharts";

export default function VisaoGeralPage() {
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/api/visao-geral`)
      .then((r) => r.json())
      .then((json) => {
        if (json?.mensagem && !json.evolucao_total) throw new Error(json.mensagem);
        setDados(json);
      })
      .catch((e) => setErro(e.message))
      .finally(() => setCarregando(false));
  }, []);

  const percentualSus = dados
    ? Math.round((dados.total_com_vinculo_sus / dados.total_estabelecimentos) * 100)
    : 0;

  const primeira = dados?.evolucao_total?.[0];
  const ultima = dados?.evolucao_total?.[dados.evolucao_total.length - 1];
  const crescimentoPct =
    primeira && ultima && primeira.total > 0
      ? Math.round(((ultima.total - primeira.total) / primeira.total) * 100)
      : 0;

  return (
    <div>
      {erro && (
        <div className="text-sm rounded-lg px-4 py-3 mb-4" style={{ background: CORES.vermelhoClaro, color: CORES.vermelho }}>
          {erro}
        </div>
      )}
      {carregando && <p className="text-sm text-gray-500 px-1">Carregando...</p>}

      {dados && !carregando && (
        <>
          <Card>
            <p className="text-lg font-semibold text-gray-900 mb-1">Saúde em Pernambuco — visão geral</p>
            <p className="text-xs text-gray-500">
              Dados públicos do CNES/DATASUS, todos os estabelecimentos de saúde do estado
              ({formatCompetencia(primeira?.competencia)} a {formatCompetencia(ultima?.competencia)}).
            </p>
          </Card>

          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="bg-white rounded-xl px-3 py-3 shadow-sm border" style={{ borderColor: `${CORES.verde}22` }}>
              <p className="text-xs text-gray-500 mb-1">Estabelecimentos de saúde</p>
              <p className="text-2xl font-bold text-gray-900">{dados.total_estabelecimentos.toLocaleString("pt-BR")}</p>
              <p className="text-xs mt-1" style={{ color: crescimentoPct >= 0 ? CORES.verde : CORES.vermelho }}>
                {crescimentoPct >= 0 ? "▲" : "▼"} {Math.abs(crescimentoPct)}% em 2 anos
              </p>
            </div>
            <div className="bg-white rounded-xl px-3 py-3 shadow-sm border" style={{ borderColor: `${CORES.verde}22` }}>
              <p className="text-xs text-gray-500 mb-1">Associados SINDHOSPE</p>
              <p className="text-2xl font-bold text-gray-900">{dados.total_associados_sindhospe}</p>
              <p className="text-xs text-gray-400 mt-1">com identidade cruzada ao CNES</p>
            </div>
            <div className="bg-white rounded-xl px-3 py-3 shadow-sm border" style={{ borderColor: `${CORES.verde}22` }}>
              <p className="text-xs text-gray-500 mb-1">Leitos totais no estado</p>
              <p className="text-2xl font-bold text-gray-900">{dados.total_leitos.toLocaleString("pt-BR")}</p>
              <p className="text-xs text-gray-400 mt-1">{dados.total_leitos_complementares} complementares (UTI etc.)</p>
            </div>
            <div className="bg-white rounded-xl px-3 py-3 shadow-sm border" style={{ borderColor: `${CORES.verde}22` }}>
              <p className="text-xs text-gray-500 mb-1">Vínculo com o SUS</p>
              <p className="text-2xl font-bold text-gray-900">{percentualSus}%</p>
              <p className="text-xs text-gray-400 mt-1">dos estabelecimentos de PE</p>
            </div>
          </div>

          <Card>
            <CardTitle>Evolução do número de estabelecimentos em PE</CardTitle>
            <LinhaEvolucao
              dados={dados.evolucao_total}
              linhas={[{ dataKey: "total", nome: "Total de estabelecimentos", cor: CORES.verdeEscuro }]}
            />
          </Card>

          <Card>
            <CardTitle>Tipos de estabelecimento mais comuns</CardTitle>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dados.distribuicao_tipo} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="label" width={130} tick={{ fontSize: 11, fill: "#374151" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="total" radius={[0, 6, 6, 0]} maxBarSize={22}>
                  {dados.distribuicao_tipo.map((_, i) => (
                    <Cell key={i} fill={i === 0 ? CORES.verdeEscuro : CORES.verde} />
                  ))}
                  <LabelList dataKey="total" position="right" style={{ fontSize: 11, fill: "#374151" }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </>
      )}
    </div>
  );
}
