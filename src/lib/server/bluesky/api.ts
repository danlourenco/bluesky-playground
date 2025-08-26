/**
 * @fileoverview Bluesky API Service Class
 * 
 * This service handles all Bluesky API interactions with data enrichment,
 * error handling, and response standardization. It provides a clean interface
 * for all AT Protocol API calls with additional functionality like:
 * - Parent post fetching for reply chains
 * - Profile totals for pagination context  
 * - Repost and thread detection
 * - Consistent error handling and logging
 * - Response analytics and metadata
 * 
 * @example
 * ```typescript
 * const apiService = new BlueskyAPIService();
 * const agent = await oauthService.getAuthenticatedAgent(userDid);
 * 
 * // Get enriched timeline with parent posts
 * const timeline = await apiService.getTimelineEnriched(agent, 10);
 * 
 * // Get followers with true total counts
 * const followers = await apiService.getFollowersWithTotals(agent, userDid, 20);
 * ```
 */

import type {
  AuthenticatedAgent,
  DID,
  BlueskyPost,
  BlueskyProfile,
  EnrichedFeedResponse,
  EnrichedFollowResponse,
  ThreadResponse,
  APIResponse,
  PaginatedAPIResponse,
  BlueskyError,
  FeedItem,
  EnrichedFeedItem,
  DemoType
} from './types.js';

/**
 * Bluesky API Service
 * 
 * Provides enriched API calls with data enhancement, error handling,
 * and response standardization for all Bluesky AT Protocol interactions.
 */
export class BlueskyAPIService {
  private readonly defaultTimeout: number;
  private readonly maxRetries: number;

  /**
   * Create a new BlueskyAPIService instance
   * 
   * @param timeout - API request timeout in milliseconds (default: 30000)
   * @param maxRetries - Maximum number of retry attempts (default: 3)
   */
  constructor(timeout: number = 30000, maxRetries: number = 3) {
    this.defaultTimeout = timeout;
    this.maxRetries = maxRetries;
  }

  // ============================================================================
  // Profile API Methods
  // ============================================================================

