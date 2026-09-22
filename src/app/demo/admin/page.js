"use client";

import { useState } from "react";
import { CORES, Card, CardTitle } from "../../components";
import { DemoBadge, VoltarDemo, TabelaDemo, ChipSituacao } from "../demo-components";
import { ASSOCIADOS_DEMO, SINCRONIZACAO_DEMO, AUDITORIA_DEMO } from "../mock-data";

export default function DemoAdminPage() {
  const [sincronizando, setSincronizando] = useState(false);
  const [sincronizado, setSincronizado] = useState(false);

  function sincronizar() {
    if (sincronizando) return;
    setSincronizando(true);
    // Fluxo simulado: na versão real, dispararia a rotina de importação CNES/DATASUS.
    setTimeout(() => {
      setSincronizando(false);
      setSincronizado(true);
    }, 1600);
  }

  return (
    <div>
      <VoltarDemo />
      <DemoBadge />

      <Card>
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <p className="text-xs mb-0.5" style={{ color: CORES.verde }}>Administração SINDHOSPE</p>
            <p className="text-lg font-semibold text-gray-900">Gestão da plataforma</p>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Área restrita à equipe do sindicato: associados, sincronização e auditoria.
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-md" style={{ background: CORES.verdeClaro, color: CORES.verdeEscuro }}>
            4 associados na base (exemplo)
          </span>
        </div>
      </Card>

      <Card>
        <CardTitle>Associados ↔ estabelecimentos</CardTitle>
        <TabelaDemo headers={["Estabelecimento", "CNPJ", "CNES", "Município", "Situação", "Atualizado"]}>
          {ASSOCIADOS_DEMO.map((a) => (
            <tr key={a.cnes} className="border-b border-gray-100 last:border-0">
              <td className="px-2 py-2.5 text-gray-900 font-medium">{a.nome_fantasia}</td>
              <td className="px-2 py-2.5 text-gray-600 text-xs">{a.cnpj}</td>
              <td className="px-2 py-2.5 text-gray-600 text-xs">{a.cnes}</td>
              <td className="px-2 py-2.5 text-gray-600 text-xs">{a.municipio}</td>
              <td className="px-2 py-2.5"><ChipSituacao situacao={a.situacao} /></td>
              <td className="px-2 py-2.5 text-gray-400 text-xs">{a.atualizado_em}</td>
            </tr>
          ))}
        </TabelaDemo>
        <p className="text-xs text-gray-400 mt-3 leading-relaxed">
          O vínculo associado ↔ CNES é a base do portal: é ele que garante que cada login só enxergue o
          próprio estabelecimento. Cadastro, edição e permissões serão gerenciados aqui no MVP completo.
        </p>
      </Card>

      <Card>
        <CardTitle>Sincronização CNES/DATASUS</CardTitle>
        <div className="grid grid-cols-2 gap-2 text-sm mb-4">
          <div className="rounded-lg bg-gray-50 px-3 py-2">
            <p className="text-xs text-gray-500">Última execução</p>
            <p className="text-sm font-semibold text-gray-900">{SINCRONIZACAO_DEMO.ultima_execucao}</p>
          </div>
          <div className="rounded-lg bg-gray-50 px-3 py-2">
            <p className="text-xs text-gray-500">Competência importada</p>
            <p className="text-sm font-semibold text-gray-900">{SINCRONIZACAO_DEMO.competencia_importada}</p>
          </div>
          <div className="rounded-lg bg-gray-50 px-3 py-2">
            <p className="text-xs text-gray-500">Registros processados</p>
            <p className="text-sm font-semibold text-gray-900">{SINCRONIZACAO_DEMO.registros_processados}</p>
          </div>
          <div className="rounded-lg bg-gray-50 px-3 py-2">
            <p className="text-xs text-gray-500">Status</p>
            <p className="text-sm font-semibold" style={{ color: CORES.verde }}>{SINCRONIZACAO_DEMO.status}</p>
          </div>
        </div>
        <p className="text-xs text-gray-500 mb-3">Fonte: {SINCRONIZACAO_DEMO.fonte}</p>

        {sincronizado ? (
          <div className="rounded-lg px-3 py-2.5 text-sm flex gap-2" style={{ background: CORES.verdeClaro, color: CORES.verdeEscuro }}>
            <span aria-hidden>✅</span>
            <span>
              <strong>Sincronização concluída (simulada).</strong> Na rotina real, os arquivos oficiais da
              competência seriam baixados, tratados pelo ETL e gravados no PostgreSQL.
            </span>
          </div>
        ) : (
          <button
            type="button"
            onClick={sincronizar}
            disabled={sincronizando}
            className="w-full text-sm font-semibold rounded-lg px-4 py-2.5 text-white"
            style={{ background: CORES.verde, opacity: sincronizando ? 0.6 : 1 }}
          >
            {sincronizando ? "Sincronizando…" : "Executar sincronização agora"}
          </button>
        )}
      </Card>

      <Card>
        <CardTitle>Trilha de auditoria</CardTitle>
        <ul>
          {AUDITORIA_DEMO.map((e, i) => (
            <li key={i} className="py-2.5 border-b border-gray-100 last:border-0">
              <p className="text-sm text-gray-900 leading-snug">{e.evento}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {e.usuario} &middot; {e.quando}
              </p>
            </li>
          ))}
        </ul>
        <p className="text-xs text-gray-400 mt-3 leading-relaxed">
          Cada ação sensível (vínculos, revisões, sincronizações) fica registrada — requisito de
          governança e LGPD discutido na especificação.
        </p>
      </Card>

      <p className="text-xs text-gray-400 text-center mt-6 leading-relaxed">
        Protótipo — associados, sincronização e auditoria são exemplos fictícios.
      </p>
    </div>
  );
}
