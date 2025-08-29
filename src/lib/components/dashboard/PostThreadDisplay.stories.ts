import type { Meta, StoryObj } from '@storybook/sveltekit';
import PostThreadDisplay from './PostThreadDisplay.svelte';

const meta: Meta<PostThreadDisplay> = {
	title: 'Dashboard/PostThreadDisplay',
	component: PostThreadDisplay,
	parameters: {
		layout: 'padded',
		docs: {
			description: {
				component: 'Post thread display component showing conversation threads with main post, replies, and nested replies. Supports embedded media (images, videos) using PostMedia component. Uses DaisyUI cards and HeroIcons for engagement stats.'
			}
		}
	},
	argTypes: {
		threadData: {
			control: 'object',
			description: 'Thread data containing main post and replies'
		}
	},
	tags: ['autodocs']
};

export default meta;
type Story = StoryObj<typeof meta>;

export const SimpleThread: Story = {
	args: {
		threadData: {
			post: {
				author: {
					handle: 'johndoe.bsky.social',
					displayName: 'John Doe',
					avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face'
				},
				record: {
					text: 'This is a really interesting topic that I wanted to share with everyone. What do you all think about the future of decentralized social networks?'
				},
				indexedAt: '2024-01-15T10:30:00Z',
				replyCount: 3,
				repostCount: 12,
				likeCount: 28
			},
			replies: [
				{
					post: {
						author: {
							handle: 'alice.bsky.social',
							displayName: 'Alice Smith',
							avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=64&h=64&fit=crop&crop=face'
						},
						record: {
							text: 'Great question! I think decentralized networks give users much more control over their data and experience.'
						},
						indexedAt: '2024-01-15T10:45:00Z',
						replyCount: 1,
						likeCount: 5
					}
				},
				{
					post: {
						author: {
							handle: 'bob.bsky.social',
							displayName: 'Bob Wilson'
						},
						record: {
							text: 'I agree with Alice. The ability to choose your own algorithm and moderate your own feed is revolutionary.'
						},
						indexedAt: '2024-01-15T11:00:00Z',
						replyCount: 0,
						likeCount: 3
					}
				}
			]
		}
	}
};

export const ComplexThread: Story = {
	args: {
		threadData: {
			post: {
				author: {
					handle: 'techexpert.bsky.social',
					displayName: 'Tech Expert',
					avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face'
				},
				record: {
					text: 'Breaking: New protocol update brings significant improvements to content discovery and user privacy. This could change everything! 🚀'
				},
				indexedAt: '2024-01-15T09:00:00Z',
				replyCount: 15,
				repostCount: 45,
				likeCount: 123
			},
			replies: [
				{
					post: {
						author: {
							handle: 'developer1.bsky.social',
							displayName: 'Sarah Dev',
							avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face'
						},
						record: {
							text: 'This is huge! The privacy improvements alone make this a game-changer for social media.'
						},
						indexedAt: '2024-01-15T09:15:00Z',
						replyCount: 2,
						likeCount: 8
					},
					replies: [
						{
							post: {
								author: {
									handle: 'privacyadvocate.bsky.social',
									displayName: 'Privacy First'
								},
								record: {
									text: 'Exactly! Finally a platform that puts user privacy at the forefront.'
								},
								indexedAt: '2024-01-15T09:30:00Z',
								replyCount: 0,
								likeCount: 2
							}
						},
						{
							post: {
								author: {
									handle: 'skeptic.bsky.social',
									displayName: 'Healthy Skeptic',
									avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=64&h=64&fit=crop&crop=face'
								},
								record: {
									text: 'Let\'s see how it works in practice. Promises are easy, execution is hard.'
								},
								indexedAt: '2024-01-15T09:45:00Z',
								replyCount: 1,
								likeCount: 4
							}
						}
					]
				},
				{
					post: {
						author: {
							handle: 'earlyuser.bsky.social',
							displayName: 'Early Adopter'
						},
						record: {
							text: 'Been testing this in beta - the performance improvements are noticeable immediately!'
						},
						indexedAt: '2024-01-15T09:20:00Z',
						replyCount: 0,
						likeCount: 12
					}
				}
			]
		}
	}
};

