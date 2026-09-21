'use client';

import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, PenLine } from 'lucide-react';
import type { Review } from '@/lib/types';
import { getReviews } from '@/lib/store';
import { formatDate } from '@/lib/format';
import { Stars } from '@/components/ui/Stars';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';

interface ReviewsListProps {
  productId: string;
  rating: number;
  reviewsCount: number;
}

const fieldClass =
  'w-full rounded-[10px] border border-line bg-card px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20';

export function ReviewsList({ productId, rating, reviewsCount }: ReviewsListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [name, setName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setReviews(getReviews(productId));
  }, [productId]);

  const average = useMemo(() => {
    if (reviews.length === 0) return rating;
    return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  }, [reviews, rating]);

  // Index 0 = 5 stars, index 4 = 1 star
  const distribution = useMemo(() => {
    const counts = [0, 0, 0, 0, 0];
    for (const r of reviews) counts[5 - r.rating] += 1;
    return counts;
  }, [reviews]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim() || !title.trim() || !body.trim()) {
      setError('Please fill in your name, a headline, and your review.');
      return;
    }
    setError('');
    setSubmitted(true);
  };

  return (
    <div className="grid gap-8 md:grid-cols-[280px_1fr]">
      <div className="md:sticky md:top-24 md:self-start">
        <h3 className="font-display text-xl font-semibold text-ink">Customer reviews</h3>
        <div className="mt-3 flex items-center gap-2">
          <Stars value={average} size="md" />
          <span className="text-sm font-semibold text-ink">{average.toFixed(1)} out of 5</span>
        </div>
        <p className="mt-1 text-sm text-muted">Based on {reviewsCount} reviews</p>
        <div className="mt-4 space-y-1.5">
          {distribution.map((count, i) => {
            const stars = 5 - i;
            const pct = reviews.length === 0 ? 0 : Math.round((count / reviews.length) * 100);
            return (
              <div key={stars} className="flex items-center gap-2 text-xs text-muted">
                <span className="w-10 shrink-0 tabular-nums">{stars} star</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-line">
                  <div className="h-full rounded-full bg-gold" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-8 shrink-0 text-right tabular-nums">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-6">
        {reviews.length === 0 ? (
          <p className="rounded-[14px] border border-dashed border-line bg-sand/60 p-6 text-sm text-muted">
            No written reviews yet — be the first to share your experience below.
          </p>
        ) : (
          reviews.map((review) => (
            <article
              key={review.id}
              className="rounded-[14px] border border-line bg-card p-5"
            >
              <div className="flex items-center gap-2">
                <Stars value={review.rating} size="sm" />
                <h4 className="text-sm font-semibold text-ink">{review.title}</h4>
              </div>
              <p className="mt-1 text-xs text-muted">
                {review.userName} · {formatDate(review.createdAt)}
              </p>
              <p className="mt-2 text-sm leading-6 text-ink/80">{review.body}</p>
            </article>
          ))
        )}

        <div className="rounded-[14px] border border-line bg-sand/60 p-5 sm:p-6">
          {submitted ? (
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-forest" />
              <div>
                <h4 className="text-sm font-semibold text-ink">Thanks for your review.</h4>
                <p className="mt-1 text-sm text-muted">
                  It will appear here after a quick moderation check.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <h4 className="flex items-center gap-2 text-sm font-semibold text-ink">
                <PenLine className="h-4 w-4" />
                Write a review
              </h4>
              {error && (
                <p
                  role="alert"
                  className={cn(
                    'mt-3 rounded-[10px] border border-accent/30 bg-accent/10 px-3 py-2 text-sm text-accent-deep',
                  )}
                >
                  {error}
                </p>
              )}
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="review-name" className="mb-1 block text-xs font-medium text-ink">
                    Your name
                  </label>
                  <input
                    id="review-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label htmlFor="review-rating" className="mb-1 block text-xs font-medium text-ink">
                    Rating
                  </label>
                  <select
                    id="review-rating"
                    value={reviewRating}
                    onChange={(e) => setReviewRating(Number(e.target.value))}
                    className={fieldClass}
                  >
                    {[5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={n}>
                        {n} star{n > 1 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <label htmlFor="review-title" className="mb-1 block text-xs font-medium text-ink">
                  Headline
                </label>
                <input
                  id="review-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Sum up your experience"
                  className={fieldClass}
                />
              </div>
              <div className="mt-4">
                <label htmlFor="review-body" className="mb-1 block text-xs font-medium text-ink">
                  Review
                </label>
                <textarea
                  id="review-body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={4}
                  placeholder="What did you like or dislike?"
                  className={fieldClass}
                />
              </div>
              <div className="mt-4">
                <Button type="submit" variant="primary" size="md" className="rounded-full">
                  Submit review
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
