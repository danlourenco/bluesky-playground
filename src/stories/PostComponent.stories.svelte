<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import PostComponent from '$lib/components/PostComponent.svelte';

  // Mock post data for different types of posts
  const basicPost = {
    post: {
      uri: "at://did:plc:example/app.bsky.feed.post/basic",
      cid: "basic123",
      author: {
        did: "did:plc:example",
        handle: "johndoe.bsky.social",
        displayName: "John Doe",
        avatar: "https://picsum.photos/48/48?random=10"
      },
      record: {
        $type: "app.bsky.feed.post",
        createdAt: "2025-01-20T10:00:00.000Z",
        text: "Just posted my first thought on Bluesky! This is a basic post with no media attachments. 🚀"
      },
      replyCount: 5,
      repostCount: 12,
      likeCount: 28,
      quoteCount: 3,
      indexedAt: "2025-01-20T10:00:01.000Z",
      viewer: {}
    }
  };

  const singleImagePost = {
    post: {
      uri: "at://did:plc:example/app.bsky.feed.post/image",
      cid: "image123",
      author: {
        did: "did:plc:example2",
        handle: "photographer.bsky.social", 
        displayName: "Alex Photo 📸",
        avatar: "https://picsum.photos/48/48?random=11"
      },
      record: {
        $type: "app.bsky.feed.post",
        createdAt: "2025-01-20T11:30:00.000Z",
        text: "Captured this beautiful sunset today! 🌅 The colors were absolutely incredible."
      },
      embed: {
        $type: "app.bsky.embed.images#view",
        images: [
          {
            thumb: "https://picsum.photos/400/300?random=1",
            fullsize: "https://picsum.photos/800/600?random=1",
            alt: "Beautiful sunset over mountains",
            aspectRatio: { width: 800, height: 600 }
          }
        ]
      },
      replyCount: 15,
      repostCount: 45,
      likeCount: 120,
      quoteCount: 8,
      indexedAt: "2025-01-20T11:30:01.000Z",
      viewer: { like: "at://did:plc:viewer/app.bsky.feed.like/123" }
    }
  };

  const multipleImagesPost = {
    post: {
      uri: "at://did:plc:example/app.bsky.feed.post/multiimg",
      cid: "multiimg123",
      author: {
        did: "did:plc:example3",
        handle: "traveler.bsky.social",
        displayName: "Sarah Explorer",
        avatar: "https://picsum.photos/48/48?random=12"
      },
      record: {
        $type: "app.bsky.feed.post", 
        createdAt: "2025-01-20T14:15:00.000Z",
        text: "Amazing day exploring the city! Here are some highlights from my adventure 🏙️✨"
      },
      embed: {
        $type: "app.bsky.embed.images#view",
        images: [
          {
            thumb: "https://picsum.photos/200/200?random=2",
            fullsize: "https://picsum.photos/400/400?random=2", 
            alt: "City street view",
            aspectRatio: { width: 400, height: 400 }
          },
          {
            thumb: "https://picsum.photos/200/200?random=3",
            fullsize: "https://picsum.photos/400/400?random=3",
            alt: "Coffee shop interior",
            aspectRatio: { width: 400, height: 400 }
          },
          {
            thumb: "https://picsum.photos/200/200?random=4", 
            fullsize: "https://picsum.photos/400/400?random=4",
            alt: "Park fountain",
            aspectRatio: { width: 400, height: 400 }
          }
        ]
      },
      replyCount: 8,
      repostCount: 22,
      likeCount: 67,
      quoteCount: 4,
      indexedAt: "2025-01-20T14:15:01.000Z",
      viewer: {}
    }
  };

  const quoteTweetPost = {
    post: {
      uri: "at://did:plc:example/app.bsky.feed.post/quote",
      cid: "quote123",
      author: {
        did: "did:plc:example4",
        handle: "newsreader.bsky.social",
        displayName: "Maria News 📰",
        avatar: "https://picsum.photos/48/48?random=13"
      },
      record: {
        $type: "app.bsky.feed.post",
        createdAt: "2025-01-20T16:45:00.000Z",
        text: "This is such important information! Everyone should read this article 👇"
      },
      embed: {
        $type: "app.bsky.embed.record#view",
        record: {
          $type: "app.bsky.embed.record#viewRecord",
          uri: "at://did:plc:journalist/app.bsky.feed.post/original",
          cid: "original123",
          author: {
            did: "did:plc:journalist",
            handle: "journalist.com",
            displayName: "Tech Journalist",
            avatar: "https://picsum.photos/48/48?random=14",
            verification: {
              verifiedStatus: "valid",
              trustedVerifierStatus: "none"
            }
          },
          value: {
            $type: "app.bsky.feed.post",
            createdAt: "2025-01-20T15:00:00.000Z",
            text: "BREAKING: New study reveals significant advances in renewable energy technology. Solar panel efficiency increased by 40% in the past year! 🌱⚡"
          },
          embeds: [
            {
              $type: "app.bsky.embed.external#view",
              external: {
                uri: "https://example.com/renewable-energy-study",
                title: "Revolutionary Solar Panel Technology Shows 40% Efficiency Gains",
                description: "Scientists at leading research institutions have developed breakthrough solar technology that could transform the renewable energy landscape.",
                thumb: "https://picsum.photos/400/200?random=5"
              }
            }
          ],
          likeCount: 245,
          replyCount: 67,
          repostCount: 189,
          quoteCount: 45,
          indexedAt: "2025-01-20T15:00:01.000Z"
        }
      },
      replyCount: 12,
      repostCount: 34,
      likeCount: 89,
      quoteCount: 7,
      indexedAt: "2025-01-20T16:45:01.000Z",
      viewer: {}
    }
  };

  const repostPost = {
    post: {
      uri: "at://did:plc:original/app.bsky.feed.post/funny",
      cid: "funny123",
      author: {
        did: "did:plc:original",
        handle: "comedian.bsky.social",
        displayName: "Funny Person 😂",
        avatar: "https://picsum.photos/48/48?random=15"
      },
      record: {
        $type: "app.bsky.feed.post",
        createdAt: "2025-01-20T12:00:00.000Z",
        text: "Why do programmers prefer dark mode? Because light attracts bugs! 🐛💡 #programming #jokes"
      },
      replyCount: 45,
      repostCount: 156,
      likeCount: 289,
      quoteCount: 23,
      indexedAt: "2025-01-20T12:00:01.000Z",
      viewer: {}
    },
    reason: {
      $type: "app.bsky.feed.defs#reasonRepost",
      by: {
        did: "did:plc:example5",
        handle: "developer.bsky.social",
        displayName: "Code Master",
        avatar: "https://picsum.photos/48/48?random=16"
      },
      indexedAt: "2025-01-20T18:30:00.000Z"
    }
  };

  const videoPost = {
    post: {
      uri: "at://did:plc:example/app.bsky.feed.post/video",
      cid: "video123",
      author: {
        did: "did:plc:example6",
        handle: "creator.bsky.social",
        displayName: "Video Creator 🎬",
        avatar: "https://picsum.photos/48/48?random=17"
      },
      record: {
        $type: "app.bsky.feed.post",
        createdAt: "2025-01-20T20:00:00.000Z",
        text: "Check out this amazing time-lapse I captured! 🌅⏰"
      },
      embed: {
        $type: "app.bsky.embed.video#view",
        cid: "videocid123",
        playlist: "https://example.com/video/playlist.m3u8",
        thumbnail: "https://picsum.photos/800/450?random=6",
        alt: "Time-lapse of sunrise over city",
        aspectRatio: { width: 16, height: 9 }
      },
      replyCount: 25,
      repostCount: 78,
      likeCount: 234,
      quoteCount: 12,
      indexedAt: "2025-01-20T20:00:01.000Z",
      viewer: {}
    }
  };

  const { Story } = defineMeta({
    title: 'Components/PostComponent',
    component: PostComponent,
    tags: ['autodocs'],
    argTypes: {
      showCopyButton: {
        control: 'boolean',
        description: 'Show the copy JSON button on hover'
      },
      showRepostIndicator: {
        control: 'boolean', 
        description: 'Show repost indicator for reposted content'
      }
    },
    args: {
      showCopyButton: true,
      showRepostIndicator: true
    },
    parameters: {
      docs: {
        description: {
          component: 'A reusable post component that handles various types of Bluesky posts including text, images, videos, quote posts, and reposts. Supports HLS video playback and responsive image display.'
        }
      }
    }
  });
