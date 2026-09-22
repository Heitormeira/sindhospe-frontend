"use client";

import { CORES, Card, CardTitle, Servico } from "../../components";
import { DemoBadge, VoltarDemo } from "../demo-components";
import { INDICADORES_OPERACIONAIS_DEMO, CONFORMIDADE_CADASTRAL_DEMO } from "../mock-data";

const STATUS_CONFORMIDADE = {
  completo: { texto: "✓ Completo", cor: CORES.verdeEscuro, bg: CORES.verdeClaro },
  atencao: { texto: "⚠ Revisar", cor: "#8a6a00", bg: `${CORES.dourado}18` },
  faltando: { texto: "✗ Não informado", cor: CORES.vermelho, bg: CORES.vermelhoClaro },
};

export default function DemoIndicadoresPage() {
  return (
    <div>
      <VoltarDemo />
      <DemoBadge />

      <Card>
        <p className="text-xs mb-0.5" style={{ color: CORES.verde }}>Indicadores</p>
        <p className="text-lg font-semibold text-gray-900">Painel de indicadores do estabelecimento</p>
        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
          Os quatro primeiros indicadores são calculados do CNES/DATASUS (fase 1 do MVP). Os assistenciais
          e financeiros vêm na fase 2, quando o associado quiser integrar sistemas próprios.
        </p>
      </Card>

      <Card>
        <CardTitle>Indicadores operacionais (fase 1 — bases públicas)</CardTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {INDICADORES_OPERACIONAIS_DEMO.map((ind) => (
            <div
              key={ind.nome}
              className="border rounded-xl px-4 py-3"
              style={{ borderColor: `${CORES.verde}22`, background: "white" }}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs text-gray-600 font-medium leading-snug">{ind.nome}</p>
                <span
                  className="shrink-0 w-2 h-2 rounded-full mt-1"
                  style={{ background: ind.bom ? CORES.verde : CORES.dourado }}
                  title={ind.bom ? "Favorável vs. referência" : "Atenção vs. referência"}
                />
              </div>
              <p className="text-xl font-bold mt-1.5" style={{ color: ind.bom ? CORES.verdeEscuro : "#8a6a00" }}>
                {ind.valor}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{ind.referencia}</p>
              <p className="text-xs text-gray-400 mt-2 leading-relaxed">{ind.nota}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardTitle>Conformidade cadastral — o que falta informar</CardTitle>
        <p className="text-xs text-gray-500 mb-3 leading-relaxed">
          Um checklist direto do que está completo, em revisão ou ausente nos cadastros públicos —
          dado que evita surpresa em credenciamento e auditoria.
        </p>
        <ul className="divide-y divide-gray-100">
          {CONFORMIDADE_CADASTRAL_DEMO.map((c) => {
            const s = STATUS_CONFORMIDADE[c.status];
            return (
              <li key={c.campo} className="py-2.5 flex items-center justify-between gap-3">
                <span className="text-sm text-gray-700">{c.campo}</span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md" style={{ background: s.bg, color: s.cor }}>
                  {s.texto}
                </span>
              </li>
            );
          })}
        </ul>
      </Card>

      <Card>
        <CardTitle>Indicadores assistenciais/financeiros — fase 2</CardTitle>
        <p className="text-xs text-gray-500 mb-2 leading-relaxed">
          Estes exemplos ilustram o potencial de análise quando o associado integrar dados próprios
          (Tuss/SIH, faturamento de convênios). Não fazem parte do MVP com dados públicos.
        </p>
        <ul className="divide-y divide-gray-100 text-sm">
          <Servico nome="Taxa de infecção hospitalar" valor="—" cores={CORES} />
          <Servico nome="Média de permanência (dias)" valor="—" cores={CORES} />
          <Servico nome="Giro de leitos" valor="—" cores={CORES} />
          <Servico nome="Receita por leito (mix SUS/convênio)" valor="—" cores={CORES} />
          <Servico nome="Ticket médio por convênio" valor="—" cores={CORES} />
        </ul>
        <p className="text-xs text-gray-400 mt-3 leading-relaxed">
          Estratégia de roadmap honesta: mostrar onde se quer chegar sem prometer o que o CNES não entrega.
        </p>
      </Card>

      <p className="text-xs text-gray-400 text-center mt-6 leading-relaxed">
        Protótipo — valores fictícios para ilustrar o painel de indicadores.
      </p>
    </div>
  );
}
