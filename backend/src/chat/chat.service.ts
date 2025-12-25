import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import Anthropic from '@anthropic-ai/sdk';
import { Observable, Subject } from 'rxjs';

const BASE_SYSTEM_PROMPT = `당신은 문화예술 AI 도슨트입니다. 오페라, 클래식 음악, 발레, 미술, 연극 등 다양한 문화예술 분야에 대해 전문적이면서도 친근하게 설명해주세요.

주요 역할:
- 공연 작품의 역사적 배경과 의미를 설명
- 예술가들의 생애와 작품 세계를 소개
- 감상 포인트와 관람 팁 제공
- 문화예술에 대한 질문에 친절히 답변

항상 한국어로 대화하고, 전문 용어는 쉽게 풀어서 설명해주세요.`;

interface ArticleWithMagazine {
  id: number;
  title: string;
  subtitle: string | null;
  content: string;
  category: string;
  author: string | null;
  magazine: {
    title: string;
    issue: number;
  } | null;
}

@Injectable()
export class ChatService {
  private anthropic: Anthropic;

  constructor(private prisma: PrismaService) {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  // RAG: 키워드 기반 검색
  private async searchRelevantContent(query: string): Promise<string> {
    console.log('[RAG] 검색 쿼리:', query);

    // 문화예술 관련 키워드 매핑
    const artKeywords: Record<string, string[]> = {
      '오페라': ['오페라', '아리아', '성악', '베르디', '푸치니', '모차르트'],
      '클래식': ['클래식', '교향곡', '협주곡', '베토벤', '모차르트', '바흐', '피아노'],
      '발레': ['발레', '백조의 호수', '호두까기', '차이콥스키', '무용'],
      '미술': ['미술', '그림', '화가', '전시', '갤러리', '인상주의', '현대미술'],
      '뮤지컬': ['뮤지컬', '브로드웨이', '레미제라블', '오페라의 유령'],
      '연극': ['연극', '셰익스피어', '햄릿', '무대', '배우'],
    };

    // 키워드 추출 (한국어 + 영어)
    let keywords = query
      .replace(/[?!.,。？！，．~@#$%^&*()]/g, '')
      .split(/[\s,]+/)
      .filter((word) => word.length >= 2);

    // 관련 키워드 확장
    const expandedKeywords = new Set(keywords);
    for (const keyword of keywords) {
      for (const [category, relatedWords] of Object.entries(artKeywords)) {
        if (keyword.includes(category) || relatedWords.some(w => keyword.includes(w))) {
          relatedWords.forEach(w => expandedKeywords.add(w));
        }
      }
    }

    const allKeywords = Array.from(expandedKeywords);
    console.log('[RAG] 검색 키워드:', allKeywords);

    if (allKeywords.length === 0) {
      // 키워드가 없으면 최신 기사 3개 반환
      const recentArticles = await this.prisma.article.findMany({
        take: 3,
        orderBy: { createdAt: 'desc' },
        include: { magazine: true },
      });
      console.log('[RAG] 최신 기사 사용:', recentArticles.length);
      return recentArticles.length > 0 ? this.formatContext(recentArticles) : '';
    }

    // OR 조건으로 검색
    const searchConditions = allKeywords.map((keyword) => ({
      OR: [
        { title: { contains: keyword, mode: 'insensitive' as const } },
        { content: { contains: keyword, mode: 'insensitive' as const } },
        { subtitle: { contains: keyword, mode: 'insensitive' as const } },
      ],
    }));

    const articles = await this.prisma.article.findMany({
      where: { OR: searchConditions },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { magazine: true },
    });

    console.log('[RAG] 검색 결과:', articles.length, '개 기사');

    if (articles.length === 0) {
      // 검색 결과 없으면 최신 기사 반환
      const recentArticles = await this.prisma.article.findMany({
        take: 3,
        orderBy: { createdAt: 'desc' },
        include: { magazine: true },
      });
      return recentArticles.length > 0 ? this.formatContext(recentArticles) : '';
    }

    return this.formatContext(articles);
  }

  // 컨텍스트 포맷팅
  private formatContext(articles: ArticleWithMagazine[]): string {
    const contextParts = articles.map((article, index) => {
      return `[기사 ${index + 1}] ${article.title}
- 카테고리: ${article.category}
- 부제: ${article.subtitle || '없음'}
- 작성자: ${article.author || '편집부'}
- 출처: ${article.magazine ? `${article.magazine.title} ${article.magazine.issue}호` : '미지정'}
- 내용: ${article.content}`;
    });

    return `

=== 참고 자료 (우리 매거진 기사) ===
${contextParts.join('\n\n')}
=== 참고 자료 끝 ===

중요: 위 참고 자료의 내용을 적극 활용하여 답변하세요.
- 관련 기사가 있다면 "저희 매거진에서 다룬 바에 따르면...", "OO호에서 소개한 내용으로는..." 등으로 자연스럽게 인용하세요.
- 참고 자료의 구체적인 정보(작품명, 작가명, 날짜 등)를 포함하세요.
- 참고 자료에 없는 내용은 일반 지식으로 보충하되, 추측은 피하세요.
`;
  }

  // 시스템 프롬프트 생성 (RAG 컨텍스트 포함)
  private async buildSystemPrompt(userMessage: string): Promise<string> {
    const ragContext = await this.searchRelevantContent(userMessage);

    if (ragContext) {
      return `${BASE_SYSTEM_PROMPT}\n${ragContext}`;
    }

    return BASE_SYSTEM_PROMPT;
  }

  async chatStream(sessionId: string, message: string): Promise<Observable<{ data: string }>> {
    // Save user message
    await this.prisma.chatHistory.create({
      data: {
        sessionId,
        role: 'user',
        content: message,
      },
    });

    // Get chat history for context
    const history = await this.prisma.chatHistory.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
      take: 20,
    });

    const messages = history.map((h) => ({
      role: h.role as 'user' | 'assistant',
      content: h.content,
    }));

    // Build system prompt with RAG context
    const systemPrompt = await this.buildSystemPrompt(message);

    const subject = new Subject<{ data: string }>();

    // Start streaming in background
    this.streamResponse(sessionId, messages, systemPrompt, subject);

    return subject.asObservable();
  }

  private async streamResponse(
    sessionId: string,
    messages: Array<{ role: 'user' | 'assistant'; content: string }>,
    systemPrompt: string,
    subject: Subject<{ data: string }>,
  ) {
    let fullResponse = '';

    try {
      const stream = await this.anthropic.messages.stream({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: systemPrompt,
        messages,
      });

      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          const text = event.delta.text;
          fullResponse += text;
          subject.next({ data: JSON.stringify({ type: 'delta', content: text }) });
        }
      }

      // Save complete response to database
      await this.prisma.chatHistory.create({
        data: {
          sessionId,
          role: 'assistant',
          content: fullResponse,
        },
      });

      subject.next({ data: JSON.stringify({ type: 'done' }) });
      subject.complete();
    } catch (error) {
      subject.next({ data: JSON.stringify({ type: 'error', message: error.message }) });
      subject.complete();
    }
  }

  async chat(sessionId: string, message: string) {
    // Save user message
    await this.prisma.chatHistory.create({
      data: {
        sessionId,
        role: 'user',
        content: message,
      },
    });

    // Get chat history for context
    const history = await this.prisma.chatHistory.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
      take: 20,
    });

    const messages = history.map((h) => ({
      role: h.role as 'user' | 'assistant',
      content: h.content,
    }));

    // Build system prompt with RAG context
    const systemPrompt = await this.buildSystemPrompt(message);

    // Call Claude API
    const response = await this.anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    });

    const assistantMessage = response.content[0].type === 'text'
      ? response.content[0].text
      : '';

    // Save assistant response
    await this.prisma.chatHistory.create({
      data: {
        sessionId,
        role: 'assistant',
        content: assistantMessage,
      },
    });

    return {
      sessionId,
      message: assistantMessage,
    };
  }

  async getHistory(sessionId: string) {
    return this.prisma.chatHistory.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async clearHistory(sessionId: string) {
    return this.prisma.chatHistory.deleteMany({
      where: { sessionId },
    });
  }
}
