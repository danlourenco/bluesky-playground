import type { Meta, StoryObj } from '@storybook/sveltekit';
import UserListDisplay from './UserListDisplay.svelte';

const meta: Meta<UserListDisplay> = {
	title: 'Dashboard/UserListDisplay',
	component: UserListDisplay,
	parameters: {
		layout: 'padded',
		docs: {
			description: {
				component: 'User list display component for showing lists of users (following, followers). Uses DaisyUI cards and avatars with proper fallbacks.'
			}
		}
	},
	argTypes: {
		title: {
			control: 'text',
			description: 'Title displayed at the top of the user list'
		},
		users: {
			control: 'object',
			description: 'Array of user objects to display'
		},
		maxItems: {
			control: 'number',
			description: 'Maximum number of users to display'
		}
	},
	tags: ['autodocs']
};

export default meta;
type Story = StoryObj<typeof meta>;

const sampleUsers = [
	{
		handle: 'alice.bsky.social',
		displayName: 'Alice Smith',
		description: 'UX designer passionate about accessible design and user research. Building the future of inclusive digital experiences.',
		avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=64&h=64&fit=crop&crop=face'
	},
	{
		handle: 'bob.bsky.social',
		displayName: 'Bob Wilson',
		description: 'Full-stack developer building decentralized social platforms. Open source enthusiast.',
		avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face'
	},
	{
		handle: 'charlie.bsky.social',
		displayName: 'Charlie Dev',
		description: 'Product manager with 10+ years experience in tech startups. Passionate about user-centered design.',
		avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face'
	},
	{
		handle: 'diana.bsky.social',
		displayName: 'Diana Chen',
		description: 'AI researcher and machine learning engineer. Working on ethical AI systems.',
		avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face'
	},
	{
		handle: 'minimal.user',
		displayName: 'Minimal User'
		// No description, no avatar
	},
	{
		handle: 'justhandle.user'
		// No display name, no description, no avatar
	}
];

export const Following: Story = {
	args: {
		title: 'People You Follow',
		users: sampleUsers,
		maxItems: 8
	}
};

export const Followers: Story = {
	args: {
		title: 'Your Followers',
		users: sampleUsers.slice(0, 4),
		maxItems: 8
	}
};

export const LargeUserList: Story = {
	args: {
		title: 'Large User List',
		users: Array.from({ length: 25 }, (_, i) => ({
			handle: `user${i + 1}.bsky.social`,
			displayName: `User ${i + 1}`,
			description: `This is user number ${i + 1}. They have an interesting bio that describes their work and interests in the decentralized web.`,
			avatar: i % 5 === 0 ? `https://images.unsplash.com/photo-${1472099645785 + (i * 50)}?w=64&h=64&fit=crop&crop=face` : undefined
		})),
		maxItems: 6
	}
};

export const WithoutAvatars: Story = {
	args: {
		title: 'Users Without Avatars',
		users: [
			{
				handle: 'noavatar1.bsky.social',
				displayName: 'No Avatar User 1',
				description: 'Testing how the component handles users without profile pictures.'
			},
			{
				handle: 'noavatar2.bsky.social',
				displayName: 'No Avatar User 2',
				description: 'Another user testing the avatar fallback functionality.'
			},
			{
				handle: 'justhandle.user'
				// No display name, no description, no avatar
			}
		],
		maxItems: 8
	}
};

export const LongDescriptions: Story = {
	args: {
		title: 'Users with Long Bios',
		users: [
			{
				handle: 'verbose.writer',
				displayName: 'Verbose Writer',
				description: 'This is a very long bio that tests how the component handles longer descriptions. I write about many topics including technology, philosophy, science, literature, and the intersection of human creativity with artificial intelligence. Always curious and always learning about the world around us.',
				avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=64&h=64&fit=crop&crop=face'
			},
			{
				handle: 'another.verbose',
				displayName: 'Another Verbose User',
				description: 'Testing how multiple long descriptions look in the grid layout. This bio is also quite long and covers various topics of interest. The line-clamp-2 class should truncate this appropriately.',
				avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=64&h=64&fit=crop&crop=face'
			}
		],
		maxItems: 8
	}
};

export const CustomMaxItems: Story = {
	args: {
		title: 'Limited Display (4 users)',
		users: sampleUsers,
		maxItems: 4
	}
};

export const EmptyList: Story = {
	args: {
		title: 'Empty User List',
		users: [],
		maxItems: 8
	}
};

export const MinimalUsers: Story = {
	args: {
		title: 'Minimal User Info',
		users: [
			{
				handle: 'user1.bsky.social'
				// Only handle provided
			},
			{
				handle: 'user2.bsky.social',
				displayName: 'User Two'
				// Handle and display name only
			},
			{
				handle: 'user3.bsky.social',
				description: 'Has description but no display name'
				// Handle and description only
			}
		],
		maxItems: 8
	}
};