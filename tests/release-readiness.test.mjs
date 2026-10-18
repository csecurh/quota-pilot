import test from 'node:test';
import assert from 'node:assert/strict';
import { burnRate, usageAlert } from '../server/domain/analytics.mjs';
import { readFile } from 'node:fs/promises';

test('local alerts are deterministic and do not invent data', () => {
  assert.equal(usageAlert({remainingPercent:null}),null);
  assert.equal(usageAlert({remainingPercent:10}).code,'quota_critical');
  assert.equal(usageAlert({remainingPercent:20}).code,'quota_low');
  assert.equal(usageAlert({remainingPercent:25}),null);
  const now=Date.now();
  const reset=new Date(now+4*3600000).toISOString();
  assert.equal(usageAlert({remainingPercent:50,runway:2,dead:2,resetsAt:reset,now}).code,'pace_risk');
  assert.equal(usageAlert({remainingPercent:50,runway:null,dead:null,resetsAt:reset,now}),null);
  assert.equal(usageAlert({remainingPercent:50,runway:6,dead:0,resetsAt:reset,now}),null);
});
test('burn rate requires at least five minutes of observations', () => {
  const now=Date.now();
  assert.equal(burnRate([{capturedAt:new Date(now-60000).toISOString(),remainingPercent:50},{capturedAt:new Date(now).toISOString(),remainingPercent:49}]),null);
  assert.equal(burnRate([{capturedAt:new Date(now-3600000).toISOString(),remainingPercent:80},{capturedAt:new Date(now).toISOString(),remainingPercent:60}]),20);
});
test('widget renders estimates and local advisory without network or HTML injection', async () => {
  const text=await readFile(new URL('../ui/quota-widget.html',import.meta.url),'utf8');
  for(const token of ['burnRatePercentPerHour','runwayHours','deadHours','quota_critical','quota_low','pace_risk','Estimaciones locales']) assert.ok(text.includes(token),token);
  assert.ok(text.includes("connect-src 'none'"));
  assert.doesNotMatch(text,/\.innerHTML\s*=|\bfetch\s*\(/);
});
test('public-facing readme labels preview as synthetic and does not falsely claim public distribution',async()=>{
  const readme=await readFile(new URL('../README.md',import.meta.url),'utf8');
  assert.match(readme,/synthetic sample data/);
  assert.match(readme,/Private preview/);
  assert.match(readme,/docs\/INSTALL.md/);
  assert.match(readme,/docs\/RELEASE-CHECKLIST.md/);
});
