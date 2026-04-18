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
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-black text-foreground tracking-tighter leading-none mb-3">Welcome back</h1>
        <p className="text-muted-foreground font-medium">Access your architectural workspace</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
          <div className="flex items-center justify-between px-1">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Password</label>
            <Link href="#" className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">Forgot?</Link>
          </div>
          <Input
            {...register('password')}
            type="password"
            placeholder="••••••••"
            className="h-12 rounded-xl text-base font-medium"
          />
          {errors.password && <p className="text-destructive text-[10px] font-bold mt-1.5 px-1 uppercase tracking-wider">{errors.password.message}</p>}
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-14 rounded-xl font-black text-lg shadow-premium hover:shadow-premium-hover transition-all active:scale-[0.98] mt-4"
        >
          {loading ? (
            <span className="flex items-center gap-3">
               <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
               SECURELY SIGNING IN...
            </span>
          ) : (
            'SIGN IN TO PLOT2PLAN'
          )}
        </Button>
      </form>

      <p className="text-center text-sm font-bold text-muted-foreground mt-10">
        New architect?{' '}
        <Link href="/register" className="text-primary hover:text-primary/80 transition-colors uppercase tracking-widest text-xs">
          Create Account
        </Link>
      </p>
    </>
  )
}
