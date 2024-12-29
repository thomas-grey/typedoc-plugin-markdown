import { MarkdownPageEvent } from '@plugin/events/index.js';
import {
  formatMarkdown,
  getDirectoryName,
  slugify,
} from '@plugin/libs/utils/index.js';
import { OutputFileStrategy } from '@plugin/options/maps.js';
import { NavigationBuilder, UrlBuilder } from '@plugin/theme/base/index.js';
import { MarkdownThemeContext } from '@plugin/theme/index.js';
import { RenderTemplate } from '@plugin/types/index.js';
import {
  DeclarationReflection,
  DocumentReflection,
  ProjectReflection,
  Reflection,
  ReflectionCategory,
  ReflectionKind,
  Renderer,
  Theme,
} from 'typedoc';

/**
 * The main theme class for the plugin.
 *
 * The class controls how TypeDoc models are mapped to files and templates and extends TypeDoc's base Theme class.
 *
 * You would typically only be interested in overriding the the theme's render context instance.
 *
 * The API follows the implementation of [TypeDoc's custom theming](https://github.com/TypeStrong/typedoc/blob/master/internal-docs/custom-themes.md) with some minor adjustments.
 *
 * @group Theme Classes
 *
 * @internal
 */
export class MarkdownTheme extends Theme {
  constructor(renderer: Renderer) {
    super(renderer);
  }

  /**
   * Renders a template and page model to a string.
   *
   * @internal
   */
  render(
    page: MarkdownPageEvent<Reflection>,
    template: RenderTemplate<MarkdownPageEvent<Reflection>>,
  ) {
    try {
      return formatMarkdown(template(page));
    } catch (e) {
      this.application.logger.error(`Error rendering page ${page.url}. ${e}`);
      throw new Error(e);
    }
  }

  /**
   * Creates a new instance of the current theme context.
   *
   * This method can be overridden to provide an alternative theme context.
   */
  getRenderContext(page: MarkdownPageEvent<Reflection>) {
    return new MarkdownThemeContext(this, page, this.application.options);
  }

  /**
   * Maps the models of the given project to the desired output files.
   */
  getUrls(project: ProjectReflection) {
    return new UrlBuilder(this, project).getUrls();
  }

  /**
   * Map the models of the given project to a navigation structure.
   */
  getNavigation(project: ProjectReflection) {
    return new NavigationBuilder(this, project).getNavigation();
  }

  /**
   * @internal
   */
  getTemplateMapping(
    reflection: DeclarationReflection | DocumentReflection,
    outputFileStrategy?: OutputFileStrategy,
  ) {
    outputFileStrategy =
      outputFileStrategy ||
      (this.application.options.getValue(
        'outputFileStrategy',
      ) as OutputFileStrategy);

    const membersWithOwnFile =
      this.application.options.getValue('membersWithOwnFile');

    if (
      outputFileStrategy === OutputFileStrategy.Categories &&
      reflection instanceof ReflectionCategory
    ) {
      return {
        template: this.categoryTemplate,
        directory: slugify(reflection.title),
        kind: null,
      };
    }

    const memberMapping = (
      template: (pageEvent: MarkdownPageEvent<Reflection>) => string,
      kind: ReflectionKind,
    ) => {
      return {
        template,
        directory: getDirectoryName(ReflectionKind.pluralString(kind)),
        kind: kind,
      };
    };
    const mappings = {
      [ReflectionKind.Module]: {
        template: this.reflectionTemplate,
        directory: null,
        kind: ReflectionKind.Module,
      },
      [ReflectionKind.Namespace]: {
        template: this.reflectionTemplate,
        directory: getDirectoryName(
          ReflectionKind.pluralString(ReflectionKind.Namespace),
        ),
        kind: ReflectionKind.Namespace,
      },
      [ReflectionKind.Document]: {
        template: this.documentTemplate,
        directory: getDirectoryName(
          ReflectionKind.pluralString(ReflectionKind.Document),
        ),
        kind: ReflectionKind.Document,
      },
    };

    if (
      outputFileStrategy === OutputFileStrategy.Members &&
      (membersWithOwnFile as string[])?.includes(
        ReflectionKind[ReflectionKind.Class],
      )
    ) {
      mappings[ReflectionKind.Class] = memberMapping(
        this.reflectionTemplate,
        ReflectionKind.Class,
      );
    }

    if (
      outputFileStrategy === OutputFileStrategy.Members &&
      (membersWithOwnFile as string[])?.includes(
        ReflectionKind[ReflectionKind.Interface],
      )
    ) {
      mappings[ReflectionKind.Interface] = memberMapping(
        this.reflectionTemplate,
        ReflectionKind.Interface,
      );
    }

    if (
      outputFileStrategy === OutputFileStrategy.Members &&
      (membersWithOwnFile as string[])?.includes(
        ReflectionKind[ReflectionKind.Enum],
      )
    ) {
      mappings[ReflectionKind.Enum] = memberMapping(
        this.reflectionTemplate,
        ReflectionKind.Enum,
      );
    }

    if (
      outputFileStrategy === OutputFileStrategy.Members &&
      (membersWithOwnFile as string[])?.includes(
        ReflectionKind[ReflectionKind.Function],
      )
    ) {
      mappings[ReflectionKind.Function] = memberMapping(
        this.reflectionTemplate,
        ReflectionKind.Function,
      );
    }

    if (
      outputFileStrategy === OutputFileStrategy.Members &&
      (membersWithOwnFile as string[])?.includes(
        ReflectionKind[ReflectionKind.TypeAlias],
      )
    ) {
      mappings[ReflectionKind.TypeAlias] = memberMapping(
        this.reflectionTemplate,
        ReflectionKind.TypeAlias,
      );
    }

    if (
      outputFileStrategy === OutputFileStrategy.Members &&
      (membersWithOwnFile as string[])?.includes(
        ReflectionKind[ReflectionKind.Variable],
      )
    ) {
      mappings[ReflectionKind.Variable] = memberMapping(
        this.reflectionTemplate,
        ReflectionKind.Variable,
      );
    }

    return mappings[reflection.kind];
  }

  /**
   * @internal
   */
  documentTemplate = (page: MarkdownPageEvent<DocumentReflection>) => {
    return this.getRenderContext(page).templates.document(page);
  };

  /**
   * @internal
   */
  readmeTemplate = (page: MarkdownPageEvent<ProjectReflection>) => {
    return this.getRenderContext(page).templates.readme(page);
  };

  /**
   * @internal
   */
  projectTemplate = (page: MarkdownPageEvent<ProjectReflection>) => {
    return this.getRenderContext(page).templates.project(page);
  };

  /**
   * @internal
   */
  reflectionTemplate = (page: MarkdownPageEvent<DeclarationReflection>) => {
    return this.getRenderContext(page).templates.reflection(page);
  };

  /**
   * @internal
   */
  categoryTemplate = (page: MarkdownPageEvent<Reflection>) => {
    return this.getRenderContext(page).templates.category(page);
  };
}
