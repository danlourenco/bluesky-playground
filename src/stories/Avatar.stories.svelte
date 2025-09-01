<script>
  import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
  import Avatar from '../lib/components/Avatar.svelte';
</script>

<Meta
  title="Components/Avatar"
  component={Avatar}
  argTypes={{
    size: {
      control: { type: 'select' },
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Size of the avatar'
    },
    shape: {
      control: { type: 'select' },
      options: ['circle', 'square'],
      description: 'Shape of the avatar'
    },
    src: {
      control: { type: 'text' },
      description: 'Image URL for the avatar'
    },
    alt: {
      control: { type: 'text' },
      description: 'Alt text for the avatar image'
    },
    placeholder: {
      control: { type: 'text' },
      description: 'Text/emoji to display when no image is provided'
    }
  }}
/>

<Template let:args>
  <div class="p-4 bg-base-100">
    <Avatar {...args} />
  </div>
</Template>

<Story
  name="Default"
  args={{
    placeholder: '?',
    size: 'md',
    shape: 'circle'
  }}
/>

<Story
  name="With Image"
  args={{
    src: 'https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp',
    alt: 'User avatar',
    size: 'md',
    shape: 'circle'
  }}
/>

<Story
  name="Emoji Placeholder"
  args={{
    placeholder: '🦋',
    size: 'md',
    shape: 'circle'
  }}
/>

<Story
  name="Initials Placeholder"
  args={{
    placeholder: 'JD',
    size: 'md',
    shape: 'circle'
  }}
/>

<Story
  name="Different Sizes"
>
  <div class="p-4 bg-base-100">
    <div class="flex items-end gap-4">
      <div class="text-center">
        <Avatar placeholder="XS" size="xs" />
        <p class="text-xs mt-2">Extra Small</p>
      </div>
      <div class="text-center">
        <Avatar placeholder="SM" size="sm" />
        <p class="text-xs mt-2">Small</p>
      </div>
      <div class="text-center">
        <Avatar placeholder="MD" size="md" />
        <p class="text-xs mt-2">Medium</p>
      </div>
      <div class="text-center">
        <Avatar placeholder="LG" size="lg" />
        <p class="text-xs mt-2">Large</p>
      </div>
      <div class="text-center">
        <Avatar placeholder="XL" size="xl" />
        <p class="text-xs mt-2">Extra Large</p>
      </div>
    </div>
  </div>
</Story>

<Story
  name="Different Shapes"
>
  <div class="p-4 bg-base-100">
    <div class="flex items-center gap-4">
      <div class="text-center">
        <Avatar placeholder="🎯" size="lg" shape="circle" />
        <p class="text-xs mt-2">Circle</p>
      </div>
      <div class="text-center">
        <Avatar placeholder="📱" size="lg" shape="square" />
        <p class="text-xs mt-2">Square</p>
      </div>
    </div>
  </div>
</Story>


<Story
  name="Emoji Collection"
>
  <div class="p-4 bg-base-100">
    <div class="flex flex-wrap gap-4">
      <Avatar placeholder="🦋" size="md" />
      <Avatar placeholder="🚀" size="md" />
      <Avatar placeholder="🎯" size="md" />
      <Avatar placeholder="💎" size="md" />
      <Avatar placeholder="🌟" size="md" />
      <Avatar placeholder="🎨" size="md" />
      <Avatar placeholder="🔥" size="md" />
      <Avatar placeholder="⚡" size="md" />
    </div>
  </div>
</Story>

<Story
  name="Bluesky Style"
  args={{
    placeholder: '🦋',
    size: 'md',
    shape: 'circle'
  }}
>
  <div class="p-8 bg-gradient-to-br from-primary/10 via-base-100 to-secondary/10 flex items-center justify-center">
    <div class="text-center">
      <Avatar placeholder="🦋" size="lg" shape="circle" />
      <h3 class="mt-4 text-lg font-semibold">Bluesky Playground</h3>
      <p class="text-base-content/70">Connect your account</p>
    </div>
  </div>
</Story>

<Story
  name="Profile Card Example"
>
  <div class="p-4 bg-base-100">
    <div class="card bg-base-100 shadow-xl w-80">
      <div class="card-body items-center text-center">
        <Avatar 
          src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
          alt="Profile picture"
          size="xl"
        />
        <h2 class="card-title">Jane Doe</h2>
        <p class="text-base-content/70">@jane.bsky.social</p>
        <p class="text-sm">Product Designer at DaisyUI</p>
        <div class="card-actions">
          <button class="btn btn-primary">Follow</button>
          <button class="btn btn-ghost">Message</button>
        </div>
      </div>
    </div>
  </div>
</Story>