export const ThreadWithoutReplies: Story = {
	args: {
		threadData: {
			post: {
				author: {
					handle: 'lonepost.bsky.social',
					displayName: 'Lone Poster',
					avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face'
				},
				record: {
					text: 'Sometimes you post something and nobody replies. That\'s okay too. 😊'
				},
				indexedAt: '2024-01-15T12:00:00Z',
				replyCount: 0,
				repostCount: 1,
				likeCount: 3
			},
			replies: []
		}
	}
};

export const ThreadWithoutAvatars: Story = {
	args: {
		threadData: {
			post: {
				author: {
					handle: 'noavatar.bsky.social',
					displayName: 'No Avatar User'
				},
				record: {
					text: 'Testing how threads look when users don\'t have profile pictures set up.'
				},
				indexedAt: '2024-01-15T13:00:00Z',
				replyCount: 2,
				repostCount: 0,
				likeCount: 1
			},
			replies: [
				{
					post: {
						author: {
							handle: 'another.user',
							displayName: 'Another User'
						},
						record: {
							text: 'Looks good with the fallback initials!'
						},
						indexedAt: '2024-01-15T13:15:00Z',
						replyCount: 0,
						likeCount: 1
					}
				}
			]
		}
	}
};

export const ThreadWithMedia: Story = {
	args: {
		threadData: {
			post: {
				author: {
					handle: 'photographer.bsky.social',
					displayName: 'Pro Photographer',
					avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face'
				},
				record: {
					text: 'Check out this amazing sunset I captured yesterday! The colors were absolutely stunning.'
				},
				embed: {
					$type: 'app.bsky.embed.images#view',
					images: [
						{
							thumb: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop',
							fullsize: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
							alt: 'Beautiful sunset over mountains'
						}
					]
				},
				indexedAt: '2024-01-15T18:30:00Z',
				replyCount: 5,
				repostCount: 25,
				likeCount: 142
			},
			replies: [
				{
					post: {
						author: {
							handle: 'naturelover.bsky.social',
							displayName: 'Nature Lover',
							avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=64&h=64&fit=crop&crop=face'
						},
						record: {
							text: 'Wow, those colors are incredible! Here\'s one I took last week:'
						},
						embed: {
							$type: 'app.bsky.embed.images#view',
							images: [
								{
									thumb: 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=600&h=400&fit=crop',
									fullsize: 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e',
									alt: 'Sunrise over the ocean'
								}
							]
						},
						indexedAt: '2024-01-15T18:45:00Z',
						replyCount: 2,
						likeCount: 23
					},
					replies: [
						{
							post: {
								author: {
									handle: 'photographer.bsky.social',
									displayName: 'Pro Photographer',
									avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face'
								},
								record: {
									text: 'That\'s beautiful! The reflection on the water is perfect.'
								},
								indexedAt: '2024-01-15T19:00:00Z'
							}
						}
					]
				},
				{
					post: {
						author: {
							handle: 'artappreciator.bsky.social',
							displayName: 'Art Appreciator'
						},
						record: {
							text: 'The composition is perfect! What camera settings did you use?'
						},
						indexedAt: '2024-01-15T18:35:00Z',
						replyCount: 1,
						likeCount: 5
					}
				}
			]
		}
	}
};

export const LargeThread: Story = {
	args: {
		threadData: {
			post: {
				author: {
					handle: 'viral.bsky.social',
					displayName: 'Viral Post',
					avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face'
				},
				record: {
					text: 'This post went viral and got tons of replies. Here\'s how the component handles large threads.'
				},
				indexedAt: '2024-01-15T08:00:00Z',
				replyCount: 47,
				repostCount: 234,
				likeCount: 1205
			},
			replies: Array.from({ length: 12 }, (_, i) => ({
				post: {
					author: {
						handle: `user${i + 1}.bsky.social`,
						displayName: `User ${i + 1}`,
						avatar: i % 3 === 0 ? `https://images.unsplash.com/photo-${1472099645785 + i}?w=64&h=64&fit=crop&crop=face` : undefined
					},
					record: {
						text: `This is reply number ${i + 1} to the viral post. Each reply tests different aspects of the component.`
					},
					indexedAt: new Date(Date.now() - (12 - i) * 300000).toISOString(),
					replyCount: Math.floor(Math.random() * 5),
					likeCount: Math.floor(Math.random() * 20)
				}
			}))
		}
	}
};