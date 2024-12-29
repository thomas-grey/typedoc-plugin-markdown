import {
  MarkdownPageEvent,
  MarkdownRendererEvent,
} from '@plugin/events/index.js';
import { MarkdownTheme } from '@plugin/public-api.js';
import * as fs from 'fs';
import * as path from 'path';
import {
  normalizePath,
  ProjectReflection,
  Reflection,
  ReflectionCategory,
  Renderer,
} from 'typedoc';

/**
 * The render method for the Markdown plugin
 *
 * This is essentially a copy the default theme render method with some adjustments.
 *
 * - Removes unnecessary async calls to load highlighters only required for html theme.
 * - Removes hooks logic that are jsx specific.
 * - Adds any logic specific to markdown rendering.
 */
export async function render(
  renderer: Renderer,
  project: ProjectReflection,
  outputDirectory: string,
) {
  renderer.renderStartTime = Date.now();

  // Clean or create output directory
  if (!(await prepareOutputDirectory(renderer, outputDirectory))) {
    return;
  }

  // Prepare theme
  renderer.theme = initializeTheme(renderer);

  // Prepare output
  const output = new MarkdownRendererEvent(
    MarkdownRendererEvent.BEGIN,
    outputDirectory,
    project,
  );
  output.urls = (renderer.theme as MarkdownTheme).getUrls(project);
  output.navigation = (renderer.theme as MarkdownTheme).getNavigation(project);

  renderer.trigger(MarkdownRendererEvent.BEGIN, output);

  await executeJobs(renderer.preRenderAsyncJobs, output);

  await renderPages(renderer, output);

  copyMediaFiles(project, outputDirectory);

  await executeJobs(renderer.postRenderAsyncJobs, output);

  renderer.trigger(MarkdownRendererEvent.END, output);

  renderer.theme = void 0;
}

// Helper to prepare output directory
async function prepareOutputDirectory(
  renderer: Renderer,
  outputDirectory: string,
): Promise<boolean> {
  if (renderer.application.options.getValue('cleanOutputDir')) {
    try {
      fs.rmSync(outputDirectory, { recursive: true, force: true });
    } catch {
      renderer.application.logger.warn('Could not empty the output directory.');
      return false;
    }
  }

  try {
    fs.mkdirSync(outputDirectory, { recursive: true });
  } catch {
    renderer.application.logger.error(
      `Could not create output directory ${outputDirectory}.`,
    );
    return false;
  }

  if (
    renderer.application.options.isSet('githubPages') &&
    renderer.application.options.getValue('githubPages')
  ) {
    try {
      writeFileSync(path.join(outputDirectory, '.nojekyll'), '');
    } catch {
      renderer.application.logger.warn(
        `Could not write .nojekyll file in ${outputDirectory}.`,
      );
    }
  }
  return true;
}

// Helper to initialize theme
function initializeTheme(renderer: Renderer): MarkdownTheme {
  const themeOption = renderer.application.options.getValue('theme');
  const themes = (renderer as any).themes;
  const ThemeConstructor = themes.get(
    themeOption === 'default' ? 'markdown' : themeOption,
  );
  const themeInstance = new ThemeConstructor(renderer);
  if (themeInstance instanceof MarkdownTheme) {
    return themeInstance;
  }
  renderer.application.logger.warn(
    `[typedoc-plugin-markdown]: Skipping theme "${themeOption}" as it is not an instance of the Markdown theme.`,
  );
  return new (themes.get('markdown'))(renderer);
}

// Helper to render all pages
async function renderPages(renderer: Renderer, output: MarkdownRendererEvent) {
  const formatWithPrettier =
    renderer.application.options.getValue('formatWithPrettier');

  renderer.application.logger.verbose(
    `There are ${output.urls?.length} pages to write.`,
  );

  const pages =
    output.urls?.filter(
      (urlMapping) =>
        urlMapping.model instanceof ReflectionCategory ||
        urlMapping.model instanceof Reflection,
    ) || [];
  for (const urlMapping of pages) {
    const [template, page] = output.createPageEvent(urlMapping);
    page.contents = '';

    renderer.trigger(MarkdownPageEvent.BEGIN, page);

    if (
      page.model instanceof ReflectionCategory ||
      page.model instanceof Reflection
    ) {
      const markdownFromTheme = renderer.theme!.render(page, template);

      if (formatWithPrettier) {
        page.contents =
          page.contents +
          (await formatWithPrettierIfAvailable(renderer, markdownFromTheme));
      } else {
        page.contents = page.contents + markdownFromTheme;
      }

      renderer.trigger(MarkdownPageEvent.END, page);

      try {
        writeFileSync(page.filename, page.contents || '');
      } catch {
        renderer.application.logger.error(
          renderer.application.i18n.could_not_write_0(page.filename),
        );
      }
    } else {
      throw new Error('Unreachable code encountered.');
    }
  }
}

async function formatWithPrettierIfAvailable(renderer: Renderer, code: string) {
  const prettier = await getPrettier();
  if (!prettier) {
    renderer.application.logger.warn(
      '[typedoc-plugin-markdown] Prettier formatting skipped as Prettier must be installed for the `formatWithPrettier` option to work. Please npm i prettier --save-dev.',
    );
    return code;
  }

  // Check Prettier version
  const version = prettier.version;

  // Ensure compatibility with a specific version (if needed)
  const [major] = version.split('.');
  if (Number(major) < 3) {
    renderer.application.logger.warn(
      '[typedoc-plugin-markdown] Prettier formatting skipped as Prettier must be above version 3 for the `formatWithPrettier` option to work.',
    );
    return code;
  }

  const prettierConfigPath =
    renderer.application.options.getValue('prettierConfigFile') ||
    process.cwd();

  // Resolve Prettier configuration
  const config = await prettier.resolveConfig(prettierConfigPath);

  // Format code using Prettier
  const formattedCode = prettier.format(code, {
    ...config,
    parser: 'markdown',
  });

  renderer.application.logger.verbose(
    '[typedoc-plugin-markdown] Markdown formatted with Prettier.',
  );

  return formattedCode;
}

async function getPrettier() {
  try {
    //@ts-error - prettier is optional and doesn't have to be installed
    return await import('prettier');
  } catch {
    return null;
  }
}

// Helper to copy media files
function copyMediaFiles(project: ProjectReflection, outputDirectory: string) {
  const media = path.join(outputDirectory, '_media');
  const toCopy = project.files.getNameToAbsoluteMap();
  for (const [fileName, absolute] of toCopy.entries()) {
    copySync(absolute, path.join(media, fileName));
  }
}

// Helper to execute async jobs
async function executeJobs(
  jobs: Array<(output: MarkdownRendererEvent) => Promise<void>>,
  output: MarkdownRendererEvent,
) {
  await Promise.all(jobs.map((job) => job(output)));
  jobs = []; // Clear job queue
}

/**
 *  Writes a file to disc.
 */
function writeFileSync(fileName: string, data: string) {
  fs.mkdirSync(path.dirname(normalizePath(fileName)), { recursive: true });
  fs.writeFileSync(normalizePath(fileName), data);
}

/**
 * Recursively copy files
 */
function copySync(src: string, dest: string): void {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    const contained = fs.readdirSync(src);
    contained.forEach((file) =>
      copySync(path.join(src, file), path.join(dest, file)),
    );
  } else if (stat.isFile()) {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}
