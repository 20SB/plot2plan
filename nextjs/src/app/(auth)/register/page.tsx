'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

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
    <Card className="bg-slate-900 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Create Account</CardTitle>
        <CardDescription className="text-slate-400">Start designing Vastu-compliant layouts</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label className="text-slate-300">Full Name</Label>
            <Input {...register('name')} placeholder="Jane Architect"
              className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 mt-1" />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <Label className="text-slate-300">Email</Label>
            <Input {...register('email')} type="email" placeholder="you@example.com"
              className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 mt-1" />
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <Label className="text-slate-300">Password</Label>
            <Input {...register('password')} type="password" placeholder="••••••"
              className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 mt-1" />
            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
          </div>
          <div>
            <Label className="text-slate-300">Confirm Password</Label>
            <Input {...register('confirmPassword')} type="password" placeholder="••••••"
              className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 mt-1" />
            {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>}
          </div>
          <Button type="submit" disabled={loading}
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-mono tracking-wider">
            {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
          </Button>
        </form>
        <p className="text-slate-400 text-sm text-center mt-4">
          Already have an account?{' '}
          <Link href="/login" className="text-cyan-400 hover:text-cyan-300">Sign in</Link>
        </p>
      </CardContent>
    </Card>
  )
}
