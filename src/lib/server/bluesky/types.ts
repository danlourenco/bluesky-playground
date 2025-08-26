/**
 * @fileoverview TypeScript type definitions for Bluesky AT Protocol API responses
 * 
 * This file contains comprehensive type definitions for all Bluesky API responses,
 * OAuth flows, and internal application data structures. These types ensure
 * type safety throughout the application and serve as documentation for the
 * expected data structures.
 */

import type { Agent } from '@atproto/api';

// ============================================================================
// Base AT Protocol Types
// ============================================================================

/** Basic AT Protocol DID identifier */
export type DID = string;

/** AT Protocol URI for posts, profiles, etc. */
export type ATUri = string;

/** ISO 8601 timestamp string */
export type Timestamp = string;

/** Base interface for all AT Protocol records */
export interface ATProtocolRecord {
  $type: string;
  createdAt: Timestamp;
}

// ============================================================================
// User & Profile Types
// ============================================================================

/** User profile information from getProfile API */
export interface BlueskyProfile {
  did: DID;
  handle: string;
  displayName?: string;
  description?: string;
  avatar?: string;
  banner?: string;
  followsCount: number;
  followersCount: number;
  postsCount: number;
  indexedAt: Timestamp;
  createdAt: Timestamp;
  
  /** User's relationship to the authenticated user */
  viewer?: {
    muted: boolean;
    blockedBy: boolean;
    following?: ATUri;
    followedBy?: ATUri;
  };
  
  /** Profile labels and moderation info */
  labels: Label[];
  
  /** Associated verification info */
  associated?: {
    activitySubscription?: {
      allowSubscriptions: 'followers' | 'none';
    };
  };
  
  /** Verification status */
  verification?: {
    verifications: Verification[];
    verifiedStatus: 'valid' | 'invalid' | 'none';
    trustedVerifierStatus: 'none' | 'trusted';
  };
}

/** Verification information */
export interface Verification {
  issuer: DID;
  uri: ATUri;
  isValid: boolean;
  createdAt: Timestamp;
}

/** Content moderation label */
export interface Label {
  src: DID;
  uri: string;
  cid?: string;
  val: string;
  neg?: boolean;
  cts: Timestamp;
  exp?: Timestamp;
}

// ============================================================================
// Post & Content Types
// ============================================================================

/** Core post record structure */
export interface PostRecord extends ATProtocolRecord {
  $type: 'app.bsky.feed.post';
  text: string;
  langs?: string[];
  reply?: {
    root: { uri: ATUri; cid: string };
    parent: { uri: ATUri; cid: string };
  };
  embed?: PostEmbed;
  facets?: Facet[];
  tags?: string[];
}

/** Post embed content (images, external links, etc.) */
export interface PostEmbed {
  $type: string;
  images?: EmbedImage[];
  external?: EmbedExternal;
  record?: EmbedRecord;
}

/** Embedded image in a post */
export interface EmbedImage {
  image: BlobRef;
  alt: string;
  aspectRatio?: { width: number; height: number };
  thumb?: string;  // URL to thumbnail
  fullsize?: string;  // URL to full size image
}

/** External link embed */
export interface EmbedExternal {
  uri: string;
  title: string;
  description: string;
  thumb?: BlobRef;
}

/** Embedded record (quote post, etc.) */
export interface EmbedRecord {
  record: { uri: ATUri; cid: string };
}

/** Binary large object reference */
export interface BlobRef {
  $type: 'blob';
  ref: { $link: string };
  mimeType: string;
  size: number;
}

/** Rich text facet (mentions, links, hashtags) */
export interface Facet {
  index: { byteStart: number; byteEnd: number };
  features: FacetFeature[];
}

/** Rich text feature */
export interface FacetFeature {
  $type: 'app.bsky.richtext.facet#mention' | 'app.bsky.richtext.facet#link' | 'app.bsky.richtext.facet#tag';
  did?: DID;  // For mentions
  uri?: string;  // For links
  tag?: string;  // For hashtags
}

/** Complete post with metadata */
export interface BlueskyPost {
  uri: ATUri;
  cid: string;
  author: BlueskyProfile;
  record: PostRecord;
  embed?: PostEmbed;
  replyCount: number;
  repostCount: number;
  likeCount: number;
  quoteCount: number;
  indexedAt: Timestamp;
  
  /** User's interactions with this post */
  viewer?: {
    repost?: ATUri;
    like?: ATUri;
    threadMuted?: boolean;
    replyDisabled?: boolean;
    embeddingDisabled?: boolean;
  };
  
  labels: Label[];
}

// ============================================================================
// Feed & Timeline Types
// ============================================================================

/** Reason a post appears in a feed (repost, like, etc.) */
export interface FeedItemReason {
  $type: 'app.bsky.feed.defs#reasonRepost';
  by: BlueskyProfile;
  indexedAt: Timestamp;
}

/** Single item in a feed */
export interface FeedItem {
  post: BlueskyPost;
  reason?: FeedItemReason;
  reply?: {
    root: BlueskyPost;
    parent: BlueskyPost;
    grandparentAuthor?: BlueskyProfile;
  };
}

/** Enhanced feed item with additional computed data */
export interface EnrichedFeedItem extends FeedItem {
  /** Parent post data for replies (fetched separately) */
  parentPost?: BlueskyPost;
  
