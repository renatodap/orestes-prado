/**
 * Data Sources Module
 *
 * Provides tools for fetching and validating real-time data:
 * - Jina: Free web scraping and search API
 * - Validators: Hallucination detection and correction
 */

export {
  // Jina Reader API
  fetchWithJina,
  searchWithJina,
  preFetchCriticalData,
  formatPreFetchedDataForPrompt,
  quickPreFetch,
  fullPreFetch,
  CRITICAL_SOURCES,
  type JinaFetchResult,
  type JinaSearchResult,
} from './jina';

export {
  // Validators
  validateBriefingData,
  applyCorrections,
  generateValidationReport,
  EXPECTED_PRICE_RANGES,
  type ValidationResult,
} from './validators';
