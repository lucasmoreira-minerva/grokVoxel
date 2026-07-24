# grokVoxel no SuperApp Minerva

Assistente de IA (Grok) para direção de vídeo. Monorepo; o app web fica em
**`apps/web`** (Next.js). É **local-first**: o servidor **spawna o binário local
`grok` (grokbuild)** e escreve no filesystem local (`GROK_BIN`, `GROK_STUDIO_ROOT`).

## Deploy: NÃO é Vercel
Por ser local-first, o grokVoxel **não roda em serverless** (o Vercel não tem o
binário `grok` nem disco gravável). Dois pontos ao hospedar:
- **Host de verdade** com o grok CLI instalado + filesystem persistente
  (Coolify/Hostinger ou a VM Oracle), no modelo do Cockpit. Env necessárias no host:
  `GROK_BIN` (caminho do grok), `GROK_STUDIO_ROOT` (raiz de trabalho),
  `DATABASE_URL` (Neon, opcional; sem ela usa file-store local), `GROK_STUDIO_DRY_RUN`.
- **Versão do Next**: o `apps/web` está numa versão de Next bloqueada por CVE em
  alguns hosts; subir para uma versão corrigida antes de publicar.
- Alternativa (projeto à parte): trocar o grok CLI pela **API HTTP da xAI** + storage
  para virar serverless (Vercel), mas isso é uma re-arquitetura.

Enquanto não há host, o card fica **inativo** no portal.

## Como se pluga (quando hospedado)
- **Login único** pelo SuperApp (broker OIDC, Google Workspace `@minerva.org.br`).
- **RBAC central:** papel do usuário vem do claim `papel` do token do SuperApp.
- **Catálogo:** slug/`aud` `grokvoxel`; papel mínimo colaborador; url = a do host real.

## Migração (quando hospedado)
1. Em `apps/web`, adicionar o **provider OIDC do SuperApp** (verificação por JWKS).
2. Ler o `papel` do claim; não manter papéis próprios.
3. Registrar o grokVoxel como client OIDC no SuperApp (client_id, redirect_uri, aud).

## Contrato
Siga o contrato único: https://github.com/lucasmoreira-minerva/minerva-superapp/blob/main/dev/CONTRATO-INTEGRACAO.md
Não duplicar identidade nem papéis: a fonte é sempre o SuperApp.
