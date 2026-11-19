// Formatação e frases usadas nas telas (funções puras, testadas em formatos.test.mjs).

const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

/** 26489 -> "26.489"; null -> "0". */
export function num(valor) {
  const n = Number(valor) || 0;
  return n.toLocaleString("pt-BR", { maximumFractionDigits: 1 });
}

/** 2.2 -> "2,2%"; 50 -> "50%". */
export function pct(valor) {
  const n = Number(valor) || 0;
  return `${n.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;
}

/** "2026-04" ou "202604" -> "abr/2026"; vazio -> "—". */
export function mesAno(valor) {
  const m = String(valor || "").match(/^(\d{4})-?(\d{2})/);
  if (!m) return "—";
  return `${MESES[parseInt(m[2], 10) - 1]}/${m[1]}`;
}

/** "2025-08-19" -> "19/08/2025". */
export function dataBr(valor) {
  const m = String(valor || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : "—";
}

/**
 * Frase da comparação com estabelecimentos do mesmo tipo em PE (mediana + percentil).
 * `coisa` no plural: "equipamentos", "profissionais".
 */
export function fraseComparacao(valor, comparacao, coisa) {
  if (!comparacao || !comparacao.estabelecimentos) return "";
  const { mediana, percentil, estabelecimentos, grupo } = comparacao;
  const base = `Comparado com ${num(estabelecimentos)} estabelecimentos de PE do mesmo grupo (${grupo}) que têm ${coisa} cadastrados: a mediana é de ${num(mediana)}`;
  if (valor > mediana) return `${base}. Você tem mais que ${percentil}% deles.`;
  if (valor < mediana) return `${base}. Você está abaixo da mediana: ${100 - percentil}% têm a mesma quantidade ou mais.`;
  return `${base}, igual ao seu.`;
}

/** Situação do cadastro no CNES em linguagem simples. */
export function textoCadastro(cadastro) {
  if (!cadastro || !cadastro.encontrado) {
    return { rotulo: "Não encontrado no CNES", tom: "neutro", detalhe: "Este código não aparece na competência mais recente do CNES." };
  }
  if (cadastro.situacao === "sem_data") {
    return { rotulo: "Sem data de atualização", tom: "atencao", detalhe: "O CNES não informa quando o cadastro foi atualizado." };
  }
  const meses = cadastro.meses_sem_atualizar;
  const quando = meses === 0 ? "neste mês" : meses === 1 ? "há 1 mês" : `há ${meses} meses`;
  if (cadastro.situacao === "em_dia") {
    return { rotulo: "Em dia", tom: "ok", detalhe: `Última atualização em ${mesAno(cadastro.ultima_atualizacao)} (${quando}).` };
  }
  return {
    rotulo: "Desatualizado",
    tom: "atencao",
    detalhe: `Última atualização em ${mesAno(cadastro.ultima_atualizacao)} (${quando}). Vale revisar o cadastro no CNES.`,
  };
}

const MESES_LONGOS = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

/** "202406" ou "2024-06" -> "junho de 2024"; vazio -> "—". */
export function mesAnoLongo(valor) {
  const m = String(valor || "").match(/^(\d{4})-?(\d{2})/);
  if (!m) return "—";
  return `${MESES_LONGOS[parseInt(m[2], 10) - 1]} de ${m[1]}`;
}

export const PRAZO_CADASTRO_MESES = 6;

/**
 * Validade do cadastro no CNES (Portaria SAS/MS nº 118/2014: atualizar a cada 6 meses).
 * `ultima`: "AAAA-MM" da última atualização; `hoje`: Date.
 * Devolve { proxima: "AAAA-MM", situacao: "em_dia" | "vence_em_breve" | "vencido" | "sem_data", mesesRestantes }.
 * O prazo vale até o fim do mês de `proxima`; "vence em breve" = no mês do prazo ou no anterior.
 */
export function validadeCadastro(ultima, hoje = new Date()) {
  const m = String(ultima || "").match(/^(\d{4})-?(\d{2})/);
  if (!m) return { proxima: null, situacao: "sem_data", mesesRestantes: null };
  const prazo = parseInt(m[1], 10) * 12 + parseInt(m[2], 10) - 1 + PRAZO_CADASTRO_MESES;
  const proxima = `${Math.floor(prazo / 12)}-${String((prazo % 12) + 1).padStart(2, "0")}`;
  const mesesRestantes = prazo - (hoje.getFullYear() * 12 + hoje.getMonth());
  const situacao = mesesRestantes < 0 ? "vencido" : mesesRestantes <= 1 ? "vence_em_breve" : "em_dia";
  return { proxima, situacao, mesesRestantes };
}
