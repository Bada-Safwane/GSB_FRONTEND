# 📘 Documentation Technique — GSB Frontend

> **Projet :** GSB — Gestion des Notes de Frais (Frontend)  
> **Version :** 0.1.0  
> **Date :** Mars 2026  
> **Contexte :** BTS SIO — Projet AP2  

---

## 1. Présentation générale

### 1.1 Objectif de l'application

L'application GSB Frontend est une interface web permettant aux **visiteurs médicaux** du laboratoire Galaxy Swiss Bourdin de :
- Soumettre leurs notes de frais avec justificatifs
- Suivre l'état de traitement de leurs notes (en cours, en attente, payé)
- Consulter et modifier leur profil

Les **administrateurs (comptables)** disposent en plus de :
- La visualisation de toutes les notes de frais de tous les utilisateurs
- La modification du statut des notes
- L'accès au montant total des dépenses

### 1.2 Architecture globale

L'application suit une architecture **client-serveur** :

```
┌─────────────────────┐         HTTPS / REST          ┌─────────────────────┐
│   GSB Frontend      │ ◄──────────────────────────►   │   GSB Backend       │
│   (React SPA)       │        JSON + JWT              │   (API REST)        │
│   Vite / Tailwind   │                                │   Render.com        │
└─────────────────────┘                                └─────────────────────┘
     Navigateur                                           Serveur distant
```

- **Frontend** : Application React monopage (SPA) servie par Vite
- **Backend** : API REST hébergée sur `https://gsb-backend-nti4.onrender.com`
- **Authentification** : Token JWT transmis via header `Authorization: Bearer <token>`

---

## 2. Stack technique détaillée

### 2.1 Dépendances de production

| Paquet | Version | Usage |
|--------|---------|-------|
| `react` | ^18.3.1 | Bibliothèque de rendu UI basée sur les composants |
| `react-dom` | ^18.3.1 | Rendu React dans le DOM du navigateur |
| `react-router-dom` | ^6.22.3 | Routage déclaratif côté client (SPA) |
| `@headlessui/react` | ^1.7.18 | Composants UI accessibles sans style (Dialog/Transition) |
| `date-fns` | ^3.3.1 | Utilitaires de manipulation de dates (format, parseISO) |
| `jwt-decode` | ^4.0.0 | Décodage de tokens JWT côté client (sans vérification de signature) |
| `react-icons` | ^5.0.1 | Collection d'icônes SVG (Feather Icons : Fi*) |

### 2.2 Dépendances de développement

| Paquet | Version | Usage |
|--------|---------|-------|
| `vite` | ^5.4.2 | Serveur de développement avec HMR + bundler de production |
| `@vitejs/plugin-react` | ^4.3.1 | Plugin Vite pour React (Babel + Fast Refresh) |
| `tailwindcss` | ^3.4.1 | Framework CSS utilitaire |
| `postcss` | ^8.4.35 | Outil de transformation CSS |
| `autoprefixer` | ^10.4.17 | Ajout automatique des préfixes vendeurs CSS |
| `eslint` | ^9.9.1 | Analyse statique du code JavaScript |
| `eslint-plugin-react` | ^7.35.0 | Règles ESLint spécifiques React |
| `eslint-plugin-react-hooks` | ^5.1.0-rc.0 | Validation des règles des Hooks React |
| `eslint-plugin-react-refresh` | ^0.4.11 | Validation du Hot Module Replacement |

### 2.3 Charte graphique / Design System

L'application utilise un design system inspiré d'Apple avec des couleurs personnalisées définies dans `tailwind.config.js` :

| Couleur | Code hexadécimal | Usage |
|---------|-----------------|-------|
| `primary-500` | `#0A84FF` | Actions principales, liens, accent (Apple Blue) |
| `success-500` | `#30D158` | Statut "payé" (Apple Green) |
| `warning-500` | `#FF9F0A` | Statut "en attente" (Apple Orange) |
| `error-500` | `#FF3B30` | Statut "en cours", erreurs (Apple Red) |
| `gray-50` → `gray-900` | — | Échelle de gris pour backgrounds, textes, bordures |

**Animations personnalisées :**
- `fade-in` : Apparition progressive (opacité 0→1, 300ms)
- `slide-in` : Glissement vers le haut (translateY 10px→0, 300ms)
- `scale-in` : Zoom léger (scale 0.95→1, 200ms)

---

## 3. Architecture applicative

### 3.1 Diagramme des composants

