import { NextRequest, NextResponse } from 'next/server';

// TODO: Import MCP client when available
// import { getMCPClient } from '@/lib/mcp-client';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const screenshots = formData.getAll('screenshots');

    if (screenshots.length === 0) {
      return NextResponse.json(
        { error: 'No screenshots provided' },
        { status: 400 }
      );
    }

    // TODO: Connect to MCP club.analytics tool
    // const mcpClient = getMCPClient();
    // const results = await mcpClient.callTool('club.analytics', 'uploadScreenshots', {
    //   screenshots: screenshots.map(file => ({
    //     name: (file as File).name,
    //     data: await (file as File).arrayBuffer()
    //   }))
    // });

    // Placeholder response
    const results = {
      uploaded: screenshots.length,
      processed: screenshots.length,
      files: screenshots.map((file) => ({
        name: (file as File).name,
        size: (file as File).size,
        status: 'processed',
      })),
    };

    return NextResponse.json({
      success: true,
      ...results,
    });
  } catch (error) {
    console.error('Error uploading screenshots:', error);
    return NextResponse.json(
      { error: 'Failed to upload screenshots' },
      { status: 500 }
    );
  }
}
