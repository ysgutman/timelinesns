import React, { useState, useEffect } from 'react';
import { X, Check, Edit3, User, Tag, AlertCircle } from 'lucide-react';
import { Post } from '../types/index.ts';

interface EditPostModalProps {
  isOpen: boolean;
  post: Post | null;
  verifiedPassword: string;
  onClose: () => void;
  onSubmit: (postId: number, data: {
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

export const EditPostModal: React.FC<EditPostModalProps> = ({
  isOpen,
  post,
  verifiedPassword,
  onClose,
  onSubmit,
}) => {
  const [authorName, setAuthorName] = useState('');
  const [category, setCategory] = useState('자유글');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (post) {
      setAuthorName(post.authorName);
      setCategory(post.category || '자유글');
      setContent(post.content);
      setErrorMessage(null);
    }
  }, [post, isOpen]);

  if (!isOpen || !post) return null;

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

    try {
      setIsSubmitting(true);
      await onSubmit(post.id, {
        authorName: trimmedName,
        content: trimmedContent,
        password: verifiedPassword,
        category,
      });
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || '글 수정에 실패했습니다. 다시 시도해주세요.');
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
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">글 수정하기</h2>
              <p className="text-xs text-slate-500">내용을 수정한 뒤 '수정 완료'를 눌러주세요.</p>
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
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                글 갈래
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

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                내용 <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">{content.length}자</span>
            </div>
            <textarea
              required
              rows={7}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-3 text-sm bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 leading-relaxed transition-all resize-none"
            />
          </div>

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
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? '수정 중...' : '수정 완료'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
