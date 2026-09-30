'use client';

import { useState } from 'react';
import type { Like, Work } from '@/types/api';
import { likeWork, unlikeWork } from '@/lib/api/likes';
import { useAuth } from '@/lib/auth/context';
import { Heart } from 'lucide-react';

export function LikeButton({ work }: { work: Work }) {
  const { user, isAuthenticated } = useAuth();
  const [likes, setLikes] = useState<Like[]>(work.likes ?? []);
  const [loading, setLoading] = useState(false);

  const userLike = user ? likes.find(like => like.user?.id === user.id) : undefined;

  async function handleToggle() {
    if (!isAuthenticated) return;
    setLoading(true);

    try {
      if (userLike) {
        await unlikeWork(userLike.id);
        setLikes(prev => prev.filter(like => like.id !== userLike.id));
      } else {
        const like = await likeWork(work.id);
        setLikes(prev => [...prev, like]);
      }
    } catch {
      // duplicate like or network error — keep current state
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={!isAuthenticated || loading}
      className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${
        userLike ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
      } disabled:cursor-not-allowed disabled:opacity-50`}>
      <span>{userLike ? <Heart fill="#E7000B" /> : <Heart />}</span>
      <span>{likes.length}</span>
    </button>
  );
}
