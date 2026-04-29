/**
 * See https://docs.anthropic.com/en/docs/about-claude/models
 * Extended output: claude-3-7-sonnet supports up to 128K tokens with output-128k-2025-02-19 beta.
 */
export const MAX_TOKENS = 16384;

// limits the number of model responses that can be returned in a single request
export const MAX_RESPONSE_SEGMENTS = 8;
