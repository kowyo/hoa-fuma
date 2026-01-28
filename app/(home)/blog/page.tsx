import Link from 'next/link';
import { blog } from '@/lib/source';
import BannerImage from './hoa-banner.png';
import Image from 'next/image';

export default function Page() {
  const pages = blog.getPages();
  const seriesMap = new Map<
    string,
    {
      index?: (typeof pages)[number];
      posts: (typeof pages)[number][];
    }
  >();

  for (const page of pages) {
    const seriesSlug = page.slugs[0];
    if (!seriesSlug) continue;
    const series = seriesMap.get(seriesSlug) ?? { posts: [] };
    if (page.slugs.length === 1) {
      series.index = page;
    } else {
      series.posts.push(page);
    }
    seriesMap.set(seriesSlug, series);
  }

  const seriesItems = [...seriesMap.entries()]
    .filter(([, entry]) => entry.posts.length > 0)
    .map(([slug, entry]) => {
      const dates = [
        entry.index?.data.date,
        ...entry.posts.map((post) => post.data.date),
      ]
        .filter(Boolean)
        .map((date) => new Date(date as string | Date).getTime());
      const latestDate = dates.length > 0 ? new Date(Math.max(...dates)) : null;
      return {
        type: 'series' as const,
        slug,
        title: entry.index?.data.title ?? slug,
        description: entry.index?.data.description ?? '',
        date: latestDate,
      };
    });

  const seriesSlugs = new Set(seriesItems.map((item) => item.slug));
  const postItems = pages
    .filter(
      (page) => page.slugs.length === 1 && !seriesSlugs.has(page.slugs[0])
    )
    .map((post) => ({
      type: 'post' as const,
      slug: post.slugs[0],
      title: post.data.title,
      description: post.data.description,
      date: new Date(post.data.date),
      url: post.url,
    }));

  const items = [...seriesItems, ...postItems].sort((a, b) => {
    const aDate = a.date?.getTime() ?? 0;
    const bDate = b.date?.getTime() ?? 0;
    return bDate - aDate;
  });

  return (
    <main className="max-w-page mx-auto w-full px-4 pb-12 md:py-12">
      <div className="dark relative z-2 mb-4 aspect-[3.2] p-8 md:p-12">
        <Image
          src={BannerImage}
          priority
          alt="banner"
          className="absolute inset-0 -z-1 size-full object-cover"
        />
        <h1 className="text-landing-foreground mb-4 font-mono text-3xl font-medium">
          HOA 博客
        </h1>
        <p className="text-landing-foreground font-mono text-sm">
          了解校内最新资讯，分享学习心得
        </p>
      </div>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-3 xl:grid-cols-4">
        {items.map((item) => (
          <Link
            key={`${item.type}-${item.slug}`}
            href={item.type === 'series' ? `/blog/${item.slug}` : item.url}
            className="bg-fd-card hover:bg-fd-accent hover:text-fd-accent-foreground flex flex-col rounded-2xl border p-4 shadow-sm transition-colors"
          >
            <p className="font-medium">{item.title}</p>
            <p className="text-fd-muted-foreground text-sm">
              {item.description}
            </p>

            {item.date && (
              <p className="text-brand mt-auto pt-4 text-xs">
                {item.date.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            )}
          </Link>
        ))}
      </div>
    </main>
  );
}
