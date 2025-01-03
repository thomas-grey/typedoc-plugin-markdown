import { heading } from '@plugin/libs/markdown/index.js';
import { MarkdownThemeContext } from '@plugin/theme/index.js';
import {
  ContainerReflection,
  DeclarationReflection,
  ProjectReflection,
  ReflectionKind,
} from 'typedoc';

export function groups(
  this: MarkdownThemeContext,
  model: ContainerReflection,
  options: { headingLevel: number; kind: ReflectionKind },
) {
  const md: string[] = [];

  const getGroupTitle = (groupTitle: string) => {
    return groupTitle;
  };

  model.groups?.forEach((group) => {
    if (
      group.title === this.i18n.kind_plural_module() ||
      group.allChildrenHaveOwnDocument()
    ) {
      const isPackages =
        this.options.getValue('entryPointStrategy') === 'packages' &&
        this.getPackagesCount() > 1 &&
        group.title === this.i18n.kind_plural_module() &&
        model.kind === ReflectionKind.Project;
      if (isPackages) {
        md.push(heading(options.headingLevel, this.i18n.theme_packages()));
      } else {
        md.push(heading(options.headingLevel, group.title));
      }
      if (group.description) {
        md.push(this.helpers.getCommentParts(group.description));
      }
      if (group.categories) {
        group.categories.forEach((categoryGroup) => {
          md.push(heading(options.headingLevel + 1, categoryGroup.title));
          if (categoryGroup.description) {
            md.push(this.helpers.getCommentParts(categoryGroup.description));
          }
          md.push(this.partials.groupIndex(categoryGroup));
        });
      } else {
        if (isPackages) {
          md.push(this.partials.packagesIndex(model as ProjectReflection));
        } else {
          md.push(this.partials.groupIndex(group));
        }
      }
    } else {
      const isEventProps = getGroupTitle(group.title) === 'Events';
      if (group.categories) {
        md.push(heading(options.headingLevel, getGroupTitle(group.title)));
        if (group.description) {
          md.push(this.helpers.getCommentParts(group.description));
        }
        md.push(
          this.partials.categories(group.categories, {
            headingLevel: options.headingLevel + 1,
          }),
        );
      } else {
        const isPropertiesGroup = group.children.every(
          (child) => child.kind === ReflectionKind.Property,
        );

        const isEnumGroup = group.children.every(
          (child) => child.kind === ReflectionKind.EnumMember,
        );

        md.push(heading(options.headingLevel, getGroupTitle(group.title)));

        if (group.description) {
          md.push(this.helpers.getCommentParts(group.description));
        }
        if (
          isPropertiesGroup &&
          this.helpers.useTableFormat('properties', options.kind)
        ) {
          md.push(
            this.partials.propertiesTable(
              group.children as DeclarationReflection[],
              {
                isEventProps,
              },
            ),
          );
        } else if (isEnumGroup && this.helpers.useTableFormat('enums')) {
          md.push(
            this.partials.enumMembersTable(
              group.children as DeclarationReflection[],
            ),
          );
        } else {
          if (group.children) {
            md.push(
              this.partials.members(group.children as DeclarationReflection[], {
                headingLevel: options.headingLevel + 1,
                groupTitle: group.title,
              }),
            );
          }
        }
      }
    }
  });
  return md.join('\n\n');
}
