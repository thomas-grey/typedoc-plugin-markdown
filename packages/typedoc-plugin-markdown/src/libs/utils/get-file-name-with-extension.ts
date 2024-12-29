import * as path from 'path';

/**
 * Returns a filename with extension while normalizing both the input name and input extension.
 */
export function getFileNameWithExtension(
  fileName: string,
  fileExtension: string,
) {
  const parsedPath = path.parse(fileName);
  return path.join(
    parsedPath.dir,
    `${parsedPath.name.replace(/ /g, '-')}${fileExtension}`,
  );
}
