<!-- gitnexus:start -->

# GitNexus — Code Intelligence

This project is indexed by GitNexus as **my-bolt.new** (1372 symbols, 2239 relationships, 47 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Resources

| Resource                                     | Use for                                  |
| -------------------------------------------- | ---------------------------------------- |
| `gitnexus://repo/my-bolt.new/context`        | Codebase overview, check index freshness |
| `gitnexus://repo/my-bolt.new/clusters`       | All functional areas                     |
| `gitnexus://repo/my-bolt.new/processes`      | All execution flows                      |
| `gitnexus://repo/my-bolt.new/process/{name}` | Step-by-step execution trace             |

## CLI

| Task                                         | Read this skill file                                        |
| -------------------------------------------- | ----------------------------------------------------------- |
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md`       |
| Blast radius / "What breaks if I change X?"  | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?"             | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md`       |
| Rename / extract / split / refactor          | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md`     |
| Tools, resources, schema reference           | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md`           |
| Index, status, clean, wiki CLI commands      | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md`             |

<!-- gitnexus:end -->

# Hima AI Agent - Project Context

## Project Overview

- **Name**: Hima (Bolt.new Fork)
- **Purpose**: AI-powered full-stack app builder like Lovable.dev
- **Stack**: Remix + React 18 + Vite + TypeScript + UnoCSS
- **AI**: OpenAI GPT-4o (primary), supports Anthropic, Google, OpenRouter
- **Backend**: Supabase (configured at `xkpeexoheupmvmyhiuyv`)
- **Runtime**: WebContainer API (in-browser Node.js)

## Environment Variables (`.env.local`)

```
OPENAI_API_KEY=sk-proj-...          # OpenAI API key
NEXT_PUBLIC_SUPABASE_URL=https://xkpeexoheupmvmyhiuyv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_OcbY8t4pgVOhZ2c7fMplww_pEXQMski
SUPABASE_PROJECT_REF=xkpeexoheupmvmyhiuyv
```

## Running the Project

```bash
# Start GitNexus (code intelligence)
npm run start:gitnexus   # or: npx gitnexus serve --host 0.0.0.0 --port 4747

# Start the app
npm run start          # or: NODE_ENV=production PORT=5173 HOST=0.0.0.0 node server.js

# Build and start all
npm run start:all     # Runs both GitNexus and app
```

## Key Files

| File                                | Purpose                                               |
| ----------------------------------- | ----------------------------------------------------- |
| `app/routes/api.chat.ts`            | Main AI chat endpoint (uses full system prompt)       |
| `app/lib/.server/llm/prompts.ts`    | Full system prompt (475 lines, artifact instructions) |
| `app/lib/openai-client.ts`          | Direct OpenAI SDK client                              |
| `app/lib/runtime/message-parser.ts` | Parses `<boltArtifact>` XML from AI                   |
| `app/lib/runtime/action-runner.ts`  | Executes file/shell actions in WebContainer           |
| `app/lib/supabase/supabase.ts`      | Supabase client factory                               |
| `server.js`                         | Express server with env loading                       |

## AI Response Format

The AI generates `<boltArtifact>` XML with `<boltAction>` elements:

- `<boltAction type="file" filePath="...">` - File creation
- `<boltAction type="shell">` - Shell command execution

This is parsed by `StreamingMessageParser` and executed by `ActionRunner` in WebContainer.

## Troubleshooting

- **API Key Exceeded**: Add billing at https://platform.openai.com
- **WebContainer Not Booting**: Requires SharedArrayBuffer (COOP/COEP headers set)
- **Build Errors**: Run `npm run build` to see full errors
- **GitNexus Stale**: Run `npx gitnexus analyze` to re-index
