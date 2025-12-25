'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ArticleCard from '@/components/ArticleCard';
import { fetchArticles, Article } from '@/lib/api';

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles()
      .then(setArticles)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const coverStory = articles.find((a) => a.category === 'COVER_STORY');
  const reviews = articles.filter((a) => a.category === 'PERFORMANCE_REVIEW').slice(0, 3);
  const editorPicks = articles.filter((a) => a.category === 'EDITOR_PICK').slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="mb-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            문화예술 AI 플랫폼
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            AI 도슨트와 함께 문화예술의 깊이를 경험하세요
          </p>
          <Link
            href="/chat"
            className="btn-primary inline-block text-lg px-8 py-3"
          >
            AI 도슨트와 대화하기
          </Link>
        </div>
      </section>

      {/* Cover Story */}
      {coverStory && (
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-primary mb-6 border-b-2 border-accent pb-2">
            커버스토리
          </h2>
          <div className="card p-6">
            <div className="md:flex gap-8">
              <div className="md:w-1/2 mb-4 md:mb-0">
                <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                  {coverStory.imageUrl ? (
                    <img
                      src={coverStory.imageUrl}
                      alt={coverStory.title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <span className="text-gray-400">Cover Image</span>
                  )}
                </div>
              </div>
              <div className="md:w-1/2">
                <h3 className="text-2xl font-bold mb-3">{coverStory.title}</h3>
                {coverStory.subtitle && (
                  <p className="text-lg text-gray-600 mb-4">{coverStory.subtitle}</p>
                )}
                <p className="text-gray-700 line-clamp-4">{coverStory.content}</p>
                <Link
                  href={`/article/${coverStory.id}`}
                  className="text-accent font-semibold mt-4 inline-block hover:underline"
                >
                  자세히 보기 →
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Performance Reviews */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-primary mb-6 border-b-2 border-accent pb-2">
          공연 리뷰
        </h2>
        {loading ? (
          <div className="text-center py-12 text-gray-500">로딩 중...</div>
        ) : reviews.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-6">
            {reviews.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            등록된 공연 리뷰가 없습니다.
          </div>
        )}
      </section>

      {/* Editor Picks */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-primary mb-6 border-b-2 border-accent pb-2">
          에디터 픽
        </h2>
        {editorPicks.length > 0 ? (
          <div className="grid md:grid-cols-4 gap-4">
            {editorPicks.map((article) => (
              <ArticleCard key={article.id} article={article} compact />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            등록된 에디터 픽이 없습니다.
          </div>
        )}
      </section>

      {/* AI Docent CTA */}
      <section className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-8 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">AI 도슨트</h2>
        <p className="text-lg mb-6 opacity-90">
          오페라, 클래식, 미술, 발레... 궁금한 것이 있으신가요?
          <br />
          AI 도슨트가 친절하게 설명해 드립니다.
        </p>
        <Link
          href="/chat"
          className="bg-accent text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-opacity-90 transition-all inline-block"
        >
          대화 시작하기
        </Link>
      </section>
    </div>
  );
}
