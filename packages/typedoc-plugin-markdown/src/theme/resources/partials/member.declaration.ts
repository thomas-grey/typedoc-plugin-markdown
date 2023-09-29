import {
  DeclarationReflection,
  IntersectionType,
  ReflectionType,
} from 'typedoc';
import { MarkdownThemeRenderContext } from '../..';
import { heading } from '../../../support/elements';

/**
 * @category Partials
 */
export function declarationMember(
  context: MarkdownThemeRenderContext,
  declaration: DeclarationReflection,
  headingLevel: number,
  nested = false,
) {
  const md: string[] = [];

  const typeDeclaration = (declaration.type as any)
    ?.declaration as DeclarationReflection;

  md.push(context.declarationMemberIdentifier(declaration));

  if (declaration.comment) {
    md.push(context.comment(declaration.comment, headingLevel));
  }

  if (declaration.type instanceof IntersectionType) {
    declaration.type?.types?.forEach((intersectionType) => {
      if (intersectionType instanceof ReflectionType) {
        md.push(heading(headingLevel, 'Type declaration'));
        md.push(
          context.typeDeclarationMember(
            intersectionType.declaration,
            headingLevel,
          ),
        );
      }
    });
  }

  if (declaration.typeParameters) {
    md.push(heading(headingLevel, 'Type parameters'));
    md.push(context.typeParametersTable(declaration.typeParameters));
  }

  if (typeDeclaration) {
    if (typeDeclaration?.indexSignature) {
      md.push(heading(headingLevel, `Index signature`));
      md.push(context.indexSignatureTitle(typeDeclaration.indexSignature));
    }

    if (
      typeDeclaration?.signatures?.length ||
      typeDeclaration?.children?.length
    ) {
      if (typeDeclaration?.signatures?.length) {
        typeDeclaration.signatures.forEach((signature) => {
          md.push(context.signatureMember(signature, headingLevel, true));
        });
      }
      if (!nested && typeDeclaration?.children?.length) {
        md.push(heading(headingLevel, 'Type declaration'));
        md.push(context.typeDeclarationMember(typeDeclaration, headingLevel));
      }
    }
  }

  md.push(context.inheritance(declaration, headingLevel));

  if (!nested && declaration.sources) {
    md.push(context.sources(declaration, headingLevel));
  }

  return md.join('\n\n');
}