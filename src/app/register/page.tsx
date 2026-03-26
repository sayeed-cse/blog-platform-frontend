'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { api, getErrorMessage } from '@/lib/api';
import { RegisterInput, registerSchema } from '@/schemas/auth';

export default function RegisterPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: ''
    }
  });

  const mutation = useMutation({
    mutationFn: async (values: RegisterInput) => {
      await api.post('/auth/register', values);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['me'] });
      toast.success('Registration successful');
      router.push('/');
    },
    onError: (error) => toast.error(getErrorMessage(error))
  });

  return (
    <div className="mx-auto max-w-md">
      <Card className="p-8">
        <h1 className="text-3xl font-bold text-white">Create your account</h1>
        <p className="mt-2 text-sm text-slate-400">Join the platform to publish and discuss blogs.</p>

        <form className="mt-8 space-y-4" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">Full Name</label>
            <Input placeholder="Enter your name" {...form.register('name')} />
            {form.formState.errors.name ? (
              <p className="mt-1 text-sm text-red-400">{form.formState.errors.name.message}</p>
            ) : null}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">Email</label>
            <Input placeholder="Enter your email" {...form.register('email')} />
            {form.formState.errors.email ? (
              <p className="mt-1 text-sm text-red-400">{form.formState.errors.email.message}</p>
            ) : null}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">Password</label>
            <Input type="password" placeholder="Create a password" {...form.register('password')} />
            {form.formState.errors.password ? (
              <p className="mt-1 text-sm text-red-400">{form.formState.errors.password.message}</p>
            ) : null}
          </div>

          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? 'Creating account...' : 'Register'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-blue-400 hover:text-blue-300">
            Login
          </Link>
        </p>
      </Card>
    </div>
  );
}
