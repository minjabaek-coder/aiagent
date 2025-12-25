import { Controller, Post, Get, Delete, Body, Param, Res } from '@nestjs/common';
import { ChatService } from './chat.service';
import { Response } from 'express';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async chat(@Body() body: { sessionId: string; message: string }) {
    return this.chatService.chat(body.sessionId, body.message);
  }

  @Post('stream')
  async chatStream(
    @Body() body: { sessionId: string; message: string },
    @Res() res: Response,
  ) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    const observable = await this.chatService.chatStream(body.sessionId, body.message);

    observable.subscribe({
      next: (event) => {
        res.write(`data: ${event.data}\n\n`);
      },
      complete: () => {
        res.end();
      },
      error: (err) => {
        res.write(`data: ${JSON.stringify({ type: 'error', message: err.message })}\n\n`);
        res.end();
      },
    });
  }

  @Get(':sessionId')
  async getHistory(@Param('sessionId') sessionId: string) {
    return this.chatService.getHistory(sessionId);
  }

  @Delete(':sessionId')
  async clearHistory(@Param('sessionId') sessionId: string) {
    return this.chatService.clearHistory(sessionId);
  }
}
