"use client";

import Link from "next/link";
import { CORES, Card, CardTitle } from "../components";
import { DemoBadge } from "./demo-components";

const TELAS_DEMO = [
  {
    href: "/demo/login",
    numero: "1",
    titulo: "Login do portal",
    descricao:
      "Autenticação por CNES ou CNPJ, recuperação de senha e contato com o suporte — a porta de entrada do portal fechado para associados.",
  },
  {
    href: "/demo/perfil",
    numero: "3",
    titulo: "Perfil do estabelecimento",
    descricao:
      "Ficha cadastral oficial com dados do CNES, responsáveis, serviços habilitados e solicitação de revisão ao SINDHOSPE.",
  },
  {
    href: "/demo/estrutura",
    numero: "4",
    titulo: "Estrutura física e capacidade",
    descricao:
      "Leitos por especialidade, salas funcionais e equipamentos — com comparação entre períodos (o que cresceu, o que caiu).",
  },
  {
    href: "/demo/servicos",
    numero: "5",
    titulo: "Serviços oferecidos",
    descricao:
      "Catálogo com filtros por complexidade e homologação + análise de lacunas: o que o grupo semelhante oferece e você ainda não.",
  },
  {
    href: "/demo/indicadores",
    numero: "6",
    titulo: "Indicadores",
    descricao:
      "Painel de indicadores operacionais do CNES, conformidade cadastral e o caminho honesto para indicadores assistenciais/financeiros na fase 2.",
  },
  {
    href: "/demo/relatorios",
    numero: "9",
    titulo: "Relatório dinâmico",
    descricao:
      "KPIs, evolução da capacidade vs. mercado, composição dos leitos e insights — análise interativa dentro do próprio portal, com janela de 6 a 24 meses.",
  },
  {
    href: "/demo/admin",
    numero: "10",
    titulo: "Área administrativa",
    descricao:
      "Gestão de associados e do vínculo associado ↔ CNES, sincronização com o DATASUS e trilha de auditoria.",
  },
];

const TELAS_REAIS = [
  { href: "/dashboard", titulo: "Meu estabelecimento", nota: "leitos e serviços com comparativos reais (CNES/DATASUS)" },
  { href: "/mercado", titulo: "Mercado", nota: "série agregada de estabelecimentos por município e tipo" },
  { href: "/evolucao", titulo: "Evolução", nota: "histórico trimestral do estabelecimento (jun/2024 a jun/2026)" },
];

export default function DemoPage() {
  return (
    <div>
      <DemoBadge />

      <Card>
        <h1 className="text-lg font-semibold text-gray-900 mb-1">Demonstração do protótipo</h1>
        <p className="text-sm text-gray-600 leading-relaxed">
          Estas telas vêm dos <strong>wireframes de baixa fidelidade</strong> desenhados na entrega anterior
          (Heitor Farias &amp; Marcelo), agora navegáveis e vestidos com a identidade do portal. Elas
          complementam as três telas que já funcionam com <strong>dados reais</strong> do CNES/DATASUS —
          construídas a partir do MVP do Heitor Meira.
        </p>
      </Card>

      <Card>
        <CardTitle>Telas do protótipo</CardTitle>
        {TELAS_DEMO.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0 group"
          >
            <span
              className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
              style={{ background: CORES.verdeClaro, color: CORES.verdeEscuro }}
            >
              {t.numero}
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-gray-900 group-hover:underline" style={{ textDecorationColor: CORES.verde }}>
                {t.titulo}
              </span>
              <span className="block text-xs text-gray-500 mt-0.5 leading-relaxed">{t.descricao}</span>
            </span>
            <span className="ml-auto text-gray-300 group-hover:text-gray-500 shrink-0" aria-hidden>→</span>
          </Link>
        ))}
      </Card>

      <Card>
        <CardTitle>Já funcionando com dados reais</CardTitle>
        <ul className="space-y-2">
          {TELAS_REAIS.map((t) => (
            <li key={t.href}>
              <Link href={t.href} className="text-sm font-semibold hover:underline" style={{ color: CORES.verdeEscuro, textDecorationColor: CORES.verde }}>
                {t.titulo} →
              </Link>
              <span className="block text-xs text-gray-500">{t.nota}</span>
            </li>
          ))}
        </ul>
      </Card>

      <p className="text-xs text-gray-400 text-center mt-6 leading-relaxed">
        Protótipo de baixa fidelidade transformado em navegação — os números refletem a numeração do PDF de wireframes.
      </p>
    </div>
  );
}
