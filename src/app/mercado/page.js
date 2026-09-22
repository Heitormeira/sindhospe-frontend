"use client";

import { useEffect, useState } from "react";
import { API_URL, CORES, LinhaEvolucao, Card, CardTitle, formatCompetencia } from "../components";
import { mensagemAmigavel } from "../api-error";

export default function MercadoPage() {
  const [municipios, setMunicipios] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [municipioSelecionado, setMunicipioSelecionado] = useState("");
  const [tipoSelecionado, setTipoSelecionado] = useState("");
  const [serie, setSerie] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/api/municipios`).then((r) => r.json()),
      fetch(`${API_URL}/api/tipos`).then((r) => r.json()),
    ])
      .then(([listaMun, listaTipos]) => {
        if (!Array.isArray(listaMun) || !Array.isArray(listaTipos)) {
          throw new Error("Resposta inesperada do backend.");
        }
        setMunicipios(listaMun);
        setTipos(listaTipos);
        // Recife como padrão, se existir
        const recife = listaMun.find((m) => m.nome_municipio === "Recife");
        setMunicipioSelecionado(recife ? recife.codufmun : listaMun[0]?.codufmun || "");
        setTipoSelecionado(listaTipos[0]?.codigo || "");
      })
      .catch((e) => setErro(mensagemAmigavel(e)));
  }, []);

  useEffect(() => {
    if (!municipioSelecionado || !tipoSelecionado) return;
    setCarregando(true);
    setErro("");
    fetch(`${API_URL}/api/mercado?municipio=${municipioSelecionado}&tipo=${tipoSelecionado}`)
      .then((r) => r.json())
      .then((json) => {
        if (!Array.isArray(json)) throw new Error(json?.mensagem || "Resposta inesperada.");
        setSerie(json);
      })
      .catch((e) => setErro(mensagemAmigavel(e)))
      .finally(() => setCarregando(false));
  }, [municipioSelecionado, tipoSelecionado]);

  const nomeMunicipio = municipios.find((m) => m.codufmun === municipioSelecionado)?.nome_municipio || "";
  const nomeTipo = tipos.find((t) => t.codigo === tipoSelecionado)?.label || "";

  const primeira = serie && serie.length > 0 ? serie[0] : null;
  const ultima = serie && serie.length > 0 ? serie[serie.length - 1] : null;
  const variacaoTotal = primeira && ultima ? ultima.total - primeira.total : 0;

  return (
    <div>
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div>
          <label className="text-xs text-gray-500 block mb-1">Município</label>
          <select
            className="w-full text-sm rounded-lg px-3 py-2 bg-white text-gray-900 border border-gray-200 shadow-sm"
            value={municipioSelecionado}
            onChange={(e) => setMunicipioSelecionado(e.target.value)}
          >
            {municipios.map((m) => (
              <option key={m.codufmun} value={m.codufmun}>{m.nome_municipio}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Tipo de estabelecimento</label>
          <select
            className="w-full text-sm rounded-lg px-3 py-2 bg-white text-gray-900 border border-gray-200 shadow-sm"
            value={tipoSelecionado}
            onChange={(e) => setTipoSelecionado(e.target.value)}
          >
            {tipos.map((t) => (
              <option key={t.codigo} value={t.codigo}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>

      {erro && (
        <div className="text-sm rounded-lg px-4 py-3 mb-4" style={{ background: CORES.vermelhoClaro, color: CORES.vermelho }}>
          {erro}
        </div>
      )}

      {carregando && <p className="text-sm text-gray-500 px-1">Carregando...</p>}

      {serie && serie.length > 0 && !carregando && (
        <>
          <Card>
            <CardTitle>
              {nomeTipo} em {nomeMunicipio}
            </CardTitle>
            <p className="text-xs text-gray-500 mb-2">
              Número de estabelecimentos cadastrados, {formatCompetencia(primeira.competencia)} a{" "}
              {formatCompetencia(ultima.competencia)}
            </p>
            <LinhaEvolucao
              dados={serie}
              linhas={[
                { dataKey: "total", nome: "Total", cor: CORES.verdeEscuro },
                { dataKey: "total_sus", nome: "Com vínculo SUS", cor: CORES.vermelho },
              ]}
            />
            <div
              className="mt-3 rounded-lg px-3 py-2.5 text-sm"
              style={{
                background: variacaoTotal >= 0 ? CORES.verdeClaro : CORES.vermelhoClaro,
                color: variacaoTotal >= 0 ? CORES.verdeEscuro : CORES.vermelho,
              }}
            >
              Em {formatCompetencia(primeira.competencia)} havia <strong>{primeira.total}</strong>{" "}
              estabelecimentos desse tipo; em {formatCompetencia(ultima.competencia)} passou pra{" "}
              <strong>{ultima.total}</strong>
              {variacaoTotal !== 0 && (
                <> ({variacaoTotal > 0 ? "+" : ""}{variacaoTotal}).</>
              )}
              {variacaoTotal === 0 && <>.</>}
            </div>
          </Card>

          <Card>
            <CardTitle>Leitos médios por estabelecimento</CardTitle>
            <LinhaEvolucao
              dados={serie}
              linhas={[{ dataKey: "media_leitos", nome: "Média de leitos", cor: CORES.verde }]}
            />
          </Card>
        </>
      )}

      {serie && serie.length === 0 && !carregando && (
        <Card>
          <p className="text-sm text-gray-500">
            Nenhum estabelecimento desse tipo encontrado nesse município, nos períodos disponíveis.
          </p>
        </Card>
      )}

      <p className="text-xs text-gray-400 text-center mt-6 leading-relaxed">
        Dados agregados de TODOS os estabelecimentos de PE (não só associados do SINDHOSPE) — sem expor
        identidade individual, apenas contagens.
      </p>
    </div>
  );
}
