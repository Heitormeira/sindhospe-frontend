"use client";

// Sessão do associado via Firebase Auth.
// - Login: e-mail {cnes}@sindhospe.app + senha; o CNES vem da claim do token.
// - getSessao() é síncrono e só é confiável depois que o NavClient resolveu a
//   sessão (ele só renderiza as páginas depois disso).
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { obterAuth, obterDb } from "./firebase";

let atual = null; // { cnes, nome } | null
const ouvintes = new Set();

function publicar(sessao) {
  atual = sessao;
  for (const cb of ouvintes) cb(sessao);
}

export function getSessao() {
  return atual;
}

async function montarSessao(usuario) {
  if (!usuario) return null;
  const { claims } = await usuario.getIdTokenResult();
  const cnes = claims.cnes;
  if (!cnes) {
    // Conta sem vínculo com associado: não deve existir, mas não deixa entrar.
    await signOut(obterAuth());
    return null;
  }
  let nome = cnes;
  try {
    const snap = await getDoc(doc(obterDb(), `associados/${cnes}`));
    nome = snap.data()?.identidade?.nome_fantasia || cnes;
  } catch {
    // Sem o nome a sessão continua válida; as páginas mostram o erro ao carregar os dados.
  }
  return { cnes, nome };
}

/** Observa a sessão; chama cb(sessao|null) a cada mudança. Devolve a função de cancelamento. */
export function observarSessao(cb) {
  ouvintes.add(cb);
  const cancelarAuth = onAuthStateChanged(obterAuth(), async (usuario) => {
    publicar(await montarSessao(usuario));
  });
  return () => {
    ouvintes.delete(cb);
    cancelarAuth();
  };
}

/** Entra e só resolve com a sessão pronta e já publicada (a guarda de rota não vê "sem sessão"). */
export async function entrar(cnes, senha) {
  const { user } = await signInWithEmailAndPassword(obterAuth(), `${cnes}@sindhospe.app`.toLowerCase(), senha);
  const sessao = await montarSessao(user);
  if (!sessao) throw Object.assign(new Error("Conta sem acesso"), { code: "permission-denied" });
  publicar(sessao);
  return sessao;
}

export async function sair() {
  await signOut(obterAuth());
  publicar(null);
}
