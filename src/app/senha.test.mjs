import { test } from "node:test";
import assert from "node:assert/strict";
import { validarNovaSenha, MINIMO_SENHA } from "./senha.mjs";

test("validarNovaSenha", () => {
  assert.equal(MINIMO_SENHA, 8);
  assert.match(validarNovaSenha("", "abcd1234", "abcd1234"), /senha atual/i);
  assert.match(validarNovaSenha("Atual123x", "abc12", "abc12"), /8 caracteres/);
  assert.match(validarNovaSenha("Atual123x", "abcdefgh", "abcdefgh"), /letra e número/);
  assert.match(validarNovaSenha("Atual123x", "12345678", "12345678"), /letra e número/);
  assert.match(validarNovaSenha("Atual123x", "abcd1234", "abcd1235"), /não conferem/);
  assert.match(validarNovaSenha("abcd1234", "abcd1234", "abcd1234"), /diferente da atual/);
  assert.equal(validarNovaSenha("Atual123x", "Nova-senha-9", "Nova-senha-9"), null);
});

test("validarNovaSenha recusa a antiga senha de demonstração e sequências óbvias", () => {
  assert.match(validarNovaSenha("Atual123x", "12345678a", "12345678a"), /fácil/);
  assert.match(validarNovaSenha("Atual123x", "senha123", "senha123"), /fácil/);
  assert.match(validarNovaSenha("Atual123x", "sindhospe1", "sindhospe1"), /fácil/);
});
