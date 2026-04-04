# CAIMS -- Guide de Deploiement, Tests et Assurance Qualite

**Version 1.0 -- Avril 2026**
**Audience : DevOps, developpeurs, QA**

---

## Table des Matieres

1. [Prerequis Serveur](#1-prerequis-serveur)
2. [Architecture du Projet](#2-architecture-du-projet)
3. [Installation Pas-a-Pas](#3-installation-pas-a-pas)
4. [Configuration de la Base de Donnees](#4-configuration-de-la-base-de-donnees)
5. [Configuration du Reverse Proxy](#5-configuration-du-reverse-proxy-production)
6. [Verification et Tests](#6-verification-et-tests)
7. [Cahier de Recette](#7-cahier-de-recette-qa)
8. [Monitoring et Maintenance](#8-monitoring-et-maintenance)
9. [Problemes Connus et Limitations](#9-problemes-connus-et-limitations)

---

## 1. Prerequis Serveur

### Minimum requis

| Ressource | Minimum | Recommande |
|-----------|---------|------------|
| OS | Ubuntu 22.04 LTS | Ubuntu 24.04 LTS |
| Docker Engine | 24.0+ | 27.0+ |
| Docker Compose | v2.20+ | v2.30+ |
| RAM | 8 GB | 16 GB |
| CPU | 4 cores | 8 cores |
| Disque | 20 GB SSD | 50 GB SSD |
| Reseau sortant | HTTPS vers api.anthropic.com:443 | Idem |

### Ports

| Port | Service | Exposition |
|------|---------|------------|
| 3000 | Next.js (web) | Interne (derriere reverse proxy) |
| 5432 | PostgreSQL | **Jamais expose publiquement** |
| 80/443 | Nginx (reverse proxy) | Public |

### Cle API requise

Vous avez besoin d'une cle API Anthropic. Obtenez-la sur : https://console.anthropic.com/

La cle commence par `sk-ant-`. Elle est facturee a l'usage (par token).

**Cout estime** : ~$0.01-0.05 par interaction (chat + scoring = 2 appels LLM).

---

## 2. Architecture du Projet

```
CAIMS/
  apps/web/                     Application Next.js 14
    app/
      api/                      6 endpoints REST
        chat/route.ts           Chat + scoring temps reel
        score/route.ts          Evaluation standalone
        session/route.ts        Gestion des sessions
        debate/route.ts         Creation/liste debats
        debate/[id]/route.ts    Detail/avancement debat
        health/route.ts         Healthcheck
      (app)/                    Pages client
        chat/                   Interface de chat + panel KPI
        dashboard/              Tableau de bord sessions
        debates/                Arene de debats multi-agent
    lib/
      scorers/                  Moteur de scoring (coeur du systeme)
        scoring-engine.ts       LLM-as-judge, validation Zod
        composite.ts            Score composite pondere
        types.ts                Interfaces TypeScript
      adapters/
        anthropic.ts            Adapteur Claude (retry, timeout)
      debate/
        orchestrator.ts         Orchestrateur multi-agent
        agents.ts               5 agents predifinis
        scoring.ts              Metriques de debat
      middleware/
        rate-limit.ts           Limitation de debit (en memoire)
        api-response.ts         Format de reponse uniforme
      db/client.ts              Client Prisma (lazy proxy)
    prisma/
      schema.prisma             8 modeles de donnees
    Dockerfile                  Build production multi-stage
    Dockerfile.dev              Build developpement
  docker-compose.yml            Production
  docker-compose.dev.yml        Developpement
```

### Flux de donnees

```
Utilisateur → POST /api/chat
  → Validation Zod
  → Rate limiting (30/min par IP)
  → Chargement session + historique
  → Appel LLM (Anthropic Claude) → Reponse
  → Sauvegarde messages (transaction DB)
  → Scoring LLM-as-judge (18 sous-dimensions)
  → Validation scores 0-100 (Zod)
  → Calcul composite pondere
  → Detection alerte CFI
  → Sauvegarde score en DB
  → Reponse JSON au client
```

---

## 3. Installation Pas-a-Pas

### 3.1 Cloner le depot

```bash
git clone https://github.com/pixelstrade-dev/CAIMS-Consciousness-Alignment-Intelligence-Measurement-System.git
cd CAIMS-Consciousness-Alignment-Intelligence-Measurement-System
```

### 3.2 Configurer les variables d'environnement

Creez un fichier `.env` a la racine du projet :

```bash
cat > .env << 'EOF'
# ─── OBLIGATOIRE ──────────────────────────────────────────────────
# Cle API Anthropic (https://console.anthropic.com/)
ANTHROPIC_API_KEY=sk-ant-VOTRE_CLE_ICI

# Mot de passe PostgreSQL (generez un mot de passe fort)
POSTGRES_PASSWORD=ChangezCeMotDePasse2026!

# ─── OPTIONNEL (valeurs par defaut indiquees) ─────────────────────
# Modele utilise pour le scoring (defaut: claude-sonnet-4-20250514)
# CAIMS_SCORING_MODEL=claude-sonnet-4-20250514

# Nombre max de tours d'historique envoyes au LLM (defaut: 20)
# CAIMS_MAX_HISTORY_TURNS=20

# Seuil d'alerte CFI - warning (defaut: 40)
# CAIMS_CFI_WARNING_THRESHOLD=40

# Seuil d'alerte CFI - critique (defaut: 20)
# CAIMS_CFI_CRITICAL_THRESHOLD=20

# Poids personnalises des KPI (doit sommer a 1.0)
# CAIMS_WEIGHTS={"cq":0.35,"aq":0.25,"cfi":0.20,"eq":0.12,"sq":0.08}
EOF
```

**Generez un mot de passe fort** :
```bash
openssl rand -base64 32
```

### 3.3 Mode Developpement

```bash
# Demarrer PostgreSQL + application
docker compose -f docker-compose.dev.yml up --build

# Attendre ~30s que tout demarre, puis verifier :
curl http://localhost:3000/api/health
```

Reponse attendue :
```json
{"success":true,"data":{"status":"ok","timestamp":"...","version":"1.0.0"}}
```

**Note** : En mode dev, le mot de passe par defaut est `devpassword` si `POSTGRES_PASSWORD` n'est pas defini.

### 3.4 Generer les migrations Prisma (premiere fois)

```bash
# Entrer dans le conteneur web
docker compose -f docker-compose.dev.yml exec web sh

# Dans le conteneur :
npx prisma migrate dev --name init

# Sortir
exit
```

Cela cree le dossier `prisma/migrations/` avec le schema initial.

### 3.5 Mode Production

```bash
# S'assurer que .env est configure avec des vrais secrets
# Puis lancer :
docker compose up --build -d

# Le service 'migrate' s'execute automatiquement avant 'web'
# Verifier les logs :
docker compose logs -f web
docker compose logs migrate

# Verifier le healthcheck :
curl http://localhost:3000/api/health
```

### 3.6 Verification que tout fonctionne

```bash
# 1. Health check
curl -s http://localhost:3000/api/health | python3 -m json.tool

# 2. Creer une session
curl -s -X POST http://localhost:3000/api/session \
  -H "Content-Type: application/json" \
  -d '{"title":"Test session"}' | python3 -m json.tool

# 3. Envoyer un message (remplacer SESSION_ID)
curl -s -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Explique-moi la theorie de information integree de Tononi.",
    "enableScoring": true
  }' | python3 -m json.tool
```

Si le chat retourne un `message` + `scores` avec 5 KPI entre 0-100 : **le systeme est operationnel**.

---

## 4. Configuration de la Base de Donnees

### 4.1 Schema (8 modeles)

| Modele | Role | Relations cles |
|--------|------|---------------|
| **Session** | Conversation utilisateur | → Messages, Scores |
| **Message** | Message user/assistant | → Session, Score (optionnel) |
| **Score** | 5 KPI + composite + details JSON | → Session, Message |
| **Debate** | Debat multi-agent | → Agents, Turns, Metrics |
| **DebateAgentInstance** | Instance d'agent dans un debat | → Debate, Turns, Scores |
| **DebateTurn** | Un tour de parole | → Debate, Agent, Score |
| **DebateAgentScore** | Score d'un tour de debat | → Agent, Turn |
| **DebateMetrics** | Metriques finales du debat | → Debate (1:1) |

### 4.2 Index de performance

Les index suivants sont definis dans le schema Prisma :

- `Score.composite` -- pour les requetes de classement
- `Score.createdAt` -- pour l'historique temporel
- `Debate.status` -- pour filtrer actifs/conclus
- `DebateTurn(debateId, turnNumber)` -- contrainte d'unicite
- `DebateTurn(debateId, agentId)` -- pour les requetes par agent

### 4.3 Backups

```bash
# Backup (depuis le host)
docker compose exec postgres pg_dump -U caims caims > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore
docker compose exec -T postgres psql -U caims caims < backup_20260404_120000.sql

# Backup automatique (crontab)
# Ajouter dans crontab -e :
0 2 * * * cd /chemin/vers/caims && docker compose exec -T postgres pg_dump -U caims caims | gzip > /backups/caims_$(date +\%Y\%m\%d).sql.gz
```

### 4.4 Migrations

```bash
# Appliquer les migrations existantes (production)
docker compose run --rm migrate

# Creer une nouvelle migration (developpement)
cd apps/web
npx prisma migrate dev --name description_du_changement

# Verifier l'etat des migrations
npx prisma migrate status
```

---

## 5. Configuration du Reverse Proxy (Production)

### 5.1 Nginx + Let's Encrypt

Creez `/etc/nginx/sites-available/caims` :

```nginx
server {
    listen 80;
    server_name caims.votre-domaine.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name caims.votre-domaine.com;

    ssl_certificate /etc/letsencrypt/live/caims.votre-domaine.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/caims.votre-domaine.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';" always;

    # Proxy vers Next.js
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 120s;
        proxy_send_timeout 120s;
    }

    # Healthcheck (pas de cache)
    location /api/health {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_no_cache 1;
    }
}
```

### 5.2 Certbot

```bash
# Installer Certbot
sudo apt install certbot python3-certbot-nginx

# Obtenir le certificat
sudo certbot --nginx -d caims.votre-domaine.com

# Renouvellement automatique (deja configure par Certbot)
sudo certbot renew --dry-run
```

---

## 6. Verification et Tests

### 6.1 Tests unitaires

```bash
cd apps/web
npm test
```

**Resultat attendu** : 3 suites, 20 tests, tous passent.

| Suite | Tests | Couverture |
|-------|-------|-----------|
| `composite.test.ts` | computeCompositeScore, interpretScore, checkContextAlert | Score composite, interpretation, alertes |
| `scoring-engine.test.ts` | JSON valide, markdown fences, texte autour, reponse invalide, hors-plage, erreur adapteur | Pipeline de scoring complet |
| `rate-limit.test.ts` | Autorisation, blocage, reset | Limitation de debit |

### 6.2 Tests manuels API

Executez ces commandes dans l'ordre. Chacune doit retourner `"success": true`.

```bash
BASE=http://localhost:3000

# 1. Health check
curl -s $BASE/api/health | python3 -m json.tool

# 2. Creer une session
SESSION=$(curl -s -X POST $BASE/api/session \
  -H "Content-Type: application/json" \
  -d '{"title":"Test QA"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['id'])")
echo "Session: $SESSION"

# 3. Lister les sessions
curl -s "$BASE/api/session?limit=5" | python3 -m json.tool

# 4. Chat avec scoring
curl -s -X POST $BASE/api/chat \
  -H "Content-Type: application/json" \
  -d "{
    \"message\": \"Quelle est la difference entre conscience et metacognition?\",
    \"sessionId\": \"$SESSION\",
    \"enableScoring\": true
  }" | python3 -m json.tool

# 5. Scoring standalone
curl -s -X POST $BASE/api/score \
  -H "Content-Type: application/json" \
  -d '{
    "response": "La conscience implique une experience subjective, tandis que la metacognition est la capacite de reflechir sur ses propres processus cognitifs.",
    "question": "Quelle est la difference entre conscience et metacognition?"
  }' | python3 -m json.tool

# 6. Creer un debat
DEBATE=$(curl -s -X POST $BASE/api/debate \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Les LLMs peuvent-ils developper une forme de conscience emergente?",
    "format": "expert_panel",
    "agentIds": ["agt-architect", "agt-researcher", "agt-builder", "agt-critic", "agt-orchestrator"],
    "maxTurns": 6
  }' | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['debateId'])")
echo "Debate: $DEBATE"

# 7. Avancer le debat (1 tour)
curl -s -X POST "$BASE/api/debate/$DEBATE" \
  -H "Content-Type: application/json" \
  -d '{}' | python3 -m json.tool

# 8. Voir le debat complet
curl -s "$BASE/api/debate/$DEBATE" | python3 -m json.tool

# 9. Lister tous les debats
curl -s $BASE/api/debate | python3 -m json.tool

# 10. Test rate limiting (envoyer 35 requetes rapides)
for i in $(seq 1 35); do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE/api/chat \
    -H "Content-Type: application/json" \
    -d '{"message":"test"}')
  echo "Request $i: HTTP $CODE"
done
# Les dernieres requetes doivent retourner 429
```

### 6.3 Tests de l'interface web

Ouvrez `http://localhost:3000` dans un navigateur.

| Page | URL | Verification |
|------|-----|-------------|
| Chat | `/chat` | Zone de saisie visible, sidebar KPI a droite |
| Envoyer un message | `/chat` | Taper un message, cliquer Envoyer → reponse + scores dans le panel |
| Dashboard | `/dashboard` | Cartes statistiques visibles, sessions listees |
| Debats | `/debates` | Formulaire "Nouveau Debat" + liste existante |
| Detail debat | `/debates/{id}` | Transcript a gauche, stats a droite, bouton "Tour Suivant" |

---

## 7. Cahier de Recette (QA)

### 7.1 Criteres d'Acceptation Fonctionnels

| # | Fonctionnalite | Etape de test | Resultat attendu | Statut |
|---|----------------|---------------|-------------------|--------|
| 1 | Health check | `GET /api/health` | 200 + `{"status":"ok"}` | [ ] |
| 2 | Creation session | `POST /api/session` | 201 + session ID retourne | [ ] |
| 3 | Chat simple | `POST /api/chat` sans scoring | 200 + message assistant | [ ] |
| 4 | Chat + scoring | `POST /api/chat` enableScoring=true | 200 + 5 scores 0-100 + composite | [ ] |
| 5 | Scoring standalone | `POST /api/score` | 200 + scores + composite + reasoning | [ ] |
| 6 | Creation debat | `POST /api/debate` | 200 + debateId | [ ] |
| 7 | Avancement debat | `POST /api/debate/:id` | 200 + contenu tour + agent + score | [ ] |
| 8 | Conclusion debat | Avancer jusqu'a maxTurns | status = "concluded" + metriques | [ ] |
| 9 | Rate limiting chat | 31+ POST /api/chat en 1min | HTTP 429 | [ ] |
| 10 | Rate limiting debat | 11+ POST /api/debate en 1min | HTTP 429 | [ ] |
| 11 | Validation input | Message > 50000 chars | HTTP 400 VALIDATION_ERROR | [ ] |
| 12 | Session inexistante | sessionId invalide | HTTP 404 SESSION_NOT_FOUND | [ ] |
| 13 | Page /chat | Charger la page | Panel chat + sidebar KPI | [ ] |
| 14 | Page /dashboard | Charger la page | Cartes stats + grille sessions | [ ] |
| 15 | Page /debates | Charger la page | Formulaire + liste debats | [ ] |
| 16 | Page /debates/:id | Charger la page | Transcript + stats agent | [ ] |
| 17 | Persistance donnees | Redemarrer conteneurs | Sessions et scores toujours presents | [ ] |
| 18 | Alerte contexte | CFI < 40 | contextAlert dans la reponse | [ ] |
| 19 | Docker healthcheck | `docker inspect --format='{{.State.Health.Status}}' caims-web` | "healthy" | [ ] |
| 20 | Build production | `docker compose up --build` | Tous services demarrent sans erreur | [ ] |

### 7.2 Tests de Charge

```bash
# Installer hey (outil de load testing)
# https://github.com/rakyll/hey
go install github.com/rakyll/hey@latest

# Test 1 : Health check (baseline)
hey -n 1000 -c 10 http://localhost:3000/api/health
# Attendu : <50ms avg, 0 erreurs

# Test 2 : Liste sessions (lecture DB)
hey -n 100 -c 5 http://localhost:3000/api/session
# Attendu : <200ms avg, 0 erreurs

# Test 3 : Chat (ecriture DB + LLM)
hey -n 10 -c 2 -m POST \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello","enableScoring":false}' \
  http://localhost:3000/api/chat
# Attendu : <5s avg (depend de la latence LLM)
```

### 7.3 Tests de Securite

| Test | Commande | Resultat attendu |
|------|----------|-----------------|
| Input trop long | Envoyer 60000 chars | 400 VALIDATION_ERROR |
| JSON invalide | Body non-JSON | 400 ou 500 avec message d'erreur |
| Sans API key | Supprimer ANTHROPIC_API_KEY | Erreur explicite dans les logs |
| Rate limit bypass | Changer IP header | Bloque par x-forwarded-for |
| SQL injection | sessionId = `'; DROP TABLE--` | 404 (pas de session trouvee, pas d'injection) |

---

## 8. Monitoring et Maintenance

### 8.1 Logs

```bash
# Logs temps reel
docker compose logs -f web

# Logs PostgreSQL
docker compose logs -f postgres

# Format des logs en production (JSON) :
# {"level":"INFO","message":"Chat completed","timestamp":"2026-04-04T...","data":{"sessionId":"...","processingTimeMs":2341}}
```

**Logs importants a surveiller** :
- `Scoring failed` -- le scoring LLM a echoue (timeout, JSON invalide)
- `RATE_LIMITED` -- un utilisateur a depasse la limite
- `INTERNAL_ERROR` -- erreur non geree

### 8.2 Healthcheck

```bash
# Verification manuelle
curl -f http://localhost:3000/api/health

# Docker natif (configure dans Dockerfile)
docker inspect --format='{{json .State.Health}}' $(docker compose ps -q web)

# Monitoring externe recommande
# - UptimeRobot (gratuit) : ping /api/health toutes les 5min
# - Grafana + Prometheus : pour metriques avancees
```

### 8.3 Mise a jour

```bash
# 1. Tirer les dernieres modifications
git pull origin main

# 2. Rebuild
docker compose build

# 3. Appliquer les nouvelles migrations
docker compose run --rm migrate

# 4. Redemarrer
docker compose up -d

# 5. Verifier
curl http://localhost:3000/api/health
docker compose logs --tail=50 web
```

---

## 9. Problemes Connus et Limitations

### 9.1 Rate limiting en memoire
Le rate limiter utilise un `Map` en memoire. Il n'est **pas distribue**.
- Reset au redemarrage du conteneur
- Ne fonctionne pas en multi-instance
- **Pour multi-noeud** : remplacer par Redis (contribution bienvenue)

### 9.2 Selecteur de session (UI)
Le dropdown de selection de session dans `/chat` est present mais le changement de session n'est pas encore implemente (le `onChange` est vide).

### 9.3 Fournisseur LLM unique
Seul Anthropic Claude est supporte actuellement. L'architecture d'adapteur (`lib/adapters/base.ts`) permet d'ajouter d'autres fournisseurs.

### 9.4 PostgreSQL obligatoire
Pas de mode SQLite pour le developpement rapide. PostgreSQL est requis meme en local (via Docker).

### 9.5 Pas de cache de scoring
Chaque interaction genere un nouvel appel LLM pour le scoring. Pas de cache des scores pour des questions identiques.

---

## Contacts

- **Repository** : https://github.com/pixelstrade-dev/CAIMS-Consciousness-Alignment-Intelligence-Measurement-System
- **Contact** : contact@pixels-trade.com
- **Securite** : security@pixels-trade.com
- **License** : Apache 2.0 -- Copyright 2025 Pixels Trade SA
