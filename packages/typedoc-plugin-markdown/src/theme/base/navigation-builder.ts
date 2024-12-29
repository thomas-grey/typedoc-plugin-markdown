import { isQuoted } from '@plugin/libs/utils/index.js';
import { OutputFileStrategy } from '@plugin/options/maps.js';
import { MarkdownTheme } from '@plugin/theme/index.js';
import { MarkdownRenderer, NavigationItem } from '@plugin/types/index.js';
import * as path from 'path';
import {
  DeclarationReflection,
  DocumentReflection,
  EntryPointStrategy,
  Options,
  ProjectReflection,
  ReflectionCategory,
  ReflectionGroup,
  ReflectionKind,
} from 'typedoc';

export class NavigationBuilder {
  private options: Options;
  private packagesMeta: any;
  private navigationOptions: {
    excludeCategories: boolean;
    excludeGroups: boolean;
    excludeFolders: boolean;
  };
  private navigation: NavigationItem[] = [];
  private isPackages: boolean;

  constructor(
    public theme: MarkdownTheme,
    public project: ProjectReflection,
  ) {
    this.options = theme.application.options;
    this.navigationOptions = this.getNavigationOptions();
    this.packagesMeta = (
      theme.application.renderer as unknown as MarkdownRenderer
    ).packagesMeta;
    this.navigation = [];
    this.isPackages =
      this.options.getValue('entryPointStrategy') ===
      EntryPointStrategy.Packages;
  }

  getNavigation() {
    if (this.isPackages) {
      if (Object.keys(this.packagesMeta)?.length === 1) {
        this.buildNavigationFromProject(this.project);
      } else {
        this.project.children?.forEach((projectChild) => {
          this.buildNavigationFromPackage(projectChild);
        });
      }
    } else {
      this.buildNavigationFromProject(this.project);
    }

    this.removeEmptyChildren(this.navigation);

    return this.navigation;
  }

  private getNavigationOptions() {
    if (this.options.isSet('navigation')) {
      const navigationOptions = this.options.getValue('navigation');
      return {
        excludeCategories: !navigationOptions.includeCategories,
        excludeGroups: !navigationOptions.includeGroups,
        excludeFolders: !navigationOptions.includeFolders,
      };
    }
    return this.options.getValue('navigationModel');
  }

  private removeEmptyChildren(navigation: NavigationItem[]): void {
    navigation.forEach((navItem) => {
      if (navItem.children) {
        this.removeEmptyChildren(navItem.children);
        navItem.children = navItem.children.filter(
          (child) => Object.keys(child).length > 0,
        );
        if (navItem.children.length === 0) {
          delete navItem.children;
        }
      }
    });
  }

  private buildNavigationFromPackage(projectChild: DeclarationReflection) {
    const fileExtension = this.options.getValue('fileExtension');

    const entryFileName = `${path.parse(this.options.getValue('entryFileName')).name}${fileExtension}`;

    const preservePackageReadme =
      Boolean(projectChild.readme) && !this.options.getValue('mergeReadme');

    const packageOptions = this.packagesMeta[projectChild.name]?.options;

    const outputFileStrategy = packageOptions?.isSet('outputFileStrategy')
      ? packageOptions.getValue('outputFileStrategy')
      : this.options.getValue('outputFileStrategy');

    const entryModule = packageOptions?.isSet('entryModule')
      ? packageOptions.getValue('entryModule')
      : this.options.getValue('entryModule');

    const projectChildUrl = preservePackageReadme
      ? `${path.dirname(projectChild.url as string)}/${entryFileName}`
      : projectChild.url;

    const isModulesGroup =
      projectChild?.groups &&
      projectChild?.groups[0].children.every(
        (child) => child.kind === ReflectionKind.Module,
      );

    const children: NavigationItem[] = [];

    if (
      preservePackageReadme &&
      !isModulesGroup &&
      outputFileStrategy === OutputFileStrategy.Modules
    ) {
      children.push({
        title:
          this.theme.application.internationalization.proxy.theme_globals(),
        path: projectChild.url,
        kind: projectChild.kind,
      });
    }
    const childGroups = this.getReflectionGroups(
      projectChild,
      outputFileStrategy,
    );

    if (childGroups) {
      children.push(
        ...childGroups.filter((child) => child.title !== entryModule),
      );
    }

    this.navigation.push({
      title: projectChild.name,
      kind: projectChild.kind,
      children,
      ...(projectChildUrl && { path: projectChildUrl }),
    });
  }

  private buildNavigationFromProject(
    project: ProjectReflection | DeclarationReflection,
  ) {
    const entryModule = this.options.getValue('entryModule');

    if (
      !this.navigationOptions.excludeCategories &&
      project.categories?.length
    ) {
      this.navigation.push(
        ...project.categories.map((category) => {
          const categoryUrl = (category as unknown as DeclarationReflection)
            .url;
          return {
            title: category.title,
            ...(categoryUrl && { path: categoryUrl }),
            children: this.getCategoryGroupChildren(category),
          };
        }),
      );
    } else {
      if (project.groups?.length) {
        const isOnlyModules = project.children?.every(
          (child) => child.kind === ReflectionKind.Module,
        );
        if (isOnlyModules) {
          project.groups?.forEach((projectGroup) => {
            const children = this.getGroupChildren(projectGroup);
            if (
              projectGroup.title ===
              this.theme.application.internationalization.proxy.kind_plural_module()
            ) {
              if (children?.length) {
                this.navigation.push(
                  ...children.filter((child) => child.title !== entryModule),
                );
              }
            } else {
              if (this.navigationOptions.excludeGroups) {
                if (children?.length) {
                  this.navigation.push(
                    ...children.filter((child) => child.title !== entryModule),
                  );
                }
              } else {
                if (
                  projectGroup.owningReflection.kind === ReflectionKind.Document
                ) {
                  this.navigation.push({
                    title: projectGroup.title,
                    children: projectGroup.children.map((child) => {
                      return {
                        title: child.name,
                        kind: child.kind,
                        path: child.url,
                        isDeprecated: child.isDeprecated(),
                      };
                    }),
                  });
                } else {
                  this.navigation.push({
                    title: projectGroup.title,
                    children: children?.filter(
                      (child) => child.title !== entryModule,
                    ),
                  });
                }
              }
            }
          });
        } else {
          project.groups?.forEach((projectGroup) => {
            const children = this.getGroupChildren(projectGroup);
            const indexModule = projectGroup.children.find(
              (child) => child.name === entryModule,
            );
            if (children?.length) {
              this.navigation.push({
                title: projectGroup.title,
                children: children.filter(
                  (child) => child.title !== entryModule,
                ),
              });
            }
            if (indexModule) {
              const children =
                indexModule instanceof DeclarationReflection
                  ? this.getReflectionGroups(indexModule)
                  : [];
              if (children) {
                this.navigation.push(...children);
              }
            }
          });
        }
      }
    }
  }

