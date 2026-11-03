"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CORES, Card, CardTitle, Servico, getSessao } from "../components";
import { getFichaCompleta, solicitarRevisao } from "../dados";
import { mensagemAmigavel } from "../api-error";
import { textoCadastro, dataBr, mesAno } from "../formatos.mjs";

const COR_TOM = { ok: CORES.verde, atencao: CORES.dourado, neutro: CORES.neutro };

// Situação do cadastro no CNES (reunião de 28/10, tarefa A5): data em que o próprio
// estabelecimento atualizou a ficha, separada da competência mensal do sistema.
function CadastroCnes({ atual }) {
  const t = textoCadastro(atual?.cadastro);
  const cor = COR_TOM[t.tom];
  return (
    <Card>
      <CardTitle>Situação do cadastro no CNES</CardTitle>
      <div className="flex items-start gap-3 flex-wrap">
        <span className="text-sm font-bold px-3 py-1 rounded-md" style={{ background: `${cor}1f`, color: cor, border: `1px solid ${cor}` }}>
          {t.rotulo}
        </span>
        <p className="text-sm text-gray-800 flex-1 min-w-[220px]">{t.detalhe}</p>
      </div>
      <ul className="divide-y divide-gray-100 text-sm mt-3">
        <LinhaDado label="Última atualização do cadastro" valor={mesAno(atual?.cadastro?.ultima_atualizacao)} />
        <LinhaDado label="Competência do CNES usada no portal" valor={mesAno(atual?.competencia)} />
      </ul>
      <p className="text-xs text-gray-400 mt-2">
        O sistema do CNES é publicado todo mês; a data acima é a última vez que o estabelecimento atualizou a própria
        ficha. O portal considera &quot;em dia&quot; uma atualização feita nos últimos 6 meses. Quem atende planos de saúde
        precisa manter o cadastro atualizado. Para corrigir, use o CNESWeb (Consultas → Estabelecimentos).
      </p>
    </Card>
  );
}

// Licença sanitária como informada no CNES. A conferência com a APEVISA/vigilância
// municipal depende de dados que ainda não são públicos (ver docs/projeto/pesquisa-fontes.md).
function LicencaSanitaria({ atual }) {
  const l = atual?.cadastro?.licenca;
  return (
    <Card>
      <CardTitle>Licença sanitária informada no CNES</CardTitle>
      {l ? (
        <ul className="divide-y divide-gray-100 text-sm">
          <LinhaDado label="Número do alvará/licença" valor={l.numero} />
          <LinhaDado label="Data de expedição" valor={dataBr(l.expedicao)} />
          <LinhaDado label="Órgão expedidor" valor={l.orgao} />
        </ul>
      ) : (
        <p className="text-sm" style={{ color: COR_TOM.atencao }}>
          Nenhuma licença sanitária informada no cadastro do CNES. Se o estabelecimento tem alvará, vale incluir o número
          no CNES.
        </p>
      )}
      <p className="text-xs text-gray-400 mt-2">
        Estes são os dados que o próprio estabelecimento declarou ao CNES. O portal ainda não confere a validade com a
        APEVISA ou com a vigilância sanitária municipal.
      </p>
    </Card>
  );
}

