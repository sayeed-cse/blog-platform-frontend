'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Bookmark, House, LogOut, PenSquare, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import { api, getErrorMessage } from '@/lib/api';
import { useMe } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';

export function Navbar() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: me } = useMe();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await api.post('/auth/logout');
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['me'] });
      toast.success('Logged out successfully');
      router.push('/login');
    },
    onError: (error) => toast.error(getErrorMessage(error))
  });

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-[#08101f]/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-xl font-bold tracking-tight text-white">
          Blog Platform
        </Link>

        <nav className="flex items-center gap-2">
          <Link href="/" className="text-xl font-bold tracking-tight text-white">
            <Button variant="ghost" className="gap-2">
              <House size={16} />
            </Button>
          </Link>
          <Link href="/create-post">
            <Button variant="ghost" className="gap-2">
              <PenSquare size={16} />
              Create
            </Button>
          </Link>
          <Link href="/bookmarks">
            <Button variant="ghost" className="gap-2">
              <Bookmark size={16} />
              Saved
            </Button>
          </Link>

          {me ? (
            <>
              <Link href="/my-posts">
                <Button variant="outline">My Posts</Button>
              </Link>
              <Link href="/profile">
                <Button variant="outline" className="gap-2">
                  <UserRound size={16} />
                  {me.name.split(' ')[0]}
                </Button>
              </Link>
              <Button
                variant="danger"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                className="gap-2"
              >
                <LogOut size={16} />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="outline">Login</Button>
              </Link>
              <Link href="/register">
                <Button>Register</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
