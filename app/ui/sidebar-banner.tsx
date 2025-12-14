'use client';

import { YearSelector } from '@/app/ui/year-selector';
import { SidebarTabsDropdown } from 'fumadocs-ui/components/sidebar/tabs/dropdown';
import { useMemo } from 'react';
import { getSidebarTabs } from 'fumadocs-ui/utils/get-sidebar-tabs';
import type * as PageTree from 'fumadocs-core/page-tree';

export function SidebarBanner({
  years,
  currentYear,
  tree,
}: {
  years: string[];
  currentYear: string;
  tree: PageTree.Folder;
}) {
  const tabs = useMemo(() => {
    const sidebarTabs = getSidebarTabs(tree);
    // Add "所有文档" tab at the beginning
    return [
      {
        title: '所有专业',
        url: `/docs/${currentYear}`,
      },
      ...sidebarTabs,
    ];
  }, [tree, currentYear]);

  return (
    <div className="flex flex-col gap-2 mt-2">
      <YearSelector years={years} currentYear={currentYear} />
      <SidebarTabsDropdown options={tabs} />
    </div>
  );
}