/**
 * Traduz erros do Firebase (e de rede) para mensagens em português.
 */
const MENSAGENS = {
  "auth/invalid-credential": "Senha incorreta.",
  "auth/wrong-password": "Senha incorreta.",
  "auth/user-not-found": "Senha incorreta.",
  "auth/invalid-login-credentials": "Senha incorreta.",
  "auth/user-disabled": "O acesso deste estabelecimento está desativado. Fale com o SINDHOSPE.",
  "auth/too-many-requests": "Muitas tentativas. Aguarde alguns minutos.",
  "auth/weak-password": "A nova senha é fraca demais. Use pelo menos 8 caracteres, com letra e número.",
  "auth/password-does-not-meet-requirements": "A nova senha não atende às regras: pelo menos 8 caracteres, com letra e número.",
  "auth/requires-recent-login": "Por segurança, saia e entre de novo antes de trocar a senha.",
  "auth/network-request-failed": "Não foi possível conectar ao Firebase. Verifique sua internet.",
  "permission-denied": "Sua sessão não tem acesso a estes dados. Saia e entre novamente.",
  "unavailable": "Não foi possível conectar ao Firebase. Verifique sua internet.",
};

export function mensagemAmigavel(erro) {
  const codigo = String(erro?.code || "").replace(/^firestore\//, "");
  if (MENSAGENS[codigo]) return MENSAGENS[codigo];
  const msg = String(erro?.message || erro || "");
  if (/Failed to fetch|NetworkError|fetch failed|load failed|offline/i.test(msg)) return MENSAGENS.unavailable;
  return msg || "Erro inesperado ao carregar os dados.";
}
