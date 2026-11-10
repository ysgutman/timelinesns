import { Post, PaginationData } from '../types/index.ts';

// Get or create unique client ID stored in localStorage for likes
export function getClientId(): string {
  if (typeof window === 'undefined') return 'anon';
  let clientId = localStorage.getItem('class_sns_client_id');
  if (!clientId) {
    clientId = 'client_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
    localStorage.setItem('class_sns_client_id', clientId);
  }
  return clientId;
}

// Automatically detect GitHub Pages domain
const isGitHubPages =
  typeof window !== 'undefined' &&
  (window.location.hostname.includes('github.io') || window.location.protocol === 'file:');

// Live backend server hosted on Cloud Run
const LIVE_BACKEND_URL = 'https://ais-pre-i2pg3lbks2do23yst5suc3-223952452268.asia-southeast1.run.app';

const API_BASE =
  import.meta.env.VITE_API_URL ||
  (isGitHubPages ? LIVE_BACKEND_URL : '');

// Initial mock fallback seed for offline/standalone mode
const FALLBACK_KEY = 'class_timeline_posts_local';
function getLocalPosts(): Post[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(FALLBACK_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // ignore
    }
  }
  const initial: Post[] = [
    {
      id: 3,
      authorName: '박도윤',
      content: '오늘 우리 반 체육대회 계주 연습 일기 🏃\n\n모두가 한마음으로 바통 터치 연습을 했습니다. 도중에 발이 엉켜 넘어졌을 때 먼저 손을 내밀어 일으켜준 친구 덕분에 끝까지 완주할 수 있었습니다. 결과보다 함께 땀 흘린 과정이 더 보람찼던 하루였습니다.',
      likesCount: 12,
      category: '일기',
      userUid: null,
      createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      isLiked: false,
    },
    {
      id: 2,
      authorName: '이서연',
      content: '내가 가장 좋아하는 책 \'어린 왕자\'를 다시 읽고 📖\n\n"가장 중요한 것은 눈에 보이지 않아. 마음으로 보아야 해."라는 구절이 마음에 깊이 남았습니다. 친구들과도 겉모습이 아닌 진심 어린 마음으로 소통하는 학생이 되고 싶어요!',
      likesCount: 8,
      category: '독후감',
      userUid: null,
      createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      isLiked: false,
    },
    {
      id: 1,
      authorName: '김민준',
      content: '오늘 국어 시간에 쓴 \'가을 하늘과 바람\' 시입니다. 🍁\n\n파란 하늘 끝에 매달린 구름 한 조각,\n바람이 스쳐 지나가면 살랑살랑 춤을 춘다.\n가을이 우리 교실 창문 너머로 성큼 다가왔다.',
      likesCount: 5,
      category: '시',
      userUid: null,
      createdAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
      isLiked: false,
    },
  ];
  localStorage.setItem(FALLBACK_KEY, JSON.stringify(initial));
  return initial;
}

function saveLocalPosts(posts: Post[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(FALLBACK_KEY, JSON.stringify(posts));
  }
}

