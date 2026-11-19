"use client";

// Sessão + ficha do associado logado, para as páginas do associado.
// As páginas só montam depois que o NavClient resolveu a sessão, então getSessao()
// já é confiável na criação do estado (sem setState síncrono dentro de efeito).
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSessao } from "./components";
import { getFichaCompleta } from "./dados";
import { mensagemAmigavel } from "./api-error";

export function useFichaDaSessao({ redirecionar = true } = {}) {
  const router = useRouter();
  const [sessao] = useState(() => getSessao());
  const [estado, setEstado] = useState(() => ({
    dados: null,
    erro: sessao?.cnes || redirecionar ? "" : "Sessão não encontrada. Faça login novamente.",
    carregando: Boolean(sessao?.cnes),
  }));

  useEffect(() => {
    if (!sessao && redirecionar) router.replace("/login");
  }, [sessao, redirecionar, router]);

  useEffect(() => {
    if (!sessao?.cnes) return undefined;
    let ativo = true;
    getFichaCompleta(sessao.cnes)
      .then((dados) => ativo && setEstado({ dados, erro: "", carregando: false }))
      .catch((e) => ativo && setEstado({ dados: null, erro: mensagemAmigavel(e), carregando: false }));
    return () => {
      ativo = false;
    };
  }, [sessao]);

  return { sessao, ...estado };
}
