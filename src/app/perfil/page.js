"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL, CORES, Card, CardTitle, Servico, getSessao } from "../components";

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
    fetch(`${API_URL}/api/estabelecimento/${sessao.cnes}`)
      .then((r) => r.json())
      .then((json) => setDados(json))
      .catch((e) => setErro(e.message))
      .finally(() => setCarregando(false));
  }, [sessao]);

  async function enviarRevisao(e) {
    e.preventDefault();
    setEnviandoRevisao(true);
    try {
      const r = await fetch(`${API_URL}/api/solicitar-revisao`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cnes: sessao.cnes, nome: sessao.nome, mensagem: mensagemRevisao }),
      });
      if (!r.ok) throw new Error("Falha ao enviar.");
      setRevisaoEnviada(true);
    } catch (e) {
      setErro("Não foi possível enviar a solicitação agora.");
    } finally {
      setEnviandoRevisao(false);
    }
  }

  if (!sessao) return null;
  const temDadosCnes = dados && dados.estrutura !== null;

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
                  Atualizado em {new Date().toLocaleDateString("pt-BR")}
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

          <Card>
            <CardTitle>Localização</CardTitle>
            {temDadosCnes ? (
              <ul className="divide-y divide-gray-100 text-sm">
                <LinhaDado label="Município" valor={`${dados.estrutura.municipio_nome}/PE`} />
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

          <Card>
            <CardTitle>Responsáveis</CardTitle>
            <p className="text-sm text-gray-500">
              Não disponível — o CNES não expõe nome de diretor técnico/administrativo nos arquivos públicos que
              usamos. Precisaria ser preenchido manualmente pelo associado ou pelo SINDHOSPE.
            </p>
          </Card>

          {temDadosCnes && (
            <Card>
              <CardTitle>Serviços habilitados</CardTitle>
              <ul className="divide-y divide-gray-100 text-sm">
                <Servico nome="Urgência/Emergência" valor={dados.estrutura.tem_urgencia} cores={CORES} />
                <Servico nome="Centro cirúrgico" valor={dados.estrutura.tem_centro_cirurgico} cores={CORES} />
                <Servico nome="Centro obstétrico" valor={dados.estrutura.tem_centro_obstetrico} cores={CORES} />
                <Servico nome="Atendimento ambulatorial" valor={dados.estrutura.tem_atend_ambulatorial} cores={CORES} />
              </ul>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 text-sm">
                <span className="text-gray-600">Outros serviços especializados cadastrados (CNES)</span>
                <span className="font-bold" style={{ color: CORES.verdeEscuro }}>{dados.indicadores.total_servicos_especializados}</span>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Nome por extenso de cada serviço ainda não disponível — sem tabela de tradução pública
                consolidada pro código do CNES (mostrando só a contagem por enquanto).
              </p>
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
