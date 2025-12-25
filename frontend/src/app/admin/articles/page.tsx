'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const API_URL = '/api';

interface Article {
  id: number;
  title: string;
  subtitle?: string;
  category: string;
  author: string;
  createdAt: string;
  magazine?: { issue: number; title: string };
}

const categoryLabels: { [key: string]: string } = {
  COVER_STORY: '커버 스토리',
  PERFORMANCE_REVIEW: '공연 리뷰',
  EDITOR_PICK: '에디터 픽',
  INTERVIEW: '인터뷰',
  EXHIBITION: '전시',
};

export default function ArticlesAdmin() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles();
  }, []);

  async function fetchArticles() {
    try {
      const res = await fetch(`${API_URL}/articles`);
      const data = await res.json();
      setArticles(data);
    } catch (error) {
      console.error('Failed to fetch articles:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const res = await fetch(`${API_URL}/articles/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setArticles(articles.filter((a) => a.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete article:', error);
    }
  }

  if (loading) {
    return <div className="text-center py-8">로딩 중...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">기사 관리</h1>
        <Link href="/admin/articles/new" className="btn-primary">
          + 새 기사
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                제목
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                카테고리
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                작성자
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                매거진
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                작성일
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                작업
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {articles.map((article) => (
              <tr key={article.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <span className="font-medium text-gray-900">
                      {article.title}
                    </span>
                    {article.subtitle && (
                      <p className="text-sm text-gray-500">{article.subtitle}</p>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs rounded-full bg-accent/10 text-accent">
                    {categoryLabels[article.category] || article.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                  {article.author}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                  {article.magazine ? `#${article.magazine.issue}` : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                  {new Date(article.createdAt).toLocaleDateString('ko-KR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <Link
                    href={`/admin/articles/${article.id}/edit`}
                    className="text-blue-600 hover:underline mr-4"
                  >
                    수정
                  </Link>
                  <button
                    onClick={() => handleDelete(article.id)}
                    className="text-red-600 hover:underline"
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {articles.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            등록된 기사가 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
