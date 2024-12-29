import * as fs from 'fs';
import * as path from 'path';

export function expectFileToEqual(
  key: string,
  outputFileStrategy:
    | 'modules'
    | 'members'
    | 'categories'
    | ('modules' | 'members')[],
  file: string | string[],
  limit?: number,
  range?: Array<number>,
) {
  const outputFileStrategies = Array.isArray(outputFileStrategy)
    ? outputFileStrategy
    : [outputFileStrategy];
  outputFileStrategies.forEach((outputFileStrategy) => {
    const basePath = getBasePath(key, outputFileStrategy);

    const optionDirs = fs.readdirSync(basePath);
    optionDirs.forEach((optionDir, index) => {
      const isArray = Array.isArray(file);
      if (index < file.length) {
        if (!limit || limit > index) {
          const fullPath = path.join(
            basePath,
            optionDir,
            isArray ? file[index] : file,
          );
          let actual = fs.readFileSync(fullPath).toString();
          if (range) {
            actual = actual.split('\n').slice(range[0], range[1]).join('\n');
          }
          expect(actual).toMatchSnapshot(
            `(Output File Strategy "${outputFileStrategy}") (Option Group "${
              index + 1
            }")`,
          );
        }
      }
    });
  });
}

export function expectUrlsToEqual(
  outDir: string,
  outputFileStrategies: ('members' | 'modules' | 'categories')[],
) {
  outputFileStrategies.forEach((outputFileStrategy) => {
    const basePath = getBasePath(outDir, outputFileStrategy);
    const optionDirs = fs.readdirSync(basePath);
    optionDirs.forEach((optionDir) => {
      const optionsBasePath = path.join(basePath, optionDir);
      const rootDirectory = fs.readdirSync(path.join(basePath, optionDir));
      const reduceDirectory = (
        basePath: string,
        baseDirectory: string,
        directory: string[],
      ) => {
        return directory.reduce((prev: any, item) => {
          if (fs.lstatSync(`${basePath}/${item}`).isDirectory()) {
            const nestedDir = fs.readdirSync(`${basePath}/${item}`);
            return [
              ...prev,
              ...reduceDirectory(
                `${basePath}/${item}`,
                `${baseDirectory}/${item}`,
                nestedDir,
              ),
            ];
          }
          if (path.extname(item) === '.json') {
            return prev;
          }
          return [...prev, `${baseDirectory}/${item}`.replace(/^\/+/, '')];
        }, []);
      };
      const urls = reduceDirectory(optionsBasePath, '', rootDirectory);
      expect(urls).toMatchSnapshot(`outputFileStrategy: ${outputFileStrategy}`);
    });
  });
}

function getBasePath(
  key: string,
  outputFileStrategy: 'modules' | 'members' | 'categories',
) {
  const basePath = path.join(
    process.cwd(),
    'test',
    'fixtures',
    'out',
    key,
    outputFileStrategy,
  );
  return basePath;
}
