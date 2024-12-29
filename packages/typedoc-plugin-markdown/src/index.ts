/**
 * The plugin entrypoint and bootstrapping of the plugin.
 *
 * @module
 */
import { getTranslatable } from '@plugin/internationalization/translatable.js';
import {
  declarations,
  globallyValidateOptions,
} from '@plugin/options/index.js';
import { resolvePackages } from '@plugin/renderer/packages.js';
import { render } from '@plugin/renderer/render.js';
import { MarkdownTheme } from '@plugin/theme/index.js';
import { MarkdownRendererHooks } from '@plugin/types/index.js';
import {
  Application,
  Context,
  Converter,
  DeclarationOption,
  EventHooks,
  ParameterHint,
  ParameterType,
} from 'typedoc';
/**
 * The function that is called by TypeDoc to bootstrap the plugin.
 *
 * Here we expose additional TypeDoc options and make some adjustments.
 *
 * This method is not intended to be consumed in any other context that via the `plugin` option.
 */
export function load(app: Application) {
  /**
   * ====================
   * 1. Bootstrap Options
   * ====================
   */

  //  Iterate over declaration definitions and to the container.
  Object.entries(declarations).forEach(([name, declaration]) => {
    app.options.addDeclaration({
      name,
      ...declaration,
    } as DeclarationOption);
  });

  // Validate options globally before conversion.
  globallyValidateOptions(app);

  /**
   * =============================
   * 2. Configure markdown outputs
   * =============================
   */

  app.options.addDeclaration({
    name: 'markdown',
    outputShortcut: 'markdown',
    help: (i18n) => i18n.help_out(),
    type: ParameterType.Path,
    hint: ParameterHint.Directory,
    defaultValue: './docs',
  });

  app.outputs.addOutput('markdown', async (out, project) => {
    await render(app.renderer, project, out);
  });

  app.outputs.setDefaultOutputName('markdown');

  Object.defineProperty(app.renderer, 'markdownHooks', {
    value: new EventHooks<MarkdownRendererHooks, string>(),
  });

  app.renderer.defineTheme('markdown', MarkdownTheme);

  /**
   * =========================
   * 3. Configure localization
   * =========================
   */

  // Load the additional translations used by the theme for the selected language.
  app.converter.on(Converter.EVENT_BEGIN, () => {
    app.internationalization.addTranslations(
      app.options.getValue('lang'),
      { ...getTranslatable(app) },
      true,
    );
  });

  /**
   * ============================
   * 4. Apply any other behaviour
   * ============================
   */

  /**
   * Currently options set for packages are only stored on the converter and are destroyed before being passed to the {@link Renderer}.
   *
   * By intercepting the package options set in the converter and storing them on the renderer we can use them later in the theme.
   *
   */
  app.converter.on(Converter.EVENT_RESOLVE_END, (context: Context) => {
    if (app.options.packageDir) {
      resolvePackages(app, context, app.options.packageDir);
    }
  });
}

/**
 * Export anything that is available publicly
 */
export * from 'public-api.js';
