/**
 * Traduz erros de fetch para uma mensagem amigável.
 * Causa mais comum neste projeto: backend (porta 3001) não está rodando.
 */
export function mensagemAmigavel(erro) {
  const msg = String(erro?.message || erro || "");
  const falhaRede =
    msg.includes("Failed to fetch") ||
    msg.includes("NetworkError") ||
    msg.includes("fetch failed") ||
    msg.includes("load failed") ||
    msg.includes("ECONNREFUSED");

  if (falhaRede) {
    return "Não foi possível conectar ao servidor de dados (API em http://localhost:3001). " +
      "Provavelmente o backend não está rodando nesta máquina — inicie-o (veja o projeto do backend/ETL) e recarregue a página.";
  }
  return msg || "Erro inesperado ao carregar os dados.";
}