</script>

<!-- Basic text-only post -->
<Story 
  name="Basic Post" 
  args={{ 
    post: basicPost,
    copyButtonId: 'basic-copy'
  }}
/>

<!-- Post with single image -->
<Story 
  name="Single Image Post"
  args={{ 
    post: singleImagePost,
    copyButtonId: 'single-image-copy'
  }}
/>

<!-- Post with multiple images -->
<Story 
  name="Multiple Images Post"
  args={{ 
    post: multipleImagesPost,
    copyButtonId: 'multi-image-copy' 
  }}
/>

<!-- Quote tweet style post -->
<Story 
  name="Quote Post"
  args={{ 
    post: quoteTweetPost,
    copyButtonId: 'quote-copy'
  }}
/>

<!-- Repost/retweet style -->
<Story 
  name="Repost"
  args={{ 
    post: repostPost,
    copyButtonId: 'repost-copy'
  }}
/>

<!-- Video post -->
<Story 
  name="Video Post"
  args={{ 
    post: videoPost,
    copyButtonId: 'video-copy'
  }}
/>

<!-- Without copy button -->
<Story 
  name="No Copy Button"
  args={{ 
    post: basicPost,
    showCopyButton: false,
    copyButtonId: 'no-copy'
  }}
/>

<!-- Without repost indicator -->
<Story 
  name="No Repost Indicator"
  args={{ 
    post: repostPost,
    showRepostIndicator: false,
    copyButtonId: 'no-repost-indicator'
  }}
/>