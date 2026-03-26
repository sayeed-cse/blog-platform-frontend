'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useMe } from '@/hooks/use-auth';
import { api, getErrorMessage } from '@/lib/api';
import { PostInput, postSchema } from '@/schemas/post';

export default function CreatePostPage() {
  const router = useRouter();
  const { data: me, isLoading } = useMe();
  const [imageFile, setImageFile] = useState<File | null>(null);

  const form = useForm<PostInput>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: '',
      content: '',
      tags: ''
    }
  });

  const preview = useMemo(() => {
    if (imageFile) return URL.createObjectURL(imageFile);
    return 'https://placehold.co/1200x630/png';
  }, [imageFile]);

  const mutation = useMutation({
    mutationFn: async (values: PostInput) => {
      const formData = new FormData();
      formData.append('title', values.title);
      formData.append('content', values.content);
      formData.append('tags', values.tags || '');
      if (imageFile) formData.append('image', imageFile);
      const response = await api.post('/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data.data;
    },
    onSuccess: (post) => {
      toast.success('Post created successfully');
      router.push(`/posts/${post._id}`);
    },
    onError: (error) => toast.error(getErrorMessage(error))
  });

  if (isLoading) return <p className="text-slate-400">Checking access...</p>;
  if (!me) {
    return (
      <Card className="mx-auto max-w-2xl p-8 text-center">
        <h1 className="text-2xl font-bold text-white">Login required</h1>
        <p className="mt-2 text-slate-400">Please login first to create a post.</p>
        <div className="mt-6">
          <Link href="/login">
            <Button>Go to Login</Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Create a new post</h1>
        <p className="mt-2 text-slate-400">Share an article with title, body, image upload, and searchable tags.</p>
      </div>

      <Card className="overflow-hidden">
        <img src={preview} alt="Preview" className="h-72 w-full object-cover" />
        <form className="space-y-5 p-6" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">Title</label>
            <Input placeholder="Post title" {...form.register('title')} />
            {form.formState.errors.title ? (
              <p className="mt-1 text-sm text-red-400">{form.formState.errors.title.message}</p>
            ) : null}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">Content</label>
            <Textarea className="min-h-[220px]" placeholder="Write your article..." {...form.register('content')} />
            {form.formState.errors.content ? (
              <p className="mt-1 text-sm text-red-400">{form.formState.errors.content.message}</p>
            ) : null}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">Tags</label>
            <Input placeholder="react, mongodb, design" {...form.register('tags')} />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">Upload Post Image</label>
            <Input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
            <p className="mt-2 text-xs text-slate-400">Choose an image from your device. External image URL support has been removed.</p>
          </div>

          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Publishing...' : 'Publish Post'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
