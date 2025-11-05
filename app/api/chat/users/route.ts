import { NextRequest, NextResponse } from 'next/server';
import { getChatStore } from '@/lib/chat-store';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const guildId = searchParams.get('guildId') || 'default';

    // Get online users from store
    const chatStore = getChatStore();
    const users = chatStore.getOnlineUsers(guildId);

    // Clean up old offline users (optional maintenance)
    chatStore.cleanupOfflineUsers(guildId);

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
