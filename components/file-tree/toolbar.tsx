'use client';

import {
  SearchIcon,
  UploadCloudIcon,
  DownloadIcon,
  ZapIcon,
  HardDrive,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { CircularProgress } from '@/components/ui/circular-progress';
import { cn } from '@/lib/utils';

interface ToolbarProps {
  globalFilter: string;
  setGlobalFilter: (value: string) => void;
  isAccelerated: boolean;
  setIsAccelerated: (value: boolean) => void;
  isDownloading: boolean;
  downloadProgress: number;
  selectedRowCount: number;
  onBatchDownload: () => void;
  url?: string;
}

export function Toolbar({
  globalFilter,
  setGlobalFilter,
  isAccelerated,
  setIsAccelerated,
  isDownloading,
  downloadProgress,
  selectedRowCount,
  onBatchDownload,
  url,
}: ToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex w-full items-center gap-2 sm:order-2 sm:mx-auto sm:w-auto sm:max-w-md sm:flex-1">
        <div className="relative w-full">
          <input
            type="text"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="搜索"
            className="bg-background ring-offset-background focus-visible:ring-ring placeholder:text-muted-foreground h-8 w-full rounded-md border px-7 text-sm outline-none focus-visible:ring-2"
            aria-label="Search files"
          />
          <SearchIcon
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-2 size-3 -translate-y-1/2 opacity-70"
            aria-hidden="true"
          />
        </div>
      </div>

      <div
        className={cn(
          'flex h-8 cursor-pointer items-center gap-2 rounded-md border px-2.5 transition-all select-none sm:order-1',
          isAccelerated
            ? 'bg-fd-primary/10 text-fd-primary'
            : 'border-input text-muted-foreground bg-muted/50 hover:bg-background'
        )}
        onClick={() => setIsAccelerated(!isAccelerated)}
      >
        <ZapIcon className="size-4" />
        <span className="text-sm whitespace-nowrap">校园网加速</span>
        <Switch
          checked={isAccelerated}
          onCheckedChange={setIsAccelerated}
          className="data-[state=checked]:text-fd-primary/10 scale-75"
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:order-3">
        <Button variant="outline" size="sm" className="h-8 px-2 sm:px-3">
          <UploadCloudIcon className="text-muted-foreground size-4" />
          <span className="hidden sm:inline">上传文件</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="h-8 px-2 sm:px-3"
          asChild
        >
          <a href={url} target="_blank" rel="noopener noreferrer">
            <HardDrive className="text-muted-foreground size-4" />
            <span className="hidden sm:inline">网盘计划</span>
          </a>
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="h-8 px-2 sm:px-3"
          disabled={selectedRowCount === 0 || isDownloading}
          onClick={onBatchDownload}
        >
          {isDownloading ? (
            <CircularProgress progress={downloadProgress} />
          ) : (
            <DownloadIcon className="text-muted-foreground size-4" />
          )}
          <span className="hidden sm:inline">批量下载</span>
        </Button>
      </div>
    </div>
  );
}
