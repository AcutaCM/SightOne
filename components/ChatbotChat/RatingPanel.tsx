'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Textarea,
  Divider,
  Avatar,
  Chip,
  Progress,
  Spinner
} from '@heroui/react';
import { Star, Send, ThumbsUp, MessageSquare } from 'lucide-react';
import { Rating, RatingStats } from '@/lib/services/ratingService';

interface RatingPanelProps {
  assistantId: string;
  userId: string;
  userRating?: Rating | null;
  ratings?: Rating[];
  stats?: RatingStats;
  onSubmitRating?: (rating: number, feedback?: string) => Promise<void>;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
  className?: string;
}

/**
 * Rating Panel Component
 * 
 * Displays rating interface with:
 * - Star rating input
 * - Text feedback input
 * - Other users' ratings and feedback
 * - Rating statistics and distribution
 * 
 * Requirements: 10.1, 10.2, 10.3, 10.4, 10.5
 */
export const RatingPanel: React.FC<RatingPanelProps> = ({
  assistantId,
  userId,
  userRating,
  ratings = [],
  stats,
  onSubmitRating,
  onLoadMore,
  hasMore = false,
  isLoading = false,
  className = '',
}) => {
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Initialize with user's existing rating
  useEffect(() => {
    if (userRating) {
      setSelectedRating(userRating.rating);
      setFeedback(userRating.feedback || '');
      setHasSubmitted(true);
    }
  }, [userRating]);

  const handleSubmit = async () => {
    if (selectedRating === 0) return;
    
    setIsSubmitting(true);
    try {
      await onSubmitRating?.(selectedRating, feedback || undefined);
      setHasSubmitted(true);
    } catch (error) {
      console.error('Failed to submit rating:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStarClick = (rating: number) => {
    setSelectedRating(rating);
    setHasSubmitted(false);
  };

  const handleStarHover = (rating: number) => {
    setHoverRating(rating);
  };

  const handleStarLeave = () => {
    setHoverRating(0);
  };

  const displayRating = hoverRating || selectedRating;

  // Calculate rating distribution percentages
  const getRatingPercentage = (count: number): number => {
    if (!stats || stats.totalRatings === 0) return 0;
    return (count / stats.totalRatings) * 100;
  };

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return '今天';
    if (diffDays === 1) return '昨天';
    if (diffDays < 7) return `${diffDays}天前`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}个月前`;
    return `${Math.floor(diffDays / 365)}年前`;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Rating Statistics */}
      {stats && (
        <Card>
          <CardHeader className="flex-col items-start gap-2 pb-4">
            <h3 className="text-lg font-semibold">用户评分</h3>
          </CardHeader>
          <CardBody className="pt-0">
            <div className="flex items-center gap-6 mb-6">
              {/* Average Rating */}
              <div className="text-center">
                <div className="text-4xl font-bold mb-1">
                  {stats.averageRating.toFixed(1)}
                </div>
                <div className="flex items-center justify-center gap-1 mb-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= Math.round(stats.averageRating)
                          ? 'fill-warning text-warning'
                          : 'text-default-300'
                      }`}
                    />
                  ))}
                </div>
                <div className="text-sm text-default-500">
                  {stats.totalRatings} 个评分
                </div>
              </div>

              {/* Rating Distribution */}
              <div className="flex-1 space-y-2">
                {[5, 4, 3, 2, 1].map((star) => (
                  <div key={star} className="flex items-center gap-2">
                    <div className="flex items-center gap-1 w-12">
                      <span className="text-xs text-default-600">{star}</span>
                      <Star className="w-3 h-3 fill-warning text-warning" />
                    </div>
                    <Progress
                      value={getRatingPercentage(stats.ratingDistribution[star as keyof typeof stats.ratingDistribution])}
                      className="flex-1"
                      size="sm"
                      color="warning"
                    />
                    <span className="text-xs text-default-500 w-8 text-right">
                      {stats.ratingDistribution[star as keyof typeof stats.ratingDistribution]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Rating Input */}
      <Card>
        <CardHeader className="flex-col items-start gap-2 pb-4">
          <h3 className="text-lg font-semibold">
            {hasSubmitted ? '修改评分' : '为此助理评分'}
          </h3>
          <p className="text-sm text-default-500">
            分享你的使用体验，帮助其他用户做出选择
          </p>
        </CardHeader>
        <CardBody className="pt-0">
          {/* Star Rating Input */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-default-600">你的评分:</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleStarClick(star)}
                  onMouseEnter={() => handleStarHover(star)}
                  onMouseLeave={handleStarLeave}
                  className="transition-transform hover:scale-110 focus:outline-none"
                  aria-label={`${star} 星`}
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= displayRating
                        ? 'fill-warning text-warning'
                        : 'text-default-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            {selectedRating > 0 && (
              <span className="text-sm font-medium text-warning ml-2">
                {selectedRating} 星
              </span>
            )}
          </div>

          {/* Feedback Input */}
          <Textarea
            label="评价内容（可选）"
            placeholder="分享你的使用体验、优点或改进建议..."
            value={feedback}
            onValueChange={setFeedback}
            minRows={3}
            maxRows={6}
            className="mb-4"
          />

          {/* Submit Button */}
          <Button
            color="primary"
            startContent={<Send className="w-4 h-4" />}
            onPress={handleSubmit}
            isDisabled={selectedRating === 0 || isSubmitting}
            isLoading={isSubmitting}
            fullWidth
          >
            {hasSubmitted ? '更新评分' : '提交评分'}
          </Button>
        </CardBody>
      </Card>

      {/* User Ratings List */}
      {ratings.length > 0 && (
        <Card>
          <CardHeader className="flex-col items-start gap-2 pb-4">
            <h3 className="text-lg font-semibold">用户评价</h3>
            <p className="text-sm text-default-500">
              查看其他用户的使用体验
            </p>
          </CardHeader>
          <CardBody className="pt-0">
            <div className="space-y-4">
              {ratings.map((rating) => (
                <div key={rating.id} className="pb-4 border-b border-default-200 last:border-0 last:pb-0">
                  <div className="flex items-start gap-3">
                    {/* User Avatar */}
                    <Avatar
                      name={rating.userId}
                      size="sm"
                      className="flex-shrink-0"
                    />

                    {/* Rating Content */}
                    <div className="flex-1 min-w-0">
                      {/* User Info and Rating */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium truncate">
                            {rating.userId === userId ? '我' : `用户 ${rating.userId.slice(0, 8)}`}
                          </span>
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-3.5 h-3.5 ${
                                  star <= rating.rating
                                    ? 'fill-warning text-warning'
                                    : 'text-default-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-xs text-default-400 flex-shrink-0">
                          {formatDate(rating.createdAt)}
                        </span>
                      </div>

                      {/* Feedback Text */}
                      {rating.feedback && (
                        <p className="text-sm text-default-700 whitespace-pre-wrap">
                          {rating.feedback}
                        </p>
                      )}

                      {/* Helpful Button (placeholder for future feature) */}
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          size="sm"
                          variant="flat"
                          startContent={<ThumbsUp className="w-3 h-3" />}
                          className="text-xs"
                        >
                          有帮助
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Load More Button */}
              {hasMore && (
                <div className="pt-4">
                  <Button
                    variant="flat"
                    fullWidth
                    onPress={onLoadMore}
                    isLoading={isLoading}
                    startContent={!isLoading && <MessageSquare className="w-4 h-4" />}
                  >
                    {isLoading ? '加载中...' : '加载更多评价'}
                  </Button>
                </div>
              )}

              {/* Loading Indicator */}
              {isLoading && !hasMore && (
                <div className="flex justify-center py-4">
                  <Spinner size="sm" />
                </div>
              )}

              {/* No More Ratings */}
              {!hasMore && ratings.length > 0 && (
                <div className="text-center py-4 text-sm text-default-400">
                  已显示全部评价
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Empty State */}
      {ratings.length === 0 && !isLoading && (
        <Card>
          <CardBody className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-default-300 mx-auto mb-3" />
            <p className="text-default-500 mb-2">暂无用户评价</p>
            <p className="text-sm text-default-400">
              成为第一个评价此助理的用户
            </p>
          </CardBody>
        </Card>
      )}
    </div>
  );
};
