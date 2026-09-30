"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  API_URL,
  CORES,
  Servico,
  Insight,
  getSessao,
  limparSessao,
} from "../components";

function formatarNumero(valor) {
  if (valor === null || valor === undefined || Number.isNaN(valor)) return "0";
  return Number.isInteger(valor) ? String(valor) : valor.toFixed(1).replace(".", ",");
}

function TileKPI({ rotulo, valor, cor }) {
  return (
    <div
      className="bg-white rounded-lg px-4 py-3 shadow-sm flex-1 min-w-[140px] md:min-w-0"
      style={{ borderLeft: `4px solid ${cor}` }}
    >
      <div className="text-xs mb-0.5" style={{ color: CORES.neutro }}>{rotulo}</div>
      <div className="text-2xl font-extrabold" style={{ color: cor }}>{valor}</div>
    </div>
  );
}

function Painel({ titulo, acao, children, largo }) {
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
    </div>
  );
}

function BarrasComNumero({ itens, sufixo = "" }) {
  const max = Math.max(...itens.map((i) => i.valor), 1);
  const ALTURA_MAX = 110;
  return (
    <div className="flex items-end gap-5" style={{ height: 170 }}>
      {itens.map((item) => (
        <div key={item.nome} className="flex flex-col items-center gap-1.5 flex-1">
          <div className="text-sm font-bold text-gray-900">
            {formatarNumero(item.valor)}{sufixo}
          </div>
          <div
            className="w-full rounded-t-md transition-all duration-300"
            style={{
              maxWidth: 56,
              height: Math.max((item.valor / max) * ALTURA_MAX, 4),
              background: item.cor,
            }}
          />
          <div className="text-xs text-center" style={{ color: CORES.neutro }}>{item.nome}</div>
        </div>
      ))}
    </div>
  );
}

function BotaoAlternar({ modo, setModo }) {
  return (
    <div className="flex rounded-md overflow-hidden text-xs font-bold" style={{ border: "1px solid #d6e8e0" }}>
      <button
        type="button"
        onClick={() => setModo("barras")}
        className="px-2.5 py-1"
        style={{
          background: modo === "barras" ? CORES.verdeEscuro : "white",
          color: modo === "barras" ? "white" : CORES.verdeEscuro,
        }}
      >
        Barras
      </button>
      <button
        type="button"
        onClick={() => setModo("pizza")}
        className="px-2.5 py-1"
        style={{
          background: modo === "pizza" ? CORES.verdeEscuro : "white",
          color: modo === "pizza" ? "white" : CORES.verdeEscuro,
        }}
      >
        Pizza
      </button>
    </div>
  );
}

