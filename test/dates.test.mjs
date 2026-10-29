import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseDate, formatDate, formatRange, monthsBetween, formatDuration, dayLabel, timeAgo } from '../src/shared/dates.mjs';

test('entende os formatos que as pessoas digitam', () => {
  assert.deepEqual(parseDate('03/2021'), { y: 2021, m: 3 });
  assert.deepEqual(parseDate('3-2021'), { y: 2021, m: 3 });
  assert.deepEqual(parseDate('2021-03'), { y: 2021, m: 3 });
  assert.deepEqual(parseDate('2021'), { y: 2021, m: null });
  assert.deepEqual(parseDate('mar 2021'), { y: 2021, m: 3 });
  assert.deepEqual(parseDate('março de 2021'), { y: 2021, m: 3 });
  assert.deepEqual(parseDate('Sept 2020'), { y: 2020, m: 9 });
  assert.deepEqual(parseDate('set/2020'), { y: 2020, m: 9 });
  assert.equal(parseDate('13/2021'), null);
  assert.equal(parseDate('ano passado'), null);
  assert.equal(parseDate(''), null);
});

test('formata em cada estilo e idioma', () => {
  assert.equal(formatDate('3/2021', 'mm/yyyy'), '03/2021');
  assert.equal(formatDate('03/2021', 'mon yyyy'), 'mar 2021');
  assert.equal(formatDate('03/2021', 'month yyyy'), 'março de 2021');
  assert.equal(formatDate('03/2021', 'month yyyy', 'en'), 'March 2021');
  assert.equal(formatDate('03/2021', 'yyyy'), '2021');
  assert.equal(formatDate('verão de 2019'), 'verão de 2019', 'texto não reconhecido fica como foi digitado');
});

test('período com "Atual" e lados vazios', () => {
  assert.equal(formatRange('01/2020', '', true), '01/2020 — Atual');
  assert.equal(formatRange('01/2020', '', true, 'mm/yyyy', 'en'), '01/2020 — Present');
  assert.equal(formatRange('2019', '2019', false), '2019');
  assert.equal(formatRange('', '2019', false), '2019');
  assert.equal(formatRange('', '', false), '');
});

test('duração em meses e por extenso', () => {
  assert.equal(monthsBetween('01/2020', '12/2020', false), 12);
  assert.equal(monthsBetween('05/2020', '03/2020', false), null);
  assert.equal(monthsBetween('01/2020', '', true, new Date(2021, 2, 10)), 15);
  assert.equal(formatDuration(15), '1 ano e 3 meses');
  assert.equal(formatDuration(1), '1 mês');
  assert.equal(formatDuration(24, 'en'), '2 years');
});

test('rótulos de dia e "há quanto tempo"', () => {
  const now = new Date(2026, 9, 28, 15);
  assert.equal(dayLabel(new Date(2026, 9, 28, 8).getTime(), now), 'Hoje');
  assert.equal(dayLabel(new Date(2026, 9, 27, 23).getTime(), now), 'Ontem');
  assert.match(dayLabel(new Date(2026, 8, 1).getTime(), now), /2026/);
  assert.equal(timeAgo(now.getTime() - 10e3, now.getTime()), 'agora');
  assert.equal(timeAgo(now.getTime() - 5 * 60e3, now.getTime()), 'há 5 min');
  assert.equal(timeAgo(now.getTime() - 86400e3, now.getTime()), 'há 1 dia');
});
