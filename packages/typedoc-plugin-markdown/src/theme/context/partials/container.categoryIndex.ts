import { htmlTable, link, table } from '@plugin/libs/markdown/index.js';
import { escapeChars } from '@plugin/libs/utils/index.js';
import { MarkdownThemeContext } from '@plugin/theme/index.js';
import { DeclarationReflection, ReflectionCategory } from 'typedoc';

export function categoryIndex(
  this: MarkdownThemeContext,
  model: ReflectionCategory[],
): string {
  if (this.options.getValue('indexFormat').toLowerCase().includes('table')) {
    return getTable(this, model);
  }
  return getList(this, model);
}

function getList(
  context: MarkdownThemeContext,
  categories: ReflectionCategory[],
) {
  const filteredChildren =
    categories.map((category) => {
      return `- [${category.title}](${context.getRelativeUrl((category as any).url)})`;
    }) || [];

  return filteredChildren.join('\n');
}

function getTable(
  context: MarkdownThemeContext,
  categories: ReflectionCategory[],
) {
  const leftAlignHeadings = context.options.getValue(
    'tableColumnSettings',
  ).leftAlignHeaders;

  const isHtmlTable = context.options.getValue('indexFormat') === 'htmlTable';

  const headers = [
    context.i18n.theme_category(),
    context.i18n.theme_description(),
  ];

  const rows: string[][] = [];
  categories.forEach((category) => {
    const row: string[] = [];
    const categoryUrl = (category as unknown as DeclarationReflection).url;
    if (categoryUrl) {
      row.push(
        link(
          escapeChars((category as any).name),
          context.getRelativeUrl(categoryUrl),
        ),
      );
    }

    row.push(context.helpers.getShortDescription(category.description) || '-');

    rows.push(row);
  });

  return isHtmlTable
    ? htmlTable(headers, rows, leftAlignHeadings)
    : table(headers, rows, leftAlignHeadings);
}
