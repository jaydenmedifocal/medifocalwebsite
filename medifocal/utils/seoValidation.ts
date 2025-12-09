/**
 * SEO Validation Utility
 * Based on SEOnaut's SEO best practices
 * Validates meta tags, titles, descriptions, and other SEO elements
 */

export interface SEOValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface SEOData {
  title?: string;
  description?: string;
  url?: string;
  image?: string;
  canonical?: string;
}

/**
 * Validate title tag
 * Best practices from SEOnaut:
 * - Not empty
 * - Between 20-60 characters
 * - Only one title tag per page
 */
export function validateTitle(title?: string): { isValid: boolean; error?: string } {
  if (!title || title.trim() === '') {
    return { isValid: false, error: 'Title is empty or missing' };
  }
  
  if (title.length < 20) {
    return { isValid: false, error: `Title is too short (${title.length} chars). Recommended: 20-60 characters` };
  }
  
  if (title.length > 60) {
    return { isValid: false, error: `Title is too long (${title.length} chars). Recommended: 20-60 characters. Search engines may truncate.` };
  }
  
  return { isValid: true };
}

/**
 * Validate meta description
 * Best practices from SEOnaut:
 * - Not empty
 * - Between 80-160 characters
 * - Only one description tag per page
 */
export function validateDescription(description?: string): { isValid: boolean; error?: string; warning?: string } {
  if (!description || description.trim() === '') {
    return { isValid: false, error: 'Meta description is empty or missing' };
  }
  
  if (description.length < 80) {
    return { isValid: false, error: `Meta description is too short (${description.length} chars). Recommended: 80-160 characters` };
  }
  
  if (description.length > 160) {
    return { 
      isValid: true, 
      warning: `Meta description is too long (${description.length} chars). Recommended: 80-160 characters. Search engines may truncate.` 
    };
  }
  
  return { isValid: true };
}

/**
 * Validate canonical URL
 * Best practices from SEOnaut:
 * - Should be absolute URL
 * - Should not point to redirects, errors, or non-indexable pages
 * - Should be self-referential (point to itself) or point to the canonical version
 */
export function validateCanonical(canonical?: string, currentUrl?: string): { isValid: boolean; error?: string; warning?: string } {
  if (!canonical) {
    return { isValid: true, warning: 'Canonical URL is missing. Consider adding one to avoid duplicate content issues.' };
  }
  
  if (!canonical.startsWith('http://') && !canonical.startsWith('https://')) {
    return { isValid: false, error: 'Canonical URL should be absolute (start with http:// or https://)' };
  }
  
  // If current URL is provided, check if canonical matches
  if (currentUrl && canonical !== currentUrl) {
    // This is okay if canonical points to the preferred version
    return { isValid: true, warning: `Canonical URL (${canonical}) differs from current URL (${currentUrl}). Ensure this is intentional.` };
  }
  
  return { isValid: true };
}

/**
 * Validate URL structure
 * Best practices:
 * - Should be lowercase
 * - Should use hyphens, not underscores
 * - Should not have trailing slashes (except root)
 * - Should be descriptive
 */
export function validateURL(url?: string): { isValid: boolean; error?: string; warning?: string } {
  if (!url) {
    return { isValid: false, error: 'URL is missing' };
  }
  
  const warnings: string[] = [];
  
  // Check for uppercase
  if (url !== url.toLowerCase()) {
    warnings.push('URL contains uppercase letters. Consider using lowercase for consistency.');
  }
  
  // Check for underscores
  if (url.includes('_')) {
    warnings.push('URL contains underscores. Consider using hyphens instead.');
  }
  
  // Check for multiple slashes
  if (url.includes('//') && !url.includes('://')) {
    warnings.push('URL contains multiple consecutive slashes.');
  }
  
  // Check for query parameters (not necessarily bad, but worth noting)
  if (url.includes('?') && !url.includes('utm_')) {
    // Query params are okay, but check if they're necessary
  }
  
  return {
    isValid: true,
    warning: warnings.length > 0 ? warnings.join(' ') : undefined
  };
}

/**
 * Validate image for Open Graph
 * Best practices:
 * - Should be absolute URL
 * - Recommended size: 1200x630px
 * - Should be accessible
 */
export function validateImage(image?: string): { isValid: boolean; error?: string; warning?: string } {
  if (!image) {
    return { isValid: true, warning: 'Open Graph image is missing. Consider adding one for better social media sharing.' };
  }
  
  if (!image.startsWith('http://') && !image.startsWith('https://') && !image.startsWith('data:')) {
    return { isValid: false, error: 'Image URL should be absolute (start with http://, https://, or data:)' };
  }
  
  return { isValid: true };
}

/**
 * Comprehensive SEO validation
 */
export function validateSEO(data: SEOData): SEOValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Validate title
  const titleValidation = validateTitle(data.title);
  if (!titleValidation.isValid && titleValidation.error) {
    errors.push(`Title: ${titleValidation.error}`);
  }
  
  // Validate description
  const descValidation = validateDescription(data.description);
  if (!descValidation.isValid && descValidation.error) {
    errors.push(`Description: ${descValidation.error}`);
  }
  if (descValidation.warning) {
    warnings.push(`Description: ${descValidation.warning}`);
  }
  
  // Validate canonical
  const canonicalValidation = validateCanonical(data.canonical, data.url);
  if (!canonicalValidation.isValid && canonicalValidation.error) {
    errors.push(`Canonical: ${canonicalValidation.error}`);
  }
  if (canonicalValidation.warning) {
    warnings.push(`Canonical: ${canonicalValidation.warning}`);
  }
  
  // Validate URL
  const urlValidation = validateURL(data.url);
  if (!urlValidation.isValid && urlValidation.error) {
    errors.push(`URL: ${urlValidation.error}`);
  }
  if (urlValidation.warning) {
    warnings.push(`URL: ${urlValidation.warning}`);
  }
  
  // Validate image
  const imageValidation = validateImage(data.image);
  if (!imageValidation.isValid && imageValidation.error) {
    errors.push(`Image: ${imageValidation.error}`);
  }
  if (imageValidation.warning) {
    warnings.push(`Image: ${imageValidation.warning}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Get SEO recommendations based on SEOnaut best practices
 */
export function getSEORecommendations(): string[] {
  return [
    'Title tags should be 20-60 characters',
    'Meta descriptions should be 80-160 characters',
    'Use only one title tag per page',
    'Use only one meta description per page',
    'Canonical URLs should be absolute',
    'URLs should be lowercase and use hyphens',
    'Include Open Graph images (1200x630px recommended)',
    'Ensure all images have alt text',
    'Use proper heading hierarchy (h1, h2, h3)',
    'Ensure h1 tag is present and unique per page',
    'Avoid duplicate content with canonical tags',
    'Use descriptive, keyword-rich URLs',
    'Ensure mobile viewport meta tag is present',
    'Use HTTPS for all URLs',
    'Optimize page load speed',
    'Ensure proper 404 handling',
    'Use structured data (JSON-LD)',
    'Ensure proper redirects (301 for permanent, 302 for temporary)',
    'Avoid broken internal links',
    'Use descriptive anchor text for links'
  ];
}



