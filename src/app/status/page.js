"use client";

import { CORES, Card } from "../components";

const ITENS = [
  { titulo: "Login do portal", coluna: "doing", nota: "Funciona (nome + senha demo). Falta: login por CNES/CNPJ real, recuperação de senha, contato de suporte." },
  { titulo: "Meu estabelecimento", coluna: "done", nota: "Identidade, capacidade, serviços, insights — dados reais." },
  { titulo: "Perfil do estabelecimento", coluna: "doing", nota: "Dados cadastrais e serviços reais. Falta: endereço completo, responsáveis, natureza jurídica traduzida." },
  { titulo: "Estrutura física e capacidade", coluna: "done", nota: "Leitos totais/complementares, comparação entre períodos." },
  { titulo: "Serviços oferecidos (catálogo)", coluna: "todo", nota: "Falta tradução de código pra nome do serviço, e análise de lacunas vs. concorrência." },
  { titulo: "Indicadores (conformidade cadastral)", coluna: "todo", nota: "Ainda não existe como tela própria." },
  { titulo: "Mercado (agregado por município/tipo)", coluna: "done", nota: "Evolução do número de estabelecimentos, com e sem vínculo SUS." },
  { titulo: "Evolução histórica", coluna: "done", nota: "Série trimestral real, jun/2024 a jun/2026, travada pro associado logado." },
  { titulo: "Relatório dinâmico", coluna: "done", nota: "KPIs, evolução vs. mercado, composição de leitos, insights, janela 6/12/24 meses." },
  { titulo: "Solicitar revisão de dados", coluna: "done", nota: "Formulário funcional, salva no banco." },
  { titulo: "Visão Geral do estado + representatividade", coluna: "done", nota: "% de leitos de PE representados pelos associados do SINDHOSPE." },
  { titulo: "Área administrativa (SINDHOSPE)", coluna: "todo", nota: "Gestão de associados, vínculo associado↔CNES, sincronização, trilha de auditoria." },
  { titulo: "Autenticação real (por associado, não senha única)", coluna: "todo", nota: "Hoje senha é fixa (12345) pra todo mundo — é só demo." },
  { titulo: "Mix de atendimento (SUS/convênio/particular)", coluna: "todo", nota: "Sem base pública — será formulário auto-preenchido pelo associado." },
];

const COLUNAS = [
  { id: "todo", titulo: "A fazer", cor: "#9ca3af" },
  { id: "doing", titulo: "Em andamento", cor: CORES.dourado },
  { id: "done", titulo: "Pronto", cor: CORES.verde },
];

export default function StatusPage() {
  return (
    <div>
      <Card>
        <p className="text-lg font-semibold text-gray-900 mb-1">Status do projeto</p>
        <p className="text-xs text-gray-500">
          Visão honesta do que já está pronto com dados reais, o que está pela metade, e o que ainda não começou.
        </p>
      </Card>

      <div className="grid grid-cols-1 gap-4">
        {COLUNAS.map((col) => {
          const itensColuna = ITENS.filter((i) => i.coluna === col.id);
          return (
            <div key={col.id}>
              <div className="flex items-center gap-2 mb-2 px-1">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: col.cor }} />
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                  {col.titulo} ({itensColuna.length})
                </p>
              </div>
              <div className="space-y-2 mb-2">
                {itensColuna.map((item) => (
                  <div
                    key={item.titulo}
                    className="bg-white rounded-lg px-4 py-3 shadow-sm border-l-4"
                    style={{ borderLeftColor: col.cor }}
                  >
                    <p className="text-sm font-semibold text-gray-900">{item.titulo}</p>
                    <p className="text-xs text-gray-500 mt-1">{item.nota}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
