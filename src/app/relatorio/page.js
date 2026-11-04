"use client";

import { useEffect, useMemo, useState } from "react";
import { CORES, LinhaEvolucao, Card, CardTitle, formatCompetencia, getSessao } from "../components";
import { getFichaCompleta } from "../dados";
import { mensagemAmigavel } from "../api-error";
import { BarrasHorizontais, Equipamentos, Profissionais, NotaFonte } from "../blocos";
import { num, pct, fraseComparacao } from "../formatos.mjs";

// A série do CNES é trimestral: 6 meses = 3 pontos, 12 = 5, 24 = 9.
const PONTOS_POR_JANELA = { 6: 3, 12: 5, 24: 9 };

function variacao(serie, campo) {
  if (!serie || serie.length < 1) return { atual: 0, variacaoPct: 0, variacaoAbs: 0 };
  const inicio = Number(serie[0][campo]) || 0;
  const atual = Number(serie[serie.length - 1][campo]) || 0;
  const variacaoAbs = atual - inicio;
  const variacaoPct = inicio > 0 ? Math.round((variacaoAbs / inicio) * 100) : atual > 0 ? 100 : 0;
  return { atual, variacaoPct, variacaoAbs };
}

function KpiVariacao({ rotulo, kpi }) {
  return (
    <div className="bg-white rounded-xl px-5 py-5 shadow-sm border border-[#d6e8e0]">
      <p className="text-sm mb-1" style={{ color: CORES.neutro }}>{rotulo}</p>
      <p className="text-[2rem] leading-tight font-bold" style={{ color: CORES.verdeEscuro }}>{num(kpi.atual)}</p>
      <p className="text-sm mt-1 font-semibold" style={{ color: kpi.variacaoAbs >= 0 ? CORES.verde : CORES.vermelho }}>
        {kpi.variacaoAbs >= 0 ? "▲" : "▼"} {kpi.variacaoAbs >= 0 ? "+" : ""}
        {num(kpi.variacaoAbs)} ({Math.abs(kpi.variacaoPct)}%) na janela
      </p>
    </div>
  );
}

function SeletorJanela({ janela, setJanela }) {
  return (
    <div className="flex gap-1 rounded-lg p-1" style={{ background: CORES.verdeClaro }}>
      {[6, 12, 24].map((j) => (
        <button
          key={j}
          type="button"
          onClick={() => setJanela(j)}
          aria-pressed={janela === j}
          className="text-sm px-3 py-2 min-h-[40px] rounded-md transition-colors font-semibold"
          style={{
            background: janela === j ? "white" : "transparent",
            color: janela === j ? CORES.verdeEscuro : CORES.neutro,
            boxShadow: janela === j ? "0 1px 2px rgba(0,0,0,0.08)" : "none",
          }}
        >
          {j} meses
        </button>
      ))}
    </div>
  );
}

function RelatorioLeitos({ a, janela, setJanela }) {
  const serie = useMemo(() => a.evolucao.slice(-PONTOS_POR_JANELA[janela]), [a, janela]);
  const total = variacao(serie, "total");
  const sus = variacao(serie, "sus");
  const comp = variacao(serie, "complementares");
  const l = a.leitos;
  const pctSus = l.total ? Math.round((l.sus * 100) / l.total) : 0;
  const pctComp = l.total ? Math.round((l.complementares * 100) / l.total) : 0;

  return (
    <>
      <Card>
        <div className="flex items-start justify-between flex-wrap gap-3 mb-3">
          <p className="text-sm" style={{ color: CORES.neutro }}>
            {a.categoria_label} &middot; {a.municipio?.nome}/PE
          </p>
          <SeletorJanela janela={janela} setJanela={setJanela} />
        </div>
        {serie.length > 0 && (
          <p className="text-sm" style={{ color: CORES.neutro }}>
            Período analisado: {formatCompetencia(serie[0].competencia)} a{" "}
            {formatCompetencia(serie[serie.length - 1].competencia)}. Mesma fonte e mesmos números de &quot;Meu
            estabelecimento&quot; e &quot;Evolução&quot; (CNES/DATASUS, aba Leitos).
          </p>
        )}
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <KpiVariacao rotulo="Leitos totais" kpi={total} />
        <KpiVariacao rotulo="Leitos SUS" kpi={sus} />
        <KpiVariacao rotulo="Complementares (UTI etc.)" kpi={comp} />
      </div>

      <Card>
        <CardTitle>Evolução dos leitos</CardTitle>
        <LinhaEvolucao
          dados={serie}
          linhas={[
            { dataKey: "total", nome: "Leitos totais", cor: CORES.verdeEscuro },
            { dataKey: "sus", nome: "SUS", cor: CORES.verde },
            { dataKey: "complementares", nome: "Complementares", cor: CORES.vermelho },
          ]}
        />
      </Card>

      <Card>
        <CardTitle>Composição atual dos leitos</CardTitle>
        <BarrasHorizontais
          cor={CORES.verdeEscuro}
          itens={l.por_tipo.map((t) => ({ nome: t.label, valor: t.total, detalhe: t.sus ? `(${num(t.sus)} SUS)` : "" }))}
        />
      </Card>

      <Card>
        <CardTitle>O que os números dizem</CardTitle>
        <ul className="text-sm space-y-3" style={{ color: CORES.verdeEscuro }}>
          <li>
            💡 Na janela de {janela} meses, seus leitos {total.variacaoAbs > 0 ? "cresceram" : total.variacaoAbs < 0 ? "caíram" : "ficaram estáveis"}
            {total.variacaoAbs !== 0 && (
              <>
                {" "}
                (<strong>{total.variacaoAbs > 0 ? "+" : ""}{num(total.variacaoAbs)}</strong>)
              </>
            )}
            .
          </li>
          <li>
            📍 Seus <strong>{num(l.total)}</strong> leitos são <strong>{pct(l.contexto.municipio.percentual)}</strong> dos{" "}
            {num(l.contexto.municipio.total)} leitos de {l.contexto.municipio.nome} e{" "}
            <strong>{pct(l.contexto.estado.percentual)}</strong> dos {num(l.contexto.estado.total)} de Pernambuco.
          </li>
          <li>
            🏥 <strong>{num(l.complementares)}</strong> leitos complementares (UTI e afins), {pctComp}% do total: estrutura
            crítica que pesa em credenciamentos que exigem UTI.
          </li>
          <li>
            📊 <strong>{pctSus}%</strong> dos seus leitos são SUS ({num(l.sus)} de {num(l.total)}). Esse é o mix de
            atendimento público × privado; leito SUS também existe em hospital privado ou filantrópico.
          </li>
        </ul>
      </Card>
    </>
  );
}

