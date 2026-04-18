import { auth, signOut } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const initials = session.user.name?.split(' ').map(n => n[0]).join('').toUpperCase() ?? 'U'

  return (
    <div className="min-h-screen bg-transparent text-foreground animate-in relative z-10">
      {/* Nav */}
      <header className="glass-surface border-x-0 border-t-0 rounded-none sticky top-0 z-50 transition-colors">
        <div className="max-w-screen-2xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group cursor-pointer">
            <div className="size-7 bg-accent rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 shadow-accent-glow">
              <span className="text-white font-bold text-base leading-none">P</span>
            </div>
            <div className="flex flex-col">
              <span className="text-gradient font-bold text-xs tracking-tight">PLOT2PLAN</span>
              <span className="text-foreground-subtle text-[9px] font-mono leading-none tracking-[0.2em] px-0.5 uppercase">Blueprint</span>
            </div>
          </Link>
          
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0 overflow-hidden border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08] transition-all hover:scale-105 active:scale-95">
                    <Avatar className="h-full w-full">
                      <AvatarFallback className="bg-accent text-[8px] text-white font-bold leading-none">{initials}</AvatarFallback>
                    </Avatar>
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="w-56 mt-2 bg-bg-elevated/95 backdrop-blur-2xl border-white/[0.08] shadow-linear p-1">
                <div className="px-3 py-2.5 mb-1 bg-white/[0.02] rounded-xl border border-white/[0.04]">
                  <p className="text-[8px] font-mono font-bold text-foreground-subtle uppercase tracking-[0.2em] mb-1 opacity-60">Identity</p>
                  <p className="text-xs font-semibold text-foreground tracking-tight leading-none mb-1">{session.user.name}</p>
                  <p className="text-[10px] text-foreground-muted truncate font-medium">{session.user.email}</p>
                </div>
                <div className="p-0.5 space-y-0.5">
                  <DropdownMenuSeparator className="bg-white/[0.06] mx-1" />
                  <form
                    action={async () => {
                      'use server'
                      await signOut({ redirectTo: '/login' })
                    }}
                  >
                    <DropdownMenuItem
                      render={
                        <button
                          type="submit"
                          className="w-full text-left flex items-center gap-2 group/item cursor-pointer"
                        />
                      }
                    >
                      <div className="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg group-hover/item:bg-rose-500/10 transition-colors">
                        <span className="text-[10px] font-bold text-foreground-subtle group-hover/item:text-rose-400 uppercase tracking-widest leading-none">Terminate Session</span>
                      </div>
                    </DropdownMenuItem>
                  </form>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      <main className="max-w-screen-2xl mx-auto p-5">{children}</main>
    </div>
  )
}
