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

const API_BASE = import.meta.env.VITE_API_URL || '';

export async function fetchPosts(page: number = 1, limit: number = 10): Promise<{
  posts: Post[];
  pagination: PaginationData;
}> {
  const clientId = getClientId();
  const res = await fetch(`${API_BASE}/api/posts?page=${page}&limit=${limit}&clientId=${encodeURIComponent(clientId)}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || '글 목록을 불러오지 못했습니다.');
  }
  return res.json();
}

export async function createPostApi(payload: {
  authorName: string;
  content: string;
  password: string;
  category?: string;
}): Promise<Post> {
  const res = await fetch(`${API_BASE}/api/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || '글 등록에 실패했습니다.');
  }
  return res.json();
}

export async function verifyPasswordApi(postId: number, password: string): Promise<boolean> {
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
  const res = await fetch(`${API_BASE}/api/posts/${postId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || '글 수정에 실패했습니다.');
  }
  return res.json();
}

export async function deletePostApi(postId: number, password: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/posts/${postId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || '글 삭제에 실패했습니다.');
  }
}

export async function toggleLikeApi(postId: number): Promise<{
  id: number;
  likesCount: number;
  isLiked: boolean;
}> {
  const clientId = getClientId();
  const res = await fetch(`${API_BASE}/api/posts/${postId}/like`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientId }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || '좋아요 처리에 실패했습니다.');
  }
  return res.json();
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
