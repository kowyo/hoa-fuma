import {
  defineCollections,
  defineConfig,
  defineDocs,
  frontmatterSchema,
  metaSchema,
} from 'fumadocs-mdx/config';
import { z } from 'zod';

// You can customise Zod schemas for frontmatter and `meta.json` here
// see https://fumadocs.dev/docs/mdx/collections
export const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    schema: frontmatterSchema,
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
  meta: {
    schema: metaSchema,
  },
});

export const blog = defineDocs({
  dir: 'content/blog',
  docs: {
    schema: frontmatterSchema.extend({
      authors: z
        .array(
          z.object({
            name: z.string(),
            link: z.string().optional(),
            image: z.string().optional(),
          })
        )
        .optional(),
      description: z.string(),
      date: z.iso.date().or(z.date()),
    }),
  },
});

export default defineConfig({
  mdxOptions: {
    // MDX options
  },
});
