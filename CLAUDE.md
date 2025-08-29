# Bluesky Playground - Claude Context

## Project Overview
A SvelteKit application for Bluesky/AT Protocol development with OAuth authentication. Recently renamed from `sveltekit-bsky-guide` to `bluesky-playground`.

## Architecture
- **Framework**: SvelteKit with TypeScript
- **Authentication**: Bluesky OAuth using @atproto/oauth-client-node
- **Services**: Service-oriented architecture with singleton pattern
- **Video Support**: HLS.js for .m3u8 streams
- **UI Components**: Reusable Svelte components

## Key Files & Structure

### Services (`src/lib/server/bluesky/`)
- `index.ts` - Main service orchestrator with `getBlueskyService()` singleton
- `oauth.ts` - OAuth service class with snake_case properties for PKCE flow
- `api.ts` - API service class with data enrichment
- `types.ts` - TypeScript type definitions

### Components
- `src/lib/components/PostComponent.svelte` - Reusable post renderer with:
  - HLS.js video support for proper video playback
  - Copy JSON functionality with hover-to-reveal buttons
  - Quote post rendering with embedded media
  - Consistent post display across all pages

### Pages
- Dashboard with author feed using PostComponent
- Debug page for testing individual posts
- OAuth callback handling

## Important Technical Details

### OAuth Configuration
- **Port**: Must run on 5174 (OAuth redirect configured for this port)
- **PKCE Flow**: Requires snake_case properties in OAuth service
- **Session Management**: Uses unified `getBlueskyService()` across all routes

### Video Handling
- HLS.js library required for .m3u8 video streams
- `setupVideo` action in PostComponent handles video initialization
- Works on debug page and dashboard author feed

### Development Commands
- `npm run dev` - Start development server on port 5174
- Kill any stale Vite processes if port conflicts occur

## Recent Major Changes

### Service Architecture Refactor
- Converted from direct function calls to service classes
- All routes now use `getBlueskyService()` for consistency
- Prevents session loss between different OAuth instances

### UI Improvements
- Created reusable PostComponent eliminating code duplication
- Added copy JSON functionality to posts
- Implemented comprehensive video support

### Documentation Updates
- Updated README_OAUTH.md and README_BSKY.md to reflect service architecture
- Documents new file structure and service classes
- Includes code examples using `getBlueskyService()`

## Known Issues & Solutions

### OAuth Errors
- **500 errors on sign in**: Usually due to port mismatch or stale processes
- **Solution**: Kill stale Vite processes, ensure server runs on port 5174

### Video Playback
- **Videos not playing**: Missing HLS.js support for .m3u8 streams  
- **Solution**: PostComponent includes HLS.js integration

### Session Loss
- **Routes losing authentication**: Different OAuth service instances
- **Solution**: All routes must use `getBlueskyService()` singleton

## Git Workflow
- **Main Branch**: `main`
- **Feature Branches**: Use for major changes (e.g., `feature/oauth-refactor`)
- **Remote**: Currently removed (repository being renamed)

## Development Notes
- Always test OAuth flow on port 5174
- Use PostComponent for all post rendering
- Follow existing TypeScript patterns and service architecture
- HLS.js handles video playback automatically in PostComponent
- Copy JSON functionality provides debugging capabilities

## Next Steps Ideas
- Consider adding more post interaction features
- Expand video format support beyond HLS
- Add more comprehensive error handling
- Implement additional AT Protocol features