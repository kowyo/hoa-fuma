'use client';

import { useRouter } from 'next/navigation';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from 'fumadocs-ui/components/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { useState } from 'react';

export function YearSelector({
  years,
  currentYear,
}: {
  years: string[];
  currentYear: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className="flex w-full items-center gap-2 rounded-lg p-2 border bg-fd-secondary/50 text-start text-fd-secondary-foreground transition-colors hover:bg-fd-accent data-[state=open]:bg-fd-accent data-[state=open]:text-fd-accent-foreground"
      >
        <span className="text-sm font-medium">{currentYear}</span>
        <ChevronsUpDown className="shrink-0 ms-auto size-4 text-fd-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent className="flex flex-col gap-1 w-(--radix-popover-trigger-width) p-1">
        {years.map((year) => (
          <button
            key={year}
            className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-fd-accent hover:text-fd-accent-foreground text-start"
            onClick={() => {
              router.push(`/docs/${year}`);
              setOpen(false);
            }}
          >
            <span className="text-sm font-medium">{year}</span>
            <Check
              className={`shrink-0 ms-auto size-3.5 text-fd-primary ${year !== currentYear ? 'invisible' : ''}`}
            />
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}