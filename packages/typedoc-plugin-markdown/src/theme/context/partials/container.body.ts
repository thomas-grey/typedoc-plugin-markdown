import { heading, horizontalRule } from '@plugin/libs/markdown/index.js';
import { MarkdownThemeContext } from '@plugin/theme/index.js';
import {
  ContainerReflection,
  DeclarationReflection,
  ReflectionKind,
} from 'typedoc';

export function body(
  this: MarkdownThemeContext,
  model: ContainerReflection,
  options: { headingLevel: number },
): string {
  const md: string[] = [];

  if (model.categories?.length) {
    md.push(
      this.partials.categories(model.categories, {
        headingLevel: options.headingLevel,
      }),
    );
  } else {
    const containerKinds = [
      ReflectionKind.Project,
      ReflectionKind.Module,
      ReflectionKind.Namespace,
    ];
    if (
      (this.options.getValue('excludeGroups') ||
        this.options.getValue('hideGroupHeadings')) &&
      containerKinds.includes(model.kind)
    ) {
      if (model.categories?.length) {
        md.push(
          this.partials.categories(model.categories, {
            headingLevel: options.headingLevel,
          }),
        );
      } else {
        if (model.groups?.length) {
          model.groups.forEach((group, i) => {
            if (group.allChildrenHaveOwnDocument()) {
              md.push(heading(options.headingLevel, group.title));
              md.push(this.partials.groupIndex(group));
            } else {
              md.push(
                this.partials.members(
                  group.children as DeclarationReflection[],
                  {
                    headingLevel: options.headingLevel,
                  },
                ),
              );
              if (model.groups && i < model.groups?.length - 1) {
                md.push(horizontalRule());
              }
            }
          });
        }
      }
    } else {
      if (model.groups?.length) {
        md.push(
          this.partials.groups(model, {
            headingLevel: options.headingLevel,
            kind: model.kind,
          }),
        );
      }
    }
  }

  return md.join('\n\n');
}
