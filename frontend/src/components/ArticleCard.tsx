import Link from 'next/link';
import { Article } from '@/lib/api';

interface ArticleCardProps {
  article: Article;
  compact?: boolean;
}

export default function ArticleCard({ article, compact = false }: ArticleCardProps) {
  const categoryLabels: Record<string, string> = {
    COVER_STORY: '커버스토리',
    PERFORMANCE_REVIEW: '공연 리뷰',
    EDITOR_PICK: '에디터 픽',
    INTERVIEW: '인터뷰',
    EXHIBITION: '전시',
  };

  if (compact) {
    return (
      <Link href={`/article/${article.id}`} className="card group">
        <div className="aspect-square bg-gray-100 relative">
          {article.imageUrl ? (
            <img
              src={article.imageUrl}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <span className="text-gray-400">No Image</span>
            </div>
          )}
        </div>
        <div className="p-3">
          <h3 className="font-semibold text-sm group-hover:text-accent transition-colors line-clamp-2">
            {article.title}
          </h3>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/article/${article.id}`} className="card group">
      <div className="aspect-video bg-gray-100 relative">
        {article.imageUrl ? (
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <span className="text-gray-400">No Image</span>
          </div>
        )}
        <span className="absolute top-2 left-2 bg-accent text-white text-xs px-2 py-1 rounded">
          {categoryLabels[article.category] || article.category}
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2 group-hover:text-accent transition-colors line-clamp-2">
          {article.title}
        </h3>
        {article.subtitle && (
          <p className="text-gray-600 text-sm mb-2 line-clamp-2">{article.subtitle}</p>
        )}
        <p className="text-gray-500 text-sm line-clamp-3">{article.content}</p>
      </div>
    </Link>
  );
}
