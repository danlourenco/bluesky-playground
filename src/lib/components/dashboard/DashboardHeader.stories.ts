import type { Meta, StoryObj } from '@storybook/sveltekit';
import DashboardHeader from './DashboardHeader.svelte';

const meta: Meta<DashboardHeader> = {
	title: 'Dashboard/DashboardHeader',
	component: DashboardHeader,
	parameters: {
		layout: 'fullscreen',
		docs: {
			description: {
				component: 'Dashboard header component with user info and navigation buttons. Uses DaisyUI card, badges, and buttons for clean styling.'
			}
		}
	},
	argTypes: {
		user: {
			control: 'text',
			description: 'User identifier or handle'
		},
		showTvGuide: {
			control: 'boolean',
			description: 'Whether to show the TV Guide button'
		},
		showDebug: {
			control: 'boolean',
			description: 'Whether to show the Debug button'
		}
	},
	tags: ['autodocs']
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		user: 'did:plc:example123',
		showTvGuide: true,
		showDebug: true
	}
};

export const WithHandle: Story = {
	args: {
		user: '@johndoe.bsky.social',
		showTvGuide: true,
		showDebug: true
	}
};

export const TvGuideOnly: Story = {
	args: {
		user: 'did:plc:example123',
		showTvGuide: true,
		showDebug: false
	}
};

export const DebugOnly: Story = {
	args: {
		user: 'did:plc:example123',
		showTvGuide: false,
		showDebug: true
	}
};

export const MinimalHeader: Story = {
	args: {
		user: 'did:plc:example123',
		showTvGuide: false,
		showDebug: false
	}
};

export const LongUsername: Story = {
	args: {
		user: 'did:plc:verylongusernameexampletotest123456789',
		showTvGuide: true,
		showDebug: true
	}
};