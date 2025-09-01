<script>
  import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
  import LinkPreview from '../lib/components/LinkPreview.svelte';
</script>

<Meta
  title="Components/LinkPreview"
  component={LinkPreview}
  argTypes={{
    external: {
      control: { type: 'object' },
      description: 'External link object with uri, title, description, and thumb'
    }
  }}
/>

<Template let:args>
  <div class="p-4 bg-base-100 max-w-md">
    <LinkPreview {...args} />
  </div>
</Template>

<Story
  name="Default"
  args={{
    external: {
      uri: 'https://example.com',
      title: 'Example Website',
      description: 'This is an example website with a description that might be quite long and will be truncated with ellipsis.',
      thumb: 'https://via.placeholder.com/400x200/3b82f6/ffffff?text=Link+Preview'
    }
  }}
/>

<Story
  name="No Thumbnail"
  args={{
    external: {
      uri: 'https://github.com/anthropics/claude-code',
      title: 'Claude Code - GitHub Repository',
      description: 'Official CLI tool for Claude by Anthropic. A powerful development assistant for software engineering tasks.'
    }
  }}
/>

<Story
  name="Long Title"
  args={{
    external: {
      uri: 'https://www.nytimes.com/2024/01/01/technology/ai-development-trends-2024.html',
      title: 'The Future of Artificial Intelligence Development: Trends, Challenges, and Opportunities in 2024 and Beyond',
      description: 'An in-depth analysis of the current state of AI development and what to expect in the coming years.',
      thumb: 'https://via.placeholder.com/400x200/ef4444/ffffff?text=News+Article'
    }
  }}
/>

<Story
  name="No Description"
  args={{
    external: {
      uri: 'https://daisyui.com',
      title: 'daisyUI - Tailwind CSS Components',
      thumb: 'https://via.placeholder.com/400x200/10b981/ffffff?text=daisyUI'
    }
  }}
/>

<Story
  name="Minimal Link"
  args={{
    external: {
      uri: 'https://bluesky.app',
      title: 'Bluesky'
    }
  }}
/>

<Story
  name="Invalid URL"
  args={{
    external: {
      uri: 'not-a-valid-url',
      title: 'Invalid URL Test',
      description: 'This tests how the component handles invalid URLs.'
    }
  }}
/>

<Story
  name="Social Media Post"
  args={{
    external: {
      uri: 'https://bsky.app/profile/jay.bsky.team/post/3laconicexample',
      title: 'Jay Graber on Bluesky',
      description: 'Excited to announce our latest features and improvements to the Bluesky platform.',
      thumb: 'https://via.placeholder.com/400x200/1d9bf0/ffffff?text=Bluesky+Post'
    }
  }}
/>

<Story
  name="News Article"
  args={{
    external: {
      uri: 'https://techcrunch.com/2024/01/15/bluesky-decentralized-social-media',
      title: 'Bluesky\'s Decentralized Approach to Social Media',
      description: 'How Bluesky is building a more open and decentralized social media platform using the AT Protocol.',
      thumb: 'https://via.placeholder.com/400x200/059669/ffffff?text=TechCrunch'
    }
  }}
/>

<Story
  name="Multiple Previews"
>
  <div class="p-4 bg-base-100 space-y-4 max-w-md">
    <LinkPreview external={{
      uri: 'https://github.com',
      title: 'GitHub',
      description: 'Where the world builds software',
      thumb: 'https://via.placeholder.com/400x200/24292e/ffffff?text=GitHub'
    }} />
    
    <LinkPreview external={{
      uri: 'https://stackoverflow.com',
      title: 'Stack Overflow',
      description: 'Where developers learn, share, & build careers'
    }} />
    
    <LinkPreview external={{
      uri: 'https://developer.mozilla.org',
      title: 'MDN Web Docs'
    }} />
  </div>
</Story>