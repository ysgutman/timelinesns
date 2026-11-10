import express from 'express';
import {
  getPosts,
  createPost,
  updatePost,
  deletePost,
  togglePostLike,
  verifyPostPassword,
} from '../db/posts.ts';
import { optionalAuth, AuthRequest } from '../middleware/auth.ts';

export const apiApp = express();

apiApp.use(express.json());

// Health check / DB ping
apiApp.get('/api/health', async (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// GET /api/posts (Paginated, latest first, with optional like status)
apiApp.get('/api/posts', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const clientId = (req.query.clientId as string) || '';

    const data = await getPosts(page, limit, clientId);
    res.json(data);
  } catch (error: any) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: error.message || '글 목록을 불러오지 못했습니다.' });
  }
});

// POST /api/posts (Create new writing post)
apiApp.post('/api/posts', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const { authorName, content, password, category } = req.body;
    const userUid = req.user?.uid;

    if (!authorName || !content || !password) {
      return res.status(400).json({ error: '이름, 내용, 비밀번호(숫자 4자리)를 모두 입력해주세요.' });
    }

    const post = await createPost({
      authorName,
      content,
      password,
      category,
      userUid,
    });

    res.status(201).json(post);
  } catch (error: any) {
    console.error('Error creating post:', error);
    res.status(400).json({ error: error.message || '글 등록에 실패했습니다.' });
  }
});

// POST /api/posts/:id/verify (Verify 4-digit password)
apiApp.post('/api/posts/:id/verify', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: '비밀번호를 입력해주세요.' });
    }

    const result = await verifyPostPassword(id, password);
    if (!result.success) {
      return res.status(401).json({ error: '비밀번호가 일치하지 않습니다.' });
    }

    res.json({ success: true, message: '비밀번호가 확인되었습니다.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || '비밀번호 검증 중 오류가 발생했습니다.' });
  }
});

// PUT /api/posts/:id (Update post with 4-digit password check)
apiApp.put('/api/posts/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { password, authorName, content, category } = req.body;

    if (!password) {
      return res.status(400).json({ error: '비밀번호를 입력해주세요.' });
    }

    const updated = await updatePost(id, password, {
      authorName,
      content,
      category,
    });

    res.json(updated);
  } catch (error: any) {
    console.error('Error updating post:', error);
    res.status(400).json({ error: error.message || '글 수정에 실패했습니다.' });
  }
});

// DELETE /api/posts/:id (Delete post with 4-digit password check)
apiApp.delete('/api/posts/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: '비밀번호를 입력해주세요.' });
    }

    const result = await deletePost(id, password);
    res.json(result);
  } catch (error: any) {
    console.error('Error deleting post:', error);
    res.status(400).json({ error: error.message || '글 삭제에 실패했습니다.' });
  }
});

// POST /api/posts/:id/like (Toggle like)
apiApp.post('/api/posts/:id/like', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { clientId } = req.body;

    if (!clientId) {
      return res.status(400).json({ error: '클라이언트 식별자가 필요합니다.' });
    }

    const result = await togglePostLike(id, clientId);
    res.json(result);
  } catch (error: any) {
    console.error('Error toggling like:', error);
    res.status(500).json({ error: error.message || '좋아요 처리에 실패했습니다.' });
  }
});
