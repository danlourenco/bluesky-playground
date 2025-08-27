import type { Meta, StoryObj } from '@storybook/sveltekit';
import ApiExplorer from './ApiExplorer.svelte';

const meta: Meta<ApiExplorer> = {
	title: 'Dashboard/ApiExplorer',
	component: ApiExplorer,
	parameters: {
		layout: 'padded',
		docs: {
			description: {
				component: 'API explorer component with demo selection and informational content. Uses DaisyUI cards, alerts, and buttons for clean styling.'
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
	{ id: 'post-thread', name: 'Get Post Thread', description: 'Get a post and its replies' },
	{ id: 'likes', name: 'Get Likes', description: 'Get posts you have liked' },
	{ id: 'following', name: 'Get Following', description: 'Get users you follow' },
	{ id: 'followers', name: 'Get Followers', description: 'Get your followers' }
];

export const Default: Story = {
	args: {
		demos: sampleDemos,
		currentDemo: ''
	}
};

export const WithSelectedDemo: Story = {
	args: {
		demos: sampleDemos,
		currentDemo: 'profile'
	}
};

export const WithSelectedTimeline: Story = {
	args: {
		demos: sampleDemos,
		currentDemo: 'timeline'
	}
};

export const FewDemos: Story = {
	args: {
		demos: [
			{ id: 'profile', name: 'Get Profile', description: 'Get your profile information' },
			{ id: 'timeline', name: 'Get Timeline', description: 'Get your home timeline feed' }
		],
		currentDemo: 'profile'
	}
};

export const SingleDemo: Story = {
	args: {
		demos: [
			{ id: 'profile', name: 'Get Profile', description: 'Get your profile information' }
		],
		currentDemo: 'profile'
	}
};

export const EmptyState: Story = {
	args: {
		demos: [],
		currentDemo: ''
	}
};