'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { USER_ROLES } from '@/constants';
import { useState } from 'react';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
import { loginUser } from '@/actions/users';

const formSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.string().min(1, 'Please select a role'),
});

type FormData = z.infer<typeof formSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      role: '',
    },
  });

  async function onSubmit(data: FormData) {
    setIsSubmitting(true);
    try {
      const result = await loginUser(data.email, data.password, data.role);

      if (result.success && result.token && result.user) {
        toast.success('Login successful!');
        (Cookies as any).set('authToken', result.token, { expires: 7 });
        
        const redirectPath = result.user.role === 'admin' ? '/admin/dashboard' : '/user/events';
        
        setTimeout(() => {
          router.push(redirectPath);
        }, 1500);
      } else {
        toast.error(result.message || 'Login failed. Please try again.');
      }
    } catch (error: any) {
      toast.error(error.message || 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-sm bg-white rounded-lg shadow-md p-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome Back</h1>
          <p className="text-muted-foreground">Sign in to your NextEvents account</p>
        </div>

        {/* Form */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {/* Email Field */}
          <div>
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Email Address
                  </label>
                  <Input
                    {...field}
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    aria-invalid={fieldState.invalid}
                    className={fieldState.invalid ? 'border-red-500' : ''}
                  />
                  {fieldState.invalid && (
                    <p className="text-sm text-red-500 mt-1">{fieldState.error?.message}</p>
                  )}
                </div>
              )}
            />
          </div>

          {/* Password Field */}
          <div>
            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Password
                  </label>
                  <Input
                    {...field}
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    aria-invalid={fieldState.invalid}
                    className={fieldState.invalid ? 'border-red-500' : ''}
                  />
                  {fieldState.invalid && (
                    <p className="text-sm text-red-500 mt-1">{fieldState.error?.message}</p>
                  )}
                </div>
              )}
            />
          </div>

          {/* Role Selection Field */}
          <div>
            <Controller
              name="role"
              control={form.control}
              render={({ field, fieldState }) => (
                <div className='select'>
                  <label
                    htmlFor="role"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Role
                  </label>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      id="role"
                      aria-invalid={fieldState.invalid}
                      className={fieldState.invalid ? 'border-red-500' : ''}
                    >
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      {USER_ROLES.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <p className="text-sm text-red-500 mt-1">{fieldState.error?.message}</p>
                  )}
                </div>
              )}
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full"
            size="default"
          >
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>

        {/* Register Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link
              href="/register"
              className="font-medium text-primary hover:underline"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}