import { eq, desc, count, sql } from 'drizzle-orm';
import { db } from './index.ts';
import { posts, postLikes } from './schema.ts';

export interface PostResponse {
  id: number;
  authorName: string;
  content: string;
  likesCount: number;
  category: string | null;
  userUid: string | null;
  createdAt: Date;
  updatedAt: Date;
  isLiked?: boolean;
}

export async function getPosts(page: number = 1, limit: number = 10, clientId?: string) {
  try {
    const offset = Math.max(0, (page - 1) * limit);

    // Total count
    const totalResult = await db.select({ total: count() }).from(posts);
    const total = Number(totalResult[0]?.total ?? 0);
    const totalPages = Math.max(1, Math.ceil(total / limit));

    // Fetch posts ordered by createdAt descending
    const rawPosts = await db
      .select({
        id: posts.id,
        authorName: posts.authorName,
        content: posts.content,
        likesCount: posts.likesCount,
        category: posts.category,
        userUid: posts.userUid,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
      })
      .from(posts)
      .orderBy(desc(posts.createdAt))
      .limit(limit)
      .offset(offset);

    // Check likes for current client
    let likedPostIds = new Set<number>();
    if (clientId && rawPosts.length > 0) {
      const likes = await db
        .select({ postId: postLikes.postId })
        .from(postLikes)
        .where(eq(postLikes.clientId, clientId));
      likedPostIds = new Set(likes.map((l) => l.postId));
    }

    const items: PostResponse[] = rawPosts.map((p) => ({
      ...p,
      isLiked: likedPostIds.has(p.id),
    }));

    return {
      posts: items,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  } catch (error) {
    console.error('Database query failed in getPosts:', error);
    throw new Error('글 목록을 불러오는 중 데이터베이스 오류가 발생했습니다.', { cause: error });
  }
}

export async function createPost(data: {
  authorName: string;
  content: string;
  password: string;
  category?: string;
  userUid?: string;
}) {
  try {
    const trimmedName = data.authorName.trim();
    const trimmedContent = data.content.trim();
    const cleanPassword = data.password.trim();

    if (!trimmedName) throw new Error('작성자 이름을 입력해주세요.');
    if (!trimmedContent) throw new Error('글 내용을 입력해주세요.');
    if (!/^\d{4}$/.test(cleanPassword)) {
      throw new Error('비밀번호는 숫자 4자리여야 합니다.');
    }

    const inserted = await db
      .insert(posts)
      .values({
        authorName: trimmedName,
        content: trimmedContent,
        password: cleanPassword,
        category: data.category?.trim() || '자유글',
        userUid: data.userUid || null,
      })
      .returning({
        id: posts.id,
        authorName: posts.authorName,
        content: posts.content,
        likesCount: posts.likesCount,
        category: posts.category,
        userUid: posts.userUid,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
      });

    return inserted[0];
  } catch (error: any) {
    console.error('Database insert failed in createPost:', error);
    throw new Error(error.message || '글을 등록하는 중 오류가 발생했습니다.', { cause: error });
  }
}

export async function verifyPostPassword(id: number, passwordInput: string) {
  try {
    const postRecord = await db
      .select({ id: posts.id, password: posts.password })
      .from(posts)
      .where(eq(posts.id, id))
      .limit(1);

    if (postRecord.length === 0) {
      return { success: false, reason: 'notFound' };
    }

    const match = postRecord[0].password === passwordInput.trim();
    return { success: match, reason: match ? 'ok' : 'mismatch' };
  } catch (error) {
    console.error('Password verification failed:', error);
    throw new Error('비밀번호 검증 중 오류가 발생했습니다.', { cause: error });
  }
}

export async function updatePost(
  id: number,
  passwordInput: string,
  data: { authorName: string; content: string; category?: string }
) {
  try {
    const verify = await verifyPostPassword(id, passwordInput);
    if (!verify.success) {
      if (verify.reason === 'notFound') throw new Error('해당 글을 찾을 수 없습니다.');
      throw new Error('비밀번호가 일치하지 않습니다.');
    }

    const trimmedName = data.authorName.trim();
    const trimmedContent = data.content.trim();
    if (!trimmedName) throw new Error('작성자 이름을 입력해주세요.');
    if (!trimmedContent) throw new Error('글 내용을 입력해주세요.');

    const updated = await db
      .update(posts)
      .set({
        authorName: trimmedName,
        content: trimmedContent,
        category: data.category?.trim() || '자유글',
        updatedAt: new Date(),
      })
      .where(eq(posts.id, id))
      .returning({
        id: posts.id,
        authorName: posts.authorName,
        content: posts.content,
        likesCount: posts.likesCount,
        category: posts.category,
        userUid: posts.userUid,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
      });

    return updated[0];
  } catch (error: any) {
    console.error('Database update failed in updatePost:', error);
    throw new Error(error.message || '글 수정 중 오류가 발생했습니다.', { cause: error });
  }
}

export async function deletePost(id: number, passwordInput: string) {
  try {
    const verify = await verifyPostPassword(id, passwordInput);
    if (!verify.success) {
      if (verify.reason === 'notFound') throw new Error('해당 글을 찾을 수 없습니다.');
      throw new Error('비밀번호가 일치하지 않습니다.');
    }

    await db.delete(posts).where(eq(posts.id, id));
    return { success: true, deletedId: id };
  } catch (error: any) {
    console.error('Database delete failed in deletePost:', error);
    throw new Error(error.message || '글 삭제 중 오류가 발생했습니다.', { cause: error });
  }
}

export async function togglePostLike(id: number, clientId: string) {
  try {
    const targetPost = await db
      .select({ id: posts.id, likesCount: posts.likesCount })
      .from(posts)
      .where(eq(posts.id, id))
      .limit(1);

    if (targetPost.length === 0) {
      throw new Error('해당 글을 찾을 수 없습니다.');
    }

    // Check if already liked by this client
    const existingLike = await db
      .select({ id: postLikes.id })
      .from(postLikes)
      .where(sql`${postLikes.postId} = ${id} AND ${postLikes.clientId} = ${clientId}`)
      .limit(1);

    let isLiked = false;
    let newCount = targetPost[0].likesCount;

    if (existingLike.length > 0) {
      // Unlike
      await db.delete(postLikes).where(eq(postLikes.id, existingLike[0].id));
      newCount = Math.max(0, newCount - 1);
      await db.update(posts).set({ likesCount: newCount }).where(eq(posts.id, id));
      isLiked = false;
    } else {
      // Like
      await db.insert(postLikes).values({ postId: id, clientId });
      newCount = newCount + 1;
      await db.update(posts).set({ likesCount: newCount }).where(eq(posts.id, id));
      isLiked = true;
    }

    return { id, likesCount: newCount, isLiked };
  } catch (error: any) {
    console.error('Toggle like failed in togglePostLike:', error);
    throw new Error(error.message || '좋아요 처리 중 오류가 발생했습니다.', { cause: error });
  }
}
