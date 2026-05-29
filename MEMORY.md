# Memory

## Durable
- Agent provider is codex (OPENAI_API_KEY); no ANTHROPIC_API_KEY configured as of initial onboarding 2026-05-27.
- acpx Codex runs require ACPX_AUTH_OPENAI_API_KEY alongside OPENAI_API_KEY for ACP auth handshake; ambient OPENAI_API_KEY alone does not trigger auth-method selection (issue #6, 2026-05-28).
