import { en, jp, ko, zh } from '@plugin/internationalization/index.js';
import { Application, Converter } from 'typedoc';

/**
 * Returns subset of translatable strings for the plugin.
 *
 * These will then be merged with the main set of TypeDoc string.
 *
 * @category Functions
 */
export function setupInternationalization(app: Application): void {
  app.converter.on(Converter.EVENT_BEGIN, () => {
    app.internationalization.addTranslations(
      app.options.getValue('lang'),
      { ...getTranslatable(app) },
      true,
    );
  });
}

/**

 */
function getTranslatable(app: Application) {
  const LOCALES = {
    en,
    jp,
    ko,
    zh,
  };
  return {
    ...LOCALES['en'],
    ...(app.lang !== 'en' && Object.keys(LOCALES).includes(app.lang)
      ? { ...LOCALES[app.lang] }
      : {}),
    ...app.options.getValue('locales')[app.lang],
  };
}
