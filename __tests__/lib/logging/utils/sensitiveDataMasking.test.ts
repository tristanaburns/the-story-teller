/**
 * Tests for sensitive data masking utilities
 * This file contains tests for sensitive data masking including:
 * - Pattern-based detection of sensitive fields
 * - Masking of credentials, emails, and personal information
 * - Recursive object scanning
 * - Custom masking functions
 */

import { maskSensitiveData, configMasking } from '@/lib/logging/utils/sensitiveDataMasking';

describe('Sensitive Data Masking', () => {
  beforeEach(() => {
    // Reset masking configuration to defaults before each test
    configMasking({
      enabled: true,
      maskChar: '*',
      includeDefaults: true,
      preserveLength: true,
      customPatterns: [],
    });
  });
  
  describe('Basic Field Masking', () => {
    test('should mask password fields', () => {
      const data = {
        username: 'testuser',
        password: 'secretpassword',
        confirmPassword: 'secretpassword',
        userPassword: 'anotherpassword',
      };
      
      const masked = maskSensitiveData(data);
      
      expect(masked.username).toBe('testuser');
      expect(masked.password).not.toBe('secretpassword');
      expect(masked.password).toBe('**************');
      expect(masked.confirmPassword).toBe('**************');
      expect(masked.userPassword).toBe('***************');
    });
    
    test('should mask token and key fields', () => {
      const data = {
        apiKey: 'sk_test_123456789abcdef',
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
        refreshToken: 'abc123def456ghi789',
        secretKey: 'very-secret-key-value',
      };
      
      const masked = maskSensitiveData(data);
      
      expect(masked.apiKey).not.toBe('sk_test_123456789abcdef');
      expect(masked.token).not.toBe('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
      expect(masked.refreshToken).not.toBe('abc123def456ghi789');
      expect(masked.secretKey).not.toBe('very-secret-key-value');
    });
    
    test('should mask personal identifiable information', () => {
      const data = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '555-123-4567',
        ssn: '123-45-6789',
        creditCard: '4111111111111111',
      };
      
      const masked = maskSensitiveData(data);
      
      expect(masked.name).toBe('John Doe'); // Names aren't masked by default
      expect(masked.email).not.toBe('john.doe@example.com');
      expect(masked.email).toMatch(/^[^@]*@example\.com$/);
      expect(masked.phone).not.toBe('555-123-4567');
      expect(masked.ssn).not.toBe('123-45-6789');
      expect(masked.creditCard).not.toBe('4111111111111111');
    });
    
    test('should handle various data types', () => {
      const data = {
        string: 'regular string',
        password: 'secret',
        number: 12345,
        boolean: true,
        null: null,
        undefined: undefined,
      };
      
      const masked = maskSensitiveData(data);
      
      expect(masked.string).toBe('regular string');
      expect(masked.password).toBe('******');
      expect(masked.number).toBe(12345);
      expect(masked.boolean).toBe(true);
      expect(masked.null).toBe(null);
      expect(masked.undefined).toBe(undefined);
    });
  });
  
  describe('Nested Object Handling', () => {
    test('should mask sensitive data in nested objects', () => {
      const data = {
        user: {
          username: 'testuser',
          credentials: {
            password: 'secretpassword',
            apiKey: 'sk_test_123456789abcdef',
          },
          contact: {
            email: 'testuser@example.com',
            phone: '555-123-4567',
          },
        },
      };
      
      const masked = maskSensitiveData(data);
      
      expect(masked.user.username).toBe('testuser');
      expect(masked.user.credentials.password).not.toBe('secretpassword');
      expect(masked.user.credentials.apiKey).not.toBe('sk_test_123456789abcdef');
      expect(masked.user.contact.email).not.toBe('testuser@example.com');
      expect(masked.user.contact.phone).not.toBe('555-123-4567');
    });
    
    test('should mask sensitive data in arrays', () => {
      const data = {
        users: [
          { username: 'user1', password: 'pass1' },
          { username: 'user2', password: 'pass2' },
        ],
        tokens: ['token1', 'token2'],
        mixed: ['normal', { secret: 'hidden' }],
      };
      
      const masked = maskSensitiveData(data);
      
      expect(masked.users[0].username).toBe('user1');
      expect(masked.users[0].password).not.toBe('pass1');
      expect(masked.users[1].username).toBe('user2');
      expect(masked.users[1].password).not.toBe('pass2');
      
      // By default, arrays of primitives aren't masked unless the key is sensitive
      expect(masked.tokens).toEqual(['token1', 'token2']);
      expect(masked.mixed[0]).toBe('normal');
      expect(masked.mixed[1].secret).not.toBe('hidden');
    });
    
    test('should handle deeply nested structures', () => {
      const data = {
        level1: {
          level2: {
            level3: {
              level4: {
                password: 'verysecret',
              },
            },
          },
        },
      };
      
      const masked = maskSensitiveData(data);
      
      expect(masked.level1.level2.level3.level4.password).not.toBe('verysecret');
      expect(masked.level1.level2.level3.level4.password).toBe('*********');
    });
  });
  
  describe('URL Credential Masking', () => {
    test('should mask credentials in URLs', () => {
      const data = {
        databaseUrl: 'mongodb://user:password@mongodb.example.com:27017/mydb',
        apiEndpoint: 'https://username:secrettoken@api.example.com/v1',
        website: 'https://example.com/public', // No credentials
      };
      
      const masked = maskSensitiveData(data);
      
      expect(masked.databaseUrl).toBe('mongodb://user:********@mongodb.example.com:27017/mydb');
      expect(masked.apiEndpoint).toBe('https://username:***********@api.example.com/v1');
      expect(masked.website).toBe('https://example.com/public');
    });
  });
  
  describe('Custom Masking Configuration', () => {
    test('should respect masking configuration options', () => {
      // Configure with different mask character and disable length preservation
      configMasking({
        enabled: true,
        maskChar: 'X',
        includeDefaults: true,
        preserveLength: false,
      });
      
      const data = {
        password: 'secret',
        apiKey: 'longsecretkey',
      };
      
      const masked = maskSensitiveData(data);
      
      expect(masked.password).toBe('XXX');
      expect(masked.apiKey).toBe('XXX');
    });
    
    test('should allow disabling masking', () => {
      // Disable masking entirely
      configMasking({
        enabled: false,
      });
      
      const data = {
        username: 'testuser',
        password: 'secretpassword',
      };
      
      const masked = maskSensitiveData(data);
      
      // Should return data unchanged
      expect(masked).toEqual(data);
      expect(masked.password).toBe('secretpassword');
    });
    
    test('should support custom patterns', () => {
      // Add custom patterns for masking
      configMasking({
        enabled: true,
        includeDefaults: true,
        customPatterns: [
          { key: /^user_?id$/i, replace: true }, // Mask any field like userId or user_id
          { key: 'projectName', replace: true }, // Mask specific field
        ],
      });
      
      const data = {
        userId: '12345',
        user_id: 'abcde',
        projectName: 'Secret Project X',
        normal: 'Not masked',
      };
      
      const masked = maskSensitiveData(data);
      
      expect(masked.userId).not.toBe('12345');
      expect(masked.user_id).not.toBe('abcde');
      expect(masked.projectName).not.toBe('Secret Project X');
      expect(masked.normal).toBe('Not masked');
    });
    
    test('should support custom masking functions', () => {
      // Add custom masking function for specialized fields
      configMasking({
        enabled: true,
        includeDefaults: true,
        customPatterns: [
          {
            key: 'phoneNumber',
            replace: (value) => {
              if (typeof value === 'string') {
                // Mask middle digits but keep first 3 and last 2
                return value.replace(/^(\d{3}).*(\d{2})$/, '$1-XXXX-$2');
              }
              return value;
            },
          },
          {
            key: 'email',
            replace: (value) => {
              if (typeof value === 'string' && value.includes('@')) {
                // Keep domain but mask username
                const [username, domain] = value.split('@');
                return `****@${domain}`;
              }
              return value;
            },
          },
        ],
      });
      
      const data = {
        phoneNumber: '5551234567',
        email: 'user@example.com',
      };
      
      const masked = maskSensitiveData(data);
      
      expect(masked.phoneNumber).toBe('555-XXXX-67');
      expect(masked.email).toBe('****@example.com');
    });
  });
  
  describe('Edge Cases', () => {
    test('should handle empty objects and arrays', () => {
      const data = {
        emptyObject: {},
        emptyArray: [],
        emptyString: '',
      };
      
      const masked = maskSensitiveData(data);
      
      expect(masked.emptyObject).toEqual({});
      expect(masked.emptyArray).toEqual([]);
      expect(masked.emptyString).toBe('');
    });
    
    test('should handle circular references', () => {
      const circular: any = {
        name: 'circular',
        password: 'secret',
      };
      
      circular.self = circular;
      circular.nested = {
        parent: circular,
        secret: 'nested-secret',
      };
      
      // Should not cause stack overflow
      const masked = maskSensitiveData(circular);
      
      expect(masked.password).not.toBe('secret');
      expect(masked.nested.secret).not.toBe('nested-secret');
      expect(masked.self).toBe('[Circular]');
      expect(masked.nested.parent).toBe('[Circular]');
    });
    
    test('should handle non-object inputs', () => {
      expect(maskSensitiveData('just a string')).toBe('just a string');
      expect(maskSensitiveData(123)).toBe(123);
      expect(maskSensitiveData(null)).toBe(null);
      expect(maskSensitiveData(undefined)).toBe(undefined);
      expect(maskSensitiveData(true)).toBe(true);
    });
  });
});
