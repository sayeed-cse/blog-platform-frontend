'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CommentThread } from '@/components/comments/comment-thread';
import { useMe } from '@/hooks/use-auth';
import { api, getErrorMessage, LIVE_REFETCH_INTERVAL } from '@/lib/api';
import { getAssetUrl, timeAgo } from '@/lib/utils';
import { CommentNode, Post } from '@/types';

export default function PostDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: me } = useMe();
  const postId = params.id;

  const postQuery = useQuery<Post>({
    queryKey: ['post', postId],
    queryFn: async () => {
      const response = await api.get(`/posts/${postId}`);
      return response.data.data as Post;
    },
    enabled: !!postId,
    refetchInterval: LIVE_REFETCH_INTERVAL,
    refetchIntervalInBackground: true
  });

  const commentsQuery = useQuery<CommentNode[]>({
    queryKey: ['comments', postId],
    queryFn: async () => {
      const response = await api.get(`/comments/post/${postId}`);
      return response.data.data as CommentNode[];
    },
    enabled: !!postId,
    refetchInterval: LIVE_REFETCH_INTERVAL,
    refetchIntervalInBackground: true
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/posts/${postId}`);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['posts'] }),
        queryClient.invalidateQueries({ queryKey: ['my-posts'] }),
        queryClient.invalidateQueries({ queryKey: ['bookmarks'] })
      ]);
      toast.success('Post deleted successfully');
      router.push('/my-posts');
    },
    onError: (error) => toast.error(getErrorMessage(error))
  });

  if (postQuery.isLoading) {
    return <p className="text-slate-400">Loading post...</p>;
  }

  if (!postQuery.data) {
    return (
      <Card className="p-8">
        <h1 className="text-2xl font-bold text-white">Post not found</h1>
        <p className="mt-2 text-slate-400">The post you are looking for does not exist.</p>
        <Link href="/" className="mt-4 inline-block">
          <Button>Back to Home</Button>
        </Link>
      </Card>
    );
  }

  const post = postQuery.data;
  const isOwner = me?._id === post.author?._id;

  return (
    <div className="space-y-8">
      <article className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70 shadow-soft">
        {post.image ? (
          <img src={getAssetUrl(post.image)} alt={post.title} className="h-[380px] w-full object-cover" />
        ) : null}

        <div className="space-y-6 p-8">
          <div className="space-y-2">
            <p className="text-sm text-slate-400">
              By <span className="font-semibold text-slate-200">{post.author?.name}</span> · {timeAgo(post.createdAt)}
            </p>
            <h1 className="text-4xl font-bold leading-tight text-white">{post.title}</h1>
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

          <div className="whitespace-pre-wrap text-base leading-8 text-slate-200">{post.content}</div>

          <div className="flex flex-wrap items-center gap-3 border-t border-slate-800 pt-4">
            {isOwner ? (
              <>
                <Link href={`/edit-post/${post._id}`}>
                  <Button variant="outline">Edit Post</Button>
                </Link>
                <Button variant="danger" onClick={() => deleteMutation.mutate()} disabled={deleteMutation.isPending}>
                  {deleteMutation.isPending ? 'Deleting...' : 'Delete Post'}
                </Button>
              </>
            ) : null}
          </div>
        </div>
      </article>

      <CommentThread postId={postId} comments={commentsQuery.data || []} />
    </div>
  );
}