  /**
   * Get user profile information
   * 
   * Retrieves detailed profile information for a user including follower counts,
   * verification status, and relationship to the authenticated user.
   * 
   * @param agent - Authenticated AT Protocol agent
   * @param actor - User DID or handle to get profile for
   * @returns Promise resolving to profile data
   * @throws {BlueskyError} If profile fetch fails
   */
  async getProfile(agent: AuthenticatedAgent, actor: DID | string): Promise<APIResponse<BlueskyProfile>> {
    try {
      console.log(`API: Getting profile for actor: ${actor}`);
      
      const response = await agent.getProfile({ actor });
      
      console.log(`API: Profile retrieved successfully for ${response.data.handle}`);
      
      return {
        success: true,
        data: response.data as BlueskyProfile,
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID()
        }
      };
    } catch (error) {
      console.error(`API: Failed to get profile for ${actor}:`, error);
      throw this.handleAPIError(error, 'getProfile', actor);
    }
  }

  // ============================================================================
  // Feed API Methods
  // ============================================================================

  /**
   * Get user's timeline with enriched data
   * 
   * Fetches the user's home timeline and enriches it with:
   * - Parent post data for replies
   * - Repost detection and metadata
   * - Thread analysis
   * - Content analytics
   * 
   * @param agent - Authenticated AT Protocol agent
   * @param limit - Number of posts to fetch (default: 10, max: 100)
   * @param cursor - Pagination cursor for next page
   * @returns Promise resolving to enriched timeline data
   * @throws {BlueskyError} If timeline fetch fails
   */
  async getTimelineEnriched(
    agent: AuthenticatedAgent,
    limit: number = 10,
    cursor?: string
  ): Promise<APIResponse<EnrichedFeedResponse>> {
    try {
      console.log(`API: Getting enriched timeline (limit: ${limit})`);
      
      const response = await agent.getTimeline({ 
        limit: Math.min(limit, 100),
        cursor 
      });

      const enrichedFeed = await this.enrichFeedItems(agent, response.data.feed);
      const analytics = this.analyzeFeedContent(enrichedFeed);

      const enrichedResponse: EnrichedFeedResponse = {
        feed: enrichedFeed,
        cursor: response.data.cursor,
        analytics
      };

      console.log(`API: Timeline enriched with ${enrichedFeed.length} items`);
      
      return {
        success: true,
        data: enrichedResponse,
        pagination: {
          cursor: response.data.cursor,
          hasMore: !!response.data.cursor,
          limit
        },
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID()
        }
      };
    } catch (error) {
      console.error('API: Failed to get timeline:', error);
      return this.createErrorResponse(error, 'getTimeline');
    }
  }

  /**
   * Get user's author feed with enriched data
   * 
   * Fetches posts by a specific user including their reposts, with:
   * - Parent post data for replies
   * - Repost analysis and indicators
   * - Profile totals for context
   * 
   * @param agent - Authenticated AT Protocol agent
   * @param actor - User DID or handle whose posts to fetch
   * @param limit - Number of posts to fetch (default: 10)
   * @param cursor - Pagination cursor for next page
   * @returns Promise resolving to enriched author feed
   * @throws {BlueskyError} If author feed fetch fails
   */
  async getAuthorFeedEnriched(
    agent: AuthenticatedAgent,
    actor: DID | string,
    limit: number = 10,
    cursor?: string
  ): Promise<APIResponse<EnrichedFeedResponse>> {
    try {
      console.log(`API: Getting enriched author feed for ${actor} (limit: ${limit})`);
      
      const [feedResponse, profileResponse] = await Promise.all([
        agent.getAuthorFeed({ 
          actor,
          limit: Math.min(limit, 100),
          cursor 
        }),
        agent.getProfile({ actor })
      ]);

      const enrichedFeed = await this.enrichFeedItems(agent, feedResponse.data.feed);
      const analytics = this.analyzeFeedContent(enrichedFeed);

      const enrichedResponse: EnrichedFeedResponse = {
        feed: enrichedFeed,
        cursor: feedResponse.data.cursor,
        analytics,
        profileTotals: {
          followsCount: profileResponse.data.followsCount,
          followersCount: profileResponse.data.followersCount,
          postsCount: profileResponse.data.postsCount
        }
      };

      console.log(`API: Author feed enriched with ${enrichedFeed.length} items for ${profileResponse.data.handle}`);
      
      return {
        success: true,
        data: enrichedResponse,
        pagination: {
          cursor: feedResponse.data.cursor,
          hasMore: !!feedResponse.data.cursor,
          limit
        },
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID()
        }
      };
    } catch (error) {
      console.error(`API: Failed to get author feed for ${actor}:`, error);
      return this.createErrorResponse(error, 'getAuthorFeed', actor);
    }
  }

  /**
   * Get complete post thread with nested replies
   * 
   * Fetches a post thread showing the original post and all replies
   * in a structured format with proper nesting.
   * 
   * @param agent - Authenticated AT Protocol agent  
   * @param uri - AT Protocol URI of the post
   * @param depth - Maximum depth of replies to fetch (default: 6)
   * @returns Promise resolving to complete thread data
   * @throws {BlueskyError} If thread fetch fails
   */
  async getPostThread(
    agent: AuthenticatedAgent,
    uri: string,
    depth: number = 6
  ): Promise<APIResponse<ThreadResponse>> {
    try {
      console.log(`API: Getting post thread for URI: ${uri} (depth: ${depth})`);
      
      const response = await agent.getPostThread({ 
        uri,
        depth: Math.min(depth, 10) // Limit depth to prevent excessive nesting
      });

      console.log(`API: Thread retrieved with ${response.data.thread.replies?.length || 0} replies`);
      
      return {
        success: true,
        data: response.data as ThreadResponse,
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID()
        }
      };
    } catch (error) {
      console.error(`API: Failed to get thread for ${uri}:`, error);
      throw this.handleAPIError(error, 'getPostThread', uri);
    }
  }

  /**
   * Get posts liked by a user
   * 
   * Fetches posts that a user has liked, sorted by like date.
   * 
   * @param agent - Authenticated AT Protocol agent
   * @param actor - User DID or handle whose likes to fetch
   * @param limit - Number of liked posts to fetch (default: 10)
   * @param cursor - Pagination cursor for next page
   * @returns Promise resolving to liked posts
   * @throws {BlueskyError} If likes fetch fails
   */
  async getLikes(
    agent: AuthenticatedAgent,
    actor: DID | string,
    limit: number = 10,
    cursor?: string
  ): Promise<APIResponse<EnrichedFeedResponse>> {
    try {
      console.log(`API: Getting likes for ${actor} (limit: ${limit})`);
      
      const response = await agent.getActorLikes({ 
        actor,
        limit: Math.min(limit, 100),
        cursor 
      });

      const enrichedFeed = await this.enrichFeedItems(agent, response.data.feed);
      const analytics = this.analyzeFeedContent(enrichedFeed);

      const enrichedResponse: EnrichedFeedResponse = {
        feed: enrichedFeed,
        cursor: response.data.cursor,
        analytics
      };

      console.log(`API: Likes retrieved with ${enrichedFeed.length} items`);
      
      return {
        success: true,
        data: enrichedResponse,
        pagination: {
          cursor: response.data.cursor,
          hasMore: !!response.data.cursor,
          limit
        },
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID()
        }
      };
    } catch (error) {
      console.error(`API: Failed to get likes for ${actor}:`, error);
      return this.createErrorResponse(error, 'getActorLikes', actor);
    }
  }

  // ============================================================================
  // Social Graph API Methods
  // ============================================================================

  /**
   * Get users being followed with profile totals
   * 
   * Fetches the list of users that an actor follows, enriched with
   * true total counts from their profile for pagination context.
   * 
   * @param agent - Authenticated AT Protocol agent
   * @param actor - User DID or handle whose follows to fetch
   * @param limit - Number of follows to fetch (default: 20)
   * @param cursor - Pagination cursor for next page
   * @returns Promise resolving to enriched follows data
   * @throws {BlueskyError} If follows fetch fails
   */
  async getFollowsWithTotals(
    agent: AuthenticatedAgent,
    actor: DID | string,
    limit: number = 20,
    cursor?: string
  ): Promise<APIResponse<EnrichedFollowResponse>> {
    try {
      console.log(`API: Getting follows for ${actor} with totals (limit: ${limit})`);
      
      const [followsResponse, profileResponse] = await Promise.all([
        agent.getFollows({ 
          actor,
          limit: Math.min(limit, 100),
          cursor 
        }),
        agent.getProfile({ actor })
      ]);

      const enrichedResponse: EnrichedFollowResponse = {
        data: followsResponse.data,
        profileTotals: {
          followsCount: profileResponse.data.followsCount,
          followersCount: profileResponse.data.followersCount,
          postsCount: profileResponse.data.postsCount
        },
        pagination: {
          returned: followsResponse.data.follows.length,
          limit,
          estimatedTotalPages: Math.ceil(profileResponse.data.followsCount / limit)
        }
      };

      console.log(`API: Follows retrieved - ${followsResponse.data.follows.length} of ${profileResponse.data.followsCount} total`);
      
      return {
        success: true,
        data: enrichedResponse,
        pagination: {
          cursor: followsResponse.data.cursor,
          hasMore: !!followsResponse.data.cursor,
          total: profileResponse.data.followsCount,
          limit
        },
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID()
        }
      };
    } catch (error) {
      console.error(`API: Failed to get follows for ${actor}:`, error);
      return this.createErrorResponse(error, 'getFollows', actor);
    }
  }

  /**
   * Get followers with profile totals
   * 
   * Fetches the list of users that follow an actor, enriched with
   * true total counts from their profile for pagination context.
   * 
   * @param agent - Authenticated AT Protocol agent
   * @param actor - User DID or handle whose followers to fetch
   * @param limit - Number of followers to fetch (default: 20)
   * @param cursor - Pagination cursor for next page
   * @returns Promise resolving to enriched followers data
   * @throws {BlueskyError} If followers fetch fails
   */
  async getFollowersWithTotals(
    agent: AuthenticatedAgent,
    actor: DID | string,
    limit: number = 20,
    cursor?: string
  ): Promise<APIResponse<EnrichedFollowResponse>> {
    try {
      console.log(`API: Getting followers for ${actor} with totals (limit: ${limit})`);
      
      const [followersResponse, profileResponse] = await Promise.all([
        agent.getFollowers({ 
          actor,
          limit: Math.min(limit, 100),
          cursor 
        }),
        agent.getProfile({ actor })
      ]);

      const enrichedResponse: EnrichedFollowResponse = {
        data: followersResponse.data,
        profileTotals: {
          followsCount: profileResponse.data.followsCount,
          followersCount: profileResponse.data.followersCount,
          postsCount: profileResponse.data.postsCount
        },
        pagination: {
          returned: followersResponse.data.followers.length,
          limit,
          estimatedTotalPages: Math.ceil(profileResponse.data.followersCount / limit)
        }
      };

      console.log(`API: Followers retrieved - ${followersResponse.data.followers.length} of ${profileResponse.data.followersCount} total`);
      
      return {
        success: true,
        data: enrichedResponse,
        pagination: {
          cursor: followersResponse.data.cursor,
          hasMore: !!followersResponse.data.cursor,
          total: profileResponse.data.followersCount,
          limit
        },
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID()
        }
      };
    } catch (error) {
      console.error(`API: Failed to get followers for ${actor}:`, error);
      return this.createErrorResponse(error, 'getFollowers', actor);
    }
  }

  // ============================================================================
  // Demo API Method (for dashboard)
  // ============================================================================

  /**
   * Execute API call for a specific demo type
   * 
   * Unified method for executing different API calls based on demo type.
   * Used by the dashboard to dynamically call different APIs.
   * 
   * @param agent - Authenticated AT Protocol agent
   * @param demo - Type of demo to execute
   * @param actor - User DID or handle (for user-specific calls)
   * @param limit - Number of items to fetch
   * @returns Promise resolving to demo-specific API response
   */
  async executeDemoAPI(
    agent: AuthenticatedAgent,
    demo: DemoType,
    actor: DID | string,
    limit: number = 10
  ): Promise<APIResponse<any>> {
    console.log(`API: Executing demo: ${demo} for actor: ${actor}`);

    try {
      switch (demo) {
        case 'profile':
          return await this.getProfile(agent, actor);
          
        case 'timeline':
          return await this.getTimelineEnriched(agent, limit);
          
        case 'author-feed':
          return await this.getAuthorFeedEnriched(agent, actor, limit);
          
        case 'post-thread':
          // Get a recent post first, then its thread
          const authorFeed = await this.getAuthorFeedEnriched(agent, actor, 1);
          if (authorFeed.success && authorFeed.data?.feed.length > 0) {
            const firstPost = authorFeed.data.feed[0].post;
            return await this.getPostThread(agent, firstPost.uri);
          }
          return { 
            success: false, 
            error: { 
              message: 'No posts found to show thread for',
              code: 'NO_POSTS'
            } 
          };
          
        case 'likes':
          return await this.getLikes(agent, actor, limit);
          
        case 'following':
          return await this.getFollowsWithTotals(agent, actor, 20);
          
        case 'followers':
          return await this.getFollowersWithTotals(agent, actor, 20);
          
        default:
          return { 
            success: false, 
            error: { 
              message: `Unknown demo type: ${demo}`,
              code: 'UNKNOWN_DEMO'
            } 
          };
      }
    } catch (error) {
      console.error(`API: Demo execution failed for ${demo}:`, error);
      return this.createErrorResponse(error, demo, actor);
    }
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  /**
   * Enrich feed items with additional data
   * 
   * Adds parent post data for replies and computes UI flags.
   * 
   * @param agent - Authenticated AT Protocol agent
   * @param feedItems - Raw feed items from API
   * @returns Promise resolving to enriched feed items
   */
  private async enrichFeedItems(
    agent: AuthenticatedAgent,
    feedItems: FeedItem[]
  ): Promise<EnrichedFeedItem[]> {
    const enrichedItems: EnrichedFeedItem[] = [];

    for (const item of feedItems) {
      const enrichedItem: EnrichedFeedItem = {
        ...item,
        parentPost: undefined,
        isRepost: !!item.reason,
        isReply: !!item.post.record.reply,
        isThread: false // Will be computed based on reply chains
      };

      // Fetch parent post for replies
      if (item.post.record.reply?.parent?.uri) {
        try {
          const parentThread = await agent.getPostThread({
            uri: item.post.record.reply.parent.uri,
            depth: 0
          });
          
          if (parentThread.data?.thread?.post) {
            enrichedItem.parentPost = parentThread.data.thread.post as BlueskyPost;
            enrichedItem.isThread = item.post.record.reply.parent.uri !== item.post.record.reply.root.uri;
          }
        } catch (error) {
          console.warn(`Failed to fetch parent post for ${item.post.uri}:`, error);
          // Continue without parent post data
        }
      }

      enrichedItems.push(enrichedItem);
    }

    return enrichedItems;
  }

  /**
   * Analyze feed content for statistics
   * 
   * Computes analytics about feed composition for educational purposes.
   * 
   * @param feedItems - Enriched feed items
   * @returns Analytics about the feed content
   */
  private analyzeFeedContent(feedItems: EnrichedFeedItem[]): EnrichedFeedResponse['analytics'] {
    const analytics = {
      totalItems: feedItems.length,
      originalPosts: 0,
      reposts: 0,
      replies: 0,
      threads: 0
    };

    for (const item of feedItems) {
      if (item.isRepost) {
        analytics.reposts++;
      } else if (item.isReply) {
        analytics.replies++;
        if (item.isThread) {
          analytics.threads++;
        }
      } else {
        analytics.originalPosts++;
      }
    }

    return analytics;
  }

  /**
   * Handle API errors consistently
   * 
   * Converts various error types into BlueskyError instances with
   * appropriate error codes and scope information.
   * 
   * @param error - Original error from API call
   * @param method - API method that failed
   * @param actor - Actor parameter if applicable
   * @returns Standardized BlueskyError
   */
  private handleAPIError(error: any, method: string, actor?: string): BlueskyError {
    const actorInfo = actor ? ` for ${actor}` : '';
    
    // Check for scope-related errors
    if (error?.message?.includes('scope') || error?.message?.includes('Scope')) {
      return new BlueskyError(
        `Insufficient OAuth scope for ${method}${actorInfo}`,
        'INSUFFICIENT_SCOPE',
        403,
        this.extractRequiredScope(error.message)
      );
    }

    // Check for authentication errors
    if (error?.status === 401 || error?.message?.includes('Unauthorized')) {
      return new BlueskyError(
        `Authentication failed for ${method}${actorInfo}`,
        'AUTH_REQUIRED',
        401
      );
    }

    // Check for rate limiting
    if (error?.status === 429) {
      return new BlueskyError(
        `Rate limit exceeded for ${method}${actorInfo}`,
        'RATE_LIMITED',
        429
      );
    }

    // Check for not found errors
    if (error?.status === 404) {
      return new BlueskyError(
        `Resource not found for ${method}${actorInfo}`,
        'NOT_FOUND',
        404
      );
    }

    // Generic API error
    return new BlueskyError(
      `API call failed for ${method}${actorInfo}: ${error?.message || 'Unknown error'}`,
      'API_ERROR',
      error?.status || 500,
      undefined,
      error
    );
  }

  /**
   * Create standardized error response
   * 
   * Creates a consistent error response structure for API failures.
   * 
   * @param error - Original error
   * @param method - API method that failed
   * @param actor - Actor parameter if applicable
   * @returns Standardized error response
   */
  private createErrorResponse(error: any, method: string, actor?: string): APIResponse<any> {
    const blueskyError = error instanceof BlueskyError ? 
      error : 
      this.handleAPIError(error, method, actor);

    return {
      success: false,
      error: {
        message: blueskyError.message,
        code: blueskyError.code || 'UNKNOWN_ERROR',
        requiredScope: blueskyError.requiredScope,
        explanation: this.getErrorExplanation(blueskyError.code || 'UNKNOWN_ERROR', method)
      },
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID()
      }
    };
  }

  /**
   * Extract required scope from error message
   * 
   * @param errorMessage - Error message containing scope information
   * @returns Extracted scope string or undefined
   */
  private extractRequiredScope(errorMessage: string): string | undefined {
    const scopeMatch = errorMessage.match(/scope[:\s]+['"](.*?)['"]/) || 
                      errorMessage.match(/rpc:([^?\s]+)/);
    return scopeMatch?.[1];
  }

  /**
   * Get educational explanation for error codes
   * 
   * @param code - Error code
   * @param method - API method that failed
   * @returns Human-readable explanation
   */
  private getErrorExplanation(code: string, method: string): string {
    const explanations: Record<string, string> = {
      'INSUFFICIENT_SCOPE': `The ${method} API requires additional OAuth scopes that are not available in the current session. You may need to re-authenticate with broader permissions.`,
      'AUTH_REQUIRED': `Authentication is required for the ${method} API. Please ensure you are logged in with a valid session.`,
      'RATE_LIMITED': `Too many requests to the ${method} API. Please wait before making additional requests.`,
      'NOT_FOUND': `The requested resource for ${method} was not found. The user or content may not exist.`,
      'API_ERROR': `An unexpected error occurred while calling the ${method} API. Please try again later.`
    };

    return explanations[code] || `An error occurred while calling the ${method} API.`;
  }
}

// Default singleton instance for convenience
let defaultInstance: BlueskyAPIService | null = null;

/**
 * Get the default API service instance
 * 
 * Creates a singleton instance with default configuration for convenience.
 * 
 * @returns Default API service instance
 */
export function getDefaultAPIService(): BlueskyAPIService {
  if (!defaultInstance) {
    defaultInstance = new BlueskyAPIService();
  }
  return defaultInstance;
}

/**
 * Reset the default instance (useful for testing)
 */
export function resetDefaultAPIService(): void {
  defaultInstance = null;
}