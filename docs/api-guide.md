# API Integration Guide

This guide covers how to work with Bluesky/AT Protocol APIs, including authentication, pagination, error handling, and practical examples.

## Available API Endpoints

The application demonstrates these core Bluesky APIs:

| API | Description | Scope Required |
|-----|------------|----------------|
| `getProfile` | User profile information | `atproto` |
| `getTimeline` | Home feed | `transition:generic` |
| `getAuthorFeed` | User's posts | `transition:generic` |
| `getPostThread` | Post with replies | `transition:generic` |
| `getLikes` | Posts user liked | `transition:generic` |
| `getFollowing` | Accounts user follows | `transition:generic` |
| `getFollowers` | User's followers | `transition:generic` |

## Using the Service Layer

### Basic API Call Pattern

```typescript
// Get the service singleton
const bluesky = getBlueskyService();

// Execute API call
const result = await bluesky.executeDemoAPI(
  userDid,        // User's DID from session
  'timeline',     // API type
  userDid,        // Actor (for user-specific APIs)
  25              // Limit
);

// Handle response
if (result.success) {
  const timelineData = result.data;
  // Process data...
} else {
  console.error('API failed:', result.error);
}
```

### Direct Agent Usage

For custom API calls not covered by the service:

```typescript
const bluesky = getBlueskyService();
const agent = await bluesky.getAuthenticatedAgent(userDid);

// Custom API call
const response = await agent.api.com.atproto.repo.listRecords({
  repo: userDid,
  collection: 'app.bsky.feed.post',
  limit: 100
});
```

## API Response Structures

### Profile Response

```typescript
interface ProfileResponse {
  did: string;
  handle: string;
  displayName?: string;
  description?: string;
  avatar?: string;
  banner?: string;
  followersCount?: number;
  followsCount?: number;
  postsCount?: number;
  labels?: Array<Label>;
  viewer?: {
    muted?: boolean;
    blockedBy?: boolean;
    blocking?: string;
    following?: string;
    followedBy?: string;
  };
}
```

### Timeline Response

```typescript
interface TimelineResponse {
  feed: Array<{
    post: PostView;
    reason?: {
      $type: 'app.bsky.feed.defs#reasonRepost';
      by: ProfileViewBasic;
      indexedAt: string;
    };
    reply?: {
      parent: PostView;
      root: PostView;
    };
  }>;
  cursor?: string;
}
```

### Post Structure

```typescript
interface PostView {
  uri: string;
  cid: string;
  author: ProfileView;
  record: {
    $type: 'app.bsky.feed.post';
    text: string;
    createdAt: string;
    embed?: EmbedView;
    reply?: ReplyRef;
    langs?: string[];
    facets?: Facet[];
  };
  replyCount?: number;
  repostCount?: number;
  likeCount?: number;
  viewer?: {
    repost?: string;
    like?: string;
  };
}
```

## Pagination Patterns

### Basic Pagination

Most APIs support cursor-based pagination:

```typescript
async function getAllFollowers(agent: Agent, actor: string) {
  const allFollowers = [];
  let cursor = undefined;
  
  do {
    const response = await agent.getFollowers({
      actor,
      limit: 100,
      cursor
    });
    
    allFollowers.push(...response.data.followers);
    cursor = response.data.cursor;
    
    // Optional: Add delay to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 100));
  } while (cursor);
  
  return allFollowers;
}
```

### Pagination with Progress

```typescript
async function getTimelineWithProgress(
  agent: Agent, 
  onProgress: (count: number) => void
) {
  const posts = [];
  let cursor = undefined;
  let page = 0;
  
  while (posts.length < 500 && cursor !== null) {
    const response = await agent.getTimeline({
      limit: 50,
      cursor
    });
    
    posts.push(...response.data.feed);
    cursor = response.data.cursor || null;
    page++;
    
    onProgress(posts.length);
    
    if (page >= 10) break; // Safety limit
  }
  
  return posts;
}
```

## Error Handling

### Common Error Types

```typescript
enum BlueskyErrorCode {
  INVALID_REQUEST = 'InvalidRequest',
  AUTHENTICATION_REQUIRED = 'AuthenticationRequired',
  FORBIDDEN = 'Forbidden',
  NOT_FOUND = 'NotFound',
  RATE_LIMIT_EXCEEDED = 'RateLimitExceeded',
  INTERNAL_SERVER_ERROR = 'InternalServerError'
}
```

