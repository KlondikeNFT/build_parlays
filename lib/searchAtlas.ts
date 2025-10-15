// SearchAtlas API Integration
// API Key: 647158ea5a2d902fcfeeab62e5022c8f
// Account ID: 160-817

export interface SearchAtlasConfig {
  apiKey: string;
  accountId: string;
  baseUrl: string;
}

export const searchAtlasConfig: SearchAtlasConfig = {
  apiKey: '647158ea5a2d902fcfeeab62e5022c8f',
  accountId: '160-817',
  baseUrl: 'https://dashboard.searchatlas.com/api'
};

export interface SearchAtlasResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export class SearchAtlasAPI {
  private config: SearchAtlasConfig;

  constructor(config: SearchAtlasConfig) {
    this.config = config;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<SearchAtlasResponse> {
    try {
      const url = `${this.config.baseUrl}${endpoint}`;
      
      const response = await fetch(url, {
        ...options,
        headers: {
          'X-API-Key': this.config.apiKey,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`SearchAtlas API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('SearchAtlas API Error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Test API connection with a simple endpoint
  async testConnection(): Promise<SearchAtlasResponse> {
    return this.makeRequest('/test');
  }

  // Get account information
  async getAccountInfo(): Promise<SearchAtlasResponse> {
    return this.makeRequest(`/v1/account`);
  }

  // Get projects for the account
  async getProjects(): Promise<SearchAtlasResponse> {
    return this.makeRequest(`/v1/projects`);
  }

  // Get SEO insights for a URL
  async getSEOInsights(url: string): Promise<SearchAtlasResponse> {
    return this.makeRequest(`/v1/seo/analyze?url=${encodeURIComponent(url)}`);
  }

  // Get keyword data
  async getKeywordData(keyword: string): Promise<SearchAtlasResponse> {
    return this.makeRequest(`/v1/keywords?keyword=${encodeURIComponent(keyword)}`);
  }

  // Get competitor analysis
  async getCompetitorAnalysis(domain: string): Promise<SearchAtlasResponse> {
    return this.makeRequest(`/v1/competitors?domain=${encodeURIComponent(domain)}`);
  }

  // Get backlink data
  async getBacklinks(domain: string): Promise<SearchAtlasResponse> {
    return this.makeRequest(`/v1/backlinks?domain=${encodeURIComponent(domain)}`);
  }

  // Get site audit data
  async getSiteAudit(domain: string): Promise<SearchAtlasResponse> {
    return this.makeRequest(`/v1/audit?domain=${encodeURIComponent(domain)}`);
  }
}

// Export a default instance
export const searchAtlasAPI = new SearchAtlasAPI(searchAtlasConfig);

// Helper function to verify API connection
export async function verifySearchAtlasConnection(): Promise<boolean> {
  try {
    const result = await searchAtlasAPI.getAccountInfo();
    return result.success;
  } catch (error) {
    console.error('SearchAtlas connection verification failed:', error);
    return false;
  }
}
