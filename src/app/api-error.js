/**
 * Traduz erros de fetch para uma mensagem amigável.
 * Causa mais comum: backend indisponível (local ou na nuvem).
 */
import { API_URL } from "./components";

export function mensagemAmigavel(erro) {
  const msg = String(erro?.message || erro || "");
  const falhaRede =
    msg.includes("Failed to fetch") ||
    msg.includes("NetworkError") ||
    msg.includes("fetch failed") ||
    msg.includes("load failed") ||
    msg.includes("ECONNREFUSED");

  if (falhaRede) {
    const local = API_URL.includes("localhost");
    const dica = local
      ? "Provavelmente o backend não está rodando nesta máquina — inicie-o (veja o projeto do backend/ETL) e recarregue a página."
      : "O servidor pode estar iniciando (plano gratuito do Render) — aguarde alguns segundos e recarregue a página.";
    return `Não foi possível conectar ao servidor de dados (API em ${API_URL}). ${dica}`;
  }
  return msg || "Erro inesperado ao carregar os dados.";
}
