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
    const keywords = query
      .replace(/[?!.,。？！，．]/g, '')
      .split(/\s+/)
      .filter((word) => word.length >= 2);

    if (keywords.length === 0) {
      return '';
    }

    const searchConditions = keywords.map((keyword) => ({
      OR: [
        { title: { contains: keyword, mode: 'insensitive' as const } },
        { content: { contains: keyword, mode: 'insensitive' as const } },
        { subtitle: { contains: keyword, mode: 'insensitive' as const } },
      ],
    }));

    const articles = await this.prisma.article.findMany({
      where: { OR: searchConditions },
      take: 3,
      orderBy: { createdAt: 'desc' },
      include: { magazine: true },
    });

    if (articles.length === 0) {
      return '';
    }

    return this.formatContext(articles);
  }

  // 컨텍스트 포맷팅
  private formatContext(articles: ArticleWithMagazine[]): string {
    const contextParts = articles.map((article) => {
      return `【${article.title}】
카테고리: ${article.category}
${article.subtitle ? `부제: ${article.subtitle}` : ''}
작성자: ${article.author || '편집부'}
내용: ${article.content.substring(0, 500)}${article.content.length > 500 ? '...' : ''}
${article.magazine ? `출처: ${article.magazine.title} (${article.magazine.issue}호)` : ''}`;
    });

    return `
---
[참고 자료 - 우리 매거진의 관련 기사]
${contextParts.join('\n\n')}
---

위 참고 자료가 있다면 이를 바탕으로 답변해주세요. 참고 자료를 인용할 때는 자연스럽게 "저희 매거진에서 다룬 내용에 따르면..." 등으로 언급해주세요.
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
