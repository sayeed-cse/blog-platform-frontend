export type User = {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
};

export type Post = {
  _id: string;
  author: User;
  title: string;
  content: string;
  image?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

export type CommentNode = {
  _id: string;
  post: string;
  user: User;
  content: string;
  parentComment?: string | null;
  depth: number;
  createdAt: string;
  updatedAt: string;
  replies: CommentNode[];
};

export type Bookmark = {
  _id: string;
  post: Post;
  user: string;
  createdAt: string;
  updatedAt: string;
};

export type PaginatedResponse<T> = {
  success: boolean;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};
