'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const API_URL = '/api';

interface Magazine {
  id: number;
  issue: number;
  title: string;
}

const categories = [
  { value: 'COVER_STORY', label: '커버 스토리' },
  { value: 'PERFORMANCE_REVIEW', label: '공연 리뷰' },
  { value: 'EDITOR_PICK', label: '에디터 픽' },
  { value: 'INTERVIEW', label: '인터뷰' },
  { value: 'EXHIBITION', label: '전시' },
];

export default function NewArticle() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [magazines, setMagazines] = useState<Magazine[]>([]);
  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    content: '',
    category: 'COVER_STORY',
    author: '',
    magazineId: '',
  });

  useEffect(() => {
    async function fetchMagazines() {
      try {
        const res = await fetch(`${API_URL}/magazines`);
        const data = await res.json();
        setMagazines(data);
      } catch (error) {
        console.error('Failed to fetch magazines:', error);
      }
    }
    fetchMagazines();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/articles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          subtitle: form.subtitle || null,
          content: form.content,
          category: form.category,
          author: form.author,
          magazineId: form.magazineId ? parseInt(form.magazineId) : null,
        }),
      });

      if (res.ok) {
        router.push('/admin/articles');
      } else {
        alert('기사 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to create article:', error);
      alert('오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/articles" className="text-gray-500 hover:text-gray-700">
          ← 목록으로
        </Link>
        <h1 className="text-3xl font-bold text-gray-800">새 기사</h1>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                카테고리 *
              </label>
              <select
                required
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                매거진
              </label>
              <select
                value={form.magazineId}
                onChange={(e) => setForm({ ...form, magazineId: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="">선택 안함</option>
                {magazines.map((mag) => (
                  <option key={mag.id} value={mag.id}>
                    #{mag.issue} - {mag.title}
                  </option>
                ))}
              </select>
            </div>
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
              placeholder="기사 제목을 입력하세요"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              부제목
            </label>
            <input
              type="text"
              value={form.subtitle}
              onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="부제목을 입력하세요 (선택)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              작성자 *
            </label>
            <input
              type="text"
              required
              value={form.author}
              onChange={(e) => setForm({ ...form, author: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="작성자 이름"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              내용 *
            </label>
            <textarea
              required
              rows={10}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent resize-y"
              placeholder="기사 내용을 입력하세요"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary disabled:opacity-50"
            >
              {loading ? '생성 중...' : '기사 생성'}
            </button>
            <Link
              href="/admin/articles"
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
