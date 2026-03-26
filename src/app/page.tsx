'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { PostCard } from '@/components/posts/post-card';
import { api } from '@/lib/api';
import { useDebounce } from '@/hooks/use-debounce';
import { useMe } from '@/hooks/use-auth';
import { Post, Bookmark } from '@/types';

export default function HomePage() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const { data: me } = useMe();

  const postsQuery = useQuery<Post[]>({
    queryKey: ['posts', debouncedSearch],
    queryFn: async () => {
      const response = await api.get('/posts', {
        params: debouncedSearch ? { search: debouncedSearch } : undefined
      });
      return response.data.data as Post[];
    }
  });

  const bookmarksQuery = useQuery<Bookmark[]>({
    queryKey: ['bookmarks'],
    queryFn: async () => {
      const response = await api.get('/bookmarks');
      return response.data.data as Bookmark[];
    },
    enabled: !!me,
    retry: false
  });

  const bookmarkedIds = useMemo(
    () => new Set((bookmarksQuery.data || []).map((item) => item.post?._id)),
    [bookmarksQuery.data]
  );

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8 shadow-soft">
        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
          <div>
            <p className="mb-3 inline-block rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">
              Blog Platform
            </p>
            <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl">
              Publish, explore, comment, reply, search, and bookmark in one full-stack blog app.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-300">
              This assignment-ready project includes secure authentication, profile management, post creation with image uploads,
              threaded comments up to five levels, keyword search, bookmarking, and a responsive user interface.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by title, content, or tags..."
                className="pl-10"
              />
            </div>
            <p className="mt-3 text-sm text-slate-400">
              Try searching for keywords like <span className="text-blue-300">react</span>,
              <span className="mx-1 text-blue-300">mongodb</span>, or a topic name.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-white">Latest Posts</h2>
            <p className="text-sm text-slate-400">Explore the latest published content from the community.</p>
          </div>
        </div>

        {postsQuery.isLoading ? (
          <p className="text-slate-400">Loading posts...</p>
        ) : postsQuery.data?.length ? (
          <div className="grid gap-6 lg:grid-cols-2">
            {postsQuery.data.map((post) => (
              <PostCard key={post._id} post={post} bookmarked={bookmarkedIds.has(post._id)} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No posts found"
            description="Create the first post or try a different search keyword."
          />
        )}
      </section>
    </div>
  );
}
