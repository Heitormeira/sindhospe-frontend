import { test } from "node:test";
import assert from "node:assert/strict";
import { planoDeBusca, atendeFiltros, normalizar } from "./busca.mjs";

test("termos vazios, curtos ou só pontuação não consultam", () => {
  for (const q of ["", "h", "  ", "ã", "--", "a b"]) assert.equal(planoDeBusca(q), null, JSON.stringify(q));
});

test("palavra mais longa consulta, as demais filtram", () => {
  assert.deepEqual(planoDeBusca("Hospital Esp"), { consulta: "hospital", filtros: ["esp"] });
  assert.deepEqual(planoDeBusca("esp hospital"), { consulta: "hospital", filtros: ["esp"] });
});

test("acentos e caixa são normalizados", () => {
  assert.deepEqual(planoDeBusca("São"), { consulta: "sao", filtros: [] });
  assert.equal(normalizar("ESPERANÇA"), "esperanca");
});

test("filtros exigem início de palavra no nome", () => {
  assert.equal(atendeFiltros("Hospital Esperança", ["esp"]), true);
  assert.equal(atendeFiltros("Hospital Esperança", ["ran"]), false);
  assert.equal(atendeFiltros("Hospital Esperança", []), true);
});
