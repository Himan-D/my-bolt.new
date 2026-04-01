# API Provider Configuration Guide

## Overview

Hima supports multiple LLM providers, allowing you to choose the best model for your use case or have automatic fallback when one provider is unavailable.

## Supported Providers

### 1. **Anthropic** (Recommended for most use cases)
- **Models**: Claude 3.5 Sonnet, Claude 3 Opus, Claude 3 Sonnet, Claude 3 Haiku
- **Get API Key**: https://console.anthropic.com/
- **Reliability**: Excellent
- **Environment Variable**: `ANTHROPIC_API_KEY`

### 2. **OpenRouter** (200+ models, best value)
- **Models**: Claude, GPT-4, Llama, Mistral, and 200+ more
- **Get API Key**: https://openrouter.ai/keys
- **Reliability**: Excellent (routes to best available provider)
- **Environment Variable**: `OPENROUTER_API_KEY`
- **Pricing**: Often cheaper than direct provider APIs
- **Pro Tip**: Great for trying different models without multiple API keys

### 3. **OpenAI**
- **Models**: GPT-4o, GPT-4 Turbo, GPT-3.5 Turbo
- **Get API Key**: https://platform.openai.com/api-keys
- **Reliability**: Excellent
- **Environment Variable**: `OPENAI_API_KEY`

### 4. **Google** (Gemini)
- **Models**: Gemini 2.0 Pro, Gemini 1.5 Pro
- **Get API Key**: https://aistudio.google.com/app/apikey
- **Reliability**: Good
- **Environment Variable**: `GOOGLE_API_KEY`

## Setup Instructions

### Local Development

1. **Copy the example file**:
   ```bash
   cp .dev.vars.example .dev.vars
   ```

2. **Add your API key(s)**:
   ```bash
   # Edit .dev.vars and add your API key
   # Example with OpenRouter:
   OPENROUTER_API_KEY=sk-or-xxxxxxxxxxxxx
   
   # Or with Anthropic:
   ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx
   ```

3. **Restart the dev server**:
   ```bash
   pnpm dev
   ```

### Production (Wrangler/Cloudflare)

Set environment variables in your `wrangler.toml`:

```toml
[env.production]
vars = { ANTHROPIC_API_KEY = "sk-ant-xxxxxxxxxxxxx" }
```

Or via Cloudflare dashboard → Settings → Environment Variables.

## Automatic Provider Selection

If multiple API keys are configured, Hima will automatically select them in this priority order:

1. **Anthropic** (if `ANTHROPIC_API_KEY` is set)
2. **OpenRouter** (if `OPENROUTER_API_KEY` is set)
3. **OpenAI** (if `OPENAI_API_KEY` is set)
4. **Google** (if `GOOGLE_API_KEY` is set)

### Override Provider via API

You can specify a different provider in the chat request:

```javascript
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [{ role: 'user', content: 'Hello!' }],
    provider: 'OpenRouter',           // Optional: override default
    model: 'openai/gpt-4o',           // Optional: use different model
    apiKey: 'sk-or-xxxxxxxxxxxxx',   // Optional: use different key
  }),
});
```

## Model Selection

### Default Models by Provider

- **Anthropic**: `claude-3-5-sonnet-20241022`
- **OpenRouter**: `openai/gpt-4o`
- **OpenAI**: `gpt-4o`
- **Google**: `gemini-2.0-pro`

### Custom Model Selection

Via API request body:

```javascript
{
  provider: 'OpenRouter',
  model: 'meta-llama/llama-3-70b',
  // ... rest of request
}
```

## Troubleshooting

### "Invalid or missing API key" Error

1. Verify the key is correctly set in `.dev.vars`
2. Check that the file syntax is correct (no quotes around values)
3. Restart the dev server after changing `.dev.vars`
4. Ensure the key is valid and has not expired

### "Unknown provider" Error

- Check that you typed the provider name correctly
- Valid providers are: `Anthropic`, `OpenRouter`, `OpenAI`, `Google`

### Rate Limiting

If you hit rate limits:
1. Use OpenRouter as fallback (automatically switches providers)
2. Upgrade your API plan
3. Implement request throttling in your client

## Cost Optimization

1. **Use OpenRouter** for variable workloads (automatically routes to cheapest provider)
2. **Use Anthropic** for consistent, reliable performance
3. **Monitor usage** via provider dashboards
4. **Set budget limits** in your provider account settings

## Best Practices

- ✅ **Do**: Set at least one API key in `.dev.vars`
- ✅ **Do**: Use OpenRouter for production if budget is a concern
- ✅ **Do**: Implement error handling for rate limits
- ❌ **Don't**: Commit API keys to git (`.dev.vars` is in `.gitignore`)
- ❌ **Don't**: Expose API keys in client-side code
