// THIS FILE IS AUTO GENERATED. DO NOT EDIT DIRECTLY.
import { MarkdownPageEvent } from '@plugin/events/index.js';
import { MarkdownThemeContext } from '@plugin/theme/index.js';
import {
  ArrayType,
  Comment,
  CommentDisplayPart,
  ConditionalType,
  ContainerReflection,
  DeclarationHierarchy,
  DeclarationReflection,
  DocumentReflection,
  IndexedAccessType,
  InferredType,
  IntersectionType,
  IntrinsicType,
  LiteralType,
  NamedTupleMember,
  OptionalType,
  ParameterReflection,
  ProjectReflection,
  QueryType,
  ReferenceReflection,
  ReferenceType,
  Reflection,
  ReflectionCategory,
  ReflectionFlags,
  ReflectionGroup,
  ReflectionKind,
  ReflectionType,
  SignatureReflection,
  SomeType,
  TupleType,
  TypeOperatorType,
  TypeParameterReflection,
  UnionType,
  UnknownType,
} from 'typedoc';
import { templates, partials, helpers } from './index.js';

export const resourceTemplates = (context: MarkdownThemeContext) => {
  return {
    /**
     * Template that maps to a project document.
     */

    document: (page: MarkdownPageEvent<DocumentReflection>) =>
      templates.document.apply(context, [page]) as string,
    /**
     * Template that maps to the root project reflection. This will be the index page / documentation root page.
     */

    project: (page: MarkdownPageEvent<ProjectReflection>) =>
      templates.project.apply(context, [page]) as string,
    /**
     * Template that specifically maps to the resolved readme file. This template is not used when 'readme' is set to 'none'.
     */

    readme: (page: MarkdownPageEvent<ProjectReflection>) =>
      templates.readme.apply(context, [page]) as string,
    /**
     * Template that maps to individual reflection models.
     */

    reflection: (page: MarkdownPageEvent<DeclarationReflection>) =>
      templates.reflection.apply(context, [page]) as string,
  };
};

