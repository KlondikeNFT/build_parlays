import { NextRequest, NextResponse } from 'next/server';
import { searchAtlasAPI, verifySearchAtlasConnection } from '@/lib/searchAtlas';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Test basic API connection first
    const connectionTest = await searchAtlasAPI.testConnection();
    
    if (!connectionTest.success) {
      return NextResponse.json({
        success: false,
        error: 'Failed to connect to SearchAtlas API',
        details: connectionTest.error,
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

    // Try to get account information
    const accountInfo = await searchAtlasAPI.getAccountInfo();
    
    // Try to get projects
    const projects = await searchAtlasAPI.getProjects();

    return NextResponse.json({
      success: true,
      data: {
        connection: 'Connected successfully',
        connectionTest,
        accountInfo,
        projects,
        config: {
          apiKey: '647158ea5a2d902fcfeeab62e5022c8f',
          accountId: '160-817',
          baseUrl: 'https://dashboard.searchatlas.com/api'
        },
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('SearchAtlas API Test Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
