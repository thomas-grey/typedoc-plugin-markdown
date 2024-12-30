import { htmlTable, link, table } from '@plugin/libs/markdown/index.js';
import {
  escapeChars,
  getFileNameWithExtension,
} from '@plugin/libs/utils/index.js';
import { MarkdownThemeContext } from '@plugin/theme/index.js';
import * as path from 'path';
import { ProjectReflection } from 'typedoc';

export function packagesIndex(
  this: MarkdownThemeContext,
  model: ProjectReflection,
): string {
  const leftAlignHeadings = this.options.getValue(
    'tableColumnSettings',
  ).leftAlignHeaders;

  const md: string[] = [];

  const includeVersion = model.children?.some((projectPackage) =>
    Boolean(projectPackage.packageVersion),
  );

  const fileExtension = this.options.getValue('fileExtension');

  const entryFileName = getFileNameWithExtension(
    this.options.getValue('entryFileName'),
    fileExtension,
  );

  if (this.options.getValue('indexFormat').toLowerCase().includes('table')) {
    const headers = [this.i18n.theme_package()];
    if (includeVersion) {
      headers.push(this.i18n.theme_version());
    }
    headers.push(this.i18n.theme_description());

    const packageRows = model.children?.map((projectPackage) => {
      const packageMeta = this.getPackageMetaData(projectPackage.name);

      const urlTo = projectPackage.readme
        ? `${path.dirname(projectPackage.url || '')}/${entryFileName}`
        : projectPackage.url;

      const rows = [
        urlTo
          ? link(escapeChars(projectPackage.name), this.getRelativeUrl(urlTo))
          : escapeChars(projectPackage.name),
      ];
      if (includeVersion) {
        rows.push(projectPackage.packageVersion || '-');
      }
      rows.push(packageMeta?.description || '-');

      return rows;
    });
    const output =
      this.options.getValue('indexFormat') === 'htmlTable'
        ? htmlTable(headers, packageRows || [], leftAlignHeadings)
        : table(headers, packageRows || [], leftAlignHeadings);
    md.push(output);
  } else {
    const packagesList = model.children?.map((projectPackage) => {
      const urlTo = projectPackage.readme
        ? `${path.dirname(projectPackage.url || '')}/${entryFileName}`
        : projectPackage.url;
      return urlTo
        ? `- ${link(
            `${escapeChars(projectPackage.name)}${projectPackage.packageVersion ? ` - v${projectPackage.packageVersion}` : ''}`,
            this.getRelativeUrl(urlTo),
          )}`
        : '';
    });
    md.push(packagesList?.join('\n') || '');
  }

  return md.join('\n\n');
}
