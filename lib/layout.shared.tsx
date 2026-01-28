import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: 'HITSZ 课程攻略共享计划',
    },
    links: [
      {
        text: '文档',
        url: '/docs',
        active: 'nested-url',
      },
      {
        text: '博客',
        url: '/blog',
        active: 'nested-url',
      },
    ],
    githubUrl: 'https://github.com/hitsz-openauto',
  };
}
