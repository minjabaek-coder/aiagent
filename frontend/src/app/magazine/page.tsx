'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchMagazines, Magazine } from '@/lib/api';

export default function MagazinePage() {
  const [magazines, setMagazines] = useState<Magazine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMagazines()
      .then(setMagazines)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-primary mb-8">매거진 아카이브</h1>

      {loading ? (
        <div className="text-center py-12 text-gray-500">로딩 중...</div>
      ) : magazines.length > 0 ? (
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
          {magazines.map((magazine) => (
            <Link
              key={magazine.id}
              href={`/magazine/${magazine.id}`}
              className="card group"
            >
              <div className="aspect-[3/4] bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                {magazine.coverImage ? (
                  <img
                    src={magazine.coverImage}
                    alt={magazine.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white text-4xl font-bold">
                    #{magazine.issue}
                  </span>
                )}
              </div>
              <div className="p-4">
                <span className="text-sm text-gray-500">제 {magazine.issue}호</span>
                <h2 className="text-lg font-semibold group-hover:text-accent transition-colors">
                  {magazine.title}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(magazine.publishedAt).toLocaleDateString('ko-KR')}
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          등록된 매거진이 없습니다.
        </div>
      )}
    </div>
  );
}
