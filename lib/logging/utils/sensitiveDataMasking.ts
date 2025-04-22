/**
 * sensitiveDataMasking.ts
 * 
 * Utilities for masking sensitive data in logs
 * Implements consistent redaction patterns across all logging components
 */

import { createLogger } from '../logger';

// Create logger instance
const logger = createLogger('SensitiveDataMasking');

/**
 * Default patterns to match sensitive data
 */
const DEFAULT_SENSITIVE_PATTERNS: RegExp[] = [
  /password/i,
  /secret/i,
  /token/i,
  /apikey/i,
  /api[_-]?key/i,
  /auth/i,
  /credential/i,
  /private/i,
  /ssn/i,
  /social[_-]?security/i,
  /credit[_-]?card/i,
  /card[_-]?number/i,
  /cvv/i,
  /cvc/i,
  /pin/i,
  /passphrase/i,
  /session/i,
  /cookie/i
];

/**
 * Sensitive data masking options
 */
export interface SensitiveDataMaskingOptions {
  patterns?: RegExp[];
  replacement?: string;
  maskURLCredentials?: boolean;
  maskIPAddressOctets?: number;
  maskEmailDomains?: boolean;
  preservePartialEmail?: boolean;
  customMaskingFunctions?: Array<(key: string, value: any) => any | undefined>;
}

/**
 * Default options for sensitive data masking
 */
const DEFAULT_OPTIONS: SensitiveDataMaskingOptions = {
  patterns: DEFAULT_SENSITIVE_PATTERNS,
  replacement: '[REDACTED]',
  maskURLCredentials: true,
  maskIPAddressOctets: 0, // 0 means don't mask
  maskEmailDomains: false,
  preservePartialEmail: true,
  customMaskingFunctions: []
};

/**
 * Current options for sensitive data masking
 */
let options: SensitiveDataMaskingOptions = { ...DEFAULT_OPTIONS };

/**
 * Configure sensitive data masking options
 */
export function configureSensitiveDataMasking(newOptions: Partial<SensitiveDataMaskingOptions>): void {
  options = { ...options, ...newOptions };
  logger.info('Sensitive data masking configuration updated', { 
    patternCount: options.patterns?.length || 0,
    maskURLs: options.maskURLCredentials,
    maskIPs: options.maskIPAddressOctets,
    maskEmails: options.maskEmailDomains,
    customFunctionsCount: options.customMaskingFunctions?.length || 0
  });
}

/**
 * Add custom patterns to the existing set of sensitive patterns
 */
export function addSensitivePatterns(patterns: RegExp[]): void {
  options.patterns = [...(options.patterns || []), ...patterns];
  logger.info('Added sensitive data patterns', { patternCount: patterns.length });
}

/**
 * Check if a key matches any sensitive pattern
 */
export function isSensitiveKey(key: string): boolean {
  return (options.patterns || []).some(pattern => pattern.test(key));
}

/**
 * Mask sensitive values within an object
 */
export function maskSensitiveData<T>(data: T): T {
  if (data === null || data === undefined) {
    return data;
  }
  
  // Handle primitive types
  if (typeof data !== 'object') {
    return data;
  }
  
  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(item => maskSensitiveData(item)) as unknown as T;
  }
  
  // Handle objects
  const masked = { ...data };
  
  for (const key in masked) {
    let value = masked[key];
    let isMasked = false;
    
    // Check for sensitive key patterns
    if (isSensitiveKey(key)) {
      masked[key] = options.replacement;
      isMasked = true;
    } 
    // Special case for URLs with credentials
    else if (options.maskURLCredentials && typeof value === 'string' && isURLWithCredentials(value)) {
      masked[key] = maskURLCredentials(value);
      isMasked = true;
    }
    // Special case for email addresses
    else if (options.maskEmailDomains && typeof value === 'string' && isEmailAddress(value)) {
      masked[key] = maskEmail(value);
      isMasked = true;
    }
    // Special case for IP addresses
    else if (options.maskIPAddressOctets && options.maskIPAddressOctets > 0 && typeof value === 'string' && isIPAddress(value)) {
      masked[key] = maskIPAddress(value, options.maskIPAddressOctets);
      isMasked = true;
    }
    // Apply custom masking functions
    else if (options.customMaskingFunctions && options.customMaskingFunctions.length > 0) {
      for (const maskFn of options.customMaskingFunctions) {
        const result = maskFn(key, value);
        if (result !== undefined) {
          masked[key] = result;
          isMasked = true;
          break;
        }
      }
    }
    
    // Recursively mask nested objects if not already masked
    if (!isMasked && typeof value === 'object' && value !== null) {
      masked[key] = maskSensitiveData(value);
    }
  }
  
  return masked as T;
}

/**
 * Check if a string appears to be a URL with credentials
 */
function isURLWithCredentials(value: string): boolean {
  try {
    const url = new URL(value);
    return !!(url.username || url.password);
  } catch {
    return false;
  }
}

/**
 * Mask credentials in a URL string
 */
function maskURLCredentials(urlString: string): string {
  try {
    const url = new URL(urlString);
    
    if (url.username || url.password) {
      // Replace username and password with redacted values but keep the rest of the URL
      url.username = url.username ? options.replacement || '[REDACTED]' : '';
      url.password = url.password ? options.replacement || '[REDACTED]' : '';
    }
    
    return url.toString();
  } catch {
    // If URL parsing fails, return the original string
    return urlString;
  }
}

/**
 * Check if a string appears to be an email address
 */
function isEmailAddress(value: string): boolean {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value);
}

/**
 * Mask an email address
 */
function maskEmail(email: string): string {
  if (options.preservePartialEmail) {
    // Keep part of the local part visible for identification
    const [local, domain] = email.split('@');
    
    if (local.length <= 2) {
      // For very short local parts, mask everything
      return `${options.replacement}@${options.replacement}`;
    }
    
    // Keep first 2 characters and mask the rest
    const visiblePart = local.substring(0, 2);
    const maskedPart = '*'.repeat(Math.min(local.length - 2, 5));
    
    return `${visiblePart}${maskedPart}@${options.replacement}`;
  } else {
    // Mask the entire email
    return options.replacement || '[REDACTED]';
  }
}

/**
 * Check if a string appears to be an IP address
 */
function isIPAddress(value: string): boolean {
  // Simple regex for IPv4 addresses
  return /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.test(value);
}

/**
 * Mask an IP address by replacing octets with asterisks
 */
function maskIPAddress(ip: string, octetsToMask: number): string {
  if (octetsToMask <= 0) {
    return ip;
  }
  
  const octets = ip.split('.');
  
  // Ensure octetsToMask is not more than 4
  const actualOctetsToMask = Math.min(octetsToMask, 4);
  
  // Replace the last N octets with asterisks
  for (let i = 4 - actualOctetsToMask; i < 4; i++) {
    octets[i] = '***';
  }
  
  return octets.join('.');
}

/**
 * Export the maskSensitiveData function as the default export
 */
export default maskSensitiveData;
