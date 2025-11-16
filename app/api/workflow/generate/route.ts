import { NextRequest, NextResponse } from 'next/server';
import { getAIWorkflowGenerator } from '@/lib/workflow/aiWorkflowGenerator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userInput } = body;

    if (!userInput || typeof userInput !== 'string') {
      return NextResponse.json(
        { success: false, error: '请提供有效的任务描述' },
        { status: 400 }
      );
    }

    // Generate workflow using AI
    const generator = getAIWorkflowGenerator();
    const result = await generator.generateWorkflow({ userInput });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      nodes: result.nodes,
      edges: result.edges,
      description: result.description,
    });
  } catch (error: any) {
    console.error('Workflow generation API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || '服务器错误' },
      { status: 500 }
    );
  }
}
