# Instructions de Développement React

## Guide Complet pour le Développement d'Applications React

**Version:** 1.0.0
**Date:** 2025-09-24
**Langue:** Français (Documentation) / Anglais (Code)

---

## Table des Matières

1. [Configuration et Setup du Projet](#1-configuration-et-setup-du-projet)
2. [Conventions de Codage et Bonnes Pratiques](#2-conventions-de-codage-et-bonnes-pratiques)
3. [Architecture des Composants](#3-architecture-des-composants)
4. [Gestion d'État](#4-gestion-détat)
5. [Guidelines de Styling et Interface Utilisateur](#5-guidelines-de-styling-et-interface-utilisateur)
6. [Structure d'Organisation des Fichiers](#6-structure-dorganisation-des-fichiers)
7. [Workflow de Développement](#7-workflow-de-développement)
8. [Considérations de Déploiement](#8-considérations-de-déploiement)

---

## Principes Fondamentaux

### Environnement de Développement
- **Système d'Exploitation:** Windows 11 (environnement principal)
- **IDE:** Visual Studio Code avec extensions recommandées
- **Terminal:** Command Prompt (cmd.exe) ou PowerShell
- **Gestionnaire de Versions:** Git avec interface VSCode intégrée

### Préférences de Ligne de Commande
- **Opérations de fichiers:** Préférer les commandes CLI (`copy`, `del`, `move`) plutôt que de retaper manuellement le contenu des fichiers
- **Renommage de fichiers:** Utiliser `move oldname newname` pour renommer les fichiers
- **Suppression de fichiers:** Utiliser `del filename` pour supprimer les fichiers
- **Copie de fichiers:** Utiliser `copy source destination` pour copier les fichiers
- **Création de répertoires:** Utiliser `mkdir dirname` pour créer des répertoires

### Standards Techniques
- **Stack Technique:** React (dernière version stable)
- **Code:** Anglais exclusivement (noms de fonctions, variables, méthodes)
- **Commentaires:** Français exclusivement
- **Labels UI et Ressources:** Français exclusivement
- **Messages de commit:** Français exclusivement
- **Tests Unitaires:** Non requis
- **Scripts de Migration:** Non requis
- **Compatibilité Arrière:** Non considérée

### Paradigmes Modernes
- Composants fonctionnels avec Hooks
- React 18+ avec fonctionnalités concurrentes
- Patterns de composition avancés
- Gestion d'état moderne avec hooks

### Règles de Réutilisabilité du Code
- **DRY (Don't Repeat Yourself)** : Éviter la duplication de code à tout prix
- **Réutilisation des composants** : Créer des composants réutilisables plutôt que dupliquer du JSX
- **Extraction de logique commune** : Toute logique répétée doit être extraite dans des hooks, utilitaires ou composants
- **Composants partagés** : Les éléments d'interface identiques (boutons, cartes, formulaires) doivent utiliser les mêmes composants
- **Consistance d'interface** : Tous les écrans similaires doivent avoir la même apparence et comportement
- **Maintenance centralisée** : Les changements d'interface ne doivent être effectués qu'à un seul endroit

### Règles de Renommage et Cohérence
- **Renommage de concepts métier** : Lorsque l'utilisateur demande de renommer ou changer des libellés (ex. : "Identifiant" devient "Numéro de membre"), il faut s'assurer que les noms de fichiers, variables, fonctions, etc. suivent en conséquence
- **Exemple** : Si le concept de "Identifiant" devient "Numéro de membre", une variable `id` devrait être renommée `noMembre` ou `numeroMembre`
- **Cohérence globale** : Tous les éléments du code (variables, fonctions, fichiers, commentaires) doivent refléter le nouveau concept métier
- **Migration complète** : Ne pas se limiter au changement d'un seul libellé UI, mais effectuer une migration complète du concept dans tout le code

---

## 1. Configuration et Setup du Projet

### 1.1 Initialisation du Projet

```bash
# Création d'un nouveau projet React avec Vite (recommandé)
npm create vite@latest mon-projet-react -- --template react

# Navigation vers le répertoire du projet
cd mon-projet-react

# Installation des dépendances
npm install
```

### 1.2 Configuration de Base

#### `package.json` - Configuration Essentielle

```json
{
  "name": "mon-projet-react",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.0.0",
    "vite": "^4.4.0"
  }
}
```

#### `vite.config.js` - Configuration Vite

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
```

#### Configuration Vite pour Développement Optimal

```javascript
// vite.config.js - Configuration de développement avancée
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    host: true, // Permet l'accès depuis l'extérieur
    cors: true,
    hmr: {
      overlay: true // Affiche les erreurs en overlay
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['lucide-react']
        }
      }
    }
  },
  // Configuration pour le développement
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version)
  },
  // Optimisations de développement
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom']
  }
})
```

#### Instructions de Démarrage du Serveur de Développement

```bash
# Démarrage du serveur de développement
npm run dev

# Options avancées
npm run dev -- --host 0.0.0.0 --port 3000

# Build de développement avec watch
npm run build -- --watch

# Preview du build de production
npm run preview
```

#### Configuration VSCode pour Vite

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Launch Vite Dev Server",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/vite",
      "args": ["--open"],
      "cwd": "${workspaceFolder}",
      "console": "integratedTerminal",
      "skipFiles": ["<node_internals>/**"]
    },
    {
      "name": "Debug Vite App",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000",
      "webRoot": "${workspaceFolder}/src",
      "sourceMapPathOverrides": {
        "webpack:///src/*": "${webRoot}/*"
      }
    }
  ]
}
```

#### Profils de Développement Recommandés

```json
// .vscode/settings.json
{
  "emmet.includeLanguages": {
    "javascript": "javascriptreact",
    "typescript": "typescriptreact"
  },
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "files.associations": {
    "*.css": "tailwindcss"
  },
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ]
}
```

### 1.3 Structure de Base du Projet

```
mon-projet-react/
├── public/
│   └── vite.svg
├── src/
│   ├── assets/
│   ├── components/
│   ├── hooks/
│   ├── pages/
│   ├── services/
│   ├── styles/
│   ├── utils/
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
└── vite.config.js
```

---

## 2. Conventions de Codage et Bonnes Pratiques

### 2.1 Nommage des Éléments

#### Variables et Fonctions
```javascript
// ✅ Correct - Noms en anglais, camelCase
const userName = 'John Doe'
const isUserAuthenticated = true
const handleUserLogin = () => {}

function calculateTotalPrice(items) {
  return items.reduce((total, item) => total + item.price, 0)
}

// ❌ Incorrect - Noms en français
const nomUtilisateur = 'John Doe'
const estUtilisateurAuthentifié = true
const gérerConnexionUtilisateur = () => {}
```

#### Composants React
```javascript
// ✅ Correct - PascalCase, noms descriptifs en anglais
function UserProfile() { return <div>User Profile</div> }
function ProductList() { return <div>Product List</div> }
function NavigationHeader() { return <div>Header</div> }

// ❌ Incorrect - Noms en français ou kebab-case
function ProfilUtilisateur() { return <div>User Profile</div> }
function ListeProduits() { return <div>Product List</div> }
function EnTêteNavigation() { return <div>Header</div> }
```

#### Fichiers et Dossiers
```javascript
// ✅ Correct - Noms en anglais, kebab-case pour les fichiers
components/UserProfile.jsx
components/ProductList.jsx
hooks/useAuthentication.js
utils/dataFormatter.js

// ❌ Incorrect - Noms en français
composants/ProfilUtilisateur.jsx
composants/ListeProduits.jsx
crochets/utiliserAuthentification.js
utilitaires/formateurDonnées.js
```

### 2.2 Commentaires en Français

#### Commentaires de Fonction
```javascript
/**
 * Calcule le prix total d'une liste d'articles avec TVA
 * @param {Array} items - Liste des articles avec propriétés price et quantity
 * @returns {number} Prix total avec TVA incluse
 */
function calculateTotalPrice(items) {
  const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0)
  const taxRate = 0.20 // TVA à 20%
  return subtotal * (1 + taxRate)
}
```

#### Commentaires de Composant
```javascript
/**
 * Composant d'en-tête de navigation principal
 * Gère l'affichage du logo, menu de navigation et actions utilisateur
 * @returns {JSX.Element} Élément JSX du composant Header
 */
function NavigationHeader() {
  // Rendu du composant avec logique de navigation
  return (
    <header className="navigation-header">
      {/* Contenu du composant */}
    </header>
  )
}
```

#### 2.2.3 Documentation des En-têtes de Fichiers

##### Exigence d'En-tête
Tous les fichiers de code doivent comporter un commentaire d'en-tête obligatoire qui décrit les fonctionnalités principales et l'objectif métier du fichier. L'accent doit être mis sur la logique métier plutôt que sur les détails techniques d'implémentation.

##### Structure de l'En-tête
L'en-tête doit inclure :
- **Nom et objectif du fichier** : Description claire du fichier et de son rôle
- **Fonctionnalités métier principales** : Description des fonctionnalités business implémentées
- **Justification métier** : Explication de la raison d'être du fichier dans le contexte business
- **Informations de création** : Date de création et auteur

##### Exemples d'En-têtes

**Exemple pour un composant React :**
```javascript
/**
 * Composant de profil utilisateur - Gestion du profil et paramètres utilisateur
 *
 * Fonctionnalités métier :
 * - Affichage des informations personnelles de l'utilisateur
 * - Gestion des préférences et paramètres du compte
 * - Mise à jour des données de profil en temps réel
 *
 * Objectif : Permettre aux utilisateurs de consulter et modifier
 * leurs informations personnelles de manière intuitive et sécurisée.
 *
 * @created 2025-01-15
 * @author Équipe Développement
 */
function UserProfile({ user, onUpdate }) {
  // Logique du composant
}
```

**Exemple pour un service API :**
```javascript
/**
 * Service d'authentification utilisateur - Gestion de l'identité et des accès
 *
 * Fonctionnalités métier :
 * - Authentification des utilisateurs via email/mot de passe
 * - Gestion des sessions et tokens d'accès
 * - Vérification des permissions et autorisations
 * - Déconnexion sécurisée et nettoyage des sessions
 *
 * Objectif : Sécuriser l'accès à l'application en validant
 * l'identité des utilisateurs et en contrôlant leurs permissions
 * selon leur rôle et leurs droits d'accès.
 *
 * @created 2025-01-15
 * @author Équipe Développement
 */
class AuthService {
  // Méthodes du service
}
```

**Exemple pour un utilitaire métier :**
```javascript
/**
 * Utilitaires de validation des données - Contrôles de cohérence métier
 *
 * Fonctionnalités métier :
 * - Validation des formats d'email et numéros de téléphone
 * - Contrôle de la cohérence des données produit (prix, stock, etc.)
 * - Validation des règles métier spécifiques au domaine
 * - Formatage et nettoyage des données utilisateur
 *
 * Objectif : Garantir la qualité et la cohérence des données
 * saisies par les utilisateurs en appliquant les règles
 * métier définies par l'entreprise.
 *
 * @created 2025-01-15
 * @author Équipe Développement
 */
const ValidationUtils = {
  // Fonctions utilitaires
}
```

**Exemple pour un fichier CSS :**
```css
/**
 * Styles du composant de navigation - Interface de navigation principale
 *
 * Fonctionnalités métier :
 * - Menu de navigation avec hiérarchie des sections
 * - Indicateurs visuels pour la navigation active
 * - Responsive design pour mobile et desktop
 * - Animations fluides pour les interactions utilisateur
 *
 * Objectif : Fournir une navigation intuitive et accessible
 * permettant aux utilisateurs de se repérer facilement
 * dans l'application et d'accéder rapidement aux fonctionnalités.
 *
 * @created 2025-01-15
 * @author Équipe Développement
 */

/* Styles CSS du composant de navigation */
.navigation-header {
  /* Styles d'implémentation */
}
```

##### Intégration dans le Workflow
- **Obligatoire** : Tous les fichiers de code doivent avoir un en-tête
- **Mise à jour** : L'en-tête doit être mis à jour lors des modifications majeures
- **Révision** : Les en-têtes sont revus lors des revues de code
- **Documentation** : Les en-têtes font partie de la documentation technique

### 2.3 Structure des Composants

#### Composant Fonctionnel avec Hooks
```javascript
import { useState, useEffect } from 'react'

/**
 * Composant de formulaire de contact
 * Gère la soumission et validation des données de contact
 */
function ContactForm() {
  // État local pour les données du formulaire
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })

  // État pour la soumission
  const [isSubmitting, setIsSubmitting] = useState(false)

  /**
   * Gère les changements dans les champs du formulaire
   * Met à jour l'état avec les nouvelles valeurs
   */
  const handleInputChange = (event) => {
    const { name, value } = event.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  /**
   * Soumet le formulaire de contact
   * Envoie les données au service backend
   */
  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      // Logique de soumission
      await submitContactForm(formData)
    } catch (error) {
      // Gestion d'erreur
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Champs du formulaire */}
    </form>
  )
}
```

### 2.4 Organisation des Fonctions Utilitaires

Pour maintenir une séparation claire des responsabilités et favoriser la réutilisabilité, les fonctions susceptibles d'être utilisées dans plusieurs composants ou parties de l'application doivent être extraites des composants et placées dans des fichiers dédiés sous le répertoire `utils/`.

#### Exemples de Fonctions à Extraire

Voici des exemples de fonctions qui devraient être déplacées vers `utils/` plutôt que d'être définies directement dans les composants :

```javascript
// ❌ Incorrect - Fonction définie dans un composant
function RepoDetails() {
  /**
   * Formate la taille en bytes vers une unité lisible
   */
  const formatSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes'
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  // ... reste du composant
}
```

```javascript
// ✅ Correct - Fonction extraite vers utils/formatters.js
/**
 * Utilitaires de formatage - Fonctions de formatage réutilisables
 *
 * Fonctionnalités métier :
 * - Formatage des tailles de fichiers en unités lisibles
 * - Calcul du temps relatif en français
 * - Génération de couleurs basées sur les noms d'auteurs
 *
 * Objectif : Fournir des fonctions de formatage cohérentes
 * et réutilisables dans toute l'application.
 *
 * @created 2025-01-15
 * @author Équipe Développement
 */

/**
 * Formate la taille en bytes vers une unité lisible
 * @param {number} bytes - Taille en bytes
 * @returns {string} Taille formatée
 */
export const formatSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 Bytes'
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Calcule le temps relatif en français
 * @param {string} dateString - Date au format string
 * @returns {string} Temps relatif en français
 */
export const getRelativeTime = (dateString) => {
  const now = new Date()
  const date = new Date(dateString)
  const diffInSeconds = Math.floor((now - date) / 1000)

  if (diffInSeconds < 60) return `il y a ${diffInSeconds} seconde${diffInSeconds > 1 ? 's' : ''}`
  if (diffInSeconds < 3600) return `il y a ${Math.floor(diffInSeconds / 60)} minute${Math.floor(diffInSeconds / 60) > 1 ? 's' : ''}`
  if (diffInSeconds < 86400) return `il y a ${Math.floor(diffInSeconds / 3600)} heure${Math.floor(diffInSeconds / 3600) > 1 ? 's' : ''}`
  if (diffInSeconds < 604800) return `il y a ${Math.floor(diffInSeconds / 86400)} jour${Math.floor(diffInSeconds / 86400) > 1 ? 's' : ''}`
  if (diffInSeconds < 2592000) return `il y a ${Math.floor(diffInSeconds / 604800)} semaine${Math.floor(diffInSeconds / 604800) > 1 ? 's' : ''}`
  if (diffInSeconds < 31536000) return `il y a ${Math.floor(diffInSeconds / 2592000)} mois`
  return `il y a ${Math.floor(diffInSeconds / 31536000)} an${Math.floor(diffInSeconds / 31536000) > 1 ? 's' : ''}`
}

/**
 * Génère une couleur basée sur le nom de l'auteur
 * @param {string} authorName - Nom de l'auteur
 * @returns {string} Classes CSS pour la couleur
 */
export const getAuthorColor = (authorName) => {
  const colors = [
    'bg-blue-100 text-blue-800',
    'bg-green-100 text-green-800',
    'bg-yellow-100 text-yellow-800',
    'bg-red-100 text-red-800',
    'bg-purple-100 text-purple-800',
    'bg-pink-100 text-pink-800',
    'bg-indigo-100 text-indigo-800',
    'bg-gray-100 text-gray-800'
  ]
  let hash = 0
  for (let i = 0; i < authorName.length; i++) {
    hash = authorName.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}
```

#### Format des Commentaires JSDoc pour les Fonctions Utils

Toutes les fonctions dans les fichiers `utils/` doivent avoir des commentaires JSDoc complets incluant des exemples d'entrée et sortie. Le format standardisé est le suivant :

```javascript
/**
 * [Description courte de la fonction] - [Objectif métier]
 *
 * Fonctionnalités métier :
 * - [Liste des fonctionnalités principales]
 * - [Description de ce que fait la fonction]
 *
 * Objectif : [Explication de l'utilité métier de la fonction]
 *
 * @param {[Type]} paramName - Description du paramètre
 * @returns {[Type]} Description de la valeur de retour
 *
 * @example
 * // Entrée
 * functionName(inputValue)
 *
 * // Sortie
 * expectedOutput
 *
 * @example
 * // Entrée (cas alternatif)
 * functionName(otherInput)
 *
 * // Sortie
 * otherExpectedOutput
 */
export const functionName = (paramName) => {
  // Implémentation
}
```

**Exemples détaillés :**

```javascript
/**
 * Formate la taille en bytes vers une unité lisible
 * @param {number} bytes - Taille en bytes
 * @returns {string} Taille formatée
 *
 * @example
 * // Entrée
 * formatSize(1024)
 *
 * // Sortie
 * "1 KB"
 *
 * @example
 * // Entrée
 * formatSize(0)
 *
 * // Sortie
 * "0 Bytes"
 */
export const formatSize = (bytes) => {
  // Implémentation
}
```

```javascript
/**
 * Génère des couleurs basées sur le nom de l'auteur
 * @param {string} authorName - Nom de l'auteur
 * @returns {object} Objet avec les propriétés background et icon
 *
 * @example
 * // Entrée
 * getAuthorColors('John Doe')
 *
 * // Sortie
 * {
 *   background: 'bg-blue-100 text-blue-800',
 *   icon: 'text-blue-600'
 * }
 */
export const getAuthorColors = (authorName) => {
  // Implémentation
}
```

#### Utilisation dans les Composants

```javascript
// Dans RepoDetails.jsx
import { formatSize, getRelativeTime, getAuthorColor } from '../utils/formatters'

function RepoDetails() {
  // Utilisation des fonctions importées
  const formattedSize = formatSize(file.size)
  const relativeTime = getRelativeTime(commit.date)
  const authorColor = getAuthorColor(commit.author.name)

  // ... reste du composant
}
```

#### Structure Recommandée du Répertoire utils/

```
src/utils/
├── formatters.js      # Fonctions de formatage (dates, nombres, etc.)
├── validators.js      # Fonctions de validation
├── helpers.js         # Fonctions utilitaires générales
├── constants.js       # Constantes de l'application
├── api.js             # Fonctions utilitaires pour les appels API
└── index.js           # Exports centralisés
```

---

## 3. Architecture des Composants

### 3.1 Principes d'Architecture

#### Composition vs Héritage
```javascript
/**
 * Composant de base réutilisable
 * Fournit une structure commune pour les cartes
 */
function Card({ children, className = '', ...props }) {
  return (
    <div className={`card ${className}`} {...props}>
      {children}
    </div>
  )
}

/**
 * Composant spécialisé utilisant la composition
 * Hérite du comportement de Card sans héritage de classe
 */
function ProductCard({ product, onAddToCart }) {
  return (
    <Card className="product-card">
      <h3>{product.name}</h3>
      <p>{product.description}</p>
      <button onClick={() => onAddToCart(product)}>
        Ajouter au panier
      </button>
    </Card>
  )
}
```

#### Composants Présentationnels vs Conteneurs
```javascript
/**
 * Composant présentationnel - s'occupe uniquement du rendu
 * Reçoit les données et callbacks via les props
 */
function UserList({ users, onUserSelect, selectedUserId }) {
  return (
    <ul className="user-list">
      {users.map(user => (
        <li
          key={user.id}
          className={user.id === selectedUserId ? 'selected' : ''}
          onClick={() => onUserSelect(user)}
        >
          {user.name}
        </li>
      ))}
    </ul>
  )
}

/**
 * Composant conteneur - gère la logique et l'état
 * Fournit les données et callbacks au composant présentationnel
 */
function UserListContainer() {
  const [users, setUsers] = useState([])
  const [selectedUserId, setSelectedUserId] = useState(null)

  useEffect(() => {
    // Chargement des utilisateurs
    loadUsers().then(setUsers)
  }, [])

  const handleUserSelect = (user) => {
    setSelectedUserId(user.id)
  }

  return (
    <UserList
      users={users}
      onUserSelect={handleUserSelect}
      selectedUserId={selectedUserId}
    />
  )
}
```

### 3.2 Patterns de Composants Avancés

#### Render Props Pattern
```javascript
/**
 * Composant HOC avec render props
 * Permet une réutilisation flexible de la logique
 */
function DataFetcher({ url, render }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchData(url)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [url])

  return render({ data, loading, error })
}

// Utilisation avec render props
function UserProfileWithData() {
  return (
    <DataFetcher
      url="/api/user"
      render={({ data, loading, error }) => {
        if (loading) return <div>Chargement...</div>
        if (error) return <div>Erreur: {error.message}</div>
        return <UserProfile user={data} />
      }}
    />
  )
}
```

#### Compound Components Pattern
```javascript
/**
 * Composant composé - Menu avec sous-composants
 * Fournit une API cohérente et flexible
 */
function Menu({ children }) {
  return <div className="menu">{children}</div>
}

Menu.Item = function MenuItem({ children, ...props }) {
  return <div className="menu-item" {...props}>{children}</div>
}

Menu.Divider = function MenuDivider() {
  return <hr className="menu-divider" />
}

// Utilisation des composants composés
function NavigationMenu() {
  return (
    <Menu>
      <Menu.Item>Accueil</Menu.Item>
      <Menu.Item>Produits</Menu.Item>
      <Menu.Divider />
      <Menu.Item>À propos</Menu.Item>
      <Menu.Item>Contact</Menu.Item>
    </Menu>
  )
}
```

---

## 4. Gestion d'État

### 4.1 État Local avec Hooks

#### useState pour État Simple
```javascript
/**
 * Composant de compteur avec état local
 * Démonstration de l'utilisation basique de useState
 */
function Counter() {
  const [count, setCount] = useState(0)

  /**
   * Incrémente le compteur
   * Utilise la fonction de mise à jour pour éviter les problèmes de closure
   */
  const increment = () => {
    setCount(prevCount => prevCount + 1)
  }

  /**
   * Remet le compteur à zéro
   */
  const reset = () => {
    setCount(0)
  }

  return (
    <div className="counter">
      <p>Compteur: {count}</p>
      <button onClick={increment}>Incrémenter</button>
      <button onClick={reset}>Réinitialiser</button>
    </div>
  )
}
```

#### useReducer pour État Complexe
```javascript
/**
 * Actions pour le reducer du panier
 */
const cartActions = {
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  CLEAR_CART: 'CLEAR_CART'
}

/**
 * Reducer pour la gestion du panier
 * Gère les différentes actions sur l'état du panier
 */
function cartReducer(state, action) {
  switch (action.type) {
    case cartActions.ADD_ITEM:
      return {
        ...state,
        items: [...state.items, action.payload],
        total: state.total + action.payload.price
      }

    case cartActions.REMOVE_ITEM:
      const itemToRemove = state.items.find(item => item.id === action.payload)
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
        total: state.total - (itemToRemove?.price || 0)
      }

    case cartActions.UPDATE_QUANTITY:
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
        total: state.items.reduce((total, item) => {
          if (item.id === action.payload.id) {
            return total + (item.price * action.payload.quantity)
          }
          return total + (item.price * item.quantity)
        }, 0)
      }

    case cartActions.CLEAR_CART:
      return {
        items: [],
        total: 0
      }

    default:
      return state
  }
}

/**
 * Composant de panier avec useReducer
 * Gère un état complexe avec plusieurs actions
 */
function ShoppingCart() {
  const [cartState, dispatch] = useReducer(cartReducer, {
    items: [],
    total: 0
  })

  const addItem = (item) => {
    dispatch({ type: cartActions.ADD_ITEM, payload: item })
  }

  const removeItem = (itemId) => {
    dispatch({ type: cartActions.REMOVE_ITEM, payload: itemId })
  }

  const updateQuantity = (itemId, quantity) => {
    dispatch({ type: cartActions.UPDATE_QUANTITY, payload: { id: itemId, quantity } })
  }

  const clearCart = () => {
    dispatch({ type: cartActions.CLEAR_CART })
  }

  return (
    <div className="shopping-cart">
      <h2>Panier ({cartState.items.length} articles)</h2>
      <p>Total: {cartState.total.toFixed(2)} €</p>

      <div className="cart-actions">
        <button onClick={clearCart}>Vider le panier</button>
      </div>

      <div className="cart-items">
        {cartState.items.map(item => (
          <div key={item.id} className="cart-item">
            <span>{item.name}</span>
            <span>{item.price} €</span>
            <input
              type="number"
              value={item.quantity}
              onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
              min="1"
            />
            <button onClick={() => removeItem(item.id)}>Supprimer</button>
          </div>
        ))}
      </div>
    </div>
  )
}
```

### 4.2 Gestion d'État Globale

#### Context API pour État Partagé
```javascript
/**
 * Contexte d'authentification
 * Fournit l'état d'authentification à toute l'application
 */
const AuthContext = createContext()

/**
 * Provider d'authentification
 * Gère l'état d'authentification global
 */
function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Vérification de l'authentification au montage
    checkAuthStatus().then((authData) => {
      if (authData) {
        setUser(authData.user)
        setIsAuthenticated(true)
      }
      setLoading(false)
    })
  }, [])

  /**
   * Connecte l'utilisateur
   * Met à jour l'état d'authentification
   */
  const login = async (credentials) => {
    try {
      const userData = await authenticateUser(credentials)
      setUser(userData)
      setIsAuthenticated(true)
      return userData
    } catch (error) {
      throw error
    }
  }

  /**
   * Déconnecte l'utilisateur
   * Nettoie l'état d'authentification
   */
  const logout = async () => {
    try {
      await logoutUser()
      setUser(null)
      setIsAuthenticated(false)
    } catch (error) {
      throw error
    }
  }

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Hook personnalisé pour utiliser l'authentification
 * Fournit un accès facile au contexte d'authentification
 */
function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider')
  }
  return context
}

// Utilisation dans un composant
function UserProfile() {
  const { user, isAuthenticated, logout } = useAuth()

  if (!isAuthenticated) {
    return <div>Veuillez vous connecter</div>
  }

  return (
    <div className="user-profile">
      <h2>Profil de {user.name}</h2>
      <p>Email: {user.email}</p>
      <button onClick={logout}>Se déconnecter</button>
    </div>
  )
}
```

---

## 5. Guidelines de Styling et Interface Utilisateur

### 5.1 Approche CSS-in-JS

#### Styled Components (Recommandé)
```javascript
import styled from 'styled-components'

/**
 * Composant Button stylé
 * Utilise styled-components pour l'encapsulation des styles
 */
const Button = styled.button`
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  ${({ variant = 'primary' }) => {
    switch (variant) {
      case 'primary':
        return `
          background-color: #007bff;
          color: white;
          &:hover {
            background-color: #0056b3;
          }
        `
      case 'secondary':
        return `
          background-color: #6c757d;
          color: white;
          &:hover {
            background-color: #545b62;
          }
        `
      case 'danger':
        return `
          background-color: #dc3545;
          color: white;
          &:hover {
            background-color: #c82333;
          }
        `
      default:
        return ''
    }
  }}

  ${({ size }) => {
    switch (size) {
      case 'small':
        return `
          padding: 8px 16px;
          font-size: 14px;
        `
      case 'large':
        return `
          padding: 16px 32px;
          font-size: 18px;
        `
      default:
        return ''
    }
  }}

  ${({ disabled }) => disabled && `
    opacity: 0.6;
    cursor: not-allowed;
    pointer-events: none;
  `}
`

/**
 * Composant Card stylé
 * Démonstration de composants composés stylés
 */
const Card = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: box-shadow 0.2s ease;

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }
`

Card.Header = styled.div`
  padding: 20px;
  border-bottom: 1px solid #e9ecef;
  background-color: #f8f9fa;
`

Card.Body = styled.div`
  padding: 20px;
`

Card.Footer = styled.div`
  padding: 20px;
  border-top: 1px solid #e9ecef;
  background-color: #f8f9fa;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

### 5.2 Configuration Tailwind CSS et shadcn/ui

#### Installation et Configuration de Tailwind CSS

```bash
# Installation des dépendances Tailwind CSS
npm install -D tailwindcss postcss autoprefixer

# Initialisation de Tailwind CSS
npx tailwindcss init -p
```

#### Configuration Tailwind CSS

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          900: '#1e3a8a',
        },
        secondary: {
          50: '#f8fafc',
          500: '#64748b',
          600: '#475569',
          900: '#0f172a',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
```

#### Styles de Base avec Tailwind

```css
/* src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Styles de base personnalisés */
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96%;
    --secondary-foreground: 222.2 84% 4.9%;
    --muted: 210 40% 96%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96%;
    --accent-foreground: 222.2 84% 4.9%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 84% 4.9%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 94.1%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

#### Installation et Configuration de shadcn/ui

```bash
# Installation de shadcn/ui
npx shadcn-ui@latest init --yes

# Installation des composants shadcn/ui
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
```

#### Configuration des Composants shadcn/ui

```javascript
// components.json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/index.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

#### Exemples d'Utilisation des Composants shadcn/ui

```javascript
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

/**
 * Formulaire de contact avec composants shadcn/ui
 * Démonstration de l'utilisation des composants avec labels français
 */
function ContactForm() {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Formulaire de Contact</CardTitle>
        <CardDescription>
          Remplissez ce formulaire pour nous contacter
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nom complet</Label>
          <Input
            id="name"
            placeholder="Votre nom complet"
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Adresse email</Label>
          <Input
            id="email"
            type="email"
            placeholder="votre.email@exemple.com"
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="message">Message</Label>
          <textarea
            id="message"
            placeholder="Votre message ici..."
            className="w-full min-h-[100px] px-3 py-2 text-sm border border-input bg-background rounded-md resize-none"
            rows={4}
          />
        </div>

        <Button type="submit" className="w-full">
          Envoyer le message
        </Button>
      </CardContent>
    </Card>
  )
}

/**
 * Composant de navigation avec menu déroulant
 * Utilise les composants shadcn/ui pour une interface cohérente
 */
function NavigationHeader() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">Mon Application</h1>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost">Accueil</Button>
            <Button variant="ghost">Produits</Button>
            <Button variant="ghost">À propos</Button>
            <Button variant="ghost">Contact</Button>
          </div>
        </nav>
      </div>
    </header>
  )
}
```

### 5.3 Système de Design

#### Variables CSS et Thèmes
```css
/* src/styles/variables.css */
:root {
  /* Couleurs primaires */
  --primary-color: #007bff;
  --primary-hover: #0056b3;
  --primary-light: #e3f2fd;

  /* Couleurs secondaires */
  --secondary-color: #6c757d;
  --secondary-hover: #545b62;
  --secondary-light: #f8f9fa;

  /* Couleurs sémantiques */
  --success-color: #28a745;
  --warning-color: #ffc107;
  --danger-color: #dc3545;
  --info-color: #17a2b8;

  /* Espacement */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --spacing-xxl: 48px;

  /* Typographie */
  --font-family-primary: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-size-xs: 12px;
  --font-size-sm: 14px;
  --font-size-md: 16px;
  --font-size-lg: 18px;
  --font-size-xl: 20px;
  --font-size-xxl: 24px;

  /* Bordures */
  --border-radius-sm: 4px;
  --border-radius-md: 8px;
  --border-radius-lg: 12px;
  --border-radius-xl: 16px;

  /* Ombres */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 2px 8px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 4px 16px rgba(0, 0, 0, 0.15);

  /* Transitions */
  --transition-fast: 0.15s ease;
  --transition-normal: 0.2s ease;
  --transition-slow: 0.3s ease;
}
```

#### Composants de Base Réutilisables
```javascript
/**
 * Système de grille responsive
 * Fournit des classes utilitaires pour la mise en page
 */
const Grid = styled.div`
  display: grid;
  gap: var(--spacing-md);

  ${({ columns = 1 }) => `
    grid-template-columns: repeat(${columns}, 1fr);
  `}

  @media (max-width: 768px) {
    ${({ responsive = true }) => responsive && `
      grid-template-columns: 1fr;
    `}
  }
`

/**
 * Système de mise en page flexbox
 * Utilitaire pour les mises en page flexibles
 */
const Flex = styled.div`
  display: flex;
  gap: ${({ gap = 'var(--spacing-md)' }) => gap};

  ${({ direction = 'row' }) => `
    flex-direction: ${direction};
  `}

  ${({ justify = 'flex-start' }) => `
    justify-content: ${justify};
  `}

  ${({ align = 'stretch' }) => `
    align-items: ${align};
  `}

  ${({ wrap = 'nowrap' }) => `
    flex-wrap: ${wrap};
  `}
`

/**
 * Composant de section avec espacement cohérent
 * Fournit une structure de base pour les sections de page
 */
const Section = styled.section`
  padding: var(--spacing-xxl) 0;

  ${({ background = 'transparent' }) => `
    background-color: ${background};
  `}

  ${({ maxWidth = '1200px' }) => `
    max-width: ${maxWidth};
    margin: 0 auto;
    padding-left: var(--spacing-md);
    padding-right: var(--spacing-md);
  `}
`
```

### 5.3 Interface Utilisateur en Français

#### Labels et Messages d'Interface
```javascript
/**
 * Constantes pour les labels d'interface en français
 * Centralise toutes les chaînes de caractères UI
 */
const UI_LABELS = {
  // Navigation
  NAVIGATION: {
    HOME: 'Accueil',
    PRODUCTS: 'Produits',
    ABOUT: 'À propos',
    CONTACT: 'Contact',
    LOGIN: 'Se connecter',
    LOGOUT: 'Se déconnecter',
    CART: 'Panier'
  },

  // Actions communes
  ACTIONS: {
    SAVE: 'Enregistrer',
    CANCEL: 'Annuler',
    DELETE: 'Supprimer',
    EDIT: 'Modifier',
    ADD: 'Ajouter',
    SEARCH: 'Rechercher',
    FILTER: 'Filtrer',
    SORT: 'Trier'
  },

  // Messages de validation
  VALIDATION: {
    REQUIRED_FIELD: 'Ce champ est obligatoire',
    INVALID_EMAIL: 'Adresse email invalide',
    PASSWORD_TOO_SHORT: 'Le mot de passe doit contenir au moins 8 caractères',
    PASSWORDS_DONT_MATCH: 'Les mots de passe ne correspondent pas'
  },

  // Messages de feedback
  FEEDBACK: {
    LOADING: 'Chargement en cours...',
    SUCCESS: 'Opération réussie',
    ERROR: 'Une erreur est survenue',
    NO_DATA: 'Aucune donnée disponible',
    CONFIRM_DELETE: 'Êtes-vous sûr de vouloir supprimer cet élément ?'
  }
}

/**
 * Hook pour les traductions
 * Fournit un accès centralisé aux labels d'interface
 */
function useTranslation() {
  return {
    t: (key) => {
      const keys = key.split('.')
      return keys.reduce((obj, currentKey) => obj?.[currentKey], UI_LABELS) || key
    }
  }
}

// Utilisation dans un composant
function LoginForm() {
  const { t } = useTranslation()

  return (
    <form>
      <h2>{t('NAVIGATION.LOGIN')}</h2>
      <button type="submit">{t('ACTIONS.SAVE')}</button>
    </form>
  )
}
```
### 5.4 Standards d'Organisation CSS

#### 5.4.1 Structure de Fichier CSS Central

##### Système de Design Tokens
```css
/* src/styles/design-system.css */
/* Fichier central pour les tokens de design et variables CSS */

:root {
  /* Palette de couleurs primaires */
  --color-primary-50: #eff6ff;
  --color-primary-100: #dbeafe;
  --color-primary-500: #3b82f6;
  --color-primary-600: #2563eb;
  --color-primary-900: #1e3a8a;

  /* Palette de couleurs secondaires */
  --color-secondary-50: #f8fafc;
  --color-secondary-100: #f1f5f9;
  --color-secondary-500: #64748b;
  --color-secondary-600: #475569;
  --color-secondary-900: #0f172a;

  /* Palette de couleurs sémantiques */
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-info: #06b6d4;

  /* Couleurs de fond et texte */
  --color-background: #ffffff;
  --color-surface: #f8fafc;
  --color-text-primary: #0f172a;
  --color-text-secondary: #64748b;
  --color-text-muted: #94a3b8;

  /* Système d'espacement cohérent */
  --space-1: 4px;    /* 0.25rem */
  --space-2: 8px;    /* 0.5rem */
  --space-3: 12px;   /* 0.75rem */
  --space-4: 16px;   /* 1rem */
  --space-5: 20px;   /* 1.25rem */
  --space-6: 24px;   /* 1.5rem */
  --space-8: 32px;   /* 2rem */
  --space-10: 40px;  /* 2.5rem */
  --space-12: 48px;  /* 3rem */
  --space-16: 64px;  /* 4rem */
  --space-20: 80px;  /* 5rem */

  /* Système typographique */
  --font-family-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-family-mono: 'JetBrains Mono', 'Fira Code', Consolas, monospace;

  /* Tailles de police */
  --text-xs: 12px;   /* 0.75rem */
  --text-sm: 14px;   /* 0.875rem */
  --text-base: 16px; /* 1rem */
  --text-lg: 18px;   /* 1.125rem */
  --text-xl: 20px;   /* 1.25rem */
  --text-2xl: 24px;  /* 1.5rem */
  --text-3xl: 30px;  /* 1.875rem */
  --text-4xl: 36px;  /* 2.25rem */

  /* Poids de police */
  --font-light: 300;
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;

  /* Rayons de bordure */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 12px;
  --radius-2xl: 16px;
  --radius-full: 9999px;

  /* Ombres */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);

  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-normal: 200ms ease;
  --transition-slow: 300ms ease;

  /* Points de rupture responsive */
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;
}

/* Thème sombre optionnel */
@media (prefers-color-scheme: dark) {
  :root {
    --color-background: #0f172a;
    --color-surface: #1e293b;
    --color-text-primary: #f8fafc;
    --color-text-secondary: #cbd5e1;
    --color-text-muted: #64748b;
  }
}
```

##### Exemple d'Utilisation des Design Tokens
```css
/* src/styles/components.css */
/* Composants utilisant le système de design tokens */

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-md);
  font-family: var(--font-family-sans);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  line-height: 1.5;
  text-decoration: none;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn--primary {
  background-color: var(--color-primary-500);
  color: white;
}

.btn--primary:hover {
  background-color: var(--color-primary-600);
}

.btn--secondary {
  background-color: var(--color-secondary-500);
  color: white;
}

.btn--secondary:hover {
  background-color: var(--color-secondary-600);
}

.card {
  background-color: var(--color-background);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  padding: var(--space-6);
  border: 1px solid var(--color-surface);
}

.text-heading {
  font-family: var(--font-family-sans);
  font-weight: var(--font-semibold);
  line-height: 1.2;
  color: var(--color-text-primary);
}

.text-body {
  font-family: var(--font-family-sans);
  font-weight: var(--font-normal);
  line-height: 1.6;
  color: var(--color-text-secondary);
}
```

#### 5.4.2 Feuilles de Styles Spécifiques aux Composants

##### Conventions de Nommage
```css
/* Structure recommandée pour les fichiers CSS de composants */
/*
  Nommage des fichiers : [nom-composant].css
  - Utiliser kebab-case pour les noms de fichiers
  - Préfixer par le nom du composant ou de la fonctionnalité
  - Éviter les noms génériques comme styles.css ou main.css
*/

/* ✅ Correct */
src/styles/components/
├── user-profile.css
├── product-card.css
├── navigation-header.css
├── contact-form.css
├── dashboard-widget.css
└── modal-dialog.css

/* ❌ Incorrect */
src/styles/components/
├── styles.css          /* Trop générique */
├── userProfile.css     /* camelCase au lieu de kebab-case */
├── UserProfile.css     /* PascalCase */
└── ui-components.css   /* Nom trop large */
```

##### Structure d'Import Recommandée
```css
/* src/styles/components.css */
/* Fichier d'index pour l'import de tous les composants */

@import './components/user-profile.css';
@import './components/product-card.css';
@import './components/navigation-header.css';
@import './components/contact-form.css';
@import './components/dashboard-widget.css';
@import './components/modal-dialog.css';

/* Alternative : imports conditionnels pour les grosses applications */
@media (min-width: 768px) {
  @import './components/desktop-layout.css';
}
```

##### Exemples de Feuilles de Styles Composant
```css
/* src/styles/components/user-profile.css */
/* Styles spécifiques au composant UserProfile */

.user-profile {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-6);
  background-color: var(--color-background);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}

.user-profile__avatar {
  width: 80px;
  height: 80px;
  border-radius: var(--radius-full);
  object-fit: cover;
  border: 3px solid var(--color-primary-500);
}

.user-profile__name {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.user-profile__email {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin: 0;
}

.user-profile__actions {
  display: flex;
  gap: var(--space-3);
  margin-top: var(--space-2);
}

/* États interactifs */
.user-profile:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
  transition: all var(--transition-normal);
}

/* Responsive */
@media (max-width: 480px) {
  .user-profile {
    padding: var(--space-4);
  }

  .user-profile__avatar {
    width: 60px;
    height: 60px;
  }
}
```

```css
/* src/styles/components/product-card.css */
/* Styles spécifiques au composant ProductCard */

.product-card {
  display: flex;
  flex-direction: column;
  background-color: var(--color-background);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  transition: all var(--transition-normal);
  border: 1px solid var(--color-surface);
}

.product-card__image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  background-color: var(--color-surface);
}

.product-card__content {
  padding: var(--space-4);
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.product-card__title {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--color-text-primary);
  margin: 0;
  line-height: 1.3;
}

.product-card__description {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  line-height: 1.5;
  flex: 1;
}

.product-card__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--space-3);
  padding-top: var(--space-3);
  border-top: 1px solid var(--color-surface);
}

.product-card__price {
  font-size: var(--text-lg);
  font-weight: var(--font-bold);
  color: var(--color-primary-600);
}

.product-card__button {
  padding: var(--space-2) var(--space-4);
  background-color: var(--color-primary-500);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.product-card__button:hover {
  background-color: var(--color-primary-600);
}

/* États interactifs */
.product-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-4px);
}

/* Responsive */
@media (max-width: 640px) {
  .product-card__content {
    padding: var(--space-3);
  }

  .product-card__footer {
    flex-direction: column;
    gap: var(--space-2);
    align-items: stretch;
  }
}
```

#### 5.4.3 Intégration avec le Styling Existant

##### Combinaison Design System + Tailwind CSS
```css
/* src/index.css */
/* Intégration du système de design avec Tailwind CSS */

@import './styles/design-system.css';

@tailwind base;
@tailwind components;
@tailwind utilities;

/* Extension des classes Tailwind avec nos tokens */
@layer base {
  :root {
    /* Synchronisation avec les variables CSS personnalisées */
    --tw-bg-opacity: 1;
    --tw-text-opacity: 1;
  }
}

@layer components {
  /* Composants utilisant à la fois les tokens et Tailwind */
  .btn-custom {
    @apply inline-flex items-center justify-center px-4 py-2 rounded-md font-medium transition-colors;
    background-color: var(--color-primary-500);
    color: white;
  }

  .btn-custom:hover {
    background-color: var(--color-primary-600);
  }

  .card-custom {
    @apply rounded-lg p-6 shadow-md border;
    background-color: var(--color-background);
    border-color: var(--color-surface);
  }
}
```

##### Utilisation Pratique avec Composants shadcn/ui
```javascript
/**
 * Exemple d'intégration avec shadcn/ui et nos standards CSS
 * Les composants utilisent les classes Tailwind + nos tokens CSS
 */
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

/**
 * Composant UserProfile utilisant shadcn/ui + design tokens
 * Commentaires en français pour la documentation
 */
function UserProfile({ user, onEdit, onDelete }) {
  return (
    <Card className="user-profile-card" style={{
      // Utilisation des variables CSS personnalisées
      '--card-padding': 'var(--space-6)',
      '--card-shadow': 'var(--shadow-md)'
    }}>
      <CardHeader>
        <CardTitle className="text-heading">
          Profil de {user.name}
        </CardTitle>
        <CardDescription>
          Informations personnelles et paramètres du compte
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          <img
            src={user.avatar}
            alt={`Avatar de ${user.name}`}
            className="w-16 h-16 rounded-full object-cover border-2"
            style={{ borderColor: 'var(--color-primary-500)' }}
          />
          <div>
            <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              {user.name}
            </h3>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {user.email}
            </p>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button
            onClick={() => onEdit(user)}
            className="btn-custom"
          >
            Modifier le profil
          </Button>
          <Button
            variant="outline"
            onClick={() => onDelete(user.id)}
            style={{
              borderColor: 'var(--color-error)',
              color: 'var(--color-error)'
            }}
          >
            Supprimer
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Hook personnalisé pour les styles cohérents
 * Centralise la logique de style réutilisable
 */
function useDesignSystem() {
  const spacing = {
    small: 'var(--space-2)',
    medium: 'var(--space-4)',
    large: 'var(--space-6)',
    xlarge: 'var(--space-8)'
  }

  const colors = {
    primary: 'var(--color-primary-500)',
    secondary: 'var(--color-secondary-500)',
    success: 'var(--color-success)',
    error: 'var(--color-error)'
  }

  return { spacing, colors }
}

// Utilisation du hook dans un composant
function DashboardWidget({ title, children }) {
  const { spacing, colors } = useDesignSystem()

  return (
    <div
      className="rounded-lg p-6 shadow-md"
      style={{
        backgroundColor: 'var(--color-background)',
        padding: spacing.large,
        boxShadow: 'var(--shadow-md)'
      }}
    >
      <h3
        className="text-lg font-semibold mb-4"
        style={{ color: colors.primary }}
      >
        {title}
      </h3>
      {children}
    </div>
  )
}
```

##### Structure de Projet Recommandée
```css
/* src/styles/index.css */
/* Point d'entrée unique pour tous les styles */

@import './design-system.css';     /* Variables et tokens */
@import './base.css';              /* Styles de base */
@import './components.css';         /* Imports des composants */
@import './utilities.css';         /* Classes utilitaires */

/* Extensions Tailwind avec nos tokens */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Styles spécifiques à l'application */
@import './app-specific.css';
```

---

## 6. Structure d'Organisation des Fichiers

### 6.1 Architecture de Dossiers Recommandée

```
src/
├── components/           # Composants réutilisables
│   ├── common/          # Composants génériques (Button, Input, etc.)
│   ├── layout/          # Composants de mise en page (Header, Footer, etc.)
│   ├── forms/           # Composants de formulaires
│   ├── ui/              # Composants d'interface utilisateur
│   └── index.js         # Exports des composants
├── pages/               # Pages et vues principales
│   ├── HomePage.jsx
│   ├── ProductPage.jsx
│   ├── AboutPage.jsx
│   └── ContactPage.jsx
├── hooks/               # Hooks personnalisés
│   ├── useAuth.js
│   ├── useApi.js
│   ├── useLocalStorage.js
│   └── index.js
├── services/            # Services et API calls
│   ├── authService.js
│   ├── productService.js
│   ├── userService.js
│   └── apiClient.js
├── styles/              # Fichiers de styles
│   ├── variables.css
│   ├── global.css
│   ├── components/
│   └── themes/
├── utils/               # Utilitaires et fonctions helpers
│   ├── constants.js
│   ├── helpers.js
│   ├── validators.js
│   └── index.js
├── contexts/            # Contextes React
│   ├── AuthContext.jsx
│   ├── ThemeContext.jsx
│   └── CartContext.jsx
├── types/               # Définitions TypeScript (si utilisé)
│   ├── index.ts
│   └── api.ts
├── assets/              # Ressources statiques
│   ├── images/
│   ├── icons/
│   └── fonts/
├── App.jsx              # Composant racine
├── main.jsx             # Point d'entrée de l'application
└── index.css            # Styles globaux
```

### 6.2 Organisation par Feature

#### Structure par Domaine Métier
```
src/
├── features/
│   ├── auth/
│   │   ├── components/
│   │   │   ├── LoginForm.jsx
│   │   │   └── RegisterForm.jsx
│   │   ├── hooks/
│   │   │   └── useAuth.js
│   │   ├── services/
│   │   │   └── authService.js
│   │   └── index.js
│   ├── products/
│   │   ├── components/
│   │   │   ├── ProductList.jsx
│   │   │   ├── ProductCard.jsx
│   │   │   └── ProductFilters.jsx
│   │   ├── hooks/
│   │   │   └── useProducts.js
│   │   ├── services/
│   │   │   └── productService.js
│   │   └── index.js
│   └── cart/
│       ├── components/
│       │   ├── CartList.jsx
│       │   └── CartSummary.jsx
│       ├── hooks/
│       │   └── useCart.js
│       ├── contexts/
│       │   └── CartContext.jsx
│       └── index.js
├── shared/              # Code partagé entre features
│   ├── components/
│   ├── hooks/
│   └── utils/
└── core/                # Configuration et setup de base
    ├── App.jsx
    ├── main.jsx
    └── router.jsx
```

---

## 7. Workflow de Développement

### 7.1 Environnement de Développement

#### Configuration ESLint et Prettier
```json
// .eslintrc.json
{
  "env": {
    "browser": true,
    "es2021": true
  },
  "extends": [
    "eslint:recommended",
    "@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react/jsx-runtime",
    "plugin:react-hooks/recommended"
  ],
  "parserOptions": {
    "ecmaFeatures": {
      "jsx": true
    },
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "plugins": [
    "react",
    "react-hooks"
  ],
  "rules": {
    "react/prop-types": "off",
    "react/react-in-jsx-scope": "off",
    "no-unused-vars": "warn",
    "no-console": "warn"
  },
  "settings": {
    "react": {
      "version": "detect"
    }
  }
}
```

```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "avoid"
}
```

#### Configuration shadcn/ui MCP

```bash
# Initialisation du serveur MCP pour shadcn/ui
npx shadcn@latest mcp init --client vscode

# Configuration VSCode pour l'intégration MCP
# Ajouter dans settings.json de VSCode :
{
  "mcp": {
    "servers": {
      "shadcn-ui": {
        "command": "npx",
        "args": ["shadcn@latest", "mcp", "server"],
        "cwd": "${workspaceFolder}"
      }
    }
  }
}
```

#### Installation des Composants via MCP

```bash
# Installation d'un composant via MCP
npx shadcn@latest add button --client vscode

# Installation multiple composants
npx shadcn@latest add card input label --client vscode

# Liste des composants disponibles
npx shadcn@latest mcp list --client vscode
```

### 7.2 Cycle de Développement

#### 1. Planification et Analyse
```javascript
/**
 * Analyse des exigences avant le développement
 * Identification des composants et fonctionnalités nécessaires
 */

// 1. Identifier les composants requis
// 2. Définir les interfaces et props
// 3. Planifier la structure des données
// 4. Considérer les états et interactions
// 5. Définir les en-têtes de fichiers requis
```

#### 2. Développement Incrémental
```javascript
/**
 * Développement par petites étapes
 * Validation continue du code
 */

// Étape 1: Structure de base avec en-tête de fichier
/**
 * Composant de profil utilisateur - Affichage des informations utilisateur
 *
 * Fonctionnalités métier :
 * - Affichage des données de profil utilisateur
 * - Gestion des états de chargement et d'erreur
 * - Interface responsive pour tous les appareils
 *
 * Objectif : Fournir une vue claire et accessible
 * des informations de profil de l'utilisateur.
 *
 * @created 2025-01-15
 * @author Équipe Développement
 */
function UserProfileSkeleton() {
  return <div>Loading...</div>
}

// Étape 2: Composant avec props et en-tête mis à jour
/**
 * Composant de profil utilisateur - Affichage des informations utilisateur
 *
 * Fonctionnalités métier :
 * - Affichage des données de profil utilisateur
 * - Gestion des états de chargement et d'erreur
 * - Interface responsive pour tous les appareils
 * - Support des props pour la personnalisation
 *
 * Objectif : Fournir une vue claire et accessible
 * des informations de profil de l'utilisateur.
 *
 * @created 2025-01-15
 * @author Équipe Développement
 */
function UserProfile({ user }) {
  return <div>{user.name}</div>
}

// Étape 3: Ajout de la logique avec en-tête complet
/**
 * Composant de profil utilisateur - Gestion complète du profil utilisateur
 *
 * Fonctionnalités métier :
 * - Affichage des données de profil utilisateur
 * - Chargement asynchrone des données utilisateur
 * - Gestion des états de chargement et d'erreur
 * - Interface responsive pour tous les appareils
 * - Support des props pour la personnalisation
 * - Gestion des interactions utilisateur
 *
 * Objectif : Fournir une vue complète et interactive
 * des informations de profil de l'utilisateur avec
 * une expérience utilisateur fluide.
 *
 * @created 2025-01-15
 * @author Équipe Développement
 */
function UserProfile({ userId }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUser(userId).then(user => {
      setUser(user)
      setLoading(false)
    })
  }, [userId])

  if (loading) return <div>Chargement...</div>
  return <div>{user.name}</div>
}
```

#### 3. Tests et Validation
```javascript
/**
 * Validation manuelle des fonctionnalités
 * Tests des interactions utilisateur
 */

// 1. Tester tous les chemins utilisateur
// 2. Vérifier les états d'erreur
// 3. Valider l'accessibilité
// 4. Tester la responsivité
```

### 7.3 Gestion des Versions

#### Commits Conventionnels

**Important :** Tous les messages de commit doivent être exclusivement en français. Cela inclut le type, la description et tout autre texte dans le message de commit.

```bash
# Format des commits
git commit -m "feat: ajouter authentification utilisateur"
git commit -m "fix: corriger validation formulaire"
git commit -m "docs: mettre à jour documentation API"
git commit -m "style: améliorer styles des composants"
git commit -m "refactor: optimiser performance des requêtes"
```

#### Branches de Développement
```
main/                    # Branche principale stable
├── develop/            # Branche de développement
├── feature/auth/       # Feature d'authentification
├── feature/products/   # Feature produits
├── bugfix/login/       # Correction bug de connexion
└── hotfix/security/    # Correctif de sécurité urgent
```

---

## 8. Considérations de Déploiement

### 8.1 Build de Production

#### Optimisation du Build
```javascript
// vite.config.js - Configuration de production
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,        // Désactiver en production
    minify: 'terser',        // Minification avancée
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['styled-components']
        }
      }
    }
  }
})
```

### 8.2 Configuration d'Environnement

#### Variables d'Environnement
```bash
# .env.development
VITE_API_URL=http://localhost:3001/api
VITE_APP_NAME=Mon Application Dev
VITE_DEBUG=true

# .env.production
VITE_API_URL=https://api.monapp.com
VITE_APP_NAME=Mon Application
VITE_DEBUG=false
```

#### Configuration Multi-Environnement
```javascript
// src/config/environment.js
const env = import.meta.env

export const config = {
  apiUrl: env.VITE_API_URL || 'http://localhost:3001/api',
  appName: env.VITE_APP_NAME || 'Mon Application',
  isDevelopment: env.VITE_DEBUG === 'true',
  version: env.VITE_APP_VERSION || '1.0.0'
}
```

### 8.3 Déploiement et Hosting

#### Stratégies de Déploiement
```bash
# Build de production
npm run build

# Déploiement sur serveur statique
# - Netlify: connecté au repo Git
# - Vercel: déploiement automatique
# - GitHub Pages: via GitHub Actions
# - Serveur traditionnel: upload du dossier dist/
```

#### Configuration CI/CD
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      - run: aws s3 sync dist/ s3://mon-bucket --delete
```

---

## Conclusion

Ce guide fournit une base solide pour le développement d'applications React modernes en suivant les standards définis. Les principes clés à retenir sont :

### ✅ Points Essentiels
- **Code en anglais** pour la maintenabilité et la collaboration
- **Commentaires en français** pour la documentation locale
- **Labels UI en français** pour l'expérience utilisateur
- **Composants fonctionnels** avec les Hooks modernes
- **Architecture composable** pour la réutilisabilité
- **Gestion d'état moderne** avec Context et useReducer
- **Styling cohérent** avec un système de design

### 🔄 Bonnes Pratiques
- Développement incrémental et validation continue
- Séparation claire des responsabilités
- Utilisation de patterns éprouvés
- Documentation complète en français
- Tests manuels des fonctionnalités

### 📈 Évolution
Ce guide sera mis à jour régulièrement pour intégrer les nouvelles fonctionnalités de React et les meilleures pratiques émergentes. N'hésitez pas à contribuer aux améliorations en soumettant vos retours d'expérience.

---

**Document créé le:** 2025-09-24
**Version:** 1.0.0
**Auteur:** Équipe de Développement
