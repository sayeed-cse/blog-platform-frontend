'use client';

import Link from 'next/link';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Bookmark, CalendarDays, MessageCircle, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import { api, getErrorMessage } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useMe } from '@/hooks/use-auth';
import { getAssetUrl, timeAgo } from '@/lib/utils';
import { Post } from '@/types';

export function PostCard({
  post,
  bookmarked = false,
  showActions = true,
  onDelete
}: {
  post: Post;
  bookmarked?: boolean;
  showActions?: boolean;
  onDelete?: (postId: string) => void;
}) {
  const queryClient = useQueryClient();
  const { data: me } = useMe();

  const bookmarkMutation = useMutation({
    mutationFn: async () => {
      if (bookmarked) {
        await api.delete(`/bookmarks/${post._id}`);
      } else {
        await api.post(`/bookmarks/${post._id}`);
      }
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['bookmarks'] }),
        queryClient.invalidateQueries({ queryKey: ['posts'] }),
        queryClient.invalidateQueries({ queryKey: ['post', post._id] })
      ]);
      toast.success(bookmarked ? 'Bookmark removed' : 'Post saved');
    },
    onError: (error) => toast.error(getErrorMessage(error))
  });

  const assetUrl = getAssetUrl(post.image);

  return (
    <Card className="overflow-hidden">
      {assetUrl ? (
        <img src={assetUrl} alt={post.title} className="h-60 w-full object-cover" />
      ) : null}

      <div className="space-y-4 p-6">
        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
          <span className="inline-flex items-center gap-2">
            <UserRound size={15} />
            {post.author?.name || 'Unknown Author'}
          </span>
          <span className="inline-flex items-center gap-2">
            <CalendarDays size={15} />
            {timeAgo(post.createdAt)}
          </span>
          <span className="inline-flex items-center gap-2">
            <MessageCircle size={15} />
            Threaded discussion
          </span>
        </div>

        <div>
          <Link href={`/posts/${post._id}`} className="block">
            <h2 className="text-2xl font-semibold text-white transition hover:text-blue-400">
              {post.title}
            </h2>
          </Link>
          <p className="mt-3 line-clamp-4 text-sm leading-7 text-slate-300">{post.content}</p>
        </div>

        {post.tags?.length ? (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-xs text-slate-300"
              >
                #{tag}
              </span>
            ))}
          </div>
        ) : null}

        {showActions ? (
          <div className="flex flex-wrap items-center gap-3">
            <Link href={`/posts/${post._id}`}>
              <Button>Read More</Button>
            </Link>
            {me ? (
              <Button
                variant="outline"
                onClick={() => bookmarkMutation.mutate()}
                disabled={bookmarkMutation.isPending}
                className="gap-2"
              >
                <Bookmark size={16} />
                {bookmarked ? 'Saved' : 'Save'}
              </Button>
            ) : null}
            {onDelete && me?._id === post.author?._id ? (
              <Button variant="danger" onClick={() => onDelete(post._id)}>
                Delete
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </Card>
  );
}