export const resourcePartials = (context: MarkdownThemeContext) => {
  return {
    comment: (
      model: Comment,
      options: {
        headingLevel?: number | undefined;
        showSummary?: boolean | undefined;
        showTags?: boolean | undefined;
        showReturns?: boolean | undefined;
        isTableColumn?: boolean | undefined;
      } = {},
    ) => partials.comment.apply(context, [model, options]) as string,
    body: (model: ContainerReflection, options: { headingLevel: number }) =>
      partials.body.apply(context, [model, options]) as string,
    categories: (
      models: ReflectionCategory[],
      options: { headingLevel: number },
    ) => partials.categories.apply(context, [models, options]) as string,
    groups: (
      model: ContainerReflection,
      options: { headingLevel: number; kind: ReflectionKind },
    ) => partials.groups.apply(context, [model, options]) as string,
    members: (
      model: DeclarationReflection[],
      options: { headingLevel: number; groupTitle?: string | undefined },
    ) => partials.members.apply(context, [model, options]) as string,
    accessor: (
      model: DeclarationReflection,
      options: { headingLevel: number },
    ) => partials.accessor.apply(context, [model, options]) as string,
    constructor: (
      model: DeclarationReflection,
      options: { headingLevel: number },
    ) => partials.constructor.apply(context, [model, options]) as string,
    memberContainer: (
      model: DeclarationReflection,
      options: {
        headingLevel: number;
        nested?: boolean | undefined;
        groupTitle?: string | undefined;
      },
    ) => partials.memberContainer.apply(context, [model, options]) as string,
    declaration: (
      model: DeclarationReflection,
      options: { headingLevel: number; nested?: boolean | undefined } = {
        headingLevel: 2,
        nested: false,
      },
    ) => partials.declaration.apply(context, [model, options]) as string,
    declarationTitle: (model: DeclarationReflection) =>
      partials.declarationTitle.apply(context, [model]) as string,
    documents: (
      model: ProjectReflection | DeclarationReflection | ContainerReflection,
      options: { headingLevel: number },
    ) => partials.documents.apply(context, [model, options]) as string,
    enumMembersTable: (model: DeclarationReflection[]) =>
      partials.enumMembersTable.apply(context, [model]) as string,
    groupIndex: (group: ReflectionCategory | ReflectionGroup) =>
      partials.groupIndex.apply(context, [group]) as string,
    hierarchy: (
      model: DeclarationHierarchy,
      options: { headingLevel: number },
    ) => partials.hierarchy.apply(context, [model, options]) as string,
    indexSignature: (model: SignatureReflection) =>
      partials.indexSignature.apply(context, [model]) as string,
    inheritance: (
      model: DeclarationReflection | SignatureReflection,
      options: { headingLevel: number },
    ) => partials.inheritance.apply(context, [model, options]) as string,
    memberTitle: (model: DeclarationReflection) =>
      partials.memberTitle.apply(context, [model]) as string,
    /**
     * Renders a top-level member that contains group and child members such as Classes, Interfaces and Enums.
     */

    memberWithGroups: (
      model: DeclarationReflection,
      options: { headingLevel: number },
    ) => partials.memberWithGroups.apply(context, [model, options]) as string,
    parametersList: (
      model: ParameterReflection[],
      options: { headingLevel: number },
    ) => partials.parametersList.apply(context, [model, options]) as string,
    parametersTable: (model: ParameterReflection[]) =>
      partials.parametersTable.apply(context, [model]) as string,
    /**
 * Renders a collection of properties in a table.

There is no association list partial for properties as these are handled as a standard list of members.
 */

    propertiesTable: (
      model: DeclarationReflection[],
      options?: { isEventProps: boolean } | undefined,
    ) => partials.propertiesTable.apply(context, [model, options]) as string,
    referenceMember: (model: ReferenceReflection) =>
      partials.referenceMember.apply(context, [model]) as string,
    signature: (
      model: SignatureReflection,
      options: {
        headingLevel: number;
        nested?: boolean | undefined;
        accessor?: string | undefined;
        multipleSignatures?: boolean | undefined;
      },
    ) => partials.signature.apply(context, [model, options]) as string,
    signatureParameters: (model: ParameterReflection[]) =>
      partials.signatureParameters.apply(context, [model]) as string,
    signatureReturns: (
      model: SignatureReflection,
      options: { headingLevel: number },
    ) => partials.signatureReturns.apply(context, [model, options]) as string,
    signatureTitle: (
      model: SignatureReflection,
      options?:
        | { accessor?: string | undefined; includeType?: boolean | undefined }
        | undefined,
    ) => partials.signatureTitle.apply(context, [model, options]) as string,
    signatures: (
      model: DeclarationReflection,
      options: { headingLevel: number; nested?: boolean | undefined },
    ) => partials.signatures.apply(context, [model, options]) as string,
    sources: (
      model: DeclarationReflection | SignatureReflection,
      options?: { hideLabel: boolean } | undefined,
    ) => partials.sources.apply(context, [model, options]) as string,
    member: (
      model: DeclarationReflection,
      options: { headingLevel: number; nested?: boolean | undefined },
    ) => partials.member.apply(context, [model, options]) as string,
    typeAndParent: (model: ArrayType | ReferenceType) =>
      partials.typeAndParent.apply(context, [model]) as string,
    typeArguments: (
      model: SomeType[],
      options?: { forceCollapse?: boolean | undefined } | undefined,
    ) => partials.typeArguments.apply(context, [model, options]) as string,
    typeDeclaration: (
      model: DeclarationReflection,
      options: { headingLevel: number; allowSource?: boolean | undefined },
    ) => partials.typeDeclaration.apply(context, [model, options]) as string,
    typeDeclarationContainer: (
      model: DeclarationReflection,
      typeDeclaration: DeclarationReflection,
      opts: { headingLevel: number; nested?: boolean | undefined },
    ) =>
      partials.typeDeclarationContainer.apply(context, [
        model,
        typeDeclaration,
        opts,
      ]) as string,
    typeDeclarationList: (
      model: DeclarationReflection[],
      options: { headingLevel: number },
    ) =>
      partials.typeDeclarationList.apply(context, [model, options]) as string,
    typeDeclarationTable: (
      model: DeclarationReflection[],
      options: { kind?: ReflectionKind | undefined },
    ) =>
      partials.typeDeclarationTable.apply(context, [model, options]) as string,
    typeParametersList: (model: TypeParameterReflection[]) =>
      partials.typeParametersList.apply(context, [model]) as string,
    typeParametersTable: (model: TypeParameterReflection[]) =>
      partials.typeParametersTable.apply(context, [model]) as string,
    breadcrumbs: () => partials.breadcrumbs.apply(context, []) as string,
    footer: () => partials.footer.apply(context, []) as string,
    header: () => partials.header.apply(context, []) as string,
    packagesIndex: (model: ProjectReflection) =>
      partials.packagesIndex.apply(context, [model]) as string,
    pageTitle: () => partials.pageTitle.apply(context, []) as string,
    arrayType: (model: ArrayType) =>
      partials.arrayType.apply(context, [model]) as string,
    conditionalType: (model: ConditionalType) =>
      partials.conditionalType.apply(context, [model]) as string,
    indexAccessType: (model: IndexedAccessType) =>
      partials.indexAccessType.apply(context, [model]) as string,
    inferredType: (model: InferredType) =>
      partials.inferredType.apply(context, [model]) as string,
    intersectionType: (model: IntersectionType) =>
      partials.intersectionType.apply(context, [model]) as string,
    intrinsicType: (model: IntrinsicType) =>
      partials.intrinsicType.apply(context, [model]) as string,
    literalType: (model: LiteralType) =>
      partials.literalType.apply(context, [model]) as string,
    namedTupleType: (model: NamedTupleMember) =>
      partials.namedTupleType.apply(context, [model]) as string,
    optionalType: (
      model: OptionalType,
      options?: { forceCollapse?: boolean | undefined } | undefined,
    ) => partials.optionalType.apply(context, [model, options]) as string,
    queryType: (model: QueryType) =>
      partials.queryType.apply(context, [model]) as string,
    referenceType: (model: ReferenceType) =>
      partials.referenceType.apply(context, [model]) as string,
    declarationType: (
      model: DeclarationReflection,
      options?: { forceCollapse?: boolean | undefined } | undefined,
    ) => partials.declarationType.apply(context, [model, options]) as string,
    functionType: (
      model: SignatureReflection[],
      options?: { forceParameterType: boolean } | undefined,
    ) => partials.functionType.apply(context, [model, options]) as string,
    reflectionType: (
      model: ReflectionType,
      options?: { forceCollapse?: boolean | undefined } | undefined,
    ) => partials.reflectionType.apply(context, [model, options]) as string,
    someType: (
      model?: SomeType | undefined,
      options?: { forceCollapse?: boolean | undefined } | undefined,
    ) => partials.someType.apply(context, [model, options]) as string,
    tupleType: (model: TupleType) =>
      partials.tupleType.apply(context, [model]) as string,
    typeOperatorType: (model: TypeOperatorType) =>
      partials.typeOperatorType.apply(context, [model]) as string,
    unionType: (model: UnionType) =>
      partials.unionType.apply(context, [model]) as string,
    unknownType: (model: UnknownType) =>
      partials.unknownType.apply(context, [model]) as string,
  };
};

