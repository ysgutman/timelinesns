import React, { useState, useEffect, useRef } from 'react';
import { X, Lock, AlertCircle, CheckCircle, Trash2, Edit3 } from 'lucide-react';
import { Post } from '../types/index.ts';

interface PasswordModalProps {
  isOpen: boolean;
  mode: 'edit' | 'delete' | null;
  post: Post | null;
  onClose: () => void;
  onConfirm: (password: string) => Promise<void>;
}

export const PasswordModal: React.FC<PasswordModalProps> = ({
  isOpen,
  mode,
  post,
  onClose,
  onConfirm,
}) => {
  const [password, setPassword] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setErrorMessage(null);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  if (!isOpen || !post || !mode) return null;

  const isDelete = mode === 'delete';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!/^\d{4}$/.test(password)) {
      setErrorMessage('숫자 4자리 비밀번호를 입력해주세요.');
      return;
    }

    try {
      setIsVerifying(true);
      await onConfirm(password);
      // On success, parent will close or transition to edit modal
    } catch (err: any) {
      setErrorMessage(err.message || '비밀번호가 일치하지 않습니다.');
      setPassword('');
      inputRef.current?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${
                isDelete ? 'bg-rose-500' : 'bg-sky-500'
              }`}
            >
              {isDelete ? <Trash2 className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
            </div>
            <h2 className="text-base font-bold text-slate-900">
              {isDelete ? '글 삭제 확인' : '글 수정 확인'}
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={isVerifying}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs text-slate-600">
            <p className="font-semibold text-slate-800 mb-1">
              작성자: <span className="text-sky-600">{post.authorName}</span>
            </p>
            <p className="line-clamp-2 text-slate-500 italic">"{post.content}"</p>
          </div>

          <p className="text-xs text-slate-600">
            글 작성 시 등록했던 <strong className="text-slate-800">숫자 4자리 비밀번호</strong>를 입력해주세요.
          </p>

          {errorMessage && (
            <div className="flex items-center gap-2 p-2.5 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              ref={inputRef}
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              required
              placeholder="••••"
              value={password}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
                setPassword(val);
              }}
              className="w-full pl-9 pr-3 py-2 text-center text-lg tracking-[0.3em] font-mono bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isVerifying}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isVerifying || password.length !== 4}
              className={`px-4 py-2 text-sm font-semibold text-white rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50 ${
                isDelete
                  ? 'bg-rose-500 hover:bg-rose-600 active:scale-98 shadow-rose-200'
                  : 'bg-sky-500 hover:bg-sky-600 active:scale-98 shadow-sky-200'
              }`}
            >
              {isVerifying ? '확인 중...' : isDelete ? '삭제하기' : '수정하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
