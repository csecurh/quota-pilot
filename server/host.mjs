export const FALLBACK_BRAND = Object.freeze({
  id: 'ai_usage',
  displayName: 'AI Usage',
  shortName: 'AI Usage',
});

const BRANDS = Object.freeze({
  chatgpt: Object.freeze({ id: 'chatgpt', displayName: 'ChatGPT', shortName: 'ChatGPT' }),
  codex: Object.freeze({ id: 'codex', displayName: 'Codex', shortName: 'Codex' }),
  claude_code: Object.freeze({ id: 'claude_code', displayName: 'Claude Code', shortName: 'Claude' }),
});

function normalized(value) {
  return typeof value === 'string' ? value.slice(0, 128).trim().toLowerCase() : '';
}

export function detectHostBrand(clientInfo = {}, env = process.env) {
  const override = normalized(env.QUOTAPILOT_HOST);
  if (override === 'chatgpt') return BRANDS.chatgpt;
  if (override === 'codex') return BRANDS.codex;
  if (override === 'claude' || override === 'claude_code' || override === 'claude-code') return BRANDS.claude_code;

  const values = [clientInfo?.name, clientInfo?.title, clientInfo?.description].map(normalized).filter(Boolean);
  const text = values.join(' ');
  if (/(^|[^a-z])claude([ -]?code)?([^a-z]|$)/.test(text)) return BRANDS.claude_code;
  if (/(^|[^a-z])codex([^a-z]|$)/.test(text)) return BRANDS.codex;
  if (/(^|[^a-z])chat[ -]?gpt([^a-z]|$)/.test(text)) return BRANDS.chatgpt;

  if (typeof env.CLAUDE_PLUGIN_ROOT === 'string' && env.CLAUDE_PLUGIN_ROOT) return BRANDS.claude_code;
  if ((typeof env.CODEX_HOME === 'string' && env.CODEX_HOME) || (typeof env.PLUGIN_ROOT === 'string' && env.PLUGIN_ROOT)) return BRANDS.codex;

  return FALLBACK_BRAND;
}