```
main.jsx
  └── BrowserRouter
       └── AuthProvider (Context)
            └── InvoiceProvider (Context)
                 └── App.jsx (Routes)
                      ├── /login ─────── Login.jsx
                      │                    └── LoginForm.jsx
                      ├── /signup ────── Signup.jsx
                      │                    └── SignupForm.jsx
                      ├── /dashboard ──── ProtectedRoute
                      │                    └── Dashboard.jsx
                      │                         ├── Navbar.jsx
                      │                         ├── InvoiceList.jsx
                      │                         │    └── InvoiceItem.jsx
                      │                         │         └── DropdownMenuPortal.jsx
                      │                         ├── NewInvoiceModal.jsx
                      │                         └── Modal.jsx (détails)
                      └── /profile ────── ProtectedRoute
                                           └── Profile.jsx
                                                └── Navbar.jsx
```

### 3.2 Routage

Défini dans `App.jsx` avec React Router v6 :

| Route | Composant | Protection | Redirection |
|-------|-----------|------------|-------------|
| `/` | — | Non | → `/dashboard` (si connecté) ou `/login` |
| `/login` | `Login` | Non | → `/dashboard` si déjà connecté |
| `/signup` | `Signup` | Non | → `/dashboard` si déjà connecté |
| `/dashboard` | `Dashboard` | `ProtectedRoute` | → `/login` si non connecté |
| `/profile` | `Profile` | `ProtectedRoute` | → `/login` si non connecté |

**`ProtectedRoute`** : Composant wrapper qui vérifie la présence d'un `user` dans le contexte d'authentification. Affiche un écran de chargement pendant la vérification, puis redirige vers `/login` si l'utilisateur n'est pas authentifié.

### 3.3 Gestion de l'état (State Management)

L'application utilise l'**API Context de React** pour la gestion de l'état global, sans bibliothèque externe (pas de Redux/Zustand).

#### AuthContext (`contexts/AuthContext.jsx`)

| Élément | Type | Description |
|---------|------|-------------|
| `token` | `string \| null` | Token JWT stocké en mémoire et dans `localStorage` |
| `user` | `object \| null` | Informations utilisateur décodées depuis le JWT |
| `loading` | `boolean` | État de chargement initial (vérification du token) |
| `login(email, password)` | `async function` | Appelle `POST /auth/login`, stocke le token, décode l'utilisateur |
| `logout()` | `function` | Supprime le token de `localStorage` et réinitialise l'état |
| `setToken` | `function` | Setter direct du token |
| `setUser` | `function` | Setter direct de l'utilisateur |

**Flot d'authentification :**

```
1. Montage du composant
   → Lecture du token depuis localStorage
   → Si token présent : décodage JWT → setUser(decoded)
   → Si token invalide : nettoyage localStorage
   → setLoading(false)

2. Connexion (login)
   → POST /auth/login { email, password }
   → Réception du token JWT
   → Stockage dans localStorage + state
   → Décodage JWT → setUser(decoded)
   → Navigation vers /dashboard

3. Déconnexion (logout)
   → Suppression token de localStorage
   → setToken(null), setUser(null)
   → Redirection vers /login
```

#### InvoiceContext (`contexts/InvoiceContext.jsx`)

| Élément | Type | Description |
|---------|------|-------------|
| `invoices` | `array` | Liste des notes de frais |
| `loading` | `boolean` | État de chargement |
| `addInvoice(data)` | `async function` | Crée une note via `POST /bills` (FormData multipart) |
| `updateInvoice(id, data)` | `async function` | Met à jour via `PUT /bills/:id` |
| `deleteInvoice(id)` | `async function` | Supprime via `DELETE /bills/:id` |

> **Note :** Le `Dashboard.jsx` gère également ses propres appels API directement (fetch des factures, suppression), en parallèle du contexte. Les deux approches coexistent dans le code actuel.

---

## 4. Description des composants

### 4.1 Composants communs (`components/common/`)

#### `Button.jsx`

Bouton réutilisable avec 5 variantes visuelles.

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `variant` | `string` | `'primary'` | Variante visuelle : `primary`, `secondary`, `success`, `danger`, `text` |
| `fullWidth` | `boolean` | `false` | Occupe toute la largeur du conteneur |
| `disabled` | `boolean` | `false` | Désactive le bouton |
| `type` | `string` | `'button'` | Type HTML du bouton |
| `onClick` | `function` | — | Callback au clic |
| `className` | `string` | `''` | Classes CSS additionnelles |