export const resourceHelpers = (context: MarkdownThemeContext) => {
  return {
    getAngleBracket: (bracket: '>' | '<') =>
      helpers.getAngleBracket.apply(context, [bracket]) as string,
    getCommentParts: (model: CommentDisplayPart[]) =>
      helpers.getCommentParts.apply(context, [model]) as string,
    getDeclarationType: (model: DeclarationReflection) =>
      helpers.getDeclarationType.apply(context, [model]) as
        | SomeType
        | undefined,
    getDescriptionForComment: (comment: Comment) =>
      helpers.getDescriptionForComment.apply(context, [comment]) as
        | string
        | null,
    getFlattenedDeclarations: (
      model: DeclarationReflection[],
      options?: { includeSignatures: boolean } | undefined,
    ) =>
      helpers.getFlattenedDeclarations.apply(context, [
        model,
        options,
      ]) as DeclarationReflection[],
    getHierarchyType: (
      model: SomeType,
      options?: { isTarget: boolean } | undefined,
    ) => helpers.getHierarchyType.apply(context, [model, options]) as string,
    getKeyword: (model: ReflectionKind) =>
      helpers.getKeyword.apply(context, [model]) as string,
    getModifier: (model: DeclarationReflection) =>
      helpers.getModifier.apply(context, [model]) as string | null,
    getParameterDefaultValue: (model: ParameterReflection) =>
      helpers.getParameterDefaultValue.apply(context, [model]) as string,
    getProjectName: (
      stringWithPlaceholders: string,
      page: MarkdownPageEvent<Reflection>,
      includeVersion: boolean = true,
    ) =>
      helpers.getProjectName.apply(context, [
        stringWithPlaceholders,
        page,
        includeVersion,
      ]) as string,
    getPropertyDefaultValue: (model: DeclarationReflection) =>
      helpers.getPropertyDefaultValue.apply(context, [model]) as string | null,
    getReflectionFlags: (reflectionFlags: ReflectionFlags) =>
      helpers.getReflectionFlags.apply(context, [reflectionFlags]) as string,
    getReturnType: (model?: SomeType | undefined) =>
      helpers.getReturnType.apply(context, [model]) as string,
    hasUsefulTypeDetails: (type: SomeType) =>
      helpers.hasUsefulTypeDetails.apply(context, [type]) as boolean,
    isGroupKind: (model: DeclarationReflection | SignatureReflection) =>
      helpers.isGroupKind.apply(context, [model]) as boolean,
    useTableFormat: (
      key:
        | 'properties'
        | 'parameters'
        | 'enums'
        | 'typeDeclarations'
        | 'propertyMembers',
      reflectionKind?: ReflectionKind | undefined,
    ) =>
      helpers.useTableFormat.apply(context, [key, reflectionKind]) as boolean,
  };
};
