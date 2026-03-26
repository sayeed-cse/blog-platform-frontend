'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { PostCard } from '@/components/posts/post-card';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { useMe } from '@/hooks/use-auth';
import { api } from '@/lib/api';
import { Bookmark } from '@/types';

export default function BookmarksPage() {
  const { data: me, isLoading: meLoading } = useMe();

  const bookmarksQuery = useQuery<Bookmark[]>({
    queryKey: ['bookmarks'],
    queryFn: async () => {
      const response = await api.get('/bookmarks');
      return response.data.data as Bookmark[];
    },
    enabled: !!me
  });

  if (meLoading) return <p className="text-slate-400">Loading...</p>;
  if (!me) {
    return (
      <Card className="mx-auto max-w-2xl p-8 text-center">
        <h1 className="text-2xl font-bold text-white">Login required</h1>
        <p className="mt-2 text-slate-400">Please login first to access your bookmarks.</p>
        <div className="mt-6">
          <Link href="/login">
            <Button>Go to Login</Button>
          </Link>
        </div>
      </Card>
    );
  }

  const bookmarks = bookmarksQuery.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Saved Posts</h1>
        <p className="mt-2 text-slate-400">All your bookmarked articles in one place.</p>
      </div>

      {bookmarksQuery.isLoading ? (
        <p className="text-slate-400">Loading bookmarks...</p>
      ) : bookmarks.length ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {bookmarks.map((item) => (
            <PostCard key={item._id} post={item.post} bookmarked />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No bookmarks yet"
          description="Save interesting posts from the home page and they will appear here."
        />
      )}
    </div>
  );
}
