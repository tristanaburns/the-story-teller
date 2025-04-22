/**
 * Sensitive Data Masking Tests
 * 
 * Tests for the sensitive data masking utility functions
 * that ensure proper redaction of sensitive information in logs
 */

import {
  maskSensitiveData,
  configureSensitiveDataMasking,
  addSensitivePatterns,
  isSensitiveKey
} from '../../../../lib/logging/utils';

describe('Sensitive Data Masking', () => {
  beforeEach(() => {
    // Reset configuration before each test
    configureSensitiveDataMasking({
      patterns: [/password/i, /secret/i, /token/i, /key/i],
      replacement: '[REDACTED]',
      maskURLCredentials: true,
      maskIPAddressOctets: 0,
      maskEmailDomains: false
    });
  });
  
  it('should mask sensitive fields in objects', () => {
    const testData = {
      username: 'testuser',
      password: 'supersecret',
      apiKey: '12345abcde',
      authToken: 'Bearer xyz123',
      normalField: 'This is normal data',
      nested: {
        secretKey: 'hidden-value',
        visibleValue: 'visible'
      }
    };
    
    const masked = maskSensitiveData(testData);
    
    // Check that sensitive fields are masked
    expect(masked.password).toBe('[REDACTED]');
    expect(masked.apiKey).toBe('[REDACTED]');
    expect(masked.authToken).toBe('[REDACTED]');
    expect(masked.nested.secretKey).toBe('[REDACTED]');
    
    // Check that normal fields are not masked
    expect(masked.username).toBe('testuser');
    expect(masked.normalField).toBe('This is normal data');
    expect(masked.nested.visibleValue).toBe('visible');
  });
  
  it('should handle arrays and nested objects', () => {
    const testData = {
      users: [
        { id: 1, username: 'user1', password: 'pass1' },
        { id: 2, username: 'user2', password: 'pass2' }
      ],
      settings: {
        apiKeys: ['key1', 'key2'],
        options: {
          secretOption: 'hidden',
          normalOption: 'visible'
        }
      }
    };
    
    const masked = maskSensitiveData(testData);
    
    // Check array elements
    expect(masked.users[0].password).toBe('[REDACTED]');
    expect(masked.users[1].password).toBe('[REDACTED]');
    expect(masked.users[0].username).toBe('user1');
    expect(masked.users[1].username).toBe('user2');
    
    // Check nested objects
    expect(masked.settings.apiKeys).toEqual(['[REDACTED]', '[REDACTED]']);
    expect(masked.settings.options.secretOption).toBe('[REDACTED]');
    expect(masked.settings.options.normalOption).toBe('visible');
  });
  
  it('should mask credentials in URLs', () => {
    const testData = {
      databaseUrl: 'mongodb://username:password@localhost:27017/database',
      apiUrl: 'https://api:secret@example.com/v1',
      normalUrl: 'https://example.com/api/users'
    };
    
    const masked = maskSensitiveData(testData);
    
    // Check URL masking
    expect(masked.databaseUrl).toBe('mongodb://[REDACTED]:[REDACTED]@localhost:27017/database');
    expect(masked.apiUrl).toBe('https://[REDACTED]:[REDACTED]@example.com/v1');
    expect(masked.normalUrl).toBe('https://example.com/api/users');
  });
  
  it('should mask email addresses when configured', () => {
    // Configure email masking
    configureSensitiveDataMasking({
      maskEmailDomains: true,
      preservePartialEmail: true
    });
    
    const testData = {
      userEmail: 'user@example.com',
      adminEmail: 'admin@company.org',
      shortEmail: 'a@b.c'
    };
    
    const masked = maskSensitiveData(testData);
    
    // Check email masking
    expect(masked.userEmail).toBe('us***@[REDACTED]');
    expect(masked.adminEmail).toBe('ad***@[REDACTED]');
    expect(masked.shortEmail).toBe('[REDACTED]@[REDACTED]');
  });
  
  it('should mask IP addresses when configured', () => {
    // Configure IP masking
    configureSensitiveDataMasking({
      maskIPAddressOctets: 2
    });
    
    const testData = {
      serverIp: '192.168.1.100',
      clientIp: '10.0.0.1',
      notIp: '300.400.500.600' // Invalid IP format
    };
    
    const masked = maskSensitiveData(testData);
    
    // Check IP masking
    expect(masked.serverIp).toBe('192.168.***.***');
    expect(masked.clientIp).toBe('10.0.***.***');
    expect(masked.notIp).toBe('300.400.500.600'); // Not recognized as IP, no masking
  });
  
  it('should handle custom masking functions', () => {
    // Configure with custom masking function
    configureSensitiveDataMasking({
      customMaskingFunctions: [
        (key, value) => {
          // Mask credit card numbers
          if (typeof value === 'string' && /^\d{4}-\d{4}-\d{4}-\d{4}$/.test(value)) {
            return value.replace(/^\d{4}-\d{4}-\d{4}-/, '****-****-****-');
          }
          // Mask phone numbers
          if (key.includes('phone') && typeof value === 'string') {
            return '***-***-' + value.slice(-4);
          }
          return undefined; // Return undefined to use default masking
        }
      ]
    });
    
    const testData = {
      creditCard: '1234-5678-9012-3456',
      phoneNumber: '123-456-7890',
      userPhone: '555-123-4567'
    };
    
    const masked = maskSensitiveData(testData);
    
    // Check custom masking
    expect(masked.creditCard).toBe('****-****-****-3456');
    expect(masked.phoneNumber).toBe('123-456-7890'); // Not masked, key doesn't include 'phone'
    expect(masked.userPhone).toBe('***-***-4567');
  });
  
  it('should handle primitive types correctly', () => {
    // Test with different types
    expect(maskSensitiveData('simple string')).toBe('simple string');
    expect(maskSensitiveData(123)).toBe(123);
    expect(maskSensitiveData(true)).toBe(true);
    expect(maskSensitiveData(null)).toBe(null);
    expect(maskSensitiveData(undefined)).toBe(undefined);
  });
  
  it('should detect sensitive keys correctly', () => {
    expect(isSensitiveKey('password')).toBe(true);
    expect(isSensitiveKey('userPassword')).toBe(true);
    expect(isSensitiveKey('apiKey')).toBe(true);
    expect(isSensitiveKey('user_secret')).toBe(true);
    expect(isSensitiveKey('accessToken')).toBe(true);
    
    expect(isSensitiveKey('username')).toBe(false);
    expect(isSensitiveKey('email')).toBe(false);
    expect(isSensitiveKey('description')).toBe(false);
  });
  
  it('should allow adding custom patterns', () => {
    // Add custom patterns
    addSensitivePatterns([/ssn/i, /social[_-]?security/i]);
    
    const testData = {
      name: 'Test User',
      ssn: '123-45-6789',
      socialSecurity: '987-65-4321'
    };
    
    const masked = maskSensitiveData(testData);
    
    // Check masking with custom patterns
    expect(masked.name).toBe('Test User');
    expect(masked.ssn).toBe('[REDACTED]');
    expect(masked.socialSecurity).toBe('[REDACTED]');
  });
});
