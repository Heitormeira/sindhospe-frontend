"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CORES, LinhaEvolucao, Card, CardTitle, formatCompetencia, getSessao } from "../components";
import { getFichaCompleta } from "../dados";
import { mensagemAmigavel } from "../api-error";
import { NotaFonte } from "../blocos";
import { num } from "../formatos.mjs";

export default function EvolucaoPage() {
  const router = useRouter();
  const [sessao, setSessao] = useState(null);
  const [atual, setAtual] = useState(null);
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
    if (!sessao?.cnes) return;
    setCarregando(true);
    setErro("");
    getFichaCompleta(sessao.cnes)
      .then((json) => setAtual(json.atual || null))
      .catch((e) => setErro(mensagemAmigavel(e)))
      .finally(() => setCarregando(false));
  }, [sessao]);

  if (!sessao) return null;

  // Mesma fonte do cartão "Leitos totais": arquivo LT do CNES. A última
  // competência da série é exatamente o número mostrado em "Meu estabelecimento".
  const serie = atual?.evolucao || [];
  const primeira = serie[0];
  const ultima = serie[serie.length - 1];
  const variacao = primeira && ultima ? ultima.total - primeira.total : 0;
  const semLeitos = atual && !atual.mostra_leitos;

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

      {!carregando && atual && (semLeitos || serie.length === 0) && (
        <Card>
          <CardTitle>Sem série de leitos</CardTitle>
          <p className="text-sm text-gray-500">
            {semLeitos
              ? `${atual.categoria_label}: este tipo de estabelecimento não tem leitos de internação. A série histórica do portal acompanha leitos; equipamentos, profissionais e serviços aparecem em "Meu estabelecimento" com os dados mais recentes do CNES.`
              : "Nenhum leito encontrado no histórico do CNES para este estabelecimento."}
          </p>
        </Card>
      )}

      {!carregando && !semLeitos && serie.length > 0 && (
        <Card>
          <CardTitle>Leitos — {sessao.nome}</CardTitle>
          <p className="text-xs text-gray-500 mb-2">
            De {formatCompetencia(primeira.competencia)} até {formatCompetencia(ultima.competencia)}. Em{" "}
            {formatCompetencia(ultima.competencia)}: <strong>{num(ultima.total)}</strong> leitos, o mesmo número do
            cartão em &quot;Meu estabelecimento&quot;.
          </p>
          <LinhaEvolucao
            dados={serie}
            linhas={[
              { dataKey: "total", nome: "Leitos totais", cor: CORES.verdeEscuro },
              { dataKey: "sus", nome: "SUS", cor: CORES.verde },
              { dataKey: "nao_sus", nome: "Não SUS", cor: CORES.dourado },
              { dataKey: "complementares", nome: "Complementares (UTI e afins)", cor: CORES.vermelho },
            ]}
          />
          <div
            className="mt-3 rounded-lg px-3 py-2.5 text-sm"
            style={{
              background: variacao >= 0 ? CORES.verdeClaro : CORES.vermelhoClaro,
              color: variacao >= 0 ? CORES.verdeEscuro : CORES.vermelho,
            }}
          >
            {variacao > 0 && <>📈 Crescimento de <strong>{num(variacao)} leitos</strong> no período.</>}
            {variacao < 0 && <>📉 Redução de <strong>{num(Math.abs(variacao))} leitos</strong> no período.</>}
            {variacao === 0 && <>Sem variação no número de leitos no período.</>}
          </div>
        </Card>
      )}

      <NotaFonte atual={atual} />
    </div>
  );
}
