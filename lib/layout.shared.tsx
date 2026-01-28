import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { BookIcon } from 'lucide-react';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: 'HITSZ 课程攻略共享计划',
    },
    links: [
      {
        text: 'Documentation',
        url: '/docs',
        active: 'nested-url',
      },
      {
        text: 'Blog',
        url: '/blog',
        active: 'nested-url',
        icon: <BookIcon />,
      },
    ],
    githubUrl: 'https://github.com/HITSZ-OpenAuto/hoa-fuma',
  };
}
