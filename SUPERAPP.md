# grokVoxel no SuperApp Minerva

Assistente de IA (Grok) para direção de vídeo. Monorepo; o app web fica em
**`apps/web`** (Next.js). É **local-first**: o servidor **spawna o binário `grok`
(grokbuild/SuperGrok)** e escreve no filesystem (`GROK_BIN`, `GROK_STUDIO_ROOT`).

## Deploy: VM Oracle (NÃO é Vercel)
Por ser local-first, não roda em serverless. Está hospedado na **VM Oracle**
(mesma do worker de voz do Recall), com o **motor 100% grok CLI**:
- **URL:** http://163.176.239.222:3030
- Serviço **systemd `grokvoxel`** (`next start -p 3030`, restart automático).
- grok CLI **logado no SuperGrok** na VM (`grok login --device-code`); sessão em
  `~/.grok/auth.json` (refresh automático). Env do serviço: `GROK_BIN=~/.grok/bin/grok`,
  `GROK_STUDIO_ROOT=~/grokvoxel-studio`, `mode=local-file-store`.
- Porta 3030 liberada no iptables da VM + na Security List da Oracle.
- Operacional: se o render parar por sessão expirada, re-rodar `grok login --device-code`
  na VM. Atualizar o código: `git pull` (ou rsync) em `~/grokvoxel`, `npm --prefix apps/web run build`, `sudo systemctl restart grokvoxel`.

Futuro: domínio + HTTPS (hoje é IP:porta HTTP, stopgap como o worker) e login via SuperApp.

## Como se pluga (identidade e RBAC centrais)
- **Login único** pelo SuperApp (broker OIDC, Google Workspace `@minerva.org.br`).
- **RBAC central:** papel do usuário vem do claim `papel` do token do SuperApp.
- **Catálogo:** slug/`aud` `grokvoxel`; papel mínimo colaborador; url = a da VM.

## Migração (quando o broker OIDC estiver pronto)
1. Em `apps/web`, adicionar o **provider OIDC do SuperApp** (verificação por JWKS).
2. Ler o `papel` do claim; não manter papéis próprios.
3. Registrar o grokVoxel como client OIDC no SuperApp (client_id, redirect_uri, aud).

## Contrato
Siga o contrato único: https://github.com/lucasmoreira-minerva/minerva-superapp/blob/main/dev/CONTRATO-INTEGRACAO.md
Não duplicar identidade nem papéis: a fonte é sempre o SuperApp.
