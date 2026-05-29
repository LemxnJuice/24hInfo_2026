# Projet Petit-Annonces (squelette)

Ce dépôt contient un squelette d'application de petites annonces (MVP) : Backend Node.js + TypeScript (Express + Prisma + PostgreSQL) et Frontend React + Vite. Le déploiement est prévu via Docker Compose et un reverse-proxy Nginx.

Structure
- backend/: code serveur (TypeScript, Express, Prisma)
- frontend/: client SPA React (Vite)
- nginx/: configuration Nginx pour reverse-proxy
- docker-compose.yml: orchestre services (db, backend, frontend, nginx)
- deploy/: scripts pour copier et démarrer le projet sur un VPS

Fonctionnalités incluses (squelette)
- Inscription / connexion (JWT)
- CRUD d'annonces (titre, description, prix, localisation, catégories, images, contact)
- Upload d'images stockées dans `backend/uploads`
- Recherche / filtrage basique via `/api/ads`

Installation locale (Linux/macOS)
1. Copier `.env.example` en `.env` et ajuster les variables.
2. Lancer `docker compose up --build` (Docker et Docker Compose doivent être installés).
3. Accéder au frontend sur http://localhost:5173 et à l'API sur http://localhost:4000

Déploiement sur VPS
- Voir `deploy/deploy.sh`. Par défaut le script cible `root@5.135.90.148` mais tu peux l'appeler avec :

  SSH_USER=root SSH_HOST=5.135.90.148 ./deploy/deploy.sh

- Le script copie le contenu sur le VPS puis installe Docker (si nécessaire) et lance `docker compose up -d --build`.

Remarques et prochaines étapes
- Le code fourni est un point de départ : il manque des validations, des middlewares d'authentification (protéger les routes), des tests et une politique de sécurité (CSRF, rate-limiting, gestion des tokens refresh, etc.).
- Il faudra générer une `JWT_SECRET` forte et la mettre dans `.env` avant de déployer.
- Pour production, configurer HTTPS (certificat fourni par la plateforme) et ajuster la configuration Nginx si besoin.

Si tu veux, je peux maintenant :
- 1) Finaliser l'API (auth middleware, endpoints pour la gestion du profil, favoris, masquer annonce),
- 2) Ajouter une interface pour poster/éditer des annonces côté frontend,
- 3) Déployer automatiquement sur le VPS (j'utiliserai les accès que tu as fournis) — confirme si je peux lancer le déploiement maintenant.


Seed / comptes de tests
- Un script de seed basique est fourni pour créer deux comptes :
  - admin@example.com / Admin123! (ADMIN)
  - user@example.com / User123! (USER)

Tu peux lancer le seed après le déploiement avec :

  docker compose run --rm backend node dist/prisma/seed.js

(s'il existe dans l'image après build)

