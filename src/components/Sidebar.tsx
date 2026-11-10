import React from 'react';
import { Home, Sparkles, Heart, HelpCircle, Plus, BookOpen, Users } from 'lucide-react';

interface SidebarProps {
  currentCategory: string;
  onSelectCategory: (cat: string) => void;
  onOpenCreate: () => void;
  totalPosts: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentCategory,
  onSelectCategory,
  onOpenCreate,
  totalPosts,
}) => {
  const navItems = [
    { id: 'all', label: '전체 타임라인', icon: Home },
    { id: '일기', label: '오늘의 일기', icon: BookOpen },
    { id: '독후감', label: '독서 감상문', icon: Sparkles },
    { id: '시', label: '우리들의 동시', icon: Heart },
    { id: '생각나눔', label: '자유 생각나눔', icon: Users },
  ];

  return (
    <aside className="w-60 xl:w-64 shrink-0 hidden md:flex flex-col justify-between py-5 px-3 sticky top-16 h-[calc(100vh-4rem)] border-r border-slate-200/80">
      <div className="space-y-6">
        {/* Navigation Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentCategory === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectCategory(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-full text-sm font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-sky-50 text-sky-600 shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900'
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${
                    isActive ? 'text-sky-600' : 'text-slate-500'
                  }`}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Primary Post Writing Button (Twitter / X large button) */}
        <div>
          <button
            onClick={onOpenCreate}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-full text-white font-bold bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 active:scale-98 shadow-md shadow-sky-200 transition-all cursor-pointer text-sm"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            <span>새 글 작성하기</span>
          </button>
        </div>
      </div>

      {/* Classroom Status Footer Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-sky-50/50 border border-slate-200/70 text-xs">
        <div className="flex items-center gap-2 mb-1.5 font-bold text-slate-800">
          <Sparkles className="w-4 h-4 text-sky-500" />
          <span>우리 반 글마당</span>
        </div>
        <p className="text-slate-500 leading-relaxed mb-2">
          현재 등록된 글: <strong className="text-slate-800 font-semibold">{totalPosts}편</strong>
        </p>
        <p className="text-[11px] text-slate-400">
          * 매일 마음을 담은 한 줄로 함께 성장해요!
        </p>
      </div>
    </aside>
  );
};