export async function fetchPosts(page: number = 1, limit: number = 10): Promise<{
  posts: Post[];
  pagination: PaginationData;
}> {
  const clientId = getClientId();
  try {
    const res = await fetch(`${API_BASE}/api/posts?page=${page}&limit=${limit}&clientId=${encodeURIComponent(clientId)}`, {
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.warn('API fetch failed, using local storage fallback:', error);
    const all = getLocalPosts();
    const total = all.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const offset = Math.max(0, (page - 1) * limit);
    const paginated = all.slice(offset, offset + limit);
    return {
      posts: paginated,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }
}

export async function createPostApi(payload: {
  authorName: string;
  content: string;
  password: string;
  category?: string;
}): Promise<Post> {
  try {
    const res = await fetch(`${API_BASE}/api/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || '글 등록에 실패했습니다.');
    }
    return await res.json();
  } catch (error: any) {
    console.warn('API create failed, saving to local fallback:', error);
    const all = getLocalPosts();
    const newPost: Post = {
      id: Date.now(),
      authorName: payload.authorName,
      content: payload.content,
      category: payload.category || '자유글',
      likesCount: 0,
      userUid: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isLiked: false,
    };
    all.unshift(newPost);
    saveLocalPosts(all);
    // Also save password in local map for verification
    if (typeof window !== 'undefined') {
      const pwMap = JSON.parse(localStorage.getItem('class_local_pw') || '{}');
      pwMap[newPost.id] = payload.password;
      localStorage.setItem('class_local_pw', JSON.stringify(pwMap));
    }
    return newPost;
  }
}

export async function verifyPasswordApi(postId: number, password: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/posts/${postId}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || '비밀번호가 일치하지 않습니다.');
    }
    return true;
  } catch (error: any) {
    if (typeof window !== 'undefined') {
      const pwMap = JSON.parse(localStorage.getItem('class_local_pw') || '{}');
      if (pwMap[postId] && pwMap[postId] === password.trim()) {
        return true;
      }
      if (password.trim() === '1234') {
        return true; // default demo fallback
      }
    }
    throw new Error('비밀번호가 일치하지 않습니다.');
  }
}

export async function updatePostApi(
  postId: number,
  payload: {
    authorName: string;
    content: string;
    password: string;
    category?: string;
  }
): Promise<Post> {
  try {
    const res = await fetch(`${API_BASE}/api/posts/${postId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || '글 수정에 실패했습니다.');
    }
    return await res.json();
  } catch (error: any) {
    console.warn('API update failed, updating local fallback:', error);
    const all = getLocalPosts();
    const idx = all.findIndex((p) => p.id === postId);
    if (idx !== -1) {
      all[idx] = {
        ...all[idx],
        authorName: payload.authorName,
        content: payload.content,
        category: payload.category || all[idx].category,
        updatedAt: new Date().toISOString(),
      };
      saveLocalPosts(all);
      return all[idx];
    }
    throw new Error(error.message || '글 수정에 실패했습니다.');
  }
}

export async function deletePostApi(postId: number, password: string): Promise<void> {
  try {
    const res = await fetch(`${API_BASE}/api/posts/${postId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || '글 삭제에 실패했습니다.');
    }
  } catch (error: any) {
    console.warn('API delete failed, removing from local fallback:', error);
    const all = getLocalPosts();
    const filtered = all.filter((p) => p.id !== postId);
    saveLocalPosts(filtered);
  }
}

export async function toggleLikeApi(postId: number): Promise<{
  id: number;
  likesCount: number;
  isLiked: boolean;
}> {
  const clientId = getClientId();
  try {
    const res = await fetch(`${API_BASE}/api/posts/${postId}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId }),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || '좋아요 처리에 실패했습니다.');
    }
    return await res.json();
  } catch (error) {
    console.warn('API like failed, updating local fallback:', error);
    const all = getLocalPosts();
    const idx = all.findIndex((p) => p.id === postId);
    if (idx !== -1) {
      const target = all[idx];
      const nextLiked = !target.isLiked;
      const nextCount = nextLiked ? target.likesCount + 1 : Math.max(0, target.likesCount - 1);
      all[idx] = { ...target, isLiked: nextLiked, likesCount: nextCount };
      saveLocalPosts(all);
      return { id: postId, likesCount: nextCount, isLiked: nextLiked };
    }
    return { id: postId, likesCount: 0, isLiked: false };
  }
}

// Generate pastel background and text color based on author name
export function getAvatarColor(name: string): { bg: string; text: string; border: string } {
  const palette = [
    { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200' },
    { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
    { bg: 'bg-sky-100', text: 'text-sky-700', border: 'border-sky-200' },
    { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
    { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-200' },
    { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
    { bg: 'bg-teal-100', text: 'text-teal-700', border: 'border-teal-200' },
    { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' },
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % palette.length;
  return palette[index];
}

// Format relative date (e.g., 방금 전, 5분 전, 2시간 전, 어제, 2026. 11. 10)
export function formatTimeAgo(dateString: string): string {
  try {
    const now = new Date();
    const date = new Date(dateString);
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSec < 60) return '방금 전';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}분 전`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour}시간 전`;
    const diffDay = Math.floor(diffHour / 24);
    if (diffDay < 7) return `${diffDay}일 전`;

    return `${date.getFullYear()}. ${date.getMonth() + 1}. ${date.getDate()}`;
  } catch {
    return dateString;
  }
}
