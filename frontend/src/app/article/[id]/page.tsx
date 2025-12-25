'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { fetchArticle, Article } from '@/lib/api';

export default function ArticlePage() {
  const params = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchArticle(Number(params.id))
        .then(setArticle)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500">아티클을 찾을 수 없습니다.</p>
        <Link href="/" className="text-accent hover:underline mt-4 inline-block">
          홈으로 돌아가기
        </Link>
      </div>
    );
  }

  const categoryLabels: Record<string, string> = {
    COVER_STORY: '커버스토리',
    PERFORMANCE_REVIEW: '공연 리뷰',
    EDITOR_PICK: '에디터 픽',
    INTERVIEW: '인터뷰',
    EXHIBITION: '전시',
  };

  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/" className="text-gray-500 hover:text-accent">
          ← 홈으로
        </Link>
      </div>

      <header className="mb-8">
        <span className="inline-block bg-accent text-white text-sm px-3 py-1 rounded-full mb-4">
          {categoryLabels[article.category] || article.category}
        </span>
        <h1 className="text-4xl font-bold text-primary mb-4">{article.title}</h1>
        {article.subtitle && (
          <p className="text-xl text-gray-600 mb-4">{article.subtitle}</p>
        )}
        <div className="flex items-center text-gray-500 text-sm">
          {article.author && <span className="mr-4">글: {article.author}</span>}
          <span>{new Date(article.createdAt).toLocaleDateString('ko-KR')}</span>
        </div>
      </header>

      {article.imageUrl && (
        <div className="mb-8 rounded-xl overflow-hidden">
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-auto"
          />
        </div>
      )}

      <div className="prose prose-lg max-w-none">
        {article.content.split('\n').map((paragraph, idx) => (
          <p key={idx} className="mb-4 text-gray-700 leading-relaxed">
            {paragraph}
          </p>
        ))}
      </div>

      <footer className="mt-12 pt-8 border-t">
        <Link
          href="/chat"
          className="btn-primary inline-block"
        >
          이 작품에 대해 AI 도슨트에게 질문하기
        </Link>
      </footer>
    </article>
  );
}
