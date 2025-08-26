/**
 * @fileoverview Unit tests for BlueskyAPIService
 * 
 * Comprehensive test suite for API service functionality including
 * profile fetching, feed enrichment, thread handling, social graph
 * operations, and error handling.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { BlueskyAPIService, resetDefaultAPIService } from '../api.js';
import type { 
  AuthenticatedAgent, 
  BlueskyProfile, 
  EnrichedFeedResponse,
  FeedItem,
  BlueskyPost
} from '../types.js';

// Mock the Agent
const createMockAgent = (): AuthenticatedAgent => ({
  getProfile: vi.fn(),
  getTimeline: vi.fn(),
  getAuthorFeed: vi.fn(),
  getPostThread: vi.fn(),
  getActorLikes: vi.fn(),
  getFollows: vi.fn(),
  getFollowers: vi.fn()
} as any);

// Mock data
const mockProfile: BlueskyProfile = {
  did: 'did:plc:test123',
  handle: 'test.bsky.social',
  displayName: 'Test User',
  description: 'Test profile',
  avatar: 'https://example.com/avatar.jpg',
  followsCount: 100,
  followersCount: 200,
  postsCount: 50,
  indexedAt: '2024-01-01T00:00:00Z',
  createdAt: '2023-01-01T00:00:00Z',
  labels: []
};

const mockPost: BlueskyPost = {
  uri: 'at://did:plc:test123/app.bsky.feed.post/123',
  cid: 'bafy123',
  author: mockProfile,
  record: {
    $type: 'app.bsky.feed.post',
    text: 'Test post content',
    createdAt: '2024-01-01T00:00:00Z'
  },
  replyCount: 1,
  repostCount: 2,
  likeCount: 5,
  quoteCount: 0,
  indexedAt: '2024-01-01T00:00:00Z',
  labels: []
};

const mockFeedItem: FeedItem = {
  post: mockPost
};

// Mock crypto.randomUUID
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: vi.fn(() => 'mock-uuid-12345')
  }
});

describe('BlueskyAPIService', () => {
  let service: BlueskyAPIService;
  let mockAgent: AuthenticatedAgent;

  beforeEach(() => {
    vi.clearAllMocks();
    resetDefaultAPIService();
    
    service = new BlueskyAPIService();
    mockAgent = createMockAgent();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should create service with default options', () => {
      const defaultService = new BlueskyAPIService();
      expect(defaultService).toBeDefined();
    });

    it('should create service with custom options', () => {
      const customService = new BlueskyAPIService(15000, 5);
      expect(customService).toBeDefined();
    });
  });

  describe('getProfile', () => {
    it('should fetch profile successfully', async () => {
      const mockResponse = { data: mockProfile };
      (mockAgent.getProfile as any).mockResolvedValue(mockResponse);

      const result = await service.getProfile(mockAgent, 'test.bsky.social');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockProfile);
      expect(result.metadata).toBeDefined();
      expect(result.metadata?.timestamp).toBeDefined();
      expect(result.metadata?.requestId).toBe('mock-uuid-12345');
      expect(mockAgent.getProfile).toHaveBeenCalledWith({ actor: 'test.bsky.social' });
    });

    it('should handle profile fetch error', async () => {
      const error = new Error('Profile not found');
      (error as any).status = 404;
      (mockAgent.getProfile as any).mockRejectedValue(error);

      await expect(service.getProfile(mockAgent, 'nonexistent')).rejects.toThrow('Resource not found');
    });

    it('should handle scope error', async () => {
      const error = new Error('Insufficient scope for this operation');
      (mockAgent.getProfile as any).mockRejectedValue(error);

      await expect(service.getProfile(mockAgent, 'test')).rejects.toThrow('Insufficient OAuth scope');
    });

    it('should handle authentication error', async () => {
      const error = new Error('Unauthorized');
      (error as any).status = 401;
      (mockAgent.getProfile as any).mockRejectedValue(error);

      await expect(service.getProfile(mockAgent, 'test')).rejects.toThrow('Authentication failed');
    });
  });

  describe('getTimelineEnriched', () => {
    it('should fetch and enrich timeline successfully', async () => {
      const mockTimelineResponse = {
        data: {
          feed: [mockFeedItem],
          cursor: 'next-cursor'
        }
      };
      (mockAgent.getTimeline as any).mockResolvedValue(mockTimelineResponse);

      const result = await service.getTimelineEnriched(mockAgent, 10);

      expect(result.success).toBe(true);
      expect(result.data?.feed).toHaveLength(1);
      expect(result.data?.analytics).toBeDefined();
      expect(result.data?.analytics.totalItems).toBe(1);
      expect(result.data?.analytics.originalPosts).toBe(1);
      expect(result.data?.cursor).toBe('next-cursor');
      expect(result.pagination?.hasMore).toBe(true);
      expect(mockAgent.getTimeline).toHaveBeenCalledWith({ limit: 10, cursor: undefined });
    });

    it('should handle timeline fetch error gracefully', async () => {
      const error = new Error('Timeline fetch failed');
      (mockAgent.getTimeline as any).mockRejectedValue(error);

      const result = await service.getTimelineEnriched(mockAgent, 10);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('Timeline fetch failed');
    });

    it('should limit fetch size to maximum', async () => {
      const mockTimelineResponse = {
        data: { feed: [], cursor: null }
      };
      (mockAgent.getTimeline as any).mockResolvedValue(mockTimelineResponse);

      await service.getTimelineEnriched(mockAgent, 500);

      expect(mockAgent.getTimeline).toHaveBeenCalledWith({ limit: 100, cursor: undefined });
    });

    it('should enrich posts with parent data for replies', async () => {
      const replyPost = {
        ...mockPost,
        record: {
          ...mockPost.record,
          reply: {
            parent: { uri: 'at://parent/post', cid: 'parentcid' },
            root: { uri: 'at://root/post', cid: 'rootcid' }
          }
        }
      };

      const mockTimelineResponse = {
        data: {
          feed: [{ post: replyPost }],
          cursor: null
        }
      };

      const mockParentResponse = {
        data: {
          thread: {
            post: mockPost
          }
        }
      };

      (mockAgent.getTimeline as any).mockResolvedValue(mockTimelineResponse);
      (mockAgent.getPostThread as any).mockResolvedValue(mockParentResponse);

      const result = await service.getTimelineEnriched(mockAgent, 10);

      expect(result.success).toBe(true);
      expect(result.data?.feed[0].parentPost).toEqual(mockPost);
      expect(result.data?.feed[0].isReply).toBe(true);
      expect(mockAgent.getPostThread).toHaveBeenCalledWith({
        uri: 'at://parent/post',
        depth: 0
      });
    });
  });

  describe('getAuthorFeedEnriched', () => {
    it('should fetch author feed with profile totals', async () => {
      const mockFeedResponse = {
        data: {
          feed: [mockFeedItem],
          cursor: 'next-cursor'
        }
      };
      const mockProfileResponse = { data: mockProfile };

      (mockAgent.getAuthorFeed as any).mockResolvedValue(mockFeedResponse);
      (mockAgent.getProfile as any).mockResolvedValue(mockProfileResponse);

      const result = await service.getAuthorFeedEnriched(mockAgent, 'test.bsky.social', 10);

      expect(result.success).toBe(true);
      expect(result.data?.feed).toHaveLength(1);
      expect(result.data?.profileTotals).toEqual({
        followsCount: 100,
        followersCount: 200,
        postsCount: 50
      });
      expect(mockAgent.getAuthorFeed).toHaveBeenCalledWith({
        actor: 'test.bsky.social',
        limit: 10,
        cursor: undefined
      });
      expect(mockAgent.getProfile).toHaveBeenCalledWith({ actor: 'test.bsky.social' });
    });

    it('should handle author feed fetch error gracefully', async () => {
      const error = new Error('Feed not found');
      (mockAgent.getAuthorFeed as any).mockRejectedValue(error);

      const result = await service.getAuthorFeedEnriched(mockAgent, 'test', 10);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('getPostThread', () => {
    it('should fetch post thread successfully', async () => {
      const mockThreadResponse = {
        data: {
          thread: {
            post: mockPost,
            replies: []
          }
        }
      };
      (mockAgent.getPostThread as any).mockResolvedValue(mockThreadResponse);

      const result = await service.getPostThread(mockAgent, 'at://test/post', 6);

      expect(result.success).toBe(true);
      expect(result.data?.thread.post).toEqual(mockPost);
      expect(mockAgent.getPostThread).toHaveBeenCalledWith({
        uri: 'at://test/post',
        depth: 6
      });
    });

    it('should limit thread depth', async () => {
      const mockThreadResponse = {
        data: { thread: { post: mockPost, replies: [] } }
      };
      (mockAgent.getPostThread as any).mockResolvedValue(mockThreadResponse);

      await service.getPostThread(mockAgent, 'at://test/post', 50);

      expect(mockAgent.getPostThread).toHaveBeenCalledWith({
        uri: 'at://test/post',
        depth: 10
      });
    });

    it('should handle thread fetch error', async () => {
      const error = new Error('Thread not found');
      (mockAgent.getPostThread as any).mockRejectedValue(error);

      await expect(service.getPostThread(mockAgent, 'at://nonexistent/post')).rejects.toThrow();
    });
  });

  describe('getLikes', () => {
    it('should fetch likes successfully', async () => {
      const mockLikesResponse = {
        data: {
          feed: [mockFeedItem],
          cursor: 'next-cursor'
        }
      };
      (mockAgent.getActorLikes as any).mockResolvedValue(mockLikesResponse);

      const result = await service.getLikes(mockAgent, 'test.bsky.social', 10);

      expect(result.success).toBe(true);
      expect(result.data?.feed).toHaveLength(1);
      expect(result.data?.cursor).toBe('next-cursor');
      expect(mockAgent.getActorLikes).toHaveBeenCalledWith({
        actor: 'test.bsky.social',
        limit: 10,
        cursor: undefined
      });
    });

    it('should handle likes fetch error gracefully', async () => {
      const error = new Error('Likes not available');
      (mockAgent.getActorLikes as any).mockRejectedValue(error);

      const result = await service.getLikes(mockAgent, 'test', 10);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('getFollowsWithTotals', () => {
    it('should fetch follows with profile totals', async () => {
      const mockFollowsResponse = {
        data: {
          follows: [mockProfile],
          cursor: 'next-cursor'
        }
      };
      const mockProfileResponse = { data: mockProfile };

      (mockAgent.getFollows as any).mockResolvedValue(mockFollowsResponse);
      (mockAgent.getProfile as any).mockResolvedValue(mockProfileResponse);

      const result = await service.getFollowsWithTotals(mockAgent, 'test.bsky.social', 20);

      expect(result.success).toBe(true);
      expect(result.data?.data.follows).toHaveLength(1);
      expect(result.data?.profileTotals.followsCount).toBe(100);
      expect(result.data?.pagination.estimatedTotalPages).toBe(5); // 100/20 = 5
      expect(result.pagination?.total).toBe(100);
    });

    it('should handle follows fetch error gracefully', async () => {
      const error = new Error('Follows not available');
      (mockAgent.getFollows as any).mockRejectedValue(error);

      const result = await service.getFollowsWithTotals(mockAgent, 'test', 20);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('getFollowersWithTotals', () => {
    it('should fetch followers with profile totals', async () => {
      const mockFollowersResponse = {
        data: {
          followers: [mockProfile],
          cursor: 'next-cursor'
        }
      };
      const mockProfileResponse = { data: mockProfile };

      (mockAgent.getFollowers as any).mockResolvedValue(mockFollowersResponse);
      (mockAgent.getProfile as any).mockResolvedValue(mockProfileResponse);

      const result = await service.getFollowersWithTotals(mockAgent, 'test.bsky.social', 20);

      expect(result.success).toBe(true);
      expect(result.data?.data.followers).toHaveLength(1);
      expect(result.data?.profileTotals.followersCount).toBe(200);
      expect(result.data?.pagination.estimatedTotalPages).toBe(10); // 200/20 = 10
      expect(result.pagination?.total).toBe(200);
    });

    it('should handle followers fetch error gracefully', async () => {
      const error = new Error('Followers not available');
      (mockAgent.getFollowers as any).mockRejectedValue(error);

      const result = await service.getFollowersWithTotals(mockAgent, 'test', 20);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('executeDemoAPI', () => {
    it('should execute profile demo', async () => {
      const mockResponse = { data: mockProfile };
      (mockAgent.getProfile as any).mockResolvedValue(mockResponse);

      const result = await service.executeDemoAPI(mockAgent, 'profile', 'test.bsky.social', 10);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockProfile);
      expect(mockAgent.getProfile).toHaveBeenCalledWith({ actor: 'test.bsky.social' });
    });

    it('should execute timeline demo', async () => {
      const mockTimelineResponse = {
        data: { feed: [mockFeedItem], cursor: null }
      };
      (mockAgent.getTimeline as any).mockResolvedValue(mockTimelineResponse);

      const result = await service.executeDemoAPI(mockAgent, 'timeline', 'test.bsky.social', 10);

      expect(result.success).toBe(true);
      expect(mockAgent.getTimeline).toHaveBeenCalledWith({ limit: 10, cursor: undefined });
    });

    it('should execute post-thread demo with existing posts', async () => {
      const mockFeedResponse = {
        data: { feed: [mockFeedItem], cursor: null }
      };
      const mockThreadResponse = {
        data: { thread: { post: mockPost, replies: [] } }
      };
      const mockProfileResponse = { data: mockProfile };

      (mockAgent.getAuthorFeed as any).mockResolvedValue(mockFeedResponse);
      (mockAgent.getProfile as any).mockResolvedValue(mockProfileResponse);
      (mockAgent.getPostThread as any).mockResolvedValue(mockThreadResponse);

      const result = await service.executeDemoAPI(mockAgent, 'post-thread', 'test.bsky.social', 10);

      expect(result.success).toBe(true);
      expect(mockAgent.getPostThread).toHaveBeenCalledWith({
        uri: mockPost.uri,
        depth: 6
      });
    });

    it('should handle post-thread demo with no posts', async () => {
      const mockFeedResponse = {
        data: { feed: [], cursor: null }
      };
      const mockProfileResponse = { data: mockProfile };

      (mockAgent.getAuthorFeed as any).mockResolvedValue(mockFeedResponse);
      (mockAgent.getProfile as any).mockResolvedValue(mockProfileResponse);

      const result = await service.executeDemoAPI(mockAgent, 'post-thread', 'test.bsky.social', 10);

      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('No posts found to show thread for');
      expect(result.error?.code).toBe('NO_POSTS');
    });

    it('should handle unknown demo type', async () => {
      const result = await service.executeDemoAPI(mockAgent, 'unknown' as any, 'test.bsky.social', 10);

      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('Unknown demo type: unknown');
      expect(result.error?.code).toBe('UNKNOWN_DEMO');
    });

    it('should handle demo execution error', async () => {
      const error = new Error('Demo failed');
      (mockAgent.getProfile as any).mockRejectedValue(error);

      const result = await service.executeDemoAPI(mockAgent, 'profile', 'test', 10);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('feed analytics', () => {
    it('should analyze feed content correctly', async () => {
      const repostItem: FeedItem = {
        post: mockPost,
        reason: {
          $type: 'app.bsky.feed.defs#reasonRepost',
          by: mockProfile,
          indexedAt: '2024-01-01T00:00:00Z'
        }
      };

      const replyPost = {
        ...mockPost,
        record: {
          ...mockPost.record,
          reply: {
            parent: { uri: 'at://parent/post', cid: 'parentcid' },
            root: { uri: 'at://parent/post', cid: 'parentcid' }
          }
        }
      };

      const replyItem: FeedItem = { post: replyPost };

      const mockTimelineResponse = {
        data: {
          feed: [mockFeedItem, repostItem, replyItem],
          cursor: null
        }
      };

      (mockAgent.getTimeline as any).mockResolvedValue(mockTimelineResponse);

      const result = await service.getTimelineEnriched(mockAgent, 10);

      expect(result.success).toBe(true);
      expect(result.data?.analytics).toEqual({
        totalItems: 3,
        originalPosts: 1,
        reposts: 1,
        replies: 1,
        threads: 0
      });
    });
  });

  describe('error handling', () => {
    it('should extract required scope from error message', async () => {
      const error = new Error('Scope "rpc:app.bsky.feed.getTimeline" is required');
      (mockAgent.getTimeline as any).mockRejectedValue(error);

      const result = await service.getTimelineEnriched(mockAgent, 10);

      expect(result.success).toBe(false);
      expect(result.error?.requiredScope).toBe('app.bsky.feed.getTimeline');
    });

    it('should provide educational error explanations', async () => {
      const error = new Error('Rate limited');
      (error as any).status = 429;
      (mockAgent.getProfile as any).mockRejectedValue(error);

      await expect(service.getProfile(mockAgent, 'test')).rejects.toThrow();
    });

    it('should handle different HTTP status codes', async () => {
      const testCases = [
        { status: 401, expectedMessage: 'Authentication failed' },
        { status: 403, expectedMessage: 'Insufficient OAuth scope' },
        { status: 404, expectedMessage: 'Resource not found' },
        { status: 429, expectedMessage: 'Rate limit exceeded' },
        { status: 500, expectedMessage: 'API call failed' }
      ];

      for (const { status, expectedMessage } of testCases) {
        const error = new Error('Test error');
        (error as any).status = status;
        (mockAgent.getProfile as any).mockRejectedValue(error);

        await expect(service.getProfile(mockAgent, 'test')).rejects.toThrow(expectedMessage);
      }
    });
  });
});

describe('API Service Singleton', () => {
  beforeEach(() => {
    resetDefaultAPIService();
  });

  it('should create default instance', () => {
    const { getDefaultAPIService } = require('../api.js');
    const service1 = getDefaultAPIService();
    const service2 = getDefaultAPIService();
    
    expect(service1).toBe(service2);
  });

  it('should reset default instance', () => {
    const { getDefaultAPIService, resetDefaultAPIService } = require('../api.js');
    
    const service1 = getDefaultAPIService();
    resetDefaultAPIService();
    const service2 = getDefaultAPIService();
    
    expect(service1).not.toBe(service2);
  });
});