'use client';

import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { PostCard } from '@/components/posts/post-card';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { useMe } from '@/hooks/use-auth';
import { api, getErrorMessage } from '@/lib/api';
import { Post } from '@/types';

export default function MyPostsPage() {
  const queryClient = useQueryClient();
  const { data: me, isLoading: meLoading } = useMe();

  const postsQuery = useQuery<Post[]>({
    queryKey: ['my-posts'],
    queryFn: async () => {
      const response = await api.get('/posts/me');
      return response.data.data as Post[];
    },
    enabled: !!me
  });

  const deleteMutation = useMutation({
    mutationFn: async (postId: string) => {
      await api.delete(`/posts/${postId}`);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['my-posts'] }),
        queryClient.invalidateQueries({ queryKey: ['posts'] })
      ]);
      toast.success('Post deleted successfully');
    },
    onError: (error) => toast.error(getErrorMessage(error))
  });

  if (meLoading) return <p className="text-slate-400">Loading...</p>;
  if (!me) {
    return (
      <Card className="mx-auto max-w-2xl p-8 text-center">
        <h1 className="text-2xl font-bold text-white">Login required</h1>
        <p className="mt-2 text-slate-400">Please login first to manage your posts.</p>
        <div className="mt-6">
          <Link href="/login">
            <Button>Go to Login</Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">My Posts</h1>
          <p className="mt-2 text-slate-400">Manage your published articles and update them anytime.</p>
        </div>
        <Link href="/create-post">
          <Button>Create New Post</Button>
        </Link>
      </div>

      {postsQuery.isLoading ? (
        <p className="text-slate-400">Loading your posts...</p>
      ) : postsQuery.data?.length ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {postsQuery.data.map((post) => (
            <div key={post._id} className="space-y-3">
              <PostCard post={post} onDelete={(postId) => deleteMutation.mutate(postId)} />
              <Link href={`/edit-post/${post._id}`}>
                <Button variant="outline" className="w-full">
                  Edit Post
                </Button>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No posts yet"
          description="Start by publishing your first article from the create post page."
        />
      )}
    </div>
  );
}
