"use client";

// Visão geral por setor (reunião de 28/10/2026, tarefas A6 e C):
// em vez de um panorama genérico de Pernambuco, mostra o SETOR do associado
// (hospital, clínica, diagnóstico...) no estado e entre os associados, e a
// representatividade separando associados com e sem leito. Tudo na mesma
// competência do CNES dos outros blocos.
import { useEffect, useState } from "react";
import { CORES, Card, CardTitle, getSessao } from "../components";
import { getSetores, getFichaCompleta } from "../dados";
import { mensagemAmigavel } from "../api-error";
import { Kpi } from "../blocos";
import { num, pct, mesAno } from "../formatos.mjs";

const p = (parte, todo) => (todo > 0 ? Math.round((parte * 1000) / todo) / 10 : 0);

function FaixaRepresentacao({ setores }) {
  const hosp = setores.categorias.reduce(
    (t, c) => ({ estado: t.estado + c.estado.leitos, associados: t.associados + c.associados.leitos }),
    { estado: 0, associados: 0 }
  );
  const a = setores.associados;
  return (
    <div
      className="rounded-xl px-5 py-6 mb-4 shadow-sm text-center"
      style={{ background: `linear-gradient(135deg, ${CORES.verdeEscuro}, ${CORES.verde})` }}
    >
      <p className="text-xs text-white/80 uppercase tracking-wide mb-1">Representação do SINDHOSPE em leitos</p>
      <p className="text-5xl font-bold text-white mb-1">{pct(p(hosp.associados, hosp.estado))}</p>
      <p className="text-sm text-white/90">
        dos {num(hosp.estado)} leitos de Pernambuco estão nos {num(a.com_leitos)} associados com leito
      </p>
      <div className="flex justify-center gap-6 mt-4 pt-4 border-t border-white/20 flex-wrap">
        {[
          [a.total, "associados"],
          [a.com_leitos, "com leito"],
          [a.sem_leitos, "sem leito (clínicas, diagnóstico etc.)"],
          [hosp.associados, "leitos nos associados"],
        ].map(([v, r]) => (
          <div key={r}>
            <p className="text-xl font-bold text-white">{num(v)}</p>
            <p className="text-xs text-white/80">{r}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function MeuSetor({ setor }) {
  const e = setor.estado;
  const a = setor.associados;
  const temLeitos = e.leitos > 0 && setor.codigo === "hospital";
  return (
    <Card>
      <CardTitle>Seu setor: {setor.label}</CardTitle>
      <div className="flex gap-3 flex-wrap">
        <Kpi rotulo="Estabelecimentos em PE" valor={num(e.estabelecimentos)} />
        <Kpi rotulo="Associados do SINDHOSPE" valor={num(a.estabelecimentos)} cor={CORES.verde} detalhe={`${pct(p(a.estabelecimentos, e.estabelecimentos))} do setor`} />
        {temLeitos ? (
          <Kpi rotulo="Leitos no setor" valor={num(e.leitos)} cor={CORES.dourado} detalhe={`${pct(p(a.leitos, e.leitos))} em associados`} />
        ) : (
          <Kpi rotulo="Equipamentos no setor" valor={num(e.equipamentos)} cor={CORES.dourado} detalhe={`${pct(p(a.equipamentos, e.equipamentos))} em associados`} />
        )}
        <Kpi rotulo="Profissionais no setor" valor={num(e.profissionais)} cor={CORES.vermelho} detalhe={`${pct(p(a.profissionais, e.profissionais))} em associados`} />
      </div>
    </Card>
  );
}

function TabelaSetores({ setores, destaque }) {
  const th = "text-left text-xs font-semibold px-2 py-2";
  const td = "px-2 py-2 text-sm whitespace-nowrap";
  return (
    <Card>
      <CardTitle>Pernambuco por setor</CardTitle>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead style={{ color: CORES.neutro, borderBottom: `2px solid ${CORES.verdeClaro}` }}>
            <tr>
              <th className={th}>Setor</th>
              <th className={th}>Estabelecimentos</th>
              <th className={th}>Associados</th>
              <th className={th}>Com leito</th>
              <th className={th}>Leitos (assoc./PE)</th>
              <th className={th}>Equipamentos (assoc./PE)</th>
              <th className={th}>Profissionais (assoc./PE)</th>
            </tr>
          </thead>
          <tbody>
            {setores.categorias.map((c) => (
              <tr
                key={c.codigo}
                style={{ borderBottom: `1px solid ${CORES.verdeClaro}`, background: c.codigo === destaque ? CORES.verdeClaro : "transparent" }}
              >
                <td className={`${td} font-semibold text-gray-900`}>{c.label}</td>
                <td className={td}>{num(c.estado.estabelecimentos)}</td>
                <td className={td}>{num(c.associados.estabelecimentos)}</td>
                <td className={td}>{num(c.associados.com_leitos)}</td>
                <td className={td}>{c.estado.leitos ? `${num(c.associados.leitos)} / ${num(c.estado.leitos)}` : "—"}</td>
                <td className={td}>{num(c.associados.equipamentos)} / {num(c.estado.equipamentos)}</td>
                <td className={td}>{num(c.associados.profissionais)} / {num(c.estado.profissionais)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs mt-3" style={{ color: CORES.neutro }}>
        Setores definidos pelo tipo de unidade do CNES. &quot;Outros&quot; reúne consultórios isolados, unidades públicas
        de atenção básica, farmácias e demais tipos. {setores.associados.sem_cadastro_cnes} associado(s) não aparecem na
        competência atual do CNES.
      </p>
    </Card>
  );
}

export default function VisaoGeralPage() {
  const [setores, setSetores] = useState(null);
  const [minhaCategoria, setMinhaCategoria] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    const sessao = getSessao();
    Promise.all([getSetores(), sessao?.cnes ? getFichaCompleta(sessao.cnes).catch(() => null) : null])
      .then(([s, ficha]) => {
        if (!s) throw new Error("Dados por setor ainda não foram importados.");
        setSetores(s);
        setMinhaCategoria(ficha?.atual?.categoria || null);
      })
      .catch((e) => setErro(mensagemAmigavel(e)))
      .finally(() => setCarregando(false));
  }, []);

  const meuSetor = setores?.categorias.find((c) => c.codigo === minhaCategoria);

  return (
    <div>
      {erro && (
        <div className="text-sm rounded-lg px-4 py-3 mb-4" style={{ background: CORES.vermelhoClaro, color: CORES.vermelho }}>
          {erro}
        </div>
      )}
      {carregando && <p className="text-sm text-gray-500 px-1">Carregando...</p>}

      {setores && !carregando && (
        <>
          <Card>
            <p className="text-lg font-semibold text-gray-900 mb-1">Seu setor em Pernambuco</p>
            <p className="text-xs text-gray-500">
              Dados públicos do CNES/DATASUS de {mesAno(setores.competencia)}, de todos os estabelecimentos de saúde do
              estado, comparados com os associados do SINDHOSPE.
            </p>
          </Card>
          {meuSetor && <MeuSetor setor={meuSetor} />}
          <FaixaRepresentacao setores={setores} />
          <TabelaSetores setores={setores} destaque={minhaCategoria} />
        </>
      )}
    </div>
  );
}
