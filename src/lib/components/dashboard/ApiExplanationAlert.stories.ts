import type { Meta, StoryObj } from '@storybook/sveltekit';
import ApiExplanationAlert from './ApiExplanationAlert.svelte';

const meta: Meta<ApiExplanationAlert> = {
	title: 'Dashboard/ApiExplanationAlert',
	component: ApiExplanationAlert,
	parameters: {
		layout: 'padded',
		docs: {
			description: {
				component: 'API explanation alert component that provides detailed information about different Bluesky API endpoints and their behavior. Uses DaisyUI alert styling with info styling.'
			}
		}
	},
	argTypes: {
		currentDemo: {
			control: { type: 'select' },
			options: ['profile', 'timeline', 'author-feed', 'post-thread', 'likes', 'following', 'followers'],
			description: 'The current API demo type being explained'
		}
	},
	tags: ['autodocs']
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Profile: Story = {
	args: {
		currentDemo: 'profile'
	}
};

export const Timeline: Story = {
	args: {
		currentDemo: 'timeline'
	}
};

export const AuthorFeed: Story = {
	args: {
		currentDemo: 'author-feed'
	}
};

export const PostThread: Story = {
	args: {
		currentDemo: 'post-thread'
	}
};

export const Likes: Story = {
	args: {
		currentDemo: 'likes'
	}
};

export const Following: Story = {
	args: {
		currentDemo: 'following'
	}
};

export const Followers: Story = {
	args: {
		currentDemo: 'followers'
	}
};

export const UnknownDemo: Story = {
	args: {
		currentDemo: 'unknown-api'
	}
};