#### `Input.jsx`

Champ de saisie avec label, gestion d'erreur et indicateur de champ requis.

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `label` | `string` | — | Libellé affiché au-dessus du champ |
| `type` | `string` | `'text'` | Type HTML de l'input |
| `id` | `string` | — | Identifiant du champ (utilisé aussi comme `name`) |
| `error` | `string` | — | Message d'erreur affiché sous le champ |
| `required` | `boolean` | `false` | Affiche un astérisque rouge après le label |
| `placeholder` | `string` | — | Texte d'aide dans le champ |

#### `Modal.jsx`

Modale accessible utilisant Headless UI (`Dialog` + `Transition`).

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `isOpen` | `boolean` | — | Contrôle la visibilité de la modale |
| `onClose` | `function` | — | Callback de fermeture |
| `title` | `string` | — | Titre affiché dans l'en-tête |
| `children` | `ReactNode` | — | Contenu de la modale |
| `maxWidth` | `string` | `'max-w-md'` | Largeur maximale (classe Tailwind) |
| `footer` | `ReactNode` | — | Boutons d'action en pied de modale |

**Caractéristiques :**
- Overlay semi-transparent avec fermeture au clic
- Animations d'entrée/sortie (fade + scale)
- Focus initial sur le bouton de fermeture
- Fermeture avec la touche Échap

#### `Navbar.jsx`

Barre de navigation affichée sur les pages protégées.

**Éléments affichés :**
- Logo "Noted-GSB" (lien vers `/dashboard`)
- Avatar de l'utilisateur (lien vers `/profile`)
- Bouton de déconnexion (icône `FiLogOut`)

#### `ProfileAvatar.jsx`

Composant d'avatar circulaire avec 4 tailles.

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `src` | `string` | `'/avatar.jpg'` | URL de l'image de profil |
| `alt` | `string` | `'Profile'` | Texte alternatif |
| `size` | `string` | `'md'` | Taille : `sm` (32px), `md` (40px), `lg` (48px), `xl` (64px) |

### 4.2 Composants d'authentification (`components/auth/`)

#### `LoginForm.jsx`

Formulaire de connexion avec validation côté client.

**Champs :** email, mot de passe  
**Validation :** Tous les champs requis  
**Actions :** Appel de `login()` du contexte Auth → navigation vers `/dashboard`  
**Lien :** Redirection vers la page d'inscription

#### `SignupForm.jsx`

Formulaire d'inscription avec validation.

**Champs :** nom complet, email, mot de passe, confirmation du mot de passe  
**Validation :**
- Tous les champs requis
- Correspondance des mots de passe  

**Actions :** `POST /users` avec le rôle fixé à `"visiteur"` → callback `onSuccess`  
**Lien :** Redirection vers la page de connexion

### 4.3 Composants du tableau de bord (`components/dashboard/`)

#### `InvoiceList.jsx`

Liste des notes de frais avec recherche et filtrage.

**Fonctionnalités :**
- Barre de recherche par email utilisateur (admin) ou ID
- Filtre par statut (select) : Tous, Payé, En cours, En attente
- Tri par date décroissante
- Appel de `onFilterChange` à chaque changement de filtre (pour les compteurs)
- État vide avec invitation à créer une note

**PropTypes validés :**

```javascript
{
  invoices: PropTypes.arrayOf(PropTypes.shape({
    _id: PropTypes.string.isRequired,
    amount: PropTypes.number.isRequired,
    date: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
    description: PropTypes.string,
    type: PropTypes.string,
    proof: PropTypes.string,
    userEmail: PropTypes.string,
  })),
  onCreateNew: PropTypes.func.isRequired,
  onView: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onFilterChange: PropTypes.func,
}
```

#### `InvoiceItem.jsx`

Ligne individuelle d'une note de frais dans la liste.

**Informations affichées :**
- Type de note et ID
- Email utilisateur (admin uniquement)
- Date de création et date de facture
- Badge de statut coloré
- Montant

**Menu contextuel (3 points) :**
- Voir détails
- Modifier la note
- Supprimer la note (avec confirmation)

#### `NewInvoiceModal.jsx`

Modale de création et d'édition de note de frais.

**Mode création :**
- Champs : date, montant, description, type, justificatif (fichier obligatoire)
- Statut fixé à "en cours"
- Envoi via `POST /bills` en `multipart/form-data`

