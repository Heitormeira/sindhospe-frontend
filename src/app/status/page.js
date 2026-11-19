"use client";

import { CORES, Card } from "../components";

const ITENS = [
  { titulo: "Login do portal", coluna: "done", nota: "Uma conta por estabelecimento (Firebase Auth), senha individual entregue pelo SINDHOSPE e troca de senha no Perfil." },
  { titulo: "Meu estabelecimento", coluna: "done", nota: "Conteúdo por tipo: hospital vê leitos (LT do CNES); clínicas e diagnóstico veem equipamentos, profissionais e serviços. Comparação só com o mesmo tipo." },
  { titulo: "Perfil do estabelecimento", coluna: "done", nota: "Dados cadastrais, natureza jurídica, validade do cadastro (6 meses, Portaria SAS 118/2014), licença sanitária declarada e quem o estabelecimento atende." },
  { titulo: "Leitos com uma fonte só", coluna: "done", nota: "Cartão, evolução, relatório e gráfico SUS saem do mesmo arquivo (LT) e do mesmo mês. Sem médias fracionadas." },
  { titulo: "Mercado (agregado por município/tipo)", coluna: "done", nota: "Número de estabelecimentos por tipo e município, com e sem vínculo SUS." },
  { titulo: "Evolução histórica", coluna: "done", nota: "Série trimestral do CNES desde mar/2020 (entra no ar na próxima importação)." },
  { titulo: "Relatório dinâmico", coluna: "done", nota: "KPIs, evolução, composição de leitos e comparação com o mesmo tipo; janelas de 6, 12 e 24 meses e 5 anos." },
  { titulo: "Painel SINDHOSPE", coluna: "done", nota: "Visão do sindicato com acesso próprio: associados com e sem leito, setores, cadastros desatualizados e pedidos de revisão." },
  { titulo: "Solicitar revisão de dados", coluna: "done", nota: "O associado envia; só o sindicato lê." },
  { titulo: "Importação dos dados", coluna: "done", nota: "Direto dos arquivos públicos do DATASUS, sem banco intermediário; dados de profissionais só como contagem (LGPD)." },
  { titulo: "Licença sanitária conferida com a APEVISA", coluna: "todo", nota: "Hoje mostra só o que o estabelecimento declarou no CNES; a conferência depende de dados da vigilância sanitária." },
  { titulo: "Endereço completo", coluna: "todo", nota: "O arquivo do CNES usado traz só o município." },
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
