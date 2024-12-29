// @ts-check

import * as fs from 'fs';

/**
 * @param {import('typedoc-plugin-markdown').MarkdownApplication} app
 */
export function load(app) {
  app.renderer.postRenderAsyncJobs.push(async (output) => {
    fs.writeFileSync(
      `${output.outputDirectory}/navigation.json`,
      JSON.stringify(output.navigation, null, 2),
    );
  });
}
