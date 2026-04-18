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
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-app-text tracking-tight">Create your account</h1>
        <p className="text-app-soft text-sm mt-1">Start designing Vastu-compliant spaces</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-app-soft uppercase tracking-wider">Full Name</label>
          <Input
            {...register('name')}
            placeholder="Jane Architect"
            className="bg-app-input border-white/10 text-app-text placeholder:text-app-faint h-11 focus:border-app-accent focus:ring-app-accent/20 rounded-xl"
          />
          {errors.name && <p className="text-app-danger text-xs mt-1">{errors.name.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-app-soft uppercase tracking-wider">Email</label>
          <Input
            {...register('email')}
            type="email"
            placeholder="you@example.com"
            className="bg-app-input border-white/10 text-app-text placeholder:text-app-faint h-11 focus:border-app-accent focus:ring-app-accent/20 rounded-xl"
          />
          {errors.email && <p className="text-app-danger text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-app-soft uppercase tracking-wider">Password</label>
          <Input
            {...register('password')}
            type="password"
            placeholder="••••••"
            className="bg-app-input border-white/10 text-app-text placeholder:text-app-faint h-11 focus:border-app-accent focus:ring-app-accent/20 rounded-xl"
          />
          {errors.password && <p className="text-app-danger text-xs mt-1">{errors.password.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-app-soft uppercase tracking-wider">Confirm Password</label>
          <Input
            {...register('confirmPassword')}
            type="password"
            placeholder="••••••"
            className="bg-app-input border-white/10 text-app-text placeholder:text-app-faint h-11 focus:border-app-accent focus:ring-app-accent/20 rounded-xl"
          />
          {errors.confirmPassword && <p className="text-app-danger text-xs mt-1">{errors.confirmPassword.message}</p>}
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-11 bg-app-accent hover:bg-app-accent-dim text-white font-medium rounded-xl transition-all duration-150 shadow-[0_0_20px_rgba(99,102,241,0.25)] hover:shadow-[0_0_28px_rgba(99,102,241,0.4)] mt-6"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
              </svg>
              Creating account…
            </span>
          ) : (
            'Create account'
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-app-faint mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-app-violet hover:text-app-text transition-colors">
          Sign in
        </Link>
      </p>
    </>
  )
}
