import { test } from "node:test";
import assert from "node:assert/strict";
import { termoDeBusca, normalizar } from "./busca.mjs";

// Mesmos casos de sindhospe-backend/test/prefixos.test.js (regras precisam bater).

test("termos vazios, curtos ou só pontuação não consultam", () => {
  for (const q of ["", "h", "  ", "ã", "--", " - "]) assert.equal(termoDeBusca(q), null, JSON.stringify(q));
});

test("várias palavras viram uma frase normalizada", () => {
  assert.equal(termoDeBusca("Hospital Santa"), "hospital santa");
  assert.equal(termoDeBusca("hospital  santa jo"), "hospital santa jo");
  assert.equal(termoDeBusca("SANTA-Jo"), "santa jo");
  assert.equal(termoDeBusca("a b"), "a b");
});

test("acentos e caixa são normalizados", () => {
  assert.equal(termoDeBusca("São"), "sao");
  assert.equal(normalizar("ESPERANÇA"), "esperanca");
});
