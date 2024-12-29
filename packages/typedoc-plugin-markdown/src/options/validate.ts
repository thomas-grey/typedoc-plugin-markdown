import { Application, Converter } from 'typedoc';
import { OutputFileStrategy } from './maps.js';

/**
 * Contains global validation logic not supported by individual option validation.
 */
export function globallyValidateOptions(app: Application) {
  app.converter.on(Converter.EVENT_BEGIN, () => {
    try {
      if (
        app.options.getValue('outputFileStrategy') ===
          OutputFileStrategy.Categories &&
        app.options.getValue('categorizeByGroup')
      ) {
        throw new Error(
          'categorizeByGroup is not supported when outputFileStrategy=categories.',
        );
      }
    } catch (e) {
      app.logger.error(`[typedoc-plugin-markdown] ${e}`);
    }
  });
}