**Mode édition :**
- Pré-remplissage des champs avec les données existantes
- Upload optionnel d'un nouveau justificatif (via `POST /upload`)
- Envoi via `PUT /bills/:id` en JSON

**Particularités :**
- Les admins peuvent modifier le statut (select : En cours / En attente / Payé)
- Les visiteurs ont le statut en champ caché
- Détection des modifications (`isDirty`) avec confirmation avant fermeture
- Validation côté client (montant > 0, description requise, fichier requis en création)

#### `DropdownMenuPortal.jsx`

Menu déroulant rendu via un **portail React** (`createPortal`) directement dans `document.body`.

**Positionnement :** Calculé dynamiquement à partir du `getBoundingClientRect()` du bouton déclencheur.

**Fermeture :**
- Clic en dehors du menu
- Touche Échap

---

## 5. Pages

### 5.1 `Login.jsx`

Page de connexion minimaliste centrée. Affiche le titre "GSB", un sous-titre d'accueil et le composant `LoginForm` dans une carte blanche. Redirige vers `/dashboard` après connexion réussie.

### 5.2 `Signup.jsx`

Page d'inscription centrée. Affiche le formulaire `SignupForm` avec un lien vers les CGU. Redirige vers `/dashboard` après inscription réussie.

### 5.3 `Dashboard.jsx`

Page principale de l'application après connexion.

**Sections :**
1. **En-tête** : Message de bienvenue personnalisé avec le nom de l'utilisateur
2. **Compteurs** : Cartes affichant le nombre de notes par statut + montant total (admin)
3. **Liste des notes** : Composant `InvoiceList` avec search/filter
4. **Modales** : Création/édition (`NewInvoiceModal`) et détails (`Modal`)

**Gestion des données :**
- Fetch des factures au montage et après chaque création/édition (`fetchInvoices`)
- Suppression avec mise à jour immédiate de l'état local
- Formatage des dates via `date-fns` (support timestamp et ISO)

### 5.4 `Profile.jsx`

Page de profil utilisateur.

**Sections :**
1. **Bannière** : Header bleu avec avatar en overlay
2. **Informations** : Nom, email, rôle
3. **Édition** : Formulaire de modification du nom
4. **Déconnexion** : Bouton de sign out

**Données :** Fetch depuis `GET /users/:email` au montage, mise à jour via `PUT /users/:email`.

---

## 6. Communication avec l'API

### 6.1 URL de base

```
https://gsb-backend-nti4.onrender.com
```

> L'URL est actuellement en dur dans chaque composant effectuant des appels réseau.

### 6.2 Endpoints utilisés

#### Authentification

| Méthode | Endpoint | Body | Réponse | Headers Auth |
|---------|----------|------|---------|-------------|
| `POST` | `/auth/login` | `{ email, password }` | `{ token: "jwt..." }` | Non |
| `POST` | `/users` | `{ name, email, password, role }` | Objet utilisateur | Non |

#### Utilisateurs

| Méthode | Endpoint | Body | Réponse | Headers Auth |
|---------|----------|------|---------|-------------|
| `GET` | `/users/:email` | — | Objet utilisateur complet | Non |
| `PUT` | `/users/:email` | `{ name, email, ... }` | Objet utilisateur mis à jour | Non |

#### Notes de frais (Bills)

| Méthode | Endpoint | Body | Réponse | Headers Auth |
|---------|----------|------|---------|-------------|
| `GET` | `/bills` | — | `[{ _id, amount, date, status, ... }]` | `Bearer <token>` |
| `POST` | `/bills` | FormData: `proof` (file) + `metadata` (JSON string) | Objet facture créée | `Bearer <token>` |
| `PUT` | `/bills/:id` | JSON objet facture | Objet facture modifiée | `Bearer <token>` |
| `DELETE` | `/bills/:id` | — | — | `Bearer <token>` |

#### Upload

| Méthode | Endpoint | Body | Réponse | Headers Auth |
|---------|----------|------|---------|-------------|
| `POST` | `/upload` | FormData: `proof` (file) | `{ url: "https://..." }` | `Bearer <token>` |

### 6.3 Format du token JWT

Le token JWT décodé contient au minimum :

```json
{
  "email": "user@example.com",
  "name": "Nom Utilisateur",
  "role": "visiteur | admin",
  "iat": 1709316000,
  "exp": 1709402400
}
```

### 6.4 Modèle de données — Note de frais

