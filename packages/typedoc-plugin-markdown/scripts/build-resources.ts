import * as fs from 'fs';
import * as path from 'path';
import { Project } from 'ts-morph';

const typedocSymbols = [
  'ArrayType',
  'ConditionalType',
  'ContainerReflection',
  'Comment',
  'CommentDisplayPart',
  'DeclarationHierarchy',
  'DeclarationReflection',
  'InferredType',
  'IntersectionType',
  'IntrinsicType',
  'IndexedAccessType',
  'LiteralType',
  'PageEvent',
  'ParameterReflection',
  'ProjectReflection',
  'QueryType',
  'ReferenceReflection',
  'ReferenceType',
  'ReflectionType',
  'SignatureReflection',
  'SomeType',
  'TupleType',
  'TypeOperatorType',
  'TypeParameterReflection',
  'UnionType',
  'UnknownType',
];

const pluginSymbols = ['Collapse'];

const project = new Project({
  tsConfigFilePath: 'tsconfig.json',
});

const themePath = path.join(__dirname, '..', 'src');

const templateFiles = getFiles('templates');
const templateSymbols = getSymbols(templateFiles, 'templates');

const partialsFiles = getFiles('partials');
const partialsSymbols = getSymbols(partialsFiles, 'partials');

const out = [
  `// THIS FILE IS AUTOGENERATED - DO NOT EDIT DIRECTLY
import { \n ${typedocSymbols.join(',\n ')} } from 'typedoc';
import { MarkdownThemeRenderContext } from './theme-context';
import { ${pluginSymbols.join(',\n')} } from './models';`,
];

templateFiles.forEach((file, index) => {
  out.push(
    `import { ${templateSymbols[index].symbolName} } from './templates/${file}';`,
  );
});

partialsFiles.forEach((file, index) => {
  out.push(
    `import { ${partialsSymbols[index].symbolName} } from './partials/${file}';`,
  );
});

out.push(`
function bind<F, L extends any[], R>(fn: (f: F, ...a: L) => R, first: F) {
  return (...r: L) => fn(first, ...r);
}`);

out.push(`export type Templates = {`);
templateSymbols.forEach((symbol) => {
  out.push(writeSymbol(symbol));
});
out.push(`};\n`);

out.push(`export type Partials = {`);
partialsSymbols.forEach((symbol) => {
  out.push(writeSymbol(symbol));
});
out.push(`};`);

out.push(
  `
export const templates = (context: MarkdownThemeRenderContext): Templates => ({`,
);
templateSymbols.forEach((symbol) => {
  out.push(`  ${symbol.symbolName}: bind(${symbol.symbolName}, context),`);
});
out.push(`});`);

out.push(
  `
export const partials = (context: MarkdownThemeRenderContext): Partials => ({`,
);
partialsSymbols.forEach((symbol) => {
  out.push(`  ${symbol.symbolName}: bind(${symbol.symbolName}, context),`);
});
out.push(`});`);

fs.writeFileSync(path.join(themePath, 'resources.ts'), out.join('\n') + '\n');

function getFiles(type: string) {
  const partialsFolder = path.join(themePath, type);
  return fs
    .readdirSync(partialsFolder)
    .map((partialsFile) => path.parse(partialsFile).name);
}

function getSymbols(files: string[], type: string) {
  return files.map((file) => {
    const tsFile = project.getSourceFile(
      path.join(themePath, type, file + '.ts'),
    );

    const symbolName = tsFile?.getExportSymbols()[0]?.getEscapedName();
    const fn = tsFile?.getFunction(symbolName as string);

    const params = fn
      ?.getParameters()
      .filter((parameter) => parameter.getName() !== 'context')
      .map((parameter) => {
        const typeunions = parameter
          .getType()
          .getText()
          .split('|')
          .map((unions) => {
            const union = unions.split('.');
            if (union[1] && union[1].startsWith('PageEvent')) {
              return `PageEvent<${union[union.length - 1]}`;
            }
            return union[union.length - 1];
          });
        const name = parameter.getName();
        const isOptional = parameter.isOptional();
        return { name, type: typeunions.join('| '), isOptional };
      });
    return { symbolName, params };
  });
}

function writeSymbol(symbol: any) {
  return `  ${symbol.symbolName}: (${symbol.params
    ?.map(
      (param) => `${param.name}${param.isOptional ? '?' : ''}: ${param.type}`,
    )
    .join(', ')}) => string;`;
}