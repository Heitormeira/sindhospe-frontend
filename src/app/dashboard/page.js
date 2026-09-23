"use client";

import { useEffect, useState } from "react";
import { API_URL, CORES, ComparativoBarras, Servico, Card, CardTitle, Insight } from "../components";

export default function DashboardPage() {
  const [estabelecimentos, setEstabelecimentos] = useState([]);
  const [cnesSelecionado, setCnesSelecionado] = useState("");
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/api/estabelecimentos`)
      .then((r) => r.json())
      .then((lista) => {
        if (!Array.isArray(lista)) throw new Error(lista?.mensagem || "Resposta inesperada do backend.");
        setEstabelecimentos(lista);
        if (lista.length > 0) setCnesSelecionado(lista[0].cnes);
      })
      .catch((e) => setErro(`Não foi possível carregar a lista de estabelecimentos: ${e.message}`));
  }, []);

  useEffect(() => {
    if (!cnesSelecionado) return;
    setCarregando(true);
    setErro("");
    fetch(`${API_URL}/api/estabelecimento/${cnesSelecionado}`)
      .then((r) => {
        if (!r.ok) throw new Error("Estabelecimento não encontrado.");
        return r.json();
      })
      .then((json) => setDados(json))
      .catch((e) => setErro(e.message))
      .finally(() => setCarregando(false));
  }, [cnesSelecionado]);

  const temDadosCnes = dados && dados.estrutura !== null;

  const semLeitosAplicavel =
    temDadosCnes && dados.estrutura.leitos_totais === 0 && parseFloat(dados.comparativo.estado.media_leitos) < 1;

  return (
    <div>
      <div className="mb-4">
        <label className="text-xs text-gray-500 block mb-1">Você está logado como</label>
        <select
          className="w-full text-sm rounded-lg px-3 py-2 bg-white text-gray-900 border border-gray-200 shadow-sm"
          value={cnesSelecionado}
          onChange={(e) => setCnesSelecionado(e.target.value)}
        >
          {estabelecimentos.map((e) => (
            <option key={e.cnes} value={e.cnes} className="text-gray-900 bg-white">
              {e.nome_fantasia}
            </option>
          ))}
        </select>
      </div>

      {erro && (
        <div
          className="text-sm rounded-lg px-4 py-3 mb-4"
          style={{ background: CORES.vermelhoClaro, color: CORES.vermelho, border: `0.5px solid ${CORES.vermelho}33` }}
        >
          {erro}
        </div>
      )}

      {carregando && <p className="text-sm text-gray-500 px-1">Carregando...</p>}

      {dados && !carregando && (
        <>
          <Card>
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <p className="text-xs mb-0.5" style={{ color: CORES.verde }}>Meu estabelecimento</p>
                <p className="text-lg font-semibold text-gray-900">{dados.identidade.nome_fantasia}</p>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  {temDadosCnes ? (
                    <>CNES {dados.identidade.cnes} &middot; {dados.estrutura.municipio_nome}/PE<br /></>
                  ) : null}
                  CNPJ {dados.identidade.cnpj}<br />
                  Registro SINDHOSPE nº {dados.identidade.registro}
                </p>
              </div>
              <span
                className="text-xs font-semibold px-3 py-1 rounded-md"
                style={{ background: CORES.verdeClaro, color: CORES.verdeEscuro }}
              >
                {dados.identidade.situacao}
              </span>
            </div>
          </Card>

          {temDadosCnes ? (
          <>
          <Card>
            <CardTitle>Capacidade física — leitos totais</CardTitle>
            {semLeitosAplicavel ? (
              <p className="text-sm text-gray-500 py-2">
                Estabelecimentos do tipo "{dados.estrutura.tp_unid_label}" normalmente não possuem leitos
                cadastrados no CNES — esse indicador não se aplica aqui.
              </p>
            ) : (
              <>
                <ComparativoBarras
                  dados={[
                    { nome: "Você", valor: dados.estrutura.leitos_totais, cor: CORES.verdeEscuro },
                    { nome: "Município", valor: parseFloat(dados.comparativo.municipio.media_leitos), cor: CORES.verde },
                    { nome: "Pernambuco", valor: parseFloat(dados.comparativo.estado.media_leitos), cor: CORES.vermelho },
                  ]}
                />
                <p className="text-xs text-gray-400 mt-2">
                  Município: {dados.comparativo.municipio.total_estabelecimentos_mesmo_tipo} estab. do tipo "
                  {dados.estrutura.tp_unid_label}" &middot; Estado: {dados.comparativo.estado.total_estabelecimentos_mesmo_tipo} estab.
                </p>
                <Insight
                  tipo="leitos"
                  valor={dados.estrutura.leitos_totais}
                  media={dados.comparativo.estado.media_leitos}
                />

                {(dados.estrutura.leitos_complementares > 0 || parseFloat(dados.comparativo.estado.media_complementares) > 0.3) && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-2">
                      Leitos complementares (UTI adulto/neonatal/pediátrica, isolamento e afins)
                    </p>
                    <ComparativoBarras
                      dados={[
                        { nome: "Você", valor: dados.estrutura.leitos_complementares, cor: CORES.verdeEscuro },
                        { nome: "Município", valor: parseFloat(dados.comparativo.municipio.media_complementares), cor: CORES.verde },
                        { nome: "Pernambuco", valor: parseFloat(dados.comparativo.estado.media_complementares), cor: CORES.vermelho },
                      ]}
                    />
                    <Insight
                      tipo="complementares"
                      valor={dados.estrutura.leitos_complementares}
                      media={dados.comparativo.estado.media_complementares}
                    />
                  </div>
                )}
              </>
            )}
          </Card>

          <Card>
            <CardTitle>Serviços especializados</CardTitle>
            <ComparativoBarras
              dados={[
                { nome: "Você", valor: dados.indicadores.total_servicos_especializados, cor: CORES.verdeEscuro },
                { nome: "Média município", valor: parseFloat(dados.indicadores.media_servicos_mesmo_tipo_municipio), cor: CORES.verde },
              ]}
            />
            <Insight
              tipo="servicos"
              valor={dados.indicadores.total_servicos_especializados}
              media={dados.indicadores.media_servicos_mesmo_tipo_municipio}
            />
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
              <span className="text-xs text-gray-500">Habilitações oficiais (grupo HB)</span>
              <span className="text-lg font-bold" style={{ color: CORES.vermelho }}>{dados.indicadores.total_habilitacoes}</span>
            </div>
            <p className="text-xs text-gray-400 mt-3">
              Contagem de códigos distintos do CNES (grupos SR e HB). Nomes legíveis de cada serviço
              ainda não disponíveis — depende de uma tabela de tradução que não encontramos publicada
              de forma consolidada.
            </p>
          </Card>

          <Card>
            <CardTitle>Vínculo com o SUS</CardTitle>
            <ul className="divide-y divide-gray-100 text-sm">
              <Servico nome="Possui vínculo com o SUS" valor={dados.estrutura.aceita_sus} cores={CORES} />
            </ul>
          </Card>

          <Card>
            <CardTitle>Serviços disponíveis</CardTitle>
            <ul className="divide-y divide-gray-100 text-sm">
              <Servico nome="Urgência/Emergência" valor={dados.estrutura.tem_urgencia} cores={CORES} />
              <Servico nome="Centro cirúrgico" valor={dados.estrutura.tem_centro_cirurgico} cores={CORES} />
              <Servico nome="Centro obstétrico" valor={dados.estrutura.tem_centro_obstetrico} cores={CORES} />
              <Servico nome="Atendimento ambulatorial" valor={dados.estrutura.tem_atend_ambulatorial} cores={CORES} />
            </ul>
          </Card>
          </>
          ) : (
            <Card>
              <p className="text-sm text-gray-600">
                Este associado não possui estabelecimento de saúde cadastrado no CNES (código próprio) —
                provavelmente uma empresa prestadora de serviço ao setor (consultoria, locação, higienização,
                etc.), sem indicadores estruturais aplicáveis.
              </p>
            </Card>
          )}
        </>
      )}

      <p className="text-xs text-gray-400 text-center mt-6 leading-relaxed">
        Dados reais: identidade da base oficial do SINDHOSPE, estrutura do CNES/DATASUS.
      </p>
    </div>
  );
}
