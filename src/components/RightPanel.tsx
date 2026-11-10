import React from 'react';
import { Search, Sparkles, KeyRound, MessageSquareQuote, TrendingUp } from 'lucide-react';
import { Post } from '../types/index.ts';

interface RightPanelProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  posts: Post[];
  onSelectPrompt: (promptText: string) => void;
}

export const RightPanel: React.FC<RightPanelProps> = ({
  searchQuery,
  onSearchChange,
  posts,
  onSelectPrompt,
}) => {
  const writingPrompts = [
    { title: '가을의 소리와 풍경', text: '내가 느끼는 가을 바람과 교실 창문 밖 풍경' },
    { title: '마음을 울린 책 한 구절', text: '최근 읽은 책에서 친구들에게 꼭 소개하고 싶은 문장' },
    { title: '우리 반 친구에게 고마웠던 순간', text: '작은 도움이었지만 하루를 따뜻하게 만들어준 이야기' },
  ];

  // Most liked posts for the widget
  const topLiked = [...posts]
    .sort((a, b) => b.likesCount - a.likesCount)
    .filter((p) => p.likesCount > 0)
    .slice(0, 3);

  return (
    <aside className="w-72 xl:w-80 shrink-0 hidden lg:flex flex-col gap-5 py-5 px-3 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto border-l border-slate-200/80">
      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="작성자 또는 글 내용 검색..."
          className="w-full pl-10 pr-3 py-2 text-xs bg-slate-100 hover:bg-slate-200/60 focus:bg-white border border-transparent focus:border-sky-500 rounded-full focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 transition-all"
        />
      </div>

      {/* 4-Digit Password Guide Box */}
      <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-amber-900 mb-1.5">
          <KeyRound className="w-4 h-4 text-amber-600" />
          <span>4자리 비밀번호 사용법</span>
        </div>
        <p className="text-amber-800 leading-relaxed text-[12px]">
          글을 작성할 때 입력한 <strong>숫자 4자리 비밀번호</strong>는 본인의 글을 수정하거나 삭제할 때 사용됩니다. 친구들과 공유하지 않고 기억해주세요!
        </p>
      </div>

      {/* Today's Writing Prompts */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 text-xs shadow-2xs">
        <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-2.5">
          <Sparkles className="w-4 h-4 text-sky-500" />
          <span>오늘의 추천 글감</span>
        </div>
        <div className="space-y-2">
          {writingPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => onSelectPrompt(p.text)}
              className="w-full text-left p-2.5 rounded-xl bg-slate-50 hover:bg-sky-50/70 hover:border-sky-200 border border-transparent transition-all cursor-pointer group"
            >
              <div className="font-semibold text-slate-800 group-hover:text-sky-700 text-xs">
                {p.title}
              </div>
              <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                {p.text}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Top Liked Posts Widget */}
      {topLiked.length > 0 && (
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 text-xs shadow-2xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-2.5">
            <TrendingUp className="w-4 h-4 text-rose-500" />
            <span>많은 공감을 받은 글</span>
          </div>
          <div className="space-y-2.5">
            {topLiked.map((p) => (
              <div
                key={p.id}
                className="p-2 rounded-xl bg-slate-50/80 border border-slate-100 flex items-start justify-between gap-2"
              >
                <div className="min-w-0">
                  <div className="font-semibold text-slate-800 truncate text-[12px]">
                    {p.authorName}
                  </div>
                  <div className="text-[11px] text-slate-500 line-clamp-1">
                    {p.content}
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-1 text-[11px] font-semibold text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded-md">
                  ❤️ {p.likesCount}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
};
