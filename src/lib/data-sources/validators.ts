/**
 * Briefing Data Validators
 *
 * Validates briefing output to catch common hallucination patterns:
 * - Future dates (impossible data)
 * - Weekend market data (markets closed)
 * - Prices outside expected ranges
 * - Missing source citations
 */

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  corrections: Record<string, string>;
  stats: {
    futureDatesFound: number;
    weekendMarketReferences: number;
    pricesOutOfRange: number;
    missingDates: number;
  };
}

/**
 * Expected price ranges for Brazilian commodities (2025-2026)
 * Used for sanity checking extracted prices
 */
export const EXPECTED_PRICE_RANGES = {
  coffee_cepea: { min: 1800, max: 3200, unit: 'R$/saca', name: 'Café CEPEA' },
  soy_cepea: { min: 100, max: 180, unit: 'R$/saca', name: 'Soja CEPEA' },
  corn_cepea: { min: 50, max: 100, unit: 'R$/saca', name: 'Milho CEPEA' },
  cattle: { min: 280, max: 400, unit: 'R$/@', name: 'Boi Gordo' },
  ibovespa: { min: 100000, max: 180000, unit: 'pontos', name: 'IBOVESPA' },
  usd_brl: { min: 4.5, max: 7.0, unit: 'R$', name: 'USD/BRL' },
  ice_coffee: { min: 200, max: 500, unit: '¢/lb', name: 'ICE KC' },
};

/**
 * Get Brazil time
 */
function getBrazilTime(): Date {
  const now = new Date();
  return new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
}

/**
 * Get last business day
 */
function getLastBusinessDay(date: Date): Date {
  const result = new Date(date);
  const day = result.getDay();
  if (day === 0) result.setDate(result.getDate() - 2); // Sunday → Friday
  if (day === 6) result.setDate(result.getDate() - 1); // Saturday → Friday
  return result;
}

/**
 * Check if a date is in the future relative to Brazil time
 */
function isFutureDate(dateStr: string, brazilNow: Date): boolean {
  // Parse DD/MM/YYYY format
  const match = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (!match) return false;

  const [_, day, month, year] = match;
  const parsedDate = new Date(+year, +month - 1, +day);

  // Compare dates (ignore time)
  const nowDate = new Date(brazilNow.getFullYear(), brazilNow.getMonth(), brazilNow.getDate());
  return parsedDate > nowDate;
}

/**
 * Check if today is a weekend
 */
function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

/**
 * Extract all dates from briefing text (DD/MM/YYYY format)
 */
function extractDates(text: string): string[] {
  const datePattern = /\d{1,2}\/\d{1,2}\/\d{4}/g;
  return [...new Set(text.match(datePattern) || [])];
}

/**
 * Extract prices from briefing text
 */
interface ExtractedPrice {
  value: number;
  raw: string;
  type: string;
}

