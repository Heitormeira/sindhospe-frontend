// Regras da busca do login — as mesmas do importador (sindhospe-backend/scripts/prefixos.js):
// minúsculas, sem acentos, pontuação separa palavras. O índice guarda os prefixos
// das frases que começam em cada palavra do nome; aqui o termo digitado vira uma
// frase no mesmo formato, para um array-contains exato.

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

/** Termo no formato do índice; null quando há menos de 2 caracteres úteis (não consulta). */
export function termoDeBusca(digitado) {
  const termo = palavras(digitado).join(" ");
  return termo.length >= 2 ? termo : null;
}
