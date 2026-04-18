import { auth, signOut } from '@/lib/auth'
import { redirect } from 'next/navigation'
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
    <div className="min-h-screen bg-background text-foreground animate-in">
      {/* Nav */}
      <header className="glass border-b sticky top-0 z-50">
        <div className="max-w-screen-2xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="size-8 bg-primary rounded-lg flex items-center justify-center transition-transform group-hover:scale-110">
              <span className="text-white font-bold text-lg leading-none">P</span>
            </div>
            <div className="flex flex-col">
              <span className="text-foreground font-bold text-sm tracking-tight">PLOT2PLAN</span>
              <span className="text-muted-foreground text-[10px] font-mono leading-none">VASTU BLUEPRINT</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 overflow-hidden border bg-muted/50 hover:bg-muted transition-all">
                    <Avatar className="h-full w-full">
                      <AvatarFallback className="bg-primary text-white text-xs font-semibold">{initials}</AvatarFallback>
                    </Avatar>
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="w-56 mt-2">
                <div className="px-2 py-2 mb-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 px-2">Account</p>
                  <p className="text-sm font-semibold truncate px-2">{session.user.name}</p>
                  <p className="text-xs text-muted-foreground truncate px-2">{session.user.email}</p>
                </div>
                <DropdownMenuSeparator />
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
                        className="w-full text-left text-destructive flex items-center gap-2"
                      />
                    }
                  >
                    Sign Out
                  </DropdownMenuItem>
                </form>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      <main className="max-w-screen-2xl mx-auto p-6">{children}</main>
    </div>
  )
}
