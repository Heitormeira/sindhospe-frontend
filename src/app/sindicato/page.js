"use client";

// Painel SINDHOSPE (reunião de 28/10/2026, tarefa C-1): "como está o comportamento
// total dos nossos associados?". Só a conta do sindicato lê sindicato/painel e os
// pedidos de revisão (regras do Firestore); associados são redirecionados.
import { useEffect, useMemo, useState } from "react";
import { CORES, Card, CardTitle, LinhaEvolucao, getSessao } from "../components";
import { getPainelSindicato, listarRevisoes } from "../dados";
import { mensagemAmigavel } from "../api-error";
import { Kpi, BarrasHorizontais } from "../blocos";
import { num, pct, mesAno } from "../formatos.mjs";

const CATEGORIAS = {
  hospital: "Hospital",
  clinica: "Clínica / ambulatório",
  diagnostico: "Diagnóstico e terapia (SADT)",
  domiciliar: "Atenção domiciliar",
  outros: "Outros",
};
const CADASTRO = {
  em_dia: { rotulo: "Em dia", cor: CORES.verde },
  desatualizado: { rotulo: "Desatualizado", cor: CORES.dourado },
  sem_data: { rotulo: "Sem data", cor: CORES.dourado },
  nao_encontrado: { rotulo: "Fora do CNES", cor: CORES.neutro },
};

function Resumo({ r }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
      <Kpi rotulo="Associados" valor={num(r.associados)} detalhe={`${num(r.filiados)} filiados`} />
      <Kpi rotulo="Com leito / sem leito" valor={`${num(r.com_leitos)} / ${num(r.sem_leitos)}`} cor={CORES.verde} detalhe={`${num(r.sem_cadastro_cnes)} fora do CNES atual`} />
      <Kpi rotulo="Leitos nos associados" valor={num(r.leitos_associados)} cor={CORES.dourado} detalhe={`${pct(r.percentual_leitos)} dos ${num(r.leitos_estado)} de PE · ${num(r.leitos_sus_associados)} SUS`} />
      <Kpi rotulo="Equipamentos / vínculos de profissionais" valor={`${num(r.equipamentos_associados)} / ${num(r.profissionais_associados)}`} cor={CORES.vermelho} />
    </div>
  );
}

function Alertas({ r }) {
  return (
    <Card>
      <CardTitle>O que o sindicato pode fazer agora</CardTitle>
      <ul className="text-sm space-y-2" style={{ color: CORES.verdeEscuro }}>
        <li>
          ⚠️ <strong>{num(r.cadastros_desatualizados)}</strong> associados não atualizam o cadastro no CNES há mais de 6
          meses. Cadastro desatualizado pode atrapalhar contratos com planos de saúde.
        </li>
        <li>
          📄 <strong>{num(r.sem_licenca_informada)}</strong> associados não informam licença sanitária no CNES.
        </li>
        <li>
          🔎 <strong>{num(r.sem_cadastro_cnes)}</strong> associados não aparecem na competência atual do CNES (código
          próprio do sindicato ou cadastro desativado).
        </li>
      </ul>
      <p className="text-xs mt-3" style={{ color: CORES.neutro }}>Filtre a lista abaixo por &quot;Situação do cadastro&quot; para ver quem são.</p>
    </Card>
  );
}

