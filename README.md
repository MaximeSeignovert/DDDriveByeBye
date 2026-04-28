# Boilerplate React + TypeScript + Vite

Un boilerplate moderne pour développer des applications React avec TypeScript, Vite, Shadcn/ui et TanStack Router.

## 🚀 Technologies utilisées

- **React 19** - Framework frontend
- **TypeScript** - Typage statique
- **Vite** - Build tool et serveur de développement
- **Shadcn/ui** - Composants UI
- **TanStack Router** - Routage type-safe
- **Tailwind CSS** - Framework CSS utilitaire

## 📦 Installation

```bash
npm install
```

## 🛠️ Scripts disponibles

### Développement
```bash
npm run dev
```
Lance le serveur de développement Vite sur `http://localhost:5173`

### Build de production
```bash
npm run build
```
Compile TypeScript et génère les fichiers optimisés pour la production dans le dossier `dist/`

### Aperçu de la production
```bash
npm run preview
```
Lance un serveur local pour prévisualiser le build de production

### Linting
```bash
npm run lint
```
Vérifie la qualité du code avec ESLint

## 📁 Structure du projet

```
src/
├── components/          # Composants React réutilisables
│   └── ui/             # Composants Shadcn/ui
├── routes/             # Routes TanStack Router
│   ├── __root.tsx      # Route racine (layout principal)
│   ├── index.tsx       # Page d'accueil (/)
│   └── about.tsx       # Page à propos (/about)
├── lib/                # Utilitaires et helpers
├── assets/             # Ressources statiques
├── styles.css          # Styles globaux Tailwind
├── routeTree.gen.ts    # Arbre des routes généré automatiquement
└── main.tsx           # Point d'entrée de l'application
```

## 🚀 Démarrage rapide

1. **Clonez et installez** :
```bash
npm install -g degit
npx degit github:MaximeSeignovert/boilerplate .
npm install
```

2. **Lancez le développement** :
```bash
npm run dev
```

3. **Ajoutez des composants Shadcn** :
```bash
npx shadcn@latest add button card dialog
```

## 📚 Ressources utiles

- [React 19 Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Shadcn/ui Components](https://ui.shadcn.com/docs/components)
- [TanStack Router Docs](https://tanstack.com/router/latest)
- [Tailwind CSS](https://tailwindcss.com/docs)
