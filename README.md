# R.T.V - Réussis Ta Vie

Site e-commerce moderne permettant aux vendeurs de publier leurs produits et aux acheteurs de les découvrir.

## 🔍 Fonctionnalités principales

### Espace Vendeur
- Création de compte vendeur (sans authentification sociale)
- Publication d'articles avec description, caractéristiques, mots-clés, et coordonnées
- Demande de bannières publicitaires (limité à 5 vendeurs par mois)
- Gestion des produits publiés

### Espace Boutique
- Recherche de produits par mots-clés
- Filtrage par catégories
- Affichage détaillé des produits
- Contact direct avec les vendeurs

### Autres fonctionnalités
- Système de rotation des bannières publicitaires
- Slogan R.T.V intégré de manière stratégique
- Lien vers le compte TikTok "devcoran"

## 💻 Technologies utilisées

- **Frontend**: React, TypeScript, Vite
- **Styles**: Tailwind CSS
- **Routing**: React Router
- **Formulaires**: Formik, Yup
- **Icons**: React Icons, Heroicons

## 📦 Installation

```bash
# Cloner le dépôt
git clone [url-du-repo]
cd site-ecommerce

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

## 🚀 Déploiement

Ce site est conçu pour être déployé manuellement sur Netlify.

```bash
# Construire le projet pour la production
npm run build

# Les fichiers de production seront dans le dossier 'dist'
```

## 📈 Évolutions futures

- Intégration avec une base de données (Firebase)
- Authentification réelle et gestion des sessions
- Système de messagerie entre acheteurs et vendeurs
- Statistiques pour les vendeurs
- Système de notation des vendeurs

## 📝 Structure du projet

```
src/
├── components/       # Composants réutilisables
├── layouts/          # Layouts de l'application
├── pages/            # Pages principales
├── App.tsx           # Configuration des routes
├── main.tsx          # Point d'entrée
├── index.css         # Styles globaux
```

## 👨‍💻 Auteur

Projet développé pour R.T.V - Réussis Ta Vie
