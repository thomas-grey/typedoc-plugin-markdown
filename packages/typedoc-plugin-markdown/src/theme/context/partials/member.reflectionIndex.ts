import { heading } from '@plugin/libs/markdown/index.js';
import { MarkdownThemeContext } from '@plugin/theme/index.js';
import {
  DeclarationReflection,
  ProjectReflection,
  ReflectionKind,
} from 'typedoc';

export function reflectionIndex(
  this: MarkdownThemeContext,
  model: ProjectReflection | DeclarationReflection,
  options: { headingLevel: number },
): string {
  const md: string[] = [];

  if (model.categories) {
    model.categories.forEach((categoryGroup) => {
      md.push(heading(options.headingLevel, categoryGroup.title) + '\n');
      if (categoryGroup.description) {
        md.push(this.helpers.getCommentParts(categoryGroup.description) + '\n');
      }
      md.push(this.helpers.getGroupIndex(categoryGroup) + '\n');
    });
  } else {
    const groups = model.groups?.filter(
      (group) =>
        group.allChildrenHaveOwnDocument() &&
        group.title !== ReflectionKind.pluralString(ReflectionKind.Document),
    );
    groups?.forEach((reflectionGroup) => {
      if (reflectionGroup.categories) {
        md.push(heading(options.headingLevel, reflectionGroup.title) + '\n');
        if (reflectionGroup.description) {
          md.push(
            this.helpers.getCommentParts(reflectionGroup.description) + '\n',
          );
        }
        reflectionGroup.categories.forEach((categoryGroup) => {
          md.push(
            heading(options.headingLevel + 1, categoryGroup.title) + '\n',
          );
          if (categoryGroup.description) {
            md.push(
              this.helpers.getCommentParts(categoryGroup.description) + '\n',
            );
          }
          md.push(this.helpers.getGroupIndex(categoryGroup) + '\n');
        });
      } else {
        md.push(heading(options.headingLevel, reflectionGroup.title) + '\n');
        if (reflectionGroup.description) {
          md.push(
            this.helpers.getCommentParts(reflectionGroup.description) + '\n',
          );
        }
        md.push(this.helpers.getGroupIndex(reflectionGroup) + '\n');
      }
    });
  }
  return md.join('\n');
}
