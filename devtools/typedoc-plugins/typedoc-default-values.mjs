import { Comment, CommentTag, Converter, TypeScript } from 'typedoc';

export function load(app) {
  const printer = TypeScript.createPrinter({
    removeComments: false,
    omitTrailingSemicolon: true,
  });

  app.converter.on(
    Converter.EVENT_CREATE_DECLARATION,
    (_context, reflection) => {
      const hasTypeDeclaration = Boolean(reflection.type?.declaration);

      const node =
        reflection.project.getSymbolFromReflection(reflection)
          ?.declarations?.[0];

      if (!node || !node.initializer) return;

      if (
        (node.initializer.kind ===
          TypeScript.SyntaxKind.ObjectLiteralExpression &&
          !hasTypeDeclaration) ||
        node.initializer.kind === TypeScript.SyntaxKind.ArrayLiteralExpression
      ) {
        const defaultValue = printer.printNode(
          TypeScript.EmitHint.Expression,
          node.initializer,
          node.getSourceFile(),
        );

        reflection.defaultValue = '';

        if (reflection.comment) {
          reflection.comment.blockTags = [
            ...(reflection.comment.blockTags || []),
            getTag(defaultValue),
          ];
        } else {
          reflection.comment = new Comment([], [getTag(defaultValue)]);
        }
      }
    },
  );
}
function getTag(value) {
  return new CommentTag('@initializer', [
    {
      kind: 'code',
      text: makeCodeBlock(value),
    },
  ]);
}

function makeCodeBlock(text) {
  return '```ts\n' + text + '\n```';
}
