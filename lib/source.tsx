import { docs, blog as blogDocs } from 'fumadocs-mdx:collections/server';
import { type InferPageType, loader } from 'fumadocs-core/source';
import { lucideIconsPlugin } from 'fumadocs-core/source/lucide-icons';

// See https://fumadocs.dev/docs/headless/source-api for more info
export const source = loader({
  baseUrl: '/docs',
  source: docs.toFumadocsSource(),
  plugins: [lucideIconsPlugin()],
});

export function getPageImage(page: InferPageType<typeof source>) {
  const segments = [...page.slugs, 'image.png'];

  return {
    segments,
    url: `/og/docs/${segments.join('/')}`,
  };
}

export async function getLLMText(page: InferPageType<typeof source>) {
  const processed = await page.data.getText('processed');

  return `# ${page.data.title}

${processed}`;
}

export const blog = loader({
  baseUrl: '/blog',
  source: blogDocs.toFumadocsSource(),
});

export function getAvailableYears(): string[] {
  return source.pageTree.children
    .filter(
      (node): node is typeof node & { name: string } =>
        node.type === 'folder' &&
        typeof node.name === 'string' &&
        /^\d{4}$/.test(node.name)
    )
    .map((node) => node.name)
    .sort((a, b) => b.localeCompare(a));
}
