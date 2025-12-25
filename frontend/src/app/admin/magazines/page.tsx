'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const API_URL = '/api';

interface Magazine {
  id: number;
  issue: number;
  title: string;
  coverImage?: string;
  publishedAt: string;
  articles?: { id: number }[];
}

export default function MagazinesAdmin() {
  const [magazines, setMagazines] = useState<Magazine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMagazines();
  }, []);

  async function fetchMagazines() {
    try {
      const res = await fetch(`${API_URL}/magazines`);
      const data = await res.json();
      setMagazines(data);
    } catch (error) {
      console.error('Failed to fetch magazines:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const res = await fetch(`${API_URL}/magazines/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setMagazines(magazines.filter((m) => m.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete magazine:', error);
    }
  }

  if (loading) {
    return <div className="text-center py-8">로딩 중...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">매거진 관리</h1>
        <Link href="/admin/magazines/new" className="btn-primary">
          + 새 매거진
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                호수
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                제목
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                기사 수
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                발행일
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                작업
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {magazines.map((magazine) => (
              <tr key={magazine.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-lg font-bold text-primary">
                    #{magazine.issue}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="font-medium text-gray-900">
                    {magazine.title}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-gray-600">
                    {magazine.articles?.length || 0}개
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                  {new Date(magazine.publishedAt).toLocaleDateString('ko-KR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <Link
                    href={`/admin/magazines/${magazine.id}/edit`}
                    className="text-blue-600 hover:underline mr-4"
                  >
                    수정
                  </Link>
                  <button
                    onClick={() => handleDelete(magazine.id)}
                    className="text-red-600 hover:underline"
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {magazines.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            등록된 매거진이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
