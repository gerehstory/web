'use client';

import { useState } from 'react';
import type { Comment } from '@/types/api';
import { createComment, deleteComment } from '@/lib/api/comments';
import { useAuth } from '@/lib/auth/context';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { formatDateTime } from '@/lib/utils';
import { fullName } from '@/lib/labels';

export function CommentSection({ workId, initialComments }: { workId: number; initialComments: Comment[] }) {
  const { isAuthenticated, isAdmin } = useAuth();
  const [comments, setComments] = useState(initialComments);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    setError('');
    try {
      const comment = await createComment(workId, { content: content.trim() });
      setComments(prev => [comment, ...prev]);
      setContent('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ارسال نظر ناموفق بود');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(commentId: number) {
    try {
      await deleteComment(commentId);
      setComments(prev => prev.filter(comment => comment.id !== commentId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حذف نظر ناموفق بود');
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-lg font-semibold text-zinc-900">نظرات ({comments.length})</h2>

      {isAuthenticated && (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3">
          <Textarea
            placeholder="نظر خود را بنویسید..."
            value={content}
            onChange={e => setContent(e.target.value)}
            required
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button
            type="submit"
            size="sm"
            disabled={loading}
            className="self-start">
            {loading ? 'در حال ارسال...' : 'ارسال نظر'}
          </Button>
        </form>
      )}

      {!isAuthenticated && <p className="text-sm text-zinc-500">برای ارسال نظر وارد شوید.</p>}

      <div className="flex flex-col gap-4">
        {comments.length === 0 && <p className="text-sm text-zinc-500">هنوز نظری ثبت نشده است.</p>}
        {comments.map(comment => (
          <div
            key={comment.id}
            className="rounded-lg border border-zinc-100 bg-zinc-50 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-800">{fullName(comment.user)}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400">{formatDateTime(comment.postedAt)}</span>
                {isAdmin && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="text-xs text-red-500 hover:text-red-700">
                    حذف
                  </button>
                )}
              </div>
            </div>
            <p className="text-sm text-zinc-600">{comment.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
