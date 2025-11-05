import { NextRequest, NextResponse } from 'next/server';
import { getChatStore } from '@/lib/chat-store';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const guildId = searchParams.get('guildId') || 'default';
    const limit = parseInt(searchParams.get('limit') || '50');
    const sinceParam = searchParams.get('since');

    // Get messages from store
    const chatStore = getChatStore();
    const since = sinceParam ? new Date(sinceParam) : undefined;
    const messages = chatStore.getMessages(guildId, limit, since);

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { guildId = 'default', userId, username, content, userColor } = body;

    // Validate required fields
    if (!userId || !username || !content) {
      return NextResponse.json(
        { error: 'Missing required fields (userId, username, content)' },
        { status: 400 }
      );
    }

    // Validate content length
    if (content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message content cannot be empty' },
        { status: 400 }
      );
    }

    if (content.length > 2000) {
      return NextResponse.json(
        { error: 'Message content too long (max 2000 characters)' },
        { status: 400 }
      );
    }

    // Add message to store
    const chatStore = getChatStore();
    const message = chatStore.addMessage({
      guildId,
      userId,
      username,
      content: content.trim(),
      userColor: userColor || chatStore['generateUserColor'](userId),
    });

    return NextResponse.json({ message });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
