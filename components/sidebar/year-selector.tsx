'use client';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from 'fumadocs-ui/components/ui/popover';
import Link from 'fumadocs-core/link';
import { Check, ChevronsUpDown } from 'lucide-react';
import { useState } from 'react';

export function YearSelector({
  years,
  currentYear,
}: {
  years: string[];
  currentYear: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="bg-fd-secondary/50 text-fd-secondary-foreground hover:bg-fd-accent data-[state=open]:bg-fd-accent data-[state=open]:text-fd-accent-foreground flex items-center gap-2 rounded-lg border p-2 text-start transition-colors">
        <span className="text-sm font-medium">{currentYear}</span>
        <ChevronsUpDown className="text-fd-muted-foreground ms-auto size-4 shrink-0" />
      </PopoverTrigger>
      <PopoverContent className="fd-scroll-container flex w-(--radix-popover-trigger-width) flex-col gap-1 p-1">
        {years.map((year) => (
          <Link
            key={year}
            className="hover:bg-fd-accent hover:text-fd-accent-foreground flex items-center gap-2 rounded-lg p-1.5"
            href={`/docs/${year}`}
            onClick={() => {
              setOpen(false);
            }}
          >
            <span className="text-sm font-medium">{year}</span>
            <Check
              className={`text-fd-primary ms-auto size-3.5 shrink-0 ${year !== currentYear ? 'invisible' : ''}`}
            />
          </Link>
        ))}
      </PopoverContent>
    </Popover>
  );
}
