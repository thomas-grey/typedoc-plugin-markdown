import { getDirectoryName } from './get-directory-name';

describe('getDirectoryName', () => {
  it('should replace spaces with hyphens and convert to lowercase', () => {
    const input = 'My Directory Name';
    const expectedOutput = 'my-directory-name';
    expect(getDirectoryName(input)).toBe(expectedOutput);
  });

  it('should replace underscores with hyphens and convert to lowercase', () => {
    const input = 'My_Directory_Name';
    const expectedOutput = 'my-directory-name';
    expect(getDirectoryName(input)).toBe(expectedOutput);
  });

  it('should replace multiple spaces and underscores with a single hyphen and convert to lowercase', () => {
    const input = 'My  Directory__Name';
    const expectedOutput = 'my-directory-name';
    expect(getDirectoryName(input)).toBe(expectedOutput);
  });

  it('should handle empty strings', () => {
    const input = '';
    const expectedOutput = '';
    expect(getDirectoryName(input)).toBe(expectedOutput);
  });

  it('should handle strings with no spaces or underscores', () => {
    const input = 'MyDirectoryName';
    const expectedOutput = 'mydirectoryname';
    expect(getDirectoryName(input)).toBe(expectedOutput);
  });
});
