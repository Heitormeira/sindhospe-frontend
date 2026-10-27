// Regras da busca do login — as mesmas do importador (sindhospe-backend/scripts/prefixos.js):
// minúsculas, sem acentos, pontuação separa palavras.

export function normalizar(texto) {
  return String(texto || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

export function palavras(texto) {
  return normalizar(texto).split(/[^a-z0-9]+/).filter(Boolean);
}

/**
 * Como consultar o índice `busca`: a palavra mais longa vai para o Firestore
 * (array-contains em `prefixos`), as demais filtram os resultados no navegador.
 * Devolve null quando não há palavra com 2+ letras (não consulta nada).
 */
export function planoDeBusca(q) {
  const lista = palavras(q);
  if (lista.length === 0) return null;
  const consulta = lista.reduce((maior, p) => (p.length > maior.length ? p : maior), "");
  if (consulta.length < 2) return null;
  const filtros = [...lista];
  filtros.splice(lista.indexOf(consulta), 1);
  return { consulta, filtros };
}

/** O nome atende a todos os filtros (cada filtro é início de alguma palavra do nome)? */
export function atendeFiltros(nome, filtros) {
  const doNome = palavras(nome);
  return filtros.every((f) => doNome.some((p) => p.startsWith(f)));
}
