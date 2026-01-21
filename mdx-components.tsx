import type { ComponentProps } from 'react';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { CourseInfo } from '@/components/course-info';
import type { CourseInfoData } from '@/lib/types';
import { Files, Folder, File } from '@/components/file-tree';

type MdxContext = {
  course?: CourseInfoData;
};

export function getMDXComponents(
  components?: MDXComponents,
  context?: MdxContext
): MDXComponents {
  return {
    ...defaultMdxComponents,
    Files,
    Folder,
    File,
    CourseInfo: (props: ComponentProps<typeof CourseInfo>) => (
      <CourseInfo {...props} data={props.data ?? context?.course} />
    ),
    ...components,
  };
}
