'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})
type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: data.name, email: data.email, password: data.password }),
      })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error || 'Registration failed')
        setLoading(false)
        return
      }
      await signIn('credentials', { email: data.email, password: data.password, redirect: false })
      router.push('/')
      router.refresh()
    } catch {
      toast.error('Registration failed')
      setLoading(false)
    }
  }

  return (
    <>
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-black text-foreground tracking-tighter leading-none mb-3">Create Workspace</h1>
        <p className="text-muted-foreground font-medium">Start designing Vastu-compliant spaces</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Full Name</label>
          <Input
            {...register('name')}
            placeholder="Jane Architect"
            className="h-12 rounded-xl text-base font-medium"
          />
          {errors.name && <p className="text-destructive text-[10px] font-bold mt-1.5 px-1 uppercase tracking-wider">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Email Address</label>
          <Input
            {...register('email')}
            type="email"
            placeholder="name@studio.com"
            className="h-12 rounded-xl text-base font-medium"
          />
          {errors.email && <p className="text-destructive text-[10px] font-bold mt-1.5 px-1 uppercase tracking-wider">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Safe Password</label>
          <Input
            {...register('password')}
            type="password"
            placeholder="••••••••"
            className="h-12 rounded-xl text-base font-medium"
          />
          {errors.password && <p className="text-destructive text-[10px] font-bold mt-1.5 px-1 uppercase tracking-wider">{errors.password.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Verify Password</label>
          <Input
            {...register('confirmPassword')}
            type="password"
            placeholder="••••••••"
            className="h-12 rounded-xl text-base font-medium"
          />
          {errors.confirmPassword && <p className="text-destructive text-[10px] font-bold mt-1.5 px-1 uppercase tracking-wider">{errors.confirmPassword.message}</p>}
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-14 rounded-xl font-black text-lg shadow-premium hover:shadow-premium-hover transition-all active:scale-[0.98] mt-4"
        >
          {loading ? (
            <span className="flex items-center gap-3">
               <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
               FORGING IDENTITY...
            </span>
          ) : (
            'JOIN THE ARCHITECTS'
          )}
        </Button>
      </form>

      <p className="text-center text-sm font-bold text-muted-foreground mt-10">
        Already registered?{' '}
        <Link href="/login" className="text-primary hover:text-primary/80 transition-colors uppercase tracking-widest text-xs">
          Sign In Instead
        </Link>
      </p>
    </>
  )
}