```json
{
  "_id": "ObjectId (MongoDB)",
  "date": "dd/MM/yyyy",
  "amount": 150.00,
  "description": "Frais de déplacement",
  "status": "en cours | en attente | payé",
  "type": "facture",
  "proof": "https://url-du-justificatif.jpg",
  "user": "ObjectId du créateur",
  "userEmail": "user@example.com",
  "createdAt": "ISO 8601 timestamp"
}
```

---

## 7. Sécurité

### 7.1 Authentification

- Le token JWT est stocké dans `localStorage` (persistance entre sessions)
- Le token est envoyé dans le header `Authorization: Bearer <token>` pour chaque requête API protégée
- Le décodage du token est effectué côté client avec `jwt-decode` (pas de vérification de signature)
- En cas de token invalide au chargement, le token est supprimé et l'utilisateur est redirigé

### 7.2 Routes protégées

Le composant `ProtectedRoute` vérifie la présence de l'objet `user` dans le contexte `AuthContext`. Si `user` est `null` et que le chargement est terminé, l'utilisateur est redirigé vers `/login` via `<Navigate>`.

### 7.3 Gestion des rôles

Le rôle de l'utilisateur (`user.role`) est extrait du token JWT et conditionne :
- L'affichage de la carte "Montant total" sur le dashboard (admin uniquement)
- L'affichage de la colonne "Utilisateur" dans la liste des notes (admin uniquement)
- L'accès au select de modification du statut dans le formulaire de note (admin uniquement)
- La barre de recherche par email utilisateur (admin uniquement)

> **Limitation :** Le contrôle des rôles est uniquement côté frontend. La validation des permissions doit être assurée côté backend.

---

## 8. Configuration

### 8.1 Vite (`vite.config.js`)

Configuration minimale avec le plugin React :

```javascript
export default defineConfig({
  plugins: [react()],
})
```

### 8.2 Tailwind CSS (`tailwind.config.js`)

- **Content** : Scan de `index.html` et `src/**/*.{js,ts,jsx,tsx}`
- **Couleurs** : Palette personnalisée (primary, success, warning, error, gray)
- **Spacing** : Valeurs en pixels (8px, 16px, 24px, 32px, 48px, 64px)
- **Shadows** : 5 niveaux (sm, DEFAULT, md, lg, xl)
- **Border radius** : 5 niveaux (sm, DEFAULT, md, lg, xl)
- **Animations** : fade-in, slide-in, scale-in

### 8.3 ESLint (`eslint.config.js`)

Configuration flat (ESLint 9) avec :
- Règles recommandées JavaScript
- Règles recommandées React + JSX Runtime
- Règles React Hooks
- Plugin React Refresh (avertissement pour exports non-composants)
- Ignoration du dossier `dist`

---

## 9. Déploiement

### 9.1 Build

```bash
npm run build
```

Génère un dossier `dist/` contenant les fichiers statiques optimisés (HTML, CSS, JavaScript minifié).

### 9.2 Pré-requis de déploiement

- Serveur web capable de servir des fichiers statiques
- Configuration du **SPA fallback** : toutes les routes doivent rediriger vers `index.html` (nécessaire pour React Router)
- CORS correctement configuré sur le backend pour accepter les requêtes du domaine frontend

### 9.3 Améliorations recommandées

- [ ] Externaliser l'URL de l'API dans une variable d'environnement `VITE_API_URL`
- [ ] Ajouter un mécanisme de rafraîchissement automatique du token JWT
- [ ] Implémenter la gestion des erreurs réseau de manière centralisée (intercepteur)
- [ ] Ajouter des tests unitaires et d'intégration (Vitest, Testing Library)
- [ ] Mettre en place un service worker pour le mode offline
- [ ] Ajouter la pagination pour les listes de factures volumineuses

---

## 10. Glossaire

| Terme | Définition |
|-------|-----------|
| **SPA** | Single Page Application — application web à page unique |
| **JWT** | JSON Web Token — standard d'authentification basé sur des tokens signés |
| **Context API** | Mécanisme natif de React pour partager un état entre composants |
| **Headless UI** | Bibliothèque de composants UI accessibles, sans styles imposés |
| **Portal** | Technique React pour rendre un composant en dehors de son arbre DOM parent |
| **HMR** | Hot Module Replacement — mise à jour à chaud sans rechargement complet |
| **FormData** | Interface web pour construire des données multipart/form-data |
| **Visiteur** | Rôle utilisateur standard (visiteur médical) — peut gérer ses propres notes |
| **Admin** | Rôle administrateur (comptable) — peut gérer toutes les notes et changer les statuts |
