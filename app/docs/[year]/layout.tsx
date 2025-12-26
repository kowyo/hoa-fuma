import { source, getAvailableYears } from '@/lib/source';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { baseOptions } from '@/lib/layout.shared';
import { notFound } from 'next/navigation';
import { ReactNode } from 'react';
import { SidebarBanner } from '@/components/sidebar/sidebar-banner';
import type { Folder } from 'fumadocs-core/page-tree';

export default async function Layout(props: {
  children: ReactNode;
  params: Promise<{ year: string }>;
}) {
  const { year } = await props.params;
  const yearNode = source.pageTree.children.find(
    (node): node is Folder => node.type === 'folder' && node.name === year
  );

  if (!yearNode) {
    return notFound();
  }

  const years = getAvailableYears();

  return (
    <DocsLayout
      tree={yearNode}
      {...baseOptions()}
      sidebar={{
        tabs: false,
        banner: (
          <SidebarBanner
            years={years}
            currentYear={year}
            tree={yearNode}
          />
        ),
      }}
    >
      {props.children}
    </DocsLayout>
  );
}