import type { Meta, StoryObj } from '@storybook/sveltekit';
import FeedDisplay from './FeedDisplay.svelte';

const meta: Meta<FeedDisplay> = {
	title: 'Dashboard/FeedDisplay',
	component: FeedDisplay,
	parameters: {
		layout: 'padded',
		docs: {
			description: {
				component: 'Feed display component for showing lists of posts (timeline, author feed, likes). Uses PostComponent for individual post rendering with DaisyUI styling.'
			}
		}
	},
	argTypes: {
		title: {
			control: 'text',
			description: 'Title displayed at the top of the feed'
		},
		feedData: {
			control: 'object',
			description: 'Array of feed items to display'
		},
		showCopyButton: {
			control: 'boolean',
			description: 'Whether to show copy JSON buttons on posts'
		},
		showRepostIndicator: {
			control: 'boolean',
			description: 'Whether to show repost indicators on posts'
		},
		maxItems: {
			control: 'number',
			description: 'Maximum number of items to display'
		},
		copyButtonPrefix: {
			control: 'text',
			description: 'Prefix for copy button IDs'
		},
		copyPostJson: {
			action: 'copyPostJson',
			description: 'Function to handle copying post JSON'
		}
	},
	tags: ['autodocs']
};

export default meta;
type Story = StoryObj<typeof meta>;

const mockCopyFunction = async (postData: any, postIndex?: string | number) => {
	console.log('Copy JSON called with:', { postData, postIndex });
};

const sampleFeed = [
	{
		post: {
			author: {
				handle: 'alice.bsky.social',
				displayName: 'Alice Smith',
				avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=64&h=64&fit=crop&crop=face'
			},
			record: {
				text: 'Just discovered this amazing new protocol! The decentralized web is really happening. 🚀',
				createdAt: '2024-01-15T10:30:00Z'
			},
			likeCount: 42,
			repostCount: 15,
			replyCount: 8,
			indexedAt: '2024-01-15T10:30:00Z'
		}
	},
	{
		post: {
			author: {
				handle: 'bob.bsky.social',
				displayName: 'Bob Wilson',
				avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face'
			},
			record: {
				text: 'Working on some exciting new features for our decentralized social platform. Open source collaboration at its finest!',
				createdAt: '2024-01-15T09:15:00Z'
			},
			likeCount: 28,
			repostCount: 7,
			replyCount: 12,
			indexedAt: '2024-01-15T09:15:00Z'
		}
	},
	{
		post: {
			author: {
				handle: 'charlie.bsky.social',
				displayName: 'Charlie Dev'
			},
			record: {
				text: 'The future of social media is decentralized. No more silos, no more vendor lock-in. Users own their data and their social graph.',
				createdAt: '2024-01-15T08:45:00Z'
			},
			likeCount: 156,
			repostCount: 73,
			replyCount: 45,
			indexedAt: '2024-01-15T08:45:00Z'
		}
	}
];

export const TimelineFeed: Story = {
	args: {
		title: 'Timeline Feed',
		feedData: sampleFeed,
		showCopyButton: true,
		showRepostIndicator: true,
		maxItems: 5,
		copyButtonPrefix: 'timeline',
		copyPostJson: mockCopyFunction
	}
};

export const AuthorFeed: Story = {
	args: {
		title: 'Author Posts',
		feedData: sampleFeed.map(item => ({
			...item,
			post: {
				...item.post,
				author: {
					handle: 'author.bsky.social',
					displayName: 'The Author',
					avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face'
				}
			}
		})),
		showCopyButton: true,
		showRepostIndicator: true,
		maxItems: 5,
		copyButtonPrefix: 'author',
		copyPostJson: mockCopyFunction
	}
};

export const LikedPosts: Story = {
	args: {
		title: 'Liked Posts',
		feedData: sampleFeed,
		showCopyButton: true,
		showRepostIndicator: true,
		maxItems: 5,
		copyButtonPrefix: 'like',
		copyPostJson: mockCopyFunction
	}
};

export const LargeFeed: Story = {
	args: {
		title: 'Large Feed',
		feedData: Array.from({ length: 25 }, (_, i) => ({
			post: {
				author: {
					handle: `user${i + 1}.bsky.social`,
					displayName: `User ${i + 1}`,
					avatar: i % 4 === 0 ? `https://images.unsplash.com/photo-${1472099645785 + (i * 100)}?w=64&h=64&fit=crop&crop=face` : undefined
				},
				record: {
					text: `This is post number ${i + 1} in a large feed. Testing how the component handles pagination and large datasets.`,
					createdAt: new Date(Date.now() - i * 300000).toISOString()
				},
				likeCount: Math.floor(Math.random() * 100),
				repostCount: Math.floor(Math.random() * 25),
				replyCount: Math.floor(Math.random() * 50),
				indexedAt: new Date(Date.now() - i * 300000).toISOString()
			}
		})),
		showCopyButton: true,
		showRepostIndicator: true,
		maxItems: 8,
		copyButtonPrefix: 'large',
		copyPostJson: mockCopyFunction
	}
};

export const WithoutCopyButtons: Story = {
	args: {
		title: 'Simple Feed',
		feedData: sampleFeed.slice(0, 2),
		showCopyButton: false,
		showRepostIndicator: true,
		maxItems: 5,
		copyButtonPrefix: 'simple'
		// No copyPostJson function provided
	}
};

export const WithoutReposts: Story = {
	args: {
		title: 'Original Posts Only',
		feedData: sampleFeed,
		showCopyButton: true,
		showRepostIndicator: false,
		maxItems: 5,
		copyButtonPrefix: 'original',
		copyPostJson: mockCopyFunction
	}
};

export const CustomMaxItems: Story = {
	args: {
		title: 'Limited Feed (3 items)',
		feedData: sampleFeed,
		showCopyButton: true,
		showRepostIndicator: true,
		maxItems: 3,
		copyButtonPrefix: 'limited',
		copyPostJson: mockCopyFunction
	}
};

export const EmptyFeed: Story = {
	args: {
		title: 'Empty Feed',
		feedData: [],
		showCopyButton: true,
		showRepostIndicator: true,
		maxItems: 5,
		copyButtonPrefix: 'empty',
		copyPostJson: mockCopyFunction
	}
};