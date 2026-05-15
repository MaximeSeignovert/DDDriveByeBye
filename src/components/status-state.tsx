import { AlertTriangle, MapPinned, SearchX, WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type StatusStateTone = 'empty' | 'error' | 'offline'

type StatusStateProps = {
  tone?: StatusStateTone
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

const toneConfig = {
  empty: {
    icon: SearchX,
    glow: 'from-sky-500/18 via-cyan-400/10 to-transparent',
    iconClassName: 'text-sky-600 dark:text-sky-300',
  },
  error: {
    icon: AlertTriangle,
    glow: 'from-red-500/18 via-orange-400/10 to-transparent',
    iconClassName: 'text-red-600 dark:text-red-300',
  },
  offline: {
    icon: WifiOff,
    glow: 'from-amber-500/18 via-yellow-400/10 to-transparent',
    iconClassName: 'text-amber-600 dark:text-amber-300',
  },
} satisfies Record<StatusStateTone, { icon: typeof MapPinned; glow: string; iconClassName: string }>

export function StatusState({
  tone = 'empty',
  title,
  description,
  actionLabel,
  onAction,
  className,
}: StatusStateProps) {
  const config = toneConfig[tone]
  const Icon = config.icon

  return (
    <Card className={cn('relative overflow-hidden border-dashed bg-background/85 shadow-none', className)}>
      <span className={cn('pointer-events-none absolute -right-12 -top-16 h-36 w-36 rounded-full bg-linear-to-br blur-2xl', config.glow)} />
      <CardContent className="relative flex flex-col items-center px-5 py-7 text-center">
        <div className="mb-4 rounded-2xl border bg-card/80 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]">
          <Icon className={cn('h-6 w-6', config.iconClassName)} />
        </div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="mt-1 max-w-72 text-sm leading-6 text-muted-foreground">{description}</p>
        {actionLabel && onAction ? (
          <Button type="button" variant="outline" className="mt-4 rounded-full" onClick={onAction}>
            {actionLabel}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  )
}

