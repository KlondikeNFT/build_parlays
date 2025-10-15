import { NextRequest, NextResponse } from 'next/server';
import { searchAtlasAPI, verifySearchAtlasConnection } from '@/lib/searchAtlas';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Test the SearchAtlas API connection
    const isConnected = await verifySearchAtlasConnection();
    
    if (!isConnected) {
      return NextResponse.json({
        success: false,
        error: 'Failed to connect to SearchAtlas API'
      }, { status: 500 });
    }

    // Get account information
    const accountInfo = await searchAtlasAPI.getAccountInfo();
    
    // Get projects
    const projects = await searchAtlasAPI.getProjects();
    
    // Get SEO insights for your site
    const seoInsights = await searchAtlasAPI.getSEOInsights('https://buildparlays.com');

    return NextResponse.json({
      success: true,
      data: {
        connection: 'Connected successfully',
        accountInfo,
        projects,
        seoInsights,
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
