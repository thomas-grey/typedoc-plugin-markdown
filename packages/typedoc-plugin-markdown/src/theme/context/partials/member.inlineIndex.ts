import { heading } from '@plugin/libs/markdown/heading.js';
import { strikeThrough } from '@plugin/libs/markdown/index.js';
import { escapeChars } from '@plugin/libs/utils/index.js';
import { MarkdownThemeContext } from '@plugin/theme/index.js';
import {
  DeclarationReflection,
  ProjectReflection,
  ReflectionKind,
} from 'typedoc';

export function inlineIndex(
  this: MarkdownThemeContext,
  model: DeclarationReflection | ProjectReflection,
  options: { headingLevel: number },
): string {
  const md: string[] = [];

  md.push(heading(options.headingLevel, this.i18n.theme_index()));

  if (model.categories?.length) {
    if (model.kind === ReflectionKind.Class) {
      model.groups
        ?.filter((group) => group.title === this.i18n.kind_plural_constructor())
        .forEach((group) => {
          md.push(
            heading(
              options.headingLevel + 1,
              this.i18n.kind_plural_constructor(),
            ),
          );
          group.children.forEach((item) => {
            md.push(getItem(this, item as DeclarationReflection));
          });
        });
    }
    model.categories?.forEach((category) => {
      md.push(heading(options.headingLevel + 1, category.title));
      const list: string[] = [];
      category.children
        .filter((child) => child.kind !== ReflectionKind.Constructor)
        .forEach((child) => {
          list.push(getItem(this, child as DeclarationReflection));
        });
      md.push(list.join('\n'));
    });
  } else {
    if (
      this.options.getValue('excludeGroups') ||
      this.options.getValue('hideGroupHeadings')
    ) {
      const groupChildren = model.groups?.reduce((acc, group) => {
        return [...acc, ...group.children];
      }, []);
      const list: string[] = [];
      groupChildren?.forEach((child) => {
        list.push(getItem(this, child as DeclarationReflection));
      });
      md.push(list.join('\n'));
    } else {
      model.groups?.forEach((group) => {
        md.push(heading(options.headingLevel + 1, group.title));
        const list: string[] = [];
        group.children.forEach((child) => {
          list.push(getItem(this, child as DeclarationReflection));
        });
        md.push(list.join('\n'));
      });
    }
  }

  return md.join('\n\n');
}

function getItem(context: MarkdownThemeContext, item: DeclarationReflection) {
  const name = getName(item);
  return `- [${item.isDeprecated() ? strikeThrough(name) : name}${[ReflectionKind.Method, ReflectionKind.Function].includes(item.kind) ? '()' : ''}](${context.getRelativeUrl(item.url || '')})`;
}

function getName(item: DeclarationReflection) {
  if (item.kind === ReflectionKind.Constructor && item.signatures) {
    return `new ${escapeChars(item.signatures[0].name)}()`;
  }
  return escapeChars(item.name);
}
