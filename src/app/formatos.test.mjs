import { test } from "node:test";
import assert from "node:assert/strict";
import { num, pct, mesAno, mesAnoLongo, dataBr, fraseComparacao, textoCadastro, validadeCadastro } from "./formatos.mjs";

test("num e pct no formato brasileiro", () => {
  assert.equal(num(26489), "26.489");
  assert.equal(num(null), "0");
  assert.equal(pct(2.2), "2,2%");
  assert.equal(pct(50), "50%");
});

test("mesAno e dataBr", () => {
  assert.equal(mesAno("2026-04"), "abr/2026");
  assert.equal(mesAno("202606"), "jun/2026");
  assert.equal(mesAno(null), "—");
  assert.equal(dataBr("2025-08-19"), "19/08/2025");
  assert.equal(dataBr(null), "—");
});

test("fraseComparacao fala de mediana, sem casas decimais estranhas", () => {
  const c = { grupo: "Diagnóstico e terapia (SADT) · diagnóstico por imagem", estabelecimentos: 255, mediana: 31, percentil: 98 };
  assert.equal(
    fraseComparacao(1076, c, "equipamentos"),
    "Comparado com 255 estabelecimentos de PE do mesmo grupo (Diagnóstico e terapia (SADT) · diagnóstico por imagem) que têm equipamentos cadastrados: a mediana é de 31. Você tem mais que 98% deles."
  );
  assert.match(fraseComparacao(10, { ...c, percentil: 20 }, "equipamentos"), /abaixo da mediana: 80%/);
  assert.match(fraseComparacao(31, c, "equipamentos"), /igual ao seu/);
  assert.equal(fraseComparacao(1, null, "x"), "");
});

test("textoCadastro", () => {
  assert.equal(textoCadastro({ encontrado: false }).rotulo, "Não encontrado no CNES");
  const ok = textoCadastro({ encontrado: true, situacao: "em_dia", meses_sem_atualizar: 2, ultima_atualizacao: "2026-04" });
  assert.equal(ok.tom, "ok");
  assert.match(ok.detalhe, /abr\/2026 \(há 2 meses\)/);
  assert.equal(textoCadastro({ encontrado: true, situacao: "desatualizado", meses_sem_atualizar: 17, ultima_atualizacao: "2025-01" }).tom, "atencao");
});

test("mesAnoLongo escreve mês e ano por extenso", () => {
  assert.equal(mesAnoLongo("202406"), "junho de 2024");
  assert.equal(mesAnoLongo("2026-03"), "março de 2026");
  assert.equal(mesAnoLongo(""), "—");
});

test("validadeCadastro: prazo de 6 meses contado até hoje", () => {
  const nov2026 = new Date(2026, 10, 19);
  assert.deepEqual(validadeCadastro("2026-04", nov2026), { proxima: "2026-10", situacao: "vencido", mesesRestantes: -1 });
  assert.deepEqual(validadeCadastro("2026-05", nov2026), { proxima: "2026-11", situacao: "vence_em_breve", mesesRestantes: 0 });
  assert.equal(validadeCadastro("2026-06", nov2026).situacao, "vence_em_breve");
  assert.deepEqual(validadeCadastro("2026-10", nov2026), { proxima: "2027-04", situacao: "em_dia", mesesRestantes: 5 });
  assert.equal(validadeCadastro("2024-10", nov2026).situacao, "vencido");
  assert.equal(validadeCadastro(null, nov2026).situacao, "sem_data");
});
