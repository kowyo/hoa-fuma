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
      {/* Search Box - Top on mobile, Middle on desktop */}
      <div className="flex items-center gap-2 w-full sm:w-auto sm:flex-1 sm:max-w-md sm:order-2 sm:mx-auto">
        <div className="relative w-full">
          <input
            type="text"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="搜索"
            className="bg-background text-sm ring-offset-background focus-visible:ring-ring placeholder:text-muted-foreground h-8 w-full rounded-md border px-7 outline-none focus-visible:ring-2"
            aria-label="Search files"
          />
          <SearchIcon
            className="text-muted-foreground pointer-events-none absolute left-2 top-1/2 size-3 -translate-y-1/2 opacity-70"
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Acceleration Mode - Left on desktop */}
      <div
        className={cn(
          'flex items-center gap-2 px-2.5 h-8 rounded-md transition-all border sm:order-1 cursor-pointer select-none',
          isAccelerated
            ? 'bg-blue-500/5 border-blue-500/20 text-blue-600'
            : 'border-input text-muted-foreground bg-muted/50 hover:bg-background'
        )}
        onClick={() => setIsAccelerated(!isAccelerated)}
      >
        <ZapIcon className="size-4" />
        <span className="text-sm font-medium whitespace-nowrap">
          校园网加速
        </span>
        <Switch
          checked={isAccelerated}
          onCheckedChange={setIsAccelerated}
          className="scale-75 data-[state=checked]:bg-blue-600"
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      {/* Action Buttons - Right on desktop */}
      <div className="flex flex-wrap items-center gap-2 sm:order-3">
        <Button variant="outline" size="sm" className="h-8 px-2 sm:px-3">
          <UploadCloudIcon className="size-4 text-muted-foreground" />
          <span className="hidden sm:inline">上传文件</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="h-8 px-2 sm:px-3"
          asChild
        >
          <a href={url} target="_blank" rel="noopener noreferrer">
            <HardDrive className="size-4 text-muted-foreground" />
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
            <DownloadIcon className="size-4 text-muted-foreground" />
          )}
          <span className="hidden sm:inline">批量下载</span>
        </Button>
      </div>
    </div>
  );
}
