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
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
})
type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    const result = await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false,
    })
    setLoading(false)

    if (result?.error) {
      toast.error('Invalid email or password')
    } else {
      router.push('/')
      router.refresh()
    }
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-app-text tracking-tight">Welcome back</h1>
        <p className="text-app-soft text-sm mt-1">Sign in to your plot2plan account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
              Signing in…
            </span>
          ) : (
            'Sign in'
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-app-faint mt-6">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-app-violet hover:text-app-text transition-colors">
          Create one
        </Link>
      </p>
    </>
  )
}
