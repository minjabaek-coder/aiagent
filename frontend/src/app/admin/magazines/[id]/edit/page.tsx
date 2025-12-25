'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

const API_URL = '/api';

export default function EditMagazine() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    issue: '',
    title: '',
    coverImage: '',
  });

  useEffect(() => {
    async function fetchMagazine() {
      try {
        const res = await fetch(`${API_URL}/magazines/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setForm({
            issue: data.issue.toString(),
            title: data.title,
            coverImage: data.coverImage || '',
          });
        }
      } catch (error) {
        console.error('Failed to fetch magazine:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchMagazine();
  }, [params.id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`${API_URL}/magazines/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          issue: parseInt(form.issue),
          title: form.title,
          coverImage: form.coverImage || null,
        }),
      });

      if (res.ok) {
        router.push('/admin/magazines');
      } else {
        alert('매거진 수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to update magazine:', error);
      alert('오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="text-center py-8">로딩 중...</div>;
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/magazines" className="text-gray-500 hover:text-gray-700">
          ← 목록으로
        </Link>
        <h1 className="text-3xl font-bold text-gray-800">매거진 수정</h1>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              호수 *
            </label>
            <input
              type="number"
              required
              value={form.issue}
              onChange={(e) => setForm({ ...form, issue: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              제목 *
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="문화예술 매거진 제1호"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              커버 이미지 URL
            </label>
            <input
              type="url"
              value={form.coverImage}
              onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="https://example.com/cover.jpg"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary disabled:opacity-50"
            >
              {saving ? '저장 중...' : '변경사항 저장'}
            </button>
            <Link
              href="/admin/magazines"
              className="px-6 py-2 border rounded-lg hover:bg-gray-50"
            >
              취소
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