### Error Handling Strategy

```typescript
async function safeAPICall(operation: () => Promise<any>) {
  try {
    return await operation();
  } catch (error) {
    if (error.status === 429) {
      // Rate limited - wait and retry
      await new Promise(resolve => setTimeout(resolve, 5000));
      return await operation();
    }
    
    if (error.status === 401) {
      // Session expired - need to re-authenticate
      throw new Error('Session expired. Please login again.');
    }
    
    if (error.status === 403) {
      // Forbidden - check scopes
      throw new Error('Insufficient permissions for this operation.');
    }
    
    // Unknown error
    console.error('API error:', error);
    throw new Error('An unexpected error occurred.');
  }
}
```

## Data Enrichment Examples

### Enriching Timeline Posts

```typescript
async function enrichTimelinePosts(agent: Agent, posts: any[]) {
  return Promise.all(posts.map(async (item) => {
    // Add parent post for replies
    if (item.post.record?.reply?.parent?.uri) {
      try {
        const parentThread = await agent.getPostThread({
          uri: item.post.record.reply.parent.uri,
          depth: 0
        });
        item.parentPost = parentThread.data.thread.post;
      } catch (error) {
        console.error('Failed to fetch parent:', error);
      }
    }
    
    // Add author details for reposts
    if (item.reason?.$type === 'app.bsky.feed.defs#reasonRepost') {
      item.isRepost = true;
      item.repostAuthor = item.reason.by;
    }
    
    return item;
  }));
}
```

### Building Thread Trees

```typescript
interface ThreadNode {
  post: PostView;
  replies: ThreadNode[];
  depth: number;
}

async function buildThreadTree(
  agent: Agent, 
  rootUri: string
): Promise<ThreadNode> {
  const thread = await agent.getPostThread({
    uri: rootUri,
    depth: 6 // Maximum depth
  });
  
  function processThread(node: any, depth = 0): ThreadNode {
    return {
      post: node.post,
      depth,
      replies: (node.replies || []).map(
        reply => processThread(reply, depth + 1)
      )
    };
  }
  
  return processThread(thread.data.thread);
}
```

## Media Handling

### Processing Post Media

```typescript
function getMediaFromPost(post: PostView) {
  const embed = post.record.embed;
  
  if (!embed) return null;
  
  switch (embed.$type) {
    case 'app.bsky.embed.images':
      return {
        type: 'images',
        items: embed.images.map(img => ({
          thumb: img.thumb,
          fullsize: img.fullsize,
          alt: img.alt
        }))
      };
      
    case 'app.bsky.embed.video':
      return {
        type: 'video',
        playlist: embed.playlist, // HLS stream
        thumbnail: embed.thumbnail,
        alt: embed.alt
      };
      
    case 'app.bsky.embed.external':
      return {
        type: 'external',
        uri: embed.external.uri,
        title: embed.external.title,
        description: embed.external.description,
        thumb: embed.external.thumb
      };
      
    case 'app.bsky.embed.record':
      return {
        type: 'quote',
        record: embed.record
      };
      
    default:
      return null;
  }
}
```

## Creating Posts

### Basic Post Creation

```typescript
async function createPost(
  agent: Agent, 
  text: string,
  options?: {
    reply?: { root: string; parent: string };
    embed?: any;
    langs?: string[];
  }
) {
  const post = {
    $type: 'app.bsky.feed.post',
    text,
    createdAt: new Date().toISOString(),
    ...options
  };
  
  return await agent.post(post);
}
```

### Post with Media

```typescript
async function postWithImage(
  agent: Agent,
  text: string,
  imagePath: string
) {
  // Upload image
  const imageBlob = await agent.uploadBlob(
    fs.readFileSync(imagePath),
    { encoding: 'image/jpeg' }
  );
  
  // Create post with embed
  return await createPost(agent, text, {
    embed: {
      $type: 'app.bsky.embed.images',
      images: [{
        alt: 'Image description',
        image: imageBlob.data.blob
      }]
    }
  });
}
```

## Search Operations

### Searching Posts

