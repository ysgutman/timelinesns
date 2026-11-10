import React, { useState } from 'react';
import { X, Send, Lock, User, FileText, Tag, AlertCircle } from 'lucide-react';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    authorName: string;
    content: string;
    password: string;
    category: string;
  }) => Promise<void>;
}

const CATEGORIES = [
  { id: '자유글', label: '자유글', icon: '📝' },
  { id: '일기', label: '일기', icon: '🏃' },
  { id: '독후감', label: '독후감', icon: '📖' },
  { id: '시', label: '시', icon: '🍁' },
  { id: '수필', label: '수필', icon: '✍️' },
  { id: '생각나눔', label: '생각나눔', icon: '💡' },
];

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [authorName, setAuthorName] = useState('');
  const [category, setCategory] = useState('자유글');
  const [content, setContent] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedName = authorName.trim();
    const trimmedContent = content.trim();

    if (!trimmedName) {
      setErrorMessage('이름을 입력해주세요.');
      return;
    }
    if (!trimmedContent) {
      setErrorMessage('글 내용을 입력해주세요.');
      return;
    }
    if (!/^\d{4}$/.test(password)) {
      setErrorMessage('비밀번호는 숫자 4자리여야 합니다.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        authorName: trimmedName,
        content: trimmedContent,
        password,
        category,
      });
      // Reset form
      setAuthorName('');
      setContent('');
      setPassword('');
      setCategory('자유글');
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || '글 등록에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-500 text-white flex items-center justify-center shadow-xs">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">새 포스트 작성</h2>
              <p className="text-xs text-slate-500">우리 반 친구들과 나눌 글을 작성해보세요.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Name & Category Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                이름 (작성자) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="예: 김민준"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                글 갈래 (선택)
              </label>
              <div className="relative">
                <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all cursor-pointer"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Category Quick Tags */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                  category === cat.id
                    ? 'bg-sky-50 border-sky-300 text-sky-700 font-semibold'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                내용 <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">{content.length}자</span>
            </div>
            <textarea
              required
              rows={6}
              placeholder="오늘 느낀 생각, 시, 독후감, 일기 등 자유롭게 적어보세요..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-3 text-sm bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 leading-relaxed transition-all resize-none"
            />
          </div>

          {/* Password (숫자 4자리) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              비밀번호 (숫자 4자리) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                required
                placeholder="숫자 4자리 (차후 수정 및 삭제 시 필요)"
                value={password}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
                  setPassword(val);
                }}
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 tracking-widest font-mono transition-all"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              * 작성 후 본인의 글을 수정하거나 삭제할 때 사용하는 4자리 숫자입니다.
            </p>
          </div>

          {/* Modal Footer: 취소 & 게시하기 버튼 */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 active:scale-98 rounded-xl shadow-xs shadow-sky-200 transition-all cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? '게시 중...' : '게시하기'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
