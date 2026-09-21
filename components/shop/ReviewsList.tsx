'use client';

import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, PenLine } from 'lucide-react';
import type { Review } from '@/lib/types';
import { getReviews } from '@/lib/store';
import { formatDate } from '@/lib/format';
import { Stars } from '@/components/ui/Stars';
import { Button } from '@/components/ui/Button';

interface ReviewsListProps {
  productId: string;
  rating: number;
  reviewsCount: number;
}

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
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Customer reviews</h3>
        <div className="mt-3 flex items-center gap-2">
          <Stars value={average} size="md" />
          <span className="text-sm font-semibold text-gray-900">{average.toFixed(1)} out of 5</span>
        </div>
        <p className="mt-1 text-sm text-gray-500">Based on {reviewsCount} reviews</p>
        <div className="mt-4 space-y-1.5">
          {distribution.map((count, i) => {
            const stars = 5 - i;
            const pct = reviews.length === 0 ? 0 : Math.round((count / reviews.length) * 100);
            return (
              <div key={stars} className="flex items-center gap-2 text-xs text-gray-600">
                <span className="w-8 shrink-0">{stars} star</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                  <div className="h-full rounded-full bg-amber-400" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-8 shrink-0 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-6">
        {reviews.length === 0 ? (
          <p className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-sm text-gray-500">
            No written reviews yet — be the first to share your experience below.
          </p>
        ) : (
          reviews.map((review) => (
            <article key={review.id} className="border-b border-gray-200 pb-6 last:border-0">
              <div className="flex items-center gap-2">
                <Stars value={review.rating} size="sm" />
                <h4 className="text-sm font-semibold text-gray-900">{review.title}</h4>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {review.userName} · {formatDate(review.createdAt)}
              </p>
              <p className="mt-2 text-sm leading-6 text-gray-700">{review.body}</p>
            </article>
          ))
        )}

        <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
          {submitted ? (
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              <div>
                <h4 className="text-sm font-semibold text-gray-900">Thanks for your review!</h4>
                <p className="mt-1 text-sm text-gray-600">
                  Your feedback was received and will be published after a quick moderation check.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <PenLine className="h-4 w-4" />
                Write a review
              </h4>
              {error && (
                <p role="alert" className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {error}
                </p>
              )}
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="review-name" className="mb-1 block text-xs font-medium text-gray-700">
                    Your name
                  </label>
                  <input
                    id="review-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
                <div>
                  <label htmlFor="review-rating" className="mb-1 block text-xs font-medium text-gray-700">
                    Rating
                  </label>
                  <select
                    id="review-rating"
                    value={reviewRating}
                    onChange={(e) => setReviewRating(Number(e.target.value))}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
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
                <label htmlFor="review-title" className="mb-1 block text-xs font-medium text-gray-700">
                  Headline
                </label>
                <input
                  id="review-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Sum up your experience"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </div>
              <div className="mt-4">
                <label htmlFor="review-body" className="mb-1 block text-xs font-medium text-gray-700">
                  Review
                </label>
                <textarea
                  id="review-body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={4}
                  placeholder="What did you like or dislike?"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </div>
              <div className="mt-4">
                <Button type="submit" variant="primary" size="md">
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
