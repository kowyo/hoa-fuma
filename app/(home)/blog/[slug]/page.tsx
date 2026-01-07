import { notFound } from 'next/navigation';
import { InlineTOC } from 'fumadocs-ui/components/inline-toc';
import Image from 'next/image';
import Link from 'next/link';
import { blog } from '@/lib/source';
import { getMDXComponents } from '@/mdx-components';

export default async function Page(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  const page = blog.getPage([params.slug]);

  if (!page) notFound();
  const Mdx = page.data.body;
  const toc = page.data.toc;

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

export function generateStaticParams(): { slug: string }[] {
  return blog.getPages().map((page) => ({
    slug: page.slugs[0],
  }));
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  const page = blog.getPage([params.slug]);
  if (!page) notFound();
  return {
    title: page.data.title,
    description: page.data.description,
  };
}