  private getCategoryGroupChildren(group: ReflectionCategory) {
    return group.children
      ?.filter((child) => child.hasOwnDocument)
      .map((child) => {
        const children =
          child instanceof DeclarationReflection
            ? this.getReflectionGroups(child)
            : [];
        return {
          title: child.name,
          kind: child.kind,
          path: child.url,
          ...(children && { children }),
        };
      });
  }

  private getGroupChildren(
    group: ReflectionGroup,
    outputFileStrategy?: OutputFileStrategy,
  ) {
    if (
      !this.navigationOptions.excludeCategories &&
      group?.categories?.length
    ) {
      return group.categories?.map((category) => {
        return {
          title: category.title,
          children: this.getCategoryGroupChildren(category),
        };
      });
    }

    return group.children
      ?.filter((child) => child.hasOwnDocument)
      .reduce((acc: NavigationItem[], child) => {
        const mapping = this.theme.getTemplateMapping(
          child,
          outputFileStrategy,
        );
        if (mapping) {
          const children =
            child instanceof DeclarationReflection &&
            !this.navigationOptions.excludeCategories &&
            child.categories?.length
              ? child.categories
                  ?.map((category) => {
                    const categoryUrl = (
                      category as unknown as DeclarationReflection
                    ).url;
                    const catChildren = this.getCategoryGroupChildren(category);
                    return categoryUrl || catChildren.length
                      ? {
                          title: category.title,
                          path: categoryUrl,
                          children: catChildren,
                        }
                      : null;
                  })
                  .filter((cat) => Boolean(cat))
              : this.getReflectionGroups(child, outputFileStrategy);
          return this.processChildren(acc, child, children as NavigationItem[]);
        }
      }, []);
  }

  private getReflectionGroups(
    reflection: DeclarationReflection | DocumentReflection,
    outputFileStrategy?: OutputFileStrategy,
  ): NavigationItem[] | null {
    if (reflection instanceof DeclarationReflection) {
      if (this.navigationOptions.excludeGroups) {
        return reflection.childrenIncludingDocuments
          ?.filter((child) => child.hasOwnDocument)
          .reduce((acc, child) => {
            const children = this.getReflectionGroups(
              child,
              outputFileStrategy,
            );
            return this.processChildren(acc, child, children);
          }, []) as NavigationItem[];
      }

      const groupsWithoutDocs = reflection.groups?.filter(
        (group) =>
          group.title !== ReflectionKind.pluralString(ReflectionKind.Document),
      );

      const isModulesGroup =
        groupsWithoutDocs?.length &&
        groupsWithoutDocs[0].children.every(
          (child) => child.kind === ReflectionKind.Module,
        );

      if (isModulesGroup) {
        return (
          this.getGroupChildren(groupsWithoutDocs[0], outputFileStrategy) ||
          null
        );
      }

      return reflection.groups
        ?.map((group) => {
          const groupChildren = this.getGroupChildren(
            group,
            outputFileStrategy,
          );
          if (groupChildren?.length) {
            if (group.owningReflection.kind === ReflectionKind.Document) {
              return groupChildren[0];
            }
            return {
              title: group.title,
              children: groupChildren,
            };
          }
          return null;
        })
        .filter((group) => Boolean(group)) as NavigationItem[];
    }
    return null;
  }

  private processChildren(
    acc: NavigationItem[],
    child: DeclarationReflection | DocumentReflection,
    children: NavigationItem[] | null,
  ) {
    if (!isQuoted(child.name) && !this.navigationOptions.excludeFolders) {
      const titleParts = child.name.split('/');
      if (!child.name.startsWith('@') && titleParts.length > 1) {
        let currentLevel = acc;
        let currentItem: NavigationItem;
        for (let i = 0; i < titleParts.length - 1; i++) {
          currentItem = currentLevel?.find(
            (item: NavigationItem) => item.title === titleParts[i],
          ) as NavigationItem;
          if (!currentItem) {
            currentItem = {
              title: titleParts[i],
              children: [],
            };
            currentLevel.push(currentItem);
          }
          if (currentItem) {
            currentLevel = currentItem.children || [];
          }
        }

        currentLevel.push({
          title: titleParts[titleParts.length - 1],
          kind: child.kind,
          path: child.url,
          isDeprecated: child.isDeprecated(),
          ...(children && { children }),
        });

        return acc;
      }
    }

    acc.push({
      title: child.name,
      kind: child.kind,
      path: child.url,
      isDeprecated: child.isDeprecated(),
      ...(children && { children }),
    });

    return acc;
  }
}
