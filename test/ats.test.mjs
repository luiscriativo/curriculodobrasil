import { test } from 'node:test';
import assert from 'node:assert/strict';
import { analyzeResume, extractKeywords, matchKeywords, resumeText } from '../src/shared/ats.mjs';
import { createResume, normalizeResume } from '../src/shared/model.mjs';
import { sampleResume } from '../src/shared/sample.mjs';

test('o exemplo completo tira nota alta num modelo de uma coluna', () => {
  const { score, checks } = analyzeResume(normalizeResume(sampleResume()), { ats: 'alta' });
  assert.ok(score >= 90, `nota ${score}`);
  assert.ok(!checks.some((c) => c.status === 'bad'));
});

test('currículo vazio aponta os problemas certos', () => {
  const { score, checks } = analyzeResume(createResume(), { ats: 'baixa' });
  assert.ok(score < 30, `nota ${score}`);
  const bad = checks.filter((c) => c.status === 'bad').map((c) => c.id);
  for (const id of ['name', 'email', 'experience', 'template']) assert.ok(bad.includes(id), id);
});

test('seções ocultas não entram no texto analisado', () => {
  const r = normalizeResume(sampleResume());
  r.sections.find((s) => s.type === 'skills').hidden = true;
  assert.ok(!resumeText(r).includes('Copywriting'));
});

test('palavras-chave da vaga mantêm acentos, siglas e expressões', () => {
  const keys = extractKeywords('Requisitos: Power BI, SQL e automação de marketing. Desejável Power BI avançado e inglês.').map((k) => k.label);
  assert.ok(keys.includes('Power BI'), keys.join(','));
  assert.ok(keys.includes('SQL'));
  assert.ok(keys.includes('automação'));
  assert.ok(!keys.includes('avançado'), 'nível não é palavra-chave');
  assert.ok(!keys.some((k) => /BI SQL/.test(k)), 'não junta palavras separadas por vírgula');
});

test('compara a vaga com o currículo', () => {
  const m = matchKeywords(normalizeResume(sampleResume()), 'Buscamos analista com Google Ads, SEO, HubSpot e SQL para campanhas de performance.');
  assert.ok(m.found.includes('SEO'));
  assert.ok(m.missing.includes('HubSpot'));
  assert.ok(m.pct > 0 && m.pct < 100);
});
