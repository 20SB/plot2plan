import { auth, signOut } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const initials = session.user.name?.split(' ').map(n => n[0]).join('').toUpperCase() ?? 'U'

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Nav */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-screen-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-cyan-400 tracking-wider font-mono">PLOT2PLAN</span>
            <span className="text-slate-600 text-xs font-mono hidden sm:block">VASTU BLUEPRINT GENERATOR</span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" className="flex items-center gap-2 text-slate-300 hover:text-white">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-cyan-800 text-white text-xs">{initials}</AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:block text-sm">{session.user.name}</span>
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
              <DropdownMenuItem className="text-slate-300 text-xs font-mono">
                {session.user.email}
              </DropdownMenuItem>
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
                      className="w-full text-left text-red-400 hover:text-red-300 cursor-pointer"
                    />
                  }
                >
                  Sign Out
                </DropdownMenuItem>
              </form>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <main>{children}</main>
    </div>
  )
}
