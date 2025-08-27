import type { Meta, StoryObj } from '@storybook/sveltekit';
import ApiResponseDisplay from './ApiResponseDisplay.svelte';

const meta: Meta<ApiResponseDisplay> = {
	title: 'Dashboard/ApiResponseDisplay',
	component: ApiResponseDisplay,
	parameters: {
		layout: 'padded',
		docs: {
			description: {
				component: 'API response display component that shows API results in various formats - profiles, feeds, user lists, or raw JSON. Uses DaisyUI cards, alerts, and mockup components for clean styling.'
			}
		}
	},
	argTypes: {
		demos: {
			control: 'object',
			description: 'Array of API demo objects with id, name, and description'
		},
		currentDemo: {
			control: 'text',
			description: 'ID of the currently selected demo'
		},
		apiData: {
			control: 'object',
			description: 'API response data to display'
		},
		apiError: {
			control: 'text',
			description: 'Error message if API call failed'
		},
		copyPostJson: {
			action: 'copyPostJson',
			description: 'Function to copy JSON data to clipboard'
		}
	},
	tags: ['autodocs']
};

export default meta;
type Story = StoryObj<typeof meta>;

const sampleDemos = [
	{ id: 'profile', name: 'Get Profile', description: 'Get your profile information' },
	{ id: 'timeline', name: 'Get Timeline', description: 'Get your home timeline feed' },
	{ id: 'author-feed', name: 'Get Author Feed', description: 'Get your own posts' },
	{ id: 'following', name: 'Get Following', description: 'Get users you follow' }
];

const mockCopyFunction = async (postData: any, postIndex?: string | number) => {
	console.log('Copy JSON called with:', { postData, postIndex });
};

export const NoData: Story = {
	args: {
		demos: sampleDemos,
		currentDemo: '',
		apiData: null,
		apiError: '',
		copyPostJson: mockCopyFunction
	}
};

export const ErrorState: Story = {
	args: {
		demos: sampleDemos,
		currentDemo: 'profile',
		apiData: null,
		apiError: 'Failed to fetch profile data. Authentication may have expired.',
		copyPostJson: mockCopyFunction
	}
};

export const ProfileData: Story = {
	args: {
		demos: sampleDemos,
		currentDemo: 'profile',
		apiData: {
			handle: 'johndoe.bsky.social',
			displayName: 'John Doe',
			description: 'Software developer interested in decentralized social networks and open protocols.',
			avatar: 'https://via.placeholder.com/64x64/3b82f6/ffffff?text=JD',
			followsCount: 234,
			followersCount: 567,
			postsCount: 89
		},
		apiError: '',
		copyPostJson: mockCopyFunction
	}
};

export const TimelineFeed: Story = {
	args: {
		demos: sampleDemos,
		currentDemo: 'timeline',
		apiData: {
			feed: [
				{
					post: {
						author: {
							handle: 'alice.bsky.social',
							displayName: 'Alice Smith',
							avatar: 'https://via.placeholder.com/40x40/ef4444/ffffff?text=A'
						},
						record: {
							text: 'Just discovered this amazing new protocol! The decentralized web is really happening.',
							createdAt: '2024-01-15T10:30:00Z'
						},
						likeCount: 12,
						repostCount: 5,
						replyCount: 3
					}
				},
				{
					post: {
						author: {
							handle: 'bob.bsky.social',
							displayName: 'Bob Wilson',
							avatar: 'https://via.placeholder.com/40x40/10b981/ffffff?text=B'
						},
						record: {
							text: 'Working on some exciting new features for our app. Open source collaboration at its finest! 🚀',
							createdAt: '2024-01-15T09:15:00Z'
						},
						likeCount: 8,
						repostCount: 2,
						replyCount: 1
					}
				}
			]
		},
		apiError: '',
		copyPostJson: mockCopyFunction
	}
};

export const FollowingList: Story = {
	args: {
		demos: sampleDemos,
		currentDemo: 'following',
		apiData: {
			follows: [
				{
					handle: 'alice.bsky.social',
					displayName: 'Alice Smith',
					description: 'UX designer passionate about accessible design and user research.',
					avatar: 'https://via.placeholder.com/40x40/ef4444/ffffff?text=A'
				},
				{
					handle: 'bob.bsky.social',
					displayName: 'Bob Wilson',
					description: 'Full-stack developer building the future of social media.',
					avatar: 'https://via.placeholder.com/40x40/10b981/ffffff?text=B'
				},
				{
					handle: 'carol.bsky.social',
					displayName: 'Carol Johnson',
					description: 'Product manager with 10+ years experience in tech startups.',
					avatar: 'https://via.placeholder.com/40x40/8b5cf6/ffffff?text=C'
				}
			]
		},
		apiError: '',
		copyPostJson: mockCopyFunction
	}
};

export const LargeDataset: Story = {
	args: {
		demos: sampleDemos,
		currentDemo: 'timeline',
		apiData: {
			feed: Array.from({ length: 12 }, (_, i) => ({
				post: {
					author: {
						handle: `user${i + 1}.bsky.social`,
						displayName: `User ${i + 1}`,
						avatar: `https://via.placeholder.com/40x40/3b82f6/ffffff?text=U${i + 1}`
					},
					record: {
						text: `This is post number ${i + 1} in a large feed dataset. Testing how the component handles many items.`,
						createdAt: new Date(Date.now() - i * 3600000).toISOString()
					},
					likeCount: Math.floor(Math.random() * 50),
					repostCount: Math.floor(Math.random() * 10),
					replyCount: Math.floor(Math.random() * 15)
				}
			}))
		},
		apiError: '',
		copyPostJson: mockCopyFunction
	}
};