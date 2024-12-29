import { MarkdownPageEvent } from '@plugin/events/index.js';
import { heading } from '@plugin/libs/markdown/index.js';
import { MarkdownThemeContext } from '@plugin/theme/index.js';
import {
  EntryPointStrategy,
  ProjectReflection,
  ReflectionGroup,
  ReflectionKind,
} from 'typedoc';

export function project(
  this: MarkdownThemeContext,
  page: MarkdownPageEvent<ProjectReflection>,
) {
  const md: string[] = [];

  const isPackages =
    this.page.project.url === this.page.url &&
    this.options.getValue('entryPointStrategy') === EntryPointStrategy.Packages;

  md.push(this.hook('index.page.begin', this).join('\n'));

  if (!this.options.getValue('hidePageHeader')) {
    md.push(this.partials.header());
  }

  if (!this.options.getValue('hideBreadcrumbs')) {
    md.push(this.partials.breadcrumbs());
  }

  const includeReadme =
    this.options.getValue('mergeReadme') && Boolean(page.model.readme);

  if (includeReadme && page.model.readme) {
    md.push(this.helpers.getCommentParts(page.model.readme));
  }

  if (!this.options.getValue('hidePageTitle') && !includeReadme) {
    md.push(heading(1, this.partials.pageTitle()));
  }

  md.push(this.hook('content.begin', this).join('\n'));

  if (page.model.comment) {
    md.push(this.partials.comment(page.model.comment, { headingLevel: 2 }));
  }

  if (page.model?.groups?.some((group) => group.allChildrenHaveOwnDocument())) {
    if (page.model.documents?.length) {
      const group: ReflectionGroup = {
        children: page.model.documents,
      } as ReflectionGroup;
      md.push(heading(2, ReflectionKind.pluralString(ReflectionKind.Document)));
      md.push(this.partials.groupIndex(group));
    }

    if (
      page.model.children?.some((child) => child.kind !== ReflectionKind.Module)
    ) {
      md.push(this.partials.body(page.model, { headingLevel: 2 }));
    }

    md.push(
      this.partials.reflectionIndex(page.model, {
        headingLevel: 2,
      }),
    );
  } else {
    if (isPackages) {
      md.push(this.partials.packagesIndex(page.model));
    } else {
      md.push(this.partials.body(page.model, { headingLevel: 2 }));
    }
  }

  md.push(this.partials.footer());

  md.push(this.hook('index.page.end', this).join('\n'));

  return md.join('\n\n');
}
