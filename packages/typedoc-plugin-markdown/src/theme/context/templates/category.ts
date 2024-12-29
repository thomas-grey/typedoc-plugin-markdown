import { MarkdownPageEvent } from '@plugin/events/index.js';
import { heading } from '@plugin/libs/markdown/index.js';
import { MarkdownThemeContext } from '@plugin/theme/index.js';
import { DeclarationReflection, Reflection, ReflectionKind } from 'typedoc';

export function category(
  this: MarkdownThemeContext,
  page: MarkdownPageEvent<Reflection>,
) {
  const md: string[] = [];

  const model = page.model as unknown as any;

  md.push(this.hook('page.begin', this).join('\n'));

  if (!this.options.getValue('hidePageHeader')) {
    md.push(this.partials.header());
  }

  if (!this.options.getValue('hideBreadcrumbs')) {
    md.push(this.partials.breadcrumbs());
  }

  if (!this.options.getValue('hidePageTitle')) {
    md.push(heading(1, this.partials.pageTitle()));
  }

  md.push(this.hook('content.begin', this).join('\n'));

  if (model.description) {
    md.push(this.helpers.getCommentParts(model.description));
  }

  const hasNamespaces = model.children.some(
    (child) => child.kind === ReflectionKind.Namespace,
  );

  if (hasNamespaces) {
    md.push(
      heading(2, this.internationalization.proxy.kind_plural_namespace()),
    );
    md.push(
      this.partials.groupIndex(model, {
        filterKinds: [ReflectionKind.Namespace],
      }),
    );
  }

  md.push(
    this.partials.members(model.children as DeclarationReflection[], {
      headingLevel: 2,
    }),
  );

  md.push(this.partials.footer());

  md.push(this.hook('page.end', this).join('\n'));

  return md.join('\n\n');
}
