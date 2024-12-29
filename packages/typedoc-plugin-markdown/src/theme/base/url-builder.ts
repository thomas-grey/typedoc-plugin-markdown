import {
  getFileNameWithExtension,
  isQuoted,
  removeFirstScopedDirectory,
  slugify,
  toPascalCase,
} from '@plugin/libs/utils/index.js';
import { OutputFileStrategy } from '@plugin/options/maps.js';
import { MarkdownTheme } from '@plugin/theme/index.js';
import {
  MarkdownRenderer,
  TemplateMapping,
  UrlMapping,
  UrlOption,
} from '@plugin/types/index.js';
import * as path from 'path';
import {
  DeclarationReflection,
  DocumentReflection,
  EntryPointStrategy,
  Options,
  ProjectReflection,
  Reflection,
  ReflectionCategory,
  ReflectionKind,
} from 'typedoc';

/**
 * Map the models of the given project to the desired output files.
 * Based on TypeDoc DefaultTheme.getUrls()
 *
 * @param project  The project whose urls should be generated.
 */
export class UrlBuilder {
  private options: Options;
  private packagesMeta: any;
  private fileExtension: string;
  private ignoreScopes: boolean;
  private entryFileName: string;
  private isPackages: boolean;
  private flattenOutputFiles: boolean;
  private urls: UrlMapping<Reflection>[] = [];
  private anchors: Record<string, string[]> = {};

  constructor(
    public theme: MarkdownTheme,
    public project: ProjectReflection,
  ) {
    this.options = theme.application.options;

    this.packagesMeta = (
      theme.application.renderer as unknown as MarkdownRenderer
    ).packagesMeta;

    this.fileExtension = this.options.getValue('fileExtension');
    this.ignoreScopes = this.options.getValue('excludeScopesInPaths');

    this.entryFileName = getFileNameWithExtension(
      this.options.getValue('entryFileName'),
      this.fileExtension,
    );

    this.isPackages =
      this.options.getValue('entryPointStrategy') ===
      EntryPointStrategy.Packages;

    this.flattenOutputFiles = this.options.getValue('flattenOutputFiles');
  }

  getUrls() {
    this.buildEntryUrls();

    if (this.isPackages) {
      if (Object.keys(this.packagesMeta)?.length === 1) {
        this.buildUrlsFromProject(this.project);
      } else {
        this.project.children?.forEach((projectChild) => {
          this.buildUrlsFromPackage(projectChild);
        });
      }
    } else {
      this.buildUrlsFromProject(this.project);
    }

    return this.urls;
  }

  private buildEntryUrls() {
    const preserveReadme =
      Boolean(this.project.readme) && !this.options.getValue('mergeReadme');

    const isModulesOnly = this.project.children?.every(
      (child) => child.kind === ReflectionKind.Module,
    );
    const useEntryModule =
      this.project?.groups &&
      Boolean(
        this.project?.groups[0]?.children.find(
          (child) => child.name === this.options.getValue('entryModule'),
        ),
      ) &&
      isModulesOnly;
    const indexFilename = this.getIndexFileName(this.project, this.isPackages);

    this.project.url = preserveReadme
      ? indexFilename
      : useEntryModule
        ? indexFilename
        : this.entryFileName;

    if (preserveReadme) {
      this.urls.push({
        url: useEntryModule
          ? getFileNameWithExtension('readme_', this.fileExtension)
          : this.entryFileName,
        model: this.project,
        template: this.theme.readmeTemplate,
      });

      if (!useEntryModule) {
        this.urls.push({
          url: indexFilename,
          model: this.project,
          template: this.theme.projectTemplate,
        });
      }
    } else {
      if (!useEntryModule) {
        this.urls.push({
          url: this.entryFileName,
          model: this.project,
          template: this.theme.projectTemplate,
        });
      }
    }
  }

