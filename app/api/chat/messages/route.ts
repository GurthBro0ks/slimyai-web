import { NextRequest, NextResponse } from 'next/server';

// TODO: Import MCP client when available
// import { MCPClient } from '@/lib/mcp-client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const guildId = searchParams.get('guildId');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!guildId) {
      return NextResponse.json(
        { error: 'Guild ID is required' },
        { status: 400 }
      );
    }

    // TODO: Connect to MCP chat.service
    // const mcpClient = new MCPClient();
    // const messages = await mcpClient.callTool('chat.service', 'getMessages', {
    //   guildId,
    //   limit,
    //   since: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
    // });

    // Placeholder response
    const messages = [
      {
        id: '1',
        username: 'Alex',
        content: 'Hello!',
        timestamp: new Date().toISOString(),
        userColor: '#06b6d4',
      },
      {
        id: '2',
        username: 'Brooke',
        content: 'Hi there!',
        timestamp: new Date().toISOString(),
        userColor: '#ec4899',
      },
    ];

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
    const { guildId, userId, username, content } = body;

    if (!guildId || !userId || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // TODO: Connect to MCP chat.service
    // const mcpClient = new MCPClient();
    // const result = await mcpClient.callTool('chat.service', 'sendMessage', {
    //   guildId,
    //   userId,
    //   username,
    //   content,
    //   timestamp: new Date().toISOString()
    // });

    // Placeholder response
    const message = {
      id: Date.now().toString(),
      username,
      content,
      timestamp: new Date().toISOString(),
      userColor: '#10b981',
    };

    return NextResponse.json({ message });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
