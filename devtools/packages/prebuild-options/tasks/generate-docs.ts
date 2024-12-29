/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-empty */
import { DocsConfig } from '@devtools/helpers';
import * as fs from 'fs';
import * as path from 'path';
import { dirname } from 'path';
import * as prettier from 'prettier';
import { Project, VariableStatement } from 'ts-morph';
import { ParameterType } from 'typedoc';
import { fileURLToPath } from 'url';

export const __filename = fileURLToPath(import.meta.url);
export const __dirname = dirname(__filename);

export async function generateOptionsDocs(docsConfig: DocsConfig) {
  const project = new Project({
    tsConfigFilePath: 'tsconfig.json',
  });

  const outputPage: string[] = [`import { Callout } from 'nextra/components';`];

  outputPage.push('# Options');
  if (docsConfig.docsPath === '/docs') {
    outputPage.push(
      `<Callout type="info">These options should be used in conjunction with the core TypeDoc options (see [TypeDoc Usage](/docs/typedoc-usage)).</Callout>`,
    );
  } else {
    if (docsConfig.presets) {
      outputPage.push(
        `<Callout type="info">Please view options exposed by [typedoc-plugin-markdown](/docs/options) in addition to those listed here.</Callout>`,
      );
    }
  }

  if (docsConfig.presets) {
    outputPage.push('## Preset Options');
    outputPage.push(
      'The following are preset typedoc-plugin-markdown options:',
    );
    const { presets }: any = await import(docsConfig.presetsPath as string);
    const config = presets;
    delete config.plugin;
    const presetsJson = JSON.stringify(config, null, 2);

    outputPage.push(`\`\`\`json"
${presetsJson}
\`\`\``);
    outputPage.push('## Plugin Options');
    outputPage.push('The following options are exposed by this plugin:');
  }

  if (docsConfig.declarations) {
    const declarationsConfig: any = await import(
      docsConfig.declarationsPath as string
    );
    const configFileTs = project.getSourceFile(
      docsConfig.declarationsPath as string,
    );

    const optionsVariableStatements =
      configFileTs?.getVariableStatements() as VariableStatement[];

    const parsedConfig = optionsVariableStatements
      .map((variableStatement) => {
        const name = (
          variableStatement.compilerNode.declarationList.declarations[0]
            .name as any
        ).escapedText;
        const option = declarationsConfig[name];
        const docs = variableStatement.getJsDocs().map((doc) => {
          return {
            comments: (doc.getComment() as string)
              ?.replace(/\\\//g, '/')
              .replace(/\\@/g, '@'),
            tags: doc
              .getTags()
              .filter(
                (tag) =>
                  tag.getTagName() !== 'deprecated' &&
                  tag.getTagName() !== 'category' &&
                  tag.getTagName() !== 'omitExample' &&
                  tag.getTagName() !== 'defaultValue' &&
                  tag.getTagName() !== 'example',
              )
              .map((tag) => ({
                name: tag.getTagName(),
                comments: tag.getComment(),
              })),
            hidden: Boolean(
              doc.getTags().find((tag) => tag.getTagName() === 'hidden'),
            ),
            omitExample: Boolean(
              doc.getTags().find((tag) => tag.getTagName() === 'omitExample'),
            ),
            example: doc
              .getTags()
              .find((tag) => tag.getTagName() === 'example')
              ?.getComment(),
            deprecated: doc
              .getTags()
              .find((tag) => tag.getTagName() === 'deprecated')
              ?.getComment(),
            default: doc
              .getTags()
              .find((tag) => tag.getTagName() === 'defaultValue')
              ?.getComment(),
            category:
              doc
                .getTags()
                .find((tag) => tag.getTagName() === 'category')
                ?.getComment() || 'other',
          };
        })[0];
        return {
          name,
          ...option,
          ...(docs ? docs : { category: 'other' }),
        };
      })
      .filter((option) => !option.hidden);

    const groupedConfig: Record<string, any> = groupBy(
      parsedConfig,
      'category',
    );

    const compiledText = configFileTs?.compilerNode.text;

    const categoryDescriptions = extractCategories(compiledText);

    const categories = Object.entries(groupedConfig);

    categories.forEach(async ([categoryName, options]) => {
      const out: string[] = [
        categories.length > 1
          ? `import { Callout, FileTree } from 'nextra/components';`
          : '',
      ];
      const optionLevel =
        categories.length === 1 && !docsConfig.presets ? '##' : '##';
      if (categories.length > 1) {
        out.push(`# ${getDocsTitle(categoryName)}`);
        if (Object.keys(categoryDescriptions)?.length) {
          out.push(categoryDescriptions[categoryName]);
        }
        out.push();
        outputPage.push(`## ${getDocsTitle(categoryName)}`);

        if (Object.keys(categoryDescriptions)?.length) {
          outputPage.push(categoryDescriptions[categoryName]);
        }
      }
      const optionsTable: string[] = [];
      optionsTable.push('| Option | Description |');
      optionsTable.push('|--------|------------|');

      options.forEach((option) => {
        optionsTable.push(
          `| [\`${option.name}\`](./options/${categoryName.toLowerCase()}-options.mdx#--${option.name.toLowerCase()}) | ${
            option.help
          } |`,
        );
        out.push(
          `${optionLevel} ${
            option.deprecated ? `~${option.name}~` : `${option.name}`
          }`,
        );
        if (option.deprecated) {
          out.push(
            `<Callout type="warning">Deprecated: ${option.deprecated}</Callout>`,
          );
        } else {
          out.push(`<Callout emoji="${getEmoji()}">${option.help}</Callout>`);
        }

        const meta: string[] = [];
        const type = getType(option);
        if (type) {
          meta.push(type);
        }
        if (
          option.type !== ParameterType.Flags &&
          option.type !== ParameterType.Array &&
          option.type !== ParameterType.Mixed &&
          option.type !== ParameterType.Object
        ) {
          meta.push(`Defaults to \`${getDefaultValue(option)}\`.`);
        }
        out.push(`> ${meta.join(' ')}`);

        if (option.comments?.length) {
          out.push(option.comments);
          option.tags?.forEach((tag) => {
            out.push(`**${tag.name}**`);
            out.push(tag.comments);
          });
        }

        if (!option.omitExample) {
          if (
            !option.example &&
            option.type === ParameterType.Mixed &&
            Object.keys(option.defaultValue).length &&
            (!Array.isArray(option.defaultValue) || option.defaultValue?.length)
          ) {
            //out.push('Below is the full list of keys and default values:');
          }
        }

        let exampleJson = {};

        try {
          exampleJson = JSON.parse(`{
            "${option.name}": ${getExampleValue(option)}
          }`);
        } catch (e) {}
        if (!option.omitExample) {
          out.push(`
\`\`\`json filename="typedoc.json"
${JSON.stringify(exampleJson, null, 2)}
\`\`\``);
        }
      });
      if (categories.length > 1) {
        outputPage.push(optionsTable.join('\n'));
        const catDocPath = path.join(
          getPagesPath(docsConfig.optionsPath),
          'options',
          `${categoryName.toLowerCase()}-options.mdx`,
        );
        const formattedOut = await prettier.format(out.join('\n\n'), {
          parser: 'mdx',
        });
        fs.writeFileSync(catDocPath, formattedOut);
      } else {
        outputPage.push(out.join('\n\n'));
      }
    });
    if (categories.length > 1) {
      const metaJs = await prettier.format(
        `export default ${JSON.stringify(
          categories.reduce((prev, curr) => {
            return {
              ...prev,
              [`${curr[0].toLowerCase()}-options`]: '',
            };
          }, {}),
        )}`,
        {
          parser: 'typescript',
        },
      );

      const metaJsPath = path.join(
        getPagesPath(docsConfig.optionsPath),
        'options',
        '_meta.js',
      );

      fs.writeFileSync(metaJsPath, metaJs);
    }

    const optionDocPath = path.join(
      getPagesPath(docsConfig.optionsPath),
      'options.mdx',
    );

    const formattedOut = await prettier.format(outputPage.join('\n\n'), {
      parser: 'mdx',
    });

    fs.writeFileSync(optionDocPath, formattedOut);
  }
}

function getEmoji() {
  return '💡';
}

function getType(option: any) {
  if (option.type === ParameterType.Array && option.defaultValue?.length) {
    return `Accepts an array of the following values ${option.defaultValue
      .toString()
      .split(',')
      .map((item) => `\`"${item}"\``)
      .join(' ')}.`;
  }

  if (option.type === ParameterType.Array) {
    return 'Accepts an array of string values.';
  }

  if (option.type === ParameterType.String) {
    return 'Accepts a string value.';
  }

  if (option.type === ParameterType.Boolean) {
    return 'Accepts a boolean value.';
  }

  if (option.type === ParameterType.Array) {
    return 'Accepts an Array.';
  }

  if (
    [ParameterType.Mixed, ParameterType.Object].includes(option.type) &&
    option.defaultValue
  ) {
    return Array.isArray(option.defaultValue)
      ? 'Accepts an Array.'
      : 'Accepts a key/value object.';
  }

  if (option.type === ParameterType.Map && option.map) {
    const values = Object.values(option.map);
    return `Accepts ${values.length === 2 ? 'either' : 'one of'} ${values
      .map((value) => `\`"${value}"\``)
      .join(` ${values.length === 2 ? 'or' : '|'} `)}.`;
  }
  return null;
}

function getDefaultValue(option) {
  if (option.default) {
    return option.default;
  }

  if (option.type === ParameterType.Boolean) {
    return option.defaultValue;
  }

  if (option.type === ParameterType.Flags) {
    return JSON.stringify(option.defaults);
  }

  if (option.type === ParameterType.Array) {
    return '';
  }

  if (option.type === ParameterType.Mixed) {
    return JSON.stringify(option.defaultValue);
  }

  if (option.type === ParameterType.Object) {
    return JSON.stringify(option.defaultValue);
  }

  return `"${option.defaultValue}"`;
}

function getExampleValue(option) {
  if (option.example) {
    return option.example;
  }
  return getDefaultValue(option);
}

function getPagesPath(docsPath: string) {
  const pagesPath = path.join(
    __dirname,
    '..',
    '..',
    '..',
    '..',
    'docs',
    'pages',
  );
  return path.join(pagesPath, docsPath);
}

function getDocsTitle(categoryName: string) {
  return categoryName === 'other'
    ? `Plugin Options`
    : `${categoryName} Options`;
}

function groupBy(array: any[], key: string) {
  return array.reduce(
    (r, v, i, a, k = v[key]) => ((r[k] || (r[k] = [])).push(v), r),
    {},
  );
}

function extractCategories(input) {
  const regex =
    /@categoryDescription\s+(\w+)\s*\n\s*\*\s*([\w\s\S]*?)(?=\n\s*\*)/g;
  let match;
  const categories = {};

  while ((match = regex.exec(input)) !== null) {
    let description = match[2].trim();
    description = description.replace(/^\*/g, '').trim();
    categories[match[1]] = description;
  }

  return categories;
}
