'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useMe } from '@/hooks/use-auth';
import { api, getErrorMessage } from '@/lib/api';
import { getAssetUrl } from '@/lib/utils';

type ProfileInput = {
  name: string;
  bio: string;
};

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const { data: me, isLoading } = useMe();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);

  const form = useForm<ProfileInput>({
    defaultValues: {
      name: '',
      bio: ''
    }
  });

  useEffect(() => {
    if (me) {
      form.reset({
        name: me.name || '',
        bio: me.bio || ''
      });
      setAvatarFile(null);
      setRemoveAvatar(false);
    }
  }, [me, form]);

  const avatarPreview = useMemo(() => {
    if (removeAvatar) return '';
    if (avatarFile) return URL.createObjectURL(avatarFile);
    return getAssetUrl(me?.avatar) || '';
  }, [avatarFile, me?.avatar, removeAvatar]);

  const mutation = useMutation({
    mutationFn: async (values: ProfileInput) => {
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('bio', values.bio || '');
      formData.append('removeAvatar', String(removeAvatar && !avatarFile));
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }
      await api.patch('/users/profile', formData);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['me'] });
      toast.success('Profile updated successfully');
      setAvatarFile(null);
      setRemoveAvatar(false);
    },
    onError: (error) => toast.error(getErrorMessage(error))
  });

  if (isLoading) return <p className="text-slate-400">Loading profile...</p>;

  if (!me) {
    return (
      <Card className="mx-auto max-w-2xl p-8 text-center">
        <h1 className="text-2xl font-bold text-white">Login required</h1>
        <p className="mt-2 text-slate-400">Please login first to access your profile.</p>
        <div className="mt-6">
          <Link href="/login">
            <Button>Go to Login</Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Card className="p-8">
        <div className="mb-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <img
            src={avatarPreview || 'https://placehold.co/120x120/png'}
            alt={me.name}
            className="h-24 w-24 rounded-full object-cover"
          />
          <div>
            <h1 className="text-3xl font-bold text-white">My Profile</h1>
            <p className="mt-1 text-slate-400">Update your public details and upload a profile photo from your device.</p>
          </div>
        </div>

        <form className="space-y-5" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">Name</label>
            <Input placeholder="Your full name" {...form.register('name', { required: true })} />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">Profile Picture</label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setAvatarFile(file);
                if (file) setRemoveAvatar(false);
              }}
            />
            <div className="mt-3 flex flex-wrap items-center gap-3">
              {me.avatar || avatarFile ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setAvatarFile(null);
                    setRemoveAvatar(true);
                  }}
                >
                  Remove current photo
                </Button>
              ) : null}
              <p className="text-xs text-slate-400">Select an image from your computer. It will be stored online.</p>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">Bio</label>
            <Textarea placeholder="Write a short introduction" {...form.register('bio')} />
          </div>

          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