export default function PerfilPage() {
  const router = useRouter();
  const [sessao, setSessao] = useState(null);
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [mensagemRevisao, setMensagemRevisao] = useState("");
  const [enviandoRevisao, setEnviandoRevisao] = useState(false);
  const [revisaoEnviada, setRevisaoEnviada] = useState(false);

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
    getFichaCompleta(sessao.cnes)
      .then((json) => setDados(json))
      .catch((e) => setErro(mensagemAmigavel(e)))
      .finally(() => setCarregando(false));
  }, [sessao]);

  async function enviarRevisao(e) {
    e.preventDefault();
    setEnviandoRevisao(true);
    try {
      await solicitarRevisao({ cnes: sessao.cnes, nome: sessao.nome, mensagem: mensagemRevisao });
      setRevisaoEnviada(true);
    } catch (e) {
      console.error("Solicitação de revisão falhou:", e);
      setErro("Não foi possível enviar a solicitação agora.");
    } finally {
      setEnviandoRevisao(false);
    }
  }

  if (!sessao) return null;
  const temDadosCnes = dados && dados.estrutura !== null;
  const est = dados?.atual?.estrutura;
  const simNao = (v) => (v ? "1" : "0");

  return (
    <div>
      {erro && (
        <div className="text-sm rounded-lg px-4 py-3 mb-4" style={{ background: CORES.vermelhoClaro, color: CORES.vermelho }}>
          {erro}
        </div>
      )}
      {carregando && <p className="text-sm text-gray-500 px-1">Carregando...</p>}

      {dados && !carregando && (
        <>
          <Card>
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <p className="text-xs mb-0.5" style={{ color: CORES.verde }}>Perfil do estabelecimento</p>
                <p className="text-lg font-semibold text-gray-900">{dados.identidade.nome_fantasia}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Dados do CNES de {mesAno(dados.atual?.competencia)}
                </p>
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-md" style={{ background: CORES.verdeClaro, color: CORES.verdeEscuro }}>
                {dados.identidade.situacao}
              </span>
            </div>
          </Card>

          <Card>
            <CardTitle>Dados cadastrais (CNES)</CardTitle>
            {temDadosCnes ? (
              <ul className="divide-y divide-gray-100 text-sm">
                <LinhaDado label="Tipo de estabelecimento" valor={dados.estrutura.tp_unid_label} />
                <LinhaDado label="Natureza jurídica" valor={`Código ${dados.estrutura.nat_jur}`} />
                <LinhaDado label="Código CNES" valor={dados.identidade.cnes} />
                <LinhaDado label="CNPJ" valor={dados.identidade.cnpj} />
                <LinhaDado label="Registro SINDHOSPE" valor={`nº ${dados.identidade.registro}`} />
              </ul>
            ) : (
              <p className="text-sm text-gray-500">Sem código CNES próprio — dados cadastrais não disponíveis nessa fonte.</p>
            )}
          </Card>

          <CadastroCnes atual={dados.atual} />
          {dados.atual?.cadastro?.encontrado && <LicencaSanitaria atual={dados.atual} />}

          <Card>
            <CardTitle>Localização</CardTitle>
            {temDadosCnes ? (
              <ul className="divide-y divide-gray-100 text-sm">
                <LinhaDado label="Município" valor={`${dados.atual?.municipio?.nome || dados.estrutura.municipio_nome}/PE`} />
                <LinhaDado label="Endereço completo" valor="Não disponível nesta base" indisponivel />
                <LinhaDado label="CEP" valor="Não disponível nesta base" indisponivel />
              </ul>
            ) : (
              <p className="text-sm text-gray-500">Não disponível — sem código CNES.</p>
            )}
            <p className="text-xs text-gray-400 mt-2">
              O arquivo do CNES usado aqui traz só o código do município, não o endereço completo (rua/CEP) —
              precisaria de uma fonte adicional para completar isso.
            </p>
          </Card>

          {est && (
            <Card>
              <CardTitle>Serviços habilitados</CardTitle>
              <ul className="divide-y divide-gray-100 text-sm">
                <Servico nome="Urgência/Emergência" valor={simNao(est.urgencia)} cores={CORES} />
                <Servico nome="Centro cirúrgico" valor={simNao(est.centro_cirurgico)} cores={CORES} />
                <Servico nome="Centro obstétrico" valor={simNao(est.centro_obstetrico)} cores={CORES} />
                <Servico nome="Atendimento ambulatorial" valor={simNao(est.ambulatorio)} cores={CORES} />
              </ul>
              <div className="mt-2 pt-2 border-t border-gray-100 text-sm">
                <p className="text-gray-600 mb-1.5">
                  Serviços especializados cadastrados no CNES ({dados.atual?.servicos?.length ?? 0})
                </p>
                <ul className="space-y-1">
                  {(dados.atual?.servicos || []).map((s) => (
                    <li key={s.codigo} className="text-gray-900">• {s.label}</li>
                  ))}
                </ul>
              </div>
            </Card>
          )}

          <Card>
            <CardTitle>Divergências ou dados desatualizados?</CardTitle>
            {revisaoEnviada ? (
              <p className="text-sm" style={{ color: CORES.verdeEscuro }}>
                ✓ Solicitação enviada! O SINDHOSPE foi notificado e vai revisar os dados com o DATASUS/CNES.
              </p>
            ) : (
              <form onSubmit={enviarRevisao} className="space-y-2">
                <p className="text-sm text-gray-600">
                  Se algum dado ficar estranho ou incorreto, avisa o SINDHOSPE — ele solicita revisão junto ao
                  DATASUS/CNES.
                </p>
                <textarea
                  value={mensagemRevisao}
                  onChange={(e) => setMensagemRevisao(e.target.value)}
                  placeholder="Descreva o que está incorreto ou desatualizado (opcional)"
                  className="w-full text-sm rounded-lg px-3 py-2 bg-white text-gray-900 border border-gray-200"
                  rows={3}
                />
                <button
                  type="submit"
                  disabled={enviandoRevisao}
                  className="w-full text-sm font-semibold rounded-lg py-2.5 text-white disabled:opacity-50"
                  style={{ background: `linear-gradient(135deg, ${CORES.verdeEscuro}, ${CORES.verde})` }}
                >
                  {enviandoRevisao ? "Enviando..." : "Solicitar revisão"}
                </button>
              </form>
            )}
          </Card>
        </>
      )}
    </div>
  );
}

function LinhaDado({ label, valor, indisponivel }) {
  return (
    <li className="flex items-center justify-between py-2.5">
      <span className="text-gray-500">{label}</span>
      <span className={indisponivel ? "text-gray-400 italic text-xs" : "text-gray-900 font-medium text-right"}>
        {valor}
      </span>
    </li>
  );
}