  private buildUrlsFromProject(
    project: ProjectReflection | DeclarationReflection,
    parentUrl?: string,
    outputFileStrategy?: OutputFileStrategy,
    entryModule?: string,
    entryFileName?: string,
  ) {
    const groupProps = {
      ...(parentUrl && { parentUrl }),
      ...(outputFileStrategy && { outputFileStrategy }),
      ...(entryModule && { entryModule }),
      ...(entryFileName && { entryFileName }),
    };

    if (project.documents) {
      project.documents.forEach((document) => {
        this.buildUrlsForDocument(document);
      });
    }
    if (
      this.options.getValue('outputFileStrategy') ===
        OutputFileStrategy.Categories &&
      project.categories
    ) {
      project.categories.forEach((category) => {
        this.buildUrlsFromGroup(
          category as unknown as DeclarationReflection,
          groupProps,
        );
      });
    } else {
      project.groups?.forEach((projectGroup) => {
        projectGroup.children?.forEach((projectGroupChild) => {
          if (projectGroupChild instanceof DocumentReflection) {
            this.buildUrlsForDocument(projectGroupChild);
          }
          if (projectGroupChild instanceof DeclarationReflection) {
            this.buildUrlsFromGroup(projectGroupChild, {
              ...groupProps,
              group: projectGroup.title,
            });
          }
        });
      });
    }
  }

  private buildUrlsFromPackage(projectChild: DeclarationReflection) {
    const preservePackageReadme =
      Boolean(projectChild.readme) && !this.options.getValue('mergeReadme');

    const packagesIndex = this.getIndexFileName(projectChild);

    const packageOptions = this.packagesMeta[projectChild.name]?.options;

    const outputFileStrategy = packageOptions.isSet('outputFileStrategy')
      ? packageOptions.getValue('outputFileStrategy')
      : this.options.getValue('outputFileStrategy');

    const entryModule = packageOptions.isSet('entryModule')
      ? packageOptions.getValue('entryModule')
      : this.options.getValue('entryModule');

    const packageEntryFileName = packageOptions.isSet('entryFileName')
      ? packageOptions.getValue('entryFileName')
      : this.options.getValue('entryFileName');

    let fullEntryFileName = getFileNameWithExtension(
      path.join(projectChild.name, packageEntryFileName),
      this.fileExtension,
    );

    let fullIndexFileName = getFileNameWithExtension(
      path.join(projectChild.name, packagesIndex),
      this.fileExtension,
    );

    if (this.ignoreScopes) {
      fullEntryFileName = removeFirstScopedDirectory(fullEntryFileName);
      fullIndexFileName = removeFirstScopedDirectory(fullIndexFileName);
    }

    const indexFileName = preservePackageReadme
      ? fullIndexFileName
      : fullEntryFileName;

    const isModulesOnly = projectChild.children?.every(
      (child) => child.kind === ReflectionKind.Module,
    );

    const useEntryModule =
      projectChild?.groups &&
      Boolean(
        projectChild?.groups[0]?.children.find(
          (child) => child.name === entryModule,
        ),
      ) &&
      isModulesOnly;

    if (preservePackageReadme) {
      this.urls.push({
        url: useEntryModule
          ? `${path.dirname(indexFileName)}/${getFileNameWithExtension('readme_', this.fileExtension)}`
          : path.join(
              path.dirname(indexFileName),
              getFileNameWithExtension(
                packageEntryFileName,
                this.fileExtension,
              ),
            ),
        model: projectChild,
        template: this.theme.readmeTemplate,
      });

      if (!useEntryModule) {
        this.urls.push({
          url: indexFileName,
          model: projectChild,
          template: this.theme.projectTemplate,
        });
      }
    } else {
      if (!useEntryModule) {
        this.urls.push({
          url: indexFileName,
          model: projectChild,
          template: this.theme.projectTemplate,
        });
      }
    }

    projectChild.url = indexFileName;

    projectChild.documents?.forEach((document) => {
      this.buildUrlsForDocument(document);
    });

    const parentUrl =
      indexFileName.split(path.sep)?.length > 1
        ? indexFileName
        : `${projectChild.name}/${indexFileName}`;

    this.buildUrlsFromProject(
      projectChild,
      parentUrl,
      outputFileStrategy,
      entryModule,
      fullEntryFileName,
    );
  }

