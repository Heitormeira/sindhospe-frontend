import { test } from "node:test";
import assert from "node:assert/strict";
import { num, pct, mesAno, dataBr, fraseComparacao, textoCadastro } from "./formatos.mjs";

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
  const c = { estabelecimentos: 255, mediana: 31, percentil: 98 };
  assert.match(fraseComparacao(1076, c, "equipamentos"), /255 estabelecimentos.*mediana é de 31 equipamentos\. Você tem mais que 98%/);
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
