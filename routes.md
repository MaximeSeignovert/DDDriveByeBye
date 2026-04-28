## 🧭 TanStack Router

### RouteTreeGen
Le fichier `src/routeTree.gen.ts` est **généré automatiquement** par le plugin Vite. Il contient :
- L'arbre complet des routes
- Les types TypeScript pour chaque route
- La configuration de routage

⚠️ **Ne jamais modifier ce fichier manuellement** - il sera écrasé à chaque build.

### Structure des fichiers de routes

#### Route racine (`__root.tsx`)
```typescript
import { createRootRoute, Outlet } from '@tanstack/react-router'

export const Route = createRootRoute({
  component: () => (
    <div>
      <nav>Navigation globale</nav>
      <Outlet /> {/* Contenu des routes enfants */}
    </div>
  ),
})
```

#### Routes simples
```typescript
// src/routes/about.tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
  component: () => <div>Page À propos</div>
})
```

#### Routes avec paramètres
```typescript
// src/routes/users/$userId.tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/users/$userId')({
  component: () => {
    const { userId } = Route.useParams()
    return <div>Utilisateur : {userId}</div>
  }
})
```

#### Routes imbriquées
```typescript
// src/routes/dashboard.tsx (layout)
export const Route = createFileRoute('/dashboard')({
  component: () => (
    <div>
      <aside>Sidebar</aside>
      <Outlet />
    </div>
  )
})

// src/routes/dashboard/index.tsx
export const Route = createFileRoute('/dashboard/')({
  component: () => <div>Dashboard principal</div>
})

// src/routes/dashboard/settings.tsx
export const Route = createFileRoute('/dashboard/settings')({
  component: () => <div>Paramètres</div>
})
```

### Création de nouvelles routes

1. **Créez un fichier** dans `src/routes/` avec la convention de nommage :
   - `index.tsx` → `/`
   - `about.tsx` → `/about`
   - `users.tsx` → `/users`
   - `users/$id.tsx` → `/users/:id`
   - `dashboard/settings.tsx` → `/dashboard/settings`

2. **Le routeTree sera automatiquement régénéré** au prochain build/dev

3. **Navigation type-safe** :
```typescript
import { Link } from '@tanstack/react-router'

// Navigation simple
<Link to="/about">À propos</Link>

// Navigation avec paramètres
<Link to="/users/$userId" params={{ userId: '123' }}>
  Voir utilisateur
</Link>

// Navigation programmatique
import { useNavigate } from '@tanstack/react-router'

const navigate = useNavigate()
navigate({ to: '/dashboard' })
```