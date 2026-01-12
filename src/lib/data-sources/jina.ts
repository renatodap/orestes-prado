/**
 * Jina AI Reader - Free Web Scraping for LLM-friendly content
 *
 * Uses Jina's free API (no API key required for basic usage):
 * - r.jina.ai: Convert any URL to clean markdown
 * - s.jina.ai: Search the web and get clean content
 *
 * Rate limits without API key: 20 RPM
 * Rate limits with free API key: 200 RPM + 10M free tokens
 *
 * @see https://jina.ai/reader/
 */

export interface JinaFetchResult {
  content: string;
  url: string;
  fetchedAt: Date;
  success: boolean;
  error?: string;
}

export interface JinaSearchResult {
  query: string;
  content: string;
  fetchedAt: Date;
  success: boolean;
  error?: string;
}

/**
 * Critical sources to pre-fetch for the briefing
 * These are the most important data sources that we want to get directly
 */
export const CRITICAL_SOURCES: Record<string, string> = {
  // Coffee prices - CEPEA
  cepea_coffee: 'https://www.cepea.org.br/en/indicator/coffee.aspx',

  // Other commodities - CEPEA
  cepea_soy: 'https://www.cepea.org.br/en/indicator/soybean.aspx',
  cepea_corn: 'https://www.cepea.org.br/en/indicator/corn.aspx',
  cepea_cattle: 'https://www.cepea.org.br/en/indicator/cattle.aspx',

  // Sports - São Paulo FC
  spfc_news: 'https://ge.globo.com/futebol/times/sao-paulo/',

  // Tennis - ATP Rankings
  atp_rankings: 'https://www.atptour.com/en/rankings/singles',

  // Brazilian Central Bank - Selic
  bcb_selic: 'https://www.bcb.gov.br/en/monetarypolicy/selicrate',
};

/**
 * Fetch a URL using Jina Reader API
 * Converts the page to clean, LLM-friendly markdown
 *
 * @param url - The URL to fetch
 * @param timeout - Timeout in milliseconds (default: 15000)
 * @returns JinaFetchResult with the content or error
 */
export async function fetchWithJina(
  url: string,
  timeout: number = 15000
): Promise<JinaFetchResult> {
  const jinaUrl = `https://r.jina.ai/${url}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(jinaUrl, {
      headers: {
        'Accept': 'text/markdown',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        content: '',
        url,
        fetchedAt: new Date(),
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const content = await response.text();

    return {
      content,
      url,
      fetchedAt: new Date(),
      success: true,
    };
  } catch (error) {
    clearTimeout(timeoutId);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return {
      content: '',
      url,
      fetchedAt: new Date(),
      success: false,
      error: errorMessage.includes('aborted') ? 'Request timeout' : errorMessage,
    };
  }
}

/**
 * Search the web using Jina Search API
 * Returns clean, LLM-friendly content from top results
 *
 * @param query - The search query
 * @param site - Optional: Restrict results to a specific domain
 * @param timeout - Timeout in milliseconds (default: 20000)
 * @returns JinaSearchResult with the content or error
 */
export async function searchWithJina(
  query: string,
  site?: string,
  timeout: number = 20000
): Promise<JinaSearchResult> {
  const params = new URLSearchParams({ q: query });
  if (site) {
    params.set('site', site);
  }

  const jinaUrl = `https://s.jina.ai/?${params.toString()}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(jinaUrl, {
      headers: {
        'Accept': 'text/markdown',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        query,
        content: '',
        fetchedAt: new Date(),
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const content = await response.text();

    return {
      query,
      content,
      fetchedAt: new Date(),
      success: true,
    };
  } catch (error) {
    clearTimeout(timeoutId);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return {
      query,
      content: '',
      fetchedAt: new Date(),
      success: false,
      error: errorMessage.includes('aborted') ? 'Request timeout' : errorMessage,
    };
  }
}

/**
 * Pre-fetch all critical data sources in parallel
 * Used to provide ground truth data to the LLM
 *
 * @param sources - Optional: Custom sources to fetch (defaults to CRITICAL_SOURCES)
 * @returns Record of source name to fetch result
 */
export async function preFetchCriticalData(
  sources: Record<string, string> = CRITICAL_SOURCES
): Promise<Record<string, JinaFetchResult>> {
  const results: Record<string, JinaFetchResult> = {};

  // Fetch all sources in parallel
  const fetchPromises = Object.entries(sources).map(async ([key, url]) => {
    const result = await fetchWithJina(url);
    return { key, result };
  });

  const fetchResults = await Promise.allSettled(fetchPromises);

  for (const settledResult of fetchResults) {
    if (settledResult.status === 'fulfilled') {
      const { key, result } = settledResult.value;
      results[key] = result;
    }
  }

  return results;
}

/**
 * Format pre-fetched data for inclusion in the prompt
 * Only includes successful fetches with truncated content
 *
 * @param preFetchedData - Results from preFetchCriticalData
 * @param maxContentLength - Maximum characters per source (default: 2000)
 * @returns Record of source name to formatted content string
 */
export function formatPreFetchedDataForPrompt(
  preFetchedData: Record<string, JinaFetchResult>,
  maxContentLength: number = 2000
): Record<string, string> {
  const formatted: Record<string, string> = {};

  for (const [key, result] of Object.entries(preFetchedData)) {
    if (result.success && result.content) {
      // Truncate content if too long
      let content = result.content;
      if (content.length > maxContentLength) {
        content = content.slice(0, maxContentLength) + '\n\n[... conteúdo truncado ...]';
      }

      // Add metadata
      formatted[key] = `Fonte: ${result.url}
Capturado em: ${result.fetchedAt.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}

${content}`;
    }
  }

  return formatted;
}

/**
 * Quick pre-fetch of only the most critical sources (coffee + IBOVESPA context)
 * Use this for faster generation when full pre-fetch is not needed
 */
export async function quickPreFetch(): Promise<Record<string, string>> {
  const quickSources = {
    cepea_coffee: CRITICAL_SOURCES.cepea_coffee,
    spfc_news: CRITICAL_SOURCES.spfc_news,
  };

  const results = await preFetchCriticalData(quickSources);
  return formatPreFetchedDataForPrompt(results);
}

/**
 * Full pre-fetch of all critical sources
 * Use this for maximum accuracy
 */
export async function fullPreFetch(): Promise<Record<string, string>> {
  const results = await preFetchCriticalData(CRITICAL_SOURCES);
  return formatPreFetchedDataForPrompt(results);
}
