import { z } from 'zod';

export const postSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  content: z.string().min(20, 'Content must be at least 20 characters'),
  tags: z.string().max(120, 'Tags must be 120 characters or less')
});

export type PostInput = z.infer<typeof postSchema>;
