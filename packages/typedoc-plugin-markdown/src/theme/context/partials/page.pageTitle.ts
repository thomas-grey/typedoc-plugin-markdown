import { MarkdownThemeContext } from '@plugin/theme/index.js';
import {
  DeclarationReflection,
  Reflection,
  ReflectionCategory,
  ReflectionKind,
} from 'typedoc';

export function pageTitle(this: MarkdownThemeContext): string {
  const textContentMappings = this.options.getValue('textContentMappings');
  const pageTitleTemplates = this.options.getValue('pageTitleTemplates');
  const hasCustomPageTitle = this.options.isSet('pageTitleTemplates');
  const indexPageTitle: any = hasCustomPageTitle
    ? pageTitleTemplates['index']
    : textContentMappings['title.indexPage'];
  const categoryPageTitle: any = pageTitleTemplates['category'];
  const modulePageTitle: any = hasCustomPageTitle
    ? pageTitleTemplates['module']
    : textContentMappings['title.modulePage'];
  const memberPageTitle: any = hasCustomPageTitle
    ? pageTitleTemplates['member']
    : textContentMappings['title.memberPage'];

  const page = this.page;

  if ((page.model as Reflection)?.url === page.project.url) {
    if (typeof indexPageTitle === 'string') {
      return this.helpers.getProjectName(indexPageTitle, page);
    }
    return indexPageTitle({
      projectName: page?.project?.name,
      version: page?.project?.packageVersion,
    });
  }

  const name = this.partials.memberTitle(page.model as DeclarationReflection);
  const kind = this.internationalization.kindSingularString(page.model.kind);
  const group = page.group;

  if (page.model instanceof ReflectionCategory) {
    if (typeof categoryPageTitle === 'string') {
      return getFromString(categoryPageTitle, name, this.i18n.theme_category());
    }
    return categoryPageTitle({
      name,
      kind: this.i18n.theme_category(),
    });
  }

  if (
    [ReflectionKind.Module, ReflectionKind.Namespace].includes(page.model.kind)
  ) {
    if (typeof modulePageTitle === 'string') {
      return getFromString(modulePageTitle, name, kind);
    }

    return modulePageTitle({
      name,
      kind,
    });
  }

  if (typeof memberPageTitle === 'string') {
    return getFromString(memberPageTitle, name, kind);
  }

  return memberPageTitle({
    name,
    kind,
    group,
  });
}

function getFromString(textContent: string, name: string, kind: string) {
  return textContent.replace('{name}', name).replace('{kind}', kind);
}