  /** Computed flags for UI */
  isRepost: boolean;
  isReply: boolean;
  isThread: boolean;
}

/** Feed response from getTimeline, getAuthorFeed, etc. */
export interface FeedResponse {
  feed: FeedItem[];
  cursor?: string;
}

/** Enhanced feed response with additional metadata */
export interface EnrichedFeedResponse extends FeedResponse {
  feed: EnrichedFeedItem[];
  
  /** Analytics about the feed content */
  analytics: {
    totalItems: number;
    originalPosts: number;
    reposts: number;
    replies: number;
    threads: number;
  };
  
  /** Profile totals if available */
  profileTotals?: {
    followsCount: number;
    followersCount: number;
    postsCount: number;
  };
}

// ============================================================================
// Thread & Conversation Types
// ============================================================================

/** Thread post with potential replies */
export interface ThreadPost {
  post: BlueskyPost;
  parent?: ThreadPost;
  replies?: ThreadPost[];
}

/** Complete thread response */
export interface ThreadResponse {
  thread: ThreadPost;
}

// ============================================================================
// Social Graph Types
// ============================================================================

/** Following/follower relationship */
export interface FollowRecord extends ATProtocolRecord {
  $type: 'app.bsky.graph.follow';
  subject: DID;
}

/** List of users being followed */
export interface FollowsResponse {
  follows: BlueskyProfile[];
  cursor?: string;
}

/** List of followers */
export interface FollowersResponse {
  followers: BlueskyProfile[];
  cursor?: string;
}

/** Enhanced follow response with profile totals */
export interface EnrichedFollowResponse {
  data: FollowsResponse | FollowersResponse;
  
  /** True total counts from profile (not just paginated results) */
  profileTotals: {
    followsCount: number;
    followersCount: number;
    postsCount: number;
  };
  
  /** Pagination analysis */
  pagination: {
    returned: number;
    limit: number;
    estimatedTotalPages: number;
  };
}

// ============================================================================
// OAuth & Session Types
// ============================================================================

/** OAuth session information */
export interface OAuthSession {
  sub: DID;  // User's DID
  iss: string;  // Issuer
  aud: string;  // Audience  
  iat: number;  // Issued at
  exp: number;  // Expires at
  scope: string;  // OAuth scope
  [key: string]: unknown;  // Additional session data
}

/** OAuth callback result */
export interface OAuthCallbackResult {
  success: boolean;
  session?: OAuthSession;
  userDid?: DID;
  error?: string;
  redirectTo?: string;
}

/** OAuth initialization parameters */
export interface OAuthInitParams {
  handle?: string;
  redirectUri?: string;
  scope?: string;
  state?: string;
}

// ============================================================================
// API Response Wrapper Types
// ============================================================================

/** Standard API response wrapper */
export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    requiredScope?: string;
    currentScope?: string;
    explanation?: string;
  };
  metadata?: {
    timestamp: Timestamp;
    requestId?: string;
    rateLimit?: {
      remaining: number;
      resetAt: Timestamp;
    };
  };
}

/** Paginated API response */
export interface PaginatedAPIResponse<T = unknown> extends APIResponse<T> {
  pagination?: {
    cursor?: string;
    hasMore: boolean;
    total?: number;
    limit: number;
    offset?: number;
  };
}

// ============================================================================
// Service Configuration Types
// ============================================================================

/** OAuth client configuration */
export interface OAuthClientConfig {
  clientId: string;
  clientName: string;
  clientUri: string;
  redirectUris: string[];
  scope: string;
  grantTypes: string[];
  responseTypes: string[];
  applicationType: 'native' | 'web';
  tokenEndpointAuthMethod: 'none' | 'client_secret_basic' | 'private_key_jwt';
  dpopBoundAccessTokens: boolean;
}

/** Service initialization options */
export interface BlueskyServiceOptions {
  publicUrl?: string;
  clientId?: string;
  developmentMode?: boolean;
  sessionTTL?: number;  // Session time-to-live in seconds
  apiTimeout?: number;  // API timeout in milliseconds
}

// ============================================================================
// Error Types
// ============================================================================

/** Bluesky-specific error */
export class BlueskyError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number,
    public requiredScope?: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'BlueskyError';
  }
}

/** OAuth-specific error */
export class OAuthError extends BlueskyError {
  constructor(
    message: string,
    code?: string,
    public state?: string,
    originalError?: unknown
  ) {
    super(message, code, undefined, undefined, originalError);
    this.name = 'OAuthError';
  }
}

// ============================================================================
// Utility Types
// ============================================================================

/** Extract the data type from an APIResponse */
export type ExtractAPIData<T> = T extends APIResponse<infer U> ? U : never;

/** Make all properties optional except specified keys */
export type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;

/** Authenticated agent instance */
export type AuthenticatedAgent = Agent;

/** Demo types for the dashboard */
export type DemoType = 
  | 'profile' 
  | 'timeline' 
  | 'author-feed' 
  | 'post-thread' 
  | 'likes' 
  | 'following' 
  | 'followers';

/** Demo configuration */
export interface DemoConfig {
  id: DemoType;
  name: string;
  description: string;
  requiresScope?: string;
  apiMethod: keyof BlueskyAPIService;
}