import React from 'react';
import { RotateCw, Plus, Feather, Sparkles } from 'lucide-react';

interface HeaderProps {
  onOpenCreate: () => void;
  onRefresh: () => void;
  isLoading: boolean;
  totalPosts: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCreate,
  onRefresh,
  isLoading,
  totalPosts,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Left: App Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-sky-200">
            <Feather className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
                글쓰기 타임라인 SNS
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-100">
                <Sparkles className="w-3 h-3 text-sky-500" />
                우리 반 문집
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              친구들의 생각을 나누고 공감하는 실시간 타임라인 피드
            </p>
          </div>
        </div>

        {/* Right: Refresh button & Create Post (+) button */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            title="새 글 가져오기 (새로고침)"
            className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:text-sky-600 bg-slate-100 hover:bg-slate-200/80 active:bg-slate-200 rounded-full transition-colors cursor-pointer disabled:opacity-60"
          >
            <RotateCw
              className={`w-4 h-4 ${isLoading ? 'animate-spin text-sky-600' : ''}`}
            />
            <span className="hidden sm:inline">새로고침</span>
          </button>

          {/* Post Creation (+) Button */}
          <button
            onClick={onOpenCreate}
            className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 active:scale-95 rounded-full shadow-sm shadow-sky-300 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>포스트 작성</span>
          </button>
        </div>
      </div>
    </header>
  );
};
