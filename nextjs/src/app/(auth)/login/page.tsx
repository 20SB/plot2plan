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
    <Card className="bg-slate-900 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Sign In</CardTitle>
        <CardDescription className="text-slate-400">Access your floor plans</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
          <Button type="submit" disabled={loading}
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-mono tracking-wider">
            {loading ? 'SIGNING IN...' : 'SIGN IN'}
          </Button>
        </form>
        <p className="text-slate-400 text-sm text-center mt-4">
          No account?{' '}
          <Link href="/register" className="text-cyan-400 hover:text-cyan-300">Register</Link>
        </p>
      </CardContent>
    </Card>
  )
}
