import { notFound } from 'next/navigation';
import { InlineTOC } from 'fumadocs-ui/components/inline-toc';
import Image from 'next/image';
import Link from 'next/link';
import { blog } from '@/lib/source';
import { getMDXComponents } from '@/mdx-components';

export default async function Page(props: {
  params: Promise<{ slug: string[] }>;
}) {
  const params = await props.params;
  const page = blog.getPage(params.slug);

  if (!page) notFound();
  const isSeriesIndex = page.slugs.length === 1;
  const seriesPosts = isSeriesIndex
    ? blog
        .getPages()
        .filter(
          (post) => post.slugs.length > 1 && post.slugs[0] === page.slugs[0]
        )
        .sort(
          (a, b) =>
            new Date(b.data.date).getTime() - new Date(a.data.date).getTime()
        )
    : [];
  const Mdx = page.data.body;
  const toc = page.data.toc;

  if (isSeriesIndex && seriesPosts.length > 0) {
    return (
      <main className="max-w-page mx-auto w-full px-4 pb-12 md:py-12">
        <div className="mb-6">
          <h1 className="mb-4 text-3xl font-semibold">{page.data.title}</h1>
          <p className="text-fd-muted-foreground">{page.data.description}</p>
        </div>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-3 xl:grid-cols-4">
          {seriesPosts.map((post) => (
            <Link
              key={post.url}
              href={post.url}
              className="bg-fd-card hover:bg-fd-accent hover:text-fd-accent-foreground flex flex-col rounded-2xl border p-4 shadow-sm transition-colors"
            >
              <p className="font-medium">{post.data.title}</p>
              <p className="text-fd-muted-foreground text-sm">
                {post.data.description}
              </p>
              <p className="text-brand mt-auto pt-4 text-xs">
                {new Date(post.data.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </Link>
          ))}
        </div>
      </main>
    );
  }

  return (
    <article className="mx-auto flex w-full max-w-200 flex-col px-4 py-8">
      <h1 className="mb-4 text-3xl font-semibold">{page.data.title}</h1>
      <p className="text-fd-muted-foreground mb-8">{page.data.description}</p>

      <div className="text-fd-muted-foreground mb-8 flex flex-row items-center gap-2 text-sm">
        <p>
          {new Date(page.data.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
        {page.data.authors && page.data.authors.length > 0 && (
          <>
            <span>·</span>
            <div className="flex flex-row flex-wrap items-center">
              {page.data.authors.map((author, index) => (
                <div
                  key={index}
                  className="mx-1 flex flex-row items-center gap-1.5"
                >
                  {author.link ? (
                    <Link
                      href={author.link}
                      className="text-fd-foreground flex flex-row items-center gap-1.5 font-medium hover:underline"
                    >
                      {author.image && (
                        <Image
                          src={author.image}
                          alt={author.name}
                          width={24}
                          height={24}
                          className="rounded-full"
                        />
                      )}
                      {author.name}
                    </Link>
                  ) : (
                    <div className="flex flex-row items-center gap-1.5">
                      {author.image && (
                        <Image
                          src={author.image}
                          alt={author.name}
                          width={24}
                          height={24}
                          className="rounded-full"
                        />
                      )}
                      <p className="text-fd-foreground font-medium">
                        {author.name}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="prose min-w-0 flex-1">
        <InlineTOC items={toc} />
        <Mdx components={getMDXComponents()} />
      </div>
    </article>
  );
}

export function generateStaticParams(): { slug: string[] }[] {
  return blog.getPages().map((page) => ({
    slug: page.slugs,
  }));
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string[] }>;
}) {
  const params = await props.params;
  const page = blog.getPage(params.slug);
  if (!page) notFound();
  return {
    title: page.data.title,
    description: page.data.description,
  };
}
