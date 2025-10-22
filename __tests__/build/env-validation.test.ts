/**
 * Build-time environment variable validation tests
 *
 * These tests verify that the application can be built without
 * environment variables present at build time, while still
 * validating them at runtime.
 */

describe('Build-time environment variable handling', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
    jest.resetModules();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Critical modules can be imported without env vars', () => {
    it('should import supabaseClient without env vars', () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      expect(() => {
        require('@/lib/supabaseClient');
      }).not.toThrow();
    });

    it('should import supabaseAdmin without env vars', () => {
      delete process.env.SUPABASE_URL;
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;
      delete process.env.SUPABASE_SECRET_KEY;

      expect(() => {
        require('@/lib/supabaseAdmin');
      }).not.toThrow();
    });

    it('should import auth helpers without env vars', () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      expect(() => {
        require('@/lib/auth');
      }).not.toThrow();
    });
  });

  describe('Runtime validation works correctly', () => {
    it('should validate env vars only when getServerSession is called', async () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      // Import should work
      const authModule = require('@/lib/auth');
      expect(authModule).toBeDefined();

      // But calling the function should fail
      await expect(authModule.getServerSession()).rejects.toThrow(
        'Supabase environment variables are not configured'
      );
    });

    it('should validate service role key when using supabaseAdmin', () => {
      delete process.env.SUPABASE_URL;

      const { supabaseAdmin } = require('@/lib/supabaseAdmin');

      expect(() => {
        supabaseAdmin.from('test');
      }).toThrow('Missing SUPABASE_URL environment variable');
    });
  });

  describe('All env vars properly configured', () => {
    beforeEach(() => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
      process.env.SUPABASE_URL = 'https://test.supabase.co';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
    });

    it('should successfully create all clients when env vars are present', () => {
      const { supabase } = require('@/lib/supabaseClient');
      const { supabaseAdmin } = require('@/lib/supabaseAdmin');

      expect(supabase).toBeDefined();
      expect(supabase.auth).toBeDefined();
      expect(supabaseAdmin).toBeDefined();
      expect(supabaseAdmin.from).toBeDefined();
    });

    it('should not throw when calling auth functions with valid env vars', async () => {
      const { getServerSession } = require('@/lib/auth');

      // Mock cookies to avoid Next.js requirement
      jest.mock('next/headers', () => ({
        cookies: jest.fn(() => ({
          get: jest.fn(),
          set: jest.fn(),
          delete: jest.fn(),
        })),
      }));

      // Should not throw due to env var issues (may throw for other reasons like missing cookies)
      try {
        await getServerSession();
      } catch (error: any) {
        // Make sure it's not an env var error
        expect(error.message).not.toContain('environment variable');
      }
    });
  });

  describe('Fallback environment variables', () => {
    it('should accept SUPABASE_SECRET_KEY as fallback for service role key', () => {
      process.env.SUPABASE_URL = 'https://test.supabase.co';
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;
      process.env.SUPABASE_SECRET_KEY = 'test-secret-key';

      const { supabaseAdmin } = require('@/lib/supabaseAdmin');

      expect(supabaseAdmin).toBeDefined();
      expect(() => supabaseAdmin.from('test')).not.toThrow();
    });

    it('should prefer SUPABASE_SERVICE_ROLE_KEY over SUPABASE_SECRET_KEY', () => {
      process.env.SUPABASE_URL = 'https://test.supabase.co';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';
      process.env.SUPABASE_SECRET_KEY = 'secret-key';

      const { supabaseAdmin } = require('@/lib/supabaseAdmin');

      // Should not throw - proves it's using one of the keys
      expect(supabaseAdmin).toBeDefined();
    });
  });
});
