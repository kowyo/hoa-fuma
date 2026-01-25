'use client';

import { ReactNode, useMemo } from 'react';
import { transformChildrenToData } from './utils';
import { FileTreeTable } from './table';
import type { FileNode } from '@/lib/types';

export interface FilesProps {
  children: ReactNode;
  className?: string;
  url?: string;
}

export interface FileTreeFromDataProps {
  data: FileNode[];
  repo: string;
  className?: string;
}

/**
 * FileTreeFromData component - renders FileTree directly from pre-computed data.
 * Used when generating MDX at build time with pre-computed tree structure.
 */
export function FileTreeFromData({
  data,
  repo,
  className,
}: FileTreeFromDataProps) {
  const url = `https://github.com/HITSZ-OpenAuto/${repo}`;
  return <FileTreeTable data={data} className={className} url={url} />;
}

/**
 * Files component - wrapper that transforms declarative MDX children into DataTable.
 *
 * Usage in MDX:
 * ```mdx
 * <Files>
 *   <Folder name="docs" defaultOpen>
 *     <File name="readme.md" url="..." />
 *   </Folder>
 *   <File name="index.ts" url="..." />
 * </Files>
 * ```
 */
export function Files({ children, className, url }: FilesProps) {
  const data = useMemo(() => transformChildrenToData(children), [children]);

  return <FileTreeTable data={data} className={className} url={url} />;
}

/**
 * Folder component - used declaratively in MDX to define folder structure.
 * The actual rendering is handled by DataTable.
 */
export function Folder({
  name: _name,
  children: _children,
  defaultOpen: _defaultOpen,
  date: _date,
  size: _size,
}: {
  name: string;
  children?: ReactNode;
  defaultOpen?: boolean | string;
  date?: string;
  size?: number;
}) {
  // This component is only used for its props by transformChildrenToData
  // It should never actually render in the browser
  return null;
}

/**
 * File component - used declaratively in MDX to define file entries.
 * The actual rendering is handled by DataTable.
 */
export function File({
  name: _name,
  date: _date,
  size: _size,
  url: _url,
  type: _type,
}: {
  name: string;
  date?: string;
  size?: number;
  url?: string;
  type?: string;
}) {
  // This component is only used for its props by transformChildrenToData
  // It should never actually render in the browser
  return null;
}
