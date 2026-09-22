"use client";

import { useState } from "react";
import { CORES, Card, CardTitle, Servico } from "../../components";
import { DemoBadge, VoltarDemo, DadoCadastral, ChipSituacao } from "../demo-components";
import { HOSPITAL_DEMO, RESPONSAVEIS_DEMO, SERVICOS_HABILITADOS_DEMO } from "../mock-data";

export default function DemoPerfilPage() {
  const h = HOSPITAL_DEMO;
  const [revisaoEnviada, setRevisaoEnviada] = useState(false);

  return (
    <div>
      <VoltarDemo />
      <DemoBadge />

      <Card>
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <p className="text-xs mb-0.5" style={{ color: CORES.verde }}>Perfil do estabelecimento</p>
            <p className="text-lg font-semibold text-gray-900">{h.nome_fantasia}</p>
            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
              {h.razao_social}<br />
              CNES {h.cnes} &middot; CNPJ {h.cnpj}<br />
              Registro SINDHOSPE nº {h.registro}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <ChipSituacao situacao={h.situacao} />
            <span className="text-xs text-gray-400">Atualizado em {h.updatedAt}</span>
          </div>
        </div>
      </Card>

      <Card>
        <CardTitle>Dados cadastrais (CNES)</CardTitle>
        <DadoCadastral label="Tipo de estabelecimento" valor={h.tipo} />
        <DadoCadastral label="Natureza jurídica" valor={h.natureza_juridica} />
        <DadoCadastral label="Gestão" valor={h.gestao} />
        <DadoCadastral label="Situação cadastral" valor={<ChipSituacao situacao={h.situacao} />} />
        <DadoCadastral label="Código CNES" valor={h.cnes} />
        <DadoCadastral label="CNPJ" valor={h.cnpj} />
      </Card>

      <Card>
        <CardTitle>Localização</CardTitle>
        <DadoCadastral label="Endereço" valor={h.endereco.logradouro} />
        <DadoCadastral label="Bairro" valor={h.endereco.bairro} />
        <DadoCadastral label="Município" valor={`${h.endereco.municipio}/PE`} />
        <DadoCadastral label="CEP" valor={h.endereco.cep} />
        <DadoCadastral label="Região" valor={h.endereco.regiao} />
      </Card>

      <Card>
        <CardTitle>Responsáveis</CardTitle>
        <ul className="divide-y divide-gray-100">
          {RESPONSAVEIS_DEMO.map((r) => (
            <li key={r.nome} className="py-2.5 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-gray-900 font-medium">{r.nome}</p>
                <p className="text-xs text-gray-500">{r.cargo} &middot; {r.conselho}</p>
              </div>
              <span className="text-xs text-gray-400 shrink-0">desde {r.since}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <CardTitle>Serviços habilitados</CardTitle>
        <ul className="divide-y divide-gray-100 text-sm">
          {SERVICOS_HABILITADOS_DEMO.map((s) => (
            <Servico key={s.codigo} nome={`${s.codigo} — ${s.nome}`} valor="1" cores={CORES} />
          ))}
        </ul>
        <p className="text-xs text-gray-400 mt-2">Porte/habilitação oficial consultável no CNES na versão completa.</p>
      </Card>

      <Card>
        <CardTitle>Divergências ou dados desatualizados?</CardTitle>
        <p className="text-sm text-gray-700 leading-relaxed mb-4">
          Se algum dado desta ficha estiver incorreto, o associado pode solicitar revisão ao SINDHOSPE,
          que valida e encaminha a correção à fonte oficial (CNES/DATASUS).
        </p>

        {revisaoEnviada ? (
          <div
            className="rounded-lg px-3 py-2.5 text-sm flex gap-2"
            style={{ background: CORES.verdeClaro, color: CORES.verdeEscuro }}
          >
            <span aria-hidden>✅</span>
            <span>
              <strong>Solicitação registrada.</strong> O SINDHOSPE receberá esta revisão para análise.
              (Na versão real, o pedido seria registrado com data, usuário e trilha de auditoria.)
            </span>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setRevisaoEnviada(true)}
            className="w-full text-sm font-semibold rounded-lg px-4 py-2.5 text-white"
            style={{ background: CORES.verde }}
          >
            Solicitar revisão
          </button>
        )}
      </Card>

      <p className="text-xs text-gray-400 text-center mt-6 leading-relaxed">
        Protótipo — dados fictícios apenas para ilustrar a ficha cadastral e o fluxo de revisão.
      </p>
    </div>
  );
}
