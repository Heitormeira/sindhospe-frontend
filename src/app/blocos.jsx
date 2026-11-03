"use client";

// Blocos do conteúdo "atual" (reunião com o SINDHOSPE em 28/10/2026).
// Todos leem `atual` do documento do associado: uma competência só do CNES,
// com totais e participação (sem médias fracionadas de leitos).
import { useState } from "react";
import { CORES } from "./components";
import { num, pct, mesAno } from "./formatos.mjs";

export function Kpi({ rotulo, valor, cor = CORES.verdeEscuro, detalhe }) {
  return (
    <div
      className="bg-white rounded-lg px-4 py-3 shadow-sm flex-1 min-w-[140px] md:min-w-0"
      style={{ borderLeft: `4px solid ${cor}` }}
    >
      <div className="text-xs mb-0.5" style={{ color: CORES.neutro }}>{rotulo}</div>
      <div className="text-2xl font-extrabold" style={{ color: cor }}>{valor}</div>
      {detalhe && <div className="text-xs mt-0.5" style={{ color: CORES.neutro }}>{detalhe}</div>}
    </div>
  );
}

export function Painel({ titulo, acao, children, largo, nota }) {
  return (
    <div
      className={`bg-white rounded-xl p-4 md:p-5 ${largo ? "md:col-span-2" : ""}`}
      style={{ border: "1px solid #d6e8e0" }}
    >
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="text-sm font-bold text-gray-900">{titulo}</div>
        {acao}
      </div>
      {children}
      {nota && <p className="text-xs mt-3 leading-relaxed" style={{ color: CORES.neutro }}>{nota}</p>}
    </div>
  );
}

