# 🏥 GSB Frontend — Gestion des Notes de Frais

Application web de gestion des notes de frais développée pour **GSB (Galaxy Swiss Bourdin)**, permettant aux visiteurs médicaux de soumettre, suivre et gérer leurs frais professionnels. Les administrateurs (comptables) peuvent consulter et valider l'ensemble des notes.

## 📋 Table des matières

- [Aperçu](#aperçu)
- [Fonctionnalités](#fonctionnalités)
- [Stack technique](#stack-technique)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Lancement](#lancement)
- [Scripts disponibles](#scripts-disponibles)
- [Structure du projet](#structure-du-projet)
- [Variables d'environnement](#variables-denvironnement)
- [API Backend](#api-backend)

## Aperçu

GSB Frontend est une **Single Page Application (SPA)** construite avec React et Vite. Elle communique avec une API REST backend hébergée sur Render pour gérer l'authentification JWT et les opérations CRUD sur les notes de frais.

**Deux rôles utilisateurs :**
| Rôle | Description |
|------|-------------|
| **Visiteur** | Peut créer, modifier et supprimer ses propres notes de frais |
| **Admin** | Peut consulter, modifier le statut et gérer toutes les notes de frais |

## Fonctionnalités

### Authentification
- Inscription avec nom, email et mot de passe
- Connexion avec email et mot de passe
- Authentification par token JWT (stocké dans `localStorage`)
- Déconnexion avec nettoyage du token
- Routes protégées (redirection automatique vers `/login`)

### Tableau de bord
- Affichage de toutes les notes de frais de l'utilisateur
- Compteurs par statut : *En cours*, *En attente*, *Payé*
- Montant total affiché (admin uniquement)
- Recherche par ID ou email utilisateur
- Filtrage par statut
- Tri chronologique (plus récentes en premier)

### Gestion des notes de frais
- Création d'une nouvelle note avec justificatif (upload fichier)
- Modification d'une note existante
- Suppression avec confirmation
- Visualisation détaillée dans une modale
- Changement de statut (admin uniquement)

### Profil utilisateur
- Consultation des informations personnelles
- Modification du nom
- Affichage du rôle et de l'email
- Déconnexion depuis le profil

## Stack technique

| Technologie | Version | Rôle |
|---|---|---|
| **React** | 18.3 | Bibliothèque UI |
| **Vite** | 5.4 | Bundler & serveur de développement |
| **React Router DOM** | 6.22 | Routage SPA |
| **Tailwind CSS** | 3.4 | Framework CSS utilitaire |
| **Headless UI** | 1.7 | Composants accessibles (modales) |
| **date-fns** | 3.3 | Manipulation et formatage des dates |
| **jwt-decode** | 4.0 | Décodage des tokens JWT côté client |
| **React Icons** | 5.0 | Icônes (Feather Icons) |
| **ESLint** | 9.9 | Linting du code |
| **PostCSS + Autoprefixer** | — | Post-traitement CSS |

## Prérequis

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x (ou **yarn** / **pnpm**)
- Un navigateur moderne (Chrome, Firefox, Edge, Safari)

## Installation

```bash
# Cloner le dépôt
git clone <url-du-repo>
cd GSB_FRONTEND

# Installer les dépendances
npm install
```

## Lancement

```bash
# Mode développement (hot reload)
npm run dev

# L'application est accessible sur http://localhost:5173
```

### Build de production

```bash
# Générer le build optimisé
npm run build

# Prévisualiser le build
npm run preview
```

## Scripts disponibles

| Script | Commande | Description |
|--------|----------|-------------|
| `dev` | `npm run dev` | Lance le serveur de développement Vite |
| `build` | `npm run build` | Génère le build de production dans `/dist` |
| `preview` | `npm run preview` | Sert le build de production localement |
| `lint` | `npm run lint` | Vérifie le code avec ESLint |

## Structure du projet

```
GSB_FRONTEND/
├── public/                     # Fichiers statiques
├── src/
│   ├── assets/                 # Images et ressources
│   ├── components/
│   │   ├── auth/               # Composants d'authentification
│   │   │   ├── LoginForm.jsx   # Formulaire de connexion
│   │   │   └── SignupForm.jsx  # Formulaire d'inscription
│   │   ├── common/             # Composants réutilisables
│   │   │   ├── Button.jsx      # Bouton avec variantes
│   │   │   ├── Input.jsx       # Champ de saisie
│   │   │   ├── Modal.jsx       # Modale accessible (Headless UI)
│   │   │   ├── Navbar.jsx      # Barre de navigation
│   │   │   └── ProfileAvatar.jsx # Avatar utilisateur
│   │   └── dashboard/          # Composants du tableau de bord
│   │       ├── DropdownMenuPortal.jsx # Menu contextuel (portail)
│   │       ├── InvoiceItem.jsx  # Ligne de note de frais
│   │       ├── InvoiceList.jsx  # Liste avec recherche & filtres
│   │       └── NewInvoiceModal.jsx # Modale création/édition
│   ├── contexts/               # Contextes React (state global)
│   │   ├── AuthContext.jsx     # Authentification & JWT
│   │   └── InvoiceContext.jsx  # Gestion des notes de frais
│   ├── pages/                  # Pages de l'application
│   │   ├── Dashboard.jsx       # Tableau de bord principal
│   │   ├── Login.jsx           # Page de connexion
│   │   ├── Profile.jsx         # Page de profil
│   │   └── Signup.jsx          # Page d'inscription
│   ├── routes/
│   │   └── ProtectedRoute.jsx  # Garde de route authentifiée
│   ├── utils/                  # Fonctions utilitaires
│   ├── App.jsx                 # Composant racine & routing
│   ├── App.css                 # Styles globaux & animations
│   ├── index.css               # Configuration Tailwind & reset
│   └── main.jsx                # Point d'entrée React
├── index.html                  # Template HTML
├── package.json                # Dépendances & scripts
├── vite.config.js              # Configuration Vite
├── tailwind.config.js          # Configuration Tailwind CSS
├── postcss.config.js           # Configuration PostCSS
└── eslint.config.js            # Configuration ESLint
```

## Variables d'environnement

L'URL de l'API backend est actuellement codée en dur dans le code source :

```
https://gsb-backend-nti4.onrender.com
```

> **Note :** Pour un déploiement en production, il est recommandé d'utiliser une variable d'environnement `VITE_API_URL` dans un fichier `.env`.

## API Backend

L'application communique avec les endpoints suivants :

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| `POST` | `/auth/login` | Connexion utilisateur | Non |
| `POST` | `/users` | Inscription utilisateur | Non |
| `GET` | `/users/:email` | Récupérer un profil | Non |
| `PUT` | `/users/:email` | Modifier un profil | Non |
| `GET` | `/bills` | Lister les notes de frais | JWT |
| `POST` | `/bills` | Créer une note (multipart) | JWT |
| `PUT` | `/bills/:id` | Modifier une note | JWT |
| `DELETE` | `/bills/:id` | Supprimer une note | JWT |
| `POST` | `/upload` | Upload de justificatif | JWT |

---

**GSB Frontend** — Projet AP2 BTS SIO
