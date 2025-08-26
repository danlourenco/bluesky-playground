# SvelteKit Bluesky OAuth Guide

This is a demonstration project showing how to implement Bluesky OAuth authentication in SvelteKit using server-side OAuth flow with `@atproto/oauth-client-node`.

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

- **`src/lib/server/oauth.ts`** - OAuth client setup and session management
- **`src/routes/auth/login/+server.ts`** - Initiates OAuth flow
- **`src/routes/auth/callback/+server.ts`** - Handles OAuth callback
- **`src/routes/auth/logout/+server.ts`** - Clears session
- **`src/routes/dashboard/+page.server.ts`** - Demonstrates API calls
- **`static/client-metadata.json`** - OAuth client configuration

### Available API Demonstrations

Once logged in, you can test these API endpoints:
- **Get Profile** - Your profile information
- **Get Timeline** - Your home feed
- **Get Author Feed** - Your own posts  
- **Get Post Thread** - A post and its replies
- **Get Likes** - Posts you've liked
- **Get Following** - Users you follow
- **Get Followers** - Your followers

### Security Notes

- OAuth tokens are stored server-side only (never sent to browser)
- Sessions use HTTPOnly cookies
- CSRF protection via SameSite cookies
- Tokens auto-refresh when needed

### Environment Variables

The `.env` file contains:
- `PUBLIC_URL` - Your app's URL
- `OAUTH_CLIENT_ID` - Client metadata URL
- `OAUTH_HANDLE_RESOLVER` - Bluesky's handle resolver
- `SESSION_SECRET` - Cookie encryption key

For production, update these values and use HTTPS!

## Learning Resources

- [Bluesky API Docs](https://docs.bsky.app/)
- [AT Protocol Spec](https://atproto.com/)
- [OAuth Client Library](https://www.npmjs.com/package/@atproto/oauth-client-node)