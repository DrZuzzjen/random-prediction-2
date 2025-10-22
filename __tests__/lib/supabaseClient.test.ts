/**
 * Tests for supabaseClient lazy initialization
 *
 * These tests verify that:
 * 1. The module can be imported without environment variables (build-time safety)
 * 2. Environment variables are only checked when the client is actually used (runtime)
 * 3. The singleton pattern works correctly (same instance reused)
 */

describe('supabaseClient', () => {
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
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      // This should NOT throw an error at import time
      expect(() => {
        require('@/lib/supabaseClient');
      }).not.toThrow();
    });

    it('should allow importing the supabase export without errors', () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      const { supabase } = require('@/lib/supabaseClient');

      // The proxy object should exist
      expect(supabase).toBeDefined();
    });
  });

  describe('Runtime validation', () => {
    it('should throw error when trying to use client without NEXT_PUBLIC_SUPABASE_URL', () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key';

      const { supabase } = require('@/lib/supabaseClient');

      // Should throw when actually trying to use the client
      expect(() => {
        supabase.auth.getSession();
      }).toThrow('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
    });

    it('should throw error when trying to use client without NEXT_PUBLIC_SUPABASE_ANON_KEY', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      const { supabase } = require('@/lib/supabaseClient');

      expect(() => {
        supabase.auth.getSession();
      }).toThrow('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
    });

    it('should create client successfully when environment variables are present', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

      const { supabase } = require('@/lib/supabaseClient');

      // Should not throw and should have auth property
      expect(supabase).toBeDefined();
      expect(supabase.auth).toBeDefined();
    });
  });

  describe('Singleton pattern', () => {
    it('should return the same instance on multiple accesses', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

      const { supabase } = require('@/lib/supabaseClient');

      // Access the client multiple times
      const auth1 = supabase.auth;
      const auth2 = supabase.auth;

      // Should be the same instance
      expect(auth1).toBe(auth2);
    });
  });
});
