import test from 'node:test';
import assert from 'node:assert/strict';
import { burnRate, deadHours, remainingFromUsed, risk, runwayHours } from '../server/domain/analytics.mjs';

test('usage analytics', () => {
  assert.equal(remainingFromUsed(35), 65);
  const now = Date.now();
  const rate = burnRate([
    { capturedAt: new Date(now - 3600000).toISOString(), remainingPercent: 80 },
    { capturedAt: new Date(now).toISOString(), remainingPercent: 60 }
  ]);
  assert.equal(rate, 20);
  assert.equal(runwayHours(60, rate), 3);
  assert.equal(risk(14, 1), 'critical');
  const dead = deadHours({ resetsAt: new Date(now + 5 * 3600000).toISOString(), runway: 3 });
  assert.ok(dead >= 1.99 && dead <= 2.01);
});
