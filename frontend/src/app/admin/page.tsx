'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const API_URL = '/api';

interface Stats {
  magazines: number;
  articles: number;
  categories: { [key: string]: number };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    magazines: 0,
    articles: 0,
    categories: {},
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [magazinesRes, articlesRes] = await Promise.all([
          fetch(`${API_URL}/magazines`),
          fetch(`${API_URL}/articles`),
        ]);

        const magazines = await magazinesRes.json();
        const articles = await articlesRes.json();

        const categories: { [key: string]: number } = {};
        articles.forEach((article: { category: string }) => {
          categories[article.category] = (categories[article.category] || 0) + 1;
        });

        setStats({
          magazines: magazines.length,
          articles: articles.length,
          categories,
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const categoryLabels: { [key: string]: string } = {
    COVER_STORY: '커버 스토리',
    PERFORMANCE_REVIEW: '공연 리뷰',
    EDITOR_PICK: '에디터 픽',
    INTERVIEW: '인터뷰',
    EXHIBITION: '전시',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">대시보드</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">총 매거진</p>
              <p className="text-3xl font-bold text-primary">{stats.magazines}</p>
            </div>
            <div className="text-4xl">📚</div>
          </div>
          <Link
            href="/admin/magazines"
            className="mt-4 inline-block text-sm text-accent hover:underline"
          >
            관리하기 →
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">총 기사</p>
              <p className="text-3xl font-bold text-primary">{stats.articles}</p>
            </div>
            <div className="text-4xl">📝</div>
          </div>
          <Link
            href="/admin/articles"
            className="mt-4 inline-block text-sm text-accent hover:underline"
          >
            관리하기 →
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">카테고리</p>
              <p className="text-3xl font-bold text-primary">
                {Object.keys(stats.categories).length}
              </p>
            </div>
            <div className="text-4xl">🏷️</div>
          </div>
        </div>
      </div>

      {/* Category Distribution */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">카테고리별 기사 수</h2>
        <div className="space-y-3">
          {Object.entries(stats.categories).map(([category, count]) => (
            <div key={category} className="flex items-center gap-4">
              <span className="w-32 text-sm text-gray-600">
                {categoryLabels[category] || category}
              </span>
              <div className="flex-grow bg-gray-200 rounded-full h-4">
                <div
                  className="bg-accent rounded-full h-4 transition-all"
                  style={{
                    width: `${(count / stats.articles) * 100}%`,
                  }}
                />
              </div>
              <span className="w-8 text-right text-sm font-medium">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">빠른 작업</h2>
        <div className="flex gap-4">
          <Link
            href="/admin/magazines/new"
            className="btn-primary flex items-center gap-2"
          >
            <span>+</span> 새 매거진
          </Link>
          <Link
            href="/admin/articles/new"
            className="btn-primary flex items-center gap-2"
          >
            <span>+</span> 새 기사
          </Link>
        </div>
      </div>
    </div>
  );
}
