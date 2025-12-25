import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import Anthropic from '@anthropic-ai/sdk';
import { Observable, Subject } from 'rxjs';

const SYSTEM_PROMPT = `당신은 문화예술 AI 도슨트입니다. 오페라, 클래식 음악, 발레, 미술, 연극 등 다양한 문화예술 분야에 대해 전문적이면서도 친근하게 설명해주세요.

주요 역할:
- 공연 작품의 역사적 배경과 의미를 설명
- 예술가들의 생애와 작품 세계를 소개
- 감상 포인트와 관람 팁 제공
- 문화예술에 대한 질문에 친절히 답변

항상 한국어로 대화하고, 전문 용어는 쉽게 풀어서 설명해주세요.`;

@Injectable()
export class ChatService {
  private anthropic: Anthropic;

  constructor(private prisma: PrismaService) {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
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

    const subject = new Subject<{ data: string }>();

    // Start streaming in background
    this.streamResponse(sessionId, messages, subject);

    return subject.asObservable();
  }

  private async streamResponse(
    sessionId: string,
    messages: Array<{ role: 'user' | 'assistant'; content: string }>,
    subject: Subject<{ data: string }>,
  ) {
    let fullResponse = '';

    try {
      const stream = await this.anthropic.messages.stream({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
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

    // Call Claude API
    const response = await this.anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
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
