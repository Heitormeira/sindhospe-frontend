// Regras da troca de senha (testadas em senha.test.mjs).
// O Firebase também valida (política de senha do projeto: mínimo 8); aqui a
// mensagem sai em português antes de chamar o servidor.

export const MINIMO_SENHA = 8;

const OBVIAS = /^(123456|12345678|senha|sindhospe|password|qwerty|abc123)/i;

/** Devolve a mensagem de erro, ou null se a nova senha pode ser usada. */
export function validarNovaSenha(atual, nova, confirmacao) {
  if (!atual) return "Digite a sua senha atual.";
  if (!nova || nova.length < MINIMO_SENHA) return `A nova senha precisa ter pelo menos ${MINIMO_SENHA} caracteres.`;
  if (!/[a-zA-Z]/.test(nova) || !/[0-9]/.test(nova)) return "A nova senha precisa ter letra e número.";
  if (OBVIAS.test(nova)) return "Essa senha é fácil de adivinhar. Escolha outra.";
  if (nova === atual) return "A nova senha precisa ser diferente da atual.";
  if (nova !== confirmacao) return "A nova senha e a confirmação não conferem.";
  return null;
}
