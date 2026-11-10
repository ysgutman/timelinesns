/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Feather,
  Plus,
  RotateCw,
  Search,
  MessageCircle,
  Sparkles,
  BookOpen,
  Filter,
  AlertCircle,
} from 'lucide-react';
import { Post, PaginationData } from './types/index.ts';
import {
  fetchPosts,
  createPostApi,
  verifyPasswordApi,
  updatePostApi,
  deletePostApi,
  toggleLikeApi,
} from './lib/client.ts';
import { Header } from './components/Header.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { RightPanel } from './components/RightPanel.tsx';
import { PostCard } from './components/PostCard.tsx';
import { CreatePostModal } from './components/CreatePostModal.tsx';
import { PasswordModal } from './components/PasswordModal.tsx';
import { EditPostModal } from './components/EditPostModal.tsx';
import { Pagination } from './components/Pagination.tsx';
import { Toast, ToastMessage } from './components/Toast.tsx';

export default function App() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Filters & Search
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [passwordModalState, setPasswordModalState] = useState<{
    isOpen: boolean;
    mode: 'edit' | 'delete' | null;
    post: Post | null;
  }>({
    isOpen: false,
    mode: null,
    post: null,
  });

  const [editModalState, setEditModalState] = useState<{
    isOpen: boolean;
    post: Post | null;
    verifiedPassword: string;
  }>({
    isOpen: false,
    post: null,
    verifiedPassword: '',
  });

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Load posts from database
  const loadPosts = useCallback(
    async (pageToLoad: number = 1, showRefreshSpinner: boolean = false) => {
      try {
        if (showRefreshSpinner) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }
        setFetchError(null);

        const data = await fetchPosts(pageToLoad, 10);
        setPosts(data.posts);
        setPagination(data.pagination);
      } catch (err: any) {
        console.error('Failed to load posts:', err);
        setFetchError(err.message || '글 목록을 불러오지 못했습니다.');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    loadPosts(1);
  }, [loadPosts]);

  // Page change handler
  const handlePageChange = (newPage: number) => {
    if (newPage === pagination.page) return;
    loadPosts(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Refresh handler (새로고침 버튼)
  const handleRefresh = async () => {
    await loadPosts(pagination.page, true);
    addToast('info', '최신 글을 모두 불러왔습니다.');
  };

  // Like button handler (하단 왼쪽 좋아요 버튼)
  const handleLike = async (postId: number) => {
    // Optimistic UI update
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const nextLiked = !p.isLiked;
          const nextCount = nextLiked ? p.likesCount + 1 : Math.max(0, p.likesCount - 1);
          return { ...p, isLiked: nextLiked, likesCount: nextCount };
        }
        return p;
      })
    );

    try {
      const result = await toggleLikeApi(postId);
      // Synchronize with server response
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, likesCount: result.likesCount, isLiked: result.isLiked }
            : p
        )
      );
    } catch (err: any) {
      console.error('Like failed:', err);
      // Revert optimistic update
      await loadPosts(pagination.page);
      addToast('error', '좋아요 처리에 실패했습니다.');
    }
  };

  // Create post submit handler (게시하기 버튼)
  const handleCreateSubmit = async (data: {
    authorName: string;
    content: string;
    password: string;
    category: string;
  }) => {
    const newPost = await createPostApi(data);
    // Refresh to page 1 to immediately show latest post at top
    await loadPosts(1);
    addToast('success', `'${newPost.authorName}'님의 글이 성공적으로 게시되었습니다! 🎉`);
  };

  // Trigger password prompt for Edit
  const handleEditRequest = (post: Post) => {
    setPasswordModalState({
      isOpen: true,
      mode: 'edit',
      post,
    });
  };

  // Trigger password prompt for Delete
  const handleDeleteRequest = (post: Post) => {
    setPasswordModalState({
      isOpen: true,
      mode: 'delete',
      post,
    });
  };

  // Password confirmation action
  const handlePasswordConfirm = async (password: string) => {
    const { mode, post } = passwordModalState;
    if (!post || !mode) return;

    if (mode === 'delete') {
      // Execute delete
      await deletePostApi(post.id, password);
      setPasswordModalState({ isOpen: false, mode: null, post: null });
      await loadPosts(pagination.page);
      addToast('success', '글이 정상적으로 삭제되었습니다.');
    } else if (mode === 'edit') {
      // Verify password first
      await verifyPasswordApi(post.id, password);
      // Close password modal and open edit modal
      setPasswordModalState({ isOpen: false, mode: null, post: null });
      setEditModalState({
        isOpen: true,
        post,
        verifiedPassword: password,
      });
    }
  };

  // Edit post submit handler
  const handleEditSubmit = async (
    postId: number,
    data: {
      authorName: string;
      content: string;
      password: string;
      category: string;
    }
  ) => {
    await updatePostApi(postId, data);
    setEditModalState({ isOpen: false, post: null, verifiedPassword: '' });
    await loadPosts(pagination.page);
    addToast('success', '글이 성공적으로 수정되었습니다.');
  };

  // Filter & Search
  const filteredPosts = posts.filter((p) => {
    const matchesCategory =
      categoryFilter === 'all' || p.category === categoryFilter;
    const matchesSearch =
      searchQuery.trim() === '' ||
      p.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Sticky Header */}
      <Header
        onOpenCreate={() => setIsCreateOpen(true)}
        onRefresh={handleRefresh}
        isLoading={isRefreshing || isLoading}
        totalPosts={pagination.total}
      />

      {/* Main 3-Column Layout (Twitter / X style) */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex justify-center">
        {/* Left Column: Sidebar Navigation */}
        <Sidebar
          currentCategory={categoryFilter}
          onSelectCategory={(cat) => setCategoryFilter(cat)}
          onOpenCreate={() => setIsCreateOpen(true)}
          totalPosts={pagination.total}
        />

        {/* Center Column: Main Timeline Feed */}
        <main className="w-full max-w-2xl min-h-[calc(100vh-4rem)] bg-white border-x border-slate-200/80 flex flex-col">
          {/* Sub-header / Status Bar */}
          <div className="sticky top-16 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base sm:text-lg text-slate-900">
                {categoryFilter === 'all'
                  ? '실시간 타임라인'
                  : `#${categoryFilter} 글모음`}
              </span>
              <span className="text-xs text-slate-400">
                ({filteredPosts.length}개의 포스트)
              </span>
            </div>

            {categoryFilter !== 'all' && (
              <button
                onClick={() => setCategoryFilter('all')}
                className="text-xs text-sky-600 hover:text-sky-700 font-medium px-2 py-1 rounded-md hover:bg-sky-50 transition-colors"
              >
                전체보기
              </button>
            )}
          </div>

          {/* Quick Twitter-style Compose Prompt Box */}
          <div
            onClick={() => setIsCreateOpen(true)}
            className="p-4 border-b border-slate-200/80 bg-white hover:bg-slate-50/60 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center font-bold text-sm shadow-2xs">
                나
              </div>
              <div className="flex-1 text-slate-400 group-hover:text-slate-600 text-sm py-2 px-4 rounded-full bg-slate-100 group-hover:bg-slate-200/60 transition-all select-none">
                오늘 어떤 생각이나 글을 우리 반과 나누고 싶나요?
              </div>
              <button
                type="button"
                className="shrink-0 p-2 text-white bg-sky-500 rounded-full hover:bg-sky-600 transition-colors shadow-2xs"
                title="글 쓰기"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Timeline Feed Container */}
          <div className="flex-1 divide-y divide-slate-100">
            {isLoading && posts.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-3">
                <RotateCw className="w-6 h-6 animate-spin mx-auto text-sky-500" />
                <p className="text-sm font-medium">우리 반 타임라인을 불러오는 중입니다...</p>
              </div>
            ) : fetchError ? (
              <div className="p-8 text-center space-y-3">
                <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
                <p className="text-sm text-slate-700 font-semibold">{fetchError}</p>
                <button
                  onClick={() => loadPosts(1)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-sky-500 hover:bg-sky-600 rounded-full shadow-xs"
                >
                  다시 시도하기
                </button>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="p-12 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center mx-auto">
                  <Feather className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base mb-1">
                    {searchQuery ? '검색 결과가 없습니다' : '아직 작성된 글이 없습니다'}
                  </h3>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    {searchQuery
                      ? '다른 검색어로 다시 검색해보세요.'
                      : '오른쪽 상단 + 버튼을 눌러 우리 반의 첫 번째 포스트를 등록해보세요!'}
                  </p>
                </div>
                {!searchQuery && (
                  <button
                    onClick={() => setIsCreateOpen(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-sky-500 hover:bg-sky-600 rounded-full shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>첫 글 작성하기</span>
                  </button>
                )}
              </div>
            ) : (
              filteredPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onLike={handleLike}
                  onEditRequest={handleEditRequest}
                  onDeleteRequest={handleDeleteRequest}
                />
              ))
            )}
          </div>

          {/* Pagination Controls (10개씩 표시 & 페이지 바로가기) */}
          <Pagination
            pagination={pagination}
            onPageChange={handlePageChange}
            isLoading={isLoading || isRefreshing}
          />
        </main>

        {/* Right Column: Search, Writing Prompts, Guidelines */}
        <RightPanel
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          posts={posts}
          onSelectPrompt={(text) => {
            setIsCreateOpen(true);
          }}
        />
      </div>

      {/* Post Creation Modal */}
      <CreatePostModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateSubmit}
      />

      {/* Password Verification Modal (for Edit / Delete) */}
      <PasswordModal
        isOpen={passwordModalState.isOpen}
        mode={passwordModalState.mode}
        post={passwordModalState.post}
        onClose={() => setPasswordModalState({ isOpen: false, mode: null, post: null })}
        onConfirm={handlePasswordConfirm}
      />

      {/* Edit Post Modal (after password verified) */}
      <EditPostModal
        isOpen={editModalState.isOpen}
        post={editModalState.post}
        verifiedPassword={editModalState.verifiedPassword}
        onClose={() => setEditModalState({ isOpen: false, post: null, verifiedPassword: '' })}
        onSubmit={handleEditSubmit}
      />

      {/* Toast Feedback Notifications */}
      <Toast toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
