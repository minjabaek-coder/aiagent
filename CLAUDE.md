# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Culture AI Platform - 문화예술 매거진과 AI 도슨트 챗봇을 결합한 풀스택 웹 애플리케이션.

## Tech Stack

- **Backend**: NestJS 10.3 + TypeScript + Prisma 5.10 (PostgreSQL)
- **Frontend**: Next.js 14.1 (App Router) + React 18 + Tailwind CSS
- **AI**: Anthropic SDK (Claude Sonnet 4)
- **Infrastructure**: Docker Compose (PostgreSQL 15, Node 20 Alpine)

## Commands

### Docker (권장)
```bash
docker compose up -d              # 전체 서비스 시작
docker compose up -d --build      # 재빌드 후 시작
docker compose logs -f backend    # 백엔드 로그 확인
```

### Backend (/backend)
```bash
npm run start:dev        # 개발 서버 (watch mode)
npm run build            # 프로덕션 빌드
npm run start:prod       # 프로덕션 실행
npx prisma db push       # 스키마 -> DB 동기화
npx prisma generate      # Prisma Client 생성
```

### Frontend (/frontend)
```bash
npm run dev              # 개발 서버 (port 3000)
npm run build            # 프로덕션 빌드
npm run lint             # Next.js linter
```

## Architecture

```
culture-ai-platform/
├── backend/             # NestJS API (port 4000)
│   └── src/
│       ├── prisma/      # Global DB service
│       ├── article/     # /articles CRUD
│       ├── magazine/    # /magazines CRUD
│       └── chat/        # /chat - AI 도슨트 (Anthropic)
└── frontend/            # Next.js (port 3000)
    └── src/
        ├── app/         # App Router pages
        ├── components/  # React components
        └── lib/api.ts   # API client
```

### Backend Module 구조
- **PrismaModule** (Global): 전체 모듈에서 DB 접근
- **ArticleModule**: 기사 CRUD + 카테고리 필터링
- **MagazineModule**: 매거진 관리 (articles 관계 포함)
- **ChatModule**: AI 챗봇 - sessionId 기반 대화 이력 관리

### Database Models (Prisma)
- **Magazine**: issue(unique), title, coverImage, articles[]
- **Article**: title, content, category(enum), author, magazineId
- **ChatHistory**: sessionId, role(user/assistant), content

### Article Categories
```typescript
enum Category {
  COVER_STORY, PERFORMANCE_REVIEW, EDITOR_PICK, INTERVIEW, EXHIBITION
}
```

## Environment Variables

```env
# Database
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=culture_ai

# Backend
ANTHROPIC_API_KEY=your_key
PORT=4000

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /articles | 전체 기사 (category 쿼리 지원) |
| GET | /articles/:id | 기사 상세 |
| POST | /articles | 기사 생성 |
| GET | /magazines | 전체 매거진 (articles 포함) |
| GET | /magazines/issue/:issue | 호수별 매거진 |
| POST | /chat | AI 메시지 전송 (sessionId 필수) |
| GET | /chat/:sessionId | 대화 이력 조회 |

## Styling Conventions

Tailwind CSS 커스텀 컬러:
- `primary`: #1a1a2e (다크 블루)
- `secondary`: #16213e
- `accent`: #e94560 (강조색)

## Key Patterns

- **NestJS**: Constructor 기반 DI, 모듈별 분리, DTO validation (class-validator)
- **Next.js**: 기본 Server Components, 인터랙티브는 'use client'
- **Chat**: 최근 20개 메시지로 컨텍스트 유지, 한국어 시스템 프롬프트
