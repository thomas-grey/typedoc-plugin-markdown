import { heading } from '@plugin/libs/markdown/index.js';
import { MarkdownThemeContext } from '@plugin/theme/index.js';
import {
  DeclarationReflection,
  ReflectionCategory,
  ReflectionKind,
} from 'typedoc';

export function categories(
  this: MarkdownThemeContext,
  models: ReflectionCategory[],
  options: { headingLevel: number },
) {
  const md: string[] = [];
  models.forEach((category) => {
    if (category.allChildrenHaveOwnDocument()) {
      md.push(heading(options.headingLevel, category.title));
      if (category.description) {
        md.push(this.helpers.getCommentParts(category.description));
      }
      md.push(this.partials.groupIndex(category));
    } else {
      const categoryChildren = category.children?.filter(
        (child) => child.kind !== ReflectionKind.Constructor,
      );
      if (categoryChildren.length) {
        md.push(heading(options.headingLevel, category.title));
        if (category.description) {
          md.push(this.helpers.getCommentParts(category.description));
        }
        md.push(
          this.partials.members(categoryChildren as DeclarationReflection[], {
            headingLevel: options.headingLevel + 1,
          }),
        );
      }
    }
  });
  return md.join('\n\n');
}
