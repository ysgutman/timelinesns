export interface Post {
  id: number;
  authorName: string;
  content: string;
  likesCount: number;
  category: string | null;
  userUid: string | null;
  createdAt: string;
  updatedAt: string;
  isLiked?: boolean;
}

export interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export type ModalType = 'create' | 'password-edit' | 'password-delete' | 'edit' | null;

export interface CategoryFilter {
  id: string;
  label: string;
  icon: string;
}
