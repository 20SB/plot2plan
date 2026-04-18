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
      <div className="mb-10 text-center space-y-2">
        <h1 className="text-4xl font-semibold text-gradient tracking-tighter leading-tight">Welcome back</h1>
        <p className="text-foreground-muted font-medium">Access your architectural workspace</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <label className="text-[11px] font-mono font-medium text-foreground-subtle uppercase tracking-widest px-1">Email Address</label>
          <Input
            {...register('email')}
            type="email"
            placeholder="name@studio.com"
            className="h-12 rounded-xl text-base"
          />
          {errors.email && <p className="text-destructive text-[11px] font-bold mt-1.5 px-1 uppercase tracking-wider">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <label className="text-[11px] font-mono font-medium text-foreground-subtle uppercase tracking-widest">Password</label>
            <Link href="#" className="text-[11px] font-mono font-bold text-accent uppercase tracking-widest hover:underline transition-all">Forgot?</Link>
          </div>
          <Input
            {...register('password')}
            type="password"
            placeholder="••••••••"
            className="h-12 rounded-xl text-base"
          />
          {errors.password && <p className="text-destructive text-[11px] font-bold mt-1.5 px-1 uppercase tracking-wider">{errors.password.message}</p>}
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-14 rounded-xl font-semibold text-lg shadow-accent-glow mt-4"
        >
          {loading ? (
            <span className="flex items-center gap-3">
               <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
               SECURELY SIGNING IN...
            </span>
          ) : (
            'SIGN IN TO PLOT2PLAN'
          )}
        </Button>
      </form>

      <div className="relative my-10">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-white/[0.06]" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-[#0a0a0c] px-2 text-foreground-subtle font-mono tracking-widest">or</span>
        </div>
      </div>

      <p className="text-center text-sm font-medium text-foreground-muted">
        New architect?{' '}
        <Link href="/register" className="text-accent hover:text-accent-bright transition-colors font-semibold">
          Create Account
        </Link>
      </p>
    </>
  )
}
