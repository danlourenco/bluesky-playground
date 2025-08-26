/**
 * @fileoverview Unit tests for BlueskyOAuthService
 * 
 * Comprehensive test suite for OAuth authentication functionality
 * including client initialization, login flow, callback handling,
 * and session management.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { BlueskyOAuthService } from '../oauth.js';
import { getDefaultBlueskyService, resetDefaultBlueskyService } from '../index.js';
import type { OAuthError } from '../types.js';

// Mock the NodeOAuthClient
vi.mock('@atproto/oauth-client-node', () => ({
  NodeOAuthClient: vi.fn().mockImplementation(() => ({
    authorize: vi.fn(),
    callback: vi.fn(),
    restore: vi.fn(),
    sessionStore: {
      set: vi.fn(),
      get: vi.fn(),
      del: vi.fn()
    },
    stateStore: {
      set: vi.fn(),
      get: vi.fn(), 
      del: vi.fn()
    }
  }))
}));

// Mock Agent
vi.mock('@atproto/api', () => ({
  Agent: vi.fn().mockImplementation(() => ({}))
}));

// Mock crypto.randomUUID
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: vi.fn(() => 'mock-uuid-12345')
  }
});

describe('BlueskyOAuthService', () => {
  let service: BlueskyOAuthService;
  let mockOAuthClient: any;

  beforeEach(() => {
    vi.clearAllMocks();
    resetDefaultBlueskyService();
    
    service = new BlueskyOAuthService({
      publicUrl: 'http://localhost:5173',
      developmentMode: true
    });

    // Get the mocked client instance
    const { NodeOAuthClient } = require('@atproto/oauth-client-node');
    mockOAuthClient = new NodeOAuthClient();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should create service with default options', () => {
      const defaultService = new BlueskyOAuthService();
      const config = defaultService.getConfig();
      
      expect(config.publicUrl).toBe('http://127.0.0.1:5174');
      expect(config.developmentMode).toBe(true);
      expect(config.sessionTTL).toBe(60 * 60 * 24 * 7);
    });

    it('should create service with custom options', () => {
      const customService = new BlueskyOAuthService({
        publicUrl: 'https://myapp.com',
        developmentMode: false,
        sessionTTL: 3600,
        apiTimeout: 10000
      });
      
      const config = customService.getConfig();
      expect(config.publicUrl).toBe('https://myapp.com');
      expect(config.developmentMode).toBe(false);
      expect(config.sessionTTL).toBe(3600);
      expect(config.apiTimeout).toBe(10000);
    });
  });

  describe('getOAuthClient', () => {
    it('should create and return OAuth client', async () => {
      const client = await service.getOAuthClient();
      expect(client).toBeDefined();
      
      const { NodeOAuthClient } = require('@atproto/oauth-client-node');
      expect(NodeOAuthClient).toHaveBeenCalledWith(
        expect.objectContaining({
          clientMetadata: expect.objectContaining({
            clientId: expect.stringContaining('localhost'),
            clientName: 'SvelteKit Bsky Guide',
            scope: 'atproto transition:generic',
            tokenEndpointAuthMethod: 'none'
          })
        })
      );
    });

    it('should return same client instance when not in development mode', async () => {
      const prodService = new BlueskyOAuthService({
        publicUrl: 'https://prod.com',
        developmentMode: false
      });
      
      const client1 = await prodService.getOAuthClient();
      const client2 = await prodService.getOAuthClient();
      
      expect(client1).toBe(client2);
    });

    it('should recreate client in development mode', async () => {
      const devService = new BlueskyOAuthService({
        publicUrl: 'http://localhost:5173',
        developmentMode: true
      });
      
      await devService.getOAuthClient();
      await devService.getOAuthClient();
      
      const { NodeOAuthClient } = require('@atproto/oauth-client-node');
      expect(NodeOAuthClient).toHaveBeenCalledTimes(2);
    });
  });

  describe('initiateLogin', () => {
    it('should generate authorization URL with default parameters', async () => {
      const mockAuthUrl = new URL('https://bsky.social/oauth/authorize?client_id=test');
      mockOAuthClient.authorize.mockResolvedValue(mockAuthUrl);
      
      const authUrl = await service.initiateLogin();
      
      expect(mockOAuthClient.authorize).toHaveBeenCalledWith('', {
        state: 'mock-uuid-12345',
        scope: 'atproto transition:generic',
        redirect_uri: 'http://localhost:5173/'
      });
      expect(authUrl).toBe(mockAuthUrl.toString());
    });

    it('should generate authorization URL with custom handle', async () => {
      const mockAuthUrl = new URL('https://bsky.social/oauth/authorize?client_id=test');
      mockOAuthClient.authorize.mockResolvedValue(mockAuthUrl);
      
      const authUrl = await service.initiateLogin('alice.bsky.social');
      
      expect(mockOAuthClient.authorize).toHaveBeenCalledWith('alice.bsky.social', {
        state: 'mock-uuid-12345',
        scope: 'atproto transition:generic',
        redirect_uri: 'http://localhost:5173/'
      });
      expect(authUrl).toBe(mockAuthUrl.toString());
    });

    it('should generate authorization URL with custom parameters', async () => {
      const mockAuthUrl = new URL('https://bsky.social/oauth/authorize?client_id=test');
      mockOAuthClient.authorize.mockResolvedValue(mockAuthUrl);
      
      const authUrl = await service.initiateLogin(
        'bob.bsky.social',
        'https://myapp.com/callback',
        'custom:scope'
      );
      
      expect(mockOAuthClient.authorize).toHaveBeenCalledWith('bob.bsky.social', {
        state: 'mock-uuid-12345',
        scope: 'custom:scope',
        redirect_uri: 'https://myapp.com/callback'
      });
      expect(authUrl).toBe(mockAuthUrl.toString());
    });

    it('should throw OAuthError when authorization fails', async () => {
      const error = new Error('Authorization failed');
      mockOAuthClient.authorize.mockRejectedValue(error);
      
      await expect(service.initiateLogin()).rejects.toThrow('Failed to generate authorization URL');
    });
  });

  describe('handleCallback', () => {
    it('should process successful OAuth callback', async () => {
      const mockSession = { 
        sub: 'did:plc:test123',
        iss: 'https://bsky.social',
        aud: 'test-client',
        scope: 'atproto'
      };
      
      mockOAuthClient.callback.mockResolvedValue({ session: mockSession });
      
      const callbackUrl = 'http://localhost:5173/?code=auth-code-123&state=state-123';
      const result = await service.handleCallback(callbackUrl);
      
      expect(result).toEqual({
        success: true,
        session: mockSession,
        userDid: 'did:plc:test123',
        redirectTo: '/dashboard'
      });
      expect(mockOAuthClient.callback).toHaveBeenCalledWith(new URL(callbackUrl));
    });

    it('should handle OAuth error in callback', async () => {
      const callbackUrl = 'http://localhost:5173/?error=access_denied&state=state-123';
      
      await expect(service.handleCallback(callbackUrl)).rejects.toThrow('OAuth authorization failed: access_denied');
    });

    it('should handle missing authorization code', async () => {
      const callbackUrl = 'http://localhost:5173/?state=state-123';
      
      await expect(service.handleCallback(callbackUrl)).rejects.toThrow('No authorization code received in callback');
    });

    it('should handle invalid session from callback', async () => {
      mockOAuthClient.callback.mockResolvedValue({ session: null });
      
      const callbackUrl = 'http://localhost:5173/?code=auth-code-123&state=state-123';
      
      await expect(service.handleCallback(callbackUrl)).rejects.toThrow('Failed to create valid session from OAuth callback');
    });

    it('should handle callback processing failure', async () => {
      const error = new Error('Callback processing failed');
      mockOAuthClient.callback.mockRejectedValue(error);
      
      const callbackUrl = 'http://localhost:5173/?code=auth-code-123&state=state-123';
      
      await expect(service.handleCallback(callbackUrl)).rejects.toThrow('Failed to process OAuth callback');
    });
  });

  describe('getAuthenticatedAgent', () => {
    it('should return authenticated agent for valid session', async () => {
      const mockSession = { sub: 'did:plc:test123' };
      mockOAuthClient.restore.mockResolvedValue(mockSession);
      
      const agent = await service.getAuthenticatedAgent('did:plc:test123');
      
      expect(agent).toBeDefined();
      expect(mockOAuthClient.restore).toHaveBeenCalledWith('did:plc:test123');
      
      const { Agent } = require('@atproto/api');
      expect(Agent).toHaveBeenCalledWith(mockSession);
    });

    it('should throw error for invalid session', async () => {
      mockOAuthClient.restore.mockResolvedValue(null);
      
      await expect(service.getAuthenticatedAgent('did:plc:invalid')).rejects.toThrow('No valid session found for user: did:plc:invalid');
    });

    it('should throw error when restore fails', async () => {
      const error = new Error('Restore failed');
      mockOAuthClient.restore.mockRejectedValue(error);
      
      await expect(service.getAuthenticatedAgent('did:plc:test123')).rejects.toThrow('Failed to create authenticated agent');
    });
  });

  describe('logout', () => {
    it('should successfully logout user', async () => {
      mockOAuthClient.sessionStore.del.mockResolvedValue(undefined);
      
      await expect(service.logout('did:plc:test123')).resolves.not.toThrow();
      expect(mockOAuthClient.sessionStore.del).toHaveBeenCalledWith('did:plc:test123');
    });

    it('should not throw error when logout fails', async () => {
      mockOAuthClient.sessionStore.del.mockRejectedValue(new Error('Delete failed'));
      
      await expect(service.logout('did:plc:test123')).resolves.not.toThrow();
    });
  });

  describe('hasValidSession', () => {
    it('should return true for valid session', async () => {
      const mockSession = { sub: 'did:plc:test123' };
      mockOAuthClient.sessionStore.get.mockResolvedValue(mockSession);
      
      const isValid = await service.hasValidSession('did:plc:test123');
      
      expect(isValid).toBe(true);
      expect(mockOAuthClient.sessionStore.get).toHaveBeenCalledWith('did:plc:test123');
    });

    it('should return false for invalid session', async () => {
      mockOAuthClient.sessionStore.get.mockResolvedValue(null);
      
      const isValid = await service.hasValidSession('did:plc:test123');
      
      expect(isValid).toBe(false);
    });

    it('should return false when check fails', async () => {
      mockOAuthClient.sessionStore.get.mockRejectedValue(new Error('Check failed'));
      
      const isValid = await service.hasValidSession('did:plc:test123');
      
      expect(isValid).toBe(false);
    });
  });

  describe('refreshTokensIfNeeded', () => {
    it('should return true when refresh succeeds', async () => {
      const mockSession = { sub: 'did:plc:test123' };
      mockOAuthClient.restore.mockResolvedValue(mockSession);
      
      const refreshed = await service.refreshTokensIfNeeded('did:plc:test123');
      
      expect(refreshed).toBe(true);
    });

    it('should return false when refresh fails', async () => {
      mockOAuthClient.restore.mockResolvedValue(null);
      
      const refreshed = await service.refreshTokensIfNeeded('did:plc:test123');
      
      expect(refreshed).toBe(false);
    });
  });

  describe('getConfig', () => {
    it('should return config with sensitive data redacted', () => {
      const config = service.getConfig();
      
      expect(config).toEqual({
        publicUrl: 'http://localhost:5173',
        developmentMode: true,
        sessionTTL: 60 * 60 * 24 * 7,
        apiTimeout: 30000,
        clientId: '[localhost development]'
      });
    });
  });

  describe('getSessionStats', () => {
    it('should return session statistics', () => {
      const stats = service.getSessionStats();
      
      expect(stats).toEqual({
        activeSessions: 0,
        stateEntries: 0
      });
    });
  });

  describe('cleanup', () => {
    it('should clean up expired sessions and state', async () => {
      const cleanedCount = await service.cleanup();
      
      expect(cleanedCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe('localhost client ID generation', () => {
    it('should generate proper localhost client ID', () => {
      const testService = new BlueskyOAuthService({
        publicUrl: 'http://localhost:3000'
      });
      
      const config = testService.getConfig();
      expect(config.clientId).toBe('[localhost development]');
    });

    it('should handle custom public URL', () => {
      const testService = new BlueskyOAuthService({
        publicUrl: 'http://127.0.0.1:8080'
      });
      
      const config = testService.getConfig();
      expect(config.publicUrl).toBe('http://127.0.0.1:8080');
    });
  });

  describe('error handling', () => {
    it('should throw OAuthError with proper structure', async () => {
      mockOAuthClient.authorize.mockRejectedValue(new Error('Test error'));
      
      try {
        await service.initiateLogin();
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.name).toBe('OAuthError');
        expect(error.message).toBe('Failed to generate authorization URL');
        expect(error.code).toBe('AUTH_URL_ERROR');
      }
    });
  });
});

describe('Bluesky Service Singleton', () => {
  beforeEach(() => {
    resetDefaultBlueskyService();
  });

  it('should create default instance', () => {
    const service1 = getDefaultBlueskyService();
    const service2 = getDefaultBlueskyService();
    
    expect(service1).toBe(service2);
  });

  it('should reset default instance', () => {
    const service1 = getDefaultBlueskyService();
    resetDefaultBlueskyService();
    const service2 = getDefaultBlueskyService();
    
    expect(service1).not.toBe(service2);
  });
});