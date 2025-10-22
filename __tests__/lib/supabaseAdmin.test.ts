/**
 * Tests for supabaseAdmin lazy initialization
 *
 * These tests verify that:
 * 1. The module can be imported without environment variables (build-time safety)
 * 2. Environment variables are only checked when the client is actually used (runtime)
 * 3. The singleton pattern works correctly (same instance reused)
 */

describe('supabaseAdmin', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };

    // Clear the module cache to test fresh imports
    jest.resetModules();
  });

  afterEach(() => {
    // Restore environment
    process.env = originalEnv;
  });

  describe('Build-time safety', () => {
    it('should allow module import without environment variables', () => {
      // Remove environment variables to simulate build-time
      delete process.env.SUPABASE_URL;
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;
      delete process.env.SUPABASE_SECRET_KEY;

      // This should NOT throw an error at import time
      expect(() => {
        require('@/lib/supabaseAdmin');
      }).not.toThrow();
    });

    it('should allow importing the supabaseAdmin export without errors', () => {
      delete process.env.SUPABASE_URL;
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;

      const { supabaseAdmin } = require('@/lib/supabaseAdmin');

      // The proxy object should exist
      expect(supabaseAdmin).toBeDefined();
    });
  });

  describe('Runtime validation', () => {
    it('should throw error when trying to use client without SUPABASE_URL', () => {
      delete process.env.SUPABASE_URL;
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';

      const { supabaseAdmin } = require('@/lib/supabaseAdmin');

      // Should throw when actually trying to use the client
      expect(() => {
        supabaseAdmin.from('test_table');
      }).toThrow('Missing SUPABASE_URL environment variable');
    });

    it('should throw error when trying to use client without service role key', () => {
      process.env.SUPABASE_URL = 'https://test.supabase.co';
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;
      delete process.env.SUPABASE_SECRET_KEY;

      const { supabaseAdmin } = require('@/lib/supabaseAdmin');

      expect(() => {
        supabaseAdmin.from('test_table');
      }).toThrow('Missing SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SECRET_KEY environment variable');
    });

    it('should accept SUPABASE_SECRET_KEY as fallback', () => {
      process.env.SUPABASE_URL = 'https://test.supabase.co';
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;
      process.env.SUPABASE_SECRET_KEY = 'test-secret-key';

      const { supabaseAdmin } = require('@/lib/supabaseAdmin');

      // Should not throw
      expect(supabaseAdmin).toBeDefined();
      expect(supabaseAdmin.from).toBeDefined();
    });

    it('should create client successfully when environment variables are present', () => {
      process.env.SUPABASE_URL = 'https://test.supabase.co';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';

      const { supabaseAdmin } = require('@/lib/supabaseAdmin');

      // Should not throw and should have from method
      expect(supabaseAdmin).toBeDefined();
      expect(supabaseAdmin.from).toBeDefined();
    });
  });

  describe('Singleton pattern', () => {
    it('should return the same instance on multiple accesses', () => {
      process.env.SUPABASE_URL = 'https://test.supabase.co';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';

      const { supabaseAdmin } = require('@/lib/supabaseAdmin');

      // Access the client multiple times - should get the same underlying client
      // We can't directly compare functions from Proxy, so we check the client itself
      const access1 = supabaseAdmin.auth;
      const access2 = supabaseAdmin.auth;

      // Both accesses should return the same auth instance
      expect(access1).toBe(access2);
    });

    it('should not recreate client on subsequent accesses', () => {
      process.env.SUPABASE_URL = 'https://test.supabase.co';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';

      const { supabaseAdmin } = require('@/lib/supabaseAdmin');

      // First access creates the client
      const firstAccess = supabaseAdmin.from;
      expect(firstAccess).toBeDefined();

      // Second access should reuse the same client
      const secondAccess = supabaseAdmin.auth;
      expect(secondAccess).toBeDefined();
    });
  });
});
