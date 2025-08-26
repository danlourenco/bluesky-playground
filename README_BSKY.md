# SvelteKit Bluesky OAuth Guide

A comprehensive educational example demonstrating **server-side OAuth authentication** with Bluesky using the AT Protocol. This project features a **refactored service-oriented architecture** with TypeScript classes, comprehensive testing, and modern UI components.

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to `http://localhost:5173`

4. **Sign in:**
   Click "Sign in with Bluesky" - you'll be redirected to Bluesky to authorize the app

## How It Works

### OAuth Flow
1. User clicks login → redirected to `/auth/login`
2. Server creates OAuth client and generates authorization URL
3. User is redirected to Bluesky to authorize
4. Bluesky redirects back to `/auth/callback` with authorization code
5. Server exchanges code for tokens and creates session
6. User is redirected to `/dashboard` with active session

### Key Files

**Refactored Service Architecture:**
- **`src/lib/server/bluesky/types.ts`** - Comprehensive TypeScript type definitions
- **`src/lib/server/bluesky/oauth.ts`** - OAuth service class with PKCE & session management
- **`src/lib/server/bluesky/api.ts`** - API service class with data enrichment
- **`src/lib/server/bluesky/index.ts`** - Main service orchestrator & singleton factory

**UI Components:**
- **`src/lib/components/PostComponent.svelte`** - Reusable post rendering with HLS video support

**Routes:**
- **`src/routes/+page.server.ts`** - OAuth callback handling
- **`src/routes/auth/login/+server.ts`** - Initiates OAuth flow
- **`src/routes/auth/logout/+server.ts`** - Clears session
- **`src/routes/dashboard/+page.server.ts`** - API demonstrations using services
- **`src/routes/debug/+page.svelte`** - JSON debugging interface

**Configuration:**
- **`static/client-metadata.json`** - OAuth client configuration

### Available API Demonstrations

Once logged in, you can test these API endpoints with **enhanced UI features**:

- **Get Profile** - Your profile information with copy JSON button
- **Get Timeline** - Your home feed with video support & post copying
- **Get Author Feed** - Your own posts with repost detection  
- **Get Post Thread** - A post and its replies with nested UI
- **Get Likes** - Posts you've liked with engagement stats
- **Get Following** - Users you follow (paginated with totals)
- **Get Followers** - Your followers (paginated with totals)

### New Features

**🐛 Debug Page** (`/debug`):
- Paste any post JSON to test UI rendering
- Validate JSON structure and fix display issues
- Test video playback without losing context
- Direct link from dashboard header

**📱 Enhanced UI**:
- **HLS.js Video Support**: Plays .m3u8 video streams properly
- **Copy JSON Buttons**: Hover over any post to copy its JSON data
- **Quote Post Rendering**: Nested posts with embedded media support
- **Reusable Components**: Consistent post display across all pages

### Architecture Benefits

**🏗️ Service-Oriented Design**:
- **Type Safety**: Comprehensive TypeScript interfaces for all API responses
- **Error Handling**: Consistent error handling across all service methods
- **Testability**: Easily mockable service classes for unit testing
- **Separation of Concerns**: OAuth, API, and UI logic cleanly separated
- **Data Enrichment**: Automatic enhancement of API responses (e.g., parent posts for replies)

### Security Notes

- **OAuth tokens are stored server-side only** (never sent to browser)
- **Sessions use HTTPOnly cookies** with SameSite protection
- **CSRF protection** via OAuth state parameter + SameSite cookies
- **Tokens auto-refresh** when needed through service layer
- **Shared session stores** prevent token loss across requests

### Environment Variables

The service classes automatically configure based on environment:

```bash
# .env (optional - services use sensible defaults)
PUBLIC_URL=http://127.0.0.1:5174      # Auto-detected from Vite
CLIENT_ID=http://localhost?...         # Auto-generated for localhost development
NODE_ENV=development                   # Auto-detected
```

**Development**: Services automatically generate localhost-compatible OAuth client configuration
**Production**: Update `PUBLIC_URL` and `CLIENT_ID` for your domain and use HTTPS

### Code Examples

**Using the Service Architecture**:
```typescript
// Get the singleton service instance
const bluesky = getBlueskyService();

// Execute any API with consistent interface
const result = await bluesky.executeDemoAPI(
  userDid, 
  'timeline',  // API type
  userDid,     // Actor identifier  
  10           // Limit
);

if (result.success) {
  console.log('Timeline data:', result.data);
} else {
  console.error('API error:', result.error);
}

// Check authentication status
const isValid = await bluesky.hasValidSession(userDid);
```

## Learning Resources

- [Bluesky API Docs](https://docs.bsky.app/)
- [AT Protocol Spec](https://atproto.com/)
- [OAuth Client Library](https://www.npmjs.com/package/@atproto/oauth-client-node)