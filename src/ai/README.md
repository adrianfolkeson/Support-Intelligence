# AI Module

Multi-provider AI-router för support-intelligence projektet.

## Arkitektur

```
src/ai/
├── types.ts           # TypeScript-typer
├── router.ts          # AI Router - väljer provider baserat på task
├── providers/
│   ├── claude.ts      # Claude provider (kod & text)
│   └── zai.ts         # Z.ai/GLM-4.7 provider (planering & resonemang)
├── test.ts            # Testscript
└── index.ts           # Exporter
```

## Strategi

| Task Type | Provider | Model |
|-----------|----------|-------|
| `planning` | z.ai | GLM-4-Plus |
| `reasoning` | z.ai | GLM-4-Plus |
| `code` | Claude | Claude 3.5 Sonnet |
| `text` | Claude | Claude 3.5 Sonnet |

## Integration med Analysfunktion

AI-routern är integrerad i `src/services/analysis-with-router.ts`:

```typescript
// Analys av supportärenden använder 'text' → Claude
const response = await router.route({
  messages: [{ role: 'user', content: prompt }],
  taskType: 'text'
});

// Critique pass använder 'reasoning' → z.ai (eller Claude som fallback)
const critique = await router.route({
  messages: [{ role: 'user', content: critiquePrompt }],
  taskType: 'reasoning'
});
```

Kör analys med router:
```bash
npm run analyze-router <organization_id>
```

## Setup

1. Lägg till API keys i `.env`:
```bash
ANTHROPIC_API_KEY=sk-ant-api03-...
ZAI_API_KEY=your_zai_api_key
```

2. Importera och använd:
```typescript
import { getAIRouter, TaskType } from './ai';

const router = getAIRouter();

const response = await router.route({
  messages: [
    { role: 'user', content: 'Din prompt här...' }
  ],
  taskType: 'planning' // or 'reasoning', 'code', 'text'
});

console.log(response.content);
```

## Köra tester

```bash
npm run test-ai
```

## Direct Provider Access

Om du vill använda en specifik provider direkt:

```typescript
import { getAIRouter } from './ai';

const router = getAIRouter();

// Använd Claude direkt
const claudeResponse = await router.getClaude().complete({
  messages: [{ role: 'user', content: '...' }],
  taskType: 'code'
});

// Använd z.ai direkt
const zaiResponse = await router.getZai().complete({
  messages: [{ role: 'user', content: '...' }],
  taskType: 'planning'
});
```

## API Keys

- **Claude**: https://console.anthropic.com/settings/keys
- **Z.ai**: https://open.bigmodel.cn/usercenter/apikeys

## Status

⚠️ **API Keys behöver uppdateras:**
- Claude: Token utgången
- Z.ai: Otillräcklig balans

Uppdatera keys i `.env` för att använda routern.