function extractPrices(text: string): ExtractedPrice[] {
  const prices: ExtractedPrice[] = [];

  // CEPEA coffee price: R$ X.XXX,XX/saca
  const coffeePattern = /CEPEA.*?R\$\s*([\d.,]+)\/saca/gi;
  let match;
  while ((match = coffeePattern.exec(text)) !== null) {
    const value = parseFloat(match[1].replace('.', '').replace(',', '.'));
    if (!isNaN(value)) {
      prices.push({ value, raw: match[0], type: 'coffee_cepea' });
    }
  }

  // ICE coffee: XXX,XX ¢/lb
  const icePattern = /ICE.*?(\d{2,3}[,.]?\d{0,2})\s*[¢c]\/lb/gi;
  while ((match = icePattern.exec(text)) !== null) {
    const value = parseFloat(match[1].replace(',', '.'));
    if (!isNaN(value)) {
      prices.push({ value, raw: match[0], type: 'ice_coffee' });
    }
  }

  // IBOVESPA: XXX.XXX pontos
  const ibovPattern = /IBOVESPA.*?(\d{2,3}\.?\d{3})\s*pontos/gi;
  while ((match = ibovPattern.exec(text)) !== null) {
    const value = parseFloat(match[1].replace('.', ''));
    if (!isNaN(value)) {
      prices.push({ value, raw: match[0], type: 'ibovespa' });
    }
  }

  // USD/BRL: R$ X,XX
  const usdPattern = /(?:dólar|USD\/BRL|câmbio).*?R\$\s*(\d{1,2}[,.]?\d{2})/gi;
  while ((match = usdPattern.exec(text)) !== null) {
    const value = parseFloat(match[1].replace(',', '.'));
    if (!isNaN(value)) {
      prices.push({ value, raw: match[0], type: 'usd_brl' });
    }
  }

  // Soja CEPEA: R$ XXX,XX/saca
  const soyPattern = /[Ss]oja.*?R\$\s*([\d.,]+)\/saca/gi;
  while ((match = soyPattern.exec(text)) !== null) {
    const value = parseFloat(match[1].replace('.', '').replace(',', '.'));
    if (!isNaN(value)) {
      prices.push({ value, raw: match[0], type: 'soy_cepea' });
    }
  }

  // Milho CEPEA: R$ XX,XX/saca
  const cornPattern = /[Mm]ilho.*?R\$\s*([\d.,]+)\/saca/gi;
  while ((match = cornPattern.exec(text)) !== null) {
    const value = parseFloat(match[1].replace('.', '').replace(',', '.'));
    if (!isNaN(value)) {
      prices.push({ value, raw: match[0], type: 'corn_cepea' });
    }
  }

  // Boi gordo: R$ XXX,XX/@
  const cattlePattern = /[Bb]oi.*?R\$\s*([\d.,]+)\/@/gi;
  while ((match = cattlePattern.exec(text)) !== null) {
    const value = parseFloat(match[1].replace('.', '').replace(',', '.'));
    if (!isNaN(value)) {
      prices.push({ value, raw: match[0], type: 'cattle' });
    }
  }

  return prices;
}

/**
 * Check for weekend market data references
 */
function checkWeekendMarketReferences(text: string, brazilNow: Date): string[] {
  const warnings: string[] = [];

  if (!isWeekend(brazilNow)) {
    return warnings;
  }

  const marketTerms = [
    'fechamento de hoje',
    'cotação de hoje',
    'hoje o IBOVESPA',
    'hoje a bolsa',
    'mercado hoje',
    'S&P 500 hoje',
    'Nasdaq hoje',
  ];

  for (const term of marketTerms) {
    if (text.toLowerCase().includes(term.toLowerCase())) {
      warnings.push(
        `"${term}" mencionado em fim de semana - mercados estão fechados. ` +
        `Use dados de ${getLastBusinessDay(brazilNow).toLocaleDateString('pt-BR')}.`
      );
    }
  }

  return warnings;
}

/**
 * Validate briefing data for common hallucination patterns
 *
 * @param briefingText - The generated briefing text
 * @returns ValidationResult with errors, warnings, and suggestions
 */
