import { MarkdownThemeContext } from '@plugin/theme/index.js';
import { CommentDisplayPart } from 'typedoc';

export function getShortDescription(
  this: MarkdownThemeContext,
  commentDisplayParts?: CommentDisplayPart[],
): string | null {
  if (commentDisplayParts) {
    return this.helpers
      .getCommentParts(commentDisplayParts)
      ?.split(/(\r?\n){2}/)[0]
      .replace(/\r?\n/g, ' ');
  }
  return null;
}