export default function RelatorioPage() {
  const [sessao, setSessao] = useState(null);
  const [dados, setDados] = useState(null);
  const [janela, setJanela] = useState(24);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  // O relatório é sempre do estabelecimento logado.
  useEffect(() => {
    const s = getSessao();
    if (s?.cnes) setSessao(s);
    else setErro("Sessão não encontrada. Faça login novamente.");
  }, []);

  useEffect(() => {
    if (!sessao) return;
    setCarregando(true);
    setErro("");
    getFichaCompleta(sessao.cnes)
      .then(setDados)
      .catch((e) => setErro(mensagemAmigavel(e)))
      .finally(() => setCarregando(false));
  }, [sessao]);

  const a = dados?.atual;

  return (
    <div>
      <div className="mb-6">
        <p className="text-sm" style={{ color: CORES.neutro }}>Relatório de</p>
        <p className="text-2xl font-bold" style={{ color: CORES.verdeEscuro }}>{sessao?.nome || "..."}</p>
      </div>

      {erro && (
        <div className="text-sm rounded-lg px-4 py-3 mb-4 border-l-4" style={{ background: CORES.vermelhoClaro, color: CORES.vermelho, borderColor: CORES.vermelho }}>
          {erro}
        </div>
      )}
      {carregando && <p className="text-sm px-1" style={{ color: CORES.neutro }}>Carregando...</p>}

      {dados && !carregando && !a?.cadastro?.encontrado && (
        <Card>
          <CardTitle>Sem dados do CNES</CardTitle>
          <p className="text-sm" style={{ color: CORES.neutro }}>
            Este associado não aparece na competência mais recente do CNES/DATASUS (por exemplo, empresas prestadoras
            de serviço sem estabelecimento de saúde próprio), então não há evolução nem comparativos para exibir.
          </p>
        </Card>
      )}

      {a?.cadastro?.encontrado && !carregando && a.mostra_leitos && <RelatorioLeitos a={a} janela={janela} setJanela={setJanela} />}

      {a?.cadastro?.encontrado && !carregando && !a.mostra_leitos && (
        <>
          <Card>
            <CardTitle>{a.categoria_label}</CardTitle>
            <p className="text-sm" style={{ color: CORES.neutro }}>
              {a.municipio?.nome}/PE &middot; Este tipo de estabelecimento não tem leitos de internação. O relatório
              compara equipamentos e equipe com estabelecimentos do mesmo tipo em Pernambuco.
            </p>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {a.equipamentos.total > 0 && <Equipamentos equipamentos={a.equipamentos} limite={8} />}
            <Profissionais profissionais={a.profissionais} />
          </div>
          <Card>
            <CardTitle>O que os números dizem</CardTitle>
            <ul className="text-sm space-y-3" style={{ color: CORES.verdeEscuro }}>
              {a.equipamentos.comparacao && (
                <li>🩻 {fraseComparacao(a.equipamentos.total, a.equipamentos.comparacao, "equipamentos")}</li>
              )}
              {a.profissionais.comparacao && (
                <li>👩‍⚕️ {fraseComparacao(a.profissionais.total, a.profissionais.comparacao, "profissionais")}</li>
              )}
              <li>
                🧾 {num(a.servicos.length)} serviços especializados e {num(a.habilitacoes)} habilitações cadastrados no
                CNES. Se algo estiver faltando, peça a revisão na aba Perfil.
              </li>
            </ul>
          </Card>
        </>
      )}

      <NotaFonte atual={a} />
    </div>
  );
}
