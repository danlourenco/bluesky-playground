# Bluesky Playground

A SvelteKit application demonstrating OAuth authentication and API integration with Bluesky/AT Protocol.

## What is this?

An educational example showing how to build a full-featured Bluesky client with:
- Server-side OAuth 2.0 authentication with PKCE
- Complete AT Protocol API integration  
- Modern UI with video support and post rendering
- TypeScript service architecture

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server (must be on port 5174)
npm run dev

# Open browser
http://localhost:5174
```

Click "Sign in with Bluesky" and explore the dashboard to see various API demonstrations.

## Features

- **OAuth Authentication** - Secure server-side OAuth flow
- **API Demonstrations** - Timeline, posts, followers, likes, and more
- **Rich Post Display** - Videos, images, quotes, and replies
- **Debug Interface** - Test post rendering with JSON
- **Responsive Design** - Built with DaisyUI and TailwindCSS

## Documentation

Detailed technical documentation is available in the `/docs` folder:

- [OAuth Implementation](./docs/oauth-implementation.md) - Deep dive into OAuth flow
- [Architecture Guide](./docs/architecture.md) - Service patterns and component structure  
- [API Integration](./docs/api-guide.md) - Working with Bluesky APIs
- [Deployment Guide](./docs/deployment.md) - Production deployment instructions
- [OAuth Explained](./docs/oauth-explained.md) - Beginner-friendly OAuth guide

## Project Structure

```
src/
├── lib/server/bluesky/  # Backend service layer
├── lib/components/      # Reusable UI components
└── routes/              # SvelteKit routes
    ├── auth/           # OAuth endpoints
    ├── dashboard/      # Main application
    └── debug/          # Developer tools
```

## Development

The application uses the AT Protocol localhost exception for OAuth, eliminating complex setup during development. Simply run the dev server on port 5174 and you're ready to go.

For production deployment, see the [Deployment Guide](./docs/deployment.md).

## Tech Stack

- [SvelteKit](https://kit.svelte.dev/) - Full-stack framework
- [AT Protocol](https://atproto.com/) - Decentralized social protocol
- [DaisyUI](https://daisyui.com/) - Component library
- [TypeScript](https://www.typescriptlang.org/) - Type safety

## License

MIT - Feel free to use this as a reference for your own projects!

## Resources

- [Bluesky API Docs](https://docs.bsky.app/)
- [AT Protocol Specification](https://atproto.com/)
- [@atproto/oauth-client-node](https://www.npmjs.com/package/@atproto/oauth-client-node)
