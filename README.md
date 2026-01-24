# Yowyob Feedback Frontend

Application frontend Next.js (App Router) du projet Yowyob pour la collecte de feedbacks, l’authentification et l’exploration de contenus via un tableau de bord. Le projet propose une interface multilingue, une intégration Supabase et un assistant IA (YowBot) propulsé par Groq.

## Sommaire
- Aperçu
- Stack technique
- Fonctionnalités
- Prérequis
- Installation
- Configuration (variables d’environnement)
- Scripts NPM
- Structure du projet
- Internationalisation (i18n)
- Intégrations (Supabase, API Backend, YowBot/Groq)
- Développement
- Build & déploiement
- Dépannage

## Aperçu
- Framework: Next.js 16 (App Router) + TypeScript
- UI: React 19, CSS (styles modulaires et globaux)
- Auth: API backend (JWT côté navigateur via localStorage)
- Données: Supabase (ex: storage, auth publique si besoin)
- IA: Groq (chat completions) pour YowBot
- i18n: fichiers JSON et utilitaires internes + scripts de validation

## Stack technique
- next ^16.1.3
- react 19.2.0, react-dom 19.2.0
- typescript ^5
- @supabase/supabase-js ^2
- groq-sdk ^0.37.0
- framer-motion, lucide-react, @fortawesome/fontawesome-free

## Fonctionnalités
- Authentification (inscription, connexion, mot de passe oublié, 2FA via services dédiés)
- Pages Dashboard: feed, abonnements, projets, compte (édition de profil)
- Profil utilisateur public: /dashboard/account/user/[username]
- YowBot (assistant) via /app/api/chat
- Internationalisation (fr, en, es, de, zh, ko)

## Prérequis
- Node.js 18+ (recommandé) ou 20+
- npm (ou yarn/pnpm/bun)

## Installation
1) Cloner le dépôt
2) Installer les dépendances

```bash
npm install
# ou: yarn install | pnpm install | bun install
```

## Configuration (variables d’environnement)
Créez un fichier .env.local à la racine (recommandé pour vos valeurs locales). Exemple des variables utilisées dans ce projet:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=...        # https://<id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# URL du backend exposant l’API (utilisée par lib/api-client.ts)
# En dev, un proxy Next peut rediriger /api/v1 vers votre backend
NEXT_PUBLIC_API_URL=/api/v1

# Clé Groq pour l’assistant YowBot
GROQ_API_KEY=...
```

Remarques:
- lib/supabase.ts lit NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY.
- lib/api-client.ts lit NEXT_PUBLIC_API_URL (fallback: http://localhost:8080/api/v1).
- app/api/chat/route.ts lit GROQ_API_KEY.

Un fichier .env d’exemple peut exister dans le dépôt, adaptez-le à votre contexte et privilégiez .env.local pour vos secrets.

## Scripts NPM
```bash
npm run dev         # Démarre le serveur de dev Next.js
npm run build       # Build de production
npm run start       # Démarre le serveur en mode production (après build)

# Outils i18n (scripts/scripts/i18n-helper.js)
npm run i18n:check      # Vérifie clés/présence
npm run i18n:stats      # Statistiques de complétude
npm run i18n:validate   # Validation de structure
npm run i18n:report     # Rapport détaillé
```

## Structure du projet (extrait)
```
app/
  (marketing)/
  api/chat/route.ts        # API route Next pour YowBot (Groq)
  auth/                    # pages login / signup / forgot-password
  dashboard/               # feed, follow, project, account, yowbot
  layout.tsx, globals.css, ...
components/                # UI components (Header, Footer, Landing, etc.)
config/i18n.config.ts      # Config centrale i18n (meta)
lib/                       # services, api-client, i18n, supabase
locales/                   # fr.json, en.json, es.json, de.json, zh.json, ko.json
public/                    # assets
scripts/i18n-helper.js     # utilitaires CLI i18n
```

## Internationalisation (i18n)
- Fichiers de traductions: locales/*.json (fr, en, es, de, zh, ko)
- Helpers: lib/i18n.ts expose SUPPORTED_LOCALES, messages, noms, drapeaux
- Scripts d’audit: npm run i18n:* pour vérifier la cohérence des clés
- Composants: LanguageSwitcher, I18nProvider, etc.

## Intégrations

### Supabase
- Configuration dans lib/supabase.ts via NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY
- Utilisable pour stockage et/ou fonctionnalités temps réel selon besoins

### API Backend (Auth, etc.)
- Client HTTP: lib/api-client.ts
  - Base URL: NEXT_PUBLIC_API_URL (ex: /api/v1 via proxy Next en dev)
  - Auth: JWT stocké dans localStorage sous la clé yowyob_token (voir lib/services/jwt.service.ts)
- Services principaux: lib/services/auth.service.ts, password-reset.service.ts, two-factor.service.ts, user.service.ts

### YowBot (Groq)
- Route API: app/api/chat/route.ts
- Nécessite GROQ_API_KEY
- Modèle par défaut: llama-3.3-70b-versatile

## Développement
- Lancer le serveur de dev:

```bash
npm run dev
```

- Accès: http://localhost:3000
- Les pages App Router se trouvent dans app/
- Les variables NEXT_PUBLIC_* sont accessibles côté client; les autres restent côté serveur

## Build & Déploiement
- Build de production:

```bash
npm run build
npm run start
```

- Hébergement recommandé: Vercel (compatible App Router). Configurez vos variables d’environnement dans le dashboard Vercel (NEXT_PUBLIC_*, GROQ_API_KEY, etc.).
- Assurez-vous que NEXT_PUBLIC_API_URL pointe vers l’API backend publique en production.

## Dépannage
- 401/403 sur les appels API: vérifier la présence du token dans localStorage (clé yowyob_token) et la valeur de NEXT_PUBLIC_API_URL
- Erreurs Groq: vérifier GROQ_API_KEY et la région/quotas
- Problèmes i18n: exécuter les scripts npm run i18n:* pour diagnostiquer des clés manquantes
- Supabase: vérifier URL et clé anon; tester une requête simple côté client

---
Ce dépôt contient également README_I18N.md et TEST_GUIDE.md pour des informations complémentaires. 