# Cartes Sans Pitié

Un jeu de cartes multijoueur provocant inspiré de Cards Against Humanity, entièrement en français.

## Fonctionnalités

- 100 cartes questions provocantes
- 164 cartes réponses adultes 
- Système strict d'utilisation unique des cartes
- Multijoueur avec bots configurables (1-5)
- Historique des parties en temps réel
- Interface responsive avec animations

## Déploiement sur Vercel

### Prérequis
- Compte Vercel
- Node.js 18+

### Instructions

1. **Cloner le projet**
```bash
git clone <votre-repo>
cd cartes-sans-pitie
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Déployer sur Vercel**
```bash
npx vercel --prod
```

Ou connectez votre repository GitHub à Vercel pour un déploiement automatique.

### Configuration Vercel

Le fichier `vercel.json` est déjà configuré pour :
- Servir l'application full-stack
- Gérer les routes API et frontend
- Optimiser les performances

### Variables d'environnement

Aucune variable d'environnement externe requise. Le jeu utilise un stockage en mémoire.

## Structure du projet

```
├── client/          # Frontend React
├── server/          # Backend Express
├── shared/          # Types partagés
├── vercel.json      # Configuration Vercel
└── package.json     # Dépendances
```

## Technologies

- **Frontend**: React, TypeScript, Tailwind CSS, Wouter
- **Backend**: Express, TypeScript
- **UI**: Radix UI, Shadcn/ui
- **Animations**: Framer Motion

## Développement local

```bash
npm run dev
```

L'application sera disponible sur `http://localhost:5000`