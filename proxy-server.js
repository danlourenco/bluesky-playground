#!/usr/bin/env node
// Simple proxy server to forward port 80 to the SvelteKit dev server
// This solves the OAuth redirect URI port issue

const http = require('http');
const httpProxy = require('http-proxy');

const TARGET_PORT = 5176; // SvelteKit dev server port
const PROXY_PORT = 80;

const proxy = httpProxy.createProxyServer({});

const server = http.createServer((req, res) => {
  console.log(`Proxying ${req.method} ${req.url} to localhost:${TARGET_PORT}`);
  
  proxy.web(req, res, {
    target: `http://127.0.0.1:${TARGET_PORT}`,
    changeOrigin: true
  });
});

proxy.on('error', (err, req, res) => {
  console.error('Proxy error:', err.message);
  res.writeHead(500, {
    'Content-Type': 'text/plain'
  });
  res.end('Proxy error: ' + err.message);
});

server.listen(PROXY_PORT, '127.0.0.1', () => {
  console.log(`OAuth proxy server running on http://127.0.0.1:${PROXY_PORT}`);
  console.log(`Forwarding to SvelteKit dev server on port ${TARGET_PORT}`);
  console.log('Now OAuth redirects to port 80 will work correctly!');
});

process.on('SIGINT', () => {
  console.log('\nShutting down proxy server...');
  server.close(() => {
    console.log('Proxy server stopped.');
    process.exit(0);
  });
});