function ComposicaoLeitos({ totalLeitos, complementares }) {
  const [modo, setModo] = useState("pizza");
  const comuns = Math.max(totalLeitos - complementares, 0);
  const pctComuns = totalLeitos > 0 ? Math.round((comuns / totalLeitos) * 100) : 0;
  const pctComplementares = totalLeitos > 0 ? 100 - pctComuns : 0;

  const fatias = [
    { nome: "Leitos comuns", pct: pctComuns, cor: CORES.verde },
    { nome: "Leitos complementares", pct: pctComplementares, cor: CORES.verdeEscuro },
  ];

  let acumulado = 0;
  const gradiente = fatias
    .map((f) => {
      const inicio = acumulado;
      acumulado += f.pct;
      return `${f.cor} ${inicio}% ${acumulado}%`;
    })
    .join(", ");

  return (
    <Painel titulo="Composição dos leitos" acao={<BotaoAlternar modo={modo} setModo={setModo} />}>
      {modo === "pizza" ? (
        <div className="flex items-center gap-5 flex-wrap">
          <div
            className="rounded-full flex-shrink-0"
            style={{ width: 120, height: 120, background: `conic-gradient(${gradiente})` }}
          />
          <div className="flex flex-col gap-2 text-xs">
            {fatias.map((f) => (
              <div key={f.nome} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm inline-block flex-shrink-0" style={{ background: f.cor }} />
                {f.nome} — {f.pct}%
              </div>
            ))}
          </div>
        </div>
      ) : (
        <BarrasComNumero
          sufixo="%"
          itens={fatias.map((f) => ({ nome: f.nome, valor: f.pct, cor: f.cor }))}
        />
      )}
    </Painel>
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
    if (!sessao) return;
    setCarregando(true);
    setErro("");
    fetch(`${API_URL}/api/estabelecimento/${sessao.cnes}`)
      .then((r) => {
        if (!r.ok) throw new Error("Estabelecimento não encontrado.");
        return r.json();
      })
      .then((json) => setDados(json))
      .catch((e) => setErro(e.message))
      .finally(() => setCarregando(false));
  }, [sessao]);

  function sair() {
    limparSessao();
    router.push("/login");
  }

  const temDadosCnes = dados && dados.estrutura !== null;

  const semLeitosAplicavel =
    temDadosCnes && dados.estrutura.leitos_totais === 0 && parseFloat(dados.comparativo.estado.media_leitos) < 1;

  const mostrarComplementares =
    temDadosCnes &&
    (dados.estrutura.leitos_complementares > 0 || parseFloat(dados.comparativo.estado.media_complementares) > 0.3);

  if (!sessao) return null;

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
          <div
            className="bg-white rounded-xl px-6 py-4 mb-4 flex items-start justify-between flex-wrap gap-3"
            style={{ border: "1px solid #d6e8e0" }}
          >
            <div>
              <p className="text-xs font-semibold mb-0.5" style={{ color: CORES.verde }}>Meu estabelecimento</p>
              <p className="text-2xl font-extrabold text-gray-900">{dados.identidade.nome_fantasia}</p>
              <p className="text-xs mt-1 leading-relaxed" style={{ color: CORES.neutro }}>
                {temDadosCnes ? (
                  <>CNES {dados.identidade.cnes} &middot; {dados.estrutura.municipio_nome}/PE<br /></>
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

          {temDadosCnes ? (
            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4">
              <div className="flex md:flex-col gap-3 flex-wrap">
                <TileKPI rotulo="Leitos totais" valor={dados.estrutura.leitos_totais} cor={CORES.verdeEscuro} />
                <TileKPI rotulo="Complementares" valor={dados.estrutura.leitos_complementares} cor={CORES.verde} />
                <TileKPI rotulo="Serviços especial." valor={dados.indicadores.total_servicos_especializados} cor={CORES.verdeEscuro} />
                <TileKPI rotulo="Habilitações" valor={dados.indicadores.total_habilitacoes} cor={CORES.vermelho} />
                <TileKPI
                  rotulo="Vínculo SUS"
                  valor={dados.estrutura.aceita_sus ? "Sim" : "Não"}
                  cor={dados.estrutura.aceita_sus ? CORES.verde : CORES.neutro}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Painel titulo="Capacidade física — leitos totais">
                  {semLeitosAplicavel ? (
                    <p className="text-sm py-2" style={{ color: CORES.neutro }}>
                      Estabelecimentos do tipo "{dados.estrutura.tp_unid_label}" normalmente não possuem leitos
                      cadastrados no CNES — esse indicador não se aplica aqui.
                    </p>
                  ) : (
                    <>
                      <BarrasComNumero
                        itens={[
                          { nome: "Você", valor: dados.estrutura.leitos_totais, cor: CORES.verdeEscuro },
                          { nome: "Município", valor: parseFloat(dados.comparativo.municipio.media_leitos), cor: CORES.verde },
                          { nome: "Pernambuco", valor: parseFloat(dados.comparativo.estado.media_leitos), cor: CORES.dourado },
                        ]}
                      />
                      <Insight tipo="leitos" valor={dados.estrutura.leitos_totais} media={dados.comparativo.estado.media_leitos} />
                    </>
                  )}
                </Painel>

                {mostrarComplementares && (
                  <Painel titulo="Leitos complementares (UTI e afins)">
                    <BarrasComNumero
                      itens={[
                        { nome: "Você", valor: dados.estrutura.leitos_complementares, cor: CORES.verdeEscuro },
                        { nome: "Município", valor: parseFloat(dados.comparativo.municipio.media_complementares), cor: CORES.verde },
                        { nome: "Pernambuco", valor: parseFloat(dados.comparativo.estado.media_complementares), cor: CORES.dourado },
                      ]}
                    />
                    <Insight tipo="complementares" valor={dados.estrutura.leitos_complementares} media={dados.comparativo.estado.media_complementares} />
                  </Painel>
                )}

                {!semLeitosAplicavel && (
                  <ComposicaoLeitos
                    totalLeitos={dados.estrutura.leitos_totais}
                    complementares={dados.estrutura.leitos_complementares}
                  />
                )}

                <Painel titulo="Perfil de atendimento">
                  <ul className="divide-y" style={{ borderColor: "#e6f5ee" }}>
                    <Servico nome="Possui vínculo com o SUS" valor={dados.estrutura.aceita_sus} cores={CORES} />
                    <Servico nome="Urgência/Emergência" valor={dados.estrutura.tem_urgencia} cores={CORES} />
                    <Servico nome="Centro cirúrgico" valor={dados.estrutura.tem_centro_cirurgico} cores={CORES} />
                    <Servico nome="Centro obstétrico" valor={dados.estrutura.tem_centro_obstetrico} cores={CORES} />
                    <Servico nome="Atendimento ambulatorial" valor={dados.estrutura.tem_atend_ambulatorial} cores={CORES} />
                  </ul>
                </Painel>

                <Painel titulo="Serviços especializados" largo>
                  <BarrasComNumero
                    itens={[
                      { nome: "Você", valor: dados.indicadores.total_servicos_especializados, cor: CORES.verdeEscuro },
                      { nome: "Média município", valor: parseFloat(dados.indicadores.media_servicos_mesmo_tipo_municipio), cor: CORES.verde },
                    ]}
                  />
                  <Insight tipo="servicos" valor={dados.indicadores.total_servicos_especializados} media={dados.indicadores.media_servicos_mesmo_tipo_municipio} />
                  <div className="flex items-center justify-between mt-3 pt-3 border-t" style={{ borderColor: "#e6f5ee" }}>
                    <span className="text-xs" style={{ color: CORES.neutro }}>Habilitações oficiais (grupo HB)</span>
                    <span className="text-lg font-extrabold" style={{ color: CORES.vermelho }}>{dados.indicadores.total_habilitacoes}</span>
                  </div>
                </Painel>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl p-5" style={{ border: "1px solid #d6e8e0" }}>
              <p className="text-sm" style={{ color: CORES.neutro }}>
                Este associado não possui estabelecimento de saúde cadastrado no CNES (código próprio) —
                provavelmente uma empresa prestadora de serviço ao setor (consultoria, locação, higienização,
                etc.), sem indicadores estruturais aplicáveis.
              </p>
            </div>
          )}
        </>
      )}

      <p className="text-xs text-center mt-6 leading-relaxed" style={{ color: CORES.neutro }}>
        Dados reais: identidade da base oficial do SINDHOSPE, estrutura do CNES/DATASUS.
      </p>
    </div>
  );
}