export function validateBriefingData(briefingText: string): ValidationResult {
  const brazilNow = getBrazilTime();
  const errors: string[] = [];
  const warnings: string[] = [];
  const corrections: Record<string, string> = {};
  const stats = {
    futureDatesFound: 0,
    weekendMarketReferences: 0,
    pricesOutOfRange: 0,
    missingDates: 0,
  };

  // 1. Check for future dates
  const dates = extractDates(briefingText);
  for (const dateStr of dates) {
    if (isFutureDate(dateStr, brazilNow)) {
      stats.futureDatesFound++;
      errors.push(
        `Data futura detectada: ${dateStr} - Hoje é ${brazilNow.toLocaleDateString('pt-BR')}. ` +
        `Dados do futuro são impossíveis.`
      );
      corrections[dateStr] = getLastBusinessDay(brazilNow).toLocaleDateString('pt-BR');
    }
  }

  // 2. Check for weekend market references
  const weekendWarnings = checkWeekendMarketReferences(briefingText, brazilNow);
  stats.weekendMarketReferences = weekendWarnings.length;
  warnings.push(...weekendWarnings);

  // 3. Check price sanity
  const prices = extractPrices(briefingText);
  for (const price of prices) {
    const range = EXPECTED_PRICE_RANGES[price.type as keyof typeof EXPECTED_PRICE_RANGES];
    if (range) {
      if (price.value < range.min || price.value > range.max) {
        stats.pricesOutOfRange++;
        warnings.push(
          `${range.name}: ${price.value} ${range.unit} está fora da faixa esperada ` +
          `(${range.min} - ${range.max} ${range.unit}). Verifique a fonte.`
        );
      }
    }
  }

  // 4. Check for financial data without dates
  const financialTerms = ['CEPEA', 'IBOVESPA', 'Selic', 'IPCA', 'ICE KC'];
  for (const term of financialTerms) {
    const termRegex = new RegExp(`${term}[^\\n]*`, 'gi');
    const matches = briefingText.match(termRegex) || [];

    for (const match of matches) {
      // Check if this line has a date
      if (!/\d{1,2}\/\d{1,2}\/\d{4}/.test(match)) {
        // Check if it has "Fonte:" which suggests it's a data line
        if (/R\$|pontos|%/.test(match) && !/Fonte:|fonte:|não disponível/i.test(match)) {
          stats.missingDates++;
          warnings.push(
            `Dado financeiro sem data de referência: "${match.slice(0, 80)}...". ` +
            `Inclua a data do dado para transparência.`
          );
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    corrections,
    stats,
  };
}

/**
 * Apply corrections to briefing text
 * Replaces invalid dates with corrected versions
 *
 * @param briefingText - Original briefing text
 * @param corrections - Map of original values to corrected values
 * @returns Corrected briefing text
 */
export function applyCorrections(
  briefingText: string,
  corrections: Record<string, string>
): string {
  let correctedText = briefingText;

  for (const [original, corrected] of Object.entries(corrections)) {
    correctedText = correctedText.split(original).join(corrected);
  }

  return correctedText;
}

/**
 * Generate a validation report for logging/debugging
 *
 * @param result - ValidationResult from validateBriefingData
 * @returns Formatted report string
 */
export function generateValidationReport(result: ValidationResult): string {
  const lines: string[] = [
    '═══════════════════════════════════════════════════════════════',
    '                    RELATÓRIO DE VALIDAÇÃO',
    '═══════════════════════════════════════════════════════════════',
    '',
    `Status: ${result.valid ? '✅ VÁLIDO' : '❌ INVÁLIDO'}`,
    '',
    `Estatísticas:`,
    `  - Datas futuras encontradas: ${result.stats.futureDatesFound}`,
    `  - Referências a mercados em fim de semana: ${result.stats.weekendMarketReferences}`,
    `  - Preços fora da faixa: ${result.stats.pricesOutOfRange}`,
    `  - Dados sem data de referência: ${result.stats.missingDates}`,
    '',
  ];

  if (result.errors.length > 0) {
    lines.push('ERROS (impedem validação):');
    for (const error of result.errors) {
      lines.push(`  ❌ ${error}`);
    }
    lines.push('');
  }

  if (result.warnings.length > 0) {
    lines.push('AVISOS (requerem atenção):');
    for (const warning of result.warnings) {
      lines.push(`  ⚠️ ${warning}`);
    }
    lines.push('');
  }

  if (Object.keys(result.corrections).length > 0) {
    lines.push('CORREÇÕES SUGERIDAS:');
    for (const [original, corrected] of Object.entries(result.corrections)) {
      lines.push(`  ${original} → ${corrected}`);
    }
    lines.push('');
  }

  lines.push('═══════════════════════════════════════════════════════════════');

  return lines.join('\n');
}
