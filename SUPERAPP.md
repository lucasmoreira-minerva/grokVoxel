# grokVoxel no SuperApp Minerva

O grokVoxel é um assistente de IA (Grok) para direção de vídeo. Monorepo; o app web
fica em **`apps/web`** (Next.js 15). No ecossistema Minerva, é um **app cliente do
SuperApp**.

## Como se pluga (identidade e RBAC centrais)
- **Login único** pelo SuperApp (broker OIDC, Google Workspace `@minerva.org.br`).
- **RBAC central:** papel do usuário vem do claim `papel` do token do SuperApp.
- **Catálogo:** aparece na vitrine do portal.

## Dados no catálogo
- slug/`aud`: `grokvoxel`
- url: https://grokvoxel.vercel.app  (deploy em apps/web; ver nota de deploy abaixo)
- papel mínimo: colaborador

## Deploy (Vercel)
Projeto `grokvoxel` já criado, **Root Directory = `apps/web`**, framework Next. Se o
build falhar, confira as variáveis de ambiente do app (chave da API do Grok/supergrok)
nas Project Settings da Vercel.

## Migração (o que muda no grokVoxel)
1. Em `apps/web`, adicionar o **provider OIDC do SuperApp** (verificação por JWKS).
2. Ler o `papel` do claim; não manter papéis próprios.
3. Registrar o grokVoxel como client OIDC no SuperApp (client_id, redirect_uri, aud).

## Contrato
Siga o contrato único: https://github.com/lucasmoreira-minerva/minerva-superapp/blob/main/dev/CONTRATO-INTEGRACAO.md
Não duplicar identidade nem papéis: a fonte é sempre o SuperApp.
