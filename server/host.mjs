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

export function detectHostBrand(clientInfo = {}, env = process.env) {
  const text = [
    clientInfo?.name,
    clientInfo?.title,
    clientInfo?.description,
    env.QUOTAPILOT_HOST,
  ].filter(Boolean).join(' ').toLowerCase();

  if (text.includes('claude')) return BRANDS.claude_code;
  if (text.includes('codex')) return BRANDS.codex;
  if (text.includes('chatgpt') || text.includes('chat gpt')) return BRANDS.chatgpt;

  if (env.CLAUDE_PLUGIN_ROOT) return BRANDS.claude_code;
  if (env.CODEX_HOME || env.PLUGIN_ROOT) return BRANDS.codex;

  return FALLBACK_BRAND;
}

export function brandForProvider(provider) {
  if (provider === 'codex') return BRANDS.codex;
  if (provider === 'claude_code') return BRANDS.claude_code;
  return FALLBACK_BRAND;
}
