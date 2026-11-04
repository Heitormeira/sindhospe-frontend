"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CORES, getSessao } from "../components";
import { getFichaCompleta } from "../dados";
import { mensagemAmigavel } from "../api-error";
import {
  KpisLeitos,
  KpisCapacidade,
  RaioXLeitos,
  LeitosNoContexto,
  LeitosSus,
  LeitosPorEspecialidade,
  PerfilAtendimento,
  Equipamentos,
  Profissionais,
  Servicos,
  NotaFonte,
} from "../blocos";

function Cabecalho({ dados }) {
  const a = dados.atual;
  return (
    <div
      className="bg-white rounded-xl px-6 py-4 mb-4 flex items-start justify-between flex-wrap gap-3"
      style={{ border: "1px solid #d6e8e0" }}
    >
      <div>
        <p className="text-xs font-semibold mb-0.5" style={{ color: CORES.verde }}>
          Meu estabelecimento{a?.categoria_label ? ` · ${a.categoria_label}` : ""}
        </p>
        <p className="text-2xl font-extrabold text-gray-900">{dados.identidade.nome_fantasia}</p>
        <p className="text-xs mt-1 leading-relaxed" style={{ color: CORES.neutro }}>
          {a?.municipio ? (
            <>CNES {dados.identidade.cnes} &middot; {a.municipio.nome}/PE<br /></>
          ) : null}
          CNPJ {dados.identidade.cnpj} &middot; Registro SINDHOSPE nº {dados.identidade.registro}
        </p>
      </div>
      <span
        className="text-xs font-bold px-3 py-1.5 rounded-lg self-center"
        style={{ background: CORES.verdeClaro, color: CORES.verdeEscuro }}
      >
        {dados.identidade.situacao}
      </span>
    </div>
  );
}

function SemCnes() {
  return (
    <div className="bg-white rounded-xl p-5" style={{ border: "1px solid #d6e8e0" }}>
      <p className="text-sm" style={{ color: CORES.neutro }}>
        Este associado não aparece na competência mais recente do CNES (por exemplo, empresas prestadoras de
        serviço ao setor, sem estabelecimento de saúde próprio, ou cadastros desativados). Não há indicadores
        estruturais para exibir.
      </p>
    </div>
  );
}

// Hospital (ou quem tem leitos): leitos primeiro, depois equipamentos e equipe.
function VisaoHospital({ a }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4">
      <div className="flex md:flex-col gap-3 flex-wrap">
        <KpisLeitos leitos={a.leitos} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <RaioXLeitos leitos={a.leitos} />
        <LeitosNoContexto leitos={a.leitos} />
        <LeitosSus leitos={a.leitos} />
        <LeitosPorEspecialidade leitos={a.leitos} />
        <Equipamentos equipamentos={a.equipamentos} limite={10} />
        <Profissionais profissionais={a.profissionais} />
        <PerfilAtendimento estrutura={a.estrutura} />
        <Servicos servicos={a.servicos} habilitacoes={a.habilitacoes} />
      </div>
    </div>
  );
}

// Clínica, diagnóstico (SADT), atenção domiciliar e outros: sem leitos.
// Equipamentos e equipe na frente; comparação só com o mesmo tipo de unidade.
function VisaoSemLeitos({ a }) {
  const temEquipamentos = a.equipamentos.total > 0;
  return (
    <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4">
      <div className="flex md:flex-col gap-3 flex-wrap">
        <KpisCapacidade a={a} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {temEquipamentos && <Equipamentos equipamentos={a.equipamentos} />}
        <Profissionais profissionais={a.profissionais} />
        <Servicos servicos={a.servicos} habilitacoes={a.habilitacoes} />
        <PerfilAtendimento estrutura={a.estrutura} />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [sessao, setSessao] = useState(null);
  const [dados, setDados] = useState(null);
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
      .then((json) => setDados(json))
      .catch((e) => setErro(mensagemAmigavel(e)))
      .finally(() => setCarregando(false));
  }, [sessao]);

  if (!sessao) return null;
  const a = dados?.atual;

  return (
    <div>
      {erro && (
        <div
          className="text-sm rounded-lg px-4 py-3 mb-4"
          style={{ background: CORES.vermelhoClaro, color: CORES.vermelho, border: `0.5px solid ${CORES.vermelho}33` }}
        >
          {erro}
        </div>
      )}

      {carregando && <p className="text-sm px-1" style={{ color: CORES.neutro }}>Carregando...</p>}

      {dados && !carregando && (
        <>
          <Cabecalho dados={dados} />
          {!a?.cadastro?.encontrado ? <SemCnes /> : a.mostra_leitos ? <VisaoHospital a={a} /> : <VisaoSemLeitos a={a} />}
        </>
      )}

      <NotaFonte atual={a} />
    </div>
  );
}
