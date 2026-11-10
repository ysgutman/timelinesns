import React, { useState } from 'react';
import { Heart, Edit3, Trash2, BookOpen, Clock, Sparkles } from 'lucide-react';
import { Post } from '../types/index.ts';
import { getAvatarColor, formatTimeAgo } from '../lib/client.ts';

interface PostCardProps {
  post: Post;
  onLike: (postId: number) => void;
  onEditRequest: (post: Post) => void;
  onDeleteRequest: (post: Post) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onLike,
  onEditRequest,
  onDeleteRequest,
}) => {
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);
  const color = getAvatarColor(post.authorName);
  const initial = post.authorName.trim().charAt(0) || '글';

  const handleLikeClick = () => {
    setIsLikeAnimating(true);
    setTimeout(() => setIsLikeAnimating(false), 500);
    onLike(post.id);
  };

  // Category badge emoji and style
  const getCategoryMeta = (cat: string | null) => {
    switch (cat) {
      case '시':
        return { icon: '🍁', label: '시', badge: 'bg-amber-50 text-amber-700 border-amber-200' };
      case '독후감':
        return { icon: '📖', label: '독후감', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case '일기':
        return { icon: '🏃', label: '일기', badge: 'bg-sky-50 text-sky-700 border-sky-200' };
      case '수필':
        return { icon: '✍️', label: '수필', badge: 'bg-purple-50 text-purple-700 border-purple-200' };
      case '생각나눔':
        return { icon: '💡', label: '생각나눔', badge: 'bg-rose-50 text-rose-700 border-rose-200' };
      default:
        return { icon: '📝', label: cat || '자유글', badge: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  const categoryMeta = getCategoryMeta(post.category);

  return (
    <article className="group bg-white border-b border-slate-200/80 hover:bg-slate-50/50 p-4 sm:p-5 transition-colors">
      <div className="flex items-start gap-3 sm:gap-4">
        {/* Author Avatar with student initial and pastel color */}
        <div
          className={`shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-full ${color.bg} ${color.text} border ${color.border} flex items-center justify-center font-bold text-base sm:text-lg shadow-sm`}
        >
          {initial}
        </div>

        {/* Post Main Body */}
        <div className="flex-1 min-w-0">
          {/* Header Row: Author Name, Category Badge, Timestamp */}
          <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-slate-900 text-sm sm:text-base hover:text-sky-600 transition-colors">
                {post.authorName}
              </span>
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border ${categoryMeta.badge}`}
              >
                <span>{categoryMeta.icon}</span>
                <span>{categoryMeta.label}</span>
              </span>
            </div>

            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Clock className="w-3.5 h-3.5" />
              <time>{formatTimeAgo(post.createdAt)}</time>
            </div>
          </div>

          {/* Post Content */}
          <div className="text-slate-800 text-[14px] sm:text-[15px] leading-relaxed whitespace-pre-wrap break-words font-normal mb-3 py-0.5">
            {post.content}
          </div>

          {/* Action Row: Left: Like Button | Right: Edit & Delete Buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs sm:text-sm">
            {/* 하단 왼쪽 좋아요 버튼 (Like Button) */}
            <button
              onClick={handleLikeClick}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full transition-all cursor-pointer select-none group/like ${
                post.isLiked
                  ? 'text-rose-500 bg-rose-50 hover:bg-rose-100'
                  : 'text-slate-500 hover:text-rose-500 hover:bg-rose-50/60'
              }`}
              title="좋아요 (공감하기)"
            >
              <Heart
                className={`w-4 h-4 transition-transform ${
                  post.isLiked ? 'fill-rose-500 text-rose-500' : 'group-hover/like:scale-110'
                } ${isLikeAnimating ? 'scale-125' : ''}`}
              />
              <span className="font-semibold text-xs">{post.likesCount}</span>
              <span className="text-[11px] hidden sm:inline text-slate-400">
                {post.isLiked ? '공감함' : '공감'}
              </span>
            </button>

            {/* Right: 수정 (Edit) and 삭제 (Delete) buttons */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* 수정 버튼 */}
              <button
                onClick={() => onEditRequest(post)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md text-slate-500 hover:text-sky-600 hover:bg-sky-50 transition-colors text-xs font-medium cursor-pointer"
                title="비밀번호 확인 후 수정"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>수정</span>
              </button>

              {/* 삭제 버튼 */}
              <button
                onClick={() => onDeleteRequest(post)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors text-xs font-medium cursor-pointer"
                title="비밀번호 확인 후 삭제"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>삭제</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};
