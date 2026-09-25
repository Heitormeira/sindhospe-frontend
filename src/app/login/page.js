"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL, CORES, salvarSessao, getSessao, validarLogin } from "../components";

export default function LoginPage() {
  const router = useRouter();
  const [estabelecimentos, setEstabelecimentos] = useState([]);
  const [nome, setNome] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    // Se já tem sessão, vai direto pro dashboard
    const sessao = getSessao();
    if (sessao) {
      router.replace("/dashboard");
      return;
    }
    fetch(`${API_URL}/api/estabelecimentos`)
      .then((r) => r.json())
      .then((lista) => setEstabelecimentos(Array.isArray(lista) ? lista : []))
      .catch(() => setErro("Não foi possível carregar a lista de estabelecimentos."))
      .finally(() => setCarregando(false));
  }, [router]);

  function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    const resultado = validarLogin(nome, senha, estabelecimentos);
    if (!resultado.ok) {
      setErro(resultado.erro);
      return;
    }
    salvarSessao(resultado.cnes, resultado.nome);
    router.push("/dashboard");
  }

  return (
    <div className="flex items-center justify-center min-h-[70vh] px-4">
      <div className="bg-white rounded-xl shadow-sm border w-full max-w-sm px-6 py-8" style={{ borderColor: `${CORES.verde}22` }}>
        <div className="flex justify-center mb-5">
          <img src="/logo-sindhospe.png" alt="SINDHOSPE" className="h-14 w-auto" />
        </div>
        <p className="text-sm text-gray-500 text-center mb-5">
          Portal do Associado — acesse com o nome do seu estabelecimento
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Nome do estabelecimento</label>
            <input
              type="text"
              list="lista-estabelecimentos"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: HOSPITAL ESPERANCA S A"
              className="w-full text-sm rounded-lg px-3 py-2 bg-white text-gray-900 border border-gray-200"
              autoComplete="off"
            />
            <datalist id="lista-estabelecimentos">
              {estabelecimentos.map((e) => (
                <option key={e.cnes} value={e.nome_fantasia} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-1">Senha</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Senha demo: 12345"
              className="w-full text-sm rounded-lg px-3 py-2 bg-white text-gray-900 border border-gray-200"
            />
          </div>

          {erro && (
            <div className="text-xs rounded-lg px-3 py-2" style={{ background: CORES.vermelhoClaro, color: CORES.vermelho }}>
              {erro}
            </div>
          )}

          <button
            type="submit"
            disabled={carregando}
            className="w-full text-sm font-semibold rounded-lg py-2.5 text-white transition-opacity disabled:opacity-50"
            style={{ background: `linear-gradient(135deg, ${CORES.verdeEscuro}, ${CORES.verde})` }}
          >
            {carregando ? "Carregando..." : "Entrar"}
          </button>
        </form>

        <p className="text-xs text-gray-400 text-center mt-5">
          Protótipo experimental — comece a digitar o nome pra ver sugestões. Senha de demonstração: <strong>12345</strong>
        </p>
      </div>
    </div>
  );
}
