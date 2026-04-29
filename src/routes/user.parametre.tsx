import { createFileRoute, Link, Outlet, useRouterState } from '@tanstack/react-router'
import { ArrowLeft, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { setTheme, useTheme } from '@/lib/theme'

export const Route = createFileRoute('/user/parametre')({
  component: UserParametrePage,
})

function UserParametrePage() {
  const pathname = useRouterState({ select: (state) => state.location.pathname })

  return pathname === '/user/parametre' ? <GeneralParametrePage /> : <Outlet />
}

function GeneralParametrePage() {
  const theme = useTheme()
  const isDark = theme === 'dark'

  return (
    <div className="space-y-4">
      <Button asChild variant="ghost" className="px-2">
        <Link to="/user">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour profil
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Parametres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-muted p-2">
                {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </div>
              <div className="space-y-1">
                <Label htmlFor="theme-mode" className="text-sm font-medium">
                  Mode sombre
                </Label>
                <p className="text-sm text-muted-foreground">
                  {isDark ? 'Theme sombre active.' : 'Theme clair active.'}
                </p>
              </div>
            </div>
            <Switch
              id="theme-mode"
              checked={isDark}
              onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
