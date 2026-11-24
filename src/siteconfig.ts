/** Replace the sample identity, links and homepage media here before publishing. */
type HeroMedia = {
  type: 'image' | 'video';
  /** Relative to src/content/picture, or an absolute public/remote URL. */
  src: string;
  alt: string;
  /** A still image shown while a video loads and when motion is reduced. */
  poster?: string;
  objectPosition?: string;
};

const heroMedia: HeroMedia = {
  type: 'image',
  src: './photo-04.svg',
  alt: '山峦与晨光的示例画面',
  objectPosition: 'center 44%',
};

export const siteConfig = {
  name: 'KIMURA',
  displayName: 'Kimura',
  age: '—',
  location: 'Somewhere, Earth',
  domain: 'your-site.example',
  siteUrl: 'https://example.com',
  email: 'hello@example.com',
  avatar: '/avatar.svg',
  resume: '/kim-cv.pdf',
  heroImageRatio: 0.56,
  heroMedia,
  motto: ['把日常，过成值得记下的片段。', '在好奇与秩序之间，慢慢生长。', 'Collect moments. Make meaning.'],
  socials: [
    { label: 'GitHub', href: 'https://github.com/', icon: 'github' },
    { label: '小红书', href: 'https://www.xiaohongshu.com/user/profile/funiki', icon: 'xiaohongshu' },
  ],
};