```typescript
async function searchPosts(
  agent: Agent,
  query: string,
  options?: {
    since?: string;
    until?: string;
    author?: string;
    limit?: number;
  }
) {
  const params = new URLSearchParams({
    q: query,
    limit: String(options?.limit || 25)
  });
  
  if (options?.author) {
    params.append('author', options.author);
  }
  if (options?.since) {
    params.append('since', options.since);
  }
  if (options?.until) {
    params.append('until', options.until);
  }
  
  return await agent.api.app.bsky.feed.searchPosts({ params });
}
```

## Real-time Updates

### Polling for Updates

```typescript
class TimelinePoller {
  private intervalId?: NodeJS.Timeout;
  
  startPolling(
    agent: Agent,
    onUpdate: (posts: any[]) => void,
    interval = 30000 // 30 seconds
  ) {
    let lastSeen: string | undefined;
    
    this.intervalId = setInterval(async () => {
      try {
        const timeline = await agent.getTimeline({ limit: 20 });
        
        if (!lastSeen) {
          lastSeen = timeline.data.feed[0]?.post.uri;
          onUpdate(timeline.data.feed);
          return;
        }
        
        // Find new posts
        const newPosts = [];
        for (const item of timeline.data.feed) {
          if (item.post.uri === lastSeen) break;
          newPosts.push(item);
        }
        
        if (newPosts.length > 0) {
          lastSeen = newPosts[0].post.uri;
          onUpdate(newPosts);
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, interval);
  }
  
  stopPolling() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}
```

## Rate Limiting

### Respecting Rate Limits

```typescript
class RateLimiter {
  private requests: number[] = [];
  private readonly maxRequests = 100;
  private readonly timeWindow = 60000; // 1 minute
  
  async throttle<T>(operation: () => Promise<T>): Promise<T> {
    // Remove old requests
    const now = Date.now();
    this.requests = this.requests.filter(
      time => now - time < this.timeWindow
    );
    
    // Check if we can make a request
    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = this.requests[0];
      const waitTime = this.timeWindow - (now - oldestRequest);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    // Make the request
    this.requests.push(now);
    return await operation();
  }
}

// Usage
const limiter = new RateLimiter();
const result = await limiter.throttle(() => 
  agent.getTimeline({ limit: 50 })
);
```

## Testing API Calls

### Mocking API Responses

```typescript
class MockAgent {
  async getProfile(params: { actor: string }) {
    return {
      data: {
        did: 'did:plc:mock',
        handle: 'test.user',
        displayName: 'Test User',
        followersCount: 100,
        followsCount: 50,
        postsCount: 250
      }
    };
  }
  
  async getTimeline(params: { limit: number }) {
    return {
      data: {
        feed: Array(params.limit).fill(null).map((_, i) => ({
          post: createMockPost(i),
          reason: i % 3 === 0 ? createMockRepost() : undefined
        })),
        cursor: 'mock-cursor'
      }
    };
  }
}
```

## Best Practices

### 1. Always Handle Errors

```typescript
const result = await bluesky.executeDemoAPI(...);
if (!result.success) {
  // Handle error appropriately
  return fail(400, { error: result.error });
}
```

### 2. Use Appropriate Limits

```typescript
// Don't request more than needed
const posts = await agent.getAuthorFeed({
  actor: did,
  limit: 25  // Start small
});
```

### 3. Cache When Possible

```typescript
const profileCache = new Map();

async function getCachedProfile(agent: Agent, did: string) {
  if (profileCache.has(did)) {
    return profileCache.get(did);
  }
  
  const profile = await agent.getProfile({ actor: did });
  profileCache.set(did, profile);
  
  // Clear cache after 5 minutes
  setTimeout(() => profileCache.delete(did), 5 * 60 * 1000);
  
  return profile;
}
```

### 4. Validate Input

```typescript
function validateHandle(handle: string): boolean {
  return /^([a-z0-9-]+\.)+[a-z]+$/.test(handle);
}

function validateDID(did: string): boolean {
  return did.startsWith('did:plc:') || did.startsWith('did:web:');
}
```

### 5. Use TypeScript

```typescript
import type { 
  ProfileView, 
  PostView, 
  FeedViewPost 
} from '@atproto/api/dist/client/types/app/bsky/feed/defs';

function processPost(post: PostView): ProcessedPost {
  // Type-safe processing
}
```