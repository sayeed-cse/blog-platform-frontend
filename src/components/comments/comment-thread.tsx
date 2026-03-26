'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api, getErrorMessage } from '@/lib/api';
import { useMe } from '@/hooks/use-auth';
import { commentSchema, CommentInput } from '@/schemas/comment';
import { CommentNode } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { getAssetUrl, timeAgo } from '@/lib/utils';

function ReplyForm({
  postId,
  parentCommentId,
  onDone
}: {
  postId: string;
  parentCommentId?: string;
  onDone?: () => void;
}) {
  const queryClient = useQueryClient();
  const form = useForm<CommentInput>({
    resolver: zodResolver(commentSchema),
    defaultValues: { content: '' }
  });

  const mutation = useMutation({
    mutationFn: async (values: CommentInput) => {
      await api.post('/comments', {
        postId,
        content: values.content,
        parentCommentId
      });
    },
    onSuccess: async () => {
      form.reset();
      await queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      toast.success(parentCommentId ? 'Reply added' : 'Comment added');
      onDone?.();
    },
    onError: (error) => toast.error(getErrorMessage(error))
  });

  return (
    <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className="space-y-3">
      <Textarea placeholder="Write your comment..." {...form.register('content')} />
      {form.formState.errors.content ? (
        <p className="text-sm text-red-400">{form.formState.errors.content.message}</p>
      ) : null}
      <div className="flex gap-2">
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Submitting...' : parentCommentId ? 'Reply' : 'Comment'}
        </Button>
        {onDone ? (
          <Button type="button" variant="outline" onClick={onDone}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}

function CommentItem({ comment, postId }: { comment: CommentNode; postId: string }) {
  const { data: me } = useMe();
  const queryClient = useQueryClient();
  const [showReply, setShowReply] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/comments/${comment._id}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      toast.success('Comment deleted');
    },
    onError: (error) => toast.error(getErrorMessage(error))
  });

  return (
    <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-3">
          <img
            src={getAssetUrl(comment.user?.avatar) || 'https://placehold.co/80x80/png'}
            alt={comment.user?.name || 'User'}
            className="h-10 w-10 rounded-full object-cover"
          />
          <div>
            <p className="font-semibold text-white">{comment.user?.name || 'Unknown User'}</p>
            <p className="text-xs text-slate-400">{timeAgo(comment.createdAt)}</p>
          </div>
        </div>

        {me?._id === comment.user?._id ? (
          <Button
            variant="ghost"
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
          >
            Delete
          </Button>
        ) : null}
      </div>

      <p className="whitespace-pre-wrap text-sm leading-7 text-slate-200">{comment.content}</p>

      <div className="flex items-center gap-3">
        {comment.depth < 4 && me ? (
          <Button variant="outline" onClick={() => setShowReply((prev) => !prev)}>
            {showReply ? 'Hide Reply' : 'Reply'}
          </Button>
        ) : null}
      </div>

      {showReply ? (
        <ReplyForm postId={postId} parentCommentId={comment._id} onDone={() => setShowReply(false)} />
      ) : null}

      {comment.replies?.length ? (
        <div className="ml-4 space-y-4 border-l border-slate-800 pl-4">
          {comment.replies.map((reply) => (
            <CommentItem key={reply._id} comment={reply} postId={postId} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function CommentThread({ postId, comments }: { postId: string; comments: CommentNode[] }) {
  const { data: me } = useMe();

  return (
    <Card className="p-6">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold text-white">Comment</h3>
        </div>
      </div>

      {me ? (
        <div className="mb-8">
          <ReplyForm postId={postId} />
        </div>
      ) : (
        <p className="mb-8 rounded-xl border border-slate-800 bg-slate-950/50 p-4 text-sm text-slate-300">
          Please login to join the Comment.
        </p>
      )}

      <div className="space-y-4">
        {comments.length ? (
          comments.map((comment) => <CommentItem key={comment._id} comment={comment} postId={postId} />)
        ) : (
          <p className="text-sm text-slate-400">No comments yet. Start the conversation.</p>
        )}
      </div>
    </Card>
  );
}
