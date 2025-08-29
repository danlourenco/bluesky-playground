import type { Meta, StoryObj } from '@storybook/sveltekit';
import ProfileDisplay from './ProfileDisplay.svelte';

const meta: Meta<ProfileDisplay> = {
	title: 'Dashboard/ProfileDisplay',
	component: ProfileDisplay,
	parameters: {
		layout: 'padded',
		docs: {
			description: {
				component: 'Profile display component showing user avatar, name, bio, and stats. Uses DaisyUI avatar and card components for clean styling.'
			}
		}
	},
	argTypes: {
		profileData: {
			control: 'object',
			description: 'Profile data object containing user information'
		},
		copyPostJson: {
			action: 'copyPostJson',
			description: 'Optional function to copy profile JSON to clipboard'
		}
	},
	tags: ['autodocs']
};

export default meta;
type Story = StoryObj<typeof meta>;

const mockCopyFunction = async (postData: any, postIndex?: string | number) => {
	console.log('Copy JSON called with:', { postData, postIndex });
};

export const Default: Story = {
	args: {
		profileData: {
			handle: 'johndoe.bsky.social',
			displayName: 'John Doe',
			description: 'Software developer passionate about decentralized social networks and open protocols. Building the future of social media.',
			avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face',
			followsCount: 234,
			followersCount: 567,
			postsCount: 89
		},
		copyPostJson: mockCopyFunction
	}
};

export const WithoutDisplayName: Story = {
	args: {
		profileData: {
			handle: 'minimal.user',
			description: 'Just a handle, no display name set.',
			followsCount: 12,
			followersCount: 34,
			postsCount: 5
		},
		copyPostJson: mockCopyFunction
	}
};

export const WithoutDescription: Story = {
	args: {
		profileData: {
			handle: 'quiet.user',
			displayName: 'Quiet User',
			avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=64&h=64&fit=crop&crop=face',
			followsCount: 100,
			followersCount: 50,
			postsCount: 25
		},
		copyPostJson: mockCopyFunction
	}
};

export const WithoutCopyButton: Story = {
	args: {
		profileData: {
			handle: 'example.user',
			displayName: 'Example User',
			description: 'Profile display without copy functionality.',
			avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face',
			followsCount: 45,
			followersCount: 123,
			postsCount: 67
		}
		// No copyPostJson function provided
	}
};

export const HighNumbers: Story = {
	args: {
		profileData: {
			handle: 'popular.creator',
			displayName: 'Popular Creator',
			description: 'Content creator with a large following. Sharing insights about technology, design, and the future of digital communication.',
			avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=64&h=64&fit=crop&crop=face',
			followsCount: 1234,
			followersCount: 98765,
			postsCount: 5432
		},
		copyPostJson: mockCopyFunction
	}
};

export const LongDescription: Story = {
	args: {
		profileData: {
			handle: 'verbose.writer',
			displayName: 'Verbose Writer',
			description: 'This is a very long bio that tests how the component handles longer descriptions. I write about many topics including technology, philosophy, science, literature, and the intersection of human creativity with artificial intelligence. Always curious and always learning.',
			avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face',
			followsCount: 789,
			followersCount: 456,
			postsCount: 234
		},
		copyPostJson: mockCopyFunction
	}
};

export const NoAvatar: Story = {
	args: {
		profileData: {
			handle: 'no.avatar.user',
			displayName: 'No Avatar User',
			description: 'Testing the default placeholder avatar.',
			followsCount: 42,
			followersCount: 24,
			postsCount: 13
		},
		copyPostJson: mockCopyFunction
	}
};