function Setores({ setores }) {
  const th = "text-left text-xs font-semibold px-2 py-2";
  const td = "px-2 py-2 text-sm whitespace-nowrap";
  const p = (a, b) => (b ? pct(Math.round((a * 1000) / b) / 10) : "—");
  return (
    <Card>
      <CardTitle>Associados × Pernambuco por setor</CardTitle>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead style={{ color: CORES.neutro, borderBottom: `2px solid ${CORES.verdeClaro}` }}>
            <tr>
              <th className={th}>Setor</th>
              <th className={th}>Associados</th>
              <th className={th}>% dos estab. de PE</th>
              <th className={th}>Leitos (assoc.)</th>
              <th className={th}>% dos leitos de PE</th>
              <th className={th}>Equipamentos (assoc.)</th>
              <th className={th}>Vínculos de profis. (assoc.)</th>
            </tr>
          </thead>
          <tbody>
            {setores.map((c) => (
              <tr key={c.codigo} style={{ borderBottom: `1px solid ${CORES.verdeClaro}` }}>
                <td className={`${td} font-semibold text-gray-900`}>{c.label}</td>
                <td className={td}>{num(c.associados.estabelecimentos)}</td>
                <td className={td}>{p(c.associados.estabelecimentos, c.estado.estabelecimentos)}</td>
                <td className={td}>{c.estado.leitos ? num(c.associados.leitos) : "—"}</td>
                <td className={td}>{c.estado.leitos ? p(c.associados.leitos, c.estado.leitos) : "—"}</td>
                <td className={td}>{num(c.associados.equipamentos)}</td>
                <td className={td}>{num(c.associados.profissionais)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function ListaAssociados({ lista }) {
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState("");
  const [cadastro, setCadastro] = useState("");
  const filtrada = useMemo(() => {
    const t = busca.trim().toLowerCase();
    return lista.filter(
      (x) =>
        (!t || (x.nome || "").toLowerCase().includes(t) || x.cnes.includes(t)) &&
        (!categoria || x.categoria === categoria) &&
        (!cadastro || x.cadastro === cadastro || (cadastro === "sem_licenca" && !x.licenca && x.cadastro !== "nao_encontrado"))
    );
  }, [lista, busca, categoria, cadastro]);
  const campo = "text-sm rounded-lg px-3 py-2 bg-white text-gray-900 border border-gray-200";
  const th = "text-left text-xs font-semibold px-2 py-2";
  const td = "px-2 py-2 text-sm";

  return (
    <Card>
      <CardTitle>Associados ({num(filtrada.length)} de {num(lista.length)})</CardTitle>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
        <input aria-label="Buscar por nome ou CNES" className={campo} placeholder="Buscar por nome ou CNES" value={busca} onChange={(e) => setBusca(e.target.value)} />
        <select aria-label="Setor" className={campo} value={categoria} onChange={(e) => setCategoria(e.target.value)}>
          <option value="">Todos os setores</option>
          {Object.entries(CATEGORIAS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <select aria-label="Situação do cadastro" className={campo} value={cadastro} onChange={(e) => setCadastro(e.target.value)}>
          <option value="">Toda situação de cadastro</option>
          {Object.entries(CADASTRO).map(([k, v]) => (
            <option key={k} value={k}>{v.rotulo}</option>
          ))}
          <option value="sem_licenca">Sem licença sanitária informada</option>
        </select>
      </div>
      <div className="overflow-x-auto max-h-[560px] overflow-y-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-white" style={{ color: CORES.neutro, borderBottom: `2px solid ${CORES.verdeClaro}` }}>
            <tr>
              <th className={th}>Estabelecimento</th>
              <th className={th}>Setor</th>
              <th className={th}>Município</th>
              <th className={th}>Leitos</th>
              <th className={th}>Equip.</th>
              <th className={th}>Profis.</th>
              <th className={th}>Cadastro CNES</th>
              <th className={th}>Licença</th>
            </tr>
          </thead>
          <tbody>
            {filtrada.map((x) => {
              const c = CADASTRO[x.cadastro] || CADASTRO.sem_data;
              return (
                <tr key={x.cnes} style={{ borderBottom: `1px solid ${CORES.verdeClaro}` }}>
                  <td className={td}>
                    <span className="font-semibold text-gray-900">{x.nome || "(sem nome)"}</span>
                    <span className="block text-xs" style={{ color: CORES.neutro }}>CNES {x.cnes} · {x.situacao}</span>
                  </td>
                  <td className={td}>{CATEGORIAS[x.categoria]}</td>
                  <td className={td}>{x.municipio || "—"}</td>
                  <td className={td}>{x.leitos ? num(x.leitos) : "—"}</td>
                  <td className={td}>{num(x.equipamentos)}</td>
                  <td className={td}>{num(x.profissionais)}</td>
                  <td className={td}>
                    <span className="font-semibold" style={{ color: c.cor }}>{c.rotulo}</span>
                    {x.ultima_atualizacao && <span className="block text-xs" style={{ color: CORES.neutro }}>{mesAno(x.ultima_atualizacao)}</span>}
                  </td>
                  <td className={td}>{x.cadastro === "nao_encontrado" ? "—" : x.licenca ? "✓" : <span style={{ color: CORES.dourado }}>Não informada</span>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function Revisoes() {
  const [itens, setItens] = useState(null);
  const [erro, setErro] = useState("");
  useEffect(() => {
    listarRevisoes()
      .then(setItens)
      .catch((e) => setErro(mensagemAmigavel(e)));
  }, []);
  return (
    <Card>
      <CardTitle>Pedidos de revisão dos associados</CardTitle>
      {erro && <p className="text-sm" style={{ color: CORES.vermelho }}>{erro}</p>}
      {!erro && !itens && <p className="text-sm" style={{ color: CORES.neutro }}>Carregando...</p>}
      {itens && itens.length === 0 && <p className="text-sm" style={{ color: CORES.neutro }}>Nenhum pedido recebido.</p>}
      {itens && itens.length > 0 && (
        <ul className="divide-y" style={{ borderColor: CORES.verdeClaro }}>
          {itens.map((r) => (
            <li key={r.id} className="py-2.5 text-sm">
              <div className="flex justify-between gap-2 flex-wrap">
                <span className="font-semibold text-gray-900">{r.nome} <span className="font-normal" style={{ color: CORES.neutro }}>(CNES {r.cnes})</span></span>
                <span className="text-xs" style={{ color: CORES.neutro }}>{r.criado_em ? r.criado_em.toLocaleString("pt-BR") : ""}</span>
              </div>
              <p className="text-gray-800 mt-0.5">{r.mensagem || <em style={{ color: CORES.neutro }}>(sem mensagem)</em>}</p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

export default function SindicatoPage() {
  const [painel, setPainel] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (getSessao()?.perfil !== "sindicato") {
      setCarregando(false);
      return;
    }
    getPainelSindicato()
      .then((p) => {
        if (!p) throw new Error("O painel do sindicato ainda não foi importado.");
        setPainel(p);
      })
      .catch((e) => setErro(mensagemAmigavel(e)))
      .finally(() => setCarregando(false));
  }, []);

  return (
    <div>
      <div className="mb-4">
        <p className="text-xs font-semibold" style={{ color: CORES.verde }}>Painel SINDHOSPE</p>
        <p className="text-2xl font-extrabold text-gray-900">Como estão os nossos associados</p>
        {painel && (
          <p className="text-xs mt-1" style={{ color: CORES.neutro }}>
            CNES/DATASUS de {mesAno(painel.competencia)} cruzado com a base de associados do SINDHOSPE.
          </p>
        )}
      </div>
      {erro && (
        <div className="text-sm rounded-lg px-4 py-3 mb-4" style={{ background: CORES.vermelhoClaro, color: CORES.vermelho }}>
          {erro}
        </div>
      )}
      {carregando && <p className="text-sm px-1" style={{ color: CORES.neutro }}>Carregando...</p>}

      {painel && !carregando && (
        <>
          <Resumo r={painel.resumo} />
          <Alertas r={painel.resumo} />
          <Setores setores={painel.setores} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-white rounded-xl p-5" style={{ border: "1px solid #d6e8e0" }}>
              <p className="text-sm font-bold text-gray-900 mb-2">Leitos dos associados ao longo do tempo</p>
              <LinhaEvolucao dados={painel.evolucao_leitos} linhas={[{ dataKey: "associados", nome: "Associados", cor: CORES.verdeEscuro }]} />
              <p className="text-xs mt-2" style={{ color: CORES.neutro }}>Associados atuais, em cada competência do CNES.</p>
            </div>
            <div className="bg-white rounded-xl p-5" style={{ border: "1px solid #d6e8e0" }}>
              <p className="text-sm font-bold text-gray-900 mb-3">Equipamentos mais comuns nos associados</p>
              <BarrasHorizontais cor={CORES.verdeEscuro} limite={10} itens={painel.equipamentos_associados.map((e) => ({ nome: e.label, valor: e.quantidade }))} />
            </div>
          </div>
          <ListaAssociados lista={painel.lista} />
          <Revisoes />
        </>
      )}
    </div>
  );
}
