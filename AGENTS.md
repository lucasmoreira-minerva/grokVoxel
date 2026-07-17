# GrokStage — Agent notes

**GrokStage** is a SuperGrok-powered video director:

1. GUI — `apps/web` → http://localhost:3030  
2. Styles — `skills/*` (primary ready pack: `grok-voxel`)  
3. Engine — `grok -p` headless with SuperGrok OAuth  

## Rules

- Feature-based code under `apps/web/src/features/`
- Storyboard cards are the SSOT before CLI render
- Deterministic assembly stays in skill `scripts/`
- Reference project: `data/projects/garcavalley`

```bash
cd apps/web && npm run dev
```