  private buildUrlsForDocument(reflection: DocumentReflection) {
    const mapping: TemplateMapping = this.theme.getTemplateMapping(reflection);

    if (mapping) {
      const baseUrl = path.dirname(reflection.parent?.url || '');

      const directory = this.flattenOutputFiles
        ? ReflectionKind.singularString(reflection.kind)
        : (mapping.directory as string);

      const filename = [
        getFileNameWithExtension(reflection.name, this.fileExtension),
      ];

      if (
        reflection?.parent?.kind &&
        ![ReflectionKind.Module, ReflectionKind.Project].includes(
          reflection?.parent?.kind,
        )
      ) {
        filename.unshift(
          toPascalCase(ReflectionKind.singularString(reflection.parent?.kind)),
        );
      }

      const urlBase = path.join(baseUrl, directory, filename.join('.'));
      const url = this.flattenOutputFiles
        ? urlBase.replace(/\//g, '.')
        : urlBase;

      this.urls.push({
        url,
        model: reflection,
        template: mapping.template,
      });

      reflection.url = url;
      reflection.hasOwnDocument = true;
    }
  }

  private buildUrlsFromGroup(
    reflection: DeclarationReflection,
    urlOptions: UrlOption,
  ) {
    if (
      this.options.getValue('outputFileStrategy') ===
        OutputFileStrategy.Categories &&
      reflection instanceof ReflectionCategory
    ) {
      reflection.name = reflection.title;
    }

    const mapping: TemplateMapping = this.theme.getTemplateMapping(
      reflection,
      urlOptions.outputFileStrategy,
    );

    if (mapping) {
      let url: string;
      let urlPath = '';

      if (this.flattenOutputFiles) {
        url = this.getFlattenedUrl(reflection);
      } else {
        const directory = urlOptions.directory || mapping.directory;
        urlPath = this.getUrlPath(reflection, {
          ...urlOptions,
          directory,
        });

        url = this.getUrl(reflection, urlPath, urlOptions);

        if (this.ignoreScopes) {
          url = removeFirstScopedDirectory(url);
        }

        const duplicateUrls = this.urls.filter(
          (urlMapping) =>
            urlMapping.url.toLowerCase() === url.toLowerCase() &&
            urlMapping.url !== url,
        );

        if (duplicateUrls.length > 0) {
          const urlParts = url.split('.');
          urlParts[urlParts.length - 2] += `-${duplicateUrls.length}`;
          url = urlParts.join('.');
        }
      }

      this.urls.push({
        url: url,
        model: reflection,
        template: mapping.template,
        group: urlOptions.group,
      });

      reflection.url = url;
      reflection.hasOwnDocument = true;

      if (
        this.options.getValue('outputFileStrategy') ===
          OutputFileStrategy.Categories &&
        reflection instanceof ReflectionCategory
      ) {
        reflection.children.forEach((groupChild) => {
          const mapping = this.theme.getTemplateMapping(
            groupChild,
            urlOptions.outputFileStrategy,
          );
          this.buildUrlsFromGroup(groupChild as DeclarationReflection, {
            parentUrl: urlPath,
            category: reflection.title,
            directory: mapping?.directory || null,
            outputFileStrategy: urlOptions.outputFileStrategy,
          });
        });
      }

      if (
        this.options.getValue('outputFileStrategy') ===
          OutputFileStrategy.Categories &&
        reflection.categories?.length
      ) {
        reflection.categories.forEach((category) => {
          (category as any).parent = reflection;
          this.buildUrlsFromGroup(
            category as unknown as DeclarationReflection,
            {
              parentUrl: urlPath,
              directory: null,
              outputFileStrategy: urlOptions.outputFileStrategy,
              category: category.title,
            },
          );
          category.children.forEach((groupChild) => {
            const mapping = this.theme.getTemplateMapping(
              groupChild,
              urlOptions.outputFileStrategy,
            );
            this.buildUrlsFromGroup(groupChild as DeclarationReflection, {
              parentUrl: urlPath,
              category: category.title,
              directory: mapping?.directory || null,
              outputFileStrategy: urlOptions.outputFileStrategy,
            });
          });
        });
      } else {
        if (reflection.groups) {
          reflection.groups?.forEach((group) => {
            group.children.forEach((groupChild) => {
              const mapping = this.theme.getTemplateMapping(
                groupChild,
                urlOptions.outputFileStrategy,
              );
              this.buildUrlsFromGroup(groupChild as DeclarationReflection, {
                parentUrl: urlPath,
                directory: mapping?.directory || null,
                outputFileStrategy: urlOptions.outputFileStrategy,
                group: group.title,
              });
            });
          });
        } else {
          if (reflection instanceof DeclarationReflection) {
            reflection.traverse((child) => {
              this.applyAnchorUrl(child as any, reflection.url || '');
            });
          }
        }
      }
    } else if (reflection.parent) {
      this.traverseChildren(reflection, reflection.parent);
    }
  }

  private traverseChildren(
    reflection: DeclarationReflection,
    container: Reflection,
  ) {
    if (container.url) {
      this.applyAnchorUrl(reflection, container.url);
    }

    if (reflection.parent) {
      reflection.traverse((child) => {
        if (child.isDocument()) {
          this.buildUrlsForDocument(child);
        }
        if (child.isDeclaration()) {
          this.traverseChildren(child, container);
        }
      });
    }
  }

  private getUrl(
    reflection: DeclarationReflection,
    urlPath: string,
    urlOptions: UrlOption,
  ) {
    const entryModule =
      urlOptions.entryModule || this.options.getValue('entryModule');

    const entryName = urlOptions.entryFileName || this.entryFileName;

    if (reflection.name === entryModule) {
      return entryName;
    }

    if (
      this.options.getValue('outputFileStrategy') ===
        OutputFileStrategy.Modules &&
      reflection.name === 'index' &&
      path.parse(entryName).name === 'index'
    ) {
      return urlPath.replace(
        getFileNameWithExtension('index', this.fileExtension),
        getFileNameWithExtension('module_index', this.fileExtension),
      );
    }
    return urlPath;
  }

  getFlattenedUrl(reflection: DeclarationReflection) {
    const fullName = reflection.getFullName();

    const fullNameParts = fullName.replace(/\//g, '.').split('.');
    if (reflection.kind !== ReflectionKind.Module) {
      fullNameParts.splice(
        fullNameParts.length - 1,
        0,
        toPascalCase(ReflectionKind.singularString(reflection.kind)),
      );
    }
    const url = `${fullNameParts.join('.')}${this.fileExtension}`
      .replace(/"/g, '')
      .replace(/ /g, '-')
      .replace(/^\./g, '');

    reflection.url = url;
    return url;
  }

  private getAlias(name: string) {
    if (isQuoted(name)) {
      name = name.replace(/\//g, '_');
    }
    return name
      .replace(/"/g, '')
      .replace(/^_+|_+$/g, '')
      .replace(/[<>]/g, '-');
  }

  private getUrlPath(reflection: DeclarationReflection, urlOption: UrlOption) {
    const alias = this.getAlias(reflection.name);

    const parentDir = urlOption.parentUrl
      ? path.dirname(urlOption.parentUrl)
      : null;

    const dir = () => {
      if (
        reflection instanceof ReflectionCategory &&
        !this.categoryHasNamespaces(reflection)
      ) {
        return null;
      }

      if (reflection.kind === ReflectionKind.Namespace) {
        const baseDir =
          this.options.getValue('outputFileStrategy') ===
            OutputFileStrategy.Categories && urlOption.category
            ? `${slugify(urlOption.category)}/${urlOption.directory}`
            : urlOption.directory;
        return `${baseDir}/${alias}`;
      }

      if (reflection.kind === ReflectionKind.Module) {
        return alias;
      }

      return urlOption.directory
        ? urlOption.directory
        : `${slugify(ReflectionKind.singularString(reflection.kind))}.${alias}`;
    };

    const filename = () => {
      if (
        [ReflectionKind.Module, ReflectionKind.Namespace].includes(
          reflection.kind,
        ) &&
        this.options.getValue('outputFileStrategy') ===
          OutputFileStrategy.Modules &&
        !this.moduleHasSubfolders(reflection)
      ) {
        return null;
      }
      if (
        (reflection instanceof ReflectionCategory &&
          this.categoryHasNamespaces(reflection)) ||
        [ReflectionKind.Module, ReflectionKind.Namespace].includes(
          reflection.kind,
        )
      ) {
        return path.parse(this.entryFileName).name;
      }
      return alias;
    };

    return getFileNameWithExtension(
      [parentDir, dir(), filename()].filter((part) => Boolean(part)).join('/'),
      this.fileExtension,
    );
  }

  private applyAnchorUrl(reflection: Reflection, containerUrl: string) {
    const anchorPrefix = this.options.getValue('anchorPrefix');
    const anchorId = this.getAnchorId(reflection);

    if (!this.anchors[containerUrl]) {
      this.anchors[containerUrl] = [];
    }

    if (anchorId) {
      const count = this.anchors[containerUrl]?.filter(
        (id) => id === anchorId,
      )?.length;

      let anchorParts: string[] = [];

      if (
        reflection.parent?.parent?.kind === ReflectionKind.Property &&
        reflection.kind === ReflectionKind.Property
      ) {
        const anchorMatch = containerUrl.match(/#(.*)$/);
        const anchor = anchorMatch ? anchorMatch[1] : '';
        anchorParts = [anchor];
      } else {
        this.anchors[containerUrl].push(anchorId);
        anchorParts = [anchorId];
        if (count > 0) {
          anchorParts.push(`-${count}`);
        }
      }

      if (anchorPrefix) {
        anchorParts.unshift(`${anchorPrefix}`);
      }

      reflection.url =
        reflection.kind === ReflectionKind.TypeLiteral
          ? containerUrl
          : containerUrl + '#' + anchorParts.join('');
      reflection.anchor = anchorParts.join('');
      reflection.hasOwnDocument = false;
    }
    if (
      this.options.getValue('outputFileStrategy') === OutputFileStrategy.Members
    ) {
      reflection.traverse((child) => {
        this.applyAnchorUrl(child as DeclarationReflection, containerUrl);
      });
    }
  }

  private getAnchorId(reflection: Reflection) {
    const preserveAnchorCasing = this.options.getValue('preserveAnchorCasing');

    const anchorName = this.getAnchorName(reflection);

    if (anchorName) {
      return preserveAnchorCasing ? anchorName : anchorName.toLowerCase();
    }

    return null;
  }

  private getAnchorName(reflection: Reflection) {
    if ([ReflectionKind.TypeParameter].includes(reflection.kind)) {
      return null;
    }
    if (reflection.kind === ReflectionKind.Constructor) {
      return 'Constructors';
    }
    const anchorParts = [reflection.name.replace(/[\\[\]]/g, '')];
    const typeParams = (reflection as DeclarationReflection)?.typeParameters;
    if (typeParams?.length) {
      anchorParts.push(
        typeParams?.map((typeParameter) => typeParameter.name).join('-'),
      );
    }
    return anchorParts.join('');
  }

  private moduleHasSubfolders(reflection: DeclarationReflection) {
    return reflection.childrenIncludingDocuments?.some((child) =>
      [ReflectionKind.Namespace, ReflectionKind.Document].includes(child.kind),
    );
  }

  private categoryHasNamespaces(category: ReflectionCategory) {
    return category.children.some(
      (child) => child.kind === ReflectionKind.Namespace,
    );
  }

  private getIndexFileName(
    reflection: ProjectReflection | DeclarationReflection,
    isPackages = false,
  ) {
    const modulesFileName = this.options.getValue('modulesFileName');
    if (modulesFileName) {
      return getFileNameWithExtension(modulesFileName, this.fileExtension);
    }
    if (isPackages) {
      return getFileNameWithExtension('packages', this.fileExtension);
    }
    const isModules = reflection.children?.every(
      (child) => child.kind === ReflectionKind.Module,
    );
    return isModules
      ? getFileNameWithExtension('modules', this.fileExtension)
      : getFileNameWithExtension('globals', this.fileExtension);
  }
}
