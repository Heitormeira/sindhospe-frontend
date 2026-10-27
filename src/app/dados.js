"use client";

// Camada de dados: uma função por rota da antiga API Express, devolvendo o
// MESMO formato de JSON (os documentos foram gerados com as mesmas consultas).
import { collection, doc, getDoc, getDocs, query, where, limit, addDoc, serverTimestamp } from "firebase/firestore";
import { obterDb } from "./firebase";
import { termoDeBusca } from "./busca.mjs";

const LIMITE_BUSCA = 8; // as regras do Firestore recusam consultas maiores

async function ler(caminho) {
  const snap = await getDoc(doc(obterDb(), caminho));
  return snap.exists() ? snap.data() : null;
}

// GET /api/estabelecimentos/buscar?q=
// O filtro inteiro roda no Firestore (array-contains da frase digitada), então o
// limite de 8 vale para resultados que já casam — como o LIMIT 8 da API.
export async function buscarEstabelecimentos(q) {
  const termo = termoDeBusca(q);
  if (!termo) return [];
  const snap = await getDocs(
    query(collection(obterDb(), "busca"), where("prefixos", "array-contains", termo), limit(LIMITE_BUSCA))
  );
  return snap.docs
    .map((d) => ({ cnes: d.id, nome_fantasia: d.data().nome_fantasia }))
    .sort((a, b) => a.nome_fantasia.localeCompare(b.nome_fantasia, "pt-BR"));
}

// GET /api/estabelecimento/:cnes
export async function getEstabelecimento(cnes) {
  const dados = await ler(`associados/${cnes}`);
  if (!dados) throw new Error("Estabelecimento não encontrado na base de identidade.");
  const { evolucao, ...ficha } = dados;
  return ficha;
}

// GET /api/evolucao/:cnes
export async function getEvolucao(cnes) {
  const dados = await ler(`associados/${cnes}`);
  return dados?.evolucao || [];
}

// GET /api/mercado?tipo=&municipio=  (município vazio = Pernambuco inteiro)
export async function getMercado(tipo, municipio = "") {
  const dados = await ler(`mercado/${tipo}_${municipio || "PE"}`);
  return dados?.serie || []; // combinação sem estabelecimentos: série vazia, como a API
}

export const getMunicipios = async () => (await ler("publico/municipios"))?.lista || [];
export const getTipos = async () => (await ler("publico/tipos"))?.lista || [];
export const getVisaoGeral = () => ler("publico/visao-geral");
export const getRepresentatividade = () => ler("publico/representatividade");

// POST /api/solicitar-revisao
export async function solicitarRevisao({ cnes, nome, mensagem }) {
  const pedido = { cnes, nome, criado_em: serverTimestamp() };
  if (mensagem && mensagem.trim()) pedido.mensagem = mensagem.trim();
  await addDoc(collection(obterDb(), "solicitacoes_revisao"), pedido);
}
