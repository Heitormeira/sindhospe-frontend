"use client";

import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList, CartesianGrid, Legend } from "recharts";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Paleta extraída da logo do SINDHOSPE (Saúde+PE)
export const CORES = {
  verdeEscuro: "#0b4a34",
  verde: "#159957",
  verdeClaro: "#e6f5ee",
  vermelho: "#8f1d24",
  vermelhoClaro: "#fbe9ea",
  dourado: "#f2b705",
  neutro: "#4b5f57", // verde-acinzentado, usado no lugar de vermelho em comparativos neutros
};

// Converte "202406" -> "Jun/24"
export function formatCompetencia(comp) {
  const meses = ["", "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const ano = comp.slice(0, 4);
  const mes = parseInt(comp.slice(4, 6), 10);
  return `${meses[mes]}/${ano.slice(2)}`;
}

export function ComparativoBarras({ dados }) {
  return (
    <ResponsiveContainer width="100%" height={150}>
      <BarChart data={dados} margin={{ top: 20, right: 10, left: 10, bottom: 0 }}>
        <XAxis dataKey="nome" tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} />
        <YAxis hide />
        <Tooltip formatter={(valor) => [valor, "Leitos"]} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
        <Bar dataKey="valor" radius={[6, 6, 0, 0]} maxBarSize={70}>
          {dados.map((d, i) => (
            <Cell key={i} fill={d.cor} />
          ))}
          <LabelList dataKey="valor" position="top" style={{ fontSize: 13, fontWeight: 700, fill: "#374151" }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// Gráfico de linha genérico para séries temporais (evolução e mercado)
export function LinhaEvolucao({ dados, linhas, formatoX = formatCompetencia }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={dados} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eef1f4" />
        <XAxis
          dataKey="competencia"
          tickFormatter={formatoX}
          tick={{ fontSize: 11, fill: "#6b7280" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip labelFormatter={formatoX} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
        {linhas.length > 1 && <Legend wrapperStyle={{ fontSize: 12 }} />}
        {linhas.map((l) => (
          <Line
            key={l.dataKey}
            type="monotone"
            dataKey={l.dataKey}
            name={l.nome}
            stroke={l.cor}
            strokeWidth={2.5}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

export function Servico({ nome, valor, cores }) {
  let texto, cor;
  if (valor === "1") {
    texto = "✓ Sim";
    cor = cores.verde;
  } else if (valor === "0") {
    texto = "Não oferece";
    cor = cores.vermelho;
  } else {
    texto = "Sem informação";
    cor = "#9ca3af";
  }
  return (
    <li className="flex items-center justify-between py-2.5">
      <span className="text-[#0b4a34] text-sm">{nome}</span>
      <span className="text-sm font-semibold" style={{ color: cor }}>{texto}</span>
    </li>
  );
}

export function ComposicaoEmpilhada({ dados }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={dados} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
        <XAxis dataKey="nome" tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="naoSus" name="Leitos não SUS" stackId="a" fill={CORES.dourado} />
        <Bar dataKey="sus" name="Leitos SUS" stackId="a" fill={CORES.verde} />
        <Bar dataKey="complementares" name="Complementares" stackId="a" fill={CORES.verdeEscuro} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// --- Sessão simples (demo) via localStorage: nome do estabelecimento + senha fixa ---
const CHAVE_SESSAO = "sindhospe_sessao";
const SENHA_DEMO = "12345";

export function salvarSessao(cnes, nome) {
  try {
    localStorage.setItem(CHAVE_SESSAO, JSON.stringify({ cnes, nome }));
  } catch (e) {
    console.error("Não foi possível salvar a sessão:", e);
  }
}

export function getSessao() {
  try {
    const raw = localStorage.getItem(CHAVE_SESSAO);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function limparSessao() {
  try {
    localStorage.removeItem(CHAVE_SESSAO);
  } catch (e) {
    console.error("Não foi possível limpar a sessão:", e);
  }
}

// Mantido por compatibilidade — não é mais usado pela tela de login atual
// (que agora busca no servidor em vez de comparar contra uma lista
// completa baixada no navegador), mas outro código pode depender dele.
export function validarLogin(nomeDigitado, senhaDigitada, listaEstabelecimentos) {
  if (senhaDigitada !== SENHA_DEMO) {
    return { ok: false, erro: "Senha incorreta." };
  }
  const alvo = nomeDigitado.trim().toLowerCase();
  const encontrado = listaEstabelecimentos.find(
    (e) => e.nome_fantasia.trim().toLowerCase() === alvo
  );
  if (!encontrado) {
    return { ok: false, erro: "Estabelecimento não encontrado. Digite o nome exatamente como aparece na base do SINDHOSPE." };
  }
  return { ok: true, cnes: encontrado.cnes, nome: encontrado.nome_fantasia };
}

// Card institucional: fundo branco, borda suave, cantos de 12px, respiro de
// 24px — sem sombras pesadas (direção "portal institucional", não "dashboard
// de startup").
export function Card({ children, className = "" }) {
  return (
    <div
      className={`bg-white rounded-xl px-6 py-6 mb-4 shadow-sm border border-[#d6e8e0] ${className}`}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children }) {
  return (
    <h2 className="text-lg font-semibold mb-3" style={{ color: CORES.verdeEscuro }}>
      {children}
    </h2>
  );
}

/**
 * Traduz um comparativo (você vs média) numa frase de significado prático —
 * o "e daí" que justifica o número, não só o número em si.
 *
 * tipo: "leitos" | "complementares" | "servicos"
 * valor: número do estabelecimento
 * media: média de comparação
 */
export function Insight({ tipo, valor, media }) {
  const mediaNum = parseFloat(media) || 0;
  const diff = valor - mediaNum;
  const pct = mediaNum > 0 ? Math.round((diff / mediaNum) * 100) : (valor > 0 ? 100 : 0);
  const acima = diff > 0;
  const neutro = Math.abs(pct) < 5;

  const TEXTOS = {
    leitos: {
      acima: `Você está ${pct}% acima da média — isso é um bom argumento em negociações com planos de saúde e para demonstrar capacidade instalada.`,
      abaixo: `Você está ${Math.abs(pct)}% abaixo da média — vale avaliar se isso limita contratos que exigem capacidade mínima, ou se é uma oportunidade de investimento.`,
      neutro: `Sua capacidade está alinhada com a média da região — um ponto neutro em negociações.`,
    },
    complementares: {
      acima: `Mais leitos complementares (UTI e afins) que a média é um diferencial competitivo forte — poucos concorrentes oferecem esse nível de estrutura crítica.`,
      abaixo: `Menos estrutura complementar que a média pode limitar credenciamento em contratos que exigem UTI ou leitos especializados.`,
      neutro: `Sua estrutura complementar está alinhada com a média da região.`,
    },
    servicos: {
      acima: `Seu portfólio de serviços é mais amplo que a média — isso amplia suas possíveis linhas de receita.`,
      abaixo: `Um portfólio menor que a média pode indicar oportunidade de expandir serviços que a concorrência já oferece.`,
      neutro: `Seu portfólio de serviços está alinhado com a média da região.`,
    },
  };

  const textos = TEXTOS[tipo];
  const texto = neutro ? textos.neutro : acima ? textos.acima : textos.abaixo;

  // Linguagem visual única (fundo verde claro + texto verde escuro, igual em
  // todo o portal) com só a borda esquerda mudando de cor pra sinalizar o
  // tipo de leitura — mais institucional que trocar o fundo inteiro de cor.
  const borda = neutro ? CORES.neutro : acima ? CORES.verde : CORES.dourado;
  const rotulo = neutro ? "Estável" : acima ? "Ponto forte" : "Atenção";

  return (
    <div
      className="mt-3 rounded-lg pl-4 pr-4 py-3 text-sm border-l-4"
      style={{ background: CORES.verdeClaro, borderColor: borda, color: CORES.verdeEscuro }}
    >
      <p className="text-sm font-semibold uppercase tracking-wide mb-1" style={{ color: borda }}>
        {rotulo}
      </p>
      <p>{texto}</p>
    </div>
  );
}
