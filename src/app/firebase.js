"use client";

// Inicialização do Firebase no navegador. O firebaseConfig não é segredo:
// quem protege os dados são as regras do Firestore (sindhospe-backend/firestore.rules).
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function app() {
  return getApps()[0] || initializeApp(config);
}

// Getters preguiçosos: nada é inicializado durante a renderização no servidor.
export const obterAuth = () => getAuth(app());
export const obterDb = () => getFirestore(app());
