'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
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
import { Post } from '@/types';
import { getAssetUrl } from '@/lib/utils';

export default function EditPostPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: me, isLoading: meLoading } = useMe();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);

  const form = useForm<PostInput>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: '',
      content: '',
      tags: ''
    }
  });

  const postQuery = useQuery<Post>({
    queryKey: ['post', params.id],
    queryFn: async () => {
      const response = await api.get(`/posts/${params.id}`);
      return response.data.data as Post;
    },
    enabled: !!params.id && !!me
  });

  useEffect(() => {
    if (postQuery.data) {
      form.reset({
        title: postQuery.data.title,
        content: postQuery.data.content,
        tags: postQuery.data.tags?.join(', ') || ''
      });
      setRemoveImage(false);
      setImageFile(null);
    }
  }, [postQuery.data, form]);

  const preview = useMemo(() => {
    if (removeImage) return 'https://placehold.co/1200x630/png';
    if (imageFile) return URL.createObjectURL(imageFile);
    return getAssetUrl(postQuery.data?.image) || 'https://placehold.co/1200x630/png';
  }, [imageFile, postQuery.data?.image, removeImage]);

  const mutation = useMutation({
    mutationFn: async (values: PostInput) => {
      const formData = new FormData();
      formData.append('title', values.title);
      formData.append('content', values.content);
      formData.append('tags', values.tags || '');
      formData.append('removeImage', String(removeImage && !imageFile));
      if (imageFile) formData.append('image', imageFile);
      await api.patch(`/posts/${params.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    },
    onSuccess: () => {
      toast.success('Post updated successfully');
      router.push(`/posts/${params.id}`);
    },
    onError: (error) => toast.error(getErrorMessage(error))
  });

  if (meLoading || postQuery.isLoading) return <p className="text-slate-400">Loading...</p>;
  if (!me) {
    return (
      <Card className="mx-auto max-w-2xl p-8 text-center">
        <h1 className="text-2xl font-bold text-white">Login required</h1>
        <p className="mt-2 text-slate-400">Please login first to edit a post.</p>
        <div className="mt-6">
          <Link href="/login">
            <Button>Go to Login</Button>
          </Link>
        </div>
      </Card>
    );
  }
  if (!postQuery.data) return <p className="text-slate-400">Post not found.</p>;
  if (me._id !== postQuery.data.author?._id) {
    return (
      <Card className="mx-auto max-w-2xl p-8 text-center">
        <h1 className="text-2xl font-bold text-white">Access denied</h1>
        <p className="mt-2 text-slate-400">You can only edit your own post.</p>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Edit post</h1>
        <p className="mt-2 text-slate-400">Update the title, body, tags, and post image from local storage.</p>
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
            <label className="mb-2 block text-sm font-medium text-slate-200">Upload New Image</label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setImageFile(file);
                if (file) setRemoveImage(false);
              }}
            />
            <div className="mt-3 flex flex-wrap items-center gap-3">
              {postQuery.data.image || imageFile ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setImageFile(null);
                    setRemoveImage(true);
                  }}
                >
                  Remove current image
                </Button>
              ) : null}
              <p className="text-xs text-slate-400">Only local file upload is supported now.</p>
            </div>
          </div>

          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Updating...' : 'Update Post'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