/** Lista de barras horizontais com valor; `itens`: [{ nome, valor, detalhe? }]. */
export function BarrasHorizontais({ itens, cor = CORES.verde, max: maxFixo, limite }) {
  const lista = limite ? itens.slice(0, limite) : itens;
  const max = maxFixo || Math.max(...lista.map((i) => i.valor), 1);
  if (!lista.length) return <p className="text-sm" style={{ color: CORES.neutro }}>Nada cadastrado no CNES.</p>;
  return (
    <ul className="space-y-2">
      {lista.map((i) => (
        <li key={i.nome}>
          <div className="flex justify-between text-xs mb-0.5 gap-2">
            <span className="text-gray-800">{i.nome}</span>
            <span className="font-bold text-gray-900 whitespace-nowrap">
              {num(i.valor)}
              {i.detalhe && <span className="font-normal" style={{ color: CORES.neutro }}> {i.detalhe}</span>}
            </span>
          </div>
          <div className="h-2 rounded-full" style={{ background: CORES.verdeClaro }}>
            <div className="h-2 rounded-full" style={{ width: `${Math.max((i.valor / max) * 100, 1.5)}%`, background: cor }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function BotaoAlternar({ modo, setModo }) {
  const opcao = (valor, rotulo) => (
    <button
      type="button"
      onClick={() => setModo(valor)}
      aria-pressed={modo === valor}
      className="px-2.5 py-1"
      style={{ background: modo === valor ? CORES.verdeEscuro : "white", color: modo === valor ? "white" : CORES.verdeEscuro }}
    >
      {rotulo}
    </button>
  );
  return (
    <div className="flex rounded-md overflow-hidden text-xs font-bold" style={{ border: "1px solid #d6e8e0" }}>
      {opcao("barras", "Barras")}
      {opcao("pizza", "Pizza")}
    </div>
  );
}

/** Pizza/barras com quantidades inteiras; `fatias`: [{ nome, valor, cor }]. */
export function Composicao({ titulo, fatias, nota }) {
  const [modo, setModo] = useState("pizza");
  const total = fatias.reduce((s, f) => s + f.valor, 0);
  let acumulado = 0;
  const gradiente = fatias
    .map((f) => {
      const inicio = acumulado;
      acumulado += total ? (f.valor / total) * 100 : 0;
      return `${f.cor} ${inicio}% ${acumulado}%`;
    })
    .join(", ");
  return (
    <Painel titulo={titulo} acao={<BotaoAlternar modo={modo} setModo={setModo} />} nota={nota}>
      {modo === "pizza" ? (
        <div className="flex items-center gap-5 flex-wrap">
          <div className="rounded-full flex-shrink-0" style={{ width: 120, height: 120, background: total ? `conic-gradient(${gradiente})` : CORES.verdeClaro }} />
          <div className="flex flex-col gap-2 text-xs" style={{ color: CORES.verdeEscuro }}>
            {fatias.map((f) => (
              <div key={f.nome} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm inline-block flex-shrink-0" style={{ background: f.cor }} />
                <span className="font-medium">
                  {f.nome}: {num(f.valor)} ({pct(total ? Math.round((f.valor * 1000) / total) / 10 : 0)})
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <BarrasHorizontais itens={fatias.map((f) => ({ nome: f.nome, valor: f.valor }))} />
      )}
    </Painel>
  );
}

/** Indicadores principais de leitos (mesmos números da evolução e do relatório). */
export function KpisLeitos({ leitos }) {
  return (
    <>
      <Kpi rotulo="Leitos totais" valor={num(leitos.total)} cor={CORES.verdeEscuro} />
      <Kpi rotulo="Leitos gerais" valor={num(leitos.gerais)} cor={CORES.verde} detalhe="internação" />
      <Kpi rotulo="Complementares" valor={num(leitos.complementares)} cor={CORES.verde} detalhe="UTI e afins" />
      <Kpi rotulo="Leitos SUS" valor={num(leitos.sus)} cor={CORES.dourado} detalhe={`não SUS: ${num(leitos.nao_sus)}`} />
    </>
  );
}

export function RaioXLeitos({ leitos }) {
  return (
    <Painel
      titulo="Raio-x dos leitos"
      nota="Leitos existentes por tipo, como no CNES (aba Leitos). Complementares são UTI, UCI e afins."
    >
      <BarrasHorizontais
        cor={CORES.verdeEscuro}
        itens={leitos.por_tipo.map((t) => ({ nome: t.label, valor: t.total, detalhe: t.sus ? `(${num(t.sus)} SUS)` : "" }))}
      />
    </Painel>
  );
}

export function LeitosNoContexto({ leitos }) {
  const { municipio, estado } = leitos.contexto;
  const linha = (rotulo, total, percentual) => (
    <div className="mb-4 last:mb-0">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-800">
          {rotulo}: <strong>{num(total)}</strong> leitos
        </span>
        <span className="font-bold" style={{ color: CORES.verdeEscuro }}>você = {pct(percentual)}</span>
      </div>
      <div className="h-3 rounded-full" style={{ background: CORES.verdeClaro }}>
        <div className="h-3 rounded-full" style={{ width: `${Math.max(percentual, 0.8)}%`, background: CORES.verde }} />
      </div>
    </div>
  );
  return (
    <Painel
      titulo="Seus leitos no contexto"
      nota="Totais de todos os estabelecimentos (associados ou não) na mesma competência do CNES, incluindo complementares."
    >
      {linha(municipio.nome, municipio.total, municipio.percentual)}
      {linha("Pernambuco", estado.total, estado.percentual)}
    </Painel>
  );
}

export function LeitosSus({ leitos }) {
  return (
    <Composicao
      titulo="Leitos SUS × não SUS"
      fatias={[
        { nome: "SUS", valor: leitos.sus, cor: CORES.verde },
        { nome: "Não SUS", valor: leitos.nao_sus, cor: CORES.dourado },
      ]}
      nota="Leito SUS não quer dizer hospital público: hospitais privados e filantrópicos também ofertam leitos ao SUS."
    />
  );
}

export function LeitosPorEspecialidade({ leitos }) {
  return (
    <Painel titulo="Leitos por especialidade" nota={leitos.por_especialidade.length > 10 ? "As 10 especialidades com mais leitos." : null}>
      <BarrasHorizontais
        limite={10}
        itens={leitos.por_especialidade.map((e) => ({ nome: e.label, valor: e.total, detalhe: e.sus ? `(${num(e.sus)} SUS)` : "" }))}
      />
    </Painel>
  );
}

export function PerfilAtendimento({ estrutura }) {
  const itens = [
    ["Vínculo com o SUS", estrutura.vinculo_sus],
    ["Urgência/Emergência", estrutura.urgencia],
    ["Centro cirúrgico", estrutura.centro_cirurgico],
    ["Centro obstétrico", estrutura.centro_obstetrico],
    ["Atendimento ambulatorial", estrutura.ambulatorio],
  ];
  return (
    <Painel titulo="Perfil de atendimento">
      <ul className="divide-y" style={{ borderColor: "#e6f5ee" }}>
        {itens.map(([nome, valor]) => (
          <li key={nome} className="flex items-center justify-between py-2.5">
            <span className="text-sm" style={{ color: CORES.verdeEscuro }}>{nome}</span>
            <span className="text-sm font-semibold" style={{ color: valor ? CORES.verde : CORES.neutro }}>
              {valor ? "✓ Sim" : "Não"}
            </span>
          </li>
        ))}
      </ul>
    </Painel>
  );
}

export function NotaFonte({ atual }) {
  return (
    <p className="text-xs text-center mt-6 leading-relaxed" style={{ color: CORES.neutro }}>
      Dados reais: identidade da base oficial do SINDHOSPE; estrutura, leitos, equipamentos e profissionais do
      CNES/DATASUS, competência {mesAno(atual?.competencia)}.
    </p>
  );
}
